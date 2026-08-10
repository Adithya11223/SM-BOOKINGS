-- V4__enhance_notifications.sql

-- Add receiver_type and receiver_id to existing notification table
ALTER TABLE notification 
ADD COLUMN receiver_type VARCHAR(50) DEFAULT 'CUSTOMER',
ADD COLUMN receiver_id UUID,
ADD COLUMN service_id UUID,
ADD COLUMN read_at TIMESTAMP;

-- Create fcm_token table
CREATE TABLE fcm_token (
    id UUID PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    device_id VARCHAR(255) NOT NULL,
    admin_id UUID,
    customer_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Optional: Add foreign keys if strict integrity is desired, but since customer might be anonymous initially, we can leave customer_id unconstrained or constrained to customer table if we store anonymous customers.
-- For now, we will leave admin_id and customer_id without strict FK constraints to allow flexibility, or we can add them.
ALTER TABLE fcm_token
ADD CONSTRAINT fk_fcm_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE;

-- No foreign key on customer_id, as we might use device_id for anonymous customers, or store actual customer UUIDs when they book.
