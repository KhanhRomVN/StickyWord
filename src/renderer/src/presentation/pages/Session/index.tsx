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

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (!sessionId || !window.api) {
          console.error('[SessionPage] Missing sessionId or window.api')
          setIsLoading(false)
          return
        }

        const { getSessionStorageService } = await import('../../../services/SessionStorageService')
        const storageService = getSessionStorageService()
        const session = await storageService.getSessionById(sessionId)

        if (!session || session.questions.length === 0) {
          console.error('[SessionPage] No questions found for session')
          setIsLoading(false)
          return
        }

        // ✅ Clean questions: xóa user_answer và is_correct
        const cleanedQuestions = session.questions.map((q, index) => {
          const { user_answer, is_correct, ...cleanQuestion } = q as any

          if (!cleanQuestion.id) {
            console.error(`[SessionPage] ❌ Question ${index} has no ID!`, cleanQuestion)
          }

          return cleanQuestion as Question
        })

        setQuestions(cleanedQuestions)
        setAnswers([])
        setCurrentQuestionIndex(0)
      } catch (error) {
        console.error('[SessionPage] Error loading questions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [sessionId])

  const handleAnswerSubmit = (questionId: string, userAnswer: string, isCorrect: boolean) => {
    if (!questionId) {
      console.error('[SessionPage] ❌ Cannot submit answer: questionId is undefined')
      return
    }

    const newAnswer: SessionAnswer = {
      questionId,
      userAnswer,
      isCorrect,
      answeredAt: new Date().toISOString()
    }

    setAnswers((prev) => [...prev, newAnswer])

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, user_answer: userAnswer, is_correct: isCorrect }
      }
      return q
    })

    setQuestions(updatedQuestions)
    const totalAnswered = answers.length + 1
    if (totalAnswered === questions.length) {
      handleCompleteSession([...answers, newAnswer], updatedQuestions)
    }
  }

  const handleCompleteSession = async (allAnswers: SessionAnswer[], finalQuestions: Question[]) => {
    try {
      // 1. Lưu session với questions đã có answers vào localStorage
      const { getSessionStorageService } = await import('../../../services/SessionStorageService')
      const storageService = getSessionStorageService()
      const session = await storageService.getSessionById(sessionId || '')

      if (!session) {
        console.error('[SessionPage] ❌ Session not found')
        return
      }

      // Tính toán các metrics
      const correctCount = allAnswers.filter((a) => a.isCorrect).length
      const totalCount = allAnswers.length
      const accuracyRate = Math.round((correctCount / totalCount) * 100)

      // Tính total_time_spent từ questions
      const totalTimeSpent = finalQuestions.reduce((sum, q) => sum + (q.time_spent || 0), 0)

      // Tính total_score dựa trên scores và time_spent
      const totalScore = finalQuestions.reduce((sum, q) => {
        if (!q.is_correct || !q.time_spent || !q.time_limit) return sum

        const timeRatio = q.time_spent / q.time_limit
        let scoreIndex = 0

        if (timeRatio <= 0.3)
          scoreIndex = 0 // Rất nhanh
        else if (timeRatio <= 0.5)
          scoreIndex = 1 // Nhanh
        else if (timeRatio <= 0.7)
          scoreIndex = 2 // Trung bình
        else if (timeRatio <= 0.85)
          scoreIndex = 3 // Hơi chậm
        else if (timeRatio <= 1.0)
          scoreIndex = 4 // Chậm
        else scoreIndex = 5 // Quá thời gian

        return sum + q.scores[scoreIndex]
      }, 0)

      const completedSession = {
        ...session,
        questions: finalQuestions,
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        total_time_spent: totalTimeSpent,
        total_score: totalScore,
        accuracy_rate: accuracyRate
      }

      await storageService.updateSession(sessionId || '', completedSession)

      // 2. Đồng bộ lên cloud database
      const { getSessionService } = await import('../../../services/SessionService')
      const sessionService = getSessionService()
      await sessionService.completeSession(sessionId || '')

      // 3. Xử lý các câu trả lời sai → tạo collection
      const incorrectAnswers = allAnswers.filter((a) => !a.isCorrect)
      if (incorrectAnswers.length > 0) {
        await handleIncorrectAnswers(incorrectAnswers, finalQuestions)
      }

      // 4. Hiển thị thông báo hoàn thành
      alert(
        `🎉 Hoàn thành session!\n\n` +
          `✅ Đúng: ${correctCount}/${totalCount}\n` +
          `📊 Độ chính xác: ${accuracyRate}%\n` +
          `⏱️ Thời gian: ${Math.floor(totalTimeSpent / 60)}:${(totalTimeSpent % 60).toString().padStart(2, '0')}\n` +
          `🎯 Điểm số: ${totalScore}\n\n` +
          `${incorrectAnswers.length > 0 ? '📚 Đã tạo collection từ các câu sai để ôn tập!' : '🌟 Tuyệt vời! Không có câu nào sai!'}`
      )
    } catch (error) {
      console.error('[SessionPage] ❌ Failed to complete session:', error)
      alert('❌ Lỗi khi hoàn thành session. Vui lòng thử lại.')
    }
  }

  const handleIncorrectAnswers = async (
    incorrectAnswers: SessionAnswer[],
    questions: Question[]
  ) => {
    try {
      const incorrectQuestions = incorrectAnswers
        .map((ans) => questions.find((q) => q.id === ans.questionId))
        .filter(Boolean) as Question[]

      if (incorrectQuestions.length === 0) {
        return
      }

      if (!window.api) {
        console.error('[handleIncorrectAnswers] ❌ window.api not available')
        return
      }

      const apiKeysStr = await window.api.storage.get('gemini_api_keys')
      if (!apiKeysStr || !Array.isArray(apiKeysStr) || apiKeysStr.length === 0) {
        console.warn('[handleIncorrectAnswers] ⚠️ No Gemini API keys found')
        return
      }

      const selectedKey = apiKeysStr[0]

      const prompt = buildCollectionPrompt(incorrectQuestions)

      const { createCreateCollectionService } = await import(
        '../../../presentation/pages/Collection/services/CreateCollectionService'
      )
      const service = createCreateCollectionService(selectedKey.key)
      const aiResponse = await service.generateQuestions(prompt)

      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/)
      const jsonText = jsonMatch ? jsonMatch[1] : aiResponse
      const parsed = JSON.parse(jsonText)

      if (!parsed.collections || !Array.isArray(parsed.collections)) {
        console.warn('[handleIncorrectAnswers] ⚠️ Invalid collections format')
        return
      }

      const { getCloudDatabase } = await import('../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (!db) {
        console.error('[handleIncorrectAnswers] ❌ Database not connected')
        return
      }

      for (const collection of parsed.collections) {
        await processCollection(collection, db)
      }
    } catch (error) {
      console.error('[handleIncorrectAnswers] ❌ Error processing incorrect answers:', error)
    }
  }

  const buildCollectionPrompt = (questions: Question[]): string => {
    const questionsInfo = questions
      .map((q, idx) => {
        let info = `${idx + 1}. Type: ${q.question_type}\n`

        if (q.question_type === 'lexical_fix') {
          info += `   Incorrect: "${q.incorrect_sentence}"\n`
          info += `   Word: "${q.incorrect_word}" → "${q.correct_word}"\n`
        } else if (q.question_type === 'grammar_transformation') {
          info += `   Original: "${q.original_sentence}"\n`
          info += `   Focus: ${q.grammar_focus}\n`
        } else if (q.question_type === 'translate') {
          info += `   Source: "${q.source_sentence}"\n`
          info += `   Translation: "${q.correct_translation}"\n`
        } else if (q.question_type === 'gap_fill') {
          info += `   Sentence: "${q.sentence_with_gaps}"\n`
        }

        return info
      })
      .join('\n')

    return `Analyze these incorrect answers and generate vocabulary/grammar collections to help the user learn:

${questionsInfo}

**Requirements:**
- Identify key vocabulary words, phrases, or grammar points from incorrect answers
- For each item, determine if it's a word, phrase, or grammar point
- Generate comprehensive definitions, examples, and explanations
- Set appropriate difficulty_level (1-10) and frequency_rank (1-10)

**Output Format (strict JSON):**
\`\`\`json
{
  "collections": [
    {
      "type": "word",
      "content": "interested",
      "pronunciation": "/ˈɪntrəstɪd/",
      "difficulty_level": 3,
      "frequency_rank": 8,
      "category": "daily",
      "tags": ["adjective", "emotion", "common"],
      "definitions": [
        {
          "meaning": "Showing curiosity or concern about something",
          "translation": "Quan tâm, hứng thú",
          "wordType": "adjective",
          "examples": [
            {
              "sentence": "I am interested in learning English.",
              "translation": "Tôi quan tâm đến việc học tiếng Anh."
            }
          ]
        }
      ],
      "metadata": {
        "common_mistakes": "Confused with 'interesting'",
        "usage_note": "Use 'interested' for people's feelings"
      }
    },
    {
      "type": "grammar",
      "title": "Adjectives ending in -ed vs -ing",
      "item_type": "rule",
      "difficulty_level": 4,
      "frequency_rank": 9,
      "category": "grammar",
      "tags": ["adjectives", "common_mistakes"],
      "definitions": [
        {
          "description": "Adjectives ending in -ed describe how people feel",
          "explanation": "-ed adjectives are used for feelings (interested, bored), -ing adjectives describe things (interesting, boring)",
          "structure": "Subject + be + -ed adjective (for feelings)",
          "translation": "Tính từ đuôi -ed mô tả cảm giác, -ing mô tả sự vật"
        }
      ],
      "examples": [
        {
          "sentence": "I am interested in this book. (feeling)",
          "translation": "Tôi quan tâm đến cuốn sách này.",
          "usage_note": "Describes the person's feeling"
        },
        {
          "sentence": "This book is interesting. (quality)",
          "translation": "Cuốn sách này thú vị.",
          "usage_note": "Describes the book's quality"
        }
      ],
      "commonMistakes": [
        {
          "incorrect": "I am very interesting in this topic.",
          "correct": "I am very interested in this topic.",
          "explanation": "Use 'interested' to describe feelings, not 'interesting'"
        }
      ]
    }
  ]
}
\`\`\`

Generate NOW. Return ONLY valid JSON, no explanation.`
  }

  const processCollection = async (collection: any, db: any) => {
    try {
      if (collection.type === 'word' || collection.type === 'phrase') {
        await processVocabularyCollection(collection, db)
      } else if (collection.type === 'grammar') {
        await processGrammarCollection(collection, db)
      }
    } catch (error) {
      console.error('[processCollection] Error:', error)
    }
  }

  const processVocabularyCollection = async (collection: any, db: any) => {
    if (!window.api) {
      console.error('[processVocabularyCollection] ❌ window.api not available')
      return
    }

    const checkQuery = `SELECT id FROM vocabulary_item WHERE content = $1 AND item_type = $2`
    const checkResult = await window.api.cloudDatabase.query(checkQuery, [
      collection.content,
      collection.type
    ])

    if (checkResult.success && checkResult.rows.length > 0) {
      const existingId = checkResult.rows[0].id

      const updateMasteryQuery = `
      UPDATE vocabulary_analytics 
      SET mastery_score = GREATEST(0, mastery_score - 5), 
          updated_at = $2
      WHERE vocabulary_item_id = $1
    `
      await window.api.cloudDatabase.query(updateMasteryQuery, [
        existingId,
        new Date().toISOString()
      ])
    } else {
      const newItem = {
        id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        item_type: collection.type,
        content: collection.content,
        pronunciation: collection.pronunciation,
        difficulty_level: collection.difficulty_level,
        frequency_rank: collection.frequency_rank,
        category: collection.category,
        tags: collection.tags,
        metadata: {
          ...collection.metadata,
          definitions: collection.definitions
        },
        created_at: new Date().toISOString()
      }

      await db.saveVocabularyItem(newItem)
    }
  }

  const processGrammarCollection = async (collection: any, db: any) => {
    if (!window.api) {
      console.error('[processGrammarCollection] ❌ window.api not available')
      return
    }

    const checkQuery = `SELECT id FROM grammar_item WHERE title = $1`
    const checkResult = await window.api.cloudDatabase.query(checkQuery, [collection.title])

    if (checkResult.success && checkResult.rows.length > 0) {
      const existingId = checkResult.rows[0].id

      const updateMasteryQuery = `
      UPDATE grammar_analytics 
      SET mastery_score = GREATEST(0, mastery_score - 5), 
          updated_at = $2
      WHERE grammar_item_id = $1
    `
      await window.api.cloudDatabase.query(updateMasteryQuery, [
        existingId,
        new Date().toISOString()
      ])
    } else {
      const newItem = {
        id: `grammar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        item_type: collection.item_type,
        title: collection.title,
        difficulty_level: collection.difficulty_level,
        frequency_rank: collection.frequency_rank,
        category: collection.category,
        tags: collection.tags,
        metadata: {
          ...collection.metadata,
          definitions: collection.definitions,
          examples: collection.examples,
          commonMistakes: collection.commonMistakes
        },
        created_at: new Date().toISOString()
      }

      await db.saveGrammarItem(newItem)
    }
  }

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Đang tải câu hỏi...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Không tìm thấy câu hỏi nào</p>
        </div>
      </div>
    )
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
