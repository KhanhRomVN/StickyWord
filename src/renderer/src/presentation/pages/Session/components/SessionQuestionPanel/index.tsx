// File: SessionPage/components/SessionQuestionPanel/index.tsx
import { useState, useEffect } from 'react'
import { Question } from '../../types'
import CustomButton from '../../../../../components/common/CustomButton'
import { ArrowRight, Check } from 'lucide-react'

// Import question components
import LexicalFix from './components/LexicalFix'
import GrammarTransformation from './components/GrammarTransformation'
import SentencePuzzle from './components/SentencePuzzle'
import Translate from './components/Translate'
import ReverseTranslation from './components/ReverseTranslation'
import GapFill from './components/GapFill'
import ChoiceOne from './components/ChoiceOne'
import ChoiceMulti from './components/ChoiceMulti'
import Matching from './components/Matching'
import TrueFalse from './components/TrueFalse'

interface SessionQuestionPanelProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  onAnswerSubmit: (questionId: string, userAnswer: string, isCorrect: boolean) => void
  existingAnswer?: {
    questionId: string
    userAnswer: string
    isCorrect: boolean
    answeredAt: string
  }
}

const SessionQuestionPanel = ({
  question,
  questionIndex,
  onAnswerSubmit,
  existingAnswer
}: SessionQuestionPanelProps) => {
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Reset khi chuyển câu hỏi
  useEffect(() => {
    if (existingAnswer) {
      setUserAnswer(existingAnswer.userAnswer)
      setIsSubmitted(true)
    } else {
      setUserAnswer('')
      setIsSubmitted(false)
    }
  }, [question.id, existingAnswer])

  const checkAnswerCorrectness = (q: Question, answer: string): boolean => {
    if (!answer) return false

    try {
      switch (q.question_type) {
        case 'lexical_fix':
          return answer.trim().toLowerCase() === q.correct_word.toLowerCase()

        case 'grammar_transformation':
          return (
            answer.trim().toLowerCase() === q.correct_answer.toLowerCase() ||
            q.alternative_answers?.some(
              (alt) => answer.trim().toLowerCase() === alt.toLowerCase()
            ) ||
            false
          )

        case 'sentence_puzzle':
          return answer.trim().toLowerCase() === q.correct_sentence.trim().toLowerCase()

        case 'translate':
          return (
            answer.trim().toLowerCase() === q.correct_translation.toLowerCase() ||
            q.alternative_translations?.some(
              (alt) => answer.trim().toLowerCase() === alt.toLowerCase()
            ) ||
            false
          )

        case 'reverse_translation':
          return (
            answer.trim().toLowerCase() === q.correct_translation.toLowerCase() ||
            q.alternative_translations?.some(
              (alt) => answer.trim().toLowerCase() === alt.toLowerCase()
            ) ||
            false
          )

        case 'gap_fill': {
          try {
            const gapAnswers = JSON.parse(answer)
            return q.gaps.every((gap) => {
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
          return answer === q.correct_option_id

        case 'choice_multi': {
          try {
            const selectedIds = JSON.parse(answer).sort()
            const correctIds = q.correct_option_ids.sort()
            return JSON.stringify(selectedIds) === JSON.stringify(correctIds)
          } catch {
            return false
          }
        }

        case 'matching': {
          try {
            const matches = JSON.parse(answer)
            return q.correct_matches.every((correctMatch) => {
              return matches[correctMatch.left_id] === correctMatch.right_id
            })
          } catch {
            return false
          }
        }

        case 'true_false':
          return answer === String(q.correct_answer)

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

    const isCorrect = checkAnswerCorrectness(question, userAnswer)
    onAnswerSubmit(question.id, userAnswer, isCorrect)
    setIsSubmitted(true)
  }

  const renderQuestionComponent = () => {
    switch (question.question_type) {
      case 'lexical_fix':
        return (
          <LexicalFix
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'grammar_transformation':
        return (
          <GrammarTransformation
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'sentence_puzzle':
        return (
          <SentencePuzzle
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'translate':
        return (
          <Translate
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'reverse_translation':
        return (
          <ReverseTranslation
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'gap_fill':
        return (
          <GapFill
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'choice_one':
        return (
          <ChoiceOne
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'choice_multi':
        return (
          <ChoiceMulti
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'matching':
        return (
          <Matching
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      case 'true_false':
        return (
          <TrueFalse
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
            onSubmit={handleSubmitAnswer}
          />
        )
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Loại câu hỏi không được hỗ trợ: {question}
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border-default p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              Câu {questionIndex + 1}
              {existingAnswer && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    existingAnswer.isCorrect
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  }`}
                >
                  {existingAnswer.isCorrect ? '✓ Đúng' : '✗ Sai'}
                </span>
              )}
            </h2>
          </div>

          {isSubmitted && (
            <CustomButton
              variant="primary"
              size="sm"
              icon={existingAnswer ? Check : ArrowRight}
              disabled
            >
              {existingAnswer ? 'Đã trả lời' : 'Tiếp tục'}
            </CustomButton>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderQuestionComponent()}</div>
    </div>
  )
}

export default SessionQuestionPanel
