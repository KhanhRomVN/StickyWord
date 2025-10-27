import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Session } from './types'
import { Clock, Play, X } from 'lucide-react'

const SessionPopupPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  const loadSession = (id: string) => {
    try {
      const sessionsStr = localStorage.getItem('practice_sessions')
      if (sessionsStr) {
        const sessions: Session[] = JSON.parse(sessionsStr)
        const found = sessions.find((s) => s.id === id)
        setSession(found || null)
      }
    } catch (error) {
      console.error('[SessionPopupPage] Error loading session:', error)
    }
  }

  const handleStart = () => {
    console.log('[SessionPopupPage] Starting session:', session?.id)

    // Update session status to active
    if (session) {
      try {
        const sessionsStr = localStorage.getItem('practice_sessions')
        if (sessionsStr) {
          const sessions: Session[] = JSON.parse(sessionsStr)
          const updated = sessions.map((s) =>
            s.id === session.id
              ? { ...s, status: 'active' as const, started_at: new Date().toISOString() }
              : s
          )
          localStorage.setItem('practice_sessions', JSON.stringify(updated))
          console.log('[SessionPopupPage] ✅ Session status updated to active')
        }
      } catch (error) {
        console.error('[SessionPopupPage] Error updating session:', error)
      }
    }

    // Notify main window to reload sessions
    if (window.opener) {
      window.opener.postMessage({ type: 'session-updated' }, '*')
      console.log('[SessionPopupPage] 📤 Sent update message to main window')
    }

    // Close popup window
    window.close()
  }

  const handleClose = () => {
    console.log('[SessionPopupPage] Closing popup without starting')
    window.close()
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 dark:text-gray-400">Đang tải session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-transparent flex items-end justify-end p-5">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Giờ luyện tập!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Session mới đã sẵn sàng
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.question_ids.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">câu hỏi mới</p>
            </div>
            <Play className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-0">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Để sau
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Bắt đầu
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionPopupPage
