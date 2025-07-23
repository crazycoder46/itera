const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer configuration for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, timezoneOffset } = req.body;

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Kullanıcı zaten mevcut' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, timezone_offset) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, is_premium',
      [firstName, lastName, email, hashedPassword, timezoneOffset || 180]
    );

    // Create token
    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET || 'itera_jwt_secret_key_2024', { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server hatası' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // Create token
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET || 'itera_jwt_secret_key_2024', { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
        email: user.rows[0].email,
        is_premium: user.rows[0].is_premium || false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server hatası' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, profile_picture, created_at, is_premium FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({
      success: false,
      message: 'Server hatası'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body;
    let updateQuery = 'UPDATE users SET ';
    let updateValues = [];
    let valueIndex = 1;

    const updates = [];
    
    if (first_name !== undefined) {
      updates.push(`first_name = $${valueIndex}`);
      updateValues.push(first_name);
      valueIndex++;
    }
    
    if (last_name !== undefined) {
      updates.push(`last_name = $${valueIndex}`);
      updateValues.push(last_name);
      valueIndex++;
    }
    
    if (password !== undefined && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${valueIndex}`);
      updateValues.push(hashedPassword);
      valueIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Güncellenecek alan bulunamadı'
      });
    }

    updateQuery += updates.join(', ');
    updateQuery += ` WHERE id = $${valueIndex} RETURNING id, first_name, last_name, email, profile_picture, created_at, is_premium`;
    updateValues.push(req.userId);

    const result = await pool.query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu'
    });
  }
});

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profil fotoğrafı seçilmedi'
      });
    }

    const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user's profile picture in database
    const result = await pool.query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, profile_picture, created_at, is_premium',
      [profilePicturePath, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Profil fotoğrafı başarıyla yüklendi',
      user: result.rows[0],
      profilePicture: profilePicturePath
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil fotoğrafı yüklenirken hata oluştu'
    });
  }
});

// Delete profile picture
router.delete('/profile/picture', auth, async (req, res) => {
  try {
    // Get current profile picture
    const userResult = await pool.query(
      'SELECT profile_picture FROM users WHERE id = $1',
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const currentPicture = userResult.rows[0].profile_picture;

    // Delete file from filesystem if exists
    if (currentPicture) {
      const filePath = path.join(__dirname, '..', currentPicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update database
    const result = await pool.query(
              'UPDATE users SET profile_picture = NULL WHERE id = $1 RETURNING id, first_name, last_name, email, profile_picture, created_at, is_premium',
      [req.userId]
    );

    res.json({
      success: true,
      message: 'Profil fotoğrafı başarıyla silindi',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile picture delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil fotoğrafı silinirken hata oluştu'
    });
  }
});

module.exports = router; 