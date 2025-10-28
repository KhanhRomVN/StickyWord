import { useState } from 'react'
import { choice_one_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

interface ChoiceOneProps {
  question: choice_one_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const ChoiceOne = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: ChoiceOneProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('')

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return
    setSelectedOption(optionId)
    setUserAnswer(optionId)
  }

  const isCorrect = selectedOption === question.correct_option_id

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-text-primary text-lg">{question.context}</p>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Chọn đáp án đúng:
        </label>
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id
          const isCorrectOption = option.id === question.correct_option_id
          const showResult = isSubmitted

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isSubmitted}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                showResult && isCorrectOption
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : showResult && isSelected && !isCorrectOption
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : isSelected
                      ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                      : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg text-text-primary">{option.id}.</span>
                  <span className="text-text-primary">{option.text}</span>
                </div>
                {showResult && isCorrectOption && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

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

      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={!selectedOption}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default ChoiceOne
