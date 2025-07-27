const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Admin endpoint to manage user premium status
router.post('/set-premium', async (req, res) => {
  try {
    const { email, isPremium, adminSecret } = req.body;
    
    // Simple admin authentication (you can change this secret)
    if (adminSecret !== 'itera_admin_2024') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
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