const express = require('express');
const path = require('path');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { exec } = require('child_process');
const os = require('os');

const { db, debug, client } = require('../model/model');

// Bcrypt configuration
const SALT_ROUNDS = 10;

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Use environment variable  
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';

// Serve index.ejs as the main page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Xploria - Educational Platform',
        serverTime: new Date().toLocaleString(),
        // You can pass data to the template here
        // For example: user: req.user, data: someData
    });
});
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/forget', (req, res) => {
    res.render('forget');
});
// Page to set password after Google login
router.get('/googlevia', (req, res) => {
    res.render('googlevia');
});

router.get('/success', (req, res) => {
    res.render('succes_login');
});

// Block page after login
router.get('/block', (req, res) => {
    // Try namespaced first, then fallback to legacy path
    res.render('block/index', (err, html) => {
        if (!err) return res.send(html);
        return res.render('block/block');
    });
});

// Serial Monitor page
router.get('/serial-monitor', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'block', 'serial-monitor.html'));
});

// Open block editor by workspace id
router.get('/block/:id', (req, res) => {
    // Reuse same view; client-side will read :id and load
    res.render('block/index', (err, html) => {
        if (!err) return res.send(html);
        return res.render('block/block');
    });
});

// Edit Profile route
router.get('/edit-profile', (req, res) => {
    res.render('xploria/edit-profile');
});

// ===== Minimal APIs for sidebar sync =====
router.get('/api/me', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const sql = 'SELECT id_users, email, nama, picture, role FROM Users WHERE email = ?';
    db.query(sql, [email], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: rows[0] });
    });
});

router.get('/api/workspaces', (req, res) => {
    const { userId, q } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    let sql = 'SELECT id_workspace, judul, bloks, is_starred, created_at FROM Workspace WHERE id_users = ?';
    const params = [userId];
    if (q && q.trim()) { sql += ' AND judul LIKE ?'; params.push(`%${q}%`); }
    sql += ' ORDER BY created_at DESC';
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, workspaces: rows });
    });
});

// Create a new workspace for a user
router.post('/api/workspaces', (req, res) => {
    try {
        const { userId, judul, bloks } = req.body || {};
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
        const id = (crypto.randomUUID && crypto.randomUUID()) || ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16));
        const bloksStored = (bloks === null || typeof bloks === 'undefined') ? null : JSON.stringify(String(bloks));
        const sql = 'INSERT INTO Workspace (id_workspace, id_users, judul, bloks, is_starred) VALUES (?, ?, ?, ?, 0)';
        db.query(sql, [id, userId, judul || null, bloksStored], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            return res.json({ success: true, id_workspace: id });
        });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update an existing workspace (must belong to user)
router.put('/api/workspaces/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { userId, judul, bloks } = req.body || {};
        if (!id) return res.status(400).json({ success: false, message: 'id required' });
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
        const bloksStored = (bloks === null || typeof bloks === 'undefined') ? null : JSON.stringify(String(bloks));
        const sql = 'UPDATE Workspace SET judul = ?, bloks = ?, created_at = NOW() WHERE id_workspace = ? AND id_users = ?';
        db.query(sql, [judul || null, bloksStored, id, userId], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            return res.json({ success: true });
        });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Load a single workspace with bloks
router.get('/api/workspaces/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id required' });
    const sql = 'SELECT id_workspace, id_users, judul, bloks, is_starred, created_at FROM Workspace WHERE id_workspace = ?';
    db.query(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, workspace: rows[0] });
    });
});

// Toggle star for a workspace
router.post('/api/workspaces/:id/star', (req, res) => {
    const { id } = req.params;
    const { starred } = req.body;
    if (typeof starred === 'undefined') {
        return res.status(400).json({ success: false, message: 'starred required' });
    }
    const sql = 'UPDATE Workspace SET is_starred = ?, created_at = NOW() WHERE id_workspace = ?';
    db.query(sql, [starred ? 1 : 0, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        return res.json({ success: true });
    });
});

// Delete a workspace
router.delete('/api/workspaces/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Workspace WHERE id_workspace = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        return res.json({ success: true });
    });
});

