/**
 * Analysis page for ReDge - Data analysis and insights
 * Shows comprehensive analysis of data center performance and metrics
 * Protected by passcode authentication
 */
import { useState, useEffect } from 'react'
import PasscodeProtection from '../components/PasscodeProtection.jsx'
import
{
    SectorBreakdownChart,
    ITLoadGrowthChart,
    LatencyRequirementsChart,
    RenewablePreferenceChart,
    ComplianceRequirementsChart,
    ContractTermPreferencesChart,
    CapExVsOpExChart,
    PowerDemandVsGridCapacityChart,
    RenewableGenerationVsConsumptionChart,
    RegionalGridCongestionChart,
    ProjectedROIScenariosChart,
    CarbonEmissionsAvoidedChart,
    PipelineVsDemandChart
} from '../components/Charts.jsx'
import { fetchFormSubmissions, fetchSurveySubmissions } from '../lib/supabase.js'

function Analysis()
{
    // State for storing fetched data
    const [customerData, setCustomerData] = useState([])
    const [surveyData, setSurveyData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch data on component mount
    useEffect(() =>
    {
        const fetchData = async () =>
        {
            try
            {
                setLoading(true)

                // Fetch customer lead data
                const customerResult = await fetchFormSubmissions()
                if (customerResult.success)
                {
                    setCustomerData(customerResult.submissions)
                } else
                {
                    console.error('Error fetching customer data:', customerResult.error)
                }

                // Fetch survey data
                const surveyResult = await fetchSurveySubmissions()
                if (surveyResult.success)
                {
                    setSurveyData(surveyResult.submissions)
                } else
                {
                    console.error('Error fetching survey data:', surveyResult.error)
                }

            } catch (err)
            {
                console.error('Error fetching data:', err)
                setError('Failed to load data')
            } finally
            {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <PasscodeProtection
            correctPasscode="harsha@esb.ie"
            title="Analysis Access Required"
            subtitle="Please enter the passcode to view our data analysis and insights"
        >
            <main className="pt-20">
                <div className="py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Data Analysis & Insights
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Comprehensive analysis of customer lead data and survey insights from our data center platform.
                            </p>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 mt-4">Loading data...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Key Metrics Dashboard */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">{customerData.length}</div>
                                    <div className="text-gray-600">Customer Leads</div>
                                    <div className="text-sm text-green-600 mt-1">Total submissions</div>
                                </div>
                                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">{surveyData.length}</div>
                                    <div className="text-gray-600">Survey Responses</div>
                                    <div className="text-sm text-green-600 mt-1">Market insights</div>
                                </div>
                                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">
                                        {customerData.length > 0 ?
                                            (customerData.reduce((acc, item) => acc + (parseFloat(item.growth_12_month) || 0), 0) / customerData.length).toFixed(1) + '%'
                                            : '0%'
                                        }
                                    </div>
                                    <div className="text-gray-600">Avg Growth (12m)</div>
                                    <div className="text-sm text-green-600 mt-1">Expected growth</div>
                                </div>
                                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-orange-600 mb-2">
                                        {surveyData.length > 0 ?
                                            (surveyData.reduce((acc, item) => acc + (parseFloat(item.pue_expectation) || 0), 0) / surveyData.length).toFixed(2)
                                            : '0.00'
                                        }
                                    </div>
                                    <div className="text-gray-600">Avg PUE Expectation</div>
                                    <div className="text-sm text-green-600 mt-1">Market expectation</div>
                                </div>
                            </div>
                        )}

                        {/* Business Intelligence Charts Section */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Sector Breakdown Chart */}
                                <SectorBreakdownChart data={customerData} />

                                {/* IT Load Growth Chart */}
                                <ITLoadGrowthChart data={customerData} />
                            </div>
                        )}

                        {/* Customer Requirements Charts Section */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Latency Requirements Chart */}
                                <LatencyRequirementsChart data={customerData} />

                                {/* Renewable Preference Chart */}
                                <RenewablePreferenceChart data={customerData} />
                            </div>
                        )}

                        {/* Compliance & Contract Charts Section */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Compliance Requirements Chart */}
                                <ComplianceRequirementsChart data={customerData} />

                                {/* Contract Term Preferences Chart */}
                                <ContractTermPreferencesChart data={surveyData} />
                            </div>
                        )}

                        {/* Budget Preference Chart */}
                        {!loading && !error && (
                            <div className="mb-12">
                                <CapExVsOpExChart data={surveyData} />
                            </div>
                        )}

                        {/* Infrastructure Analysis Charts Section */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Power Demand vs Grid Capacity Chart */}
                                <PowerDemandVsGridCapacityChart />

                                {/* Renewable Generation vs Consumption Chart */}
                                <RenewableGenerationVsConsumptionChart />
                            </div>
                        )}

                        {/* Grid & ROI Analysis Charts Section */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Regional Grid Congestion Chart */}
                                <RegionalGridCongestionChart />

                                {/* Projected ROI Scenarios Chart */}
                                <ProjectedROIScenariosChart />
                            </div>
                        )}

                        {/* Sustainability & Pipeline Charts Section */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Carbon Emissions Avoided Chart */}
                                <CarbonEmissionsAvoidedChart />

                                {/* Pipeline vs Demand Chart */}
                                <PipelineVsDemandChart />
                            </div>
                        )}



                    </div>
                </div>
            </main>
        </PasscodeProtection>
    )
}

export default Analysis
