import { RouteObject } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardPage from '../pages/Dashboard'
import NotFoundPage from '../pages/Other/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <DashboardPage />
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]
