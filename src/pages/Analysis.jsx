/**
 * Analysis page for ReDge - Clean page ready for new content
 * Protected by passcode authentication
 */
import PasscodeProtection from '../components/PasscodeProtection.jsx'

function Analysis()
{
    return (
        <PasscodeProtection
            correctPasscode="harsha@esb.ie"
            title="Analysis Access Required"
            subtitle="Please enter the passcode to access the analysis tools"
        >
            <main className="pt-20">
                <div className="py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Analysis
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                This page is ready for new content and functionality.
                            </p>
                        </div>

                        {/* Placeholder Content */}
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <div className="text-gray-500 text-lg">
                                Content area ready for new features
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </PasscodeProtection>
    )
}

export default Analysis
