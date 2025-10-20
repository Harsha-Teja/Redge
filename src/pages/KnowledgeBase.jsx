/**
 * KnowledgeBase.jsx
 *
 * A simple page that fetches and displays recent news items aggregated from
 * multiple RSS feeds. Uses rss-parser to parse feeds client-side and merges,
 * sorts, and filters items. Includes a refresh button with loading state.
 */
import { useCallback, useEffect, useState } from 'react'
import Parser from 'rss-parser/dist/rss-parser.min.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/96x96.png?text=News'

// Feeds to aggregate
const FEED_URLS = [
    'https://news.google.com/rss/search?q=data+centre+ireland',
    'https://news.google.com/rss/search?q=data+centre+eu',
    'https://feeds.feedburner.com/datacenterfrontier',
    'https://www.datacenterdynamics.com/en/rss/',
]


// Helper to extract a human-readable source from an item or feed
function getItemSource(item, fallbackTitle)
{
    if (item.creator) return item.creator
    if (item.author) return item.author
    if (item['dc:creator']) return item['dc:creator']
    if (item.source && item.source.title) return item.source.title
    return fallbackTitle || 'Unknown Source'
}

// Extract an image URL from rss2json item variants; fallback to placeholder
function getItemImageUrl(it)
{
    const enclosureUrl = it.enclosure?.link || it.enclosure?.url
    const enclosuresFirst = Array.isArray(it.enclosures) && it.enclosures.length > 0 ? (it.enclosures[0].url || it.enclosures[0].link) : ''
    const mediaThumb = it.thumbnail || it.enclosure?.thumbnail
    const possible = enclosureUrl || enclosuresFirst || mediaThumb
    return possible || PLACEHOLDER_IMAGE
}

// Basic HTML tag stripper for description excerpts
function stripHtml(html)
{
    if (!html) return ''
    return String(html).replace(/<[^>]+>/g, '')
}

