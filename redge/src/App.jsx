import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'


function App()
{
  const [count, setCount] = useState(0)

  return (
    // Page container
    <div className="min-h-screen bg-lightGray text-darkGray antialiased">
      <Navbar />
      {/* Content wrapper */}
      <main className="mx-auto max-w-5xl px-6 py-10 text-center">
        {/* Logos */}
        <div className="flex items-center justify-center gap-6">
          <a href="https://vite.dev" target="_blank" rel="noreferrer" className="transition-transform hover:scale-105">
            <img
              src={viteLogo}
              alt="Vite logo"
              className="h-24 w-24 drop-shadow-[0_0_12px_rgba(100,108,255,0.45)]"
            />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer" className="transition-transform hover:scale-105">
            <img
              src={reactLogo}
              alt="React logo"
              className="h-24 w-24 drop-shadow-[0_0_12px_rgba(97,218,251,0.45)]"
            />
          </a>
        </div>

        {/* Title */}
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-800">Vite + React</h1>

        {/* Card / Counter */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setCount((prev) => prev + 1)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            count is {count}
          </button>
          <p className="mt-4 text-sm text-gray-600">
            Edit <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-800">src/App.jsx</code> and save to test HMR
          </p>
        </div>

        {/* Section: Rough context */}
        <section id="features" className="mt-12 text-left">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">What is Redge?</h2>
          <p className="mt-2 text-gray-600">
            Redge is a starter playground using React, Vite, and Tailwind CSS. Use this
            space to begin building your app&#39;s core features. The layout includes a
            simple navbar and footer, and this area is perfect for a quick overview or
            product pitch.
          </p>
        </section>

        <section id="pricing" className="mt-10 text-left">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">Pricing</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-600">
            <li>Free: Explore and prototype.</li>
            <li>Pro: Unlock collaboration and advanced tools.</li>
            <li>Enterprise: Tailored features and support.</li>
          </ul>
        </section>

        <section id="about" className="mt-10 text-left">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">About</h2>
          <p className="mt-2 text-gray-600">
            Built with modern tooling for fast iteration. Edit components, add pages,
            and connect APIs with confidence. This boilerplate emphasizes clarity and
            maintainability.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
