const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://itera_user:ymZmmHqxsiXtkY6h9kKdmsoVCRkjqRBu@dpg-d20kid7gi27c73cnrrp0-a.frankfurt-postgres.render.com/itera_db',
  ssl: { rejectUnauthorized: false }
});

async function fixAlgorithm() {
  try {
    console.log('=== ALGORİTMA SORUNU TESPİT ===');
    
    // Kullanıcıyı bul
    const userResult = await pool.query(
      'SELECT id, created_at, timezone_offset FROM users WHERE email = $1',
      ['mcay0202@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı!');
      return;
    }
    
    const userId = userResult.rows[0].id;
    const userCreatedAt = new Date(userResult.rows[0].created_at);
    const userTimezoneOffset = userResult.rows[0].timezone_offset || 180;
    
    console.log('👤 Kullanıcı ID:', userId);
    console.log('📅 Kayıt tarihi:', userCreatedAt.toISOString());
    console.log('⏰ Timezone offset:', userTimezoneOffset);
    
    // Bugünün tarihini hesapla
    const today = new Date();
    today.setMinutes(today.getMinutes() + userTimezoneOffset);
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    console.log('\n📅 Bugünün tarihi:', todayStr);
    
    // Kayıt tarihinden bugüne kadar geçen gün sayısını hesapla
    const daysSinceRegistration = Math.floor((today - userCreatedAt) / (1000 * 60 * 60 * 24));
    console.log('📊 Kayıt tarihinden bugüne geçen gün:', daysSinceRegistration);
    
    // Algoritma testi - doğru mantık
    const shouldBoxOpenToday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const today = new Date();
      
      // Kullanıcının zaman dilimini kullan
      today.setMinutes(today.getMinutes() + userTimezoneOffset);
      today.setHours(0, 0, 0, 0);
      
      const todayStr = today.toISOString().split('T')[0];
      
      switch(boxType) {
        case 'daily':
          return true; // Her gün açılır
          
        case 'every_2_days':
          // Kayıt tarihinden 2 gün sonra başlayıp 2'şer gün arayla
          const firstOpen2 = new Date(created);
          firstOpen2.setDate(firstOpen2.getDate() + 2);
          
          console.log(`every_2_days - İlk açılma: ${firstOpen2.toISOString().split('T')[0]}`);
          
          let current2 = new Date(firstOpen2);
          while (current2.toISOString().split('T')[0] <= todayStr) {
            console.log(`every_2_days - Kontrol: ${current2.toISOString().split('T')[0]} vs ${todayStr}`);
            if (current2.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current2.setDate(current2.getDate() + 2);
          }
          return false;
          
        case 'every_4_days':
          // Kayıt tarihinden 4 gün sonra başlayıp 4'er gün arayla
          const firstOpen4 = new Date(created);
          firstOpen4.setDate(firstOpen4.getDate() + 4);
          
          console.log(`every_4_days - İlk açılma: ${firstOpen4.toISOString().split('T')[0]}`);
          
          let current4 = new Date(firstOpen4);
          while (current4.toISOString().split('T')[0] <= todayStr) {
            console.log(`every_4_days - Kontrol: ${current4.toISOString().split('T')[0]} vs ${todayStr}`);
            if (current4.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current4.setDate(current4.getDate() + 4);
          }
          return false;
          
        case 'weekly':
          // Kayıt tarihinden 7 gün sonra başlayıp 7'şer gün arayla
          const firstOpen7 = new Date(created);
          firstOpen7.setDate(firstOpen7.getDate() + 7);
          
          console.log(`weekly - İlk açılma: ${firstOpen7.toISOString().split('T')[0]}`);
          
          let current7 = new Date(firstOpen7);
          while (current7.toISOString().split('T')[0] <= todayStr) {
            console.log(`weekly - Kontrol: ${current7.toISOString().split('T')[0]} vs ${todayStr}`);
            if (current7.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current7.setDate(current7.getDate() + 7);
          }
          return false;
          
        case 'every_2_weeks':
          // Kayıt tarihinden 14 gün sonra başlayıp 14'er gün arayla
          const firstOpen14 = new Date(created);
          firstOpen14.setDate(firstOpen14.getDate() + 14);
          
          console.log(`every_2_weeks - İlk açılma: ${firstOpen14.toISOString().split('T')[0]}`);
          
          let current14 = new Date(firstOpen14);
          while (current14.toISOString().split('T')[0] <= todayStr) {
            console.log(`every_2_weeks - Kontrol: ${current14.toISOString().split('T')[0]} vs ${todayStr}`);
            if (current14.toISOString().split('T')[0] === todayStr) {
              return true;
            }
            current14.setDate(current14.getDate() + 14);
          }
          return false;
          
        default:
          return false;
      }
    };
    
    console.log('\n🎯 BUGÜN KUTU AÇILMA TESTİ:');
    const boxTypes = ['daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks'];
    boxTypes.forEach(boxType => {
      const shouldOpen = shouldBoxOpenToday(userCreatedAt, boxType);
      console.log(`${boxType}: ${shouldOpen ? '✅ AÇILACAK' : '❌ AÇILMAYACAK'}`);
    });
    
    // Dünün testi
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log(`\n📅 Dünün tarihi: ${yesterdayStr}`);
    console.log('🎯 DÜN KUTU AÇILMA TESTİ:');
    
    // Dün için test fonksiyonu
    const shouldBoxOpenYesterday = (userCreatedAt, boxType) => {
      const created = new Date(userCreatedAt);
      const yesterday = new Date();
      yesterday.setMinutes(yesterday.getMinutes() + userTimezoneOffset);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      switch(boxType) {
        case 'daily':
          return true;
          
        case 'every_2_days':
          const firstOpen2 = new Date(created);
          firstOpen2.setDate(firstOpen2.getDate() + 2);
          
          let current2 = new Date(firstOpen2);
          while (current2.toISOString().split('T')[0] <= yesterdayStr) {
            if (current2.toISOString().split('T')[0] === yesterdayStr) {
              return true;
            }
            current2.setDate(current2.getDate() + 2);
          }
          return false;
          
        case 'every_4_days':
          const firstOpen4 = new Date(created);
          firstOpen4.setDate(firstOpen4.getDate() + 4);
          
          let current4 = new Date(firstOpen4);
          while (current4.toISOString().split('T')[0] <= yesterdayStr) {
            if (current4.toISOString().split('T')[0] === yesterdayStr) {
              return true;
            }
            current4.setDate(current4.getDate() + 4);
          }
          return false;
          
        case 'weekly':
          const firstOpen7 = new Date(created);
          firstOpen7.setDate(firstOpen7.getDate() + 7);
          
          let current7 = new Date(firstOpen7);
          while (current7.toISOString().split('T')[0] <= yesterdayStr) {
            if (current7.toISOString().split('T')[0] === yesterdayStr) {
              return true;
            }
            current7.setDate(current7.getDate() + 7);
          }
          return false;
          
        case 'every_2_weeks':
          const firstOpen14 = new Date(created);
          firstOpen14.setDate(firstOpen14.getDate() + 14);
          
          let current14 = new Date(firstOpen14);
          while (current14.toISOString().split('T')[0] <= yesterdayStr) {
            if (current14.toISOString().split('T')[0] === yesterdayStr) {
              return true;
            }
            current14.setDate(current14.getDate() + 14);
          }
          return false;
          
        default:
          return false;
      }
    };
    
    boxTypes.forEach(boxType => {
      const shouldOpen = shouldBoxOpenYesterday(userCreatedAt, boxType);
      console.log(`${boxType}: ${shouldOpen ? '✅ AÇILACAK' : '❌ AÇILMAYACAK'}`);
    });
    
    // Notları kontrol et
    const notesResult = await pool.query(
      'SELECT box_type, COUNT(*) as count FROM notes WHERE user_id = $1 AND box_type != \'learned\' GROUP BY box_type',
      [userId]
    );
    
    console.log('\n📝 KUTU NOT SAYILARI:');
    notesResult.rows.forEach(row => {
      const shouldOpen = shouldBoxOpenToday(userCreatedAt, row.box_type);
      console.log(`${row.box_type}: ${row.count} not ${shouldOpen ? '✅ AÇILACAK' : '❌ AÇILMAYACAK'}`);
    });
    
    // Toplam tekrar sayısını hesapla
    const totalReviewNotes = notesResult.rows
      .filter(row => shouldBoxOpenToday(userCreatedAt, row.box_type))
      .reduce((sum, row) => sum + parseInt(row.count), 0);
    
    console.log(`\n🎯 TOPLAM TEKRAR NOT SAYISI: ${totalReviewNotes}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await pool.end();
    console.log('\n🔚 Veritabanı bağlantısı kapatıldı.');
  }
}

fixAlgorithm(); 