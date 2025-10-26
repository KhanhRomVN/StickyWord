import { useState } from 'react'
import { sentence_puzzle_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react'

interface SentencePuzzleViewProps {
  question: sentence_puzzle_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const SentencePuzzleView = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: SentencePuzzleViewProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [availableItems, setAvailableItems] = useState<string[]>([...question.scrambled_items])

  const handleItemClick = (item: string, fromAvailable: boolean) => {
    if (isSubmitted) return

    if (fromAvailable) {
      setSelectedItems([...selectedItems, item])
      setAvailableItems(availableItems.filter((i) => i !== item))
    } else {
      setAvailableItems([...availableItems, item])
      setSelectedItems(selectedItems.filter((i) => i !== item))
    }
  }

  const handleReset = () => {
    setSelectedItems([])
    setAvailableItems([...question.scrambled_items])
    setUserAnswer('')
  }

  const constructedSentence = selectedItems.join(' ')
  const isCorrect =
    constructedSentence.trim().toLowerCase() === question.correct_sentence.trim().toLowerCase()

  // Update userAnswer when selectedItems change
  const handleCheckAnswer = () => {
    setUserAnswer(constructedSentence)
    onSubmit()
  }

  return (
    <div className="space-y-6">
      {/* Question Type Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium">
        🧩 Xếp câu
      </div>

      {/* Instruction */}
      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Yêu cầu:</h3>
        <p className="text-text-secondary">
          Sắp xếp các từ/cụm từ sau để tạo thành câu hoàn chỉnh.
        </p>
        {question.context && (
          <p className="text-sm text-text-secondary mt-2">
            <span className="font-medium">Ngữ cảnh:</span> {question.context}
          </p>
        )}
      </div>

      {/* Selected Items Area */}
      {!isSubmitted && (
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 min-h-[100px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Câu của bạn:
          </label>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {selectedItems.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                Nhấp vào các từ bên dưới để xếp câu
              </p>
            ) : (
              selectedItems.map((item, index) => (
                <button
                  key={`selected-${index}`}
                  onClick={() => handleItemClick(item, false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Available Items Area */}
      {!isSubmitted && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-border-default">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Các từ có sẵn:
            </label>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Đặt lại
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableItems.map((item, index) => (
              <button
                key={`available-${index}`}
                onClick={() => handleItemClick(item, true)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      {!isSubmitted && question.hint && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Gợi ý:</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">{question.hint}</p>
          </div>
        </div>
      )}

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

          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">
              Câu của bạn: <span className="font-medium">{userAnswer || '(trống)'}</span>
            </p>
            {!isCorrect && (
              <p className="text-text-secondary">
                Câu đúng:{' '}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {question.correct_sentence}
                </span>
              </p>
            )}
            {question.translation && (
              <p className="text-text-secondary">
                Dịch nghĩa: <span className="font-medium">{question.translation}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="md"
          onClick={handleCheckAnswer}
          disabled={selectedItems.length === 0}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default SentencePuzzleView
