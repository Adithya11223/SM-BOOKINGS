-- Change image_url from VARCHAR(255) to TEXT to support Base64 string storage
ALTER TABLE service ALTER COLUMN image_url TYPE TEXT;
