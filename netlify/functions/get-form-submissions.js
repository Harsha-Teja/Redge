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

        // Fetch form submissions from Netlify Forms API
        console.log('Fetching from API:', `https://api.netlify.com/api/v1/sites/${siteId}/forms/customer-lead/submissions`)
        const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms/customer-lead/submissions`, {
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