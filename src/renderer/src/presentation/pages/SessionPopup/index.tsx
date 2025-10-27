import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Clock, BookOpen, Brain } from 'lucide-react'

const SessionPopupPage = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') || ''
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleStartSession = async () => {
    try {
      if (!window.api) {
        console.error('[SessionPopup] window.api is not available')
        return
      }

      const result = await window.api.popup.hideAndFocusMain(sessionId)
      if (result.success) {
        console.log('[SessionPopup] Main window focused, navigating to session')
      } else {
        console.error('[SessionPopup] Failed to focus main window:', result.error)
      }
    } catch (error) {
      console.error('[SessionPopup] Error:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">🎯 Session mới đã sẵn sàng!</CardTitle>
          <p className="text-sm text-gray-500">Đã đến giờ ôn tập rồi!</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{formatTime(timeLeft)}</p>
            <p className="text-xs text-orange-600 mt-1">Thời gian còn lại</p>
          </div>

          {/* Session Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-semibold text-gray-700">5 câu hỏi</p>
                <p className="text-xs text-gray-500">Ôn tập kiến thức</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handleStartSession} size="lg" className="w-full text-lg font-semibold">
              🚀 Bắt đầu ngay
            </Button>
            <p className="text-xs text-center text-gray-400">
              Session ID: {sessionId.substring(0, 8)}...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionPopupPage
