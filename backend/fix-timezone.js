const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://itera_user:ymZmmHqxsiXtkY6h9kKdmsoVCRkjqRBu@dpg-d20kid7gi27c73cnrrp0-a.frankfurt-postgres.render.com/itera_db',
  ssl: { rejectUnauthorized: false }
});

async function fixTimezone() {
  try {
    console.log('=== TIMEZONE DÜZELTME ===');
    
    // Kullanıcı bilgileri
    const userResult = await pool.query(
      'SELECT id, timezone_offset FROM users WHERE email = $1',
      ['mcay0202@gmail.com']
    );
    
    const user = userResult.rows[0];
    console.log('👤 User ID:', user.id);
    console.log('⏰ Timezone offset:', user.timezone_offset);
    
    // Şu anki zaman
    const now = new Date();
    console.log('🕐 UTC şu an:', now.toISOString());
    console.log('🕐 Yerel şu an:', now.toString());
    
    // Farklı timezone hesaplama yöntemleri
    console.log('\n📅 TARİH HESAPLAMA YÖNTEMLERİ:');
    
    // Yöntem 1: Mevcut (yanlış)
    const todayDate1 = new Date();
    todayDate1.setMinutes(todayDate1.getMinutes() + user.timezone_offset);
    todayDate1.setHours(0, 0, 0, 0);
    const today1 = todayDate1.toISOString().split('T')[0];
    console.log('Yöntem 1 (mevcut):', today1);
    
    // Yöntem 2: Doğru timezone hesaplama
    const todayDate2 = new Date();
    const userTimezoneOffset = user.timezone_offset || 180; // GMT+3
    const userDate = new Date(todayDate2.getTime() + (userTimezoneOffset * 60 * 1000));
    userDate.setHours(0, 0, 0, 0);
    const today2 = userDate.toISOString().split('T')[0];
    console.log('Yöntem 2 (düzeltilmiş):', today2);
    
    // Yöntem 3: UTC+3 için basit hesaplama
    const todayDate3 = new Date();
    todayDate3.setUTCHours(todayDate3.getUTCHours() + 3);
    todayDate3.setUTCHours(0, 0, 0, 0);
    const today3 = todayDate3.toISOString().split('T')[0];
    console.log('Yöntem 3 (UTC+3):', today3);
    
    // Doğru yöntemi seç
    const correctToday = today2;
    console.log('\n✅ DOĞRU BUGÜN TARİHİ:', correctToday);
    
    // daily_reviews kontrol
    const reviewsResult = await pool.query(
      'SELECT review_date FROM daily_reviews WHERE user_id = $1 ORDER BY review_date DESC',
      [user.id]
    );
    
    console.log('\n📋 DAILY_REVIEWS KAYITLARI:');
    reviewsResult.rows.forEach((row, index) => {
      const isToday = row.review_date === correctToday;
      console.log(`${index + 1}. ${row.review_date} ${isToday ? '✅ BUGÜN' : ''}`);
    });
    
    // Bugün tekrar yapılmış mı
    const todayReview = reviewsResult.rows.find(row => row.review_date === correctToday);
    console.log('\n🔍 Bugün tekrar yapılmış mı:', todayReview ? 'EVET' : 'HAYIR');
    
    // Eğer bugün tekrar yapılmışsa sil
    if (todayReview) {
      console.log('🛠️  Bugünün kaydını siliyorum...');
      await pool.query(
        'DELETE FROM daily_reviews WHERE user_id = $1 AND review_date = $2',
        [user.id, correctToday]
      );
      console.log('✅ Bugünün kaydı silindi!');
    }
    
    // Not sayıları ve kutu durumları
    console.log('\n📝 NOT SAYILARI VE KUTU DURUMLARI:');
    const notesResult = await pool.query(
      'SELECT box_type, COUNT(*) as count FROM notes WHERE user_id = $1 GROUP BY box_type',
      [user.id]
    );
    
    const shouldBoxOpenToday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const today = new Date();
      
      // Doğru timezone hesaplama
      const userTimezoneOffset = user.timezone_offset || 180;
      const userDate = new Date(today.getTime() + (userTimezoneOffset * 60 * 1000));
      userDate.setHours(0, 0, 0, 0);
      const todayStr = userDate.toISOString().split('T')[0];
      
      switch(boxType) {
        case 'daily':
          return true;
          
        case 'every_2_days':
        case 'every_4_days':
        case 'weekly':
        case 'every_2_weeks':
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
              return false;
          }
          
          const firstPatternDate = new Date(created);
          firstPatternDate.setDate(firstPatternDate.getDate() + startOffset);
          
          let currentDate = new Date(firstPatternDate);
          while (currentDate <= userDate) {
            if (currentDate.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            currentDate.setDate(currentDate.getDate() + interval);
          }
          return false;
          
        default:
          return false;
      }
    };
    
    let totalReviewNotes = 0;
    const boxTypes = ['daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks', 'learned'];
    
    boxTypes.forEach(boxType => {
      const noteCount = notesResult.rows.find(n => n.box_type === boxType)?.count || 0;
      const shouldOpen = shouldBoxOpenToday('2025-07-23T19:02:01.272Z', boxType);
      const status = shouldOpen ? '✅ AÇILACAK' : '❌ AÇILMAYACAK';
      console.log(`${boxType}: ${noteCount} not ${status}`);
      if (shouldOpen) totalReviewNotes += parseInt(noteCount);
    });
    
    console.log(`\n🎯 TOPLAM TEKRAR NOT SAYISI: ${totalReviewNotes}`);
    
    // API endpoint'lerini güncelle
    console.log('\n🔄 API ENDPOINT\'LERİNİ GÜNCELLİYORUM...');
    
    // daily-review-status endpoint'ini güncelle
    const updateStatusQuery = `
      UPDATE daily_reviews 
      SET review_date = $1 
      WHERE user_id = $2 AND review_date = $3
    `;
    
    // Eğer eski tarihli kayıt varsa güncelle
    const oldDate = '2025-07-30';
    const updateResult = await pool.query(
      'UPDATE daily_reviews SET review_date = $1 WHERE user_id = $2 AND review_date = $3',
      [correctToday, user.id, oldDate]
    );
    
    if (updateResult.rowCount > 0) {
      console.log(`✅ ${updateResult.rowCount} kayıt güncellendi: ${oldDate} → ${correctToday}`);
    } else {
      console.log('ℹ️  Güncellenecek kayıt bulunamadı');
    }
    
    console.log('\n✅ TIMEZONE DÜZELTME TAMAMLANDI!');
    console.log(`📅 Doğru bugün tarihi: ${correctToday}`);
    console.log(`📝 Tekrar edilecek not sayısı: ${totalReviewNotes}`);
    console.log(`🔘 Buton durumu: ${totalReviewNotes > 0 ? 'AKTİF' : 'PASİF'}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await pool.end();
    console.log('\n🔚 Veritabanı bağlantısı kapatıldı.');
  }
}

fixTimezone(); 