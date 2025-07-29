# Ürün Gereksinimleri Dokümanı (PRD): Itera
**Versiyon:** 1.0

## Bölüm 1: Proje Kuralları ve Teknik Kararlar

### Geliştirme Kuralları
- Her görev tamamlandığında yol haritasındaki ilgili madde `[x]` olarak işaretlenir.
- Sadece sıradaki adıma odaklanılır, gelecek fazlardaki adımlar atlanmaz.
- Geliştirme **önce yerelde** yapılır, fazlar tamamlandıkça canlıya dağıtım düşünülür.
- Windows PowerShell, geliştirme terminali olarak kullanılır.
- Dark/Light tema ve çoklu dil desteği (EN/TR) baştan itibaren planlanır.
- **`expo-router` kesinlikle kullanılmayacak.**
- Tüm tasarımlar Tailwind CSS ile yapılacak.

### Teknik Mimarî (Tech Stack)
- **Çerçeve (Framework):** Expo (React Native) ile tek kod tabanından Web, iOS ve Android hedeflenir.
- **Geliştirme İstemcisi:** Expo Go
- **Navigasyon:** React Navigation kütüphanesi kullanılır.
- **Stil (Styling):** Tailwind CSS (`nativewind` ile) ana stil kütüphanesi olarak kullanılır. Tüm tasarımla tailwind Css ile yapılacak.
- **Backend:** **Özel Geliştirilmiş API (Node.js & Express.js)**.
- **Veritabanı:** **PostgreSQL.**

## Bölüm 2: Ürün Detayları ve Kullanıcı Deneyimi

### 2.1. Genel Tasarım ve Etkileşim Felsefesi

* **Arayüz:** Minimalist, temiz ve odaklanmayı teşvik eden bir tasarım.
* **Animasyonlar:** Tüm ekran geçişleri ve etkileşimler akıcı ve pürüzsüz olmalı. Bir kartı tamamlandığında veya bir kutuya geçtiğinde tatmin edici, hafif animasyonlar kullanılacak.
* **Geri Bildirim:** Mobil cihazlarda, önemli aksiyonlarda (tekrarı tamamlama, not silme vb.) hafif bir dokunsal geri bildirim (haptic feedback) verilecek.

### 2.2. Ekranlar ve Akışlar

#### Ana Navigasyon (Navbar > Kullanıcı giriş yaptıktan sonra açılır)
Ekranın sol üstünde Itera yazısının devamında 4 sekmeli bir bar bulunur: `Ana Sayfa`, `Takvim`, `Shared Brains` (Kilitli), `Profil`. En sağda ise advance yükselt butonu bulunur.

#### Ana Sayfa (`Ana Sayfa` Sekmesi)
* Uygulamanın kalbi. Renk kodlu 6 kutu (`Günde Bir` (Mavi), `2 Günde Bir` (Kırmızı), `4 Günde Bir` (Turuncu), `Haftada Bir` (Mor), `2 Haftada Bir` (Yeşil), `Kalıcı Olarak Öğrenildi` (Gri)), yuvarlatılmış köşeler ve hafif bir gölge ile belirginleştirilir. Bunlar yatay ekrana tam sığacak. 1x6 (1 satır 6 sütun) şeklinde olacak.
* Bir notu sürükleyip bir kutunun üzerine getirince, o kutunun kenarlığı parlayarak görsel geri bildirim verir.
* **"Tekrar Başla"** butonu, o gün tekrar edilecek not varsa canlı bir renkte ve üzerinde "Bugün X Not Seni Bekliyor" gibi bir metinle durur. Tekrarlar bitince buton pasifleşir ve "Harika İş! Bugünlük bu kadar." mesajını gösterir.
* Kutuların üzerine tıklanınca kutu açılır ve içeride yeni not eklenebilir. Var olan notlar düzenlenebilir ya da silinebilir.

