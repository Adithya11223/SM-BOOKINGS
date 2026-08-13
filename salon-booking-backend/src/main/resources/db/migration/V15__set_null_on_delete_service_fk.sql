-- Drop any existing foreign key on booking_item.service_id and recreate with ON DELETE SET NULL
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'booking_item' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%service%'
    ) LOOP
        EXECUTE 'ALTER TABLE booking_item DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

ALTER TABLE booking_item 
    ADD CONSTRAINT fk_booking_item_service 
    FOREIGN KEY (service_id) 
    REFERENCES service(id) 
    ON DELETE SET NULL;
