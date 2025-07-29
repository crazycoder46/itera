const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Premium kontrolü middleware'i
const requirePremium = async (req, res, next) => {
  try {
    const result = await db.query('SELECT is_premium FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    const isPremium = result.rows[0].is_premium;
    if (!isPremium) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bu özellik premium kullanıcılara özeldir',
        requiresPremium: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({ success: false, message: 'Premium kontrol hatası' });
  }
};

// Kullanıcının share_code'unu getir
router.get('/my-code', auth, requirePremium, async (req, res) => {
  try {
    const result = await db.query('SELECT share_code FROM users WHERE id = $1', [req.userId]);
    res.json({ success: true, shareCode: result.rows[0].share_code });
  } catch (error) {
    console.error('Share code error:', error);
    res.status(500).json({ success: false, message: 'Share code alınamadı' });
  }
});

// Kullanıcının notlarını listele (paylaşım için)
router.get('/my-notes', auth, requirePremium, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, box_type FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ success: true, notes: result.rows });
  } catch (error) {
    console.error('My notes error:', error);
    res.status(500).json({ success: false, message: 'Notlar alınamadı' });
  }
});

// Not paylaş
router.post('/share-note', auth, requirePremium, async (req, res) => {
  try {
    const { noteId, shareCode } = req.body;
    
    // Alıcı kullanıcıyı bul
    const receiverResult = await db.query('SELECT id FROM users WHERE share_code = $1', [shareCode]);
    if (receiverResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Geçersiz paylaşım kodu' });
    }
    
    const receiverId = receiverResult.rows[0].id;
    
    // Kendi kendine paylaşım kontrolü
    if (receiverId === req.userId) {
      return res.status(400).json({ success: false, message: 'Kendi kendinize not paylaşamazsınız' });
    }
    
    // Notu getir
    const noteResult = await db.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, req.userId]);
    if (noteResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not bulunamadı' });
    }
    
    const note = noteResult.rows[0];
    
    // Paylaşımı kaydet
    await db.query(
      'INSERT INTO shared_notes (sender_id, receiver_id, original_note_id, title, content, box_type) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.userId, receiverId, noteId, note.title, note.content, note.box_type]
    );
    
    res.json({ success: true, message: 'Not başarıyla paylaşıldı' });
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({ success: false, message: 'Not paylaşılamadı' });
  }
});

// Gelen notları listele
router.get('/received', auth, requirePremium, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sn.*, u.first_name, u.last_name 
      FROM shared_notes sn 
      JOIN users u ON sn.sender_id = u.id 
      WHERE sn.receiver_id = $1 AND sn.is_deleted_by_receiver = FALSE 
      ORDER BY sn.shared_at DESC
    `, [req.userId]);
    
    res.json({ success: true, notes: result.rows });
  } catch (error) {
    console.error('Received notes error:', error);
    res.status(500).json({ success: false, message: 'Gelen notlar alınamadı' });
  }
});

// Gönderilen notları listele
router.get('/sent', auth, requirePremium, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sn.*, u.first_name, u.last_name 
      FROM shared_notes sn 
      JOIN users u ON sn.receiver_id = u.id 
      WHERE sn.sender_id = $1 AND sn.is_deleted_by_sender = FALSE 
      ORDER BY sn.shared_at DESC
    `, [req.userId]);
    
    res.json({ success: true, notes: result.rows });
  } catch (error) {
    console.error('Sent notes error:', error);
    res.status(500).json({ success: false, message: 'Gönderilen notlar alınamadı' });
  }
});

// Notu notlarıma ekle (kabul et)
router.post('/accept-note/:id', auth, requirePremium, async (req, res) => {
  try {
    const sharedNoteId = req.params.id;
    
    // Paylaşılan notu getir
    const sharedResult = await db.query(
      'SELECT * FROM shared_notes WHERE id = $1 AND receiver_id = $2',
      [sharedNoteId, req.userId]
    );
    
    if (sharedResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paylaşılan not bulunamadı' });
    }
    
    const sharedNote = sharedResult.rows[0];
    
    // Notu kendi notlarına ekle
    await db.query(
      'INSERT INTO notes (user_id, title, content, box_type) VALUES ($1, $2, $3, $4)',
      [req.userId, sharedNote.title, sharedNote.content, sharedNote.box_type]
    );
    
    // Paylaşılan notu kabul edildi olarak işaretle
    await db.query(
      'UPDATE shared_notes SET is_accepted = TRUE WHERE id = $1',
      [sharedNoteId]
    );
    
    res.json({ success: true, message: 'Not notlarınıza eklendi' });
  } catch (error) {
    console.error('Accept note error:', error);
    res.status(500).json({ success: false, message: 'Not eklenemedi' });
  }
});

// Gelen notu sil
router.delete('/received/:id', auth, requirePremium, async (req, res) => {
  try {
    const sharedNoteId = req.params.id;
    
    await db.query(
      'UPDATE shared_notes SET is_deleted_by_receiver = TRUE WHERE id = $1 AND receiver_id = $2',
      [sharedNoteId, req.userId]
    );
    
    res.json({ success: true, message: 'Not silindi' });
  } catch (error) {
    console.error('Delete received note error:', error);
    res.status(500).json({ success: false, message: 'Not silinemedi' });
  }
});

// Gönderilen notu sil
router.delete('/sent/:id', auth, requirePremium, async (req, res) => {
  try {
    const sharedNoteId = req.params.id;
    
    await db.query(
      'UPDATE shared_notes SET is_deleted_by_sender = TRUE WHERE id = $1 AND sender_id = $2',
      [sharedNoteId, req.userId]
    );
    
    res.json({ success: true, message: 'Not silindi' });
  } catch (error) {
    console.error('Delete sent note error:', error);
    res.status(500).json({ success: false, message: 'Not silinemedi' });
  }
});

module.exports = router; 