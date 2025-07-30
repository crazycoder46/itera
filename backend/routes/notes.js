const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { upload: imageUpload, cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// UTC bazlı tarih hesaplama fonksiyonu
function getTodayWithOffset(offsetMinutes) {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const userDate = new Date(utc + (offsetMinutes * 60000));
  userDate.setHours(0, 0, 0, 0);
  return userDate;
}

function getTodayStringFromRequest(req, userTimezoneOffset) {
  // Öncelik: userLocalDate parametresi (body veya query)
  const userLocalDate = req.body?.userLocalDate || req.query?.userLocalDate;
  if (userLocalDate) return userLocalDate;
  // Eski algoritma (UTC+offset)
  const todayDate = getTodayWithOffset(userTimezoneOffset);
  return todayDate.toISOString().split('T')[0];
}

// Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    const { box_type } = req.query;
    
    let query = 'SELECT * FROM notes WHERE user_id = $1';
    let params = [req.userId];
    
    if (box_type) {
      query += ' AND box_type = $2';
      params.push(box_type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const notes = await pool.query(query, params);
    
    res.json({
      success: true,
      notes: notes.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, box_type } = req.body;
    
    // Debug logs disabled for production
    
    const newNote = await pool.query(
      'INSERT INTO notes (user_id, title, content, box_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, title, content, box_type || 'daily']
    );
    
    // İçerikteki resimleri bul ve note_images tablosunu güncelle
    const imgRegex = /src="([^"]*\/uploads\/note-images\/[^"]*)"[^>]*>/g;
    const imageUrls = [];
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const fullUrl = match[1];
      const urlPath = fullUrl.replace(/^https?:\/\/[^\/]+/, '');
      imageUrls.push(urlPath);
    }
    
    // Bu notla ilişkili resimleri güncelle
    if (imageUrls.length > 0) {
      for (const imageUrl of imageUrls) {
        await pool.query(
          'UPDATE note_images SET note_id = $1 WHERE image_url = $2 AND note_id IS NULL',
          [newNote.rows[0].id, imageUrl]
        );
      }
    }
    
    res.status(201).json({
      success: true,
      note: newNote.rows[0]
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, box_type } = req.body;
    const { id } = req.params;
    
    // Debug logs disabled for production
    
    const updatedNote = await pool.query(
      'UPDATE notes SET title = $1, content = $2, box_type = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, content, box_type, id, req.userId]
    );
    
    if (updatedNote.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Not bulunamadı' 
      });
    }

    // İçerikteki resimleri bul ve note_images tablosunu güncelle
    const imgRegex = /src="([^"]*\/uploads\/note-images\/[^"]*)"[^>]*>/g;
    const imageUrls = [];
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const fullUrl = match[1];
      const urlPath = fullUrl.replace(/^https?:\/\/[^\/]+/, '');
      imageUrls.push(urlPath);
    }
    
    // Bu notla ilişkili resimleri güncelle
    if (imageUrls.length > 0) {
      for (const imageUrl of imageUrls) {
        await pool.query(
          'UPDATE note_images SET note_id = $1 WHERE image_url = $2 AND (note_id IS NULL OR note_id != $1)',
          [id, imageUrl]
        );
      }
    }
    
    res.json({
      success: true,
      note: updatedNote.rows[0]
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // İlişkili resimleri bul
    const images = await pool.query(
      'SELECT image_url FROM note_images WHERE note_id = $1',
      [id]
    );
    
    // Cloudinary'den resimleri sil
    for (const image of images.rows) {
      try {
        // URL'den public ID'yi çıkar
        const urlParts = image.image_url.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        
        // Cloudinary'den sil
        await cloudinary.uploader.destroy(publicId);
        console.log('Deleted from Cloudinary:', publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    // Veritabanından resim kayıtlarını sil
    await pool.query(
      'DELETE FROM note_images WHERE note_id = $1',
      [id]
    );
    
    const deletedNote = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (deletedNote.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Not bulunamadı' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Not ve ilişkili resimler silindi' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Update review status (Leitner system)
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { remembered } = req.body; // true or false
    
    // Get current note
    const note = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (note.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Not bulunamadı' 
      });
    }
    
    let newBoxType = note.rows[0].box_type;
    let nextReviewDate = new Date();
    
    if (remembered) {
      // Move to next box
      switch (note.rows[0].box_type) {
        case 'daily':
          newBoxType = 'every_2_days';
          nextReviewDate.setDate(nextReviewDate.getDate() + 2);
          break;
        case 'every_2_days':
          newBoxType = 'every_4_days';
          nextReviewDate.setDate(nextReviewDate.getDate() + 4);
          break;
        case 'every_4_days':
          newBoxType = 'weekly';
          nextReviewDate.setDate(nextReviewDate.getDate() + 7);
          break;
        case 'weekly':
          newBoxType = 'every_2_weeks';
          nextReviewDate.setDate(nextReviewDate.getDate() + 14);
          break;
        case 'every_2_weeks':
          newBoxType = 'learned';
          nextReviewDate = null;
          break;
        default:
          break;
      }
    } else {
      // Stay in current box, set next review for tomorrow
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);
    }
    
    const updatedNote = await pool.query(
      'UPDATE notes SET box_type = $1, last_reviewed = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [newBoxType, id, req.userId]
    );
    
    res.json({
      success: true,
      note: updatedNote.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Get today's review notes
router.get('/review', auth, async (req, res) => {
  try {
    // Kullanıcı bilgilerini al
    const userInfo = await pool.query(
      'SELECT created_at, timezone_offset FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userInfo.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    const userCreatedAt = new Date(userInfo.rows[0].created_at);
    const userTimezoneOffset = userInfo.rows[0].timezone_offset || 180; // Default GMT+3
    
    // Kullanıcının yerel zamanını kullan
    const todayDate = getTodayWithOffset(userTimezoneOffset);
    const today = getTodayStringFromRequest(req, userTimezoneOffset);
    
    // Takvim sekmesiyle aynı algoritma kullan
    const shouldBoxOpenToday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const todayDate2 = getTodayWithOffset(userTimezoneOffset);
      const todayStr = todayDate2.toISOString().split('T')[0];
      
      switch(boxType) {
        case 'daily':
          return true; // Her gün açılır
          
        case 'every_2_days':
        case 'every_4_days':
        case 'weekly':
        case 'every_2_weeks':
          // Takvim sekmesiyle aynı mantık
          let interval, startOffset;
          
          switch(boxType) {
            case 'every_2_days':
              interval = 2;
              startOffset = 2;
              break;
            case 'every_4_days':
              interval = 4;
              startOffset = 4;
              break;
            case 'weekly':
              interval = 7;
              startOffset = 7;
              break;
            case 'every_2_weeks':
              interval = 14;
              startOffset = 14;
              break;
            default:
              return false;
          }
          
          // İlk pattern tarihi
          const firstPatternDate = new Date(created);
          firstPatternDate.setDate(firstPatternDate.getDate() + startOffset);
          
          // Bugün pattern tarihlerinden biri mi kontrol et
          let currentDate = new Date(firstPatternDate);
          while (currentDate <= todayDate) {
            if (currentDate.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            currentDate.setDate(currentDate.getDate() + interval);
          }
          return false;
          
        default:
          return false;
      }
    };
    
    // Tüm notları al (learned hariç)
    const allNotes = await pool.query(
      `SELECT * FROM notes 
       WHERE user_id = $1 
       AND box_type != 'learned'
       ORDER BY created_at ASC`,
      [req.userId]
    );
    
    // Bugün açılması gereken kasaları belirle
    const boxesToOpen = ['daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks'].filter(boxType => 
      shouldBoxOpenToday(userCreatedAt, boxType)
    );
    
    // Sadece açılması gereken kasalardaki notları al
    const reviewNotes = allNotes.rows.filter(note => {
      return boxesToOpen.includes(note.box_type);
    });
    
    res.json({
      success: true,
      notes: reviewNotes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Get today's review count
router.get('/today-review-count', auth, async (req, res) => {
  try {
    // Kullanıcı bilgilerini al
    const userInfo = await pool.query(
      'SELECT created_at, timezone_offset FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userInfo.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    const userCreatedAt = new Date(userInfo.rows[0].created_at);
    const userTimezoneOffset = userInfo.rows[0].timezone_offset || 180;
    
    // Kullanıcının yerel zamanını kullan
    const todayDate = getTodayWithOffset(userTimezoneOffset);
    const today = getTodayStringFromRequest(req, userTimezoneOffset);
    
    // Takvim sekmesiyle aynı algoritma kullan
    const shouldBoxOpenToday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const todayDate2 = getTodayWithOffset(userTimezoneOffset);
      const todayStr = todayDate2.toISOString().split('T')[0];
      
      switch(boxType) {
        case 'daily':
          return true; // Her gün açılır
          
        case 'every_2_days':
        case 'every_4_days':
        case 'weekly':
        case 'every_2_weeks':
          // Takvim sekmesiyle aynı mantık
          let interval, startOffset;
          
          switch(boxType) {
            case 'every_2_days':
              interval = 2;
              startOffset = 2;
              break;
            case 'every_4_days':
              interval = 4;
              startOffset = 4;
              break;
            case 'weekly':
              interval = 7;
              startOffset = 7;
              break;
            case 'every_2_weeks':
              interval = 14;
              startOffset = 14;
              break;
            default:
              return false;
          }
          
          // İlk pattern tarihi
          const firstPatternDate = new Date(created);
          firstPatternDate.setDate(firstPatternDate.getDate() + startOffset);
          
          // Bugün pattern tarihlerinden biri mi kontrol et
          let currentDate = new Date(firstPatternDate);
          while (currentDate <= todayDate) {
            if (currentDate.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            currentDate.setDate(currentDate.getDate() + interval);
          }
          return false;
          
        default:
          return false;
      }
    };
    
    // Tüm notları al (learned hariç)
    const allNotes = await pool.query(
      `SELECT * FROM notes 
       WHERE user_id = $1 
       AND box_type != 'learned'
       ORDER BY created_at ASC`,
      [req.userId]
    );
    
    // Bugün açılması gereken kasaları belirle
    const boxesToOpen = ['daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks'].filter(boxType => 
      shouldBoxOpenToday(userCreatedAt, boxType)
    );
    
    // Sadece açılması gereken kasalardaki notları al
    const reviewNotes = allNotes.rows.filter(note => {
      return boxesToOpen.includes(note.box_type);
    });
    
    res.json({
      success: true,
      count: reviewNotes.length
    });
  } catch (error) {
    console.error('Today review count error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Günlük tekrar sayısı alınırken hata oluştu' 
    });
  }
});

// Get calendar data
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.userId;
    
    // Kullanıcının kayıt tarihini al
    const userResult = await pool.query(
      'SELECT created_at, timezone_offset FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    const userCreatedAt = new Date(userResult.rows[0].created_at);
    const userTimezoneOffset = userResult.rows[0].timezone_offset || 180;
    
    // Takvim görünümünde gösterilen tüm günler için tarih aralığı
    // Ayın ilk gününün haftanın hangi günü olduğunu bul
    const firstDayOfMonth = new Date(year, month - 1, 1);
    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // Pazartesi = 0
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    
    // Takvim görünümünün başlangıç tarihi (önceki aydan)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    
    // Takvim görünümünün bitiş tarihi (6 hafta = 42 gün)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 42 gün toplam
    
    // Pattern hesaplama - kullanıcı kayıt tarihine göre
    const generatePatternDates = (createdAt, boxType, startDate, endDate) => {
      const dates = [];
      const created = new Date(createdAt);
      let interval, startOffset;
      
      switch(boxType) {
        case 'every_2_days':
          interval = 2;
          startOffset = 2;
          break;
        case 'every_4_days':
          interval = 4;
          startOffset = 4;
          break;
        case 'weekly':
          interval = 7;
          startOffset = 7;
          break;
        case 'every_2_weeks':
          interval = 14;
          startOffset = 14;
          break;
        default:
          return dates;
      }
      
      // İlk pattern tarihi
      const firstPatternDate = new Date(created);
      firstPatternDate.setDate(firstPatternDate.getDate() + startOffset);
      
      // Pattern tarihlerini oluştur
      let currentDate = new Date(firstPatternDate);
      while (currentDate <= endDate) {
        if (currentDate >= startDate) {
          dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + interval);
      }
      
      return dates;
    };

    // Her box type için pattern tarihlerini oluştur
    const patternNotes = [];
    const boxTypes = ['every_2_days', 'every_4_days', 'weekly', 'every_2_weeks'];
    
    boxTypes.forEach(boxType => {
      const patternDates = generatePatternDates(userCreatedAt, boxType, startDate, endDate);
      patternDates.forEach(date => {
        patternNotes.push({
          box_type: boxType,
          review_date: date.toISOString().split('T')[0],
          is_pattern: true
        });
      });
    });

    // Gerçek notları al - artık takvimde gerçek notları göstermiyoruz, sadece pattern
    const notesResult = await pool.query(
      `SELECT *, box_type 
       FROM notes 
       WHERE user_id = $1 
       AND box_type != 'learned'
       ORDER BY created_at`,
      [userId]
    );
    
    // Sadece pattern notları kullan (gerçek notları takvimde göstermiyoruz)
    const allNotes = [...patternNotes];
    
    // Tamamlanan günlük tekrarları al
    let completedDays = [];
    const tableExists = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reviews')"
    );
    
    if (tableExists.rows[0].exists) {
      const completedResult = await pool.query(
        `SELECT review_date 
         FROM daily_reviews 
         WHERE user_id = $1 
         AND review_date >= $2 
         AND review_date <= $3`,
        [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );
      completedDays = completedResult.rows.map(row => row.review_date);
    }
    
    // Calendar data prepared successfully
    
    res.json({
      success: true,
      userCreatedAt: userCreatedAt.toISOString().split('T')[0],
      userTimezoneOffset: userTimezoneOffset,
      notes: allNotes,
      completedDays,
      month: parseInt(month),
      year: parseInt(year)
    });
    
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Takvim verileri alınırken hata oluştu' 
    });
  }
});

// Günlük tekrarı tamamla endpoint'i
router.post('/complete-daily-review', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Kullanıcının timezone'unu al
    const userResult = await pool.query(
      'SELECT timezone_offset FROM users WHERE id = $1',
      [userId]
    );
    const userTimezoneOffset = userResult.rows[0]?.timezone_offset || 180;
    
    // Kullanıcının yerel zamanını kullan - Doğru timezone hesaplama
    const todayDate = getTodayWithOffset(userTimezoneOffset);
    const today = todayDate.toISOString().split('T')[0];

    // Tablo var mı kontrol et
    const tableExists = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reviews')"
    );

    if (!tableExists.rows[0].exists) {
      // Tablo yoksa oluştur
      await pool.query(`
        CREATE TABLE daily_reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          review_date DATE NOT NULL,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, review_date)
        )
      `);
      
      await pool.query(
        'CREATE INDEX idx_daily_reviews_user_date ON daily_reviews(user_id, review_date)'
      );
    }

    // Bugün için tekrar kaydı oluştur (duplicate ignore)
    await pool.query(
      'INSERT INTO daily_reviews (user_id, review_date) VALUES ($1, $2) ON CONFLICT (user_id, review_date) DO NOTHING',
      [userId, today]
    );

    res.json({
      success: true,
      message: 'Günlük tekrar tamamlandı!'
    });

  } catch (error) {
    console.error('Complete daily review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Günlük tekrar tamamlama hatası' 
    });
  }
});

// Günlük tekrar durumunu kontrol et
router.get('/daily-review-status', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Kullanıcının timezone'unu al
    const userResult = await pool.query(
      'SELECT timezone_offset FROM users WHERE id = $1',
      [userId]
    );
    const userTimezoneOffset = userResult.rows[0]?.timezone_offset || 180;
    
    // Kullanıcının yerel zamanını kullan - Doğru timezone hesaplama
    const todayDate = getTodayWithOffset(userTimezoneOffset);
    const today = getTodayStringFromRequest(req, userTimezoneOffset);

    // Tablo var mı kontrol et
    const tableExists = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_reviews')"
    );

    if (!tableExists.rows[0].exists) {
      // Tablo yoksa false döndür
      return res.json({
        success: true,
        isCompleted: false,
        date: today
      });
    }

    // Bugün tekrar tamamlanmış mı kontrol et
    const reviewResult = await pool.query(
      'SELECT * FROM daily_reviews WHERE user_id = $1 AND review_date = $2',
      [userId, today]
    );

    const isCompleted = reviewResult.rows.length > 0;

    res.json({
      success: true,
      isCompleted,
      date: today
    });

  } catch (error) {
    console.error('Daily review status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Günlük tekrar durumu kontrol hatası' 
    });
  }
});

