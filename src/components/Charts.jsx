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
import { Bar, Doughnut, Line } from 'react-chartjs-2'

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
 * Sector Breakdown Chart Component
 * Shows percentage share of different sectors (Pharma, MedTech, Finance, Gov, Other)
 * Identifies early adopters
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Doughnut chart component
 */
export const SectorBreakdownChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sector Breakdown</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process sector data
    const sectorCounts = data.reduce((acc, submission) =>
    {
        const sector = submission.sector || 'Other'
        acc[sector] = (acc[sector] || 0) + 1
        return acc
    }, {})

    const total = Object.values(sectorCounts).reduce((sum, count) => sum + count, 0)

    const chartData = {
        labels: Object.keys(sectorCounts),
        datasets: [
            {
                data: Object.values(sectorCounts),
                backgroundColor: [
                    '#10B981', // Green - Pharma
                    '#3B82F6', // Blue - MedTech
                    '#F59E0B', // Yellow - Finance
                    '#EF4444', // Red - Government
                    '#8B5CF6'  // Purple - Other
                ],
                borderColor: [
                    '#059669',
                    '#1E40AF',
                    '#D97706',
                    '#DC2626',
                    '#7C3AED'
                ],
                borderWidth: 2
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Early Adopter Sectors (%)'
            },
            tooltip: {
                callbacks: {
                    label: function (context)
                    {
                        const percentage = ((context.parsed / total) * 100).toFixed(1)
                        return `${context.label}: ${percentage}% (${context.parsed} companies)`
                    }
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Sector Breakdown</h3>
            <Doughnut data={chartData} options={options} />
        </div>
    )
}

/**
 * IT Load Growth Projection Chart Component
 * Shows aggregate load forecast for 12/24/36 months
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Line chart component
 */
export const ITLoadGrowthChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">IT Load Growth Projection</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process growth data
    const growthData = data.map(submission => ({
        company: submission.company_name,
        growth12: parseFloat(submission.growth_12_month) || 0,
        growth24: parseFloat(submission.growth_24_month) || 0,
        growth36: parseFloat(submission.growth_36_month) || 0
    })).filter(item => item.growth12 > 0 || item.growth24 > 0 || item.growth36 > 0)

    if (growthData.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">IT Load Growth Projection</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Calculate aggregate growth
    const avgGrowth12 = growthData.reduce((acc, item) => acc + item.growth12, 0) / growthData.length
    const avgGrowth24 = growthData.reduce((acc, item) => acc + item.growth24, 0) / growthData.length
    const avgGrowth36 = growthData.reduce((acc, item) => acc + item.growth36, 0) / growthData.length

    const chartData = {
        labels: ['12 Months', '24 Months', '36 Months'],
        datasets: [
            {
                label: 'Average Growth (%)',
                data: [avgGrowth12, avgGrowth24, avgGrowth36],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F620',
                tension: 0.1,
                fill: true
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Aggregate Load Forecast'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Growth Percentage (%)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">IT Load Growth Projection</h3>
            <Line data={chartData} options={options} />
        </div>
    )
}

/**
 * Latency Requirements Chart Component
 * Shows percentage of users needing different latency requirements
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Bar chart component
 */
export const LatencyRequirementsChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Latency Requirements</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process latency tolerance data
    const latencyCounts = {
        '<1ms': 0,
        '1-5ms': 0,
        '5-10ms': 0,
        '>10ms': 0
    }

    data.forEach(submission =>
    {
        const tolerance = submission.latency_tolerance
        if (tolerance === 'Ultra-low (<1ms)') latencyCounts['<1ms']++
        else if (tolerance === 'Low (1-5ms)') latencyCounts['1-5ms']++
        else if (tolerance === 'Medium (5-10ms)') latencyCounts['5-10ms']++
        else if (tolerance === 'High (>10ms)') latencyCounts['>10ms']++
    })

    const total = Object.values(latencyCounts).reduce((sum, count) => sum + count, 0)

    const chartData = {
        labels: Object.keys(latencyCounts),
        datasets: [
            {
                label: 'Percentage of Users',
                data: Object.values(latencyCounts),
                backgroundColor: [
                    '#EF4444', // Red - <1ms
                    '#F59E0B', // Yellow - 1-5ms
                    '#3B82F6', // Blue - 5-10ms
                    '#10B981'  // Green - >10ms
                ],
                borderColor: [
                    '#DC2626',
                    '#D97706',
                    '#1E40AF',
                    '#059669'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Latency Requirements Distribution'
            },
            tooltip: {
                callbacks: {
                    label: function (context)
                    {
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0
                        return `${context.label}: ${percentage}% (${context.parsed} users)`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Users'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Latency Requirements</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

/**
 * Renewable Preference Chart Component
 * Shows percentage of customers asking for different renewable supply levels
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Bar chart component
 */
export const RenewablePreferenceChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Renewable Preference</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process renewable target data
    const renewableCounts = {
        '0%': 0,
        '25%': 0,
        '50%': 0,
        '75%': 0,
        '100%': 0
    }

    data.forEach(submission =>
    {
        const target = submission.renewable_target
        if (target === '0%') renewableCounts['0%']++
        else if (target === '25%') renewableCounts['25%']++
        else if (target === '50%') renewableCounts['50%']++
        else if (target === '75%') renewableCounts['75%']++
        else if (target === '100%') renewableCounts['100%']++
    })

    const chartData = {
        labels: Object.keys(renewableCounts),
        datasets: [
            {
                label: 'Number of Customers',
                data: Object.values(renewableCounts),
                backgroundColor: [
                    '#EF4444', // Red - 0%
                    '#F59E0B', // Yellow - 25%
                    '#3B82F6', // Blue - 50%
                    '#10B981', // Green - 75%
                    '#059669'  // Dark Green - 100%
                ],
                borderColor: [
                    '#DC2626',
                    '#D97706',
                    '#1E40AF',
                    '#059669',
                    '#047857'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Renewable Energy Preference'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Customers'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Renewable Preference</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

/**
 * Compliance Requirements Chart Component
 * Shows count of different compliance requirements
 * @param {Array} data - Array of customer submissions
 * @returns {JSX.Element} - Bar chart component
 */
export const ComplianceRequirementsChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Requirements</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process compliance data
    const complianceCounts = {
        'GxP': 0,
        'ISO': 0,
        'HIPAA': 0,
        'PCI': 0,
        'None': 0
    }

    data.forEach(submission =>
    {
        const compliance = submission.compliance
        if (compliance === 'GxP') complianceCounts['GxP']++
        else if (compliance === 'ISO') complianceCounts['ISO']++
        else if (compliance === 'HIPAA') complianceCounts['HIPAA']++
        else if (compliance === 'PCI') complianceCounts['PCI']++
        else if (compliance === 'None') complianceCounts['None']++
    })

    const chartData = {
        labels: Object.keys(complianceCounts),
        datasets: [
            {
                label: 'Number of Customers',
                data: Object.values(complianceCounts),
                backgroundColor: [
                    '#3B82F6', // Blue - GxP
                    '#10B981', // Green - ISO
                    '#F59E0B', // Yellow - HIPAA
                    '#EF4444', // Red - PCI
                    '#6B7280'  // Gray - None
                ],
                borderColor: [
                    '#1E40AF',
                    '#059669',
                    '#D97706',
                    '#DC2626',
                    '#4B5563'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Compliance Requirements Distribution'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Customers'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Requirements</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

/**
 * Contract Term Preferences Chart Component
 * Shows distribution of contract term preferences
 * @param {Array} data - Array of survey submissions
 * @returns {JSX.Element} - Bar chart component
 */
export const ContractTermPreferencesChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contract Term Preferences</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process contract length data
    const contractCounts = data.reduce((acc, submission) =>
    {
        const length = submission.contract_length
        acc[length] = (acc[length] || 0) + 1
        return acc
    }, {})

    const chartData = {
        labels: Object.keys(contractCounts),
        datasets: [
            {
                label: 'Number of Responses',
                data: Object.values(contractCounts),
                backgroundColor: [
                    '#3B82F6', // Blue
                    '#10B981', // Green
                    '#F59E0B', // Yellow
                    '#EF4444', // Red
                    '#8B5CF6'  // Purple
                ],
                borderColor: [
                    '#1E40AF',
                    '#059669',
                    '#D97706',
                    '#DC2626',
                    '#7C3AED'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Contract Term Preferences'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Responses'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contract Term Preferences</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

/**
 * CapEx vs OpEx Preference Chart Component
 * Shows customer preference for upfront vs operational spend
 * @param {Array} data - Array of survey submissions
 * @returns {JSX.Element} - Bar chart component
 */
export const CapExVsOpExChart = ({ data }) =>
{
    if (!data || data.length === 0)
    {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">CapEx vs OpEx Preference</h3>
                <div className="text-gray-500 text-lg">Not enough data available</div>
            </div>
        )
    }

    // Process budget preference data
    const budgetPreferences = {
        'CapEx Preferred': 0,
        'OpEx Preferred': 0,
        'Mixed': 0
    }

    data.forEach(submission =>
    {
        const capex = submission.capex_budget
        const opex = submission.opex_budget

        if (capex && !opex) budgetPreferences['CapEx Preferred']++
        else if (!capex && opex) budgetPreferences['OpEx Preferred']++
        else if (capex && opex) budgetPreferences['Mixed']++
    })

    const chartData = {
        labels: Object.keys(budgetPreferences),
        datasets: [
            {
                label: 'Number of Customers',
                data: Object.values(budgetPreferences),
                backgroundColor: [
                    '#3B82F6', // Blue - CapEx
                    '#10B981', // Green - OpEx
                    '#F59E0B'  // Yellow - Mixed
                ],
                borderColor: [
                    '#1E40AF',
                    '#059669',
                    '#D97706'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Budget Preference Distribution'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Customers'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">CapEx vs OpEx Preference</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

// ============================================================================
// INFRASTRUCTURE ANALYSIS CHARTS (Mock Data for Ireland Context)
// ============================================================================

/**
 * Ireland Data Centre Power Demand vs Grid Capacity Chart
 * Shows trend of DC power draw vs available grid capacity
 * @returns {JSX.Element} - Line chart component
 */
export const PowerDemandVsGridCapacityChart = () =>
{
    const chartData = {
        labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
        datasets: [
            {
                label: 'Data Centre Power Demand (MW)',
                data: [1200, 1450, 1750, 2100, 2500, 2950, 3450],
                borderColor: '#EF4444',
                backgroundColor: '#EF444420',
                tension: 0.1,
                fill: true
            },
            {
                label: 'Available Grid Capacity (MW)',
                data: [2000, 2100, 2200, 2300, 2400, 2500, 2600],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F620',
                tension: 0.1,
                fill: true
            },
            {
                label: 'Grid Capacity Gap (MW)',
                data: [800, 650, 450, 200, -100, -450, -850],
                borderColor: '#F59E0B',
                backgroundColor: '#F59E0B20',
                tension: 0.1,
                fill: true
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Ireland Data Centre Power Demand vs Grid Capacity'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Power (MW)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Power Demand vs Grid Capacity</h3>
            <Line data={chartData} options={options} />
        </div>
    )
}

/**
 * Renewable Generation vs Consumption Chart
 * Shows total MWh renewable generation vs total MWh demand
 * @returns {JSX.Element} - Stacked area chart component
 */
export const RenewableGenerationVsConsumptionChart = () =>
{
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Renewable Generation (MWh)',
                data: [45000, 52000, 68000, 75000, 82000, 78000, 71000, 65000, 58000, 48000, 42000, 38000],
                borderColor: '#10B981',
                backgroundColor: '#10B98140',
                tension: 0.1,
                fill: true
            },
            {
                label: 'Total Demand (MWh)',
                data: [65000, 68000, 72000, 78000, 85000, 90000, 95000, 92000, 88000, 82000, 75000, 70000],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F640',
                tension: 0.1,
                fill: true
            },
            {
                label: 'Gap (MWh)',
                data: [20000, 16000, 4000, 3000, 3000, 12000, 24000, 27000, 30000, 34000, 33000, 32000],
                borderColor: '#EF4444',
                backgroundColor: '#EF444440',
                tension: 0.1,
                fill: true
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Renewable Generation vs Consumption'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Energy (MWh)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Renewable Generation vs Consumption</h3>
            <Line data={chartData} options={options} />
        </div>
    )
}

/**
 * Regional Grid Congestion Chart
 * Shows spare MW capacity by region (simplified as bar chart)
 * @returns {JSX.Element} - Bar chart component
 */
export const RegionalGridCongestionChart = () =>
{
    const chartData = {
        labels: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny', 'Sligo', 'Donegal'],
        datasets: [
            {
                label: 'Spare Capacity (MW)',
                data: [150, 320, 280, 180, 220, 190, 250, 300],
                backgroundColor: [
                    '#EF4444', // Red - Dublin (congested)
                    '#10B981', // Green - Cork (good capacity)
                    '#10B981', // Green - Galway (good capacity)
                    '#F59E0B', // Yellow - Limerick (moderate)
                    '#10B981', // Green - Waterford (good capacity)
                    '#F59E0B', // Yellow - Kilkenny (moderate)
                    '#10B981', // Green - Sligo (good capacity)
                    '#10B981'  // Green - Donegal (good capacity)
                ],
                borderColor: [
                    '#DC2626',
                    '#059669',
                    '#059669',
                    '#D97706',
                    '#059669',
                    '#D97706',
                    '#059669',
                    '#059669'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Regional Grid Spare Capacity'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Spare Capacity (MW)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Regional Grid Congestion</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

/**
 * Projected ROI Scenarios Chart
 * Shows ROI curve under different energy price scenarios
 * @returns {JSX.Element} - Line chart component
 */
export const ProjectedROIScenariosChart = () =>
{
    const chartData = {
        labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
        datasets: [
            {
                label: 'Low Energy Price Scenario',
                data: [5, 12, 18, 25, 32, 38, 45, 52, 58, 65],
                borderColor: '#10B981',
                backgroundColor: '#10B98120',
                tension: 0.1
            },
            {
                label: 'Base Energy Price Scenario',
                data: [3, 8, 14, 20, 26, 32, 38, 44, 50, 56],
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F620',
                tension: 0.1
            },
            {
                label: 'High Energy Price Scenario',
                data: [1, 4, 8, 12, 16, 20, 24, 28, 32, 36],
                borderColor: '#EF4444',
                backgroundColor: '#EF444420',
                tension: 0.1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Projected ROI Scenarios'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'ROI (%)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Projected ROI Scenarios</h3>
            <Line data={chartData} options={options} />
        </div>
    )
}

/**
 * Carbon Emissions Avoided Chart
 * Compares on-prem vs colo vs modular edge carbon emissions
 * @returns {JSX.Element} - Bar chart component
 */
export const CarbonEmissionsAvoidedChart = () =>
{
    const chartData = {
        labels: ['On-Premises', 'Traditional Colo', 'Modular Edge (Renewable)'],
        datasets: [
            {
                label: 'Carbon Emissions (tCO2/year)',
                data: [2500, 1800, 450],
                backgroundColor: [
                    '#EF4444', // Red - On-premises (high emissions)
                    '#F59E0B', // Yellow - Traditional colo (medium emissions)
                    '#10B981'  // Green - Modular edge (low emissions)
                ],
                borderColor: [
                    '#DC2626',
                    '#D97706',
                    '#059669'
                ],
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Carbon Emissions Comparison'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Carbon Emissions (tCO2/year)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Carbon Emissions Avoided</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}

/**
 * Pipeline vs Demand Overlay Chart
 * Shows planned DC builds vs customer submissions by region
 * @returns {JSX.Element} - Bar chart component
 */
export const PipelineVsDemandChart = () =>
{
    const chartData = {
        labels: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny', 'Sligo', 'Donegal'],
        datasets: [
            {
                label: 'Planned DC Builds (MW)',
                data: [800, 200, 150, 100, 80, 60, 40, 30],
                backgroundColor: '#3B82F6',
                borderColor: '#1E40AF',
                borderWidth: 1
            },
            {
                label: 'Customer Demand (MW)',
                data: [1200, 180, 220, 150, 120, 90, 70, 50],
                backgroundColor: '#EF4444',
                borderColor: '#DC2626',
                borderWidth: 1
            },
            {
                label: 'Demand Gap (MW)',
                data: [400, -20, 70, 50, 40, 30, 30, 20],
                backgroundColor: '#F59E0B',
                borderColor: '#D97706',
                borderWidth: 1
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Pipeline vs Demand Overlay'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Capacity (MW)'
                }
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Pipeline vs Demand Overlay</h3>
            <Bar data={chartData} options={options} />
        </div>
    )
}