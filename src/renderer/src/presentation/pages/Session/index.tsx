// File: SessionPage/index.tsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Question } from './types'
import SessionQuestionPanel from './components/SessionQuestionPanel'
import SessionListPanel from './components/SessionListPanel'

interface SessionAnswer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  answeredAt: string
}

const SessionPage = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  // Lấy 10 câu hỏi đầu tiên làm mock data
  const [questions] = useState<Question[]>()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    console.log('[SessionPage] Loaded with sessionId:', sessionId)
  }, [sessionId])

  const handleAnswerSubmit = async (questionId: string, userAnswer: string, isCorrect: boolean) => {
    const newAnswer: SessionAnswer = {
      questionId,
      userAnswer,
      isCorrect,
      answeredAt: new Date().toISOString()
    }

    setAnswers((prev) => [...prev, newAnswer])

    // 🔥 Lưu answer vào cloud database
    try {
      const { getSessionService } = await import('../../../services/SessionService')
      const sessionService = getSessionService()
      await sessionService.saveAnswer(questionId, sessionId || '', userAnswer, isCorrect)
      console.log('[SessionPage] ✅ Answer saved to database')
    } catch (error) {
      console.error('[SessionPage] ❌ Failed to save answer:', error)
    }

    // 🔥 Kiểm tra nếu đã hoàn thành tất cả câu hỏi
    const totalAnswered = answers.length + 1
    if (totalAnswered === questions.length) {
      const correctCount = [...answers, newAnswer].filter((a) => a.isCorrect).length
      try {
        const { getSessionService } = await import('../../../services/SessionService')
        const sessionService = getSessionService()
        await sessionService.completeSession(sessionId || '', questions.length, correctCount)
        console.log('[SessionPage] ✅ Session completed')
      } catch (error) {
        console.error('[SessionPage] ❌ Failed to complete session:', error)
      }
    }

    console.log('[SessionPage] Answer submitted:', newAnswer)
  }

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      {/* LEFT PANEL - Khu vực làm bài */}
      <div className="w-[70%] h-full border-r border-border-default">
        <SessionQuestionPanel
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          onAnswerSubmit={handleAnswerSubmit}
          existingAnswer={answers.find((a) => a.questionId === currentQuestion.id)}
        />
      </div>

      {/* RIGHT PANEL - Quản lý danh sách questions */}
      <div className="w-[30%] h-full">
        <SessionListPanel
          questions={questions}
          answers={answers}
          currentQuestionIndex={currentQuestionIndex}
          onQuestionSelect={handleQuestionSelect}
        />
      </div>
    </div>
  )
}

export default SessionPage
