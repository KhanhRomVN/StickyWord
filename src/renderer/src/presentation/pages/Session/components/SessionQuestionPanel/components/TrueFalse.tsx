import { useState } from 'react'
import { true_false_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle } from 'lucide-react'

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
    setUserAnswer(String(answer))
  }

  const isCorrect = selectedAnswer === question.correct_answer

  return (
    <div className="space-y-6">
      {/* Context/Instruction */}
      {question.context && <p className="text-text-primary text-lg">{question.context}</p>}

      {/* Answer Options */}
      <div className="space-y-3">
        {/* True Button */}
        <button
          onClick={() => handleAnswerSelect(true)}
          disabled={isSubmitted}
          className={`w-full rounded-lg border-2 border-l-4 transition-all p-3 ${
            isSubmitted && question.correct_answer === true
              ? 'border-green-500 border-l-green-500 bg-gradient-to-r from-transparent to-green-100/50 dark:to-green-900/20'
              : isSubmitted && selectedAnswer === true && question.correct_answer !== true
                ? 'border-red-500 border-l-red-500 bg-gradient-to-r from-transparent to-red-100/50 dark:to-red-900/20'
                : selectedAnswer === true
                  ? 'border-primary border-l-primary bg-gradient-to-r from-transparent to-blue-100/50 dark:to-blue-900/20'
                  : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-text-primary">Đúng (True)</span>
            </div>
            {isSubmitted && question.correct_answer === true && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
            {isSubmitted && selectedAnswer === true && question.correct_answer !== true && (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </button>

        {/* False Button */}
        <button
          onClick={() => handleAnswerSelect(false)}
          disabled={isSubmitted}
          className={`w-full rounded-lg border-2 border-l-4 transition-all p-3 ${
            isSubmitted && question.correct_answer === false
              ? 'border-green-500 border-l-green-500 bg-gradient-to-r from-transparent to-green-100/50 dark:to-green-900/20'
              : isSubmitted && selectedAnswer === false && question.correct_answer !== false
                ? 'border-red-500 border-l-red-500 bg-gradient-to-r from-transparent to-red-100/50 dark:to-red-900/20'
                : selectedAnswer === false
                  ? 'border-primary border-l-primary bg-gradient-to-r from-transparent to-blue-100/50 dark:to-blue-900/20'
                  : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-text-primary">Sai (False)</span>
            </div>
            {isSubmitted && question.correct_answer === false && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
            {isSubmitted && selectedAnswer === false && question.correct_answer !== false && (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        </button>
      </div>

      {/* Result */}
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

          {question.explanation && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-sm font-medium mb-1">Giải thích:</p>
              <p className="text-sm text-text-secondary">{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="sm"
          onClick={onSubmit}
          disabled={selectedAnswer === null}
        >
          Check Answer
        </CustomButton>
      )}
    </div>
  )
}

export default TrueFalse
