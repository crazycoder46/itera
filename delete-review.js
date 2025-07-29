const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://itera_user:ymZmmHqxsiXtkY6h9kKdmsoVCRkjqRBu@dpg-d20kid7gi27c73cnrrp0-a.frankfurt-postgres.render.com/itera_db',
  ssl: { rejectUnauthorized: false }
});

async function deleteLastReview() {
  try {
    // Önce kullanıcıyı bul
    const userResult = await pool.query(
      "SELECT id, email FROM users WHERE email = 'mcay0202@gmail.com'"
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı: mcay0202@gmail.com');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log('👤 Kullanıcı bulundu:', userResult.rows[0]);
    
    // Bugünün tarihini al
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    console.log('📅 Bugünün tarihi:', todayStr);
    
    // Bugün için tekrar kaydını sil
    const deleteResult = await pool.query(
      'DELETE FROM daily_reviews WHERE user_id = $1 AND review_date = $2',
      [userId, todayStr]
    );
    
    console.log('✅ Silinen kayıt sayısı:', deleteResult.rowCount);
    
    // Kontrol et
    const checkResult = await pool.query(
      'SELECT * FROM daily_reviews WHERE user_id = $1 AND review_date = $2',
      [userId, todayStr]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('✅ Tekrar kaydı başarıyla silindi!');
    } else {
      console.log('❌ Tekrar kaydı silinemedi!');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

deleteLastReview(); 