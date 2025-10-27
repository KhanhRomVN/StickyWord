import { RouterProvider, createHashRouter } from 'react-router-dom'
import { routes } from './presentation/routes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './presentation/providers/theme-provider'
import { DatabaseProvider } from './presentation/providers/database-provider'
import DatabaseConnectionOverlay from './components/common/DatabaseConnectionOverlay'
import { useEffect } from 'react'
import {
  getAutoSessionService,
  destroyAutoSessionService,
  AutoSessionConfig
} from './presentation/pages/Dashboard/services/AutoSessionService'

function App() {
  const router = createHashRouter(routes)
  const queryClient = new QueryClient()

  // 🚀 Khởi động AutoSessionService khi app load
  useEffect(() => {
    console.log('[App] 🔄 Initializing AutoSessionService...')

    const loadAndStartService = async () => {
      try {
        if (!window.api) {
          console.error('[App] ❌ window.api is not available')
          return
        }

        const config: AutoSessionConfig = await window.api.storage.get('auto_session_config')
        if (!config) {
          console.log('[App] ⚠️ No config found, service not started')
          return
        }

        if (!config.enabled) {
          console.log('[App] ⚠️ Service disabled in config')
          return
        }

        console.log('[App] ✅ Config loaded:', {
          enabled: config.enabled,
          interval_minutes: config.interval_minutes,
          question_count: config.question_count
        })

        const service = getAutoSessionService(config, (session) => {
          console.log('[App] 🎉 New session created by AutoSessionService:', session.id)

          // Dispatch custom event để các component khác có thể lắng nghe
          window.dispatchEvent(
            new CustomEvent('new-session-created', {
              detail: { session }
            })
          )
        })

        service.start()
        console.log('[App] ✅ AutoSessionService started')
      } catch (error) {
        console.error('[App] ❌ Failed to start AutoSessionService:', error)
      }
    }

    loadAndStartService()

    // ✅ Listen cho message từ popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'session-updated') {
        console.log('[App] 📬 Received session update from popup')
        window.dispatchEvent(new CustomEvent('session-updated'))
      }
    }

    const handleNavigateToSession = (_event: any, sessionId: string) => {
      console.log('[App] 🚀 Navigate to session:', sessionId)
      router.navigate(`/session?sessionId=${sessionId}`)
    }

    window.addEventListener('message', handleMessage)

    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('navigate-to-session', handleNavigateToSession)
    }

    return () => {
      console.log('[App] 🛑 Stopping AutoSessionService...')
      destroyAutoSessionService()
      window.removeEventListener('message', handleMessage)
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeListener('navigate-to-session', handleNavigateToSession)
      }
    }
  }, [])

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
