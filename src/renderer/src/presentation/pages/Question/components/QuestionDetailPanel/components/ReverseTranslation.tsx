import { reverse_translation_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import CustomInput from '../../../../../../components/common/CustomInput'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'

interface ReverseTranslationViewProps {
  question: reverse_translation_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const ReverseTranslationView = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: ReverseTranslationViewProps) => {
  const isCorrect =
    userAnswer.trim().toLowerCase() === question.correct_translation.toLowerCase() ||
    question.alternative_translations?.some(
      (alt) => userAnswer.trim().toLowerCase() === alt.toLowerCase()
    )

  return (
    <div className="space-y-6">
      {/* Question Type Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-lg text-sm font-medium">
        🔁 Dịch ngược
      </div>

      {/* Instruction */}
      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Yêu cầu:</h3>
        <p className="text-text-secondary">
          Dịch câu tiếng Anh sau sang{' '}
          {question.target_language === 'vi' ? 'tiếng Việt' : question.target_language}.
        </p>
        {question.context && (
          <p className="text-sm text-text-secondary mt-2">
            <span className="font-medium">Ngữ cảnh:</span> {question.context}
          </p>
        )}
      </div>

      {/* English Sentence */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Câu tiếng Anh:
        </label>
        <p className="text-lg text-text-primary font-medium">{question.english_sentence}</p>
      </div>

      {/* Key Grammar Points */}
      {question.key_grammar_points && question.key_grammar_points.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
            Điểm ngữ pháp quan trọng:
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            {question.key_grammar_points.join(', ')}
          </p>
        </div>
      )}

      {/* User Answer Input */}
      {!isSubmitted && (
        <div>
          <CustomInput
            label="Bản dịch của bạn:"
            value={userAnswer}
            onChange={setUserAnswer}
            placeholder={`Nhập bản dịch ${question.target_language === 'vi' ? 'tiếng Việt' : question.target_language}...`}
            variant="primary"
            size="md"
            multiline
            rows={2}
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
              Bản dịch của bạn: <span className="font-medium">{userAnswer || '(trống)'}</span>
            </p>
            {!isCorrect && (
              <>
                <p className="text-text-secondary">
                  Bản dịch đúng:{' '}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {question.correct_translation}
                  </span>
                </p>
                {question.alternative_translations &&
                  question.alternative_translations.length > 0 && (
                    <div className="text-text-secondary">
                      <p className="font-medium mb-1">Các bản dịch khác chấp nhận được:</p>
                      <ul className="list-disc list-inside pl-2">
                        {question.alternative_translations.map((alt, idx) => (
                          <li key={idx}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            )}
          </div>
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

export default ReverseTranslationView
