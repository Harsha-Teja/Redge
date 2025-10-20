import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Overview from './pages/Overview.jsx'
import KnowledgeBase from './pages/KnowledgeBase.jsx'
import Sites from './pages/Sites.jsx'
import Analysis from './pages/Analysis.jsx'
import Calculations from './pages/Calculations.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/discover', element: <Overview /> },
  { path: '/knowledge-base', element: <KnowledgeBase /> },
  { path: '/modular-dc-analysis', element: <Sites /> },
  { path: '/sites', element: <Sites /> }, // Legacy route for backward compatibility
  { path: '/analysis', element: <Analysis /> },
  { path: '/calculations', element: <Calculations /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
