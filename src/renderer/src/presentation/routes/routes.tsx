import { RouteObject } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardPage from '../pages/Dashboard'
import CollectionPage from '../pages/Collection'
import NotFoundPage from '../pages/Other/NotFoundPage'
import SettingPage from '../pages/Setting'
import SessionPopupPage from '../pages/SessionPopup'
import SessionPage from '../pages/Session'
import SessionManagerPage from '../pages/SessionManager'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <DashboardPage />
      },
      {
        path: 'collections',
        element: <CollectionPage />
      },
      {
        path: 'analytics',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
        )
      },
      // Settings Routes
      {
        path: 'settings',
        element: <SettingPage />
      },
      // Session Routes
      {
        path: 'session',
        element: <SessionPage />
      },
      {
        path: '/session-manager',
        element: <SessionManagerPage />
      }
    ]
  },
  {
    path: '/popup-session',
    element: <SessionPopupPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]
