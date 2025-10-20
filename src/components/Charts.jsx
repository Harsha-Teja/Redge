/**
 * Consolidated Charts component for ReDge - All data visualization components
 * Provides business intelligence and infrastructure analysis charts
 * Uses Chart.js for rendering interactive charts
 */

import React from 'react'
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
    LineElement,
    Filler
} from 'chart.js'
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2'

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
    LineElement,
    Filler
)

// ============================================================================
// BUSINESS INTELLIGENCE CHARTS (Real Data from Customer/Survey Submissions)
// ============================================================================

/**
 * Demand Type vs Power Requirement Chart
 * Shows which industries drive total MW demand and how much of it is AI/GPU heavy
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Stacked bar chart component
 */
export const DemandTypeVsPowerChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No data available</p>
                </div>
            </div>
        )
    }

    // Process data to get sector breakdown with power and GPU data
    const sectorData = data.reduce((acc, submission) =>
    {
        const sector = submission.sector || 'Other'
        const itLoad = parseFloat(submission.current_it_load) || 0
        const gpuShare = parseFloat(submission.gpu_ai_share) || 0

        if (!acc[sector])
        {
            acc[sector] = {
                totalLoad: 0,
                gpuLoad: 0,
                standardLoad: 0,
                count: 0
            }
        }

        acc[sector].totalLoad += itLoad
        acc[sector].gpuLoad += itLoad * (gpuShare / 100)
        acc[sector].standardLoad += itLoad * ((100 - gpuShare) / 100)
        acc[sector].count += 1

        return acc
    }, {})

    const sectors = Object.keys(sectorData)
    const totalLoads = sectors.map(sector => sectorData[sector].totalLoad)
    const gpuLoads = sectors.map(sector => sectorData[sector].gpuLoad)
    const standardLoads = sectors.map(sector => sectorData[sector].standardLoad)

    const chartData = {
        labels: sectors,
        datasets: [
            {
                label: 'Standard IT Load (kW)',
                data: standardLoads,
                backgroundColor: '#3B82F6',
                borderColor: '#1E40AF',
                borderWidth: 1
            },
            {
                label: 'GPU/AI Load (kW)',
                data: gpuLoads,
                backgroundColor: '#F59E0B',
                borderColor: '#D97706',
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Customer Demand by Sector and IT Load (kW)',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1F2937'
            },
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            title: {
                display: true,
                    text: 'Sector',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'IT Load (kW)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                beginAtZero: true
            }
        }
    }

    return <Bar data={chartData} options={options} />
}

/**
 * Regional Heat Map of Demand Chart
 * Shows geographic distribution of customer demand
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Bar chart component (simplified heat map)
 */
export const RegionalHeatMapChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p>No data available</p>
                </div>
            </div>
        )
    }

    // Process data to get regional breakdown
    const regionalData = data.reduce((acc, submission) =>
    {
        const location = submission.eircode || submission.location || 'Dublin'
        const itLoad = parseFloat(submission.current_it_load) || 0
        const latencyTolerance = submission.latency_tolerance || 'Low'

        // Extract county from location
        const county = location.includes('Dublin') ? 'Dublin' :
            location.includes('Cork') ? 'Cork' :
                location.includes('Galway') ? 'Galway' :
                    location.includes('Limerick') ? 'Limerick' :
                        'Other'

        if (!acc[county])
        {
            acc[county] = {
                totalLoad: 0,
                count: 0,
                latencyTolerance: latencyTolerance
            }
        }

        acc[county].totalLoad += itLoad
        acc[county].count += 1

        return acc
    }, {})

    const counties = Object.keys(regionalData)
    const loads = counties.map(county => regionalData[county].totalLoad)
    const counts = counties.map(county => regionalData[county].count)

    const chartData = {
        labels: counties,
        datasets: [
            {
                label: 'Total IT Load (kW)',
                data: loads,
                backgroundColor: '#10B981',
                borderColor: '#059669',
                borderWidth: 2
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Geographic Distribution of Customer Demand (MW)',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1F2937'
            },
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context)
                    {
                        const county = context.label
                        const count = regionalData[county].count
                        return `Companies: ${count}`
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Region/County',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'IT Load (kW)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                beginAtZero: true
            }
        }
    }

    return <Bar data={chartData} options={options} />
}

/**
 * Sustainability Targets by Customer Chart
 * Shows renewable energy target vs contract term
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Scatter plot component
 */
export const SustainabilityTargetsChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">🌱</div>
                    <p>No data available</p>
                </div>
            </div>
        )
    }

    // Process data for scatter plot
    const scatterData = data.map(submission => ({
        x: parseInt(submission.contract_term) || 5,
        y: parseFloat(submission.renewable_target) || 0,
        commercialModel: submission.commercial_model || 'Lease',
        itLoad: parseFloat(submission.current_it_load) || 0
    }))

    // Group by commercial model for different colors
    const modelGroups = {
        'Lease': scatterData.filter(d => d.commercialModel === 'Lease'),
        'Managed Service': scatterData.filter(d => d.commercialModel === 'Managed Service'),
        'Own': scatterData.filter(d => d.commercialModel === 'Own')
    }

    const chartData = {
        datasets: [
            {
                label: 'Lease',
                data: modelGroups['Lease'],
                backgroundColor: '#3B82F6',
                borderColor: '#1E40AF',
                pointRadius: 6
            },
            {
                label: 'Managed Service',
                data: modelGroups['Managed Service'],
                backgroundColor: '#10B981',
                borderColor: '#059669',
                pointRadius: 6
            },
            {
                label: 'Own',
                data: modelGroups['Own'],
                backgroundColor: '#F59E0B',
                borderColor: '#D97706',
                pointRadius: 6
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Renewable Energy Target vs Contract Term',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1F2937'
            },
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context)
                    {
                        const point = context.raw
                        return `IT Load: ${point.itLoad} kW`
                    }
                }
            }
        },
        scales: {
            x: {
            title: {
                display: true,
                    text: 'Contract Term (years)',
                    font: {
                        size: 12,
                        weight: 'bold'
            }
        },
                min: 0,
                max: 15
            },
            y: {
                title: {
                    display: true,
                    text: 'Renewable Target (%)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                min: 0,
                max: 100
            }
        }
    }

    return <Scatter data={chartData} options={options} />
}

