# Itera Deployment Rehberi

Bu rehber, Itera uygulamasını ücretsiz servisler kullanarak deploy etmek için gereken adımları içerir.

## 🎯 Deployment Stratejisi

- **Backend**: Render.com (ücretsiz)
- **Frontend**: Vercel (ücretsiz)
- **Veritabanı**: Render PostgreSQL (ücretsiz)

## 📋 Ön Gereksinimler

1. GitHub hesabı
2. Render.com hesabı
3. Vercel hesabı
4. Git kurulu olmalı

## 🚀 Deployment Adımları

### 1. GitHub Repository Hazırlığı

```bash
# Eğer henüz git repo'su yoksa
git init
git add .
git commit -m "Initial commit for deployment"

# GitHub'a push et
git remote add origin https://github.com/yourusername/itera.git
git push -u origin main
```

### 2. Backend Deployment (Render.com)

#### 2.1. Render.com'da Yeni Servis Oluştur

1. [Render.com](https://render.com) hesabına giriş yap
2. "New" → "Web Service" seç
3. GitHub repository'ni bağla
4. Şu ayarları yap:
   - **Name**: `itera-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

#### 2.2. Environment Variables Ayarla

Render dashboard'da Environment Variables bölümüne şunları ekle:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### 2.3. PostgreSQL Database Oluştur

1. Render dashboard'da "New" → "PostgreSQL" seç
2. Şu ayarları yap:
   - **Name**: `itera-db`
   - **Database**: `itera_db`
   - **User**: `itera_user`
   - **Plan**: Free

3. Database oluşturulduktan sonra, "Connect" bilgilerini kopyala

#### 2.4. Database URL'i Backend'e Bağla

1. Backend servisinin Environment Variables'ına ekle:
```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

#### 2.5. Database'i Initialize Et

Database'e bağlanıp `backend/init-db.sql` dosyasını çalıştır:

```bash
# psql ile bağlan (Render'dan aldığın bilgilerle)
psql postgresql://username:password@hostname:port/database

# SQL dosyasını çalıştır
\i init-db.sql
```

### 3. Frontend Deployment (Vercel)

#### 3.1. Environment Variables Ayarla

Frontend klasöründe `.env.production` dosyası oluştur:

```
EXPO_PUBLIC_API_URL=https://your-backend-url.render.com
EXPO_PUBLIC_APP_NAME=Itera
EXPO_PUBLIC_APP_VERSION=1.0.0
```

#### 3.2. Vercel'e Deploy Et

1. [Vercel.com](https://vercel.com) hesabına giriş yap
2. "New Project" → GitHub repository'ni seç
3. Şu ayarları yap:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Environment Variables bölümüne `.env.production` içeriğini ekle

#### 3.3. Deploy Et

"Deploy" butonuna bas ve deployment'ın tamamlanmasını bekle.

## 🔧 Post-Deployment Ayarları

### Backend CORS Güncelleme

Backend'in environment variables'ında `CORS_ORIGIN`'i Vercel URL'inle güncelle:

```
CORS_ORIGIN=https://your-app-name.vercel.app
```

### Frontend API URL Güncelleme

Vercel dashboard'da environment variable'ı güncelle:

```
EXPO_PUBLIC_API_URL=https://your-backend-name.render.com
```

## 🧪 Test Etme

1. Frontend URL'ini ziyaret et
2. Kayıt ol / Giriş yap işlemlerini test et
3. Not ekleme/düzenleme işlemlerini test et
4. Tüm özellikler çalışıyor mu kontrol et

## 📊 Monitoring

### Backend Health Check

```
GET https://your-backend-name.render.com/health
```

### Frontend Erişim

```
https://your-app-name.vercel.app
```

## 🚨 Önemli Notlar

1. **Render Free Tier**: 30 gün sonra uyku moduna geçer
2. **Database**: 90 gün sonra silinir (ücretsiz plan)
3. **Vercel**: Build süreleri ve bandwidth limitleri var
4. **HTTPS**: Her iki platform da otomatik HTTPS sağlar

## 🔄 Güncelleme Süreci

### Backend Güncelleme

```bash
git add .
git commit -m "Backend update"
git push origin main
```

Render otomatik olarak yeniden deploy eder.

### Frontend Güncelleme

```bash
git add .
git commit -m "Frontend update"
git push origin main
```

Vercel otomatik olarak yeniden deploy eder.

## 🐛 Troubleshooting

### Backend Çalışmıyor

1. Render logs'ları kontrol et
2. Environment variables'ları kontrol et
3. Database bağlantısını test et

### Frontend Çalışmıyor

1. Vercel Function logs'ları kontrol et
2. API URL'ini kontrol et
3. CORS ayarlarını kontrol et

### Database Bağlantı Sorunu

1. Database URL'ini kontrol et
2. SSL ayarlarını kontrol et
3. Firewall kurallarını kontrol et

## 💡 Performans İpuçları

1. **Database Indexleri**: Production'da index'lerin oluşturulduğundan emin ol
2. **Caching**: Static dosyalar için CDN kullan
3. **Compression**: Backend'de gzip compression aktif et
4. **Monitoring**: Error tracking servisi ekle (Sentry vb.)

## 🎉 Deployment Tamamlandı!

Artık Itera uygulamanız canlıda! 🚀

### Sonraki Adımlar

- [ ] Domain name satın al (opsiyonel)
- [ ] SSL sertifikası kontrol et
- [ ] SEO optimizasyonlarını kontrol et
- [ ] Analytics ekle (Google Analytics vb.)
- [ ] Error monitoring ekle
- [ ] Backup stratejisi oluştur 