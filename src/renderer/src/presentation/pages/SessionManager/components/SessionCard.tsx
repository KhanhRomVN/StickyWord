import { Play, Calendar, Clock, Trash2 } from 'lucide-react'
import CustomButton from '../../../../components/common/CustomButton'

interface SessionCardProps {
  session: {
    id: string
    title?: string
    questions: any[]
    status: 'pending' | 'completed'
    created_at: string
    expires_at?: string
    difficulty_level?: number
  }
  onStart: (sessionId: string) => void
  onDelete: (sessionId: string) => void
}

const SessionCard = ({ session, onStart, onDelete }: SessionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-500/10'
      case 'active':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
      case 'expired':
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/10'
      default:
        return 'text-orange-600 dark:text-orange-400 bg-orange-500/10'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành'
      case 'active':
        return 'Đang làm'
      case 'expired':
        return 'Hết hạn'
      default:
        return 'Chưa làm'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const accuracy =
    session.completed_questions > 0
      ? Math.round((session.correct_answers / session.completed_questions) * 100)
      : 0

  return (
    <div className="bg-card-background border border-border-default rounded-lg p-4 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate mb-1">
            {session.title || `Session ${session.id.substring(0, 8)}`}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(session.created_at)}</span>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}
        >
          {getStatusLabel(session.status)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {session.status !== 'expired' && (
          <CustomButton
            variant="primary"
            size="sm"
            icon={Play}
            onClick={() => onStart(session.id)}
            className="flex-1"
          >
            {session.status === 'completed' ? 'Xem lại' : 'Bắt đầu'}
          </CustomButton>
        )}
        <button
          onClick={() => onDelete(session.id)}
          className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
          title="Xóa session"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expiry Info */}
      {session.expires_at && (
        <div className="mt-2 pt-2 border-t border-border-default">
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Hết hạn: {formatDate(session.expires_at)}
          </p>
        </div>
      )}
    </div>
  )
}

export default SessionCard
