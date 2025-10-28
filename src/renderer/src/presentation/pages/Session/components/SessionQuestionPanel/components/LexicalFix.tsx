import { useState } from 'react'
import { lexical_fix_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import CustomInput from '../../../../../../components/common/CustomInput'
import { CheckCircle, XCircle } from 'lucide-react'

interface LexicalFixViewProps {
  question: lexical_fix_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const LexicalFixView = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: LexicalFixViewProps) => {
  const [selectedWord, setSelectedWord] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // Tách câu thành mảng các từ
  const words = question.incorrect_sentence.split(' ')

  const handleWordClick = (word: string, index: number) => {
    if (isSubmitted) return
    setSelectedWord(word)
    setSelectedIndex(index)
  }

  const isCorrect = userAnswer.trim().toLowerCase() === question.correct_word.toLowerCase()

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-text-secondary">{question.context}</p>

      {/* Incorrect Sentence - Clickable Words */}
      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex flex-wrap leading-relaxed">
          {words.map((word, index) => (
            <>
              <button
                key={index}
                onClick={() => handleWordClick(word, index)}
                disabled={isSubmitted}
                className={`rounded transition-all ${
                  selectedIndex === index && !isSubmitted
                    ? 'bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 font-semibold px-2 py-1'
                    : 'hover:bg-red-100 dark:hover:bg-red-800/50 hover:px-2 hover:py-1'
                } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'} text-base text-text-primary font-medium`}
              >
                {word}
              </button>
              {index < words.length - 1 && <span className="inline-block w-1">&nbsp;</span>}
            </>
          ))}
        </div>
      </div>

      {/* User Answer Input */}
      {!isSubmitted && selectedWord && (
        <div>
          <CustomInput
            label="Từ đúng:"
            value={userAnswer}
            onChange={setUserAnswer}
            placeholder="Nhập từ đúng..."
            variant="primary"
            size="md"
          />
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
              Từ bạn chọn: <span className="font-medium">{selectedWord || '(không chọn)'}</span>
            </p>
            <p className="text-text-secondary">
              Câu trả lời của bạn: <span className="font-medium">{userAnswer || '(trống)'}</span>
            </p>
            {!isCorrect && (
              <>
                <p className="text-text-secondary">
                  Từ sai:{' '}
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {question.incorrect_word}
                  </span>
                </p>
                <p className="text-text-secondary">
                  Đáp án đúng:{' '}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {question.correct_word}
                  </span>
                </p>
              </>
            )}
            <p className="text-text-secondary">
              Câu đúng: <span className="font-medium">{question.correct_sentence}</span>
            </p>
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
        <div className="flex justify-end">
          <CustomButton
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={!userAnswer.trim() || !selectedWord}
          >
            Check Answer
          </CustomButton>
        </div>
      )}
    </div>
  )
}

export default LexicalFixView
