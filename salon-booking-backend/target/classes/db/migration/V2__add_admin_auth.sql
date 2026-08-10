CREATE TABLE admin (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_ADMIN',
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insert a default admin account (password is 'password' encoded with BCrypt)
INSERT INTO admin (id, created_at, name, email, password, role, enabled)
VALUES (
    gen_random_uuid(), 
    CURRENT_TIMESTAMP, 
    'Super Admin', 
    'admin@salonbooking.com', 
    'password', 
    'ROLE_ADMIN', 
    TRUE
);
