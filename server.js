require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views', 'xploria'),
  path.join(__dirname, 'views')
]);

// Middleware
app.use(express.json());
app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
// Aliases for *_xploria paths
app.use('/css_xploria', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js_xploria', express.static(path.join(__dirname, 'public', 'js')));
app.use('/image_xploria', express.static(path.join(__dirname, 'public', 'image')));
// Uploads directory for profile photos
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
const router = require('./routes/route');
app.use('/', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("===============================");
    console.log(`Server running on port ${PORT}`);
    console.log(`🚀 Berjalan di http://localhost:${PORT}`);
    console.log("===============================");
}); 


