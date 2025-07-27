const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'de3afcuww',
  api_key: process.env.CLOUDINARY_API_KEY || '291565977559952',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LVrKYpIFEu_Ke55mUuscAkub2oA'
});

// Cloudinary storage konfigürasyonu - Not resimleri için
const notesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itera-notes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Cloudinary storage konfigürasyonu - Profil resimleri için
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itera-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto' }
    ]
  }
});

// Multer konfigürasyonu - Not resimleri için
const upload = multer({ 
  storage: notesStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sadece resim dosyalarına izin ver
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  }
});

// Multer konfigürasyonu - Profil resimleri için
const profileUpload = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sadece resim dosyalarına izin ver
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  upload,
  profileUpload
}; 