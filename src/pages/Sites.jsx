/**
 * Sites page for ReDge - Data center sites and locations
 * Shows information about various data center sites across Ireland
 * Protected by passcode authentication
 */
import PasscodeProtection from '../components/PasscodeProtection.jsx'

function Sites()
{
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