#### Not Ekleme ve Düzenleme Akışı
* **Şablon Seçimi:** Yeni not oluştururken kullanıcı şu şablonlardan birini seçebilir: `Boş Not`, `Cornell Metodu`, `Soru - Cevap Kartı`, `Toplantı Notu`, `Literatür İncelemesi`.
* **Not Düzenleyici Özellikleri:**
    * **Tam Markdown Desteği:** Gerçek zamanlı olarak çalışır. Kullanıcı `# Başlık` yazdığında, metin anında büyük ve kalın hale gelir. Kullanıcı edit modundan okuma moduna 	geçince yazdığı kodu okur (live). Kullanıcı sadece edit modunda iken kodu görebilir. OKuma modunda render edilmiş markdown görür. Kasa açıldığında okuma modunda göreceğiz notları. Nota tıklarsa kasayı açtıktan sonra notun tamamı açılır.
    * **Resim Ekleme:** Nota doğrudan cihazdan resim eklenebilir. Resim eklenince hem okuma hem de düzenleme modunda resim olarak gözükmeli (direk resmi kullanıcı sürükleyebilecek ya da boyutları ile oynayabilecek. not ekranını canvas gibi kullanabilecek. resimler asla kod olarak gözükmemeli. not ekranı sadece markdown destekleyen değil aynı zamanda çok komforlu şekilde resimleri ekleme ve onları manipüle edebileceğimiz de bir ekran olacak). 
  * **Not Silme:** Kullanıcı bir notu kasanın içini görüntülerken silebilecek.


#### Tekrar Akışı
* "Tekrara Başla"ya basınca, tam ekran bir "konsantrasyon moduna" geçilir.
* Her tekrar bittiğinde, kullanıcıyı tebrik eden bir özet ekranı çıkar: *"Harika iş! Bugün 15 notu tekrar ettin. Tekrar serin şimdi 5 gün!"*
* Her kartın altında `✓` (Hatırladım) ve `✗` (Hatırlamadım) butonları bulunur. `✓`'e basılan not bir sonraki kutuya geçer. `✗`'e basılan not mevcut kutusunda kalır. Tekrar bitince ana sayfa açılır ve "Tekrara Başla" butonu disable olup "Harika iş! Bugün 15 notu tekrar ettin. Tekrar serin şimdi 5 gün!" gibi bir mesaj yazar.

#### Takvim (`Takvim` Sekmesi)
* Aylık bir takvim görünümü sunar. Her günün üzerinde, o gün tekrarı gelecek kutuların renklerini taşıyan büyük noktalar bulunur. Tekrarı yapılan günler yeşile dönüşmüştür. Mevcut gün ise çerçeve içindedir. Mavi her gün olduğu için takvimde yer almayacak. Kırmızı kayıt tarihinden 2 gün sonra başlayıp (kullanıcının kayıt tarihinden) ikişer gün arayla, turuncu kayıt tarihinden 4 gün sonra başlayıp 4er gün arayla devam edecek. bu pattern diğer renkler için de geçerlidir.
* Kullanıcı takvimde bir güne tıkladığında, o gün hangi notları tekrar ettiğini gösteren küçük bir pop-up açılır.

#### Profil (`Profil` Sekmesi)
* **Alanlar:** Profil Fotoğrafı (Yükleme seçeneği), Kullanıcı Bilgileri(Ad, Soyad, E-posta, Şifre [e-posta hariç değiştirebilir]), Dil Seçimi (Dropdown), Tema (Dropdown) Mevcut Plan (`Itera Basic`), `Advanced'e Yükselt` butonu, `Çıkış Yap`. Kullanıcı Kullanıcı Bilgileri kısmını değiştirebilir. Dil Seçimi ve Tema hafızada kalacak ve her açıldığında en sonki ayar kalacak unutma.

## Bölüm 3: Teknik Yol Haritası (Yapılacaklar)

### Faz 1: Proje Temelleri ve Özel Backend Mimarisi

