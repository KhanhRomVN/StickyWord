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
    case 'gap_fill':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
    case 'choice_one':
      return 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30'
    case 'choice_multi':
      return 'bg-violet-500/20 text-violet-600 border-violet-500/30'
    case 'matching':
      return 'bg-teal-500/20 text-teal-600 border-teal-500/30'
    case 'true_false':
      return 'bg-rose-500/20 text-rose-600 border-rose-500/30'
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
    case 'gap_fill':
      return 'Điền từ'
    case 'choice_one':
      return 'Trắc nghiệm'
    case 'choice_multi':
      return 'Chọn nhiều đáp án'
    case 'matching':
      return 'Nối'
    case 'true_false':
      return 'Đúng/Sai'
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
    case 'gap_fill':
      return '✏️'
    case 'choice_one':
      return '☑️'
    case 'choice_multi':
      return '✅'
    case 'matching':
      return '🔗'
    case 'true_false':
      return '⚖️'
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
    case 'gap_fill':
      return question.sentence_with_gaps.replace(/___+/g, '___')
    case 'choice_one':
      return question.question_text
    case 'choice_multi':
      return question.question_text
    case 'matching':
      return question.instruction
    case 'true_false':
      return question.statement
    default:
      return ''
  }
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
    </div>
  )
}
export default QuestionCard
