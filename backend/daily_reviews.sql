-- Daily review completion tracking table
CREATE TABLE daily_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, review_date)
);

-- Index for faster queries
CREATE INDEX idx_daily_reviews_user_date ON daily_reviews(user_id, review_date); 