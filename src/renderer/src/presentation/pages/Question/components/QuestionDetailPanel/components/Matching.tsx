import { useState } from 'react'
import { matching_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react'

interface MatchingProps {
  question: matching_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const Matching = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: MatchingProps) => {
  const [matches, setMatches] = useState<{ [leftId: string]: string }>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)

  const handleLeftClick = (leftId: string) => {
    if (isSubmitted) return
    setSelectedLeft(leftId)
  }

  const handleRightClick = (rightId: string) => {
    if (isSubmitted || !selectedLeft) return
    const newMatches = { ...matches, [selectedLeft]: rightId }
    setMatches(newMatches)
    setUserAnswer(JSON.stringify(newMatches))
    setSelectedLeft(null)
  }

  const checkAnswer = () => {
    return question.correct_matches.every((correctMatch) => {
      return matches[correctMatch.left_id] === correctMatch.right_id
    })
  }

  const isCorrect = isSubmitted ? checkAnswer() : false

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'word_definition':
        return 'Từ - Định nghĩa'
      case 'word_synonym':
        return 'Từ - Từ đồng nghĩa'
      case 'word_antonym':
        return 'Từ - Từ trái nghĩa'
      case 'word_translation':
        return 'Từ - Bản dịch'
      default:
        return 'Khác'
    }
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium">
        🔗 Nối từ vựng
      </div>

      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Yêu cầu:</h3>
        <p className="text-text-secondary">{question.instruction}</p>
        <p className="text-sm text-violet-600 dark:text-violet-400 mt-2">
          <span className="font-medium">Loại nối:</span> {getMatchTypeLabel(question.match_type)}
        </p>
        {!isSubmitted && (
          <p className="text-sm text-text-secondary mt-2">
            💡 Nhấp vào mục bên trái, sau đó nhấp vào mục tương ứng bên phải
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cột A
          </label>
          {question.left_items.map((item) => {
            const isSelected = selectedLeft === item.id
            const isMatched = Object.keys(matches).includes(item.id)
            const correctRightId = question.correct_matches.find(
              (m) => m.left_id === item.id
            )?.right_id
            const isCorrectMatch = isSubmitted && matches[item.id] === correctRightId

            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                disabled={isSubmitted}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  isSubmitted && isCorrectMatch
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : isSubmitted && isMatched && !isCorrectMatch
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : isSelected
                        ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                        : isMatched
                          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/10'
                          : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">{item.text}</span>
                  {isMatched && !isSubmitted && <ArrowRight className="w-4 h-4 text-purple-600" />}
                  {isSubmitted && isCorrectMatch && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {isSubmitted && isMatched && !isCorrectMatch && (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cột B
          </label>
          {question.right_items.map((item) => {
            const isMatchedToThis = Object.values(matches).includes(item.id)

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={isSubmitted || !selectedLeft}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  isMatchedToThis
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/10'
                    : 'border-border-default hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${isSubmitted || !selectedLeft ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span className="text-text-primary">{item.text}</span>
              </button>
            )
          })}
        </div>
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
                <span className="font-semibold text-red-800 dark:text-red-300">
                  Có một số lỗi sai
                </span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium text-text-primary">Các cặp đúng:</p>
            {question.correct_matches.map((match, idx) => {
              const leftItem = question.left_items.find((i) => i.id === match.left_id)
              const rightItem = question.right_items.find((i) => i.id === match.right_id)
              return (
                <div key={idx} className="text-text-secondary">
                  {leftItem?.text} → {rightItem?.text}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={Object.keys(matches).length !== question.left_items.length}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default Matching
