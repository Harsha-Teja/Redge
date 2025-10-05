/**
 * Infrastructure Cost Calculator component for ReDge
 * Provides comprehensive cost analysis for data center infrastructure
 * Includes input toggles, calculations, and sensitivity analysis
 */

import React, { useState, useEffect } from 'react'
import
{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
)

/**
 * Infrastructure Cost Calculator Component
 * Provides comprehensive cost analysis with input controls and output metrics
 * @returns {JSX.Element} - Complete calculator component
 */
export const InfrastructureCostCalculator = () =>
{
    // Input state management
    const [inputs, setInputs] = useState({
        // CapEx inputs
        capexPerKw: 2500, // €/kW
        softCostMultiplier: 15, // %
        pue: 1.3, // Power Usage Effectiveness
        discountRate: 8, // % WACC
        maintenancePercent: 3, // % of CapEx/year

        // OpEx inputs
        energyPrice: 120, // €/MWh
        staffingCost: 150000, // €/year
        insuranceOverhead: 50000, // €/year
        complianceUplift: 10, // %
        crossConnectCost: 25, // €/Gbps/month
        egressCost: 0.05, // €/GB
        supportOverhead: 15, // % of spend

        // Utilization inputs
        rampYear1: 20, // %
        rampYear2: 50, // %
        rampYear3: 80, // %
        rampYear4: 95, // %
        rampYear5: 100, // %

        // Pricing inputs
        sellingPricePerKw: 4000, // €/kW/year
        capacityKw: 1000 // kW capacity
    })

    // Calculated outputs
    const [outputs, setOutputs] = useState({})
    const [sensitivityData, setSensitivityData] = useState({})
    const [isCalculating, setIsCalculating] = useState(false)

    // Calculate all outputs when inputs change
    useEffect(() =>
    {
        setIsCalculating(true)
        calculateOutputs()
        calculateSensitivity()
        setIsCalculating(false)
    }, [inputs])

    /**
     * Calculate all output metrics based on current inputs
     */
    const calculateOutputs = () =>
    {
        const {
            capexPerKw,
            softCostMultiplier,
            pue,
            discountRate,
            maintenancePercent,
            energyPrice,
            staffingCost,
            insuranceOverhead,
            complianceUplift,
            crossConnectCost,
            egressCost,
            supportOverhead,
            rampYear1,
            rampYear2,
            rampYear3,
            rampYear4,
            rampYear5,
            sellingPricePerKw,
            capacityKw
        } = inputs

        // Calculate base CapEx
        const baseCapEx = capexPerKw * capacityKw
        const softCosts = baseCapEx * (softCostMultiplier / 100)
        const totalCapEx = baseCapEx + softCosts

        // Annualize CapEx using discount rate
        const annualizedCapEx = totalCapEx * (discountRate / 100) * Math.pow(1 + discountRate / 100, 5) / (Math.pow(1 + discountRate / 100, 5) - 1)

        // Calculate annual OpEx components
        const energyConsumption = capacityKw * pue * 8760 // MWh/year
        const annualEnergyCost = energyConsumption * energyPrice / 1000 // €/year

        const annualMaintenance = totalCapEx * (maintenancePercent / 100)
        const annualStaffing = staffingCost
        const annualInsurance = insuranceOverhead
        const annualCompliance = (annualEnergyCost + annualMaintenance + annualStaffing) * (complianceUplift / 100)

        // Network costs (estimated based on capacity)
        const estimatedBandwidth = capacityKw * 0.1 // Gbps (rough estimate)
        const annualCrossConnect = estimatedBandwidth * crossConnectCost * 12
        const annualEgress = capacityKw * 1000 * egressCost * 12 // Rough estimate

        const baseOpEx = annualEnergyCost + annualMaintenance + annualStaffing + annualInsurance + annualCompliance + annualCrossConnect + annualEgress
        const supportOverheadCost = baseOpEx * (supportOverhead / 100)
        const totalOpEx = baseOpEx + supportOverheadCost

        // Calculate utilization-adjusted costs
        const rampTrajectory = [rampYear1, rampYear2, rampYear3, rampYear4, rampYear5]
        const utilizationAdjustedCosts = rampTrajectory.map(util => ({
            year: `Year ${rampTrajectory.indexOf(util) + 1}`,
            utilization: util,
            capex: annualizedCapEx,
            opex: totalOpEx * (util / 100),
            total: annualizedCapEx + (totalOpEx * (util / 100))
        }))

        // Calculate revenue and profit
        const annualRevenue = capacityKw * sellingPricePerKw
        const profitMargin = ((annualRevenue - totalOpEx) / annualRevenue) * 100
        const roi = ((annualRevenue - totalOpEx) / totalCapEx) * 100
        const paybackYears = totalCapEx / (annualRevenue - totalOpEx)

        // 1, 3, 5 year costs
        const cost1Year = utilizationAdjustedCosts[0].total
        const cost3Year = utilizationAdjustedCosts.slice(0, 3).reduce((sum, cost) => sum + cost.total, 0)
        const cost5Year = utilizationAdjustedCosts.reduce((sum, cost) => sum + cost.total, 0)

        setOutputs({
            annualizedCapEx,
            totalOpEx,
            cost1Year,
            cost3Year,
            cost5Year,
            profitMargin,
            roi,
            paybackYears,
            utilizationAdjustedCosts,
            annualRevenue,
            totalCapEx
        })
    }

    /**
     * Calculate sensitivity analysis for different parameters
     */
    const calculateSensitivity = () =>
    {
        const baseOutputs = { ...outputs }
        const sensitivityResults = {}

        // Define parameters to test
        const parameters = [
            { key: 'capexPerKw', label: 'CapEx per kW', range: [-20, -10, 10, 20] },
            { key: 'energyPrice', label: 'Energy Price', range: [-30, -15, 15, 30] },
            { key: 'pue', label: 'PUE', range: [-10, -5, 5, 10] },
            { key: 'discountRate', label: 'Discount Rate', range: [-25, -12, 12, 25] },
            { key: 'maintenancePercent', label: 'Maintenance %', range: [-33, -16, 16, 33] }
        ]

        parameters.forEach(param =>
        {
            const variations = param.range.map(change =>
            {
                const testInputs = { ...inputs }
                const currentValue = testInputs[param.key]
                const newValue = currentValue * (1 + change / 100)
                testInputs[param.key] = newValue

                // Recalculate with modified input
                const modifiedOutputs = calculateModifiedOutputs(testInputs)
                return {
                    change,
                    value: modifiedOutputs.roi
                }
            })

            sensitivityResults[param.key] = {
                label: param.label,
                variations
            }
        })

        setSensitivityData(sensitivityResults)
    }

    /**
     * Calculate outputs with modified inputs for sensitivity analysis
     */
    const calculateModifiedOutputs = (modifiedInputs) =>
    {
        const {
            capexPerKw,
            softCostMultiplier,
            pue,
            discountRate,
            maintenancePercent,
            energyPrice,
            staffingCost,
            insuranceOverhead,
            complianceUplift,
            crossConnectCost,
            egressCost,
            supportOverhead,
            rampYear1,
            rampYear2,
            rampYear3,
            rampYear4,
            rampYear5,
            sellingPricePerKw,
            capacityKw
        } = modifiedInputs

        const baseCapEx = capexPerKw * capacityKw
        const softCosts = baseCapEx * (softCostMultiplier / 100)
        const totalCapEx = baseCapEx + softCosts
        const annualizedCapEx = totalCapEx * (discountRate / 100) * Math.pow(1 + discountRate / 100, 5) / (Math.pow(1 + discountRate / 100, 5) - 1)

        const energyConsumption = capacityKw * pue * 8760
        const annualEnergyCost = energyConsumption * energyPrice / 1000
        const annualMaintenance = totalCapEx * (maintenancePercent / 100)
        const annualStaffing = staffingCost
        const annualInsurance = insuranceOverhead
        const annualCompliance = (annualEnergyCost + annualMaintenance + annualStaffing) * (complianceUplift / 100)

        const estimatedBandwidth = capacityKw * 0.1
        const annualCrossConnect = estimatedBandwidth * crossConnectCost * 12
        const annualEgress = capacityKw * 1000 * egressCost * 12

        const baseOpEx = annualEnergyCost + annualMaintenance + annualStaffing + annualInsurance + annualCompliance + annualCrossConnect + annualEgress
        const supportOverheadCost = baseOpEx * (supportOverhead / 100)
        const totalOpEx = baseOpEx + supportOverheadCost

        const annualRevenue = capacityKw * sellingPricePerKw
        const roi = ((annualRevenue - totalOpEx) / totalCapEx) * 100

        return { roi, totalCapEx, totalOpEx, annualRevenue }
    }

    /**
     * Handle input changes
     */
    const handleInputChange = (key, value) =>
    {
        setInputs(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }))
    }

    /**
     * Create sensitivity chart data
     */
    const createSensitivityChartData = () =>
    {
        if (!sensitivityData || Object.keys(sensitivityData).length === 0)
        {
            return {
                labels: ['No Data'],
                datasets: [{
                    label: 'ROI Impact (%)',
                    data: [0],
                    backgroundColor: ['#6B7280'],
                    borderColor: ['#4B5563'],
                    borderWidth: 1
                }]
            }
        }

        const parameters = Object.keys(sensitivityData)
        const chartData = {
            labels: parameters.map(key => sensitivityData[key].label),
            datasets: [
                {
                    label: 'ROI Impact (%)',
                    data: parameters.map(key =>
                    {
                        const variations = sensitivityData[key].variations
                        const maxImpact = Math.max(...variations.map(v => Math.abs(v.value - (outputs.roi || 0))))
                        return maxImpact
                    }),
                    backgroundColor: [
                        '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'
                    ],
                    borderColor: [
                        '#DC2626', '#D97706', '#1E40AF', '#059669', '#7C3AED'
                    ],
                    borderWidth: 1
                }
            ]
        }

        return chartData
    }

    /**
     * Create utilization trajectory chart
     */
    const createUtilizationChartData = () =>
    {
        if (!outputs.utilizationAdjustedCosts || outputs.utilizationAdjustedCosts.length === 0)
        {
            return {
                labels: ['No Data'],
                datasets: [
                    {
                        label: 'CapEx (€)',
                        data: [0],
                        borderColor: '#3B82F6',
                        backgroundColor: '#3B82F620',
                        tension: 0.1
                    },
                    {
                        label: 'OpEx (€)',
                        data: [0],
                        borderColor: '#10B981',
                        backgroundColor: '#10B98120',
                        tension: 0.1
                    },
                    {
                        label: 'Total Cost (€)',
                        data: [0],
                        borderColor: '#EF4444',
                        backgroundColor: '#EF444420',
                        tension: 0.1
                    }
                ]
            }
        }

        const chartData = {
            labels: outputs.utilizationAdjustedCosts.map(item => item.year),
            datasets: [
                {
                    label: 'CapEx (€)',
                    data: outputs.utilizationAdjustedCosts.map(item => item.capex),
                    borderColor: '#3B82F6',
                    backgroundColor: '#3B82F620',
                    tension: 0.1
                },
                {
                    label: 'OpEx (€)',
                    data: outputs.utilizationAdjustedCosts.map(item => item.opex),
                    borderColor: '#10B981',
                    backgroundColor: '#10B98120',
                    tension: 0.1
                },
                {
                    label: 'Total Cost (€)',
                    data: outputs.utilizationAdjustedCosts.map(item => item.total),
                    borderColor: '#EF4444',
                    backgroundColor: '#EF444420',
                    tension: 0.1
                }
            ]
        }

        return chartData
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Infrastructure Cost Calculator</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Controls */}
                <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Input Parameters</h4>

                    {/* CapEx Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3">Capital Expenditure</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    CapEx per kW (€/kW)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.capexPerKw}
                                    onChange={(e) => handleInputChange('capexPerKw', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Soft Cost Multiplier (%)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.softCostMultiplier}
                                    onChange={(e) => handleInputChange('softCostMultiplier', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    PUE (Efficiency)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={inputs.pue}
                                    onChange={(e) => handleInputChange('pue', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Discount Rate (%)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.discountRate}
                                    onChange={(e) => handleInputChange('discountRate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* OpEx Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3">Operational Expenditure</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Energy Price (€/MWh)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.energyPrice}
                                    onChange={(e) => handleInputChange('energyPrice', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Maintenance (% of CapEx/year)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.maintenancePercent}
                                    onChange={(e) => handleInputChange('maintenancePercent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Staffing Cost (€/year)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.staffingCost}
                                    onChange={(e) => handleInputChange('staffingCost', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Insurance/Overhead (€/year)
                                </label>
                                <input
                                    type="number"
                                    value={inputs.insuranceOverhead}
                                    onChange={(e) => handleInputChange('insuranceOverhead', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Utilization Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3">Utilization Trajectory (%)</h5>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(year => (
                                <div key={year}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Year {year}
                                    </label>
                                    <input
                                        type="number"
                                        value={inputs[`rampYear${year}`]}
                                        onChange={(e) => handleInputChange(`rampYear${year}`, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Output Metrics */}
                <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Output Metrics</h4>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                €{outputs.annualizedCapEx?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Annualized CapEx</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">
                                €{outputs.totalOpEx?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total OpEx</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {outputs.profitMargin?.toFixed(1) || 0}%
                            </div>
                            <div className="text-sm text-gray-600">Profit Margin</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {outputs.roi?.toFixed(1) || 0}%
                            </div>
                            <div className="text-sm text-gray-600">ROI</div>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3">Cost Breakdown</h5>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">1 Year Cost:</span>
                                <span className="font-semibold">€{outputs.cost1Year?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">3 Year Cost:</span>
                                <span className="font-semibold">€{outputs.cost3Year?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">5 Year Cost:</span>
                                <span className="font-semibold">€{outputs.cost5Year?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600">Payback Period:</span>
                                <span className="font-semibold">{outputs.paybackYears?.toFixed(1) || 0} years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sensitivity Analysis Chart */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Cost Sensitivity Analysis</h4>
                    <div className="bg-white border rounded-lg p-4">
                        {isCalculating ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-gray-500">Calculating...</div>
                            </div>
                        ) : (
                            <Bar
                                data={createSensitivityChartData()}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top'
                                        },
                                        title: {
                                            display: true,
                                            text: 'Parameter Sensitivity Impact on ROI'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'ROI Impact (%)'
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Utilization Trajectory Chart */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Cost Trajectory</h4>
                    <div className="bg-white border rounded-lg p-4">
                        {isCalculating ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-gray-500">Calculating...</div>
                            </div>
                        ) : (
                            <Line
                                data={createUtilizationChartData()}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top'
                                        },
                                        title: {
                                            display: true,
                                            text: 'Cost Breakdown Over Time'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Cost (€)'
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
