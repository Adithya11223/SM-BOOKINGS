-- Clear all test data from the database to prepare for real users
-- This script deletes notifications, push tokens, booking items, bookings, and customers.
-- It preserves business_settings, services, and admin accounts.

DELETE FROM notification;
DELETE FROM fcm_token WHERE customer_id IS NOT NULL;
DELETE FROM booking_item;
DELETE FROM booking;
DELETE FROM customer;
