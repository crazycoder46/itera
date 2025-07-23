# Itera - Leitner Sistemi Öğrenme Uygulaması

## Kurulum

### 1. PostgreSQL Kurulumu

1. https://www.postgresql.org/download/windows/ adresinden PostgreSQL'i indirin
2. Kurulum sırasında:
   - Şifre: `postgres` (veya istediğiniz şifre)
   - Port: `5432` (varsayılan)
3. pgAdmin açın ve yeni veritabanı oluşturun:
   - Veritabanı adı: `itera_db`


### 2. Veritabanı Şeması

```sql
-- backend/database.sql dosyasındaki SQL kodlarını çalıştırın
```

### 3. Backend Başlatma

```bash
cd backend
npm run dev
```

### 4. Frontend Başlatma (Web)

```bash
cd frontend
npm run web
```

## Test Kullanıcısı

- Email: `test@example.com`
- Şifre: `password`

## API Endpoints

- POST `/api/auth/register` - Kullanıcı kaydı
- POST `/api/auth/login` - Kullanıcı girişi
- GET `/api/notes` - Notları listele
- POST `/api/notes` - Yeni not oluştur
- PUT `/api/notes/:id` - Not güncelle
- DELETE `/api/notes/:id` - Not sil
- POST `/api/notes/:id/review` - Not tekrarı

## Proje Yapısı

```
itera/
├── backend/          # Node.js API
├── frontend/         # React Native (Expo) Web
└── prd.md           # Proje gereksinimleri
``` 