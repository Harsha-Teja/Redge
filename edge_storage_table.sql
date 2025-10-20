-- Create edge storage interest table for ReDge Edge Storage page
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS edge_storage_interest (
    id BIGSERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    business_sector TEXT NOT NULL,
    location_city TEXT NOT NULL,
    current_storage_method TEXT NOT NULL,
    data_volume_tb TEXT NOT NULL,
    backup_challenge TEXT NOT NULL,
    interest_local_storage TEXT NOT NULL,
    primary_use_case TEXT NOT NULL,
    data_sovereignty_importance TEXT NOT NULL,
    preferred_contract_length TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    concerns TEXT[] DEFAULT '{}',
    comments TEXT,
    followup_consent BOOLEAN NOT NULL DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_created_at ON edge_storage_interest(created_at);
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_email ON edge_storage_interest(email);
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_business_sector ON edge_storage_interest(business_sector);
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_interest ON edge_storage_interest(interest_local_storage);

-- Enable Row Level Security (RLS)
ALTER TABLE edge_storage_interest ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public edge storage interest submissions" ON edge_storage_interest
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow reading edge storage interest submissions" ON edge_storage_interest
    FOR SELECT USING (true);

-- Add table comment
COMMENT ON TABLE edge_storage_interest IS 'Stores edge storage interest form submissions from the ReDge website';
