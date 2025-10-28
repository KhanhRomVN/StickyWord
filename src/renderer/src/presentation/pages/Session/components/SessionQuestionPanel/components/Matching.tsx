import { useState } from 'react'
import { matching_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'

interface MatchingProps {
  question: matching_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const Matching = ({ question, setUserAnswer, isSubmitted, onSubmit }: MatchingProps) => {
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

  return (
    <div className="space-y-6">
      <p className="text-text-primary text-lg">{question.instruction}</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Column A
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
            Column B
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
        <div className="flex justify-end">
          <CustomButton
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={Object.keys(matches).length !== question.left_items.length}
          >
            Check Answer
          </CustomButton>
        </div>
      )}
    </div>
  )
}

export default Matching
