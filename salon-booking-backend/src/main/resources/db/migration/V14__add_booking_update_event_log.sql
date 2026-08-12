CREATE TABLE IF NOT EXISTS booking_updates (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL,
    target_role VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_booking_updates_booking_id ON booking_updates(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_updates_is_read ON booking_updates(is_read);

-- Try to drop old columns if they exist (PostgreSQL syntax supports IF EXISTS)
ALTER TABLE booking DROP COLUMN IF EXISTS admin_viewed;
ALTER TABLE booking DROP COLUMN IF EXISTS customer_viewed;
