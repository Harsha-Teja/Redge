/**
 * Costing calculation library for data center cost analysis
 * Calculates yearly costs for On-premises, Colocation, and Cloud solutions
 */

// Global variable to store assumptions
let ASSUMPTIONS = null

/**
 * Load assumptions from JSON file
 * @returns {Promise<Object>} Assumptions object
 */
async function loadAssumptions()
{
    if (ASSUMPTIONS)
    {
        return ASSUMPTIONS
    }

    const response = await fetch('/data/costassumptions.json')
    const data = await response.json()
    ASSUMPTIONS = data
    return ASSUMPTIONS
}


/**
 * Calculate yearly costs for On-premises data center
 * @param {number} itKW - IT load in kW
 * @param {number} pue - Power Usage Effectiveness
 * @param {number} energyPrice - Energy price in €/MWh
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Yearly cost breakdown
 */
export async function onPremYear(itKW, pue, energyPrice, assumptions = null)
{
    const config = assumptions || await loadAssumptions()
    const defaults = config.onprem

    // Facility load in MWh
    const facilityLoadMWh = itKW * pue * config.defaults.hoursPerYear / config.defaults.energyConversionFactor

    // Energy cost
    const energyCost = facilityLoadMWh * energyPrice

    // Capital expenditure
    const totalCapex = itKW * defaults.capexPerKW
    const softCosts = totalCapex * defaults.softCostsPct
    const buildCost = totalCapex + softCosts

    // Annuity calculation
    const r = defaults.waccPct
    const n = defaults.depreciationYears
    const annuity = buildCost * (r / (1 - Math.pow(1 + r, -n)))

    // Maintenance cost
    const maint = buildCost * defaults.maintPct

    // Total yearly cost
    const yearTotal = annuity + energyCost + maint + defaults.staffingPerYr + defaults.insurancePerYr

    return {
        facilityLoadMWh,
        energyCost,
        totalCapex,
        softCosts,
        buildCost,
        annuity,
        maint,
        staffing: defaults.staffingPerYr,
        insurance: defaults.insurancePerYr,
        yearTotal
    }
}

/**
 * Calculate yearly costs for Colocation data center
 * @param {number} itKW - IT load in kW
 * @param {number} pue - Power Usage Effectiveness
 * @param {number} energyPrice - Energy price in €/MWh
 * @param {number} bandwidthGbps - Bandwidth in Gbps
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Yearly cost breakdown
 */
export async function coloYear(itKW, pue, energyPrice, bandwidthGbps, assumptions = null)
{
    const config = assumptions || await loadAssumptions()
    const defaults = config.colo

    // Base colocation cost
    const base = itKW * defaults.euroPerKWMonth * 12

    // Cross-connect cost
    const xConnect = defaults.crossConnectPerMonth * 12

    // Bandwidth cost
    const bandwidth = bandwidthGbps * defaults.bandwidthPerGbpsMonth * 12

    // Energy cost (if passed through)
    let energyCost = 0
    if (defaults.passThroughEnergy)
    {
        const facilityLoadMWh = itKW * pue * config.defaults.hoursPerYear / config.defaults.energyConversionFactor
        energyCost = facilityLoadMWh * energyPrice
    }

    // Compliance cost
    const compliance = base * defaults.compliancePct

    // Total yearly cost
    const yearTotal = base + xConnect + bandwidth + energyCost + compliance

    return {
        base,
        xConnect,
        bandwidth,
        energyCost,
        compliance,
        yearTotal
    }
}

/**
 * Calculate yearly costs for Cloud solution
 * @param {number} storageGB - Storage in GB
 * @param {number} egressGB - Egress data in GB
 * @param {number} bandwidthGbps - Bandwidth in Gbps
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Yearly cost breakdown
 */
export async function cloudYear(storageGB, egressGB, bandwidthGbps, assumptions = null)
{
    const config = assumptions || await loadAssumptions()
    const defaults = config.cloud

    // Compute cost
    const compute = defaults.computePerMonth * 12

    // Storage cost
    const storage = storageGB * defaults.storageEuroPerGBMo * 12

    // Egress cost
    const egress = egressGB * defaults.egressEuroPerGB * 12

    // Interconnect cost
    const interconnect = defaults.interconnectPerMonth * 12

    // Support cost (percentage of compute + storage + egress)
    const support = (compute + storage + egress) * defaults.supportPct

    // Total yearly cost
    const yearTotal = compute + storage + egress + interconnect + support

    return {
        compute,
        storage,
        egress,
        interconnect,
        support,
        yearTotal
    }
}

/**
 * Calculate total costs for On-premises over multiple years
 * @param {number} itKW - IT load in kW
 * @param {Array} growthRamp - Growth ramp array (e.g., [0.6, 0.8, 1.0])
 * @param {number} pue - Power Usage Effectiveness
 * @param {number} energyPrice - Energy price in €/MWh
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Total costs and yearly breakdown
 */
export async function onPremTotals(itKW, growthRamp, pue, energyPrice, assumptions = null)
{
    const config = assumptions || await loadAssumptions()
    const yearlyCosts = []
    let totalCost = 0

    for (let i = 0; i < growthRamp.length; i++)
    {
        const ramp = growthRamp[i]
        const scaledKW = itKW * ramp
        const yearCost = await onPremYear(scaledKW, pue, energyPrice, config)
        yearlyCosts.push({
            year: i + 1,
            itKW: scaledKW,
            ...yearCost
        })
        totalCost += yearCost.yearTotal
    }

    return {
        totalCost,
        yearlyCosts,
        averageYearly: totalCost / growthRamp.length
    }
}

