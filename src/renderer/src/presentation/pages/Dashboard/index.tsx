import { useState, useEffect } from 'react'
import { Session } from '../SessionPopupPage/types'
import SessionPopup from './components/SessionPopup'
import SessionList from './components/SessionList'
import { useSessionNotification } from '../../../hooks/useSessionNotification'

const DashboardPage = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const { newSession, showPopup, closePopup } = useSessionNotification()

  // Load sessions from storage
  useEffect(() => {
    loadSessions()
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
    setActiveSession(session)
    setShowPopup(false)
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

      {/* Auto Session Popup */}
      {showPopup && newSession && (
        <SessionPopup
          session={newSession}
          onStart={() => {
            handleStartSession(newSession)
            closePopup()
            loadSessions() // Reload để update UI
          }}
          onClose={closePopup}
        />
      )}
    </div>
  )
}

export default DashboardPage
