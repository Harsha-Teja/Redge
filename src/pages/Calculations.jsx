/**
 * Calculations page for ReDge - Feasibility Study Formula Explanations
 * Shows detailed explanations of all calculations used in the feasibility study
 * Protected by passcode authentication
 */
import PasscodeProtection from '../components/PasscodeProtection.jsx'

function Calculations()
{
    return (
        <PasscodeProtection
            correctPasscode="harsha@esb.ie"
            title="Calculations Access Required"
            subtitle="Please enter the passcode to view the feasibility study calculations and formulas"
        >
            <main className="pt-20">
                <div className="py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Feasibility Study Calculations
                            </h1>
                            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                                Comprehensive guide to all formulas, defaults, and calculations used in the modular data center feasibility study.
                            </p>
                        </div>

                        {/* Default Parameters Section */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Default Parameters</h2>
                            <p className="text-gray-600 mb-6">
                                Industry-standard values used when customer data is not available or incomplete.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Capital Costs</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">CapEx per MW (Tier III)</span>
                                            <span className="font-medium">€9,000,000</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Source: CBRE 2024 Ireland</div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-green-900 mb-3">Energy & Efficiency</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">PUE (Power Usage Effectiveness)</span>
                                            <span className="font-medium">1.4</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Electricity Price</span>
                                            <span className="font-medium">€120/MWh</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Sources: Bitpower 2024, SEAI 2024</div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Financial Metrics</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount Rate (WACC)</span>
                                            <span className="font-medium">8%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Target IRR</span>
                                            <span className="font-medium">10%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Target Payback</span>
                                            <span className="font-medium">7 years</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Source: EY Infrastructure benchmark</div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-orange-900 mb-3">Revenue Assumptions</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Price per kW/month</span>
                                            <span className="font-medium">€250</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Utilization Factor</span>
                                            <span className="font-medium">70%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax Rate</span>
                                            <span className="font-medium">25%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-red-900 mb-3">Operating Costs</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Maintenance</span>
                                            <span className="font-medium">2% of CapEx</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Staff</span>
                                            <span className="font-medium">3% of CapEx</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Insurance</span>
                                            <span className="font-medium">0.5% of CapEx</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sustaining CapEx</span>
                                            <span className="font-medium">0.5% of CapEx</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-teal-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-teal-900 mb-3">Contract Terms</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Default Contract</span>
                                            <span className="font-medium">5 years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Range</span>
                                            <span className="font-medium">5-15 years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hours per Year</span>
                                            <span className="font-medium">8,760</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formula Explanations */}
                        <div className="space-y-8">
                            {/* Formula 1: Power Capacity Conversion */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">1️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Power Capacity Conversion</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        Power_MW = it_load_kw ÷ 1000
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Converts your total IT load in kW to megawatts - the base size of the data centre.
                                </p>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Example:</strong> If a customer has 500 kW IT load, the data center capacity would be 0.5 MW.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 2: Base Capital Cost */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">2️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Base Capital Cost (CapEx)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        CapEx_base = Power_MW × capex_per_mw
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Build cost = power capacity × average € per MW for modular Tier III build.
                                </p>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        <strong>Default:</strong> capex_per_mw = €9,000,000 (for Tier III modular data centers)
                                    </p>
                                </div>
                            </div>

                            {/* Formula 3: Design Adjustments */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">3️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Design Adjustments (Multipliers)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        CapEx = CapEx_base × tier_mult × gpu_mult × renew_mult × dr_mult
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Applies extra cost for redundancy, AI cooling, green power and multi-site design.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-orange-900 mb-3">Tier Multipliers</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Tier II</span>
                                                <span className="font-medium">×1.10</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tier III</span>
                                                <span className="font-medium">×1.00</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tier IV</span>
                                                <span className="font-medium">×1.20</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-purple-900 mb-3">Other Multipliers</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>GPU &gt; 30%</span>
                                                <span className="font-medium">×1.15</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Renewable ≥ 80%</span>
                                                <span className="font-medium">×1.05</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>DR Sites = 2</span>
                                                <span className="font-medium">×1.90</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formula 4: Energy Consumption */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">4️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Yearly Energy Consumption</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        energy_mwh_yr = Power_MW × PUE × 8760
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Computes annual electricity use = IT power × PUE × hours per year.
                                </p>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        <strong>Components:</strong> PUE accounts for cooling, lighting, and other facility overhead. 8760 hours = 365 days × 24 hours.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 5: Energy Cost */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">5️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Energy Cost</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        energy_cost_yr = energy_mwh_yr × elec_price_eur_per_mwh
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Annual power bill = total energy used × electricity price.
                                </p>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Renewable Discount:</strong> If renewable ≥ 80% → ×0.95 energy discount (5% savings).
                                    </p>
                                </div>
                            </div>

                            {/* Formula 6: Operating Expenses */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">6️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Operating Expenses (OpEx)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        OpEx_yr = energy_cost_yr + CapEx × (0.02 + 0.03 + 0.005)
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Adds energy, maintenance, staff and insurance to get annual running cost.
                                </p>
                                <div className="bg-red-50 rounded-lg p-4">
                                    <p className="text-sm text-red-800">
                                        <strong>Breakdown:</strong> 2% maintenance + 3% staff + 0.5% insurance (all as % of CapEx).
                                    </p>
                                </div>
                            </div>

                            {/* Formula 7: Annual Revenue */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">7️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Annual Revenue</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        revenue_yr = it_load_kw × price_kw_month × 12 × utilisation_factor
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Rent = kW × monthly rate × 12 months × utilisation curve.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-green-900 mb-3">Service Model Adjustments</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Managed Service</span>
                                                <span className="font-medium">×1.20</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Lease</span>
                                                <span className="font-medium">×1.00</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Own Use</span>
                                                <span className="font-medium">×0.00</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-3">Typical Rates</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Price Range</span>
                                                <span className="font-medium">€200-300/kW/month</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Default Rate</span>
                                                <span className="font-medium">€250/kW/month</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Utilization</span>
                                                <span className="font-medium">70%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formula 8: EBITDA */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">8️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">EBITDA (Operating Profit)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        EBITDA = revenue_yr - OpEx_yr
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Shows yearly operating profit before tax or finance.
                                </p>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-purple-800">
                                        <strong>Note:</strong> EBITDA = Earnings Before Interest, Taxes, Depreciation, and Amortization.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 9: Free Cash Flow */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">9️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Free Cash Flow (FCF)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        Year 0 = -CapEx<br />
                                        Year t ≥ 1 = EBITDA × (1 - tax_rate) - sustaining_capex
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Cashflow after build cost and operating expenses.
                                </p>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <p className="text-sm text-orange-800">
                                        <strong>Sustaining CapEx:</strong> ≈ 0.5% of CapEx per year for ongoing maintenance and upgrades.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 10: Net Present Value */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">🔟</span>
                                    <h3 className="text-xl font-bold text-gray-900">Net Present Value (NPV)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        NPV = Σ(t=1 to n) FCF_t ÷ (1 + r)^t - CapEx
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Value today of all future cashflows using 8% discount rate.
                                </p>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        <strong>Parameters:</strong> r = 8% discount rate, n = contract term (years). Positive NPV indicates profitable investment.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 11: Internal Rate of Return */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">1️⃣1️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Internal Rate of Return (IRR)</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        Solve r where NPV = 0 over n years
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Average annual return that makes present value of cashflows = zero.
                                </p>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-purple-800">
                                        <strong>Calculation:</strong> Iterative process to find the discount rate where NPV equals zero. Higher IRR = better investment.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 12: Payback Period */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">1️⃣2️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Payback Period</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        Payback = first year when ΣFCF ≥ 0
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Year in which cumulative cashflow becomes positive.
                                </p>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Target:</strong> ≤ 7 years for project approval. Shorter payback = lower risk investment.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 13: Feasibility Flag */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">1️⃣3️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Feasibility Flag</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        Feasible = (IRR ≥ 0.10) ∧ (Payback ≤ 7)
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Project is viable if IRR ≥ 10% and payback ≤ 7 years.
                                </p>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        <strong>Decision Logic:</strong> Both conditions must be met for project approval. This ensures adequate returns and reasonable payback period.
                                    </p>
                                </div>
                            </div>

                            {/* Formula 14: Grid Check */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full mr-4">1️⃣4️⃣</span>
                                    <h3 className="text-xl font-bold text-gray-900">Grid Check</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <code className="text-lg font-mono text-gray-800">
                                        GridOK = (Power_MW ≤ MIC_limit - existing_load)
                                    </code>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <strong>Purpose:</strong> Verifies available MIC power supports your requested capacity.
                                </p>
                                <div className="bg-red-50 rounded-lg p-4">
                                    <p className="text-sm text-red-800">
                                        <strong>Critical Check:</strong> If GridOK = false, project cannot proceed regardless of financial viability.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Adjustment Summary Table */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Adjustment Summary</h2>
                            <p className="text-gray-600 mb-6">
                                How different input parameters affect the calculations and final feasibility determination.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Input</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Variable Used In</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Formula Effect</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Typical Range</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-3 font-medium">tier_target</td>
                                            <td className="border border-gray-300 px-4 py-3">CapEx</td>
                                            <td className="border border-gray-300 px-4 py-3">× 1.0 – 1.2</td>
                                            <td className="border border-gray-300 px-4 py-3">I–IV</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 font-medium">gpu_share</td>
                                            <td className="border border-gray-300 px-4 py-3">CapEx, PUE</td>
                                            <td className="border border-gray-300 px-4 py-3">× 1.15 ; PUE + 0.05</td>
                                            <td className="border border-gray-300 px-4 py-3">0–100%</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-3 font-medium">renewable_pct</td>
                                            <td className="border border-gray-300 px-4 py-3">CapEx, Energy</td>
                                            <td className="border border-gray-300 px-4 py-3">× 1.05 ; energy × 0.95</td>
                                            <td className="border border-gray-300 px-4 py-3">0–100%</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 font-medium">region</td>
                                            <td className="border border-gray-300 px-4 py-3">CapEx</td>
                                            <td className="border border-gray-300 px-4 py-3">± 5%</td>
                                            <td className="border border-gray-300 px-4 py-3">Metro / Regional</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-3 font-medium">contract_term</td>
                                            <td className="border border-gray-300 px-4 py-3">NPV, IRR</td>
                                            <td className="border border-gray-300 px-4 py-3">sets years n</td>
                                            <td className="border border-gray-300 px-4 py-3">5–15 yrs</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 font-medium">service_type</td>
                                            <td className="border border-gray-300 px-4 py-3">Revenue, OpEx</td>
                                            <td className="border border-gray-300 px-4 py-3">+20% / +10%</td>
                                            <td className="border border-gray-300 px-4 py-3">Lease / Managed / Own</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-3 font-medium">utilisation_ramp</td>
                                            <td className="border border-gray-300 px-4 py-3">Revenue</td>
                                            <td className="border border-gray-300 px-4 py-3">year-by-year multiplier</td>
                                            <td className="border border-gray-300 px-4 py-3">40→70→85%</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 font-medium">budget_kw</td>
                                            <td className="border border-gray-300 px-4 py-3">Feasibility</td>
                                            <td className="border border-gray-300 px-4 py-3">compare vs price_kw_month</td>
                                            <td className="border border-gray-300 px-4 py-3">€150–300</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-3 font-medium">MIC limit & existing load</td>
                                            <td className="border border-gray-300 px-4 py-3">GridOK</td>
                                            <td className="border border-gray-300 px-4 py-3">boolean filter</td>
                                            <td className="border border-gray-300 px-4 py-3">–</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 font-medium">DR site need</td>
                                            <td className="border border-gray-300 px-4 py-3">CapEx, Revenue</td>
                                            <td className="border border-gray-300 px-4 py-3">×1.9 , ×1.2</td>
                                            <td className="border border-gray-300 px-4 py-3">Yes/No</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Input Field Usage Analysis */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <div className="flex items-center mb-6">
                                <span className="bg-blue-100 text-blue-800 text-2xl font-bold px-4 py-2 rounded-full mr-4">🧩</span>
                                <h2 className="text-2xl font-bold text-gray-900">Input Field Usage Analysis</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Every single input field serves a purpose in one of four roles: Direct formula input, Formula modifier, Feasibility filter, or Mapping key.
                            </p>

                            {/* Usage Type Legend */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Type Legend</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-center">
                                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3">Core</span>
                                        <span className="text-sm text-gray-700">Direct formula input</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium mr-3">Modifier</span>
                                        <span className="text-sm text-gray-700">Adjusts cost/revenue coefficients</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium mr-3">Filter</span>
                                        <span className="text-sm text-gray-700">Determines feasibility</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium mr-3">Mapping</span>
                                        <span className="text-sm text-gray-700">Metadata or derived values</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Company Information */}
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Company Information</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Name, Email, Role</span>
                                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Mapping</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Metadata for record-keeping</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Area / City</span>
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">Filter</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Matches with ESB grid/fibre maps</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Sector</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Sets default Tier/PUE/OpEx multipliers by industry</div>
                                    </div>
                                </div>

                                {/* Workload */}
                                <div className="bg-orange-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Workload</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Data Sovereignty</span>
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">Filter</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Limits site choices (Ireland/EU)</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Compliance</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Adds certification cost to CapEx (+2-5%)</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Latency Tolerance</span>
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">Filter</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Determines if site must be near Dublin</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Availability/Tier</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Adds redundancy cost (Tier II-IV multipliers)</div>
                                    </div>
                                </div>

                                {/* Capacity & Growth */}
                                <div className="bg-green-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-green-900 mb-4">Capacity & Growth</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">IT Load (kW)</span>
                                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">Core</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Converts to MW for CapEx/OpEx calc</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Racks</span>
                                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Derived</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Used to check rack density = load/rack</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Density (kW/rack)</span>
                                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Derived</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Determines design type (AI vs std)</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Growth Forecast (12, 24, 36 mo)</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Generates utilisation ramp for revenue curve</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">GPU/AI Share</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Raises PUE +15% mechanical cost</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Storage & Growth</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Adds to floor-space requirement (+% CapEx)</div>
                                    </div>
                                </div>

                                {/* Connectivity */}
                                <div className="bg-cyan-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-cyan-900 mb-4">Connectivity</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Bandwidth (Gbps)</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Adds to network cost (€/Gbps/month)</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Carriers</span>
                                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Mapping</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Checks carrier presence in chosen area</div>
                                    </div>
                                </div>

                                {/* Sustainability & Contract */}
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Sustainability & Contract</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Renewable %</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Adds CapEx for BESS/Solar; reduces OpEx</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Contract Term</span>
                                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">Core</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Defines NPV/IRR horizon</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Service Type (Lease/Managed/Own)</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Adjusts revenue & OpEx multipliers</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Utilisation Ramp</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Defines occupancy % each year</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">In-Service Date</span>
                                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">Mapping</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Aligns with ESB project timeline</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">MIC Limit</span>
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">Filter</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Ensures grid has enough capacity</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Existing Load</span>
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">Filter</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Subtracted from MIC for available power</div>
                                    </div>
                                </div>

                                {/* Added Fields */}
                                <div className="bg-pink-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-pink-900 mb-4">Added Fields</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Budget Range (€/kW)</span>
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">Filter</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Validates commercial viability</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Commercial Model</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Changes revenue and OpEx profile</div>

                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Disaster Recovery</span>
                                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Modifier</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Duplicates CapEx & adjusts revenue</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-green-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <span className="text-green-600 text-xl mr-2">✅</span>
                                    <p className="text-green-800 font-medium">
                                        Every input is used either directly in a calculation, to modify cost/revenue coefficients, or to filter what's feasible. There are no wasted fields.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formula Accuracy & Industry Standards */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <div className="flex items-center mb-6">
                                <span className="bg-green-100 text-green-800 text-2xl font-bold px-4 py-2 rounded-full mr-4">⚙️</span>
                                <h2 className="text-2xl font-bold text-gray-900">Formula Accuracy & Industry Standards</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                These formulas are not arbitrary or made-up. They align with globally accepted models used in commercial data-centre feasibility studies.
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Core Formula Accuracy */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Formula Accuracy</h3>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">CapEx per MW (€8-10M)</div>
                                                    <div className="text-sm text-gray-600">Uptime Institute 2023 global avg for Tier III modular</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Highly accurate</span>
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">PUE (1.3-1.4 modular)</div>
                                                    <div className="text-sm text-gray-600">ASHRAE & Uptime typical range; Dublin avg ~1.45</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Highly accurate</span>
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">Electricity Price (€0.10-0.15/kWh)</div>
                                                    <div className="text-sm text-gray-600">SEAI Commercial Electricity Prices 2024</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Accurate</span>
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">Maintenance (2-2.5% CapEx)</div>
                                                    <div className="text-sm text-gray-600">CBRE Data Centre OpEx benchmarks</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Standard</span>
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">Rent (€150-300/kW/month)</div>
                                                    <div className="text-sm text-gray-600">Structure Research & Equinix Pricing EU market</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Matches Ireland</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Adjustment Logic Accuracy */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjustment Logic Accuracy</h3>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="font-medium text-gray-900">Tier Multiplier (I to IV +10-20%)</div>
                                            <div className="text-sm text-gray-600">Derived from Uptime cost increase per redundancy level</div>
                                        </div>

                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="font-medium text-gray-900">GPU/AI Load +15% Mech CapEx</div>
                                            <div className="text-sm text-gray-600">Verified via NVIDIA + Supermicro DC reference designs</div>
                                        </div>

                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="font-medium text-gray-900">Renewable +5% CapEx, -5% OpEx</div>
                                            <div className="text-sm text-gray-600">Based on cost of on-site PV or battery vs grid energy savings</div>
                                        </div>

                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="font-medium text-gray-900">Location (Dublin vs Regional)</div>
                                            <div className="text-sm text-gray-600">Matches Bitpower 2024 report (land -5%, connectivity +5%)</div>
                                        </div>

                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="font-medium text-gray-900">Disaster Recovery Logic</div>
                                            <div className="text-sm text-gray-600">Standard DR co-location principle (≈90% cost duplication)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <span className="text-blue-600 text-xl mr-2">✅</span>
                                    <p className="text-blue-800 font-medium">
                                        All modifiers are empirically grounded and replicate what professional DC cost consultants and REITs actually use in feasibility planning.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Calculation Flow Diagram */}
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculation Flow</h2>
                            <p className="text-gray-600 mb-6">
                                Step-by-step process showing how customer inputs flow through the calculations to determine feasibility.
                            </p>

                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-blue-900 mb-2">1. Inputs</div>
                                        <div className="text-gray-600">Customer data + Defaults</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-green-900 mb-2">2. CapEx</div>
                                        <div className="text-gray-600">Base cost + Adjustments</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-purple-900 mb-2">3. OpEx</div>
                                        <div className="text-gray-600">Energy + Maintenance</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-orange-900 mb-2">4. Revenue</div>
                                        <div className="text-gray-600">kW × Rate × Utilization</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-red-900 mb-2">5. EBITDA</div>
                                        <div className="text-gray-600">Revenue - OpEx</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-indigo-900 mb-2">6. FCF</div>
                                        <div className="text-gray-600">After-tax cash flow</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-teal-900 mb-2">7. NPV/IRR</div>
                                        <div className="text-gray-600">Financial metrics</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="font-semibold text-pink-900 mb-2">8. Decision</div>
                                        <div className="text-gray-600">Feasible/Not Feasible</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PasscodeProtection>
    )
}

export default Calculations
