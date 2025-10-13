import { RouteObject } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardPage from '../pages/Dashboard'
import CollectionPage from '../pages/Collection'
import NotFoundPage from '../pages/Other/NotFoundPage'
import SettingPage from '../pages/Setting'

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
        path: 'collection/words',
        element: <CollectionPage />
      },
      {
        path: 'collection/phrases',
        element: <CollectionPage />
      },
      {
        path: 'collection/grammar',
        element: <CollectionPage />
      },
      {
        path: 'analytics/statistics',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Statistics</h1>
          </div>
        )
      },
      {
        path: 'analytics/progress',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Progress</h1>
          </div>
        )
      },
      {
        path: 'analytics/most-reviewed',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Most Reviewed</h1>
          </div>
        )
      },
      // Settings Routes
      {
        path: 'settings',
        element: <SettingPage />
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]
