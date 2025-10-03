/**
 * Navbar.jsx
 *
 * A responsive navigation bar for ReDge with ESB branding.
 * Features active tab highlighting, mobile hamburger menu, and CTA button.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar()
{
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('discover')
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    })

    const navigationItems = [
        { id: 'discover', label: 'Discover', href: '/discover' },
        { id: 'sites', label: 'Sites', href: '#sites' },
        { id: 'analysis', label: 'Analysis', href: '#analysis' },
        { id: 'latest', label: 'Latest', href: '/latest' }
    ]

    const handleContactInputChange = (e) =>
    {
        const { name, value } = e.target
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleContactSubmit = (e) =>
    {
        e.preventDefault()

        // Check if form is valid
        if (!contactForm.name || !contactForm.email || !contactForm.message)
        {
            alert('Please fill in all fields.')
            return
        }

        // Here you would typically send the form data to your backend
        console.log('Contact form submitted:', contactForm)

        // Show success message
        alert('Thank you for your message! We\'ll get back to you soon.')

        // Reset form and close modal
        setContactForm({ name: '', email: '', message: '' })
        setIsContactModalOpen(false)
    }

    const openContactModal = () =>
    {
        setIsContactModalOpen(true)
    }

    const closeContactModal = () =>
    {
        setIsContactModalOpen(false)
        setContactForm({ name: '', email: '', message: '' })
    }

    return (
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Brand */}
                <div className="flex flex-col">
                    <Link to="/discover" className="text-2xl font-bold tracking-tight text-gray-800">
                        <span className="text-esbBlue">Re</span>
                        <span className="text-emeraldGreen">Dge</span>
                    </Link>
                    <span className="text-xs text-gray-500">by ESB | Resilient Edge</span>
                </div>

                {/* Desktop Navigation */}
                <ul className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
                    {navigationItems.map((item) => (
                        <li key={item.id}>
                            {item.href.startsWith('/') ? (
                                <Link
                                    to={item.href}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`pb-1 transition-colors hover:text-gray-900 ${activeTab === item.id
                                        ? 'border-b-2 border-emeraldGreen text-gray-900'
                                        : ''
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    href={item.href}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`pb-1 transition-colors hover:text-gray-900 ${activeTab === item.id
                                        ? 'border-b-2 border-emeraldGreen text-gray-900'
                                        : ''
                                        }`}
                                >
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Desktop CTA Button */}
                <button
                    type="button"
                    onClick={openContactModal}
                    className="hidden rounded-lg bg-esbBlue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-esbBlue focus:ring-offset-2 md:inline-flex"
                >
                    Contact Us
                </button>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 md:hidden"
                    aria-label="Toggle Mobile Menu"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-gray-200 bg-white md:hidden">
                    <div className="px-6 py-4 space-y-3">
                        {navigationItems.map((item) => (
                            item.href.startsWith('/') ? (
                                <Link
                                    key={item.id}
                                    to={item.href}
                                    onClick={() =>
                                    {
                                        setActiveTab(item.id)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`block py-2 text-sm transition-colors hover:text-gray-900 ${activeTab === item.id
                                        ? 'border-l-4 border-emeraldGreen pl-3 text-gray-900'
                                        : 'text-gray-600'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    onClick={() =>
                                    {
                                        setActiveTab(item.id)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`block py-2 text-sm transition-colors hover:text-gray-900 ${activeTab === item.id
                                        ? 'border-l-4 border-emeraldGreen pl-3 text-gray-900'
                                        : 'text-gray-600'
                                        }`}
                                >
                                    {item.label}
                                </a>
                            )
                        ))}
                        <button
                            type="button"
                            onClick={openContactModal}
                            className="mt-4 w-full rounded-lg bg-esbBlue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            )}

            {/* Contact Modal - Clean Redesign */}
            {isContactModalOpen && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-start justify-center p-4"
                    style={{ zIndex: 9999999 }}
                    onClick={closeContactModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-md mt-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Contact ReDge Team</h2>
                            <button
                                onClick={closeContactModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    The ReDge discovery tool is built by ESB's Resilient Edge team to explore modular data centre feasibility in Ireland.
                                </p>
                                <a
                                    href="mailto:example@esb.ie"
                                    className="inline-flex items-center text-green-600 font-semibold hover:underline"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    example@esb.ie
                                </a>
                            </div>

                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleContactInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleContactInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={contactForm.message}
                                        onChange={handleContactInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Your message..."
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Send Message
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeContactModal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}


