import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Session } from './types'
import { Clock, Play, X } from 'lucide-react'
import CustomButton from '../../../components/common/CustomButton'

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
    // Đóng popup và điều hướng main window
    window.close()
    // Có thể gửi message đến main window để navigate
  }

  const handleClose = () => {
    window.close()
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-text-secondary">Đang tải session...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background p-6 flex items-center justify-center">
      <div className="bg-card-background border border-border rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Giờ luyện tập!</h3>
              <p className="text-sm text-text-secondary">Session mới đã sẵn sàng</p>
            </div>
          </div>
          <CustomButton variant="secondary" size="sm" onClick={handleClose}>
            Ẩn
          </CustomButton>
        </div>

        <div className="p-6">
          <div className="text-center">
            <p className="text-text-primary mb-2">
              <strong>{session.question_ids.length}</strong> câu hỏi mới
            </p>
            <p className="text-sm text-text-secondary">
              Session ID: <code className="text-xs">{session.id.substring(0, 12)}...</code>
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <CustomButton variant="secondary" size="md" onClick={handleClose} className="flex-1">
            Ẩn đi
          </CustomButton>
          <CustomButton
            variant="primary"
            size="md"
            icon={Play}
            onClick={handleStart}
            className="flex-1"
          >
            Bắt đầu ngay
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

export default SessionPopupPage
