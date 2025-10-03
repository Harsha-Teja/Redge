/**
 * Navbar.jsx
 *
 * A responsive navigation bar for ReDge with ESB branding.
 * Features active tab highlighting, mobile hamburger menu, and CTA button.
 */
import { useState } from 'react'

export default function Navbar()
{
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('discover')

    const navigationItems = [
        { id: 'discover', label: 'Discover', href: '#discover' },
        { id: 'sites', label: 'Sites', href: '#sites' },
        { id: 'analysis', label: 'Analysis', href: '#analysis' },
        { id: 'Latest', label: 'Latest', href: '#latest' }
    ]

    return (
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Brand */}
                <div className="flex flex-col">
                    <a href="#" className="text-2xl font-bold tracking-tight text-gray-800">
                        <span className="text-esbBlue">Re</span>
                        <span className="text-emeraldGreen">Dge</span>
                    </a>
                    <span className="text-xs text-gray-500">by ESB | Resilient Edge</span>
                </div>

                {/* Desktop Navigation */}
                <ul className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
                    {navigationItems.map((item) => (
                        <li key={item.id}>
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
                        </li>
                    ))}
                </ul>

                {/* Desktop CTA Button */}
                <button
                    type="button"
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
                        ))}
                        <button
                            type="button"
                            className="mt-4 w-full rounded-lg bg-esbBlue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}


