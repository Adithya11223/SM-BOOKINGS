-- Change logo_url, cover_image_url, and ad_image_url to TEXT to support Base64 string storage
ALTER TABLE business_settings ALTER COLUMN logo_url TYPE TEXT;
ALTER TABLE business_settings ALTER COLUMN cover_image_url TYPE TEXT;
ALTER TABLE business_settings ALTER COLUMN ad_image_url TYPE TEXT;
