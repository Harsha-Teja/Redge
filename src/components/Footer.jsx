/**
 * Footer.jsx
 *
 * A four-column footer for ReDge Modular DC Tool with ESB branding.
 * Columns: About ReDge, Our Objective, Privacy & Data Use, Internal Use.
 */
export default function Footer()
{
    return (
        <footer className="border-t border-gray-200 bg-white">
            {/* Main Footer Content */}
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Column 1: About ReDge */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-gray-800">About ReDge</h3>
                        <p className="text-sm text-gray-600">
                            ReDge is ESB’s Resilient Edge discovery tool. It helps explore modular data centre opportunities across Ireland by combining customer needs with national infrastructure data.
                        </p>
                    </div>

                    {/* Column 2: Our Objective */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-gray-800">Our Objective</h3>
                        <p className="text-sm text-gray-600">
                            We aim to assess where modular edge data centres can deliver value. By aligning power availability, renewable generation, fibre connectivity, and land access, we help identify sites that are feasible and future-ready.
                        </p>
                    </div>

                    {/* Column 3: Privacy & Data Use */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-gray-800">Privacy & Data Use</h3>
                        <p className="text-sm text-gray-600">
                            Information entered in the form is stored securely through Netlify Forms and locally in your browser. Data is used only to generate insights for this tool and will not be shared externally. This tool is for demonstration and feasibility analysis purposes only.
                        </p>
                    </div>

                    {/* Column 4: Internal Use */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-gray-800">Internal Use</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Internal tools and analysis for ReDge team members.
                        </p>
                        <div className="space-y-2">
                            <a
                                href="/modular-dc-analysis"
                                className="block text-sm text-esbBlue hover:text-blue-700 transition-colors"
                            >
                                Modular DC Analysis
                            </a>
                            <a
                                href="/analysis"
                                className="block text-sm text-esbBlue hover:text-blue-700 transition-colors"
                            >
                                Edge Storage Analysis
                            </a>
                            <a
                                href="/calculations"
                                className="block text-sm text-esbBlue hover:text-blue-700 transition-colors"
                            >
                                Calculations
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-6xl px-6 py-4 text-center text-sm text-gray-500">
                    Copyright © ESB / ReDge 2025
                </div>
            </div>
        </footer>
    )
}


