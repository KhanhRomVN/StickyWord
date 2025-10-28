// File: SessionPage/components/SessionListPanel/index.tsx
import { useMemo } from 'react'
import { Question } from '../../types'
import { CheckCircle2, XCircle, Send, X } from 'lucide-react'
import CustomButton from '../../../../../components/common/CustomButton'

interface SessionAnswer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  answeredAt: string
}

interface SessionListPanelProps {
  questions: Question[]
  answers: SessionAnswer[]
  currentQuestionIndex: number
  onQuestionSelect: (index: number) => void
}

const SessionListPanel = ({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionSelect
}: SessionListPanelProps) => {
  const stats = useMemo(() => {
    const total = questions.length
    const answered = answers.length
    const correct = answers.filter((a) => a.isCorrect).length
    const incorrect = answered - correct
    const unanswered = total - answered
    const accuracy = answered > 0 ? (correct / answered) * 100 : 0

    return { total, answered, correct, incorrect, unanswered, accuracy }
  }, [questions, answers])

  const getQuestionStatus = (questionId: string) => {
    const answer = answers.find((a) => a.questionId === questionId)
    if (!answer) return 'unanswered'
    return answer.isCorrect ? 'correct' : 'incorrect'
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border-default p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Tiến độ</h2>
          <span className="text-sm text-text-secondary">
            {stats.answered}/{stats.total}
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>Hoàn thành</span>
            <span className="font-semibold">{stats.accuracy.toFixed(0)}% chính xác</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(stats.answered / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-1">
          {questions.map((question, index) => {
            const status = getQuestionStatus(question.id)
            const isActive = index === currentQuestionIndex

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative w-10 h-10 rounded-lg font-semibold text-xs
                  transition-all duration-200
                  ${
                    status === 'correct'
                      ? 'bg-green-500 dark:bg-green-600 text-white'
                      : status === 'incorrect'
                        ? 'bg-red-500 dark:bg-red-600 text-white'
                        : isActive
                          ? 'bg-primary text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }
                `}
              >
                <span>{index + 1}</span>

                {/* Status Icon */}
                {status === 'correct' && (
                  <CheckCircle2 className="absolute top-0.5 right-0.5 w-2.5 h-2.5" />
                )}
                {status === 'incorrect' && (
                  <XCircle className="absolute top-0.5 right-0.5 w-2.5 h-2.5" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-border-default p-4 space-y-2">
        <CustomButton
          variant="primary"
          size="sm"
          icon={Send}
          disabled={stats.answered < stats.total}
          onClick={() => console.log('Nộp bài')}
        >
          Nộp bài
        </CustomButton>

        <CustomButton variant="ghost" size="sm" icon={X} onClick={() => console.log('Hủy')}>
          Hủy
        </CustomButton>
      </div>
    </div>
  )
}

export default SessionListPanel
