import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Overview from './pages/Overview.jsx'
import Latest from './pages/Latest.jsx'
import Sites from './pages/Sites.jsx'
import Analysis from './pages/Analysis.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/discover', element: <Overview /> },
  { path: '/latest', element: <Latest /> },
  { path: '/sites', element: <Sites /> },
  { path: '/analysis', element: <Analysis /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
