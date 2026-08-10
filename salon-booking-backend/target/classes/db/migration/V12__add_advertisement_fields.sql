-- Add Advertisement fields to Business Settings
ALTER TABLE business_settings ADD COLUMN ad_image_url TEXT;
ALTER TABLE business_settings ADD COLUMN ad_created_at TIMESTAMP WITH TIME ZONE;
