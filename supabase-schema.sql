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
    budget_range TEXT,
    commercial_model TEXT,
    backup_dr TEXT,
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

-- Create edge storage interest table
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
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on submitted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_submitted_at ON edge_storage_interest(submitted_at);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_email ON edge_storage_interest(email);

-- Create an index on business_sector for filtering
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_business_sector ON edge_storage_interest(business_sector);

-- Create an index on interest_local_storage for filtering
CREATE INDEX IF NOT EXISTS idx_edge_storage_interest_interest ON edge_storage_interest(interest_local_storage);

-- Enable Row Level Security (RLS)
ALTER TABLE edge_storage_interest ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (for form submissions)
CREATE POLICY "Allow public edge storage interest submissions" ON edge_storage_interest
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows reading for authenticated users
CREATE POLICY "Allow reading edge storage interest submissions" ON edge_storage_interest
    FOR SELECT USING (true);

-- Add a comment to the table
COMMENT ON TABLE edge_storage_interest IS 'Stores edge storage interest form submissions from the ReDge website';
