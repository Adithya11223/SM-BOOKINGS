-- V25: Wipe all test data post testing completion.
-- Preserves admin credentials and shop business settings/services.

DELETE FROM reviews;
DELETE FROM booking_updates;
DELETE FROM booking_item;
DELETE FROM notification;
DELETE FROM booking;
DELETE FROM fcm_token;
DELETE FROM customer;
