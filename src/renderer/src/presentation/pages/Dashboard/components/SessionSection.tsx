import { Session } from '../../Session/types'
import CustomButton from '../../../../components/common/CustomButton'
import { Play, Calendar, BatteryLow, BatteryMedium, BatteryFull, Clock } from 'lucide-react'
import React from 'react'

interface SessionSectionProps {
  sessions: Session[]
  onStartSession: (sessionId: string) => void
}

const SessionSection = ({ sessions, onStartSession }: SessionSectionProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'text-green-600 dark:text-green-400'
    if (level <= 6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBatteryIcon = (level: number) => {
    if (level <= 3) return BatteryLow
    if (level <= 6) return BatteryMedium
    return BatteryFull
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Practice Sessions</h2>
        <CustomButton variant="secondary" size="sm">
          View all
        </CustomButton>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card-background">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-text-secondary">Chưa có session nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            return (
              <div
                key={session.id}
                className="bg-card-background border border-border-default rounded-lg p-4 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartSession(session.id)}
                    className="rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    title="Bắt đầu"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {session.expires_at && (
                      <p className="text-xs text-text-secondary">
                        Expired: {formatDate(session.expires_at)}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1.5"
                    title={`Độ khó: ${session.difficulty_level}/10`}
                  >
                    {React.createElement(getBatteryIcon(session.difficulty_level), {
                      className: `w-5 h-5 ${getDifficultyColor(session.difficulty_level)}`
                    })}
                    <span
                      className={`text-xs font-semibold ${getDifficultyColor(session.difficulty_level)}`}
                    >
                      {session.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SessionSection
