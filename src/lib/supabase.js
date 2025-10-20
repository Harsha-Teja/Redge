/**
 * Supabase client configuration
 * Handles database connection and authentication for form submissions
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://hlmujxrgkpmlxljfvndk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbXVqeHJna3BtbHhsamZ2bmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODM3NDEsImV4cCI6MjA3NTE1OTc0MX0.PL-HKu_ldGVZ2CU0xa5o_2ktomAwnsREu70pKTM-jd8'

if (!supabaseUrl || !supabaseAnonKey)
{
    console.error('Missing Supabase environment variables')
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Submits form data to Supabase
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} - Result object with success status and data/error
 */
export const submitFormToSupabase = async (formData) =>
{
    try
    {
        console.log('Submitting form data to Supabase:', formData)

        const { data, error } = await supabase
            .from('form_submissions_customer')
            .insert([
                {
                    company_name: formData.companyName,
                    email: formData.email,
                    role: formData.role,
                    eircode: formData.eircode,
                    sector: formData.sector,
                    sector_other: formData.sectorOther,
                    workload_backup: formData.workloadBackup,
                    workload_security: formData.workloadSecurity,
                    data_sovereignty: formData.dataSovereignty,
                    compliance: formData.compliance,
                    latency_tolerance: formData.latencyTolerance,
                    availability_tier: formData.availabilityTier,
                    current_it_load: formData.currentITLoad,
                    current_racks: formData.currentRacks,
                    current_density: formData.currentDensity,
                    growth_12_month: formData.growth12Month,
                    growth_24_month: formData.growth24Month,
                    growth_36_month: formData.growth36Month,
                    gpu_ai_share: formData.gpuAIShare,
                    storage_tb: formData.storageTB,
                    storage_growth_rate: formData.storageGrowthRate,
                    bandwidth_gbps: formData.bandwidthGbps,
                    preferred_carriers: formData.preferredCarriers,
                    renewable_target: formData.renewableTarget,
                    contract_term: formData.contractTerm,
                    data_centre_service: formData.dataCentreService,
                    utilisation_ramp: formData.utilisationRamp,
                    earliest_service_date: formData.earliestServiceDate,
                    mic_limit: formData.micLimit,
                    existing_load: formData.existingLoad,
                    location: formData.location,
                    budget_range: formData.budgetRange,
                    commercial_model: formData.commercialModel,
                    backup_dr: formData.backupDR,
                    submitted_at: new Date().toISOString()
                }
            ])
            .select()

        if (error)
        {
            console.error('Supabase error:', error)
            return {
                success: false,
                error: error.message
            }
        }

        console.log('Form submitted successfully:', data)
        return {
            success: true,
            data: data[0]
        }

    } catch (error)
    {
        console.error('Error submitting form:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Fetches all form submissions from Supabase
 * @returns {Promise<Object>} - Result object with success status and submissions/error
 */
export const fetchFormSubmissions = async () =>
{
    try
    {
        console.log('Fetching form submissions from Supabase')

        const { data, error } = await supabase
            .from('form_submissions_customer')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (error)
        {
            console.error('Supabase error:', error)
            return {
                success: false,
                error: error.message,
                submissions: []
            }
        }

        console.log('Form submissions fetched successfully:', data)
        return {
            success: true,
            submissions: data
        }

    } catch (error)
    {
        console.error('Error fetching form submissions:', error)
        return {
            success: false,
            error: error.message,
            submissions: []
        }
    }
}

/**
 * Submits contact form data to Supabase
 * @param {Object} contactData - The contact form data to submit
 * @returns {Promise<Object>} - Result object with success status and data/error
 */
export const submitContactToSupabase = async (contactData) =>
{
    try
    {
        console.log('Submitting contact form data to Supabase:', contactData)

        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([
                {
                    name: contactData.name,
                    email: contactData.email,
                    message: contactData.message,
                    submitted_at: new Date().toISOString()
                }
            ])
            .select()

        if (error)
        {
            console.error('Supabase error:', error)
            return {
                success: false,
                error: error.message
            }
        }

        console.log('Contact form submitted successfully:', data)
        return {
            success: true,
            data: data[0]
        }

    } catch (error)
    {
        console.error('Error submitting contact form:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Fetches all contact form submissions from Supabase
 * @returns {Promise<Object>} - Result object with success status and submissions/error
 */
export const fetchContactSubmissions = async () =>
{
    try
    {
        console.log('Fetching contact form submissions from Supabase')

        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (error)
        {
            console.error('Supabase error:', error)
            return {
                success: false,
                error: error.message,
                submissions: []
            }
        }

        console.log('Contact form submissions fetched successfully:', data)
        return {
            success: true,
            submissions: data
        }

    } catch (error)
    {
        console.error('Error fetching contact form submissions:', error)
        return {
            success: false,
            error: error.message,
            submissions: []
        }
    }
}

