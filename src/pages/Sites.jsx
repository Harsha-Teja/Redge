/**
 * Sites page for ReDge - Data center sites and locations
 * Shows information about various data center sites across Ireland
 * Protected by passcode authentication
 * Displays contact-lead form submissions in a table format
 */
import { useState, useEffect } from 'react'
import { fetchFormSubmissions, fetchContactSubmissions, fetchSurveySubmissions } from '../lib/supabase.js'
import PasscodeProtection from '../components/PasscodeProtection.jsx'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons for different submission types
const createCustomIcon = (color) => new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
})

// County coordinates for Ireland
const COUNTY_COORDINATES = {
    'Dublin': [53.3498, -6.2603],
    'Cork': [51.8985, -8.4756],
    'Galway': [53.2707, -9.0568],
    'Limerick': [52.6638, -8.6267],
    'Waterford': [52.2593, -7.1101],
    'Wexford': [52.3369, -6.4633],
    'Wicklow': [53.1024, -6.0814],
    'Kildare': [53.1559, -6.9094],
    'Meath': [53.6546, -6.6564],
    'Louth': [53.9259, -6.4884],
    'Monaghan': [54.2489, -6.9680],
    'Cavan': [53.9908, -7.3616],
    'Longford': [53.7259, -7.7992],
    'Westmeath': [53.5345, -7.3396],
    'Offaly': [53.2734, -7.4888],
    'Laois': [53.0326, -7.3000],
    'Kilkenny': [52.6541, -7.2442],
    'Carlow': [52.8408, -6.9261],
    'Tipperary': [52.4738, -8.1619],
    'Clare': [52.8652, -8.9806],
    'Kerry': [52.2605, -9.6887],
    'Mayo': [53.7609, -9.1167],
    'Sligo': [54.2707, -8.4695],
    'Leitrim': [54.1169, -8.2000],
    'Roscommon': [53.6332, -8.1831],
    'Donegal': [54.6541, -8.1047]
}

