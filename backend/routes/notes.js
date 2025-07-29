const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { upload: imageUpload, cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const router = express.Router();

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
    const today = new Date();
    today.setMinutes(today.getMinutes() + userTimezoneOffset);
    today.setHours(today.getHours(), 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Kasa açılma günlerini kontrol et - takvim mantığıyla aynı
    const shouldBoxOpenToday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const today = new Date();
      
      // Kullanıcının zaman dilimini kullan
      const userTimezoneOffset = userInfo.rows[0].timezone_offset || 180; // Default GMT+3
      today.setMinutes(today.getMinutes() + userTimezoneOffset);
      today.setHours(today.getHours(), 0, 0, 0);
      
      const todayStr = today.toISOString().split('T')[0];
      
      // Kullanıcının kayıt tarihinden bugüne kadar geçen gün sayısını hesapla
      const daysSinceRegistration = Math.floor((today - created) / (1000 * 60 * 60 * 24));
      
      console.log(`📊 Kullanıcı kayıt tarihi: ${created.toISOString().split('T')[0]}`);
      console.log(`📊 Bugün (kullanıcı zamanı): ${todayStr}`);
      console.log(`📊 Kayıt tarihinden bu yana geçen gün: ${daysSinceRegistration}`);
      
      switch(boxType) {
        case 'daily':
          return true; // Her gün açılır
          
        case 'every_2_days':
          // Kayıt tarihinden 2 gün sonra başlayıp 2'şer gün arayla
          const firstOpen2 = 2; // 2. günde başlar
          const shouldOpen2 = daysSinceRegistration >= firstOpen2 && (daysSinceRegistration - firstOpen2) % 2 === 0;
          console.log(`📦 every_2_days: ${shouldOpen2} (${daysSinceRegistration} gün)`);
          return shouldOpen2;
          
        case 'every_4_days':
          // Kayıt tarihinden 4 gün sonra başlayıp 4'er gün arayla
          const firstOpen4 = 4; // 4. günde başlar
          const shouldOpen4 = daysSinceRegistration >= firstOpen4 && (daysSinceRegistration - firstOpen4) % 4 === 0;
          console.log(`📦 every_4_days: ${shouldOpen4} (${daysSinceRegistration} gün)`);
          return shouldOpen4;
          
        case 'weekly':
          // Kayıt tarihinden 7 gün sonra başlayıp 7'şer gün arayla
          const firstOpen7 = 7; // 7. günde başlar
          const shouldOpen7 = daysSinceRegistration >= firstOpen7 && (daysSinceRegistration - firstOpen7) % 7 === 0;
          console.log(`📦 weekly: ${shouldOpen7} (${daysSinceRegistration} gün)`);
          return shouldOpen7;
          
        case 'every_2_weeks':
          // Kayıt tarihinden 14 gün sonra başlayıp 14'er gün arayla
          const firstOpen14 = 14; // 14. günde başlar
          const shouldOpen14 = daysSinceRegistration >= firstOpen14 && (daysSinceRegistration - firstOpen14) % 14 === 0;
          console.log(`📦 every_2_weeks: ${shouldOpen14} (${daysSinceRegistration} gün)`);
          return shouldOpen14;
          
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
    console.log('🔍 Today review count endpoint çağrıldı');
    
    // Kullanıcı bilgilerini al
    const userInfo = await pool.query(
      'SELECT created_at, timezone_offset FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userInfo.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı');
      return res.status(404).json({ 
        success: false,
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    const userCreatedAt = new Date(userInfo.rows[0].created_at);
    const userTimezoneOffset = userInfo.rows[0].timezone_offset || 180; // Default GMT+3
    
    console.log(`👤 Kullanıcı kayıt tarihi: ${userCreatedAt.toISOString()}`);
    
    // Kullanıcının yerel zamanını kullan
    const today = new Date();
    today.setMinutes(today.getMinutes() + userTimezoneOffset);
    today.setHours(today.getHours(), 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`📅 Bugün (kullanıcı zamanı): ${todayStr}`);
    
    // Kasa açılma günlerini kontrol et - sadece kullanıcı kayıt tarihine göre
    const shouldBoxOpenToday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const todayStr = today.toISOString().split('T')[0];
      
      switch(boxType) {
        case 'daily':
          return true; // Her gün açılır
          
        case 'every_2_days':
          // Kullanıcı kayıt tarihinden 2 gün sonra başlayıp 2'şer gün arayla
          const firstOpen2 = new Date(created);
          firstOpen2.setDate(firstOpen2.getDate() + 2);
          
          let current2 = new Date(firstOpen2);
          while (current2.toISOString().split('T')[0] <= todayStr) {
            if (current2.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current2.setDate(current2.getDate() + 2);
          }
          return false;
          
        case 'every_4_days':
          // Kullanıcı kayıt tarihinden 4 gün sonra başlayıp 4'er gün arayla
          const firstOpen4 = new Date(created);
          firstOpen4.setDate(firstOpen4.getDate() + 4);
          
          let current4 = new Date(firstOpen4);
          while (current4.toISOString().split('T')[0] <= todayStr) {
            if (current4.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current4.setDate(current4.getDate() + 4);
          }
          return false;
          
        case 'weekly':
          // Kullanıcı kayıt tarihinden 7 gün sonra başlayıp 7'şer gün arayla
          const firstOpen7 = new Date(created);
          firstOpen7.setDate(firstOpen7.getDate() + 7);
          
          let current7 = new Date(firstOpen7);
          while (current7.toISOString().split('T')[0] <= todayStr) {
            if (current7.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current7.setDate(current7.getDate() + 7);
          }
          return false;
          
        case 'every_2_weeks':
          // Kullanıcı kayıt tarihinden 14 gün sonra başlayıp 14'er gün arayla
          const firstOpen14 = new Date(created);
          firstOpen14.setDate(firstOpen14.getDate() + 14);
          
          let current14 = new Date(firstOpen14);
          while (current14.toISOString().split('T')[0] <= todayStr) {
            if (current14.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current14.setDate(current14.getDate() + 14);
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
    
    console.log(`📝 Toplam not sayısı: ${allNotes.rows.length}`);
    
    // Bugün açılması gereken kasaları belirle
    const boxesToOpen = ['daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks'].filter(boxType => 
      shouldBoxOpenToday(userCreatedAt, boxType)
    );
    
    console.log(`📦 Bugün açılması gereken kutular: ${boxesToOpen.join(', ')}`);
    
    // Sadece açılması gereken kasalardaki notları al
    const reviewNotes = allNotes.rows.filter(note => {
      return boxesToOpen.includes(note.box_type);
    });
    
    console.log(`🎯 Tekrar edilecek not sayısı: ${reviewNotes.length}`);
    reviewNotes.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note.title} (${note.box_type})`);
    });
    
    res.json({
      success: true,
      count: reviewNotes.length
    });
  } catch (error) {
    console.error('❌ Today review count hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server hatası' 
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
    
    // Kullanıcının yerel zamanını kullan
    const todayDate = new Date();
    todayDate.setMinutes(todayDate.getMinutes() + userTimezoneOffset);
    todayDate.setHours(todayDate.getHours(), 0, 0, 0);
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
    
    // Kullanıcının yerel zamanını kullan
    const todayDate = new Date();
    todayDate.setMinutes(todayDate.getMinutes() + userTimezoneOffset);
    todayDate.setHours(todayDate.getHours(), 0, 0, 0);
    const today = todayDate.toISOString().split('T')[0];

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