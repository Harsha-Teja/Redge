/**
 * Sites page for ReDge - Data center sites and locations
 * Shows information about various data center sites across Ireland
 * Protected by passcode authentication
 * Displays contact-lead form submissions in a table format
 */
import { useState, useEffect } from 'react'
import { fetchFormSubmissions, fetchContactSubmissions } from '../lib/supabase.js'
import PasscodeProtection from '../components/PasscodeProtection.jsx'

function Sites()
{
    // State for managing form submissions data
    const [formSubmissions, setFormSubmissions] = useState([])
    const [contactSubmissions, setContactSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [contactLoading, setContactLoading] = useState(true)
    const [error, setError] = useState(null)
    const [contactError, setContactError] = useState(null)

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

    // Fetch form submissions when component mounts
    useEffect(() =>
    {
        fetchFormSubmissionsData()
        fetchContactSubmissionsData()
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