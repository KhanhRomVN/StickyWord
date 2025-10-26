import { useState } from 'react'
import ListQuestionPanel from './components/ListQuestionPanel'
import QuestionDetailPanel from './components/QuestionDetailPanel'
import { Question } from './types'

const QuestionPage = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [mode, setMode] = useState<'view' | 'edit'>('view')

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question)
    setMode('view') // Reset về view mode khi chọn question mới
  }

  const handleModeChange = (newMode: 'view' | 'edit') => {
    setMode(newMode)
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <div className="w-[30%] h-full border-r border-border-default">
        <ListQuestionPanel
          onSelectQuestion={handleQuestionSelect}
          selectedQuestion={selectedQuestion}
        />
      </div>
      <div className="w-[70%] h-full">
        <QuestionDetailPanel
          selectedQuestion={selectedQuestion}
          mode={mode}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  )
}

export default QuestionPage
