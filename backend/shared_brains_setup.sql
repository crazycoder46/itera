-- Shared Brains özelliği için veritabanı güncellemeleri

-- 1. Users tablosuna share_code kolonu ekle
ALTER TABLE users ADD COLUMN share_code VARCHAR(12) UNIQUE;

-- 2. Her kullanıcı için unique share_code oluştur
UPDATE users SET share_code = 'USR' || LPAD(id::text, 6, '0') || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 3));

-- 3. Shared notes tablosu oluştur
CREATE TABLE shared_notes (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    original_note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    box_type VARCHAR(50) NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE
);

-- 4. İndeksler oluştur
CREATE INDEX idx_shared_notes_sender ON shared_notes(sender_id);
CREATE INDEX idx_shared_notes_receiver ON shared_notes(receiver_id);
CREATE INDEX idx_shared_notes_shared_at ON shared_notes(shared_at);

-- 5. Users tablosuna subscription_status kolonu da ekle (gelecekte kullanmak için)
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'basic'; 