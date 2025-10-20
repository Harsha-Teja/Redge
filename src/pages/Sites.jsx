/**
 * Modular DC Analysis page for ReDge - Comprehensive data center feasibility analysis
 * Provides interactive maps, feasibility scoring, and analytical charts for customer submissions
 * Protected by passcode authentication
 * Displays form submissions with location-based analysis and financial feasibility calculations
 */
import { useState, useEffect } from 'react'
import { fetchFormSubmissions, fetchContactSubmissions } from '../lib/supabase.js'
import PasscodeProtection from '../components/PasscodeProtection.jsx'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import
{
    DemandTypeVsPowerChart,
    RegionalHeatMapChart,
    SustainabilityTargetsChart,
    ServiceDemandMixChart,
    TierPreferenceChart,
    BudgetVsLoadChart
} from '../components/Charts.jsx'

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

// Create wind farm icon
const createWindFarmIcon = (capacity) =>
{
    try
    {
        const size = Math.max(12, Math.min(24, capacity / 10)) // Scale icon size based on capacity
        const windFarmIcon = L.divIcon({
            className: 'wind-farm-icon',
            html: `<div style="
                background-color: #10B981;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(8, size - 4)}px;
            ">🌬️</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        })
        return windFarmIcon
    } catch (error)
    {
        // Fallback to default marker if custom marker fails
        return new L.Icon.Default()
    }
}

// Create energy demand icon
const createEnergyDemandIcon = (capacity) =>
{
    try
    {
        const size = Math.max(10, Math.min(20, capacity / 5)) // Scale icon size based on capacity
        const demandIcon = L.divIcon({
            className: 'energy-demand-icon',
            html: `<div style="
                background-color: #EF4444;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(6, size - 4)}px;
            ">⚡</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        })
        return demandIcon
    } catch (error)
    {
        return new L.Icon.Default()
    }
}

// Create energy generation icon
const createEnergyGenerationIcon = (capacity) =>
{
    try
    {
        const size = Math.max(10, Math.min(20, capacity / 5)) // Scale icon size based on capacity
        const generationIcon = L.divIcon({
            className: 'energy-generation-icon',
            html: `<div style="
                background-color: #3B82F6;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(6, size - 4)}px;
            ">🔋</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        })
        return generationIcon
    } catch (error)
    {
        return new L.Icon.Default()
    }
}

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

/**
 * Feasibility Results Component
 * Calculates and displays feasibility study results for a selected customer
 */
const FeasibilityResults = ({ customerData }) =>
{
    // Default parameters
    const DEFAULTS = {
        capexPerMW: 9000000, // €9M per MW for Tier III modular
        pue: 1.4,
        elecPrice: 120, // €120/MWh
        discountRate: 0.08, // 8%
        targetIRR: 0.10, // 10%
        targetPayback: 7, // 7 years
        pricePerKWMonth: 250, // €250/kW/month
        taxRate: 0.25, // 25%
        sustainingCapexRate: 0.005 // 0.5% of CapEx
    }

    // Extract customer data with defaults
    const itLoadKW = parseFloat(customerData.current_it_load) || 0
    const tier = customerData.availability_tier || 'Tier III'
    const gpuShare = parseFloat(customerData.gpu_ai_share) || 0
    const renewableTarget = parseFloat(customerData.renewable_target) || 0
    const commercialModel = customerData.commercial_model || 'Lease'
    const contractTerm = parseInt(customerData.contract_term) || 5
    const micLimit = parseFloat(customerData.mic_limit) || 0
    const existingLoad = parseFloat(customerData.existing_load) || 0
    const backupDR = customerData.backup_dr || 'No - Not required'

    // 1️⃣ Power Capacity Conversion
    const powerMW = itLoadKW / 1000

    // 2️⃣ Base Capital Cost (CapEx)
    const capexBase = powerMW * DEFAULTS.capexPerMW

    // 3️⃣ Design Adjustments (multipliers)
    const tierMultiplier = tier === 'Tier II' ? 1.10 : tier === 'Tier III' ? 1.00 : tier === 'Tier IV' ? 1.20 : 1.00
    const gpuMultiplier = gpuShare > 30 ? 1.15 : 1.00
    const renewableMultiplier = renewableTarget >= 80 ? 1.05 : 1.00
    const drMultiplier = backupDR === 'Yes - Required' ? 1.9 : 1.00

    const capex = capexBase * tierMultiplier * gpuMultiplier * renewableMultiplier * drMultiplier

    // 4️⃣ Yearly Energy Consumption
    const energyMWhYr = powerMW * DEFAULTS.pue * 8760

    // 5️⃣ Energy Cost
    const energyDiscount = renewableTarget >= 80 ? 0.95 : 1.00
    const energyCostYr = energyMWhYr * DEFAULTS.elecPrice * energyDiscount

    // 6️⃣ Operating Expenses (OpEx)
    const opexYr = energyCostYr + capex * (0.02 + 0.03 + 0.005) // energy + 2% maintenance + 3% staff + 0.5% insurance

    // 7️⃣ Annual Revenue
    const serviceMultiplier = commercialModel === 'Managed Service' ? 1.20 : commercialModel === 'Own' ? 0 : 1.00
    const utilizationFactor = 0.7 // Default 70% utilization
    const revenueYr = itLoadKW * DEFAULTS.pricePerKWMonth * 12 * utilizationFactor * serviceMultiplier

    // 8️⃣ EBITDA (Operating Profit)
    const ebitda = revenueYr - opexYr

    // 9️⃣ Free Cash Flow (FCF) calculation
    const calculateFCF = (year) =>
    {
        if (year === 0) return -capex
        const sustainingCapex = capex * DEFAULTS.sustainingCapexRate
        return ebitda * (1 - DEFAULTS.taxRate) - sustainingCapex
    }

    // 🔟 Net Present Value (NPV)
    const calculateNPV = () =>
    {
        let npv = -capex // Year 0
        for (let t = 1; t <= contractTerm; t++)
        {
            const fcf = calculateFCF(t)
            npv += fcf / Math.pow(1 + DEFAULTS.discountRate, t)
        }
        return npv
    }
    const npv = calculateNPV()

    // 1️⃣1️⃣ Internal Rate of Return (IRR) - Simplified calculation
    const calculateIRR = () =>
    {
        // Simplified IRR calculation using approximation
        let irr = 0.08 // Start with discount rate
        let npvAtIRR = 0
        let iterations = 0
        const maxIterations = 100

        while (Math.abs(npvAtIRR) > 1000 && iterations < maxIterations)
        {
            npvAtIRR = -capex
            for (let t = 1; t <= contractTerm; t++)
            {
                const fcf = calculateFCF(t)
                npvAtIRR += fcf / Math.pow(1 + irr, t)
            }
            irr += npvAtIRR > 0 ? 0.01 : -0.01
            iterations++
        }
        return Math.max(0, Math.min(1, irr)) // Clamp between 0% and 100%
    }
    const irr = calculateIRR()

    // 1️⃣2️⃣ Payback Period
    const calculatePaybackPeriod = () =>
    {
        let cumulativeFCF = -capex
        for (let year = 1; year <= contractTerm; year++)
        {
            cumulativeFCF += calculateFCF(year)
            if (cumulativeFCF >= 0) return year
        }
        return contractTerm + 1 // Never pays back within contract term
    }
    const paybackPeriod = calculatePaybackPeriod()

    // 1️⃣3️⃣ Feasibility Flag
    const isFeasible = irr >= DEFAULTS.targetIRR && paybackPeriod <= DEFAULTS.targetPayback

    // 1️⃣4️⃣ Grid Check
    const gridOK = powerMW <= (micLimit - existingLoad)

    return (
        <div className="space-y-8">
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Power Capacity</h3>
                    <p className="text-3xl font-bold text-blue-600">{powerMW.toFixed(2)} MW</p>
                    <p className="text-sm text-blue-700 mt-1">Converts {itLoadKW} kW to megawatts</p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Total CapEx</h3>
                    <p className="text-3xl font-bold text-green-600">€{(capex / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-green-700 mt-1">Build cost with adjustments</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">IRR</h3>
                    <p className="text-3xl font-bold text-purple-600">{(irr * 100).toFixed(1)}%</p>
                    <p className="text-sm text-purple-700 mt-1">Internal Rate of Return</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Payback</h3>
                    <p className="text-3xl font-bold text-orange-600">{paybackPeriod} years</p>
                    <p className="text-sm text-orange-700 mt-1">Time to break even</p>
                </div>
            </div>

            {/* Feasibility Status */}
            <div className={`rounded-lg p-6 ${isFeasible ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`text-xl font-bold ${isFeasible ? 'text-green-900' : 'text-red-900'}`}>
                            {isFeasible ? '✅ Feasible Project' : '❌ Not Feasible'}
                        </h3>
                        <p className={`text-sm ${isFeasible ? 'text-green-700' : 'text-red-700'} mt-1`}>
                            {isFeasible
                                ? `IRR ${(irr * 100).toFixed(1)}% ≥ 10% and Payback ${paybackPeriod} years ≤ 7 years`
                                : `IRR ${(irr * 100).toFixed(1)}% < 10% or Payback ${paybackPeriod} years > 7 years`
                            }
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${isFeasible ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {isFeasible ? 'APPROVED' : 'REJECTED'}
                    </div>
                </div>
            </div>

            {/* Grid Check */}
            <div className={`rounded-lg p-6 ${gridOK ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`text-lg font-semibold ${gridOK ? 'text-green-900' : 'text-red-900'}`}>
                            {gridOK ? '✅ Grid Capacity Available' : '❌ Insufficient Grid Capacity'}
                        </h3>
                        <p className={`text-sm ${gridOK ? 'text-green-700' : 'text-red-700'} mt-1`}>
                            {gridOK
                                ? `Required ${powerMW.toFixed(2)} MW ≤ Available ${(micLimit - existingLoad).toFixed(2)} MW`
                                : `Required ${powerMW.toFixed(2)} MW > Available ${(micLimit - existingLoad).toFixed(2)} MW`
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Financial Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Capital Expenditure Breakdown */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Capital Expenditure</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Base Cost ({powerMW.toFixed(2)} MW × €9M)</span>
                            <span className="font-medium">€{(capexBase / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tier Adjustment ({tier})</span>
                            <span className="font-medium">×{tierMultiplier.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">GPU Cooling ({gpuShare}%)</span>
                            <span className="font-medium">×{gpuMultiplier.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Renewable ({renewableTarget}%)</span>
                            <span className="font-medium">×{renewableMultiplier.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">DR Sites ({backupDR})</span>
                            <span className="font-medium">×{drMultiplier.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total CapEx</span>
                                <span>€{(capex / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operating Expenses Breakdown */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Operating Costs</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Energy Cost</span>
                            <span className="font-medium">€{(energyCostYr / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance (2%)</span>
                            <span className="font-medium">€{((capex * 0.02) / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Staff (3%)</span>
                            <span className="font-medium">€{((capex * 0.03) / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Insurance (0.5%)</span>
                            <span className="font-medium">€{((capex * 0.005) / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total OpEx</span>
                                <span>€{(opexYr / 1000).toFixed(0)}K</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue and Profitability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">IT Load</span>
                            <span className="font-medium">{itLoadKW} kW</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Rate</span>
                            <span className="font-medium">€{DEFAULTS.pricePerKWMonth}/kW</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Utilization</span>
                            <span className="font-medium">{(utilizationFactor * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service Model</span>
                            <span className="font-medium">{commercialModel}</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Annual Revenue</span>
                                <span>€{(revenueYr / 1000).toFixed(0)}K</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Metrics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">EBITDA</span>
                            <span className="font-medium">€{(ebitda / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">NPV (8% discount)</span>
                            <span className="font-medium">€{(npv / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">IRR</span>
                            <span className="font-medium">{(irr * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Payback Period</span>
                            <span className="font-medium">{paybackPeriod} years</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Contract Term</span>
                            <span className="font-medium">{contractTerm} years</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ModularDCAnalysis()
{
    // State for managing form submissions data
    const [formSubmissions, setFormSubmissions] = useState([])
    const [contactSubmissions, setContactSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [contactLoading, setContactLoading] = useState(true)
    const [error, setError] = useState(null)
    const [contactError, setContactError] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)

    // Wind farm data state
    const [windFarmData, setWindFarmData] = useState([])
    const [isLoadingWindFarms, setIsLoadingWindFarms] = useState(true)

    // Energy data state
    const [energyDemandData, setEnergyDemandData] = useState([])
    const [energyGenerationData, setEnergyGenerationData] = useState([])
    const [isLoadingEnergyData, setIsLoadingEnergyData] = useState(true)

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

    // Load wind farm data from windfarms.geojson
    useEffect(() =>
    {
        const loadWindFarmData = async () =>
        {
            try
            {
                const response = await fetch('/data/windfarms.geojson')
                if (response.ok)
                {
                    const data = await response.json()
                    // Parse the wind farm data - data comes as objects with numeric keys
                    const windFarms = []
                    const windFarmNames = data.Windfarm_Name
                    const counties = data.County
                    const capacities = data.MEC__MW_
                    const latitudes = data.lat
                    const longitudes = data.lon

                    // Get the number of wind farms from the first property
                    const numWindFarms = Object.keys(windFarmNames).length

                    for (let i = 0; i < numWindFarms; i++)
                    {
                        windFarms.push({
                            name: windFarmNames[i],
                            county: counties[i],
                            capacity: capacities[i],
                            lat: latitudes[i],
                            lon: longitudes[i]
                        })
                    }
                    setWindFarmData(windFarms)
                    setIsLoadingWindFarms(false)
                } else
                {
                    console.error('Failed to load wind farm data')
                    setIsLoadingWindFarms(false)
                }
            } catch (error)
            {
                console.error('Error loading wind farm data:', error)
                setIsLoadingWindFarms(false)
            }
        }

        loadWindFarmData()
    }, [])

    // Load energy demand and generation data
    useEffect(() =>
    {
        const loadEnergyData = async () =>
        {
            try
            {
                // Load energy demand data
                const demandResponse = await fetch('/data/energy_demand.geojson')
                if (demandResponse.ok)
                {
                    const demandData = await demandResponse.json()
                    const demandFeatures = demandData.features.map(feature => ({
                        name: feature.properties.Station_Name,
                        transformerGroup: feature.properties.Transformer_GroupID,
                        voltageClass: feature.properties.Voltage_Class,
                        primaryKv: feature.properties.Primary_kV,
                        installedCapacity: feature.properties.Installed_Capacity_MVA,
                        demandFirmCapacity: feature.properties.Demand_FirmCapacity_MVA,
                        demandAvailable: feature.properties.Demand_Available_MVA,
                        lat: feature.properties.Latitude,
                        lon: feature.properties.Longitude
                    }))
                    setEnergyDemandData(demandFeatures)
                }

                // Load energy generation data
                const generationResponse = await fetch('/data/energy_generation.geojson')
                if (generationResponse.ok)
                {
                    const generationData = await generationResponse.json()
                    const generationFeatures = generationData.features.map(feature => ({
                        name: feature.properties.Station_Name,
                        transformerGroup: feature.properties.Transformer_GroupID,
                        voltageClass: feature.properties.Voltage_Class,
                        primaryKv: feature.properties.Primary_kV,
                        installedCapacity: feature.properties.Installed_Capacity_MVA,
                        genAvailableFirm: feature.properties.Gen_Available_Firm_MW,
                        genAvailableNonFirm: feature.properties.Gen_Available_NonFirm_MW,
                        lat: feature.properties.Latitude,
                        lon: feature.properties.Longitude
                    }))
                    setEnergyGenerationData(generationFeatures)
                }

                setIsLoadingEnergyData(false)
            } catch (error)
            {
                console.error('Error loading energy data:', error)
                setIsLoadingEnergyData(false)
            }
        }

        loadEnergyData()
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
     * Calculate feasibility score for a customer submission
     * @param {Object} submission - Customer submission data
     * @returns {Object} Feasibility score and details
     */
    const calculateFeasibilityScore = (submission) =>
    {
        const itLoadKW = parseFloat(submission.current_it_load) || 0
        const tier = submission.availability_tier || 'Tier III'
        const gpuShare = parseFloat(submission.gpu_ai_share) || 0
        const renewableTarget = parseFloat(submission.renewable_target) || 0
        const commercialModel = submission.commercial_model || 'Lease'
        const contractTerm = parseInt(submission.contract_term) || 5
        const micLimit = parseFloat(submission.mic_limit) || 0
        const existingLoad = parseFloat(submission.existing_load) || 0
        const backupDR = submission.backup_dr || 'No - Not required'

        // Basic feasibility calculation (simplified)
        const powerMW = itLoadKW / 1000
        const capexPerMW = 9000000
        const tierMultiplier = tier === 'Tier II' ? 1.10 : tier === 'Tier III' ? 1.00 : tier === 'Tier IV' ? 1.20 : 1.00
        const gpuMultiplier = gpuShare > 30 ? 1.15 : 1.00
        const renewableMultiplier = renewableTarget >= 80 ? 1.05 : 1.00
        const drMultiplier = backupDR === 'Yes - Required' ? 1.9 : 1.00

        const capex = powerMW * capexPerMW * tierMultiplier * gpuMultiplier * renewableMultiplier * drMultiplier
        const revenue = itLoadKW * 250 * 12 * 0.7 * (commercialModel === 'Managed Service' ? 1.20 : 1.00)
        const opex = powerMW * 1.4 * 8760 * 120 * 0.95 + capex * 0.055 // Simplified OpEx calculation
        const ebitda = revenue - opex

        // Simple feasibility score (0-100)
        let score = 50 // Base score

        // Adjust based on financials
        if (ebitda > 0) score += 20
        if (capex < 10000000) score += 15 // Lower CapEx is better
        if (contractTerm >= 7) score += 10 // Longer contracts are better
        if (renewableTarget >= 80) score += 10 // Green energy bonus
        if (gpuShare > 30) score -= 10 // High GPU requirements reduce feasibility
        if (backupDR === 'Yes - Required') score -= 15 // DR requirement reduces feasibility

        // Grid capacity check
        const gridOK = powerMW <= (micLimit - existingLoad)
        if (!gridOK) score -= 30

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score))

        return {
            score: Math.round(score),
            capex: Math.round(capex / 1000000), // In millions
            ebitda: Math.round(ebitda / 1000), // In thousands
            gridOK,
            powerMW: powerMW.toFixed(2)
        }
    }

    /**
     * Process submissions to create map markers (only customer leads, no contact forms)
     * @returns {Array} Array of map markers with coordinates and submission data
     */
    const processSubmissionsForMap = () =>
    {
        const mapData = []

        // Process only customer lead submissions (remove contact form processing)
        formSubmissions.forEach((submission, index) =>
        {
            const location = submission.location || submission.eircode || 'Dublin'
            const county = extractCountyFromLocation(location)
            const coordinates = COUNTY_COORDINATES[county] || COUNTY_COORDINATES['Dublin']
            const feasibility = calculateFeasibilityScore(submission)

            mapData.push({
                id: `customer-${submission.id}`,
                type: 'customer',
                coordinates,
                county,
                submission,
                feasibility,
                color: feasibility.score >= 70 ? '#10B981' : feasibility.score >= 40 ? '#F59E0B' : '#EF4444' // Green/Orange/Red based on feasibility
            })
        })

        return mapData
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
            title="Modular DC Analysis Access Required"
            subtitle="Please enter the passcode to view our data center sites information"
        >
            <main className="pt-20">
                <div className="py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Modular DC Analysis
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

                                    {processSubmissionsForMap().map((marker) => (
                                        <Marker
                                            key={marker.id}
                                            position={[marker.coordinates[0], marker.coordinates[1]]}
                                            icon={createCustomIcon(marker.color)}
                                        >
                                            <Popup>
                                                <div className="p-3 min-w-[250px]">
                                                    <h3 className="font-bold text-lg mb-3 text-gray-900">{marker.submission.company_name}</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Location:</span>
                                                            <span className="font-semibold text-gray-900">{marker.county}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Company:</span>
                                                            <span className="font-semibold text-gray-900">{marker.submission.sector}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">IT Load:</span>
                                                            <span className="font-semibold text-gray-900">{marker.submission.current_it_load} kW</span>
                                                        </div>
                                                        <div className="border-t pt-2 mt-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600 font-medium">Feasibility Score:</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${marker.feasibility.score >= 70 ? 'bg-green-100 text-green-800' :
                                                                    marker.feasibility.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {marker.feasibility.score}/100
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-2">
                                                            <div>CapEx: €{marker.feasibility.capex}M | Power: {marker.feasibility.powerMW} MW</div>
                                                            <div>Grid OK: {marker.feasibility.gridOK ? '✅' : '❌'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Wind Farm Markers */}
                                    {!isLoadingWindFarms && windFarmData.length > 0 && (
                                        <>
                                            {windFarmData.slice(0, 20).map((windFarm, index) => (
                                                <Marker
                                                    key={`windfarm-${index}`}
                                                    position={[windFarm.lat, windFarm.lon]}
                                                    icon={createWindFarmIcon(windFarm.capacity)}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg">🌬️</span>
                                                                <b className="text-green-700">{windFarm.name}</b>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                <div><strong>County:</strong> {windFarm.county}</div>
                                                                <div><strong>Capacity:</strong> {windFarm.capacity} MW</div>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </>
                                    )}

                                    {/* Energy Demand Markers */}
                                    {!isLoadingEnergyData && energyDemandData.length > 0 && (
                                        <>
                                            {energyDemandData.slice(0, 15).map((demand, index) => (
                                                <Marker
                                                    key={`demand-${index}`}
                                                    position={[demand.lat, demand.lon]}
                                                    icon={createEnergyDemandIcon(parseFloat(demand.demandAvailable) || 0)}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg">⚡</span>
                                                                <b className="text-red-700">{demand.name}</b>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                <div><strong>Voltage:</strong> {demand.primaryKv}</div>
                                                                <div><strong>Class:</strong> {demand.voltageClass}</div>
                                                                <div><strong>Installed Capacity:</strong> {demand.installedCapacity} MVA</div>
                                                                <div><strong>Demand Available:</strong> {demand.demandAvailable} MVA</div>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </>
                                    )}

                                    {/* Energy Generation Markers */}
                                    {!isLoadingEnergyData && energyGenerationData.length > 0 && (
                                        <>
                                            {energyGenerationData.slice(0, 15).map((generation, index) => (
                                                <Marker
                                                    key={`generation-${index}`}
                                                    position={[generation.lat, generation.lon]}
                                                    icon={createEnergyGenerationIcon(parseFloat(generation.genAvailableFirm) || 0)}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg">🔋</span>
                                                                <b className="text-blue-700">{generation.name}</b>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                <div><strong>Voltage:</strong> {generation.primaryKv}</div>
                                                                <div><strong>Class:</strong> {generation.voltageClass}</div>
                                                                <div><strong>Installed Capacity:</strong> {generation.installedCapacity} MVA</div>
                                                                <div><strong>Firm Generation:</strong> {generation.genAvailableFirm} MW</div>
                                                                <div><strong>Non-Firm Generation:</strong> {generation.genAvailableNonFirm} MW</div>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </>
                                    )}
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
                                            <h4 className="font-semibold text-green-900">High Feasibility</h4>
                                            <p className="text-green-700 text-sm">Score ≥ 70</p>
                                        </div>
                                        <span className="text-2xl font-bold text-green-600">
                                            {formSubmissions.filter(sub =>
                                            {
                                                const feasibility = calculateFeasibilityScore(sub)
                                                return feasibility.score >= 70
                                            }).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-orange-900">Medium Feasibility</h4>
                                            <p className="text-orange-700 text-sm">Score 40-69</p>
                                        </div>
                                        <span className="text-2xl font-bold text-orange-600">
                                            {formSubmissions.filter(sub =>
                                            {
                                                const feasibility = calculateFeasibilityScore(sub)
                                                return feasibility.score >= 40 && feasibility.score < 70
                                            }).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modular DC Analysis Charts */}
                        {!loading && !error && formSubmissions.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Modular DC Analysis</h2>
                                    <p className="text-gray-600">
                                        Comprehensive analysis of customer requirements and market insights based on discovery form submissions.
                                    </p>
                                </div>

                                {/* Charts Grid - 3x2 Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Row 1 */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
                                        <div className="h-80">
                                            <DemandTypeVsPowerChart data={formSubmissions} />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
                                        <div className="h-80">
                                            <RegionalHeatMapChart data={formSubmissions} />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200">
                                        <div className="h-80">
                                            <SustainabilityTargetsChart data={formSubmissions} />
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-sm border border-orange-200">
                                        <div className="h-80">
                                            <ServiceDemandMixChart data={formSubmissions} />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm border border-red-200">
                                        <div className="h-80">
                                            <TierPreferenceChart data={formSubmissions} />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-sm border border-indigo-200">
                                        <div className="h-80">
                                            <BudgetVsLoadChart data={formSubmissions} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        {/* Demand Aggregation - Customer Lead Forms */}
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Demand Aggregation - Customer Leads</h2>
                            {formSubmissions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Not enough data for demand aggregation yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Location Summary */}
                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-4">By Location</h3>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                formSubmissions.reduce((acc, submission) =>
                                                {
                                                    const location = submission.eircode || submission.location || 'Dublin'
                                                    const county = extractCountyFromLocation(location)
                                                    if (!acc[county])
                                                    {
                                                        acc[county] = { count: 0, totalLoad: 0 }
                                                    }
                                                    acc[county].count++
                                                    acc[county].totalLoad += parseFloat(submission.current_it_load) || 0
                                                    return acc
                                                }, {})
                                            ).map(([county, data]) => (
                                                <div key={county} className="flex justify-between items-center">
                                                    <span className="text-blue-700 font-medium">{county}</span>
                                                    <span className="text-blue-900 font-bold">
                                                        {data.count} companies, {data.totalLoad.toFixed(1)} kW
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sector Summary */}
                                    <div className="bg-green-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-green-900 mb-4">By Sector</h3>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                formSubmissions.reduce((acc, submission) =>
                                                {
                                                    const sector = submission.sector
                                                    if (!acc[sector])
                                                    {
                                                        acc[sector] = { count: 0, totalLoad: 0 }
                                                    }
                                                    acc[sector].count++
                                                    acc[sector].totalLoad += parseFloat(submission.current_it_load) || 0
                                                    return acc
                                                }, {})
                                            ).map(([sector, data]) => (
                                                <div key={sector} className="flex justify-between items-center">
                                                    <span className="text-green-700 font-medium">{sector}</span>
                                                    <span className="text-green-900 font-bold">
                                                        {data.count} companies, {data.totalLoad.toFixed(1)} kW
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Growth Summary */}
                                    <div className="bg-purple-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-purple-900 mb-4">Growth Projections</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-700 font-medium">12 Month Growth</span>
                                                <span className="text-purple-900 font-bold">
                                                    {formSubmissions.reduce((acc, submission) =>
                                                        acc + (parseFloat(submission.growth_12_month) || 0), 0
                                                    ) / formSubmissions.length}% avg
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-700 font-medium">24 Month Growth</span>
                                                <span className="text-purple-900 font-bold">
                                                    {formSubmissions.reduce((acc, submission) =>
                                                        acc + (parseFloat(submission.growth_24_month) || 0), 0
                                                    ) / formSubmissions.length}% avg
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-700 font-medium">36 Month Growth</span>
                                                <span className="text-purple-900 font-bold">
                                                    {formSubmissions.reduce((acc, submission) =>
                                                        acc + (parseFloat(submission.growth_36_month) || 0), 0
                                                    ) / formSubmissions.length}% avg
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Summary */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Demand</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Total Companies</span>
                                                <span className="text-gray-900 font-bold text-xl">{formSubmissions.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Total IT Load</span>
                                                <span className="text-gray-900 font-bold text-xl">
                                                    {formSubmissions.reduce((acc, submission) =>
                                                        acc + (parseFloat(submission.current_it_load) || 0), 0
                                                    ).toFixed(1)} kW
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Total Racks</span>
                                                <span className="text-gray-900 font-bold text-xl">
                                                    {formSubmissions.reduce((acc, submission) =>
                                                        acc + (parseInt(submission.current_racks) || 0), 0
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Feasibility Study Component */}
                        {!loading && !error && formSubmissions.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Feasibility Study</h2>
                                    <p className="text-gray-600 mb-6">
                                        Calculate financial feasibility and return metrics for individual customer requirements.
                                    </p>

                                    {/* Company Selection Dropdown */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Company for Feasibility Analysis
                                        </label>
                                        <select
                                            value={selectedCompany || ''}
                                            onChange={(e) => setSelectedCompany(e.target.value)}
                                            className="w-full max-w-md px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="">Choose a company...</option>
                                            {formSubmissions.map((submission, index) => (
                                                <option key={index} value={index}>
                                                    {submission.company_name || `Company ${index + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Feasibility Results */}
                                {selectedCompany !== null && selectedCompany !== '' && (
                                    <FeasibilityResults
                                        customerData={formSubmissions[selectedCompany]}
                                    />
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </PasscodeProtection>
    )
}

export default ModularDCAnalysis