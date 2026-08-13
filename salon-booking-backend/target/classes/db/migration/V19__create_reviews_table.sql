CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES service(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_booking_service_review UNIQUE (booking_id, service_id)
);