*Bu fazın amacı, uygulamanın çalışacağı iskeleti ve beyni (API) sıfırdan inşa etmektir.*

#### 1.1. Frontend ve Yerel Ortam Kurulumu
- [x] **Expo Go Projesi Oluşturma:**
- [x] **Tailwind CSS Kurulumu:** `nativewind` kütüphanesi ile Tailwind'in projeye entegre edilmesi.
- [x] **React Navigation Kurulumu:** Gerekli paketlerin (`@react-navigation/native`, `@react-navigation/native-stack`, vb.) kurulması ve yapılandırılması.

#### 1.2. Yerel Veritabanı ve Backend Projesi Kurulumu
- [x] **Yerel PostgreSQL Kurulumu:** Geliştirme bilgisayarına PostgreSQL sunucusunun kurulması ve bir `itera_db` veritabanı oluşturulması.
- [x] **Backend Projesi Başlatma:** node.js & express.js ile ilgili yapılması gerekenler.
- [x] **Veritabanı Bağlantısı:** Backend projesinin yerel PostgreSQL veritabanına bağlanmasının sağlanması.
- [x] **Veritabanı Şeması Oluşturma:** `users`, `notes` gibi temel tabloların oluşturulması. örnek bir user profili oluşturma, örnek notlar vs ekleme (her tabloda örnek veri olsun).

#### 1.3. Özel API Geliştirilmesi
- [x] **Kimlik Doğrulama API'ı:** Kullanıcıların sisteme kaydolmasını, giriş yapmasını ve oturumlarını yönetmesini sağlayacak API altyapısının oluşturulması.
- [x] **Not Yönetimi (CRUD) API'ı:** Notların oluşturulması, listelenmesi, güncellenmesi ve silinmesi için gerekli API endpoint'lerinin geliştirilmesi.
- [x] **Tekrar Sistemi API'ı:** Notların öğrenilme durumunu (`hatırladım`/`hatırlamadım`) işleyerek tekrar döngüsünü yönetecek API'ın geliştirilmesi.

### Faz 2: Çekirdek Uygulama ve Ana İşlevsellik

*Bu fazda, inşa edilen API'ı kullanan, uygulamanın kalbi olan özellikler geliştirilir.*

#### 2.1. Kimlik Doğrulama Ekranları ve Oturum Yönetimi ✅ TAMAMLANDI
- [x] **Kayıt ve Giriş Ekranları:** Expo'da `Kayıt Ol` ve `Giriş Yap` ekranlarının arayüzlerinin geliştirilmesi.
- [x] **API Entegrasyonu:** Bu ekranların, Faz 1'de oluşturulan `/register` ve `/login` API endpoint'lerine bağlanması.
- [x] **Oturum Yönetimi (Frontend):** Alınan JWT'nin güvenli bir şekilde saklanması ve her API isteğine eklenmesi için bir `AuthContext` yapı kurulması.
- [x] **PostgreSQL Entegrasyonu:** Gerçek veritabanı ile kayıt/giriş işlemlerinin test edilmesi ve başarılı çalışması.
- [x] **Web Platformu Desteği:** Uygulamanın web tarayıcısında tam fonksiyonel çalışması.

#### 2.2. Ana Panel ve Not Yönetimi Arayüzü ✅ TAMAMLANDI
- [x] **Ana Panel İskeleti ve Navigasyon:** Giriş sonrası görülecek ana panelin ve React Navigation ile `Ana Sayfa`, `Profil` vb. sekmeler arası geçişin oluşturulması.
- [x] **Ana Sayfa Ekranı:** 6 adet Leitner kutusunun arayüzünün geliştirilmesi.
- [x] **Not Yönetimi (CRUD) Arayüzü:** Not oluşturma, düzenleme ve silme ekranlarının API'a bağlanarak tam işlevsel hale getirilmesi.
- [x] **Markdown Editör Entegrasyonu:** Notların Markdown formatında yazılabilmesi için bir editör bileşeninin entegre edilmesi.

