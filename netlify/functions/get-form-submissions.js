/**
 * Netlify Function to fetch contact-lead form submissions
 * This function retrieves form submissions from Netlify Forms API
 * Requires NETLIFY_ACCESS_TOKEN environment variable to be set
 */

const fetch = require('node-fetch')

exports.handler = async (event, context) =>
{
    console.log('Function called with method:', event.httpMethod)
    console.log('Event path:', event.path)

    // Set CORS headers for cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    }

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS')
    {
        return {
            statusCode: 200,
            headers,
            body: ''
        }
    }

    // Only handle GET requests
    if (event.httpMethod !== 'GET')
    {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method not allowed',
                submissions: []
            })
        }
    }

    try
    {
        console.log('Starting to fetch form submissions...')

        // Get the access token from environment variables
        const accessToken = process.env.NETLIFY_ACCESS_TOKEN || 'nfp_fEEMcuTnPzw27emaiAtDSBr7hZxx1LUKdfe6'
        const siteId = process.env.NETLIFY_SITE_ID || 'ce984a42-28e8-4165-a600-f3558f4dee4a'

        console.log('Using site ID:', siteId)
        console.log('Access token present:', !!accessToken)

        // First, let's check what forms are available for this site
        console.log('Checking available forms for site:', siteId)
        const formsResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!formsResponse.ok)
        {
            const errorText = await formsResponse.text()
            console.error('Forms API error response:', errorText)
            throw new Error(`Failed to fetch forms list: ${formsResponse.status} ${formsResponse.statusText}`)
        }

        const formsData = await formsResponse.json()
        console.log('Available forms:', formsData)
        console.log('Number of forms found:', formsData.length)

        // Find the correct form name
        const targetForm = formsData.find(form =>
            form.name === 'customer-lead' ||
            form.name === 'contact-lead' ||
            form.name.includes('lead') ||
            form.name.includes('contact')
        )

        if (!targetForm)
        {
            console.log('No matching form found. Available forms:', formsData.map(f => f.name))
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    submissions: [],
                    count: 0,
                    message: 'No matching form found',
                    availableForms: formsData.map(f => f.name),
                    debugInfo: {
                        totalForms: formsData.length,
                        searchedFor: ['customer-lead', 'contact-lead', 'forms containing "lead" or "contact"']
                    }
                })
            }
        }

        console.log('Using form:', targetForm.name, 'with ID:', targetForm.id)
        console.log('Form details:', {
            name: targetForm.name,
            id: targetForm.id,
            submission_count: targetForm.submission_count,
            created_at: targetForm.created_at
        })

        // Fetch form submissions from Netlify Forms API
        console.log('Fetching from API:', `https://api.netlify.com/api/v1/sites/${siteId}/forms/${targetForm.id}/submissions`)
        const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms/${targetForm.id}/submissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        console.log('API response status:', response.status)
        console.log('API response ok:', response.ok)

        if (!response.ok)
        {
            const errorText = await response.text()
            console.error('API error response:', errorText)
            throw new Error(`Netlify API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('API response data:', data)
        console.log('Number of submissions found:', data.length)

        // Transform the data to match our expected format
        const submissions = data.map((submission, index) => ({
            id: submission.id || index + 1,
            companyName: submission.data.companyName || 'N/A',
            email: submission.data.email || 'N/A',
            role: submission.data.role || 'N/A',
            sector: submission.data.sector || 'N/A',
            location: submission.data.location || 'N/A',
            dataSovereignty: submission.data.dataSovereignty || 'N/A',
            compliance: submission.data.compliance || 'N/A',
            currentITLoad: submission.data.currentITLoad || 'N/A',
            contractTerm: submission.data.contractTerm || 'N/A',
            submittedAt: submission.created_at || new Date().toISOString()
        }))

        console.log('Transformed submissions:', submissions)

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                submissions,
                count: submissions.length
            })
        }

    } catch (error)
    {
        console.error('Error in function:', error)

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Function error',
                message: error.message,
                submissions: []
            })
        }
    }
}