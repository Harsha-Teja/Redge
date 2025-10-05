/**
 * Overview.jsx
 * 
 * Main landing page for the Ireland Edge Discovery tool.
 * Features a hero section, customer form with map integration,
 * and results comparison for different infrastructure options.
 */
import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { calculateAllSolutions } from '../lib/costing'
import { submitFormToSupabase, submitSurveyToSupabase } from '../lib/supabase.js'
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

export default function Overview()
{
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

    // Advanced Survey Modal State
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [surveyData, setSurveyData] = useState({
        primaryUse: '',
        wasteHeatReuse: false,
        pueExpectation: 1.5,
        commercialPreference: '',
        capexBudget: '',
        opexBudget: '',
        contractLength: '',
        sustainabilityTarget: '',
        compliance: []
    })

    // Form submission tracking
    const [hasSubmittedMainForm, setHasSubmittedMainForm] = useState(false)
    const [hasSubmittedSurvey, setHasSubmittedSurvey] = useState(false)

    /**
     * Check for existing form submissions on component mount
     */
    useEffect(() =>
    {
        const mainFormSubmitted = localStorage.getItem('redge_main_form_submitted')
        const surveySubmitted = localStorage.getItem('redge_survey_submitted')

        if (mainFormSubmitted === 'true')
        {
            setHasSubmittedMainForm(true)
        }
        if (surveySubmitted === 'true')
        {
            setHasSubmittedSurvey(true)
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
     * Handle survey form input changes
     */
    const handleSurveyInputChange = (e) =>
    {
        const { name, value, type, checked } = e.target
        setSurveyData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    /**
     * Handle compliance multi-select
     */
    const handleComplianceChange = (e) =>
    {
        const { value, checked } = e.target
        setSurveyData(prev => ({
            ...prev,
            compliance: checked
                ? [...prev.compliance, value]
                : prev.compliance.filter(item => item !== value)
        }))
    }

    /**
     * Open survey modal
     */
    const openSurveyModal = () =>
    {
        setIsSurveyModalOpen(true)
    }

    /**
     * Close survey modal
     */
    const closeSurveyModal = () =>
    {
        setIsSurveyModalOpen(false)
        setSurveyData({
            primaryUse: '',
            wasteHeatReuse: false,
            pueExpectation: 1.5,
            commercialPreference: '',
            capexBudget: '',
            opexBudget: '',
            contractLength: '',
            sustainabilityTarget: '',
            compliance: []
        })
    }

    /**
     * Handle survey form submission
     */
    const handleSurveySubmit = async (e) =>
    {
        e.preventDefault()

        // Check if already submitted
        if (hasSubmittedSurvey)
        {
            alert('You have already submitted the survey. Thank you for your submission!')
            closeSurveyModal()
            return
        }

        try
        {
            console.log('Submitting survey form to Supabase:', surveyData)

            const result = await submitSurveyToSupabase(surveyData)

            if (result.success)
            {
                console.log('Survey form submitted successfully:', result.data)

                // Store in localStorage for local tracking
                const submissionData = {
                    ...surveyData,
                    timestamp: new Date().toISOString()
                }
                localStorage.setItem('redge_advanced_survey', JSON.stringify(submissionData))

                // Mark survey as submitted
                localStorage.setItem('redge_survey_submitted', 'true')
                setHasSubmittedSurvey(true)

                // Show toast
                setShowToast(true)
                setTimeout(() => setShowToast(false), 3000)

                // Close modal
                closeSurveyModal()
            } else
            {
                console.error('Error submitting survey form:', result.error)
                alert('Sorry, there was an error submitting your survey. Please try again.')
            }
        } catch (error)
        {
            console.error('Error submitting survey form:', error)
            alert('Sorry, there was an error submitting your survey. Please try again.')
        }
    }

    /**
     * Show toast notification
     */
    useEffect(() =>
    {
        if (showToast)
        {
            const timer = setTimeout(() => setShowToast(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showToast])

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

        // Calculate real results using the costing library
        console.log('Starting calculations...')
        let calculatedResults
        try
        {
            calculatedResults = await calculateAllSolutions(formData)
            console.log('Calculations completed:', calculatedResults)
        } catch (error)
        {
            console.error('Error in calculations:', error)
            // Fallback to mock results if calculation fails
            calculatedResults = {
                onPremises: {
                    total: 285000,
                    details: {
                        'Facility & Energy': 45000,
                        'Staffing': 120000,
                        'Maintenance': 25000,
                        'Insurance': 15000,
                        'Compliance': 20000,
                        'Connectivity': 10000
                    }
                },
                colocation: {
                    total: 195000,
                    details: {
                        'Rack Space': 80000,
                        'Power & Cooling': 35000,
                        'Connectivity': 25000,
                        'Management': 30000,
                        'Compliance': 15000,
                        'Setup': 10000
                    }
                },
                publicCloud: {
                    total: 165000,
                    details: {
                        'Compute Instances': 70000,
                        'Storage': 25000,
                        'Network': 15000,
                        'Management': 20000,
                        'Data Transfer': 10000,
                        'Support': 25000
                    }
                }
            }
            console.log('Using fallback results:', calculatedResults)
        }

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
                        Discover Ireland's Modular Edge Opportunities
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

            {/* Results Section */}
            {results && (
                <section id="results-section" className="py-20 px-6 bg-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Summary (5-year totals)
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Compare the total cost of ownership for different infrastructure approaches
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* On-premises Card */}
                            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ESB_BLUE}20` }}>
                                        <svg className="w-8 h-8" style={{ color: ESB_BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">On-premises</h3>

                                    {/* Yearly Cost Breakdown */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">1 Year</div>
                                            <div className="text-lg font-bold" style={{ color: ESB_BLUE }}>
                                                €{results.onPremises.yearly['1 Year'].toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">3 Years</div>
                                            <div className="text-lg font-bold" style={{ color: ESB_BLUE }}>
                                                €{results.onPremises.yearly['3 Years'].toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">5 Years</div>
                                            <div className="text-xl font-bold" style={{ color: ESB_BLUE }}>
                                                €{results.onPremises.yearly['5 Years'].toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="space-y-3">
                                    {Object.entries(results.onPremises.details).map(([key, value]) => (
                                        <div key={key} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-medium text-gray-900">{key}</span>
                                                <span className="text-sm font-bold text-blue-600">€{value.toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {key === 'Facility & Energy' && 'Energy costs + facility depreciation over 5 years'}
                                                {key === 'Staffing' && 'Annual cost for dedicated facility staff (engineers, operators)'}
                                                {key === 'Maintenance' && 'Annual maintenance cost as percentage of build cost'}
                                                {key === 'Insurance' && 'Annual insurance cost for facility and equipment'}
                                                {key === 'Compliance' && 'Estimated compliance and regulatory costs'}
                                                {key === 'Connectivity' && 'Estimated network and connectivity costs'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Colocation Card */}
                            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${EMERALD_GREEN}20` }}>
                                        <svg className="w-8 h-8" style={{ color: EMERALD_GREEN }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Colocation</h3>

                                    {/* Yearly Cost Breakdown */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">1 Year</div>
                                            <div className="text-lg font-bold" style={{ color: EMERALD_GREEN }}>
                                                €{results.colocation.yearly['1 Year'].toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">3 Years</div>
                                            <div className="text-lg font-bold" style={{ color: EMERALD_GREEN }}>
                                                €{results.colocation.yearly['3 Years'].toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">5 Years</div>
                                            <div className="text-xl font-bold" style={{ color: EMERALD_GREEN }}>
                                                €{results.colocation.yearly['5 Years'].toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="space-y-3">
                                    {Object.entries(results.colocation.details).map(([key, value]) => (
                                        <div key={key} className="border-l-4 border-green-500 pl-4 py-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-medium text-gray-900">{key}</span>
                                                <span className="text-sm font-bold text-green-600">€{value.toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {key === 'Rack Space' && 'Monthly cost per kW of IT load for rack space and power'}
                                                {key === 'Power & Cooling' && 'Energy costs passed through from colocation provider'}
                                                {key === 'Connectivity' && 'Bandwidth costs + cross-connect to carrier networks'}
                                                {key === 'Management' && 'Compliance overhead as percentage of base colo cost'}
                                                {key === 'Compliance' && 'Estimated compliance and regulatory costs'}
                                                {key === 'Setup' && 'Estimated initial setup and migration costs'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Public Cloud Card */}
                            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-400">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Public Cloud</h3>

                                    {/* Yearly Cost Breakdown */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">1 Year</div>
                                            <div className="text-lg font-bold text-gray-600">
                                                €{results.publicCloud.yearly['1 Year'].toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">3 Years</div>
                                            <div className="text-lg font-bold text-gray-600">
                                                €{results.publicCloud.yearly['3 Years'].toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">5 Years</div>
                                            <div className="text-xl font-bold text-gray-600">
                                                €{results.publicCloud.yearly['5 Years'].toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="space-y-3">
                                    {Object.entries(results.publicCloud.details).map(([key, value]) => (
                                        <div key={key} className="border-l-4 border-gray-500 pl-4 py-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-medium text-gray-900">{key}</span>
                                                <span className="text-sm font-bold text-gray-600">€{value.toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {key === 'Compute Instances' && 'Base monthly cost for compute instances and processing power'}
                                                {key === 'Storage' && 'Monthly cost per GB of data storage'}
                                                {key === 'Network' && 'Data egress costs + dedicated interconnect fees'}
                                                {key === 'Management' && 'Support cost as percentage of compute + storage + egress'}
                                                {key === 'Data Transfer' && 'Cost per GB of data transferred out of cloud'}
                                                {key === 'Support' && 'Estimated additional support and management costs'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Floating Survey Button */}
            <button
                onClick={openSurveyModal}
                className={`fixed bottom-6 right-6 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 z-[9999] ${hasSubmittedSurvey
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                disabled={hasSubmittedSurvey}
                style={{ position: 'fixed', zIndex: 9999 }}
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="hidden sm:inline">
                    {hasSubmittedSurvey ? 'Survey Submitted' : 'Survey Form'}
                </span>
            </button>

            {/* Survey Modal */}
            {isSurveyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Advanced Survey</h3>
                            <button
                                onClick={closeSurveyModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSurveySubmit} className="space-y-4">

                            {/* Primary Use */}
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Primary Use *
                                </label>
                                <select
                                    name="primaryUse"
                                    value={surveyData.primaryUse}
                                    onChange={handleSurveyInputChange}
                                    required
                                    className="border rounded-md px-3 py-2 text-sm w-full"
                                >
                                    <option value="">Select primary use</option>
                                    <option value="AI">AI</option>
                                    <option value="Analytics">Analytics</option>
                                    <option value="ERP">ERP</option>
                                    <option value="IoT">IoT</option>
                                    <option value="HPC">HPC</option>
                                    <option value="Mixed">Mixed</option>
                                </select>
                            </div>

                            {/* Waste Heat Reuse */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="wasteHeatReuse"
                                    checked={surveyData.wasteHeatReuse}
                                    onChange={handleSurveyInputChange}
                                    className="mr-2"
                                />
                                <label className="text-gray-700 font-medium text-sm">
                                    Accept waste-heat reuse
                                </label>
                            </div>

                            {/* PUE Expectation */}
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    PUE Expectation: {surveyData.pueExpectation}
                                </label>
                                <input
                                    type="range"
                                    name="pueExpectation"
                                    min="1.1"
                                    max="2.0"
                                    step="0.05"
                                    value={surveyData.pueExpectation}
                                    onChange={handleSurveyInputChange}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1.1</span>
                                    <span>2.0</span>
                                </div>
                            </div>

                            {/* Commercial Preference */}
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-2">
                                    Commercial Preference *
                                </label>
                                <div className="space-y-2">
                                    {['CapEx', 'OpEx', 'Flexible'].map(option => (
                                        <label key={option} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="commercialPreference"
                                                value={option}
                                                checked={surveyData.commercialPreference === option}
                                                onChange={handleSurveyInputChange}
                                                className="mr-2"
                                                required
                                            />
                                            <span className="text-sm text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Budget Envelopes */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium text-sm mb-1">
                                        CapEx €
                                    </label>
                                    <input
                                        type="number"
                                        name="capexBudget"
                                        value={surveyData.capexBudget}
                                        onChange={handleSurveyInputChange}
                                        placeholder="Optional"
                                        className="border rounded-md px-3 py-2 text-sm w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium text-sm mb-1">
                                        OpEx €/month
                                    </label>
                                    <input
                                        type="number"
                                        name="opexBudget"
                                        value={surveyData.opexBudget}
                                        onChange={handleSurveyInputChange}
                                        placeholder="Optional"
                                        className="border rounded-md px-3 py-2 text-sm w-full"
                                    />
                                </div>
                            </div>

                            {/* Contract Length */}
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Contract Length *
                                </label>
                                <select
                                    name="contractLength"
                                    value={surveyData.contractLength}
                                    onChange={handleSurveyInputChange}
                                    required
                                    className="border rounded-md px-3 py-2 text-sm w-full"
                                >
                                    <option value="">Select contract length</option>
                                    <option value="1 yr">1 year</option>
                                    <option value="3 yr">3 years</option>
                                    <option value="5+ yr">5+ years</option>
                                </select>
                            </div>

                            {/* Sustainability Target */}
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-1">
                                    Sustainability Target *
                                </label>
                                <select
                                    name="sustainabilityTarget"
                                    value={surveyData.sustainabilityTarget}
                                    onChange={handleSurveyInputChange}
                                    required
                                    className="border rounded-md px-3 py-2 text-sm w-full"
                                >
                                    <option value="">Select sustainability target</option>
                                    <option value="0%">0% renewable</option>
                                    <option value="50%">50% renewable</option>
                                    <option value="100%">100% renewable</option>
                                </select>
                            </div>

                            {/* Compliance */}
                            <div>
                                <label className="block text-gray-700 font-medium text-sm mb-2">
                                    Compliance (select all that apply)
                                </label>
                                <div className="space-y-2">
                                    {['GxP', 'ISO', 'HIPAA', 'PCI', 'None'].map(option => (
                                        <label key={option} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value={option}
                                                checked={surveyData.compliance.includes(option)}
                                                onChange={handleComplianceChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
                            >
                                Submit Survey
                            </button>
                        </form>

                        {/* Cancel Button */}
                        <button
                            onClick={closeSurveyModal}
                            className="w-full text-center text-gray-500 hover:text-gray-700 mt-2 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    Thank you, your survey was submitted.
                </div>
            )}

            <Footer />
        </div>
    )
}
