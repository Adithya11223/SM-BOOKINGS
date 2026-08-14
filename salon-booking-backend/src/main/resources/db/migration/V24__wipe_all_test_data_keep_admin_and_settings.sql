-- V24: Wipe all test users, bookings, reviews, notifications, and FCM tokens.
-- Keeps admin login credentials and business settings (about section).

DELETE FROM reviews;
DELETE FROM booking_updates;
DELETE FROM booking_item;
DELETE FROM notification;
DELETE FROM booking;
DELETE FROM fcm_token;
DELETE FROM customer;
