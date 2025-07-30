const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://itera_user:ymZmmHqxsiXtkY6h9kKdmsoVCRkjqRBu@dpg-d20kid7gi27c73cnrrp0-a.frankfurt-postgres.render.com/itera_db',
  ssl: { rejectUnauthorized: false }
});

async function testStatus() {
  try {
    console.log('=== DAILY REVIEW STATUS TEST ===');
    
    // Kullanıcıyı bul
    const userResult = await pool.query(
      'SELECT id, timezone_offset FROM users WHERE email = $1',
      ['mcay0202@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı!');
      return;
    }
    
    const userId = userResult.rows[0].id;
    const userTimezoneOffset = userResult.rows[0].timezone_offset || 180;
    
    console.log('👤 Kullanıcı ID:', userId);
    console.log('⏰ Timezone offset:', userTimezoneOffset);
    
    // Endpoint'in hesapladığı bugünün tarihini hesapla
    const todayDate = new Date();
    todayDate.setMinutes(todayDate.getMinutes() + userTimezoneOffset);
    todayDate.setHours(todayDate.getHours(), 0, 0, 0);
    const today = todayDate.toISOString().split('T')[0];
    
    console.log('📅 Endpoint\'in hesapladığı bugünün tarihi:', today);
    
    // daily_reviews tablosunu kontrol et
    const reviewsResult = await pool.query(
      'SELECT review_date FROM daily_reviews WHERE user_id = $1 ORDER BY review_date DESC LIMIT 5',
      [userId]
    );
    
    console.log('\n📋 Son tekrar kayıtları:');
    reviewsResult.rows.forEach((row, index) => {
      const isToday = row.review_date === today;
      console.log(`${index + 1}. ${row.review_date} ${isToday ? '✅ BUGÜN' : ''}`);
    });
    
    // Bugün tekrar yapılmış mı kontrol et
    const todayReview = reviewsResult.rows.find(row => row.review_date === today);
    console.log(`\n🔍 Bugün tekrar yapılmış mı: ${todayReview ? '✅ EVET' : '❌ HAYIR'}`);
    
    if (todayReview) {
      console.log('⚠️  SORUN: Bugün tekrar yapılmış görünüyor!');
      console.log('🛠️  Bugünün kaydını siliyorum...');
      
      const deleteResult = await pool.query(
        'DELETE FROM daily_reviews WHERE user_id = $1 AND review_date = $2',
        [userId, today]
      );
      
      console.log(`✅ ${deleteResult.rowCount} kayıt silindi.`);
    } else {
      console.log('✅ Bugün tekrar yapılmamış - doğru!');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await pool.end();
    console.log('\n🔚 Veritabanı bağlantısı kapatıldı.');
  }
}

testStatus(); 