// Forgot password: request reset link
router.post('/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const findUser = 'SELECT * FROM Users WHERE email = ?';
    db.query(findUser, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length === 0) {
            // Do not reveal that email does not exist
            return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 1000 * 60 * 30; // 30 minutes
        const saveToken = 'UPDATE Users SET reset_token = ?, reset_expires = ? WHERE email = ?';
        db.query(saveToken, [token, expires, email], (uErr) => {
            if (uErr) {
                console.error('Update error:', uErr);
                return res.status(500).json({ success: false, message: 'Failed to create reset token' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: SMTP_USER, pass: SMTP_PASS }
            });

            const resetUrl = `${APP_BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
            const html = `
                <div style="font-family:Inter,Arial,sans-serif;background:#0f172a;padding:24px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:600px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
                    <tr>
                      <td style="padding:24px 24px 0 24px;text-align:center;">
                        <img src="${APP_BASE_URL}/image_xploria/logo.png" alt="Xploria" width="56" height="56" style="display:block;margin:0 auto 12px;"/>
                        <h2 style="color:#fff;margin:0 0 8px;font-weight:700;">Reset Your Password</h2>
                        <p style="color:#9ca3af;margin:0 0 16px;">We received a request to reset your password. Click the button below to proceed. This link will expire in 30 minutes.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 24px 24px 24px;text-align:center;">
                        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">Reset Password</a>
                        <p style="color:#6b7280;margin:16px 0 0;word-break:break-all;">Or copy and paste this link into your browser:<br><span style="color:#9ca3af;">${resetUrl}</span></p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 24px;background:#0b1220;color:#6b7280;text-align:center;font-size:12px;">If you did not request a password reset, please ignore this email.</td>
                    </tr>
                  </table>
                </div>`;

            transporter.sendMail({
                from: `Xploria <${SMTP_USER}>`,
                to: email,
                subject: 'Xploria Password Reset',
                html
            }, (mailErr) => {
                if (mailErr) {
                    console.error('Email send error:', mailErr);
                    return res.status(500).json({ success: false, message: 'Failed to send email' });
                }
                res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
            });
        });
    });
});

// Render reset password page
router.get('/reset-password', (req, res) => {
    const { token, email } = req.query;
    if (!token || !email) {
        return res.status(400).send('Invalid password reset link');
    }
    res.render('reset_password', { token, email });
});

// Submit new password
router.post('/auth/reset-password', (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const findToken = 'SELECT * FROM Users WHERE email = ? AND reset_token = ?';
    db.query(findToken, [email, token], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
        const user = results[0];
        if (!user.reset_expires || Date.now() > Number(user.reset_expires)) {
            return res.status(400).json({ success: false, message: 'Token expired' });
        }

        bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Bcrypt hash error:', hashErr);
                return res.status(500).json({ success: false, message: 'Password hashing failed' });
            }

            const clearAndSet = 'UPDATE Users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id_users = ?';
            db.query(clearAndSet, [hashedPassword, user.id_users], (uErr2) => {
                if (uErr2) {
                    console.error('Update error:', uErr2);
                    return res.status(500).json({ success: false, message: 'Failed to update password' });
                }
                res.json({ success: true, message: 'Password updated successfully' });
            });
        });
    });
});

router.post('/logout', (req, res) => {
    // Clear any server-side session if needed
    // For now, we'll just return success since we're using localStorage
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Google OAuth route
router.post('/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ success: false, message: 'No credential provided' });
        }
        
        // Verify Google token
        const { client } = require('../model/model');
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;
        
        // Check if user exists in database
        const checkUserQuery = 'SELECT * FROM Users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }
            
            if (results.length > 0) {
                // User exists, update login info
                const updateQuery = 'UPDATE Users SET picture = ?, nama = ? WHERE email = ?';
                db.query(updateQuery, [picture, name, email], (updateErr) => {
                    if (updateErr) {
                        console.error('Update error:', updateErr);
                    }
                    
                    const existing = results[0];
                    const user = {
                        id: existing.id_users,
                        name: name,
                        email: email,
                        role: existing.role,
                        provider: 'google',
                        picture: picture
                    };
                    
                    res.json({
                        success: true,
                        user: user,
                        needsPasswordSet: existing.password == null
                    });
                });
            } else {
                // New user, insert into database
                const insertQuery = 'INSERT INTO Users (email, nama, picture, role) VALUES (?, ?, ?, ?)';
                db.query(insertQuery, [email, name, picture, 'user'], (insertErr, insertResults) => {
                    if (insertErr) {
                        console.error('Insert error:', insertErr);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Failed to create user' 
                        });
                    }
                    
                    const user = {
                        id: insertResults.insertId,
                        name: name,
                        email: email,
                        role: 'user',
                        provider: 'google',
                        picture: picture
                    };
                    
                    res.json({
                        success: true,
                        user: user,
                        needsPasswordSet: true
                    });
                });
            }
        });
        
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
});

// Manual login route
router.post('/auth/manual', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        // Check user in database (only by email first)
        const checkUserQuery = 'SELECT * FROM Users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }
            
            if (results.length > 0) {
                const user = results[0];
                
                if (user.password == null) {
                    return res.json({
                        success: false,
                        message: 'This account was created with Google. Please set a password first.',
                        needsPasswordSet: true,
                        email: user.email
                    });
                }

                // Compare password with bcrypt
                bcrypt.compare(password, user.password, (compareErr, isMatch) => {
                    if (compareErr) {
                        console.error('Bcrypt compare error:', compareErr);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Password comparison failed' 
                        });
                    }
                    
                    if (isMatch) {
                        const userData = {
                            id: user.id_users,
                            name: user.nama,
                            email: user.email,
                            role: user.role,
                            provider: 'manual',
                            picture: user.picture
                        };
                        
                        res.json({
                            success: true,
                            user: userData,
                            needsPassword: false
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Invalid credentials'
                        });
                    }
                });
            } else {
                res.json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        });
        
    } catch (error) {
        console.error('Manual auth error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
});

// Set password for existing user (e.g., after Google login)
router.post('/auth/set-password', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Ensure user exists
        const checkUserQuery = 'SELECT * FROM Users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Bcrypt hash error:', hashErr);
                    return res.status(500).json({ success: false, message: 'Password hashing failed' });
                }

                const updateQuery = 'UPDATE Users SET password = ? WHERE email = ?';
                db.query(updateQuery, [hashedPassword, email], (updateErr) => {
                    if (updateErr) {
                        console.error('Update error:', updateErr);
                        return res.status(500).json({ success: false, message: 'Failed to set password' });
                    }

                    const user = results[0];
                    const userData = {
                        id: user.id_users,
                        name: user.nama,
                        email: user.email,
                        role: user.role,
                        provider: 'manual',
                        picture: user.picture
                    };

                    return res.json({ success: true, message: 'Password set successfully', user: userData });
                });
            });
        });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ success: false, message: 'Failed to set password' });
    }
});

// Check if a user already has a password set
router.get('/auth/has-password', (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const checkUserQuery = 'SELECT password FROM Users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length === 0) {
            return res.json({ success: true, hasPassword: false });
        }
        const hasPassword = results[0].password != null;
        return res.json({ success: true, hasPassword });
    });
});

// Manual register route
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email and password are required' 
            });
        }
        
        // Check if user already exists
        const checkUserQuery = 'SELECT * FROM Users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }
            
            if (results.length > 0) {
                res.json({
                    success: false,
                    message: 'User already exists with this email'
                });
            } else {
                // Hash password with bcrypt
                bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
                    if (hashErr) {
                        console.error('Bcrypt hash error:', hashErr);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Password hashing failed' 
                        });
                    }
                    
                    // Insert new user with hashed password
                    const insertQuery = 'INSERT INTO Users (email, password, nama, role) VALUES (?, ?, ?, ?)';
                    db.query(insertQuery, [email, hashedPassword, name, 'user'], (insertErr, insertResults) => {
                        if (insertErr) {
                            console.error('Insert error:', insertErr);
                            return res.status(500).json({ 
                                success: false, 
                                message: 'Failed to create user' 
                            });
                        }
                        
                        const user = {
                            id: insertResults.insertId,
                            name: name,
                            email: email,
                            role: 'user',
                            provider: 'manual'
                        };
                        
                        res.json({
                            success: true,
                            user: user,
                            message: 'Registration successful'
                        });
                    });
                });
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
});

// Update Profile API
router.post('/api/profile/update', upload.single('profile_photo'), (req, res) => {
    try {
        const { name, email } = req.body;
        const profile_photo = req.file;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email required' 
            });
        }
        
        // Update user profile in database
        const updateFields = [];
        const updateValues = [];
        
        if (name) {
            updateFields.push('nama = ?');
            updateValues.push(name);
        }
        if (profile_photo) {
            const photoPath = `/uploads/${profile_photo.filename}`;
            updateFields.push('picture = ?');
            updateValues.push(photoPath);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No fields to update' 
            });
        }
        
        updateValues.push(email);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE email = ?`;
        
        db.query(updateQuery, updateValues, (err, result) => {
            if (err) {
                console.error('Profile update error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to update profile' 
                });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            res.json({
                success: true,
                message: 'Profile updated successfully',
                picture: profile_photo ? `/uploads/${profile_photo.filename}` : undefined
            });
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Profile update failed' 
        });
    }
});

// ===== Arduino Upload Routes =====

// Get available serial ports
router.get('/api/arduino/ports', async (req, res) => {
    try {
        const ports = await SerialPort.list();
        const portList = ports.map(port => ({
            path: port.path,
            manufacturer: port.manufacturer || 'Unknown',
            serialNumber: port.serialNumber || 'Unknown',
            pnpId: port.pnpId || 'Unknown',
            locationId: port.locationId || 'Unknown',
            vendorId: port.vendorId || 'Unknown',
            productId: port.productId || 'Unknown'
        }));
        
        res.json({ success: true, ports: portList });
    } catch (error) {
        console.error('Error listing ports:', error);
        res.status(500).json({ success: false, message: 'Failed to list serial ports' });
    }
});

// Upload Arduino code
router.post('/api/arduino/upload', (req, res) => {
    const { code, port, boardType } = req.body;
    
    if (!code || !port || !boardType) {
        return res.status(400).json({ 
            success: false, 
            message: 'Code, port, and board type are required' 
        });
    }

    // Create temporary directory for Arduino sketch
    const tempDir = path.join(os.tmpdir(), `arduino-upload-${Date.now()}`);
    const sketchFile = path.join(tempDir, 'sketch.ino');
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write Arduino code to file
    fs.writeFileSync(sketchFile, code);
    
    // Determine Arduino CLI command based on board type
    let arduinoCommand;
    if (boardType.startsWith('esp32:')) {
        // For ESP32, we'll use a simplified approach with esptool
        arduinoCommand = `arduino-cli compile --fqbn ${boardType} --output-dir ${tempDir}/build ${tempDir} && arduino-cli upload -p ${port} --fqbn ${boardType} ${tempDir}`;
    } else {
        // For regular Arduino boards
        arduinoCommand = `arduino-cli compile --fqbn ${boardType} --output-dir ${tempDir}/build ${tempDir} && arduino-cli upload -p ${port} --fqbn ${boardType} ${tempDir}`;
    }
    
    // Execute Arduino CLI command
    exec(arduinoCommand, { timeout: 120000 }, (error, stdout, stderr) => {
        // Clean up temp directory
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error('Error cleaning up temp directory:', cleanupError);
        }
        
        if (error) {
            console.error('Arduino upload error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Upload failed',
                output: stderr || error.message
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Upload successful',
            output: stdout
        });
    });
});

