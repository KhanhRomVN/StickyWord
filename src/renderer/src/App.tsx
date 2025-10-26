import { RouterProvider, createHashRouter } from 'react-router-dom'
import { routes } from './presentation/routes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './presentation/providers/theme-provider'
import { DatabaseProvider } from './presentation/providers/database-provider'
import DatabaseConnectionOverlay from './components/common/DatabaseConnectionOverlay'

function App() {
  const router = createHashRouter(routes)
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="stickyword-theme">
        <DatabaseProvider>
          <DatabaseConnectionOverlay />
          <RouterProvider router={router} />
        </DatabaseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
