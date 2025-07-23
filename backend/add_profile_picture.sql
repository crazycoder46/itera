-- Add profile_picture column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);

-- Update existing users to have null profile_picture (default)
UPDATE users SET profile_picture = NULL WHERE profile_picture IS NULL; 