import { useState } from 'react'
import { choice_multi_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle, Check } from 'lucide-react'

interface ChoiceMultiProps {
  question: choice_multi_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const ChoiceMulti = ({ question, setUserAnswer, isSubmitted, onSubmit }: ChoiceMultiProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleOptionToggle = (optionId: string) => {
    if (isSubmitted) return

    let newSelected: string[]
    if (selectedOptions.includes(optionId)) {
      newSelected = selectedOptions.filter((id) => id !== optionId)
    } else {
      if (question.max_selections && selectedOptions.length >= question.max_selections) {
        return
      }
      newSelected = [...selectedOptions, optionId]
    }
    setSelectedOptions(newSelected)
    setUserAnswer(JSON.stringify(newSelected))
  }

  const checkAnswer = () => {
    const correctIds = question.correct_option_ids.sort()
    const userIds = selectedOptions.sort()
    return JSON.stringify(correctIds) === JSON.stringify(userIds)
  }

  const isCorrect = isSubmitted ? checkAnswer() : false

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-text-primary text-lg">{question.context}</p>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Chọn các đáp án đúng ({selectedOptions.length} đã chọn):
        </label>
        {question.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id)
          const isCorrectOption = question.correct_option_ids.includes(option.id)
          const showResult = isSubmitted

          return (
            <button
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              disabled={isSubmitted}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                showResult && isCorrectOption && isSelected
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : showResult && isCorrectOption && !isSelected
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                    : showResult && !isCorrectOption && isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : isSelected
                        ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                        : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-semibold text-lg text-text-primary">{option.id}.</span>
                  <span className="text-text-primary">{option.text}</span>
                </div>
                {showResult && isCorrectOption && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {showResult && !isCorrectOption && isSelected && (
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

          <div className="space-y-2 text-sm">
            <div className="text-text-secondary">
              <span className="font-medium">Các đáp án đúng:</span>{' '}
              {question.correct_option_ids.join(', ')}
            </div>
            <div className="text-text-secondary">
              <span className="font-medium">Đáp án bạn chọn:</span>{' '}
              {selectedOptions.length > 0 ? selectedOptions.join(', ') : '(không có)'}
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
          disabled={
            selectedOptions.length === 0 ||
            (question.min_selections !== undefined &&
              selectedOptions.length < question.min_selections)
          }
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default ChoiceMulti