function Sites()
{
    // State for managing form submissions data
    const [formSubmissions, setFormSubmissions] = useState([])
    const [contactSubmissions, setContactSubmissions] = useState([])
    const [surveySubmissions, setSurveySubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [contactLoading, setContactLoading] = useState(true)
    const [surveyLoading, setSurveyLoading] = useState(true)
    const [error, setError] = useState(null)
    const [contactError, setContactError] = useState(null)
    const [surveyError, setSurveyError] = useState(null)

    /**
     * Fetches contact-lead form submissions from Supabase
     * This function retrieves all form submissions from the database
     */
    const fetchFormSubmissionsData = async () =>
    {
        try
        {
            setLoading(true)
            setError(null)

            console.log('Fetching form submissions from Supabase...')
            const result = await fetchFormSubmissions()

            if (result.success)
            {
                console.log('Form submissions fetched successfully:', result.submissions)
                setFormSubmissions(result.submissions || [])
            } else
            {
                console.error('Error fetching form submissions:', result.error)
                setError(`Failed to load form submissions: ${result.error}`)
            }
        } catch (err)
        {
            console.error('Error fetching form submissions:', err)
            setError(`Failed to load form submissions: ${err.message}`)
        } finally
        {
            setLoading(false)
        }
    }

    /**
     * Fetches contact form submissions from Supabase
     * This function retrieves all contact form submissions from the database
     */
    const fetchContactSubmissionsData = async () =>
    {
        try
        {
            setContactLoading(true)
            setContactError(null)

            console.log('Fetching contact submissions from Supabase...')
            const result = await fetchContactSubmissions()

            if (result.success)
            {
                console.log('Contact submissions fetched successfully:', result.submissions)
                setContactSubmissions(result.submissions || [])
            } else
            {
                console.error('Error fetching contact submissions:', result.error)
                setContactError(`Failed to load contact submissions: ${result.error}`)
            }
        } catch (err)
        {
            console.error('Error fetching contact submissions:', err)
            setContactError(`Failed to load contact submissions: ${err.message}`)
        } finally
        {
            setContactLoading(false)
        }
    }

    /**
     * Fetches survey form submissions from Supabase
     * This function retrieves all survey form submissions from the database
     */
    const fetchSurveySubmissionsData = async () =>
    {
        try
        {
            setSurveyLoading(true)
            setSurveyError(null)

            console.log('Fetching survey submissions from Supabase...')
            const result = await fetchSurveySubmissions()

            if (result.success)
            {
                console.log('Survey submissions fetched successfully:', result.submissions)
                setSurveySubmissions(result.submissions || [])
            } else
            {
                console.error('Error fetching survey submissions:', result.error)
                setSurveyError(`Failed to load survey submissions: ${result.error}`)
            }
        } catch (err)
        {
            console.error('Error fetching survey submissions:', err)
            setSurveyError(`Failed to load survey submissions: ${err.message}`)
        } finally
        {
            setSurveyLoading(false)
        }
    }

    // Fetch form submissions when component mounts
    useEffect(() =>
    {
        fetchFormSubmissionsData()
        fetchContactSubmissionsData()
        fetchSurveySubmissionsData()
    }, [])

    /**
     * Formats a date string to a readable format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    const formatDate = (dateString) =>
    {
        return new Date(dateString).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    /**
     * Process submissions to create map markers with clustering
     * @returns {Array} Array of map markers with coordinates and submission data
     */
    const processSubmissionsForMap = () =>
    {
        const mapData = []

        // Process customer lead submissions
        formSubmissions.forEach((submission, index) =>
        {
            const location = submission.location || submission.eircode || 'Dublin'
            const county = extractCountyFromLocation(location)
            const coordinates = COUNTY_COORDINATES[county] || COUNTY_COORDINATES['Dublin']

            mapData.push({
                id: `customer-${submission.id}`,
                type: 'customer',
                coordinates,
                county,
                submission,
                color: '#3B82F6' // Blue for customer leads
            })
        })

        // Process contact submissions
        contactSubmissions.forEach((submission, index) =>
        {
            const location = 'Dublin' // Contact form doesn't have location, default to Dublin
            const county = 'Dublin'
            const coordinates = COUNTY_COORDINATES[county]

            mapData.push({
                id: `contact-${submission.id}`,
                type: 'contact',
                coordinates,
                county,
                submission,
                color: '#10B981' // Green for contact forms
            })
        })

        // Process survey submissions
        surveySubmissions.forEach((submission, index) =>
        {
            const location = 'Dublin' // Survey form doesn't have location, default to Dublin
            const county = 'Dublin'
            const coordinates = COUNTY_COORDINATES[county]

            mapData.push({
                id: `survey-${submission.id}`,
                type: 'survey',
                coordinates,
                county,
                submission,
                color: '#8B5CF6' // Purple for surveys
            })
        })

        // Cluster submissions by county
        const clusteredData = clusterSubmissionsByCounty(mapData)
        return clusteredData
    }

    /**
     * Extract county from location string
     * @param {string} location - Location string
     * @returns {string} County name
     */
    const extractCountyFromLocation = (location) =>
    {
        if (!location) return 'Dublin'

        const locationLower = location.toLowerCase()
        for (const county of Object.keys(COUNTY_COORDINATES))
        {
            if (locationLower.includes(county.toLowerCase()))
            {
                return county
            }
        }
        return 'Dublin' // Default to Dublin
    }

    /**
     * Cluster submissions by county
     * @param {Array} submissions - Array of submission data
     * @returns {Array} Clustered submission data
     */
    const clusterSubmissionsByCounty = (submissions) =>
    {
        const countyMap = new Map()

        submissions.forEach(submission =>
        {
            const key = `${submission.coordinates[0]},${submission.coordinates[1]}`
            if (!countyMap.has(key))
            {
                countyMap.set(key, {
                    coordinates: submission.coordinates,
                    county: submission.county,
                    submissions: [],
                    totalCount: 0,
                    customerCount: 0,
                    contactCount: 0,
                    surveyCount: 0
                })
            }

            const cluster = countyMap.get(key)
            cluster.submissions.push(submission)
            cluster.totalCount++

            if (submission.type === 'customer') cluster.customerCount++
            if (submission.type === 'contact') cluster.contactCount++
            if (submission.type === 'survey') cluster.surveyCount++
        })

        return Array.from(countyMap.values())
    }

    /**
     * Map bounds component to fit all of Ireland
     */
    const MapBounds = () =>
    {
        const map = useMap()

        useEffect(() =>
        {
            // Ireland bounds: [North, West, South, East]
            const irelandBounds = [
                [55.4, -10.5], // Southwest
                [55.4, -5.5],  // Southeast  
                [51.4, -5.5],  // Northeast
                [51.4, -10.5]  // Northwest
            ]

            // Fit the map to show all of Ireland with some padding
            map.fitBounds(irelandBounds, { padding: [20, 20] })
        }, [map])

        return null
    }

    return (
        <PasscodeProtection
            correctPasscode="harsha@esb.ie"
            title="Sites Access Required"
            subtitle="Please enter the passcode to view our data center sites information"
        >
            <main className="pt-20">
                <div className="py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Data Center Sites
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Explore our network of modular data center sites across Ireland, designed for optimal performance and sustainability.
                            </p>
                        </div>

                        {/* Map Visualization */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Submission Locations</h2>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Customer Leads</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Contact Forms</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span>Surveys</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-96 rounded-lg overflow-hidden">
                                <MapContainer
                                    center={[53.4, -8.0]}
                                    zoom={6}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <MapBounds />

                                    {processSubmissionsForMap().map((cluster) => (
                                        <Marker
                                            key={`cluster-${cluster.coordinates[0]}-${cluster.coordinates[1]}`}
                                            position={[cluster.coordinates[0], cluster.coordinates[1]]}
                                            icon={createCustomIcon(cluster.totalCount > 1 ? '#EF4444' : '#3B82F6')}
                                        >
                                            <Popup>
                                                <div className="p-2">
                                                    <h3 className="font-semibold text-lg mb-2">{cluster.county}</h3>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600">Customer Leads:</span>
                                                            <span className="font-medium">{cluster.customerCount}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-green-600">Contact Forms:</span>
                                                            <span className="font-medium">{cluster.contactCount}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-purple-600">Surveys:</span>
                                                            <span className="font-medium">{cluster.surveyCount}</span>
                                                        </div>
                                                        <div className="border-t pt-1 mt-2">
                                                            <div className="flex justify-between font-semibold">
                                                                <span>Total:</span>
                                                                <span>{cluster.totalCount}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-blue-900">Customer Leads</h4>
                                            <p className="text-blue-700 text-sm">Detailed form submissions</p>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">{formSubmissions.length}</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-green-900">Contact Forms</h4>
                                            <p className="text-green-700 text-sm">General inquiries</p>
                                        </div>
                                        <span className="text-2xl font-bold text-green-600">{contactSubmissions.length}</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-purple-900">Surveys</h4>
                                            <p className="text-purple-700 text-sm">Advanced surveys</p>
                                        </div>
                                        <span className="text-2xl font-bold text-purple-600">{surveySubmissions.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Submissions Tables */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Form Submissions</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={fetchFormSubmissionsData}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Refresh Customer Leads
                                    </button>
                                    <button
                                        onClick={fetchContactSubmissionsData}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        Refresh Contact Forms
                                    </button>
                                    <button
                                        onClick={fetchSurveySubmissionsData}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                    >
                                        Refresh Surveys
                                    </button>
                                </div>
                            </div>

                            {/* Customer Lead Form Submissions */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lead Submissions</h3>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading form submissions...</span>
                                    </div>
                                ) : error ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                        <p className="text-red-600">{error}</p>
                                        <button
                                            onClick={fetchFormSubmissionsData}
                                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : formSubmissions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No customer lead submissions found.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Company
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Contact
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Sector
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Location
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        IT Load
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Racks
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Density
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Growth 12M
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Growth 24M
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Growth 36M
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        GPU/AI
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Storage
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Storage Growth Rate
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Bandwidth
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Preferred Carriers
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Contract
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Data Centre Service
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Utilisation Ramp
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Sovereignty
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Compliance
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Latency
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Availability
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Renewable
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Earliest Service Date
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        MIC Limit
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Existing Load
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Submitted
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {formSubmissions.map((submission) => (
                                                    <tr key={submission.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {submission.company_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {submission.role}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {submission.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {submission.sector}
                                                            </span>
                                                            {submission.sector_other && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {submission.sector_other}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.eircode}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.current_it_load} kW
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.current_racks}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.current_density} kW/rack
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.growth_12_month}%
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.growth_24_month}%
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.growth_36_month}%
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.gpu_ai_share}%
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.storage_tb} TB
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.storage_growth_rate}%
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.bandwidth_gbps} Gbps
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.preferred_carriers}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.contract_term}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.data_centre_service}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.utilisation_ramp}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${submission.data_sovereignty === 'Yes'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {submission.data_sovereignty}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.compliance}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.latency_tolerance}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.availability_tier}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.renewable_target}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.earliest_service_date}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.mic_limit}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.existing_load}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(submission.submitted_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Contact Form Submissions */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Form Submissions</h3>
                                {contactLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                        <span className="ml-3 text-gray-600">Loading contact submissions...</span>
                                    </div>
                                ) : contactError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                        <p className="text-red-600">{contactError}</p>
                                        <button
                                            onClick={fetchContactSubmissionsData}
                                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : contactSubmissions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No contact form submissions found.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Message
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Submitted
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {contactSubmissions.map((submission) => (
                                                    <tr key={submission.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {submission.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {submission.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={submission.message}>
                                                                {submission.message}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(submission.submitted_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Survey Form Submissions */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Form Submissions</h3>
                                {surveyLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-3 text-gray-600">Loading survey submissions...</span>
                                    </div>
                                ) : surveyError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                        <p className="text-red-600">{surveyError}</p>
                                        <button
                                            onClick={fetchSurveySubmissionsData}
                                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : surveySubmissions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No survey form submissions found.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Primary Use
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        PUE Expectation
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Commercial Preference
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Budget (€)
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Contract Length
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Sustainability
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Compliance
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Waste Heat
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Submitted
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {surveySubmissions.map((submission) => (
                                                    <tr key={submission.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {submission.primary_use}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.pue_expectation}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.commercial_preference}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.capex_budget && (
                                                                <div className="text-xs">
                                                                    <div>CapEx: €{submission.capex_budget.toLocaleString()}</div>
                                                                    {submission.opex_budget && (
                                                                        <div>OpEx: €{submission.opex_budget.toLocaleString()}/mo</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.contract_length}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {submission.sustainability_target}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-wrap gap-1">
                                                                {submission.compliance.map((item, index) => (
                                                                    <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${submission.waste_heat_reuse
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {submission.waste_heat_reuse ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(submission.submitted_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sites Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {/* Site 1 */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Dublin North</h3>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        Active
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Location:</strong> Dublin, Ireland</p>
                                    <p><strong>Capacity:</strong> 2.5 MW</p>
                                    <p><strong>Status:</strong> Operational</p>
                                    <p><strong>PUE:</strong> 1.3</p>
                                    <p><strong>Established:</strong> 2023</p>
                                </div>
                            </div>

                            {/* Site 2 */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Cork South</h3>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                        Planning
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Location:</strong> Cork, Ireland</p>
                                    <p><strong>Capacity:</strong> 1.8 MW</p>
                                    <p><strong>Status:</strong> In Development</p>
                                    <p><strong>PUE:</strong> 1.2 (Target)</p>
                                    <p><strong>Expected:</strong> Q2 2024</p>
                                </div>
                            </div>

                            {/* Site 3 */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Galway West</h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        Design
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Location:</strong> Galway, Ireland</p>
                                    <p><strong>Capacity:</strong> 1.2 MW</p>
                                    <p><strong>Status:</strong> Design Phase</p>
                                    <p><strong>PUE:</strong> 1.1 (Target)</p>
                                    <p><strong>Expected:</strong> Q4 2024</p>
                                </div>
                            </div>

                            {/* Site 4 */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Limerick Central</h3>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                                        Proposed
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Location:</strong> Limerick, Ireland</p>
                                    <p><strong>Capacity:</strong> 0.8 MW</p>
                                    <p><strong>Status:</strong> Feasibility Study</p>
                                    <p><strong>PUE:</strong> 1.0 (Target)</p>
                                    <p><strong>Expected:</strong> 2025</p>
                                </div>
                            </div>

                            {/* Site 5 */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Waterford East</h3>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                        Research
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Location:</strong> Waterford, Ireland</p>
                                    <p><strong>Capacity:</strong> 0.5 MW</p>
                                    <p><strong>Status:</strong> Research Phase</p>
                                    <p><strong>PUE:</strong> 0.9 (Target)</p>
                                    <p><strong>Expected:</strong> 2026</p>
                                </div>
                            </div>

                            {/* Site 6 */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Belfast North</h3>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                                        Partnership
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Location:</strong> Belfast, Northern Ireland</p>
                                    <p><strong>Capacity:</strong> 1.5 MW</p>
                                    <p><strong>Status:</strong> Partnership Discussion</p>
                                    <p><strong>PUE:</strong> 1.4 (Estimate)</p>
                                    <p><strong>Expected:</strong> TBD</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Site Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
                                    <div className="text-gray-600">Total Sites</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">8.3 MW</div>
                                    <div className="text-gray-600">Total Capacity</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-600 mb-2">1</div>
                                    <div className="text-gray-600">Operational</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
                                    <div className="text-gray-600">In Development</div>
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Modular design for scalability
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Renewable energy integration
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Edge computing capabilities
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Low latency connectivity
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sustainability Goals</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Carbon Neutral</span>
                                            <span>2025</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>100% Renewable</span>
                                            <span>2026</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>PUE &lt; 1.2</span>
                                            <span>2024</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-lg p-8 text-white text-center">
                            <h3 className="text-2xl font-bold mb-4">Interested in Our Sites?</h3>
                            <p className="text-lg mb-6 opacity-90">
                                Learn more about our modular data center solutions and how they can benefit your organization.
                            </p>
                            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                Contact Our Team
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PasscodeProtection>
    )
}

export default Sites