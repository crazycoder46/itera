-- Veritabanı düzeltme script'i
-- Mevcut notların next_review_date değerlerini güncelle

UPDATE notes SET next_review_date = CURRENT_DATE WHERE box_type = 'daily';
UPDATE notes SET next_review_date = CURRENT_DATE + INTERVAL '2 days' WHERE box_type = 'every_2_days';
UPDATE notes SET next_review_date = CURRENT_DATE + INTERVAL '4 days' WHERE box_type = 'every_4_days';
UPDATE notes SET next_review_date = CURRENT_DATE + INTERVAL '7 days' WHERE box_type = 'weekly';
UPDATE notes SET next_review_date = CURRENT_DATE + INTERVAL '14 days' WHERE box_type = 'every_2_weeks';
UPDATE notes SET next_review_date = NULL WHERE box_type = 'learned';

-- Kontrol için notları listele
SELECT id, title, box_type, next_review_date, created_at FROM notes ORDER BY id; 