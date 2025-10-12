import { RouterProvider, createHashRouter } from 'react-router-dom'
import { routes } from './presentation/routes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './presentation/providers/theme-provider'
import { useDatabase } from './hooks/useDatabase'
import DatabaseSetupOverlay from './components/common/DatabaseSetupOverlay'

function App() {
  const router = createHashRouter(routes)
  const queryClient = new QueryClient()
  const { isConnected, isLoading, createNewDatabase, selectExistingDatabase } = useDatabase()

  // Hiển thị loading trong khi check database
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra database...</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="stickyword-theme">
        {!isConnected && (
          <DatabaseSetupOverlay
            onCreateNew={createNewDatabase}
            onSelectExisting={selectExistingDatabase}
          />
        )}
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
