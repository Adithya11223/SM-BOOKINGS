UPDATE users SET
  email = 'banjashalini@gmail.com',
  password = '$2a$10$wO/M2G0fX.Y0F3JkXJ9sH.t.q1U0s7Z6x8Y4a5b6c7d8e9f0g1h2i' -- wait, I need a BCrypt hash!
WHERE email = 'admin@salonbooking.com';
