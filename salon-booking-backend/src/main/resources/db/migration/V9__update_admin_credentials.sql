CREATE EXTENSION IF NOT EXISTS pgcrypto;
UPDATE admin 
SET email = 'banjashalini@gmail.com', 
    password = crypt('adminbanjashalini@', gen_salt('bf', 10))
WHERE email = 'admin@salonbooking.com';
