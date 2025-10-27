import { useState, useEffect } from 'react'
import { Session } from '../SessionPopupPage/types'
import SessionList from './components/SessionList'

const DashboardPage = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  // Load sessions from storage
  useEffect(() => {
    loadSessions()

    // Listen for session updates from popup window
    const handleSessionUpdate = () => {
      console.log('[DashboardPage] 🔄 Session updated, reloading...')
      loadSessions()
    }

    window.addEventListener('session-updated', handleSessionUpdate)

    return () => {
      window.removeEventListener('session-updated', handleSessionUpdate)
    }
  }, [])

  const loadSessions = () => {
    try {
      const sessionsStr = localStorage.getItem('practice_sessions')
      if (sessionsStr) {
        const loadedSessions: Session[] = JSON.parse(sessionsStr)
        setSessions(loadedSessions)
      }
    } catch (error) {
      console.error('[DashboardPage] Error loading sessions:', error)
    }
  }

  const handleStartSession = (session: Session) => {
    console.log('[DashboardPage] Starting session:', session.id)
    setActiveSession(session)
    // TODO: Navigate to question page
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Quản lý và theo dõi tiến độ học tập</p>
        </div>

        {/* Session List */}
        <SessionList
          sessions={sessions}
          onStartSession={handleStartSession}
          onReload={loadSessions}
        />
      </div>
    </div>
  )
}

export default DashboardPage
