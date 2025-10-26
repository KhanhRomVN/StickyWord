import { useState } from 'react'
import { gap_fill_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import CustomInput from '../../../../../../components/common/CustomInput'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

interface GapFillProps {
  question: gap_fill_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const GapFill = ({ question, userAnswer, setUserAnswer, isSubmitted, onSubmit }: GapFillProps) => {
  const [gapAnswers, setGapAnswers] = useState<{ [key: number]: string }>({})

  const handleGapChange = (position: number, value: string) => {
    const newGapAnswers = { ...gapAnswers, [position]: value }
    setGapAnswers(newGapAnswers)
    setUserAnswer(JSON.stringify(newGapAnswers))
  }

  const handleWordBankClick = (word: string) => {
    if (isSubmitted) return
    const emptyGap = question.gaps.find((gap) => !gapAnswers[gap.position])
    if (emptyGap) {
      handleGapChange(emptyGap.position, word)
    }
  }

  const checkAnswer = () => {
    const allCorrect = question.gaps.every((gap) => {
      const userAns = gapAnswers[gap.position]?.trim().toLowerCase()
      const correctAns = gap.correct_answer.toLowerCase()
      const alternatives = gap.alternative_answers?.map((a) => a.toLowerCase()) || []
      return userAns === correctAns || alternatives.includes(userAns || '')
    })
    return allCorrect
  }

  const isCorrect = isSubmitted ? checkAnswer() : false

  const renderSentenceWithGaps = () => {
    const words = question.sentence_with_gaps.split(' ')
    return (
      <div className="flex flex-wrap gap-2 items-center text-lg">
        {words.map((word, index) => {
          const gap = question.gaps.find((g) => g.position === index)
          if (word === '____' || gap) {
            return (
              <div key={index} className="inline-flex flex-col items-center">
                <CustomInput
                  value={gapAnswers[gap?.position || index] || ''}
                  onChange={(val) => handleGapChange(gap?.position || index, val)}
                  placeholder="____"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitted}
                  className="w-32 text-center"
                />
                {isSubmitted && (
                  <span className="text-xs mt-1">
                    {gapAnswers[gap?.position || index]?.trim().toLowerCase() ===
                      gap?.correct_answer.toLowerCase() ||
                    gap?.alternative_answers?.some(
                      (alt) =>
                        alt.toLowerCase() ===
                        gapAnswers[gap?.position || index]?.trim().toLowerCase()
                    ) ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        ✗ ({gap?.correct_answer})
                      </span>
                    )}
                  </span>
                )}
              </div>
            )
          }
          return (
            <span key={index} className="text-text-primary">
              {word}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Question Type Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-medium">
        📝 Điền từ
      </div>

      {/* Instruction */}
      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Yêu cầu:</h3>
        <p className="text-text-secondary">Điền từ thích hợp vào chỗ trống trong câu.</p>
        {question.context && (
          <p className="text-sm text-text-secondary mt-2">
            <span className="font-medium">Ngữ cảnh:</span> {question.context}
          </p>
        )}
      </div>

      {/* Sentence with Gaps */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        {renderSentenceWithGaps()}
      </div>

      {/* Word Bank */}
      {question.allow_word_bank && question.word_bank && question.word_bank.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-border-default">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Ngân hàng từ:</p>
          <div className="flex flex-wrap gap-2">
            {question.word_bank.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordBankClick(word)}
                disabled={isSubmitted}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {word}
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
                <span className="font-semibold text-red-800 dark:text-red-300">
                  Có một số lỗi sai
                </span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {question.gaps.map((gap, idx) => {
              const userAns = gapAnswers[gap.position]
              const isGapCorrect =
                userAns?.trim().toLowerCase() === gap.correct_answer.toLowerCase() ||
                gap.alternative_answers?.some(
                  (alt) => alt.toLowerCase() === userAns?.trim().toLowerCase()
                )
              return (
                <div key={idx} className="text-text-secondary">
                  <span className="font-medium">Chỗ trống {idx + 1}:</span>{' '}
                  <span className={isGapCorrect ? 'text-green-600' : 'text-red-600'}>
                    {userAns || '(trống)'}
                  </span>
                  {!isGapCorrect && (
                    <span className="text-green-600 dark:text-green-400">
                      {' '}
                      → Đúng: {gap.correct_answer}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={question.gaps.some((gap) => !gapAnswers[gap.position]?.trim())}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default GapFill
