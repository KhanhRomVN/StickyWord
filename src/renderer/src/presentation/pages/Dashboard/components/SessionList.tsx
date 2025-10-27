import { Session } from '../types'
import { Play, Clock, CheckCircle, XCircle } from 'lucide-react'
import CustomButton from '../../../../components/common/CustomButton'
import CustomBadge from '../../../../components/common/CustomBadge'

interface SessionListProps {
  sessions: Session[]
  onStartSession: (session: Session) => void
  onReload: () => void
}

const SessionList = ({ sessions, onStartSession, onReload }: SessionListProps) => {
  const getStatusBadge = (status: Session['status']) => {
    switch (status) {
      case 'pending':
        return (
          <CustomBadge variant="warning" size="sm">
            Chờ làm
          </CustomBadge>
        )
      case 'active':
        return (
          <CustomBadge variant="info" size="sm">
            Đang làm
          </CustomBadge>
        )
      case 'completed':
        return (
          <CustomBadge variant="success" size="sm">
            Hoàn thành
          </CustomBadge>
        )
      case 'expired':
        return (
          <CustomBadge variant="error" size="sm">
            Hết hạn
          </CustomBadge>
        )
    }
  }

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'active':
        return <Play className="w-5 h-5 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Practice Sessions</h2>
        <CustomButton variant="secondary" size="sm" onClick={onReload}>
          Làm mới
        </CustomButton>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-text-secondary">Chưa có session nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border border-border rounded-lg bg-card-background hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <h3 className="font-semibold text-text-primary">{session.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{session.description}</p>
                  </div>
                </div>
                {getStatusBadge(session.status)}
              </div>

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span>{session.total_questions} câu hỏi</span>
                <span>•</span>
                <span>
                  {session.completed_questions}/{session.total_questions} hoàn thành
                </span>
                {session.score !== undefined && (
                  <>
                    <span>•</span>
                    <span>Điểm: {session.score}/100</span>
                  </>
                )}
              </div>

              {session.status === 'pending' && (
                <div className="mt-4">
                  <CustomButton
                    variant="primary"
                    size="sm"
                    icon={Play}
                    onClick={() => onStartSession(session)}
                  >
                    Bắt đầu
                  </CustomButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SessionList
