-- Create database (run this separately)
-- CREATE DATABASE itera_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    language VARCHAR(5) DEFAULT 'tr',
    theme VARCHAR(10) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    box_type VARCHAR(20) DEFAULT 'daily' CHECK (box_type IN ('daily', 'every_2_days', 'every_4_days', 'weekly', 'every_2_weeks', 'learned')),
    last_reviewed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (first_name, last_name, email, password) VALUES 
('Test', 'User', 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO notes (user_id, title, content, box_type) VALUES 
(1, 'JavaScript Temelleri', '# JavaScript Temelleri\n\n## Değişkenler\n- var, let, const\n- Scope kavramı\n\n## Fonksiyonlar\n- Function declaration\n- Arrow functions', 'daily'),
(1, 'React Hooks', '# React Hooks\n\n## useState\n```javascript\nconst [state, setState] = useState(initialValue);\n```\n\n## useEffect\n```javascript\nuseEffect(() => {\n  // effect\n}, [dependencies]);\n```', 'every_2_days'),
(1, 'PostgreSQL Queries', '# PostgreSQL Temel Sorgular\n\n## SELECT\n```sql\nSELECT * FROM table_name WHERE condition;\n```\n\n## JOIN\n```sql\nSELECT * FROM table1 t1\nJOIN table2 t2 ON t1.id = t2.table1_id;\n```', 'weekly'); 