// Get images for a note
router.get('/:id/images', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Notun kullanıcıya ait olduğunu kontrol et
    const note = await pool.query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (note.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Not bulunamadı' 
      });
    }
    
    // Nota ait resimleri getir
    const images = await pool.query(
      'SELECT * FROM note_images WHERE note_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    res.json({
      success: true,
      images: images.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Get single note by ID (en sonda olmalı)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // ID'nin sayı olduğunu kontrol et
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false,
        message: 'Geçersiz not ID' 
      });
    }
    
    const note = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [parseInt(id), req.userId]
    );
    
    if (note.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Not bulunamadı' 
      });
    }
    
    res.json({
      success: true,
      note: note.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
    });
  }
});

// Cloudinary cleanup endpoint'i (manuel kullanım için)
router.delete('/cleanup-unused-images', auth, async (req, res) => {
  try {
    // 1 saatten eski ve note_id'si NULL olan resimleri bul
    const unusedImages = await pool.query(
      `SELECT * FROM note_images 
       WHERE note_id IS NULL 
       AND created_at < NOW() - INTERVAL '1 hour'`
    );
    
    console.log(`Found ${unusedImages.rows.length} unused images to clean up`);
    
    // Cloudinary'den resimleri sil
    for (const image of unusedImages.rows) {
      try {
        // URL'den public ID'yi çıkar
        const urlParts = image.image_url.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        
        // Cloudinary'den sil
        await cloudinary.uploader.destroy(publicId);
        console.log('Deleted from Cloudinary:', publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    // Veritabanından kayıtları sil
    const deleteResult = await pool.query(
      `DELETE FROM note_images 
       WHERE note_id IS NULL 
       AND created_at < NOW() - INTERVAL '1 hour'`
    );
    
    res.json({
      success: true,
      message: `${deleteResult.rowCount} kullanılmayan resim Cloudinary'den temizlendi`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Temizlik sırasında hata oluştu' 
    });
  }
});

// Resim yükleme endpoint'i (Cloudinary)
router.post('/upload-image', auth, (req, res) => {
  imageUpload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yükleme hatası: ' + err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Resim dosyası bulunamadı'
        });
      }

      // Cloudinary'den gelen URL'i kullan
      const imageUrl = req.file.path; // Cloudinary URL'i
      const publicId = req.file.filename; // Cloudinary public ID

      // noteId varsa kullan, yoksa NULL
      const noteId = req.body.noteId ? parseInt(req.body.noteId) : null;

      // note_images tablosuna kaydet
      const imageRecord = await pool.query(
        'INSERT INTO note_images (note_id, image_url, original_name, file_size, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [noteId, imageUrl, req.file.originalname, req.file.size, req.file.mimetype]
      );

      res.json({
        success: true,
        imageUrl,
        imageId: imageRecord.rows[0].id,
        publicId: publicId,
        message: 'Fotoğraf başarıyla yüklendi'
      });
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Resim yüklenirken hata oluştu'
      });
    }
  });
});

module.exports = router; 