require('dotenv').config();
const mysql = require('mysql2');
const { OAuth2Client } = require('google-auth-library');

// ===================== DEBUG CONFIGURATION =====================
// Comment out or set enabled=false when not debugging
const DEBUG = {
    enabled: String(process.env.DEBUG_ENABLED || 'true').toLowerCase() === 'true',
    colors: {
        error: '\x1b[31m',
        warning: '\x1b[33m',
        success: '\x1b[32m',
        reset: '\x1b[0m'
    }
};

// Debug logging functions
const debug = {
    mysql: {
        error: (operation, error) => {
            if (!DEBUG.enabled) return;
            const errorMessage = error && error.message ? error.message : 'Unknown error';
            console.log(`${DEBUG.colors.error}[MySQL Error]${DEBUG.colors.reset} ${operation}: ${errorMessage}`);
            if (error && error.code) console.log(`${DEBUG.colors.warning}Code:${DEBUG.colors.reset} ${error.code}`);
        },
        success: (message) => {
            if (!DEBUG.enabled) return;
            console.log(`${DEBUG.colors.success}[MySQL]${DEBUG.colors.reset} ${message}`);
        },
        warning: (message) => {
            if (!DEBUG.enabled) return;
            console.log(`${DEBUG.colors.warning}[MySQL]${DEBUG.colors.reset} ${message}`);
        }
    },
    auth: {
        error: (message) => {
            if (!DEBUG.enabled) return;
            console.log(`${DEBUG.colors.error}[Auth Error]${DEBUG.colors.reset}: ${message}`);
        }
    }
};
// =============================================================

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'xploria'
});

// Connect to MySQL and ensure tables exist
db.connect((err) => {
    if (err) {
        debug.mysql.error('Connection failed', err);
        return;
    }
    debug.mysql.success('Connected to database');

    const createTableQuery = `
        -- Create requested schema if not exists
        CREATE TABLE IF NOT EXISTS Users (
            id_users INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255) DEFAULT NULL,
            nama VARCHAR(255) DEFAULT NULL,
            picture VARCHAR(512) DEFAULT NULL,
            role VARCHAR(50) DEFAULT 'user',
            reset_token VARCHAR(255) DEFAULT NULL,
            reset_expires BIGINT DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS Workspace  (
            id_workspace CHAR(36) PRIMARY KEY NOT NULL,
            id_users INT NOT NULL,
            judul VARCHAR(255) DEFAULT NULL,
            bloks JSON DEFAULT NULL,
            is_starred TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_workspace_users FOREIGN KEY (id_users) REFERENCES Users(id_users)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    `;

    // Execute table creation queries sequentially to satisfy FK dependencies
    const queries = createTableQuery
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0)
        .map(q => q + ';');

    const runSequentially = (index = 0) => {
        if (index >= queries.length) {
            return;
        }
        const query = queries[index];
        db.query(query, (qErr) => {
            if (qErr) {
                debug.mysql.error(`Table creation failed for query: \n\n${query.substring(0, 80)}...`, qErr);
            } else {
                debug.mysql.success(`Executed table creation step ${index + 1}/${queries.length}`);
            }
            runSequentially(index + 1);
        });
    };

    runSequentially(0);
});

// Add error handler for database connection
db.on('error', (err) => {
    debug.mysql.error('Connection error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        debug.mysql.warning('Attempting to reconnect...');
        db.connect();
    } else {
        throw err;
    }
});

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

module.exports = { db, debug, client };