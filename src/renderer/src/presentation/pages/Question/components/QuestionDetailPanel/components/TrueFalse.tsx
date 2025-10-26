import { useState } from 'react'
import { true_false_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

interface TrueFalseProps {
  question: true_false_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const TrueFalse = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: TrueFalseProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)

  const handleAnswerSelect = (answer: boolean) => {
    if (isSubmitted) return
    setSelectedAnswer(answer)
    setUserAnswer(answer.toString())
  }

  const isCorrect = selectedAnswer === question.correct_answer

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
        ✓✗ Đúng/Sai
      </div>

      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Câu hỏi:</h3>
        <p className="text-text-secondary text-lg">{question.statement}</p>
        {question.context && (
          <p className="text-sm text-text-secondary mt-2">
            <span className="font-medium">Ngữ cảnh:</span> {question.context}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Chọn đáp án:
        </label>

        {/* True Button */}
        <button
          onClick={() => handleAnswerSelect(true)}
          disabled={isSubmitted}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            isSubmitted && question.correct_answer === true
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : isSubmitted && selectedAnswer === true && question.correct_answer === false
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                : selectedAnswer === true
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                  : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-2xl text-green-600 dark:text-green-400">✓</span>
              <span className="text-text-primary font-medium">Đúng (True)</span>
            </div>
            {isSubmitted && question.correct_answer === true && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
            {isSubmitted && selectedAnswer === true && question.correct_answer === false && (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </button>

        {/* False Button */}
        <button
          onClick={() => handleAnswerSelect(false)}
          disabled={isSubmitted}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            isSubmitted && question.correct_answer === false
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : isSubmitted && selectedAnswer === false && question.correct_answer === true
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                : selectedAnswer === false
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                  : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-2xl text-red-600 dark:text-red-400">✗</span>
              <span className="text-text-primary font-medium">Sai (False)</span>
            </div>
            {isSubmitted && question.correct_answer === false && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
            {isSubmitted && selectedAnswer === false && question.correct_answer === true && (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </button>
      </div>

      {!isSubmitted && question.hint && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Gợi ý:</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">{question.hint}</p>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div
          className={`p-4 rounded-lg border ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-300">Chính xác!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-800 dark:text-red-300">Chưa đúng</span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-text-secondary">
              <span className="font-medium">Đáp án đúng:</span>{' '}
              {question.correct_answer ? 'Đúng (True)' : 'Sai (False)'}
            </div>
            <div className="text-text-secondary">
              <span className="font-medium">Đáp án bạn chọn:</span>{' '}
              {selectedAnswer !== null
                ? selectedAnswer
                  ? 'Đúng (True)'
                  : 'Sai (False)'
                : '(không có)'}
            </div>
          </div>

          {question.explanation && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-sm font-medium mb-1">Giải thích:</p>
              <p className="text-sm text-text-secondary">{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={selectedAnswer === null}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default TrueFalse
