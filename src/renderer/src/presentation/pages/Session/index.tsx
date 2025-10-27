import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Progress } from '../../../components/ui/progress'
import { Badge } from '../../../components/ui/badge'
import { CheckCircle2, XCircle, Home, ArrowLeft } from 'lucide-react'
import { FAKE_QUESTIONS } from '../Question/constants'
import { Question } from '../Question/types'

// Import các component question
import LexicalFix from '../Question/components/QuestionDetailPanel/components/LexicalFix'
import GrammarTransformation from '../Question/components/QuestionDetailPanel/components/GrammarTransformation'
import SentencePuzzle from '../Question/components/QuestionDetailPanel/components/SentencePuzzle'
import Translate from '../Question/components/QuestionDetailPanel/components/Translate'
import ReverseTranslation from '../Question/components/QuestionDetailPanel/components/ReverseTranslation'
import GapFill from '../Question/components/QuestionDetailPanel/components/GapFill'
import ChoiceOne from '../Question/components/QuestionDetailPanel/components/ChoiceOne'
import ChoiceMulti from '../Question/components/QuestionDetailPanel/components/ChoiceMulti'
import Matching from '../Question/components/QuestionDetailPanel/components/Matching'
import TrueFalse from '../Question/components/QuestionDetailPanel/components/TrueFalse'

interface Answer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
}

const SessionPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const questions = FAKE_QUESTIONS.slice(0, 10) // Lấy 10 câu đầu
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Listen for navigation from main process
  useEffect(() => {
    const handleNavigate = (_event: any, sid: string) => {
      console.log('[SessionPage] Navigate event received:', sid)
    }

    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('navigate-to-session', handleNavigate)
      return () => {
        window.electron.ipcRenderer.removeListener('navigate-to-session', handleNavigate)
      }
    }
  }, [])

  // Check correctness của câu trả lời dựa trên loại câu hỏi
  const checkAnswerCorrectness = (question: Question, answer: string): boolean => {
    if (!answer) return false

    try {
      switch (question.question_type) {
        case 'lexical_fix':
          return answer.trim().toLowerCase() === question.correct_word.toLowerCase()

        case 'grammar_transformation':
          return (
            answer.trim().toLowerCase() === question.correct_answer.toLowerCase() ||
            question.alternative_answers?.some(
              (alt) => answer.trim().toLowerCase() === alt.toLowerCase()
            ) ||
            false
          )

        case 'sentence_puzzle':
          return answer.trim().toLowerCase() === question.correct_sentence.trim().toLowerCase()

        case 'translate':
          return (
            answer.trim().toLowerCase() === question.correct_translation.toLowerCase() ||
            question.alternative_translations?.some(
              (alt) => answer.trim().toLowerCase() === alt.toLowerCase()
            ) ||
            false
          )

        case 'reverse_translation':
          return (
            answer.trim().toLowerCase() === question.correct_translation.toLowerCase() ||
            question.alternative_translations?.some(
              (alt) => answer.trim().toLowerCase() === alt.toLowerCase()
            ) ||
            false
          )

        case 'gap_fill': {
          try {
            const gapAnswers = JSON.parse(answer)
            return question.gaps.every((gap) => {
              const userAns = gapAnswers[gap.position]?.trim().toLowerCase()
              const correctAns = gap.correct_answer.toLowerCase()
              const alternatives = gap.alternative_answers?.map((a) => a.toLowerCase()) || []
              return userAns === correctAns || alternatives.includes(userAns || '')
            })
          } catch {
            return false
          }
        }

        case 'choice_one':
          return answer === question.correct_option_id

        case 'choice_multi': {
          try {
            const selectedIds = JSON.parse(answer).sort()
            const correctIds = question.correct_option_ids.sort()
            return JSON.stringify(selectedIds) === JSON.stringify(correctIds)
          } catch {
            return false
          }
        }

        case 'matching': {
          try {
            const matches = JSON.parse(answer)
            return question.correct_matches.every((correctMatch) => {
              return matches[correctMatch.left_id] === correctMatch.right_id
            })
          } catch {
            return false
          }
        }

        case 'true_false':
          return answer === String(question.correct_answer)

        default:
          return false
      }
    } catch (error) {
      console.error('[checkAnswerCorrectness] Error:', error)
      return false
    }
  }

  const handleSubmitAnswer = () => {
    if (!userAnswer) return

    const isCorrect = checkAnswerCorrectness(currentQuestion, userAnswer)

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        userAnswer,
        isCorrect
      }
    ])

    setIsSubmitted(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
      setIsSubmitted(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setUserAnswer('')
      setIsSubmitted(false)
    }
  }

  const correctCount = answers.filter((a) => a.isCorrect).length
  const accuracy = answers.length > 0 ? (correctCount / answers.length) * 100 : 0

  // Render question component dựa trên loại câu hỏi
  const renderQuestionComponent = () => {
    switch (currentQuestion.question_type) {
      case 'lexical_fix':
        return (
          <LexicalFix
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'grammar_transformation':
        return (
          <GrammarTransformation
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'sentence_puzzle':
        return (
          <SentencePuzzle
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'translate':
        return (
          <Translate
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'reverse_translation':
        return (
          <ReverseTranslation
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'gap_fill':
        return (
          <GapFill
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'choice_one':
        return (
          <ChoiceOne
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'choice_multi':
        return (
          <ChoiceMulti
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'matching':
        return (
          <Matching
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'true_false':
        return (
          <TrueFalse
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Loại câu hỏi không được hỗ trợ: {currentQuestion.question_type}
          </div>
        )
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-600">
              🎉 Hoàn thành Session!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-indigo-600">{accuracy.toFixed(0)}%</div>
              <p className="text-gray-600 text-lg">
                Bạn đã trả lời đúng {correctCount}/{questions.length} câu
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-gray-600">Đúng</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{questions.length - correctCount}</p>
                <p className="text-sm text-gray-600">Sai</p>
              </div>
            </div>

            <Button onClick={() => navigate('/')} className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Session Learning</h1>
            {sessionId && <p className="text-sm text-gray-500">Session ID: {sessionId}</p>}
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {currentQuestionIndex + 1} / {questions.length}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tiến độ</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">Câu hỏi {currentQuestionIndex + 1}</CardTitle>
              <Badge>{currentQuestion.question_type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">{renderQuestionComponent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        {isSubmitted && (
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <Button onClick={handlePreviousQuestion} variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Câu trước
              </Button>
            )}
            <Button onClick={handleNextQuestion} className="flex-1" size="lg">
              {currentQuestionIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-indigo-600">{answers.length}</p>
              <p className="text-sm text-gray-600">Đã trả lời</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-gray-600">Đúng</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-amber-600">{accuracy.toFixed(0)}%</p>
              <p className="text-sm text-gray-600">Độ chính xác</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SessionPage
