/**
 * Overview.jsx
 * 
 * Main landing page for the ReDge Modular DC tool.
 * Features a hero section, customer form with map integration,
 * and results comparison for different infrastructure options.
 */
import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { submitFormToSupabase } from '../lib/supabase.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
// Using inline SVG icons instead of external package

// Fix for default markers in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// ESB Brand Colors
const ESB_BLUE = '#005CAB'
const EMERALD_GREEN = '#009B77'

// Sectors
const SECTORS = [
    'Pharma', 'MedTech', 'Financial', 'Government', 'Other'
]

// Data sovereignty options
const DATA_SOVEREIGNTY_OPTIONS = [
    'Ireland only',
    'EU',
    'Global OK'
]

// Compliance options
const COMPLIANCE_OPTIONS = [
    'GxP',
    'ISO',
    'HIPAA-like',
    'PCI',
    'None'
]

// Latency tolerance options
const LATENCY_OPTIONS = [
    'Sub-1ms',
    '1-5ms',
    '5-10ms',
    '>10ms'
]

// Availability/Tier targets
const AVAILABILITY_TIERS = [
    'Tier II',
    'Tier III',
    'Tier IV'
]

// Renewable target options
const RENEWABLE_TARGETS = [
    '0%',
    '50%',
    '100%'
]

// Contract term options
const CONTRACT_TERMS = [
    '1 year',
    '3 years',
    '5+ years'
]

// Data centre service types
const DATA_CENTRE_SERVICES = [
    'Colocation',
    'Managed Services',
    'Cloud Services',
    'Hybrid'
]

// Budget range options
const BUDGET_RANGE_OPTIONS = [
    'Under €100k',
    '€100k - €500k',
    '€500k - €1M',
    '€1M - €5M',
    '€5M - €10M',
    'Over €10M',
    'Not specified'
]

// Commercial model options
const COMMERCIAL_MODEL_OPTIONS = [
    'Lease',
    'Own',
    'Managed Service'
]

// Backup/DR options
const BACKUP_DR_OPTIONS = [
    'Yes - Required',
    'No - Not required',
    'Maybe - Under consideration'
]