export default function KnowledgeBase()
{
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resources, setResources] = useState([])
    const [extraLoaded, setExtraLoaded] = useState(false)
    const [showAllNews, setShowAllNews] = useState(false)

    const fetchNews = useCallback(async () =>
    {
        setLoading(true)
        setError('')
        try
        {
            const tenDaysAgo = new Date()
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

            const fetchOne = async (url) =>
            {
                const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
                const res = await fetch(api)
                if (!res.ok) throw new Error('rss2json upstream error')
                const data = await res.json()
                if (data.status !== 'ok' || !data.items) throw new Error('Invalid rss2json response')
                return { title: data.feed?.title || '', items: data.items }
            }

            const feeds = await Promise.all(FEED_URLS.map(fetchOne))

            const merged = feeds.flatMap((feed) =>
                (feed.items || []).map((it) =>
                {
                    const published = it.pubDate || it.isoDate || it.published || it.date
                    const dateObj = published ? new Date(published) : null
                    return {
                        title: it.title || 'Untitled',
                        link: it.link || it.guid || '#',
                        date: dateObj,
                        dateRaw: published || '',
                        source: it.author || getItemSource(it, feed.title),
                        image: getItemImageUrl(it),
                        summary: stripHtml(it.description || it.content || ''),
                    }
                })
            )

            const recent = merged
                .filter((it) => it.date && it.date >= tenDaysAgo)
                .sort((a, b) => b.date - a.date)

            setItems(recent)
        } catch (e)
        {
            setError('Failed to fetch news. Please try again later.')
        } finally
        {
            setLoading(false)
        }
    }, [])

    useEffect(() =>
    {
        fetchNews()
    }, [fetchNews])


    useEffect(() =>
    {
        async function loadExtras()
        {
            try
            {
                const res = await fetch('/data/latest.json', { cache: 'no-store' })
                if (!res.ok) throw new Error('missing latest.json')
                const data = await res.json()
                setResources(Array.isArray(data.resources) ? data.resources : [])
            } catch (_)
            {
                setResources([])
            } finally
            {
                setExtraLoaded(true)
            }
        }
        loadExtras()
    }, [])

    function formatDisplayDate(dateStr)
    {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return ''
        return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    }

    /**
     * Toggle between showing all news items or just the first 4
     */
    function toggleShowAllNews()
    {
        setShowAllNews(!showAllNews)
    }


    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
            <Navbar />
            <main className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                        <button
                            type="button"
                            onClick={fetchNews}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh News
                        </button>
                    </div>
                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Fetching latest news…</span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {/* News Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📰 Latest News</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.length > 0 ? (
                            (showAllNews ? items : items.slice(0, 4)).map((item, idx) => (
                                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            <img
                                                src={item.image}
                                                alt="Article thumbnail"
                                                className="h-20 w-20 rounded-lg object-cover"
                                                loading="lazy"
                                                onError={(e) =>
                                                {
                                                    if (e.currentTarget.src !== PLACEHOLDER_IMAGE)
                                                    {
                                                        e.currentTarget.src = PLACEHOLDER_IMAGE
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs text-gray-500 mb-2">
                                                {item.date ? item.date.toLocaleString() : item.dateRaw}
                                            </div>
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-lg font-semibold text-blue-600 hover:underline line-clamp-2"
                                            >
                                                {item.title}
                                            </a>
                                            <div className="mt-1 text-sm italic text-gray-500">
                                                {item.source}
                                            </div>
                                            {item.summary && (
                                                <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                                                    {item.summary}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !loading && (
                                <div className="col-span-full py-12 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">No recent news in the last 10 days</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* View More/Less Button */}
                    {items.length > 4 && (
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={toggleShowAllNews}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                            >
                                {showAllNews ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        View Less
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        View More ({items.length - 4} more)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </section>



                {/* Data Center Basics */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">🏗️ Data Center Basics</h2>
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <div className="prose prose-lg max-w-none">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🌐</span>
                                    What is a data centre?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    A data centre is a special building that stores and runs the computer servers that power the internet.
                                    It's where your online banking, streaming, email, and AI tools actually "live".
                                    Instead of keeping computers in your office, companies rent or build data centres so their systems stay secure, cool, and always powered.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">⚙️</span>
                                    Why do we need data centres?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Because everything we do creates and uses digital data — websites, cloud storage, AI, and apps.
                                    Data centres make sure that:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>servers never lose power,</li>
                                    <li>information moves fast and securely, and</li>
                                    <li>the system runs 24/7.</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Think of them as digital factories that process and deliver data instead of physical goods.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🧩</span>
                                    What's inside a data centre?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Every data centre has three main systems:
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Part</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">What it does</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm text-gray-900">🖥️ IT Equipment</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Servers, storage drives, and network switches.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm text-gray-900">⚡ Power Systems</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Electrical supply, UPS batteries, and generators that keep everything running.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm text-gray-900">❄️ Cooling Systems</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Air or liquid systems that remove heat from servers.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🧱</span>
                                    What types of data centres exist?
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Simple explanation</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Example use</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Traditional / Enterprise</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Owned and used by one company for itself.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Banks, hospitals, governments.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Colocation (Colo)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Shared facility where many companies rent space or racks.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Startups, SMEs.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Cloud</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Servers owned by cloud providers (AWS, Azure, Google).</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Storing data or running apps online.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Edge</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Small, local centres closer to users for faster response.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Smart cities, IoT.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Hyperscale</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Very large facilities used by tech giants.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Amazon, Meta, Google.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">AI / High-Density</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Built for heavy GPU computing.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">AI training, graphics rendering.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Modular</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Pre-built, container-like units added as needed.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Quick, scalable builds.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🔌</span>
                                    What is a "colocation" data centre?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    It's a shared building where you can rent space, power, and cooling for your own servers.
                                    The facility owner manages the infrastructure; you manage your hardware.
                                </p>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Think of it like renting a secure, temperature-controlled storage locker for your computers.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🧱</span>
                                    What is a "modular" data centre?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    A modular data centre is built from pre-fabricated blocks (modules) instead of constructing the entire building at once.
                                    Each module has its own cooling and power.
                                    You can start small and add more as demand grows — just like stacking Lego blocks.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">📊</span>
                                    What does "Tier I to Tier IV" mean?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    It's a rating from the Uptime Institute showing reliability:
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tier</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Typical Uptime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">I</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Basic — power/cooling not redundant</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">99.67%</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">II</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Some backup power/cooling</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">99.75%</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">III</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Fully maintainable without downtime</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">99.98%</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">IV</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Fault-tolerant, dual systems</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">99.99%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Higher Tier → higher cost and more reliability.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">⚡</span>
                                    What is "MW" and "kW"?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    They measure electrical power — how fast energy is used.
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Unit</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Meaning</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Example</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Watt (W)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Power of one light bulb.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">—</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">kW (kilowatt)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">1,000 watts.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">A home may use 2–5 kW.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">MW (megawatt)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">1,000 kW or one million watts.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">A medium data centre = 5 MW.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Power (MW) shows how much electricity the data centre can draw at one moment.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🔋</span>
                                    What is "kWh" or "MWh"?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    That's energy used over time.
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>1 kWh = using 1 kW for 1 hour.</li>
                                    <li>A typical Irish home uses about 4,200 kWh/year.</li>
                                    <li>A 1 MW data centre running all year uses 8,760 MWh (1 MW × 8760 hours).</li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">⚙️</span>
                                    What is "PUE" (Power Usage Effectiveness)?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    PUE = Total Facility Power ÷ IT Equipment Power
                                </p>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    It shows how efficiently the power is used.
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>PUE = 1.0 → perfect (all power goes to servers).</li>
                                    <li>Most modern centres: 1.3 – 1.5.</li>
                                    <li>Lower PUE = better energy efficiency.</li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🧠</span>
                                    What is "High-Density" vs "Standard" computing?
                                </h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Standard density = typical business servers (3–10 kW per rack).</li>
                                    <li>High-density = AI or GPU servers (20–60 kW per rack).</li>
                                    <li>High-density needs liquid cooling and more electrical capacity.</li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">💶</span>
                                    What are CapEx and OpEx?
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Term</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Meaning</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Example</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">CapEx (Capital Expenditure)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">One-time cost to build the facility.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Land, construction, power equipment.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">OpEx (Operating Expenditure)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Yearly running cost.</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Energy bills, maintenance, staff.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🧮</span>
                                    How do data-centre costs work?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Costs are mainly driven by:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Electrical systems (~40–45% of CapEx)</li>
                                    <li>Cooling systems (~15–20%)</li>
                                    <li>Building structure (~10–15%)</li>
                                    <li>Network & security (~5%)</li>
                                    <li>Design & contingency (~10%)</li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🧾</span>
                                    How do companies earn revenue from data centres?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Through service models such as:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Retail Colocation: Rent small spaces to many clients.</li>
                                    <li>Wholesale: Lease large areas to a few clients.</li>
                                    <li>Dedicated Hosting: Provide servers for one customer.</li>
                                    <li>Managed Service: Add monitoring and management.</li>
                                    <li>AI / GPU Pods: Lease high-power compute racks.</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Revenue is usually charged in €/kW/month.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🪫</span>
                                    What is the MIC limit?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    MIC (Maximum Import Capacity) = the highest electrical load that the grid connection can supply to a site.
                                    If a customer's required MW &gt; MIC available, the grid must be upgraded.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🌍</span>
                                    What is the "T50 ring" in Dublin?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    It's a fibre-optic ring that circles Dublin (along the M50 motorway).
                                    It connects major telecom carriers and data centres, providing high-speed, low-latency network access.
                                    Being "on the T50 ring" means excellent connectivity.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🌱</span>
                                    How do data centres handle sustainability?
                                </h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>They use renewable power (wind, solar, hydro).</li>
                                    <li>Improve efficiency (low PUE).</li>
                                    <li>Reuse waste heat for nearby buildings.</li>
                                    <li>Install batteries or energy-storage systems.</li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">📉</span>
                                    How do we measure feasibility?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    We look at three main metrics:
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Metric</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Meaning</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">IRR (Internal Rate of Return)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Annual % return from investment.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">NPV (Net Present Value)</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Present value of all future cashflows.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Payback Period</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">How many years until investment is recovered.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Projects are considered good if IRR &gt; 10% and Payback &lt; 7 years.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🏗️</span>
                                    What is a modular data-centre advantage?
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Benefit</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Explanation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Faster to build</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">6–9 months per module vs 18–24 months traditional.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Lower initial cost</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Build small, expand later.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Scalable</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Add modules as demand grows.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Efficient</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Newer cooling tech → better PUE.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">🔒</span>
                                    What is Disaster Recovery (DR)?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    A backup site that can take over if the main data centre fails.
                                    Some clients pay extra to have a second "mirror" data centre for continuity.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">📈</span>
                                    What factors affect customer pricing?
                                </h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Power (kW) — main cost driver.</li>
                                    <li>Tier level — more reliability = higher cost.</li>
                                    <li>GPU % / density — high-density = more cooling = higher cost.</li>
                                    <li>Renewable target — adds green premium.</li>
                                    <li>Contract term — longer = lower monthly rate.</li>
                                    <li>Disaster recovery — doubles capacity, adds redundancy.</li>
                                    <li>Region — Dublin cheaper connectivity; regions cheaper land.</li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">⚡</span>
                                    How does ESB fit into all this?
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    ESB owns:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>the electrical grid,</li>
                                    <li>dark fibre around Dublin (Metro Express + T50 ring), and</li>
                                    <li>renewable generation assets.</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    That makes ESB uniquely positioned to combine power, fibre, and green energy for new regional data-centre networks.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">📊</span>
                                    Why does the tool collect so many inputs?
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Each field changes one part of the financial or technical model:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Some affect formulas (load, PUE, price, term).</li>
                                    <li>Others adjust multipliers (Tier, GPU %, Renewable).</li>
                                    <li>Others set filters (region, MIC, sovereignty).</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Together, they make feasibility estimates realistic and personalised.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">💡</span>
                                    Quick Glossary
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Term</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Simple Meaning</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">IT Load</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">How much computing power you need.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Rack Density</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Power per server rack.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Latency</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Delay between data request and response.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Bandwidth</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Amount of data that can flow per second.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">CPI</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Consumer Price Index (used for inflation).</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">DR Site</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Disaster-recovery backup site.</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">AI / GPU Share</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">Portion of computing for AI tasks.</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Renewable % Target</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">How much energy should come from green sources.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-3">📚</span>
                                    Assumptions Behind the Tool
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Parameter</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Typical Value</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">CapEx per MW</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">€8–10 M</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">Uptime Institute, Bitpower 2024</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">OpEx per MW/year</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">€0.5–0.8 M</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">CBRE Global DC Cost Index</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Electricity price</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">€0.10–0.15 / kWh</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">SEAI 2024</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">PUE</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">1.3–1.5</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">ASHRAE / Uptime</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Rent €/kW/month</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">€160–€400</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">CBRE / Structure Research</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">IRR Target</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">10%</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">EY Infrastructure Benchmarks</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">Payback Target</td>
                                                <td className="py-3 px-4 text-sm text-gray-700">≤ 7 years</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">Industry average</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources & Reports */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Resources & Reports</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {resources.length > 0 ? (
                            resources.map((rr, i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 font-medium mb-2">{formatDisplayDate(rr.date)}</div>
                                            <a
                                                href={rr.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-lg font-semibold text-blue-600 hover:underline line-clamp-2"
                                            >
                                                {rr.title}
                                            </a>
                                        </div>
                                        <div className="ml-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {rr.description && (
                                        <p className="text-sm text-gray-600 line-clamp-3">{rr.description}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            extraLoaded && (
                                <div className="col-span-full py-12 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">No resources available</p>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}


