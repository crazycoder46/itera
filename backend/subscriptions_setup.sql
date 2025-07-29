-- Subscriptions tablosu oluştur
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    paddle_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
    next_bill_date TIMESTAMP,
    cancel_url VARCHAR(500),
    update_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users tablosuna premium_expires_at kolonu ekle (eğer yoksa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;

-- İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_id ON subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_users_premium_expires ON users(premium_expires_at);

-- Premium süresi dolmuş kullanıcıları otomatik olarak basic yapmak için trigger
CREATE OR REPLACE FUNCTION check_premium_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Premium süresi dolmuş kullanıcıları basic yap
    UPDATE users 
    SET is_premium = false, 
        premium_expires_at = NULL
    WHERE is_premium = true 
      AND premium_expires_at IS NOT NULL 
      AND premium_expires_at < NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı oluştur (her gün çalışacak)
DROP TRIGGER IF EXISTS trigger_check_premium_expiration ON users;
CREATE TRIGGER trigger_check_premium_expiration
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_premium_expiration();

-- Test verisi (opsiyonel)
-- INSERT INTO subscriptions (paddle_subscription_id, user_id, email, status) 
-- VALUES ('test_sub_123', 1, 'test@example.com', 'active'); 