/**
 * Data Centre Service Demand Mix Chart
 * Shows preferred commercial models
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Pie chart component
 */
export const ServiceDemandMixChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">🏢</div>
                    <p>No data available</p>
                </div>
            </div>
        )
    }

    // Process data to get commercial model breakdown
    const modelData = data.reduce((acc, submission) =>
    {
        const model = submission.commercial_model || submission.data_centre_service || 'Lease'
        acc[model] = (acc[model] || 0) + 1
        return acc
    }, {})

    const total = Object.values(modelData).reduce((sum, count) => sum + count, 0)

    const chartData = {
        labels: Object.keys(modelData),
        datasets: [
            {
                data: Object.values(modelData),
                backgroundColor: [
                    '#3B82F6', // Blue - Lease
                    '#10B981', // Green - Managed Service
                    '#F59E0B', // Yellow - Own
                ],
                borderColor: [
                    '#1E40AF',
                    '#059669',
                    '#D97706'
                ],
                borderWidth: 2
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Preferred Commercial Models (Share of Customers)',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1F2937'
            },
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context)
                    {
                        const percentage = ((context.parsed / total) * 100).toFixed(1)
                        return `${context.label}: ${percentage}% (${context.parsed} customers)`
                    }
                }
            }
        }
    }

    return <Doughnut data={chartData} options={options} />
}

/**
 * Tier/Redundancy Preference Distribution Chart
 * Shows availability tier targets across customer base
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Bar chart component
 */
export const TierPreferenceChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <p>No data available</p>
                </div>
            </div>
        )
    }

    // Process data to get tier distribution
    const tierData = data.reduce((acc, submission) =>
    {
        const tier = submission.availability_tier || 'Tier III'
        acc[tier] = (acc[tier] || 0) + 1
        return acc
    }, {})

    // Ensure all tiers are represented
    const allTiers = ['Tier I', 'Tier II', 'Tier III', 'Tier IV']
    const tierCounts = allTiers.map(tier => tierData[tier] || 0)

    const chartData = {
        labels: allTiers,
        datasets: [
            {
                label: 'Number of Customers',
                data: tierCounts,
                backgroundColor: [
                    '#EF4444', // Red - Tier I
                    '#F59E0B', // Yellow - Tier II
                    '#10B981', // Green - Tier III
                    '#3B82F6'  // Blue - Tier IV
                ],
                borderColor: [
                    '#DC2626',
                    '#D97706',
                    '#059669',
                    '#1E40AF'
                ],
                borderWidth: 2
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Availability Tier Targets Across Customer Base',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1F2937'
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Availability Tier',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            y: {
            title: {
                display: true,
                    text: 'Number of Customers',
                    font: {
                        size: 12,
                        weight: 'bold'
            }
        },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }

    return <Bar data={chartData} options={options} />
}

/**
 * Budget vs Load Correlation Chart
 * Shows customer budget range vs IT load
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Scatter plot component
 */
export const BudgetVsLoadChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
    return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No data available</p>
                </div>
        </div>
    )
}

    // Process data for scatter plot
    const scatterData = data.map(submission =>
    {
        const itLoad = parseFloat(submission.current_it_load) || 0
        const budgetRange = submission.budget_range || 'Not specified'
        const sector = submission.sector || 'Other'

        // Convert budget range to numeric value for plotting
        let budgetValue = 0
        if (budgetRange.includes('Under €100k')) budgetValue = 50
        else if (budgetRange.includes('€100k - €500k')) budgetValue = 300
        else if (budgetRange.includes('€500k - €1M')) budgetValue = 750
        else if (budgetRange.includes('€1M - €5M')) budgetValue = 3000
        else if (budgetRange.includes('€5M - €10M')) budgetValue = 7500
        else if (budgetRange.includes('Over €10M')) budgetValue = 15000
        else budgetValue = 0

        return {
            x: itLoad,
            y: budgetValue,
            sector: sector,
            budgetRange: budgetRange
        }
    })

    // Group by sector for different colors
    const sectorGroups = {}
    scatterData.forEach(point =>
    {
        if (!sectorGroups[point.sector])
        {
            sectorGroups[point.sector] = []
        }
        sectorGroups[point.sector].push(point)
    })

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']
    const datasets = Object.keys(sectorGroups).map((sector, index) => ({
        label: sector,
        data: sectorGroups[sector],
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        pointRadius: 6
    }))

    const chartData = {
        datasets: datasets
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Customer Budget Range (€/kW) vs IT Load (kW)',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1F2937'
            },
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context)
                    {
                        const point = context.raw
                        return `Budget Range: ${point.budgetRange}`
                    }
                }
            }
        },
        scales: {
            x: {
            title: {
                display: true,
                    text: 'IT Load (kW)',
                    font: {
                        size: 12,
                        weight: 'bold'
            }
        },
                beginAtZero: true
            },
            y: {
                title: {
                    display: true,
                    text: 'Budget Range (€/kW)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                beginAtZero: true
            }
        }
    }

    return <Scatter data={chartData} options={options} />
}