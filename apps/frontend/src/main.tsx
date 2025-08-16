import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import Login from './Login.tsx'
import Signup from './Signup.tsx'
import GroupManagement from './GroupManagement.tsx'
import GroupCreate from './GroupCreate'
import GroupTransaction from './GroupTransaction.tsx'
import Landing from './Landing.tsx'
import AppWithGroups from './AppWithGroups.tsx'

// Force dark mode regardless of user's system preference
document.documentElement.classList.add('dark')

// Prevent system preference from overriding dark mode
const forceDarkMode = () => {
  document.documentElement.classList.add('dark')
}

// Add event listener to ensure dark mode persists
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', forceDarkMode)

// Initial call to force dark mode
forceDarkMode()

// Create router with React Router v7
const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,

  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/home',
    element: <App />,

  },
  {
    path: '/home-filled',
    element: <AppWithGroups />,
  },
  {
    path: '/group/create',
    element: <GroupCreate />,

  },
  {
    path: '/group/:id/:transactionId',
    element: <GroupTransaction />,

  },
  {
    path: '/group/:id',
    element: <GroupManagement />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)