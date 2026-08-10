-- Create tables

CREATE TABLE business_settings (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    business_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    logo_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    phone_number VARCHAR(50),
    whatsapp_number VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    opening_time TIME,
    closing_time TIME,
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    description TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE service (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    business_settings_id UUID REFERENCES business_settings(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    image_url VARCHAR(255),
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE customer (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    notes TEXT,
    last_booking_date TIMESTAMP WITH TIME ZONE,
    total_bookings INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE booking (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    booking_number VARCHAR(255) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customer(id),
    booking_type VARCHAR(50) NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    total_duration INTEGER NOT NULL,
    notes TEXT,
    address VARCHAR(255),
    google_maps_link VARCHAR(255),
    event_type VARCHAR(255),
    people_count INTEGER
);

CREATE TABLE booking_item (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    booking_id UUID NOT NULL REFERENCES booking(id),
    service_id UUID REFERENCES service(id),
    service_name_snapshot VARCHAR(255) NOT NULL,
    price_snapshot DECIMAL(10, 2) NOT NULL,
    duration_snapshot INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE TABLE notification (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    booking_id UUID REFERENCES booking(id),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create Indexes
CREATE INDEX idx_booking_number ON booking(booking_number);
CREATE INDEX idx_booking_date ON booking(booking_date);
CREATE INDEX idx_booking_status ON booking(booking_status);
CREATE INDEX idx_customer_phone ON customer(phone_number);
CREATE INDEX idx_service_category ON service(category);
