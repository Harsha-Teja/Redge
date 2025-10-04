/**
 * Analysis page for ReDge - Data analysis and insights
 * Shows comprehensive analysis of data center performance and metrics
 * Protected by passcode authentication
 */
import PasscodeProtection from '../components/PasscodeProtection.jsx'

function Analysis()
{
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
                                Comprehensive analysis of our data center performance, energy efficiency, and operational metrics.
                            </p>
                        </div>

                        {/* Key Metrics Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">1.3</div>
                                <div className="text-gray-600">Average PUE</div>
                                <div className="text-sm text-green-600 mt-1">↓ 15% vs last year</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                                <div className="text-gray-600">Uptime</div>
                                <div className="text-sm text-green-600 mt-1">↑ 2.1% vs last year</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">78%</div>
                                <div className="text-gray-600">Renewable Energy</div>
                                <div className="text-sm text-green-600 mt-1">↑ 12% vs last year</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-2">€2.1M</div>
                                <div className="text-gray-600">Cost Savings</div>
                                <div className="text-sm text-green-600 mt-1">↑ 8% vs last year</div>
                            </div>
                        </div>

                        {/* Performance Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Energy Efficiency Chart */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Energy Efficiency Trends</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Dublin North</span>
                                            <span>PUE: 1.3</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-blue-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Cork South (Target)</span>
                                            <span>PUE: 1.2</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '80%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Galway West (Target)</span>
                                            <span>PUE: 1.1</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-purple-500 h-3 rounded-full" style={{ width: '90%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Capacity Utilization Chart */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Capacity Utilization</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Current Utilization</span>
                                            <span>67%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '67%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Peak Utilization</span>
                                            <span>89%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-orange-500 h-3 rounded-full" style={{ width: '89%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Projected Growth</span>
                                            <span>45%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-red-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Analysis Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {/* Cost Analysis */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Cost Analysis</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Energy Costs</span>
                                        <span className="font-semibold">€1.2M</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Maintenance</span>
                                        <span className="font-semibold">€0.8M</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Infrastructure</span>
                                        <span className="font-semibold">€1.5M</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Personnel</span>
                                        <span className="font-semibold">€2.1M</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-4 py-3">
                                        <span className="text-gray-900 font-bold">Total</span>
                                        <span className="font-bold text-lg">€5.6M</span>
                                    </div>
                                </div>
                            </div>

                            {/* Environmental Impact */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Environmental Impact</h3>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">2,450</div>
                                        <div className="text-gray-600">CO2 Saved (tons)</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">15,200</div>
                                        <div className="text-gray-600">Trees Equivalent</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">78%</div>
                                        <div className="text-gray-600">Renewable Energy</div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance KPIs */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Performance Indicators</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Server Efficiency</span>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <span className="text-sm font-semibold">92%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Network Latency</span>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                            <span className="text-sm font-semibold">88%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Security Score</span>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                                            </div>
                                            <span className="text-sm font-semibold">95%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Customer Satisfaction</span>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                                            </div>
                                            <span className="text-sm font-semibold">96%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-12">
                            <h3 className="text-2xl font-bold mb-6">Strategic Recommendations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold mb-3">Immediate Actions (0-3 months)</h4>
                                    <ul className="space-y-2 text-sm opacity-90">
                                        <li>• Implement advanced cooling optimization</li>
                                        <li>• Deploy AI-powered load balancing</li>
                                        <li>• Upgrade monitoring systems</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-3">Long-term Goals (6-12 months)</h4>
                                    <ul className="space-y-2 text-sm opacity-90">
                                        <li>• Achieve 100% renewable energy</li>
                                        <li>• Implement edge computing expansion</li>
                                        <li>• Launch carbon-neutral operations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Export Analysis</h3>
                            <p className="text-gray-600 mb-6">Download detailed reports and data for further analysis</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                    Download PDF Report
                                </button>
                                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                                    Export CSV Data
                                </button>
                                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                    Generate Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PasscodeProtection>
    )
}

export default Analysis
