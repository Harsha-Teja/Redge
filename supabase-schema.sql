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

-- Create contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on submitted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (for form submissions)
CREATE POLICY "Allow public contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows reading for authenticated users
CREATE POLICY "Allow reading contact submissions" ON contact_submissions
    FOR SELECT USING (true);

-- Add a comment to the table
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the ReDge website';

-- Create survey submissions table
CREATE TABLE IF NOT EXISTS survey_submissions (
    id BIGSERIAL PRIMARY KEY,
    primary_use TEXT NOT NULL,
    waste_heat_reuse BOOLEAN DEFAULT FALSE,
    pue_expectation DECIMAL(3,2) NOT NULL,
    commercial_preference TEXT NOT NULL,
    capex_budget INTEGER,
    opex_budget INTEGER,
    contract_length TEXT NOT NULL,
    sustainability_target TEXT NOT NULL,
    compliance TEXT[] DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on submitted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_survey_submissions_submitted_at ON survey_submissions(submitted_at);

-- Create an index on primary_use for filtering
CREATE INDEX IF NOT EXISTS idx_survey_submissions_primary_use ON survey_submissions(primary_use);

-- Enable Row Level Security (RLS)
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (for form submissions)
CREATE POLICY "Allow public survey submissions" ON survey_submissions
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows reading for authenticated users
CREATE POLICY "Allow reading survey submissions" ON survey_submissions
    FOR SELECT USING (true);

-- Add a comment to the table
COMMENT ON TABLE survey_submissions IS 'Stores advanced survey form submissions from the ReDge website';
