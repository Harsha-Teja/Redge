import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Overview from './pages/Overview.jsx'
import Latest from './pages/Latest.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/discover', element: <Overview /> },
  { path: '/latest', element: <Latest /> },
  { path: '/sites', element: <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Sites - Coming Soon</h1></div> },
  { path: '/analysis', element: <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-900">Analysis - Coming Soon</h1></div> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
