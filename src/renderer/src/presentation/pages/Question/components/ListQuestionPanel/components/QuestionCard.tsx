import { Question } from '../../../types'

interface QuestionCardProps {
  question: Question
  isSelected: boolean
  onClick: () => void
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'lexical_fix':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30'
    case 'grammar_transformation':
      return 'bg-green-500/20 text-green-600 border-green-500/30'
    case 'sentence_puzzle':
      return 'bg-purple-500/20 text-purple-600 border-purple-500/30'
    case 'translate':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/30'
    case 'reverse_translation':
      return 'bg-pink-500/20 text-pink-600 border-pink-500/30'
    case 'dictation':
      return 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30'
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'lexical_fix':
      return 'Sửa lỗi từ vựng'
    case 'grammar_transformation':
      return 'Chuyển đổi ngữ pháp'
    case 'sentence_puzzle':
      return 'Xếp câu'
    case 'translate':
      return 'Dịch'
    case 'reverse_translation':
      return 'Dịch ngược'
    case 'dictation':
      return 'Nghe viết'
    default:
      return 'Khác'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'lexical_fix':
      return '🔍'
    case 'grammar_transformation':
      return '🔄'
    case 'sentence_puzzle':
      return '🧩'
    case 'translate':
      return '🌐'
    case 'reverse_translation':
      return '🔁'
    case 'dictation':
      return '🎧'
    default:
      return '❓'
  }
}

const getQuestionPreview = (question: Question): string => {
  switch (question.question_type) {
    case 'lexical_fix':
      return question.incorrect_sentence
    case 'grammar_transformation':
      return question.original_sentence
    case 'sentence_puzzle':
      return question.correct_sentence
    case 'translate':
      return question.source_sentence
    case 'reverse_translation':
      return question.english_sentence
    case 'dictation':
      return question.correct_transcription
    default:
      return ''
  }
}

const getDifficultyColor = (level: number) => {
  if (level <= 3) return 'text-green-600 dark:text-green-400'
  if (level <= 6) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const QuestionCard = ({ question, isSelected, onClick }: QuestionCardProps) => {
  const preview = getQuestionPreview(question)

  return (
    <div
      className={`p-4 border-b border-border-default cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-sidebar-itemFocus border-l-4 border-l-primary'
          : 'hover:bg-sidebar-itemHover'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-1">
            {getTypeIcon(question.question_type)}
            <span className="truncate">{preview.substring(0, 50)}...</span>
          </h3>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ml-2 ${getTypeColor(question.question_type)}`}
        >
          {getTypeLabel(question.question_type)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
        <div className="flex items-center gap-3">
          <span className={`font-medium ${getDifficultyColor(question.difficulty_level)}`}>
            Độ khó: {question.difficulty_level}/10
          </span>
          <span>⏱️ {question.estimated_time_seconds}s</span>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
