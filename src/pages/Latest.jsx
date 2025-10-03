/**
 * Latest.jsx
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

export default function Latest()
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
                        <h1 className="text-3xl font-bold text-gray-900">Latest Updates</h1>
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


