import { lexical_fix_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import CustomInput from '../../../../../../components/common/CustomInput'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

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
  const isCorrect = userAnswer.trim().toLowerCase() === question.correct_word.toLowerCase()

  return (
    <div className="space-y-6">
      {/* Question Type Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
        🔍 Sửa lỗi từ vựng
      </div>

      {/* Instruction */}
      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Yêu cầu:</h3>
        <p className="text-text-secondary">Tìm từ sai trong câu và sửa lại cho đúng.</p>
      </div>

      {/* Incorrect Sentence */}
      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Câu có lỗi:
        </label>
        <p className="text-lg text-text-primary font-medium">{question.incorrect_sentence}</p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          Từ sai: <span className="font-semibold">{question.incorrect_word}</span>
        </p>
      </div>

      {/* User Answer Input */}
      {!isSubmitted && (
        <div>
          <CustomInput
            label="Từ đúng:"
            value={userAnswer}
            onChange={setUserAnswer}
            placeholder="Nhập từ đúng..."
            variant="primary"
            size="md"
          />
          {question.hint && (
            <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Gợi ý:</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">{question.hint}</p>
              </div>
            </div>
          )}
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
              Câu trả lời của bạn: <span className="font-medium">{userAnswer || '(trống)'}</span>
            </p>
            {!isCorrect && (
              <p className="text-text-secondary">
                Đáp án đúng:{' '}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {question.correct_word}
                </span>
              </p>
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
        <CustomButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={!userAnswer.trim()}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default LexicalFixView
