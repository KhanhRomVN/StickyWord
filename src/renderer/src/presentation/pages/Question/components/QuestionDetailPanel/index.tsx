import { useState } from 'react'
import { Question } from '../../types'
import CustomButton from '../../../../../components/common/CustomButton'
import { Edit2, Save, X } from 'lucide-react'
import LexicalFix from './components/LexicalFix'
import GrammarTransformation from './components/GrammarTransformation'
import SentencePuzzle from './components/SentencePuzzle'
import Translate from './components/Translate'
import ReverseTranslation from './components/ReverseTranslation'
import Dictation from './components/Dictation'
import GapFill from './components/GapFill'
import ChoiceOne from './components/ChoiceOne'
import ChoiceMulti from './components/ChoiceMulti'
import Matching from './components/Matching'
import TrueFalse from './components/TrueFalse'

interface QuestionDetailPanelProps {
  selectedQuestion: Question | null
  mode: 'view' | 'edit'
  onModeChange: (mode: 'view' | 'edit') => void
}

const QuestionDetailPanel = ({
  selectedQuestion,
  mode,
  onModeChange
}: QuestionDetailPanelProps) => {
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEdit = () => {
    setEditedQuestion(selectedQuestion)
    onModeChange('edit')
  }

  const handleCancelEdit = () => {
    setEditedQuestion(null)
    onModeChange('view')
  }

  const handleSaveEdit = () => {
    // TODO: Implement save logic
    console.log('Saving edited question:', editedQuestion)
    setEditedQuestion(null)
    onModeChange('view')
  }

  const handleSubmitAnswer = () => {
    setIsSubmitted(true)
    // TODO: Implement answer checking logic
    console.log('User answer:', userAnswer)
  }

  const handleResetAnswer = () => {
    setUserAnswer('')
    setIsSubmitted(false)
  }

  if (!selectedQuestion) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-secondary p-8">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">Chọn một câu hỏi để xem chi tiết</h3>
          <p className="text-sm opacity-75">
            Chọn một câu hỏi từ danh sách bên trái để xem nội dung và thực hành
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = mode === 'edit' && editedQuestion ? editedQuestion : selectedQuestion

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border-default p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {mode === 'view' ? 'Làm bài tập' : 'Chỉnh sửa câu hỏi'}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Độ khó: {currentQuestion.difficulty_level}/10 • Thời gian:{' '}
              {currentQuestion.estimated_time_seconds}s
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <>
                <CustomButton variant="secondary" size="sm" icon={Edit2} onClick={handleEdit}>
                  Chỉnh sửa
                </CustomButton>
                {isSubmitted && (
                  <CustomButton variant="secondary" size="sm" icon={X} onClick={handleResetAnswer}>
                    Làm lại
                  </CustomButton>
                )}
              </>
            ) : (
              <>
                <CustomButton variant="primary" size="sm" icon={Save} onClick={handleSaveEdit}>
                  Lưu
                </CustomButton>
                <CustomButton variant="secondary" size="sm" icon={X} onClick={handleCancelEdit}>
                  Hủy
                </CustomButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <>
        {currentQuestion.question_type === 'lexical_fix' && (
          <LexicalFix
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'grammar_transformation' && (
          <GrammarTransformation
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'sentence_puzzle' && (
          <SentencePuzzle
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'translate' && (
          <Translate
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'reverse_translation' && (
          <ReverseTranslation
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'dictation' && (
          <Dictation
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'gap_fill' && (
          <GapFill
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'choice_one' && (
          <ChoiceOne
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'choice_multi' && (
          <ChoiceMulti
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'matching' && (
          <Matching
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
        {currentQuestion.question_type === 'true_false' && (
          <TrueFalse
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )}
      </>
    </div>
  )
}

export default QuestionDetailPanel
