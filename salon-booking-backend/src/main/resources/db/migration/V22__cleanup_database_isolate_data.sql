-- V22: Clean database to keep only admin & services, delete all test users and bookings, and enforce data isolation indexes

DELETE FROM reviews;
DELETE FROM booking_update;
DELETE FROM booking_item;
DELETE FROM notification;
DELETE FROM booking;
DELETE FROM fcm_token WHERE receiver_type = 'CUSTOMER' OR customer_id IS NOT NULL;
DELETE FROM customer;

-- Enforce database isolation indexes
CREATE INDEX IF NOT EXISTS idx_booking_customer_id ON booking(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_fcm_token_customer_id ON fcm_token(customer_id);
CREATE INDEX IF NOT EXISTS idx_notification_receiver ON notification(receiver_id, receiver_type);
