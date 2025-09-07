-- Bitly URL Database Initialization
-- This script creates 100,000 test URLs for performance testing

-- Create Base62 encoding function
CREATE OR REPLACE FUNCTION base62_encode(value bigint) RETURNS text AS $$
DECLARE
    base62_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result text := '';
    val bigint := value;
    char_index integer;
BEGIN
    IF val = 0 THEN
        RETURN 'A';
    END IF;

    WHILE val > 0 LOOP
        char_index := (val % 62) + 1;
        result := substr(base62_chars, char_index, 1) || result;
        val := val / 62;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create URL table
CREATE TABLE IF NOT EXISTS url (
    id bigserial PRIMARY KEY,
    original_url text NOT NULL,
    short_url varchar(10) UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Insert 10,000 test URLs (0 to 9999)
INSERT INTO url (id, original_url, short_url)
SELECT
    id,
    'https://example.com/seed-data/' || id::text,
    base62_encode(id + 1)
FROM generate_series(0, 4999999) AS id
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT COUNT(*) as total_urls FROM url;
