/**
 * PasscodeProtection Component - Simple passcode protection wrapper
 * Protects content behind a passcode form with clean UI
 * Includes Navbar and Footer for navigation purposes
 */
import { useState } from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

/**
 * PasscodeProtection component that wraps content behind passcode authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to protect
 * @param {string} props.correctPasscode - The correct passcode to unlock content
 * @param {string} props.title - Title to display on the passcode form
 * @param {string} props.subtitle - Subtitle to display on the passcode form
 * @returns {JSX.Element} Either the passcode form or the protected content
 */
function PasscodeProtection({
    children,
    correctPasscode = 'harsha@esb.ie',
    title = 'Access Required',
    subtitle = 'Please enter the passcode to view this content'
})
{
    // State to track if user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    // State to track the current passcode input
    const [passcode, setPasscode] = useState('')
    // State to track if there was an error
    const [error, setError] = useState('')

    /**
     * Handles passcode form submission
     * Compares entered passcode with correct passcode
     */
    const handleSubmit = (e) =>
    {
        e.preventDefault()

        // Clear any previous errors
        setError('')

        // Check if passcode matches
        if (passcode === correctPasscode)
        {
            setIsAuthenticated(true)
        } else
        {
            setError('Incorrect passcode. Please try again.')
            setPasscode('') // Clear the input
        }
    }

    /**
     * Handles passcode input changes
     * Clears error when user starts typing
     */
    const handlePasscodeChange = (e) =>
    {
        setPasscode(e.target.value)
        if (error)
        {
            setError('') // Clear error when user starts typing
        }
    }

    // If authenticated, show the protected content with Navbar and Footer
    if (isAuthenticated)
    {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                {children}
                <Footer />
            </div>
        )
    }

    // Show passcode form if not authenticated
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex items-center justify-center px-4 pt-20 pb-16 min-h-screen">
                <div className="max-w-md w-full">
                    {/* Passcode Form Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {title}
                            </h1>
                            <p className="text-gray-600">
                                {subtitle}
                            </p>
                        </div>

                        {/* Passcode Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="passcode"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Passcode
                                </label>
                                <input
                                    type="password"
                                    id="passcode"
                                    value={passcode}
                                    onChange={handlePasscodeChange}
                                    placeholder="Enter passcode"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    required
                                    autoFocus
                                />
                                {/* Error Message */}
                                {error && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Access Content
                            </button>
                        </form>

                        {/* Footer Note */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                This content is protected and requires authentication
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default PasscodeProtection
