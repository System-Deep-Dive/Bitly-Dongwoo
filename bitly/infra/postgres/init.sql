-- Bitly URL Database Initialization
-- This script creates 5,000,000 test URLs for performance testing

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

-- Create URL table (for baseline test)
CREATE TABLE IF NOT EXISTS url (
    id bigserial PRIMARY KEY,
    original_url text NOT NULL,
    short_url varchar(10) UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

-- Create Indexed URL table (for indexed test)
CREATE TABLE IF NOT EXISTS indexed_url (
    id bigserial PRIMARY KEY,
    original_url text NOT NULL,
    short_url varchar(10) UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

-- Create index for the indexed_url table
CREATE INDEX IF NOT EXISTS idx_indexed_short_url ON indexed_url(short_url);


-- Insert 5,000,000 test URLs into url table
INSERT INTO url (id, original_url, short_url)
SELECT
    id,
    'https://example.com/seed-data/' || id::text,
    base62_encode(id + 1)
FROM generate_series(0, 4999999) AS id
ON CONFLICT (id) DO NOTHING;

-- Insert 5,000,000 test URLs into indexed_url table
INSERT INTO indexed_url (id, original_url, short_url)
SELECT
    id,
    'https://example.com/seed-data/' || id::text,
    base62_encode(id + 1)
FROM generate_series(0, 4999999) AS id
ON CONFLICT (id) DO NOTHING;


-- Verify the data
SELECT COUNT(*) as total_urls FROM url;
SELECT COUNT(*) as total_indexed_urls FROM indexed_url;