/**
 * Calculate total costs for Colocation over multiple years
 * @param {number} itKW - IT load in kW
 * @param {Array} growthRamp - Growth ramp array (e.g., [0.6, 0.8, 1.0])
 * @param {number} pue - Power Usage Effectiveness
 * @param {number} energyPrice - Energy price in €/MWh
 * @param {number} bandwidthGbps - Bandwidth in Gbps
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Total costs and yearly breakdown
 */
export async function coloTotals(itKW, growthRamp, pue, energyPrice, bandwidthGbps, assumptions = null)
{
    const config = assumptions || await loadAssumptions()
    const yearlyCosts = []
    let totalCost = 0

    for (let i = 0; i < growthRamp.length; i++)
    {
        const ramp = growthRamp[i]
        const scaledKW = itKW * ramp
        const yearCost = await coloYear(scaledKW, pue, energyPrice, bandwidthGbps, config)
        yearlyCosts.push({
            year: i + 1,
            itKW: scaledKW,
            ...yearCost
        })
        totalCost += yearCost.yearTotal
    }

    return {
        totalCost,
        yearlyCosts,
        averageYearly: totalCost / growthRamp.length
    }
}

/**
 * Calculate total costs for Cloud over multiple years
 * @param {number} storageGB - Storage in GB
 * @param {number} egressGB - Egress data in GB
 * @param {number} bandwidthGbps - Bandwidth in Gbps
 * @param {Array} growthRamp - Growth ramp array (e.g., [0.6, 0.8, 1.0])
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Total costs and yearly breakdown
 */
export async function cloudTotals(storageGB, egressGB, bandwidthGbps, growthRamp, assumptions = null)
{
    const config = assumptions || await loadAssumptions()
    const yearlyCosts = []
    let totalCost = 0

    for (let i = 0; i < growthRamp.length; i++)
    {
        const ramp = growthRamp[i]
        const scaledStorage = storageGB * ramp
        const scaledEgress = egressGB * ramp
        const yearCost = await cloudYear(scaledStorage, scaledEgress, bandwidthGbps, config)
        yearlyCosts.push({
            year: i + 1,
            storageGB: scaledStorage,
            egressGB: scaledEgress,
            ...yearCost
        })
        totalCost += yearCost.yearTotal
    }

    return {
        totalCost,
        yearlyCosts,
        averageYearly: totalCost / growthRamp.length
    }
}

/**
 * Calculate all three solutions for comparison
 * @param {Object} inputs - Form inputs
 * @returns {Object} All calculation results
 */
export async function calculateAllSolutions(inputs)
{
    // Load assumptions
    const config = await loadAssumptions()

    // Extract inputs with defaults from config
    const itKW = parseFloat(inputs.currentITLoad) || 10
    const pue = config.defaults.pue
    const energyPrice = config.defaults.energyPrice
    const bandwidthGbps = parseFloat(inputs.bandwidthGbps) || 1
    const storageGB = (parseFloat(inputs.storageTB) || 10) * 1024 * 1024 // Convert TB to GB
    const egressGB = storageGB * config.defaults.egressAsStoragePct

    // Growth ramp based on form inputs
    const growthRamp = [
        (parseFloat(inputs.growth12Month) || 0) / 100,
        (parseFloat(inputs.growth24Month) || 0) / 100,
        (parseFloat(inputs.growth36Month) || 0) / 100
    ].map(growth => Math.max(config.defaults.minCapacityPct, 1 + growth))

    // Calculate all solutions
    const onPrem = await onPremTotals(itKW, growthRamp, pue, energyPrice, config)
    const colo = await coloTotals(itKW, growthRamp, pue, energyPrice, bandwidthGbps, config)
    const cloud = await cloudTotals(storageGB, egressGB, bandwidthGbps, growthRamp, config)

    // Get the last year's data for display (most recent year)
    const lastYearIndex = onPrem.yearlyCosts.length - 1
    const onPremLastYear = onPrem.yearlyCosts[lastYearIndex]
    const coloLastYear = colo.yearlyCosts[lastYearIndex]
    const cloudLastYear = cloud.yearlyCosts[lastYearIndex]

    return {
        onPremises: {
            total: Math.round(onPrem.totalCost),
            details: {
                'Facility & Energy': Math.round((onPremLastYear.energyCost || 0) + (onPremLastYear.annuity || 0)),
                'Staffing': Math.round(onPremLastYear.staffing || 0),
                'Maintenance': Math.round(onPremLastYear.maint || 0),
                'Insurance': Math.round(onPremLastYear.insurance || 0),
                'Compliance': Math.round((onPremLastYear.annuity || 0) * 0.1), // Estimate
                'Connectivity': Math.round((onPremLastYear.annuity || 0) * 0.05) // Estimate
            }
        },
        colocation: {
            total: Math.round(colo.totalCost),
            details: {
                'Rack Space': Math.round(coloLastYear.base || 0),
                'Power & Cooling': Math.round(coloLastYear.energyCost || 0),
                'Connectivity': Math.round((coloLastYear.bandwidth || 0) + (coloLastYear.xConnect || 0)),
                'Management': Math.round(coloLastYear.compliance || 0),
                'Compliance': Math.round((coloLastYear.compliance || 0) * 0.5), // Estimate
                'Setup': Math.round((coloLastYear.base || 0) * 0.1) // Estimate
            }
        },
        publicCloud: {
            total: Math.round(cloud.totalCost),
            details: {
                'Compute Instances': Math.round(cloudLastYear.compute || 0),
                'Storage': Math.round(cloudLastYear.storage || 0),
                'Network': Math.round((cloudLastYear.egress || 0) + (cloudLastYear.interconnect || 0)),
                'Management': Math.round(cloudLastYear.support || 0),
                'Data Transfer': Math.round(cloudLastYear.egress || 0),
                'Support': Math.round((cloudLastYear.support || 0) * 0.5) // Estimate
            }
        }
    }
}
