const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Paddle webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const { 
      alert_name, 
      subscription_id, 
      user_id, 
      email, 
      status,
      event_time,
      next_bill_date,
      cancel_url,
      update_url
    } = req.body;

    console.log('Paddle webhook received:', alert_name, subscription_id, email);

    // Webhook doğrulama (Paddle'dan gelen signature'ı kontrol et)
    const signature = req.headers['paddle-signature'];
    if (!verifyPaddleSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Event'e göre işlem yap
    switch (alert_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(subscription_id, user_id, email, status);
        break;
      
      case 'subscription_updated':
        await handleSubscriptionUpdated(subscription_id, user_id, email, status);
        break;
      
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(subscription_id, user_id, email);
        break;
      
      case 'subscription_payment_succeeded':
        await handlePaymentSucceeded(subscription_id, user_id, email, next_bill_date);
        break;
      
      case 'subscription_payment_failed':
        await handlePaymentFailed(subscription_id, user_id, email);
        break;
      
      default:
        console.log('Unhandled webhook event:', alert_name);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Paddle signature doğrulama
function verifyPaddleSignature(body, signature) {
  // Production'da Paddle'dan gelen signature'ı doğrula
  // Test için şimdilik true döndür
  return true;
}

// Subscription oluşturuldu
async function handleSubscriptionCreated(subscriptionId, userId, email, status) {
  try {
    const query = `
      INSERT INTO subscriptions (paddle_subscription_id, user_id, email, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (paddle_subscription_id) DO UPDATE SET
        status = $4,
        updated_at = NOW()
    `;
    
    await pool.query(query, [subscriptionId, userId, email, status]);
    
    // Kullanıcıyı premium yap
    if (status === 'active') {
      await pool.query(`
        UPDATE users 
        SET is_premium = true, 
            premium_expires_at = NOW() + INTERVAL '1 month'
        WHERE id = $1
      `, [userId]);
    }
    
    console.log('Subscription created for user:', userId);
  } catch (error) {
    console.error('Subscription created error:', error);
  }
}

// Subscription güncellendi
async function handleSubscriptionUpdated(subscriptionId, userId, email, status) {
  try {
    await pool.query(`
      UPDATE subscriptions 
      SET status = $1, updated_at = NOW()
      WHERE paddle_subscription_id = $2
    `, [status, subscriptionId]);
    
    // Status'e göre premium durumunu güncelle
    if (status === 'active') {
      await pool.query(`
        UPDATE users 
        SET is_premium = true, 
            premium_expires_at = NOW() + INTERVAL '1 month'
        WHERE id = $1
      `, [userId]);
    } else {
      await pool.query(`
        UPDATE users 
        SET is_premium = false, 
            premium_expires_at = NULL
        WHERE id = $1
      `, [userId]);
    }
    
    console.log('Subscription updated for user:', userId);
  } catch (error) {
    console.error('Subscription updated error:', error);
  }
}

// Subscription iptal edildi
async function handleSubscriptionCancelled(subscriptionId, userId, email) {
  try {
    await pool.query(`
      UPDATE subscriptions 
      SET status = 'cancelled', updated_at = NOW()
      WHERE paddle_subscription_id = $1
    `, [subscriptionId]);
    
    // Premium durumunu kaldır
    await pool.query(`
      UPDATE users 
      SET is_premium = false, 
          premium_expires_at = NULL
      WHERE id = $1
    `, [userId]);
    
    console.log('Subscription cancelled for user:', userId);
  } catch (error) {
    console.error('Subscription cancelled error:', error);
  }
}

// Ödeme başarılı
async function handlePaymentSucceeded(subscriptionId, userId, email, nextBillDate) {
  try {
    await pool.query(`
      UPDATE subscriptions 
      SET next_bill_date = $1, updated_at = NOW()
      WHERE paddle_subscription_id = $2
    `, [nextBillDate, subscriptionId]);
    
    // Premium süresini uzat
    await pool.query(`
      UPDATE users 
      SET is_premium = true, 
          premium_expires_at = $1
      WHERE id = $2
    `, [nextBillDate, userId]);
    
    console.log('Payment succeeded for user:', userId);
  } catch (error) {
    console.error('Payment succeeded error:', error);
  }
}

// Ödeme başarısız
async function handlePaymentFailed(subscriptionId, userId, email) {
  try {
    await pool.query(`
      UPDATE subscriptions 
      SET status = 'past_due', updated_at = NOW()
      WHERE paddle_subscription_id = $1
    `, [subscriptionId]);
    
    // Premium durumunu kontrol et (belki bir süre daha aktif kalabilir)
    console.log('Payment failed for user:', userId);
  } catch (error) {
    console.error('Payment failed error:', error);
  }
}

// Kullanıcının subscription bilgilerini getir
router.get('/subscription', auth, async (req, res) => {
  try {
    const query = `
      SELECT s.*, u.is_premium, u.premium_expires_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [req.userId]);
    
    if (result.rows.length === 0) {
      return res.json({ 
        hasSubscription: false,
        isPremium: false
      });
    }
    
    res.json({
      hasSubscription: true,
      subscription: result.rows[0],
      isPremium: result.rows[0].is_premium
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Test endpoint - subscription oluştur (sadece development)
router.post('/test-subscription', auth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }
  
  try {
    const { status = 'active' } = req.body;
    
    // Test subscription oluştur
    const query = `
      INSERT INTO subscriptions (paddle_subscription_id, user_id, email, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    
    const testSubscriptionId = 'test_sub_' + Date.now();
    const user = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    
    await pool.query(query, [testSubscriptionId, req.userId, user.rows[0].email, status]);
    
    // Premium durumunu güncelle
    if (status === 'active') {
      await pool.query(`
        UPDATE users 
        SET is_premium = true, 
            premium_expires_at = NOW() + INTERVAL '1 month'
        WHERE id = $1
      `, [req.userId]);
    }
    
    res.json({ 
      success: true, 
      message: 'Test subscription created',
      subscriptionId: testSubscriptionId
    });
  } catch (error) {
    console.error('Test subscription error:', error);
    res.status(500).json({ error: 'Failed to create test subscription' });
  }
});

module.exports = router; 