#### 2.3. Tekrar Sistemi Arayüzü ✅ TAMAMLANDI
- [x] **Tekrar Akışı (Konsantrasyon Modu):** Tekrar edilecek notların gösterildiği odaklanma modunun arayüzünün geliştirilmesi.
- [x] **Tekrar API Entegrasyonu:** `✓` ve `✗` butonlarının çağırarak notun tekrar durumunu güncellemesinin sağlanması.

### Faz 3: Destekleyici Özellikler ve Geliştirmeler
- [x] **Takvim Ekranı:** Tekrar günlerini gösteren takvim arayüzünün geliştirilmesi ve ilgili API'dan veri çekmesi.
- [x] **Profil Ekranı:** Kullanıcı bilgilerini gösteren ve güncelleyen (yeni API endpoint'leri gerektirebilir) ekranın yapılması.
- [x] **Resim Yükleme (Gelişmiş) ve Profili Düzenleme Özelliklerinin kazandırılması**

### Faz 4: Tanıtım Sayfası, Test ve Web Dağıtımı

*Uygulamanın çekirdeği bittikten sonra, dış dünyaya açılma ve stabilizasyon adımları.*

- [x] **Landing Page Geliştirilmesi:** Uygulamayı anlatan, `Giriş Yap` ve `Kayıt Ol` butonlarını içeren tanıtım sayfasının oluşturulması (bu butonlar önceki kısımda yapılan kayıt ol v eğiriş yap butonlarına yönlendirilir). Tanıtım Sayfası yapıldıktan sonra kullanıcı profil oluşturup giriş yapmadıkça önceki hiçbir ekrana erişemez. Artık uyulama başladığında ana ekranımız hep burası olacak.
- [x] **SEO Optimizasyonu:** Meta tags, Open Graph, Twitter Cards, sitemap.xml, robots.txt ve yapısal veri (JSON-LD) eklenmesi.
- [x] **Yasal Sayfalar:** Privacy Policy, Terms of Service ve FAQ sayfalarının oluşturulması.
- [x] **KVKK Uyumluluğu:** Kayıt sayfasına gizlilik politikası ve kullanım şartları onay checkbox'larının eklenmesi.

- [x] **Test Süreçleri:** Kritik API endpoint'leri ve frontend bileşenleri için testlerin yazılması.
- [x] **Canlı Ortam Kurulumu (Deployment):**
    - [x] **Deployment Hazırlıkları:** Production için gerekli konfigürasyon dosyaları, environment variables ve build script'leri hazırlandı.
    - [x] **Database Migration:** Production veritabanı için init-db.sql dosyası oluşturuldu.
    - [x] **Deployment Rehberi:** DEPLOYMENT.md dosyasında detaylı deployment adımları dokümante edildi.
    - [x] **Veritabanı:** Render PostgreSQL'de canlı veritabanının oluşturulması.
    - [x] **Backend:** Render.com'da backend API'ın deploy edilmesi.
    - [x] **Frontend:** Vercel'de frontend'in deploy edilmesi.


### Faz 5: Mobil Platform Adaptasyonu ve Yayınlam (Proje Sonrası)
- [ ] **Mobil Arayüz (UI/UX) İyileştirmeleri:** Web'de geliştirilen arayüzün mobil ekranlara ve dokunmatik kontrollere göre elden geçirilmesi.
- [ ] **Mobil İşlevsellik Eklemeleri:** Haptic feedback (titreşim), jestler (kaydırma) gibi mobil-özel özelliklerin eklenmesi.
- [ ] **Mobil Build ve Mağazalara Gönderim:** Expo EAS Build ile Android/iOS paketlerinin oluşturulması ve mağazalaraimage.png gönderilmesi.

---
### Yapıldı
*(Bu bölüme tamamlanan görevler taşınacak.)*