// Simulate Arduino upload with progress (for demo purposes)
router.get('/api/arduino/upload-simulate', (req, res) => {
    const { code, port, boardType } = req.query;
    
    if (!code || !port || !boardType) {
        return res.status(400).json({ 
            success: false, 
            message: 'Code, port, and board type are required' 
        });
    }

    // Simulate upload process with progress updates
    const uploadSimulation = () => {
        const steps = [
            { progress: 10, message: 'Compiling sketch...' },
            { progress: 25, message: 'Sketch uses 237385 bytes (18%) of program storage space. Maximum is 1310720 bytes.' },
            { progress: 30, message: 'Global variables use 21048 bytes (6%) of dynamic memory, leaving 306632 bytes for local variables. Maximum is 327680 bytes.' },
            { progress: 40, message: 'Flashing with command: esptool.exe --chip esp32 --port ' + port + ' --baud 921600...' },
            { progress: 50, message: 'esptool.py v4.5.1' },
            { progress: 55, message: 'Serial port ' + port },
            { progress: 60, message: 'Connecting.....' },
            { progress: 65, message: 'Chip is ESP32-D0WD-V3 (revision v3.1)' },
            { progress: 70, message: 'Features: WiFi, BT, Dual Core, 240MHz, VRef calibration in efuse, Coding Scheme None' },
            { progress: 75, message: 'Crystal is 40MHz' },
            { progress: 80, message: 'MAC: 88:13:bf:0d:7e:34' },
            { progress: 85, message: 'Uploading stub...' },
            { progress: 90, message: 'Running stub...' },
            { progress: 95, message: 'Writing at 0x00010000... (100%)' },
            { progress: 100, message: 'Upload completed successfully!' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                res.write(`data: ${JSON.stringify({
                    progress: step.progress,
                    message: step.message,
                    timestamp: new Date().toISOString()
                })}\n\n`);
                currentStep++;
            } else {
                clearInterval(interval);
                res.write(`data: ${JSON.stringify({
                    progress: 100,
                    message: 'Upload completed successfully!',
                    completed: true,
                    timestamp: new Date().toISOString()
                })}\n\n`);
                res.end();
            }
        }, 500);
    };

    // Set headers for Server-Sent Events
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Start simulation
    uploadSimulation();
});

module.exports = router;