export default function Overview()
{
    // Wind farm data state
    const [windFarmData, setWindFarmData] = useState([])
    const [isLoadingWindFarms, setIsLoadingWindFarms] = useState(true)

    // Energy data state
    const [energyDemandData, setEnergyDemandData] = useState([])
    const [energyGenerationData, setEnergyGenerationData] = useState([])
    const [isLoadingEnergyData, setIsLoadingEnergyData] = useState(true)

    const [formData, setFormData] = useState({
        // Company Information
        companyName: '',
        email: '',
        role: '',
        eircode: '',

        // Sector & Location
        sector: '',
        sectorOther: '',

        // Workload Characteristics
        workloadBackup: '',
        workloadSecurity: '',
        dataSovereignty: '',
        compliance: '',

        // Technical Requirements
        latencyTolerance: '',
        availabilityTier: '',
        currentITLoad: '',
        currentRacks: '',
        currentDensity: '',
        growth12Month: '',
        growth24Month: '',
        growth36Month: '',
        gpuAIShare: '',
        storageTB: '',
        storageGrowthRate: '',

        // Connectivity
        bandwidthGbps: '',
        preferredCarriers: '',

        // Sustainability & Contract
        renewableTarget: '',
        contractTerm: '',
        dataCentreService: '',
        utilisationRamp: '',
        earliestServiceDate: '',
        micLimit: '',
        existingLoad: '',

        // New fields
        budgetRange: '',
        commercialModel: '',
        backupDR: '',

        // Legacy fields for compatibility
        uptimeTarget: '',
        serverCount: '',
        growthPercent: '',
        sovereignty: false,
        sustainability: false
    })

    const [results, setResults] = useState(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [expandedCard, setExpandedCard] = useState(null)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [locations, setLocations] = useState([])
    const [selectedLocationData, setSelectedLocationData] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Form submission tracking
    const [hasSubmittedMainForm, setHasSubmittedMainForm] = useState(false)

    /**
     * Check for existing form submissions on component mount
     */
    useEffect(() =>
    {
        const mainFormSubmitted = localStorage.getItem('redge_main_form_submitted')

        if (mainFormSubmitted === 'true')
        {
            setHasSubmittedMainForm(true)
        }
    }, [])

    // Load locations data from ie.json
    useEffect(() =>
    {
        fetch('/data/ie.json')
            .then(response => response.json())
            .then(data => setLocations(data))
            .catch(error => console.error('Error loading locations:', error))
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

    // Close dropdown when clicking outside
    useEffect(() =>
    {
        function handleClickOutside(event)
        {
            if (isDropdownOpen && !event.target.closest('.dropdown-container'))
            {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isDropdownOpen])

    /**
     * Update selected location when form data changes
     */
    useEffect(() =>
    {
        if (formData.location)
        {
            const coordinates = getCountyCoordinates(formData.location)
            if (coordinates)
            {
                setSelectedLocation({
                    name: formData.location,
                    position: [coordinates[0], coordinates[1]]
                })
            }
        } else
        {
            setSelectedLocation(null)
        }
    }, [formData.location])

    /**
     * Custom marker component for react-leaflet
     */
    function CustomMarker()
    {
        if (!selectedLocation) return null

        const redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })

        return (
            <Marker position={selectedLocation.position} icon={redIcon}>
                <Popup>
                    <div className="p-2">
                        <b>{selectedLocation.name}</b>
                    </div>
                </Popup>
            </Marker>
        )
    }

    function MapController()
    {
        const map = useMap()

        useEffect(() =>
        {
            if (selectedLocationData)
            {
                map.flyTo([parseFloat(selectedLocationData.lat), parseFloat(selectedLocationData.lng)], 12)
            }
        }, [selectedLocationData, map])

        return null
    }

    // Create a simple red marker with fallback
    function createRedMarker()
    {
        try
        {
            // Create a simple red circle marker
            const redMarker = L.divIcon({
                className: 'custom-red-marker',
                html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -10]
            })
            return redMarker
        } catch (error)
        {
            // Fallback to default marker if custom marker fails
            return new L.Icon.Default()
        }
    }

    // Create wind farm icon
    function createWindFarmIcon(capacity)
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
    function createEnergyDemandIcon(capacity)
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
    function createEnergyGenerationIcon(capacity)
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

    /**
     * Get approximate coordinates for Irish counties
     */
    function getCountyCoordinates(county)
    {
        const coordinates = {
            'Dublin': [53.3498, -6.2603],
            'Cork': [51.8985, -8.4756],
            'Galway': [53.2707, -9.0568],
            'Limerick': [52.6638, -8.6267],
            'Waterford': [52.2593, -7.1101],
            'Kilkenny': [52.6541, -7.2443],
            'Wexford': [52.3369, -6.4633],
            'Wicklow': [53.0000, -6.4167],
            'Kildare': [53.1558, -6.9092],
            'Meath': [53.6550, -6.6564],
            'Louth': [53.9250, -6.5400],
            'Monaghan': [54.2500, -6.9667],
            'Cavan': [53.9908, -7.3611],
            'Donegal': [54.6541, -8.1047],
            'Leitrim': [54.1167, -8.0833],
            'Sligo': [54.2708, -8.4694],
            'Mayo': [53.9000, -9.1167],
            'Roscommon': [53.6333, -8.1833],
            'Longford': [53.7333, -7.8000],
            'Westmeath': [53.5333, -7.3500],
            'Offaly': [53.2739, -7.4889],
            'Laois': [53.0333, -7.3000],
            'Carlow': [52.8361, -6.9264],
            'Tipperary': [52.4736, -8.1619],
            'Kerry': [52.2667, -9.7167],
            'Clare': [52.8333, -8.9833]
        }
        return coordinates[county] || [53.41291, -8.24389] // Default to center of Ireland
    }

    /**
     * Handle form input changes
     */
    function handleInputChange(e)
    {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    /**
     * Handle location selection from dropdown
     */
    function handleLocationSelect(location)
    {
        setSelectedLocationData(location)
        setFormData(prev => ({
            ...prev,
            eircode: `${location.city} (${location.admin_name})`
        }))
        setIsDropdownOpen(false)
        setSearchTerm('')
    }

    /**
     * Filter locations based on search term
     */
    const filteredLocations = locations.filter(location =>
        location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.admin_name.toLowerCase().includes(searchTerm.toLowerCase())
    )



    /**
     * Validate form fields
     */
    function validateForm()
    {
        const requiredFields = [
            'companyName',
            'email',
            'role',
            'eircode',
            'sector',
            'dataSovereignty',
            'compliance',
            'latencyTolerance',
            'availabilityTier',
            'currentITLoad',
            'currentRacks',
            'currentDensity',
            'growth12Month',
            'growth24Month',
            'growth36Month',
            'gpuAIShare',
            'storageTB',
            'storageGrowthRate',
            'bandwidthGbps',
            'preferredCarriers',
            'renewableTarget',
            'contractTerm',
            'dataCentreService',
            'utilisationRamp',
            'earliestServiceDate',
            'micLimit',
            'existingLoad'
        ]

        for (const field of requiredFields)
        {
            if (!formData[field] || formData[field].toString().trim() === '')
            {
                return false
            }
        }
        return true
    }

    /**
     * Calculate service cost estimates based on user inputs
     * @param {Object} formData - User form data
     * @returns {Object} Service cost estimates
     */
    const calculateServiceCosts = (formData) =>
    {
        // Base prices (€/kW/month) - Industry standard 2025 Ireland
        const basePrices = {
            retailBase: 220,    // Retail Colocation
            wholesaleBase: 160, // Wholesale Colocation
            dedicatedBase: 280, // Dedicated Hosting
            managedBase: 300,   // Managed Service
            aiBase: 400        // AI / GPU Pod
        }

        // Extract user inputs
        const itLoadKW = parseFloat(formData.currentITLoad) || 0
        const tier = formData.availabilityTier || 'Tier III'
        const gpuShare = parseFloat(formData.gpuAIShare) || 0
        const renewableTarget = parseFloat(formData.renewableTarget) || 0
        const contractTerm = parseInt(formData.contractTerm) || 5
        const backupDR = formData.backupDR || 'No - Not required'
        const areaCity = formData.location || 'Dublin'

        // 3.1 Tier Multiplier
        let tierMult = 1.0
        if (tier === 'Tier I') tierMult = 0.9
        else if (tier === 'Tier II') tierMult = 1.0
        else if (tier === 'Tier III') tierMult = 1.05
        else if (tier === 'Tier IV') tierMult = 1.15

        // 3.2 GPU / AI Share Multiplier
        const gpuMult = 1 + (gpuShare / 100) * 0.25 // 0.25 = 2.5% per 10%

        // 3.3 Renewable Target Multiplier
        let renewMult = 1.0
        if (renewableTarget >= 90) renewMult = 1.07
        else if (renewableTarget >= 80) renewMult = 1.05

        // 3.4 Contract Term Multiplier
        let termMult = 1.0
        if (contractTerm >= 10) termMult = 0.95
        else if (contractTerm <= 5) termMult = 1.05

        // 3.5 Disaster Recovery Multiplier
        const drMult = backupDR.toLowerCase().includes('yes') ? 1.15 : 1.0

        // 3.6 Regional Location Multiplier
        const regionMult = areaCity.toLowerCase().includes('dublin') ? 1.0 : 1.05

        // 4. Total Multiplier
        const totalMult = tierMult * gpuMult * renewMult * termMult * drMult * regionMult

        // 5. Service Price Calculation
        const servicePrices = {
            retail: Math.round(basePrices.retailBase * totalMult),
            wholesale: Math.round(basePrices.wholesaleBase * totalMult),
            dedicated: Math.round(basePrices.dedicatedBase * totalMult),
            managed: Math.round(basePrices.managedBase * totalMult),
            ai: Math.round(basePrices.aiBase * totalMult)
        }

        // 6. Annual & Contract Cost
        const annualCosts = {
            retail: servicePrices.retail * itLoadKW * 12,
            wholesale: servicePrices.wholesale * itLoadKW * 12,
            dedicated: servicePrices.dedicated * itLoadKW * 12,
            managed: servicePrices.managed * itLoadKW * 12,
            ai: servicePrices.ai * itLoadKW * 12
        }

        const contractCosts = {
            retail: annualCosts.retail * contractTerm,
            wholesale: annualCosts.wholesale * contractTerm,
            dedicated: annualCosts.dedicated * contractTerm,
            managed: annualCosts.managed * contractTerm,
            ai: annualCosts.ai * contractTerm
        }

        return {
            servicePrices,
            annualCosts,
            contractCosts,
            multipliers: {
                tier: tierMult,
                gpu: gpuMult,
                renewable: renewMult,
                term: termMult,
                dr: drMult,
                region: regionMult,
                total: totalMult
            },
            inputs: {
                itLoadKW,
                tier,
                gpuShare,
                renewableTarget,
                contractTerm,
                backupDR,
                areaCity
            }
        }
    }

    /**
     * Handle form submission and calculation
     */
    async function handleSubmit(e)
    {
        // Always prevent default form submission
        e.preventDefault()

        // Check if already submitted
        if (hasSubmittedMainForm)
        {
            alert('You have already submitted the main form. Thank you for your submission!')
            return
        }

        // Validate form before submission
        if (!validateForm())
        {
            alert('Please fill in all required fields before calculating costs.')
            return
        }

        // Debug: Log form data
        console.log('Form submitting with data:', formData)

        setIsCalculating(true)

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Calculate service cost estimates
        console.log('Starting calculations...')
        const calculatedResults = calculateServiceCosts(formData)
        console.log('Calculations completed:', calculatedResults)

        // Submit form data to Supabase (in background)
        const supabaseSuccess = await submitToSupabase(formData)
        if (!supabaseSuccess)
        {
            console.warn('Form submission to Supabase failed, but calculations will continue')
        }

        // Mark form as submitted
        localStorage.setItem('redge_main_form_submitted', 'true')
        setHasSubmittedMainForm(true)

        console.log('Setting results:', calculatedResults)
        setResults(calculatedResults)
        setIsCalculating(false)

        // Scroll to results section
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
    }

    /**
     * Submit form data to Supabase
     */
    async function submitToSupabase(formData)
    {
        try
        {
            console.log('Submitting form data to Supabase...')
            const result = await submitFormToSupabase(formData)

            if (result.success)
            {
                console.log('Form data submitted to Supabase successfully:', result.data)
                return true
            } else
            {
                console.error('Error submitting to Supabase:', result.error)
                return false
            }
        } catch (error)
        {
            console.error('Error submitting to Supabase:', error)
            return false
        }
    }

    /**
     * Toggle expanded state for result cards
     */
    function toggleCard(cardType)
    {
        setExpandedCard(expandedCard === cardType ? null : cardType)
    }

    /**
     * Scroll to form section
     */
    function scrollToForm()
    {
        document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 antialiased" style={{ position: 'relative', zIndex: 1 }}>
            <Navbar />

            {/* Hero Section */}
            <section
                className="relative text-white py-20 px-6"
                style={{
                    background: `linear-gradient(135deg, ${ESB_BLUE} 0%, ${EMERALD_GREEN} 100%)`,
                    zIndex: -1
                }}
            >
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Modular DC - Ireland's Edge Opportunities
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto">
                        Compare On-premises, Colocation, and Cloud while factoring in energy,
                        connectivity, and sustainability.
                    </p>
                    <button
                        onClick={scrollToForm}
                        className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        style={{ color: ESB_BLUE }}
                    >
                        Start your discovery
                    </button>
                </div>
            </section>

            {/* Form + Map Section */}
            <section id="form-section" className="py-20 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Calculate Your Edge Infrastructure Costs</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Fill out the form below to get personalized cost estimates for different infrastructure options
                        </p>
                    </div>
                    <div className="space-y-8">
                        {/* Map Container */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative z-0">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Ireland Map</h3>
                            {isLoadingWindFarms && (
                                <div className="text-center text-sm text-gray-500 mb-2">Loading wind farms...</div>
                            )}
                            {/* {!isLoadingWindFarms && windFarmData.length > 0 && (
                                <div className="text-center text-sm text-green-600 mb-2">
                                    {windFarmData.length} wind farms loaded
                                </div>
                            )} */}
                            {!isLoadingWindFarms && windFarmData.length === 0 && (
                                <div className="text-center text-sm text-red-600 mb-2">
                                    No wind farm data loaded
                                </div>
                            )}
                            <div className="w-full rounded-lg border border-gray-200 shadow-inner overflow-hidden relative z-0">
                                <MapContainer
                                    center={[53.4, -7.9]}
                                    zoom={6}
                                    style={{ height: '400px', width: '100%' }}
                                    className="rounded-lg"
                                    maxBounds={[[51.3, -10.7], [55.5, -5.3]]}
                                    maxBoundsViscosity={1.0}
                                    scrollWheelZoom={true}
                                    doubleClickZoom={true}
                                    dragging={true}
                                    zoomControl={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        maxZoom={18}
                                        minZoom={6}
                                        subdomains={['a', 'b', 'c']}
                                    />
                                    <MapController />
                                    <CustomMarker />
                                    {selectedLocationData && (
                                        <Marker position={[parseFloat(selectedLocationData.lat), parseFloat(selectedLocationData.lng)]} icon={createRedMarker()}>
                                            <Popup>
                                                <div className="p-2">
                                                    <b>{selectedLocationData.city}</b>
                                                    <br />
                                                    {selectedLocationData.admin_name}
                                                    <br />
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}
                                    {/* Wind Farm Markers */}
                                    {!isLoadingWindFarms && windFarmData.length > 0 && (
                                        <>
                                            {windFarmData.slice(0, 20).map((windFarm, index) => (
                                                <Marker
                                                    key={index}
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
                        </div>

                        {/* Customer Form */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Requirements</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Company Information Section */}
                                <div className="space-y-4">
                                    <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1">
                                        📋 Company Information
                                    </h4>

                                    {/* Company Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {/* Company Name */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Company Name *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="Your Company Name"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                    </svg>
                                                    Email Address *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="your.email@company.com"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Role / Contact Details *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="e.g., IT Director, CTO"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location Dropdown */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Area / City *
                                                </span>
                                            </label>
                                            <div className="relative dropdown-container">
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                    {
                                                        setSearchTerm(e.target.value)
                                                        setIsDropdownOpen(true)
                                                    }}
                                                    onFocus={() => setIsDropdownOpen(true)}
                                                    placeholder="Search cities or areas..."
                                                    className="w-full px-3 py-2.5 pl-10 pr-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>

                                                {/* Dropdown */}
                                                {isDropdownOpen && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                                        {filteredLocations.length > 0 ? (
                                                            filteredLocations.map((location, index) => (
                                                                <div
                                                                    key={index}
                                                                    onClick={() => handleLocationSelect(location)}
                                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                                >
                                                                    <div className="font-medium text-gray-900">{location.city}</div>
                                                                    <div className="text-xs text-gray-500">{location.admin_name}</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm text-gray-500">No locations found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedLocationData && (
                                                <div className="mt-2 text-xs text-green-600">
                                                    Selected: {selectedLocationData.city} ({selectedLocationData.admin_name})
                                                </div>
                                            )}
                                        </div>

                                        {/* Sector */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Sector *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="sector"
                                                    value={formData.sector}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select your sector</option>
                                                    {SECTORS.map(sector => (
                                                        <option key={sector} value={sector}>{sector}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sector Other */}
                                        {formData.sector === 'Other' && (
                                            <div className="group">
                                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Please specify sector
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="sectorOther"
                                                        value={formData.sectorOther}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                        placeholder="Enter your sector"
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Workload Characteristics Section */}
                                <div className="space-y-4">
                                    <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1">
                                        🔧 Workload Characteristics
                                    </h4>

                                    {/* Workload Characteristics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Data Sovereignty */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Data Sovereignty Needs *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="dataSovereignty"
                                                    value={formData.dataSovereignty}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select data sovereignty requirement</option>
                                                    {DATA_SOVEREIGNTY_OPTIONS.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compliance */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Compliance Requirements *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="compliance"
                                                    value={formData.compliance}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select compliance requirement</option>
                                                    {COMPLIANCE_OPTIONS.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Latency Tolerance */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Latency Tolerance *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="latencyTolerance"
                                                    value={formData.latencyTolerance}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select latency requirement</option>
                                                    {LATENCY_OPTIONS.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Availability Tier */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Availability / Tier Target *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="availabilityTier"
                                                    value={formData.availabilityTier}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select availability tier</option>
                                                    {AVAILABILITY_TIERS.map(tier => (
                                                        <option key={tier} value={tier}>{tier}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity & Growth Section */}
                                <div className="space-y-4">
                                    <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1">
                                        📊 Capacity & Growth
                                    </h4>

                                    {/* Current IT Load */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Current IT Load (kW) *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="currentITLoad"
                                                    value={formData.currentITLoad}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="100"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                    </svg>
                                                    Current Racks *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="currentRacks"
                                                    value={formData.currentRacks}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="10"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                                    </svg>
                                                    Density (kW/rack) *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="currentDensity"
                                                    value={formData.currentDensity}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    step="0.1"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="5.0"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Growth Forecast */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    12-month kW forecast *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="growth12Month"
                                                    value={formData.growth12Month}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="120"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    24-month kW forecast *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="growth24Month"
                                                    value={formData.growth24Month}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="150"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    36-month kW forecast *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="growth36Month"
                                                    value={formData.growth36Month}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="200"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* GPU/AI Share and Storage */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    GPU/AI Share (% of load) *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="gpuAIShare"
                                                    value={formData.gpuAIShare}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="25"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                    </svg>
                                                    Storage (TB) *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="storageTB"
                                                    value={formData.storageTB}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="1"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="100"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Storage Growth Rate */}
                                    <div className="group">
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                Storage Growth Rate (% per year) *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="storageGrowthRate"
                                                value={formData.storageGrowthRate}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                placeholder="20"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Connectivity Section */}
                                <div className="space-y-4">
                                    <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1">
                                        🌐 Connectivity
                                    </h4>

                                    {/* Connectivity Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {/* Required Bandwidth */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Required Bandwidth (Gbps) *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="bandwidthGbps"
                                                    value={formData.bandwidthGbps}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    step="0.1"
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="10"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preferred Carriers */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    Preferred Carriers / Providers
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="preferredCarriers"
                                                    value={formData.preferredCarriers}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="e.g., Eir, Vodafone, BT"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sustainability & Contract Section */}
                                <div className="space-y-4">
                                    <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1">
                                        🌱 Sustainability & Contract
                                    </h4>

                                    {/* Sustainability & Contract Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {/* Renewable Target */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Renewable % Target *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="renewableTarget"
                                                    value={formData.renewableTarget}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select renewable target</option>
                                                    {RENEWABLE_TARGETS.map(target => (
                                                        <option key={target} value={target}>{target}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contract Term */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Contract Term *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="contractTerm"
                                                    value={formData.contractTerm}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select contract term</option>
                                                    {CONTRACT_TERMS.map(term => (
                                                        <option key={term} value={term}>{term}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Data Centre Service Type */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Choose Type of Data Centre Service *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="dataCentreService"
                                                    value={formData.dataCentreService}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select service type</option>
                                                    {DATA_CENTRE_SERVICES.map(service => (
                                                        <option key={service} value={service}>{service}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expected Budget Range */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                    Expected Budget Range *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="budgetRange"
                                                    value={formData.budgetRange}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select budget range</option>
                                                    {BUDGET_RANGE_OPTIONS.map(range => (
                                                        <option key={range} value={range}>{range}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preferred Commercial Model */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Preferred Commercial Model *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="commercialModel"
                                                    value={formData.commercialModel}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select commercial model</option>
                                                    {COMMERCIAL_MODEL_OPTIONS.map(model => (
                                                        <option key={model} value={model}>{model}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Backup or DR Site Connectivity */}
                                        <div className="group">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Do you require backup or DR site connectivity?
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="backupDR"
                                                    value={formData.backupDR}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select backup/DR requirement</option>
                                                    {BACKUP_DR_OPTIONS.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    Utilisation Ramp (%)
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="utilisationRamp"
                                                    value={formData.utilisationRamp}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="e.g., 40%→70%→85%"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Earliest In-Service Date
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    name="earliestServiceDate"
                                                    value={formData.earliestServiceDate}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    What is the mic limit?
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="micLimit"
                                                    value={formData.micLimit}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="Enter mic limit"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    What is the existing load?
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="existingLoad"
                                                    value={formData.existingLoad}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 pl-10 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                                    placeholder="Enter existing load"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isCalculating || hasSubmittedMainForm}
                                    className={`w-full text-white py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 transform shadow-lg ${hasSubmittedMainForm
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                                        }`}
                                >
                                    {isCalculating ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Calculating...
                                        </div>
                                    ) : hasSubmittedMainForm ? (
                                        'Form Already Submitted ✓'
                                    ) : (
                                        'Calculate Costs'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Cost Estimate Section */}
            {results && (
                <section id="results-section" className="py-20 px-6 bg-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                💼 Service Cost Estimate
                            </h2>
                            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                                Based on your inputs, here's an estimate of what your data-centre service could cost under different models.
                                These are budgetary industry averages designed to help you compare options and understand how configuration affects cost.
                            </p>
                        </div>

                        {/* Service Options Grid */}
                        <div className="space-y-8">
                            {/* 1️⃣ Retail Colocation */}
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-2xl">1️⃣</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Retail Colocation</h3>
                                            <p className="text-gray-600">Estimated Price: €{results.servicePrices.retail} / kW / month</p>
                                            <p className="text-gray-600">Estimated Annual Cost: €{(results.annualCosts.retail / 1000000).toFixed(2)} million</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-6 mb-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">📘 What this means:</h4>
                                    <p className="text-blue-800 mb-3">
                                        You rent individual racks or a small cage in a shared ESB facility.
                                        ESB provides the building, power, cooling, and internet connectivity - you bring and manage your own servers.
                                    </p>
                                    <h4 className="font-semibold text-blue-900 mb-2">💡 Why it costs this much:</h4>
                                    <p className="text-blue-800">
                                        Higher per-kW price because of shared infrastructure, flexible space, and high power density.
                                        Ideal for small to medium deployments that need professional uptime without building their own data centre.
                                    </p>
                                </div>
                            </div>

                            {/* 2️⃣ Wholesale Colocation */}
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-2xl">2️⃣</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Wholesale Colocation</h3>
                                            <p className="text-gray-600">Estimated Price: €{results.servicePrices.wholesale} / kW / month</p>
                                            <p className="text-gray-600">Estimated Annual Cost: €{(results.annualCosts.wholesale / 1000000).toFixed(2)} million</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6 mb-4">
                                    <h4 className="font-semibold text-green-900 mb-2">📘 What this means:</h4>
                                    <p className="text-green-800 mb-3">
                                        You lease an entire data-hall suite or large dedicated area (typically &gt; 500 kW).
                                        You manage the servers and layout; ESB provides the environment, power, and fibre links.
                                    </p>
                                    <h4 className="font-semibold text-green-900 mb-2">💡 Why it costs less per kW:</h4>
                                    <p className="text-green-800">
                                        You use a bigger space and commit longer-term, so unit costs drop.
                                        Best suited for large enterprises or cloud operators that want control at scale.
                                    </p>
                                </div>
                            </div>

                            {/* 3️⃣ Dedicated Hosting */}
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-2xl">3️⃣</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Dedicated Hosting</h3>
                                            <p className="text-gray-600">Estimated Price: €{results.servicePrices.dedicated} / kW / month</p>
                                            <p className="text-gray-600">Estimated Annual Cost: €{(results.annualCosts.dedicated / 1000000).toFixed(2)} million</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6 mb-4">
                                    <h4 className="font-semibold text-purple-900 mb-2">📘 What this means:</h4>
                                    <p className="text-purple-800 mb-3">
                                        ESB provides physical servers that are 100% dedicated to your organisation.
                                        You get full security and performance, without sharing hardware with others.
                                    </p>
                                    <h4 className="font-semibold text-purple-900 mb-2">💡 Why it's higher priced:</h4>
                                    <p className="text-purple-800">
                                        Hardware, maintenance, and lifecycle costs are included.
                                        Ideal for finance, healthcare, or government workloads that demand isolation.
                                    </p>
                                </div>
                            </div>

                            {/* 4️⃣ Managed Service */}
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-2xl">4️⃣</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Managed Service</h3>
                                            <p className="text-gray-600">Estimated Price: €{results.servicePrices.managed} / kW / month</p>
                                            <p className="text-gray-600">Estimated Annual Cost: €{(results.annualCosts.managed / 1000000).toFixed(2)} million</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-6 mb-4">
                                    <h4 className="font-semibold text-orange-900 mb-2">📘 What this means:</h4>
                                    <p className="text-orange-800 mb-3">
                                        ESB not only hosts your equipment but also operates, monitors, and maintains it for you.
                                        This "turn-key" option includes support, software patching, and uptime guarantees.
                                    </p>
                                    <h4 className="font-semibold text-orange-900 mb-2">💡 Why it costs more:</h4>
                                    <p className="text-orange-800">
                                        Adds staffing, monitoring, and management overhead.
                                        Great for companies that want to focus on business, not infrastructure.
                                    </p>
                                </div>
                            </div>

                            {/* 5️⃣ AI / GPU Pod */}
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                                            <span className="text-2xl">5️⃣</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">AI / GPU Pod</h3>
                                            <p className="text-gray-600">Estimated Price: €{results.servicePrices.ai} / kW / month</p>
                                            <p className="text-gray-600">Estimated Annual Cost: €{(results.annualCosts.ai / 1000000).toFixed(2)} million</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 rounded-lg p-6 mb-4">
                                    <h4 className="font-semibold text-red-900 mb-2">📘 What this means:</h4>
                                    <p className="text-red-800 mb-3">
                                        Purpose-built zone for high-density GPU or AI computing with advanced liquid cooling.
                                        Designed for workloads like model training, rendering, or simulation.
                                    </p>
                                    <h4 className="font-semibold text-red-900 mb-2">💡 Why it's the most expensive:</h4>
                                    <p className="text-red-800">
                                        High-power density, cooling efficiency, and premium hardware integration drive costs up.
                                        Ideal for AI, analytics, and research environments.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* How the Estimate Works */}
                        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">⚙️ How the Estimate Works</h3>
                            <p className="text-gray-700 mb-6">
                                These figures adjust dynamically from your answers:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Higher Tier</h4>
                                    <p className="text-sm text-gray-600">= more redundancy and cost</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">More GPU share</h4>
                                    <p className="text-sm text-gray-600">= more power & cooling</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Higher renewable target</h4>
                                    <p className="text-sm text-gray-600">= greener but costlier energy sourcing</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Disaster recovery</h4>
                                    <p className="text-sm text-gray-600">adds a second site component</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Contract length</h4>
                                    <p className="text-sm text-gray-600">and region slightly change rates</p>
                                </div>
                            </div>
                        </div>

                        {/* Assumptions Used */}
                        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">📈 Assumptions Used</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Parameter</th>
                                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Typical Value</th>
                                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Source / Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm text-gray-900">CapEx per MW</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">€8–10 million / MW (Tier III modular)</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">Uptime Institute & Bitpower Ireland 2024</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm text-gray-900">Power Usage Effectiveness (PUE)</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">1.35 – 1.45</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">ASHRAE / Uptime standards</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm text-gray-900">Electricity Price</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">€0.10 – €0.15 / kWh</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">SEAI Commercial Energy Prices 2024</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm text-gray-900">€/kW/month Base Rates</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">€160 – €400 / kW / month</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">CBRE & Structure Research 2024</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 text-sm text-gray-900">Discount Rate (for feasibility)</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">8%</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">EY Infrastructure 2024</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-sm text-gray-900">Accuracy Range</td>
                                            <td className="py-3 px-4 text-sm text-gray-900">±10% (budgetary level)</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">Common pre-feasibility tolerance</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Disclaimer</h3>
                            <p className="text-yellow-800 text-sm mb-3">
                                These prices are illustrative industry averages for early-stage feasibility and business-case planning.
                                They are not binding quotations and may vary with final site location, power availability, equipment specification, market conditions, and contract terms.
                            </p>
                            <p className="text-yellow-800 text-sm">
                                ESB / tool output aims for approx. ±10% accuracy, not exact prediction.
                                Benchmarks are based on public data from: Bitpower Ireland Q4 2024, CBRE Data Centre Report 2024, Uptime Institute, SEAI, and EY Infrastructure Benchmarks.
                            </p>
                        </div>
                    </div>
                </section>
            )}


            <Footer />
        </div>
    )
}
