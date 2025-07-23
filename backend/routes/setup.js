const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Database setup endpoint (sadece production'da bir kez çalıştırılacak)
router.post('/init-database', async (req, res) => {
  try {
    console.log('Database initialization started...');
    
    // Create extensions
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(255),
        language VARCHAR(5) DEFAULT 'tr',
        theme VARCHAR(10) DEFAULT 'light',
        timezone_offset INTEGER DEFAULT 180,
        is_premium BOOLEAN DEFAULT FALSE,
        share_code VARCHAR(10) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        box_type VARCHAR(20) DEFAULT 'daily' CHECK (box_type IN ('daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks', 'learned')),
        last_reviewed TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Note images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS note_images (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Daily reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_date DATE NOT NULL,
        notes_reviewed INTEGER DEFAULT 0,
        notes_remembered INTEGER DEFAULT 0,
        notes_forgotten INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, review_date)
      )
    `);
    
    // Shared brains table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shared_brains (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        share_code VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notes_box_type ON notes(box_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notes_last_reviewed ON notes(last_reviewed)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_date ON daily_reviews(user_id, review_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_shared_brains_receiver ON shared_brains(receiver_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_shared_brains_sender ON shared_brains(sender_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_share_code ON users(share_code)');
    
    // Create functions and triggers
    await pool.query(`
      CREATE OR REPLACE FUNCTION generate_share_code() RETURNS VARCHAR(10) AS $$
      DECLARE
          chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          result VARCHAR(10) := '';
          i INTEGER;
      BEGIN
          FOR i IN 1..10 LOOP
              result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
          END LOOP;
          RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_user_share_code() RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.share_code IS NULL THEN
              LOOP
                  NEW.share_code := generate_share_code();
                  EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE share_code = NEW.share_code);
              END LOOP;
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_set_user_share_code ON users;
      CREATE TRIGGER trigger_set_user_share_code
          BEFORE INSERT ON users
          FOR EACH ROW
          EXECUTE FUNCTION set_user_share_code();
    `);
    
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
      CREATE TRIGGER trigger_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_notes_updated_at ON notes;
      CREATE TRIGGER trigger_notes_updated_at
          BEFORE UPDATE ON notes
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_shared_brains_updated_at ON shared_brains;
      CREATE TRIGGER trigger_shared_brains_updated_at
          BEFORE UPDATE ON shared_brains
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('Database initialization completed successfully!');
    
    res.json({
      success: true,
      message: 'Database initialized successfully!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

module.exports = router; 