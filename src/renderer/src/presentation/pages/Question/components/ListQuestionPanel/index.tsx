import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Question } from '../../types'
import QuestionCard from './components/QuestionCard'
import { FAKE_QUESTIONS } from '../../constants'

interface ListQuestionPanelProps {
  onSelectQuestion: (question: Question) => void
  selectedQuestion: Question | null
}

const ListQuestionPanel = ({ onSelectQuestion, selectedQuestion }: ListQuestionPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<Question['question_type'] | 'all'>('all')

  const filteredQuestions = useMemo(() => {
    let filtered = FAKE_QUESTIONS

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((q) => q.question_type === filterType)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((q) => {
        if (q.question_type === 'lexical_fix') {
          return q.incorrect_sentence.toLowerCase().includes(term)
        } else if (q.question_type === 'grammar_transformation') {
          return q.original_sentence.toLowerCase().includes(term)
        } else if (q.question_type === 'sentence_puzzle') {
          return q.correct_sentence.toLowerCase().includes(term)
        } else if (q.question_type === 'translate') {
          return q.source_sentence.toLowerCase().includes(term)
        } else if (q.question_type === 'reverse_translation') {
          return q.english_sentence.toLowerCase().includes(term)
        } else if (q.question_type === 'dictation') {
          return q.correct_transcription.toLowerCase().includes(term)
        }
        return false
      })
    }

    return filtered
  }, [searchTerm, filterType])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border-default p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Questions</h2>
          <span className="text-sm text-text-secondary">{filteredQuestions.length} câu hỏi</span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-card-background border border-border-default rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType('lexical_fix')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'lexical_fix'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Sửa lỗi
          </button>
          <button
            onClick={() => setFilterType('grammar_transformation')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'grammar_transformation'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Chuyển đổi
          </button>
          <button
            onClick={() => setFilterType('sentence_puzzle')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'sentence_puzzle'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Xếp câu
          </button>
          <button
            onClick={() => setFilterType('translate')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'translate'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Dịch
          </button>
          <button
            onClick={() => setFilterType('reverse_translation')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'reverse_translation'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Dịch ngược
          </button>
          <button
            onClick={() => setFilterType('dictation')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'dictation'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Nghe viết
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary p-8 text-center">
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">Không tìm thấy câu hỏi</p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isSelected={selectedQuestion?.id === question.id}
                onClick={() => onSelectQuestion(question)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ListQuestionPanel
