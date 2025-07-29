const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const { adminSecret } = req.body;
  if (adminSecret !== 'itera_admin_2024') {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized' 
    });
  }
  next();
};

// Get admin statistics
router.post('/statistics', authenticateAdmin, async (req, res) => {
  try {
    // Total users count
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total_users);

    // Total notes count
    const notesResult = await pool.query('SELECT COUNT(*) as total_notes FROM notes');
    const totalNotes = parseInt(notesResult.rows[0].total_notes);

    // Premium users count
    const premiumResult = await pool.query('SELECT COUNT(*) as premium_users FROM users WHERE is_premium = true');
    const premiumUsers = parseInt(premiumResult.rows[0].premium_users);

    // Total images count
    const imagesResult = await pool.query('SELECT COUNT(*) as total_images FROM note_images');
    const totalImages = parseInt(imagesResult.rows[0].total_images);

    // Recent registrations (last 7 days)
    const recentUsersResult = await pool.query(`
      SELECT COUNT(*) as recent_users 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const recentUsers = parseInt(recentUsersResult.rows[0].recent_users);

    // Recent notes (last 7 days)
    const recentNotesResult = await pool.query(`
      SELECT COUNT(*) as recent_notes 
      FROM notes 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const recentNotes = parseInt(recentNotesResult.rows[0].recent_notes);

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalNotes,
        premiumUsers,
        totalImages,
        recentUsers,
        recentNotes
      }
    });

  } catch (error) {
    console.error('Admin statistics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Admin endpoint to manage user premium status
router.post('/set-premium', authenticateAdmin, async (req, res) => {
  try {
    const { email, isPremium } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Update user premium status
    const query = `
      UPDATE users 
      SET is_premium = $1, 
          premium_expires_at = CASE 
            WHEN $1 = true THEN NOW() + INTERVAL '1 year'
            ELSE NULL 
          END
      WHERE email = $2
      RETURNING id, email, is_premium, premium_expires_at
    `;
    
    const result = await pool.query(query, [isPremium, email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `User ${email} premium status updated to ${isPremium}`,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Admin premium update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user premium status
router.get('/user-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { adminSecret } = req.query;
    
    if (adminSecret !== 'itera_admin_2024') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const query = `
      SELECT id, email, is_premium, premium_expires_at, created_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Admin user status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 