import { RouteObject } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardPage from '../pages/Dashboard'
import CollectionPage from '../pages/Collection'
import NotFoundPage from '../pages/Other/NotFoundPage'
import SettingPage from '../pages/Setting'
import SessionPopupPage from '../pages/SessionPopupPage'
import QuestionPage from '../pages/Question'

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
        path: 'analytics',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
        )
      },
      // Question Routes
      {
        path: 'questions',
        element: <QuestionPage />
      },
      // Settings Routes
      {
        path: 'settings',
        element: <SettingPage />
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
