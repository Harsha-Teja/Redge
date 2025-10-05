-- Supabase table schema for form submissions
-- Run this SQL in your Supabase SQL editor to create the table

CREATE TABLE IF NOT EXISTS form_submissions_customer (
    id BIGSERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT,
    eircode TEXT,
    sector TEXT,
    sector_other TEXT,
    workload_backup TEXT,
    workload_security TEXT,
    data_sovereignty TEXT,
    compliance TEXT,
    latency_tolerance TEXT,
    availability_tier TEXT,
    current_it_load TEXT,
    current_racks TEXT,
    current_density TEXT,
    growth_12_month TEXT,
    growth_24_month TEXT,
    growth_36_month TEXT,
    gpu_ai_share TEXT,
    storage_tb TEXT,
    storage_growth_rate TEXT,
    bandwidth_gbps TEXT,
    preferred_carriers TEXT,
    renewable_target TEXT,
    contract_term TEXT,
    data_centre_service TEXT,
    utilisation_ramp TEXT,
    earliest_service_date TEXT,
    mic_limit TEXT,
    existing_load TEXT,
    location TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on submitted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_customer_submitted_at ON form_submissions_customer(submitted_at);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_customer_email ON form_submissions_customer(email);

-- Enable Row Level Security (RLS)
ALTER TABLE form_submissions_customer ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (for form submissions)
CREATE POLICY "Allow public form submissions" ON form_submissions_customer
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows reading for authenticated users
-- You may want to restrict this further based on your needs
CREATE POLICY "Allow reading form submissions" ON form_submissions_customer
    FOR SELECT USING (true);

-- Add a comment to the table
COMMENT ON TABLE form_submissions_customer IS 'Stores contact lead form submissions from the ReDge website';
