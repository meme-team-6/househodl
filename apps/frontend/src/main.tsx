import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from './Landing'
import Signup from './Signup'
import App from './App'
import AppWithGroups from './AppWithGroups'
import GroupCreate from './GroupCreate'
import GroupManagement from './GroupManagement'
import GroupTransaction from './GroupTransaction'
import { Invite } from './Invite'
import { InviteInvalid } from './InviteInvalid'

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
    path: '/invite/:id',
    element: <Invite />,
  },
  {
    path: '/invite',
    element: <InviteInvalid />,
  },
  {
    path: '/login',
    element: <Signup />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)