/**
 * Analysis.jsx
 * 
 * Edge Storage Analysis page for ReDge - Comprehensive data visualization dashboard
 * Displays edge storage interest data with interactive charts and tables
 * Protected by passcode authentication
 */

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import
{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js'
import { Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2'
import PasscodeProtection from '../components/PasscodeProtection.jsx'
import { fetchEdgeStorageSubmissions } from '../lib/supabase.js'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
)

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Chart color schemes
const COLORS = {
    primary: '#005CAB',
    secondary: '#009B77',
    accent: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6'
}

const CHART_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    COLORS.success,
    COLORS.warning,
    COLORS.danger,
    COLORS.info,
    COLORS.purple
]

export default function Analysis()
{
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load edge storage submissions
    useEffect(() =>
    {
        const loadSubmissions = async () =>
        {
            try
            {
                setLoading(true)
                const result = await fetchEdgeStorageSubmissions()
                if (result.success)
                {
                    setSubmissions(result.submissions)
                } else
                {
                    setError(result.error)
                }
            } catch (err)
            {
                setError(err.message)
            } finally
            {
                setLoading(false)
            }
        }

        loadSubmissions()
    }, [])

    // Process data for charts
    const processChartData = () =>
    {
        if (!submissions.length) return {}

        // 1. Sector vs Data Volume
        const sectorVolumeData = {}
        submissions.forEach(sub =>
        {
            if (!sectorVolumeData[sub.business_sector])
            {
                sectorVolumeData[sub.business_sector] = {}
            }
            if (!sectorVolumeData[sub.business_sector][sub.data_volume_tb])
            {
                sectorVolumeData[sub.business_sector][sub.data_volume_tb] = 0
            }
            sectorVolumeData[sub.business_sector][sub.data_volume_tb]++
        })

        // 2. Interest Level
        const interestData = {}
        submissions.forEach(sub =>
        {
            interestData[sub.interest_local_storage] = (interestData[sub.interest_local_storage] || 0) + 1
        })

        // 3. Primary Use Case
        const useCaseData = {}
        submissions.forEach(sub =>
        {
            useCaseData[sub.primary_use_case] = (useCaseData[sub.primary_use_case] || 0) + 1
        })

        // 4. Data Sovereignty Importance
        const sovereigntyData = {}
        submissions.forEach(sub =>
        {
            sovereigntyData[sub.data_sovereignty_importance] = (sovereigntyData[sub.data_sovereignty_importance] || 0) + 1
        })

        // 5. Budget vs Data Volume (for scatter plot)
        const budgetVolumeData = submissions.map(sub => ({
            x: getDataVolumeNumeric(sub.data_volume_tb),
            y: getBudgetNumeric(sub.budget_range),
            sector: sub.business_sector,
            company: sub.company_name
        }))

        // 6. Backup Challenge
        const challengeData = {}
        submissions.forEach(sub =>
        {
            challengeData[sub.backup_challenge] = (challengeData[sub.backup_challenge] || 0) + 1
        })

        // 7. Geographic data
        const geoData = {}
        submissions.forEach(sub =>
        {
            if (sub.location_city)
            {
                if (!geoData[sub.location_city])
                {
                    geoData[sub.location_city] = { total: 0, interested: 0 }
                }
                geoData[sub.location_city].total++
                if (sub.interest_local_storage === 'Yes')
                {
                    geoData[sub.location_city].interested++
                }
            }
        })

        // 8. Contract Term
        const contractData = {}
        submissions.forEach(sub =>
        {
            contractData[sub.preferred_contract_length] = (contractData[sub.preferred_contract_length] || 0) + 1
        })

        return {
            sectorVolumeData,
            interestData,
            useCaseData,
            sovereigntyData,
            budgetVolumeData,
            challengeData,
            geoData,
            contractData
        }
    }

    // Helper functions
    const getDataVolumeNumeric = (volume) =>
    {
        const volumeMap = {
            '<10 TB': 5,
            '10–50 TB': 30,
            '50–100 TB': 75,
            '>100 TB': 150
        }
        return volumeMap[volume] || 0
    }

    const getBudgetNumeric = (budget) =>
    {
        const budgetMap = {
            '<€1k/month': 0.5,
            '€1–5k': 3,
            '€5–10k': 7.5,
            '>€10k': 15
        }
        return budgetMap[budget] || 0
    }

    const chartData = processChartData()

    // Chart configurations
    const sectorVolumeConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(chartData.sectorVolumeData || {}),
            datasets: Object.keys(chartData.sectorVolumeData || {}).map((sector, index) => ({
                label: sector,
                data: Object.values(chartData.sectorVolumeData[sector] || {}),
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                borderColor: CHART_COLORS[index % CHART_COLORS.length],
                borderWidth: 1
            }))
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sector vs Data Volume Distribution'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Business Sector'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Number of Companies'
                    }
                }
            }
        }
    }

    const interestConfig = {
        type: 'pie',
        data: {
            labels: Object.keys(chartData.interestData || {}),
            datasets: [{
                data: Object.values(chartData.interestData || {}),
                backgroundColor: [COLORS.success, COLORS.warning, COLORS.danger],
                borderColor: [COLORS.success, COLORS.warning, COLORS.danger],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Interest Level in Local Storage'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    }

    const useCaseConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(chartData.useCaseData || {}),
            datasets: [{
                label: 'Number of Companies',
                data: Object.values(chartData.useCaseData || {}),
                backgroundColor: CHART_COLORS[0],
                borderColor: CHART_COLORS[0],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Primary Use Case Breakdown'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Companies'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Use Case'
                    }
                }
            }
        }
    }

    const sovereigntyConfig = {
        type: 'doughnut',
        data: {
            labels: Object.keys(chartData.sovereigntyData || {}),
            datasets: [{
                data: Object.values(chartData.sovereigntyData || {}),
                backgroundColor: [COLORS.danger, COLORS.warning, COLORS.success],
                borderColor: [COLORS.danger, COLORS.warning, COLORS.success],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Data Sovereignty Importance'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    }

    const budgetVolumeConfig = {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Budget vs Data Volume',
                data: chartData.budgetVolumeData || [],
                backgroundColor: CHART_COLORS[0],
                borderColor: CHART_COLORS[0],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Estimated Budget vs Data Volume'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data Volume (TB)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Budget (€k/month)'
                    }
                }
            }
        }
    }

    const challengeConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(chartData.challengeData || {}),
            datasets: [{
                label: 'Number of Companies',
                data: Object.values(chartData.challengeData || {}),
                backgroundColor: CHART_COLORS[1],
                borderColor: CHART_COLORS[1],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Backup/DR Challenge Awareness'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Response'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Companies'
                    }
                }
            }
        }
    }

    const contractConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(chartData.contractData || {}),
            datasets: [{
                label: 'Number of Companies',
                data: Object.values(chartData.contractData || {}),
                backgroundColor: CHART_COLORS[2],
                borderColor: CHART_COLORS[2],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Preferred Contract Term Distribution'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Contract Length'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Companies'
                    }
                }
            }
        }
    }

    if (loading)
    {
        return (
            <PasscodeProtection
                title="Edge Storage Analysis Access Required"
                description="Please enter the passcode to access the edge storage analysis dashboard."
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esbBlue mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analysis data...</p>
                    </div>
                </div>
            </PasscodeProtection>
        )
    }

    if (error)
    {
        return (
            <PasscodeProtection
                title="Edge Storage Analysis Access Required"
                description="Please enter the passcode to access the edge storage analysis dashboard."
            >
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </PasscodeProtection>
        )
    }

    return (
        <PasscodeProtection
            title="Edge Storage Analysis Access Required"
            description="Please enter the passcode to access the edge storage analysis dashboard."
        >
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edge Storage Analysis</h1>
                        <p className="text-gray-600">
                            Comprehensive analysis of edge storage interest data with {submissions.length} submissions
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Data Table */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edge Storage Interest Submissions</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Volume</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Use Case</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map((submission, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {submission.company_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.contact_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.business_sector}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.location_city}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.data_volume_tb}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${submission.interest_local_storage === 'Yes' ? 'bg-green-100 text-green-800' :
                                                    submission.interest_local_storage === 'Maybe' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {submission.interest_local_storage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.primary_use_case}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.budget_range}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.preferred_contract_length}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Sector vs Data Volume */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Bar {...sectorVolumeConfig} />
                        </div>

                        {/* Interest Level */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Pie {...interestConfig} />
                        </div>

                        {/* Primary Use Case */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Bar {...useCaseConfig} />
                        </div>

                        {/* Data Sovereignty */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Doughnut {...sovereigntyConfig} />
                        </div>

                        {/* Budget vs Data Volume */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Scatter {...budgetVolumeConfig} />
                        </div>

                        {/* Backup Challenge */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Bar {...challengeConfig} />
                        </div>

                        {/* Contract Terms */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <Bar {...contractConfig} />
                        </div>

                        {/* Geographic Heat Map */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution of Interest</h3>
                            <div className="h-64 rounded-lg overflow-hidden">
                                <MapContainer
                                    center={[53.4129, -8.2439]}
                                    zoom={7}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {submissions.map((submission, index) =>
                                    {
                                        if (submission.latitude && submission.longitude)
                                        {
                                            const isInterested = submission.interest_local_storage === 'Yes'
                                            return (
                                                <Marker
                                                    key={index}
                                                    position={[parseFloat(submission.latitude), parseFloat(submission.longitude)]}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h4 className="font-semibold text-gray-900">{submission.company_name}</h4>
                                                            <p className="text-sm text-gray-600">{submission.location_city}</p>
                                                            <p className="text-sm text-gray-600">{submission.business_sector}</p>
                                                            <p className={`text-sm font-medium ${isInterested ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                Interest: {submission.interest_local_storage}
                                                            </p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            )
                                        }
                                        return null
                                    })}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PasscodeProtection>
    )
}