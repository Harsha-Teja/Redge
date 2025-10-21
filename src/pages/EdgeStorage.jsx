/**
 * EdgeStorage.jsx
 * 
 * Edge Storage interest page for ESB's distributed storage pilot
 * Allows SMEs and startups to express interest in local edge storage services
 * Includes interactive form and Ireland map with response pins
 */

import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { submitEdgeStorageInterest, fetchEdgeStorageSubmissions } from '../lib/supabase.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// ESB Brand Colors
const ESB_BLUE = '#005CAB'
const EMERALD_GREEN = '#009B77'

// Map component for location selection
function MapComponent({ selectedLocation, onLocationSelect, submissions })
{
    const mapRef = useRef()

    useEffect(() =>
    {
        if (selectedLocation && mapRef.current)
        {
            const map = mapRef.current
            // Convert string coordinates to numbers
            const lat = parseFloat(selectedLocation.lat)
            const lng = parseFloat(selectedLocation.lng || selectedLocation.lon)
            if (!isNaN(lat) && !isNaN(lng))
            {
                map.setView([lat, lng], 10)
            }
        }
    }, [selectedLocation])

    return (
        <MapContainer
            ref={mapRef}
            center={[53.4129, -8.2439]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Show selected location marker */}
            {selectedLocation && selectedLocation.lat && (selectedLocation.lng || selectedLocation.lon) && (
                <Marker position={[parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lng || selectedLocation.lon)]}>
                    <Popup>
                        <div className="p-2">
                            <h4 className="font-semibold text-gray-900">{selectedLocation.name || selectedLocation.city || 'Selected Location'}</h4>
                            <p className="text-sm text-gray-600">{selectedLocation.county || selectedLocation.admin_name || ''}</p>
                        </div>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    )
}

export default function EdgeStorage()
{
    // Error state
    const [error, setError] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        business_sector: '',
        location_city: '',
        current_storage_method: '',
        data_volume_tb: '',
        backup_challenge: '',
        interest_local_storage: '',
        primary_use_case: '',
        data_sovereignty_importance: '',
        preferred_contract_length: '',
        budget_range: '',
        concerns: [],
        comments: '',
        followup_consent: false
    })

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [submissions, setSubmissions] = useState([])
    const [locations, setLocations] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Form field options
    const businessSectors = [
        'Manufacturing', 'Healthcare', 'Retail', 'Technology',
        'Finance', 'Education', 'Other'
    ]

    const storageMethods = [
        { value: 'Cloud', label: 'Cloud' },
        { value: 'On-premise', label: 'On-premise' },
        { value: 'Hybrid', label: 'Hybrid' }
    ]

    const dataVolumes = [
        '<10 TB', '10–50 TB', '50–100 TB', '>100 TB'
    ]

    const interestLevels = [
        { value: 'Yes', label: 'Yes' },
        { value: 'Maybe', label: 'Maybe' },
        { value: 'No', label: 'No' }
    ]

    const useCases = [
        'Backup', 'Compliance', 'Disaster Recovery',
        'Archive', 'AI Data', 'Other'
    ]

    const sovereigntyLevels = [
        'Low', 'Medium', 'High'
    ]

    const contractLengths = [
        '12 months', '24 months', '36 months'
    ]

    const budgetRanges = [
        '<€1k/month', '€1–5k', '€5–10k', '>€10k'
    ]

    const concernOptions = [
        'Security', 'Price', 'Reliability', 'Support', 'Other'
    ]

    // Load locations data from ie.json
    useEffect(() =>
    {
        fetch('/data/ie.json')
            .then(response => response.json())
            .then(data =>
            {
                // Handle different data formats
                if (Array.isArray(data))
                {
                    setLocations(data)
                } else if (data && typeof data === 'object')
                {
                    // Convert object to array if needed
                    const locationsArray = Object.values(data).filter(item =>
                        item && typeof item === 'object' && (item.name || item.city)
                    )
                    setLocations(locationsArray)
                } else
                {
                    console.warn('Unexpected data format for locations:', data)
                    setLocations([])
                }
            })
            .catch(error =>
            {
                console.error('Error loading locations:', error)
                setError('Failed to load location data. Please refresh the page.')
                setLocations([])
            })
    }, [])

    // Load existing submissions for map
    useEffect(() =>
    {
        loadSubmissions()
    }, [])

    // Handle click outside dropdown
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

    const loadSubmissions = async () =>
    {
        try
        {
            const result = await fetchEdgeStorageSubmissions()
            if (result.success)
            {
                setSubmissions(result.submissions)
            }
        } catch (error)
        {
            console.error('Error loading submissions:', error)
        }
    }

    const handleInputChange = (e) =>
    {
        const { name, value, type, checked } = e.target

        if (type === 'checkbox')
        {
            if (name === 'concerns')
            {
                const updatedConcerns = checked
                    ? [...formData.concerns, value]
                    : formData.concerns.filter(concern => concern !== value)
                setFormData(prev => ({ ...prev, concerns: updatedConcerns }))
            } else
            {
                setFormData(prev => ({ ...prev, [name]: checked }))
            }
        } else
        {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleLocationSelect = (location) =>
    {
        if (location && (location.name || location.city))
        {
            setSelectedLocation(location)
            setFormData(prev => ({ ...prev, location_city: location.name || location.city }))
            setIsDropdownOpen(false)
            setSearchTerm('')
        }
    }

    const filteredLocations = locations.filter(location =>
        (location.name && location.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.city && location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.county && location.county.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.admin_name && location.admin_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleSubmit = async (e) =>
    {
        e.preventDefault()
        console.log('Form submit triggered')
        console.log('Form data:', formData)
        console.log('Selected location:', selectedLocation)

        // Check required fields
        const requiredFields = [
            'company_name', 'contact_name', 'email', 'business_sector',
            'location_city', 'current_storage_method', 'data_volume_tb',
            'backup_challenge', 'interest_local_storage', 'primary_use_case',
            'data_sovereignty_importance', 'preferred_contract_length', 'budget_range'
        ]

        const missingFields = requiredFields.filter(field => !formData[field])
        if (missingFields.length > 0)
        {
            console.error('Missing required fields:', missingFields)
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
            return
        }

        if (!formData.followup_consent)
        {
            console.error('Consent not given')
            alert('Please agree to be contacted by ReDge')
            return
        }

        if (!selectedLocation)
        {
            console.error('No location selected')
            alert('Please select a location from the dropdown')
            return
        }

        setIsSubmitting(true)

        try
        {
            const submissionData = {
                ...formData,
                latitude: selectedLocation?.lat || null,
                longitude: selectedLocation?.lng || selectedLocation?.lon || null
            }

            console.log('Submission data:', submissionData)
            const result = await submitEdgeStorageInterest(submissionData)
            console.log('Submission result:', result)
            if (result.success)
            {
                setShowToast(true)
                setFormData({
                    company_name: '',
                    contact_name: '',
                    email: '',
                    phone: '',
                    business_sector: '',
                    location_city: '',
                    current_storage_method: '',
                    data_volume_tb: '',
                    backup_challenge: '',
                    interest_local_storage: '',
                    primary_use_case: '',
                    data_sovereignty_importance: '',
                    preferred_contract_length: '',
                    budget_range: '',
                    concerns: [],
                    comments: '',
                    followup_consent: false
                })
                setSelectedLocation(null)
                // Reload submissions to update map
                loadSubmissions()
            } else
            {
                console.error('Submission failed:', result.error)
            }
        } catch (error)
        {
            console.error('Error submitting form:', error)
        } finally
        {
            setIsSubmitting(false)
        }
    }

    // Toast notification
    useEffect(() =>
    {
        if (showToast)
        {
            const timer = setTimeout(() => setShowToast(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [showToast])

    // Show error if there's a critical error
    if (error)
    {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Page</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Edge Storage — Local Backup and Disaster Recovery Service
                        </h1>
                        <div className="max-w-4xl mx-auto">
                            <p className="text-lg text-gray-600 mb-2">
                                ReDge is exploring a distributed, Irish-based backup and disaster-recovery service.
                            </p>
                            <p className="text-lg text-gray-600">
                                Share your details to help shape the future of local edge storage in Ireland.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Information Section */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            What We're Offering
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Ireland's first sovereign Disaster Recovery-as-a-Service (DRaaS) and Backup Storage platform,
                            powered by ReDge's secure fibre network and modular data infrastructure.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                🇮🇪 Your Data, Hosted in Ireland
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-esbBlue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">Full data sovereignty - your data stays in Ireland</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-esbBlue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">GDPR and sector compliance guaranteed</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-esbBlue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">Ultra-low latency (&lt; 1 ms) via ReDge's fibre network</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-esbBlue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">Local support and direct access to Ireland's digital backbone</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                💡 Why Choose Us Over Global Cloud
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-emeraldGreen rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">Simple, transparent pricing per TB or backup plan</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-emeraldGreen rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">Green infrastructure aligned with Ireland's net-zero goals</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-emeraldGreen rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">No complex cloud contracts or hidden costs</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-emeraldGreen rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-gray-700">Designed for SMEs and startups</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            "Secure. Local. Compliant. Your Data, Recovered and Stored in Ireland."
                        </h3>
                        <p className="text-gray-600">
                            Designed for SMEs and startups that need reliable, compliant, and affordable data protection,
                            fully hosted within Ireland — ensuring EU data sovereignty, rapid recovery, and ultra-low latency access.
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        Interest Across Ireland
                    </h3>
                    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                        <MapComponent
                            selectedLocation={selectedLocation}
                            onLocationSelect={handleLocationSelect}
                            submissions={submissions}
                        />
                    </div>
                    <div className="mt-4 text-center text-gray-600">
                        <p>Select your location to see it on the map</p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Express Your Interest
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Company Information */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Company Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                        placeholder="Enter your company name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="contact_name"
                                        value={formData.contact_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Work Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                        placeholder="your.email@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                        placeholder="+353 1 234 5678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Sector *
                                    </label>
                                    <select
                                        name="business_sector"
                                        value={formData.business_sector}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    >
                                        <option value="">Select your sector</option>
                                        {businessSectors.map(sector => (
                                            <option key={sector} value={sector}>{sector}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative dropdown-container">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Location (City) *
                                        </span>
                                    </label>
                                    <div className="relative">
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
                                            className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
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
                                                    filteredLocations.slice(0, 10).map((location, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleLocationSelect(location)}
                                                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-900">{location.city || location.name}</div>
                                                            <div className="text-xs text-gray-500">{location.admin_name || location.county}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">No locations found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {selectedLocation && (
                                        <div className="mt-2 text-sm text-green-600">
                                            Selected: {selectedLocation.city || selectedLocation.name} ({selectedLocation.admin_name || selectedLocation.county})
                                        </div>
                                    )}
                                    {/* Hidden input for form submission */}
                                    <input
                                        type="hidden"
                                        name="location_city"
                                        value={selectedLocation ? (selectedLocation.city || selectedLocation.name) : ''}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Current Setup */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Current Setup
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Current Storage Method *
                                    </label>
                                    <div className="space-y-2">
                                        {storageMethods.map(method => (
                                            <label key={method.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="current_storage_method"
                                                    value={method.value}
                                                    checked={formData.current_storage_method === method.value}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mr-3 text-esbBlue focus:ring-esbBlue"
                                                />
                                                <span className="text-gray-700 font-medium">{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Volume *
                                    </label>
                                    <select
                                        name="data_volume_tb"
                                        value={formData.data_volume_tb}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    >
                                        <option value="">Select data volume</option>
                                        {dataVolumes.map(volume => (
                                            <option key={volume} value={volume}>{volume}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Do you face backup challenges? *
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Yes', 'No', 'Not sure'].map(option => (
                                            <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="backup_challenge"
                                                    value={option}
                                                    checked={formData.backup_challenge === option}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mr-3 text-esbBlue focus:ring-esbBlue"
                                                />
                                                <span className="text-gray-700 font-medium">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interest & Needs */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Interest & Needs
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Interest in Local Storage *
                                    </label>
                                    <div className="space-y-2">
                                        {interestLevels.map(level => (
                                            <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="interest_local_storage"
                                                    value={level.value}
                                                    checked={formData.interest_local_storage === level.value}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mr-3 text-esbBlue focus:ring-esbBlue"
                                                />
                                                <span className="text-gray-700 font-medium">{level.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Primary Use Case *
                                    </label>
                                    <select
                                        name="primary_use_case"
                                        value={formData.primary_use_case}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    >
                                        <option value="">Select use case</option>
                                        {useCases.map(useCase => (
                                            <option key={useCase} value={useCase}>{useCase}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Sovereignty Importance *
                                    </label>
                                    <select
                                        name="data_sovereignty_importance"
                                        value={formData.data_sovereignty_importance}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    >
                                        <option value="">Select importance level</option>
                                        {sovereigntyLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Contract Length *
                                    </label>
                                    <select
                                        name="preferred_contract_length"
                                        value={formData.preferred_contract_length}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    >
                                        <option value="">Select contract length</option>
                                        {contractLengths.map(length => (
                                            <option key={length} value={length}>{length}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Range *
                                    </label>
                                    <select
                                        name="budget_range"
                                        value={formData.budget_range}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    >
                                        <option value="">Select budget range</option>
                                        {budgetRanges.map(range => (
                                            <option key={range} value={range}>{range}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Feedback
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    What are your main concerns? (Select all that apply)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {concernOptions.map(concern => (
                                        <label key={concern} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="concerns"
                                                value={concern}
                                                checked={formData.concerns.includes(concern)}
                                                onChange={handleInputChange}
                                                className="mr-3 text-esbBlue focus:ring-esbBlue"
                                            />
                                            <span className="text-gray-700 font-medium">{concern}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Anything else you'd like us to know?
                                </label>
                                <textarea
                                    name="comments"
                                    value={formData.comments}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-esbBlue focus:border-transparent transition-colors"
                                    placeholder="Share any additional thoughts or requirements..."
                                />
                            </div>

                            <div>
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="followup_consent"
                                        checked={formData.followup_consent}
                                        onChange={handleInputChange}
                                        required
                                        className="mr-3 text-esbBlue focus:ring-esbBlue"
                                    />
                                    <span className="text-gray-700">
                                        I agree to be contacted by ReDge for pilot participation or follow-up. *
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                onClick={(e) =>
                                {
                                    console.log('Button clicked!')
                                    console.log('Event:', e)
                                }}
                                className="bg-esbBlue text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Interest'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Thank you! Your interest has been recorded. We'll reach out soon.
                    </div>
                </div>
            )}
        </div>
    )
}