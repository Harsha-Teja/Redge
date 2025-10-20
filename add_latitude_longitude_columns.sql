-- Add missing latitude and longitude columns to existing edge_storage_interest table
-- Run this SQL in your Supabase SQL editor

-- Add latitude column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edge_storage_interest' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE edge_storage_interest 
        ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
END $$;

-- Add longitude column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edge_storage_interest' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE edge_storage_interest 
        ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edge_storage_interest' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE edge_storage_interest 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edge_storage_interest' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE edge_storage_interest 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_latitude ON edge_storage_interest(latitude);
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_longitude ON edge_storage_interest(longitude);
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_created_at ON edge_storage_interest(created_at);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'edge_storage_interest' 
ORDER BY ordinal_position;
