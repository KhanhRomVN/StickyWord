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
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    console.log('[SessionPage] Loaded with sessionId:', sessionId)

    // 🔥 Load questions from sessionId
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

        setQuestions(session.questions)
        console.log(
          '[SessionPage] ✅ Loaded questions from localStorage:',
          session.questions.length
        )
      } catch (error) {
        console.error('[SessionPage] Error loading questions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [sessionId])

  const handleAnswerSubmit = async (questionId: string, userAnswer: string, isCorrect: boolean) => {
    const newAnswer: SessionAnswer = {
      questionId,
      userAnswer,
      isCorrect,
      answeredAt: new Date().toISOString()
    }

    setAnswers((prev) => [...prev, newAnswer])

    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, user_answer: userAnswer, is_correct: isCorrect } : q
    )
    setQuestions(updatedQuestions)

    try {
      const { getSessionStorageService } = await import('../../../services/SessionStorageService')
      const storageService = getSessionStorageService()
      const session = await storageService.getSessionById(sessionId || '')

      if (session) {
        session.questions = updatedQuestions
        await storageService.saveSession(session)
        console.log('[SessionPage] ✅ Answer saved to localStorage')
      }
    } catch (error) {
      console.error('[SessionPage] ❌ Failed to save answer:', error)
    }

    const totalAnswered = answers.length + 1
    if (totalAnswered === questions.length) {
      const allAnswers = [...answers, newAnswer]

      try {
        const { getSessionService } = await import('../../../services/SessionService')
        const sessionService = getSessionService()
        await sessionService.completeSession(sessionId || '')
        console.log('[SessionPage] ✅ Session completed and synced to cloud')

        // 🔥 Xử lý các câu trả lời sai → tạo collection
        const incorrectAnswers = allAnswers.filter((a) => !a.isCorrect)
        if (incorrectAnswers.length > 0) {
          console.log('[SessionPage] 🔍 Processing incorrect answers:', incorrectAnswers.length)
          await handleIncorrectAnswers(incorrectAnswers, questions)
        }
      } catch (error) {
        console.error('[SessionPage] ❌ Failed to complete session:', error)
      }
    }

    console.log('[SessionPage] Answer submitted:', newAnswer)
  }

  const handleIncorrectAnswers = async (
    incorrectAnswers: SessionAnswer[],
    questions: Question[]
  ) => {
    try {
      console.log(
        '[handleIncorrectAnswers] 🚀 Starting collection generation from incorrect answers'
      )

      // 1. Lấy các question tương ứng với incorrect answers
      const incorrectQuestions = incorrectAnswers
        .map((ans) => questions.find((q) => q.id === ans.questionId))
        .filter(Boolean) as Question[]

      if (incorrectQuestions.length === 0) {
        console.log('[handleIncorrectAnswers] ⚠️ No incorrect questions found')
        return
      }

      // 2. Lấy Gemini API key
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
      console.log('[handleIncorrectAnswers] ✅ Using API key:', selectedKey.name)

      // 3. Tạo prompt để AI generate collection
      const prompt = buildCollectionPrompt(incorrectQuestions)

      // 4. Gọi Gemini API
      const { createCreateCollectionService } = await import(
        '../../../presentation/pages/Collection/services/CreateCollectionService'
      )
      const service = createCreateCollectionService(selectedKey.key)
      const aiResponse = await service.generateQuestions(prompt)

      console.log('[handleIncorrectAnswers] 📥 AI Response received')

      // 5. Parse JSON response
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/)
      const jsonText = jsonMatch ? jsonMatch[1] : aiResponse
      const parsed = JSON.parse(jsonText)

      if (!parsed.collections || !Array.isArray(parsed.collections)) {
        console.warn('[handleIncorrectAnswers] ⚠️ Invalid collections format')
        return
      }

      console.log('[handleIncorrectAnswers] ✅ Parsed collections:', parsed.collections.length)

      // 6. Lưu hoặc cập nhật collection vào database
      const { getCloudDatabase } = await import('../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (!db) {
        console.error('[handleIncorrectAnswers] ❌ Database not connected')
        return
      }

      for (const collection of parsed.collections) {
        await processCollection(collection, db)
      }

      console.log('[handleIncorrectAnswers] ✅ All collections processed successfully')
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
    // 1. Kiểm tra xem collection đã tồn tại chưa
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
      // ✅ Đã tồn tại → giảm 5 điểm mastery
      const existingId = checkResult.rows[0].id
      console.log('[processVocabularyCollection] 📉 Item exists, decreasing mastery:', existingId)

      const updateMasteryQuery = `
      UPDATE vocabulary_analytics 
      SET mastery_score = GREATEST(0, mastery_score - 5), 
          updated_at = $2
      WHERE vocabulary_item_id = $1
    `
      if (window.api) {
        await window.api.cloudDatabase.query(updateMasteryQuery, [
          existingId,
          new Date().toISOString()
        ])
      }

      console.log('[processVocabularyCollection] ✅ Mastery decreased by 5 points')
    } else {
      // ✅ Chưa tồn tại → thêm mới
      console.log('[processVocabularyCollection] ➕ Creating new item:', collection.content)

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
      console.log('[processVocabularyCollection] ✅ New item created')
    }
  }

  const processGrammarCollection = async (collection: any, db: any) => {
    // 1. Kiểm tra xem grammar đã tồn tại chưa
    if (!window.api) {
      console.error('[processGrammarCollection] ❌ window.api not available')
      return
    }

    const checkQuery = `SELECT id FROM grammar_item WHERE title = $1`
    const checkResult = await window.api.cloudDatabase.query(checkQuery, [collection.title])

    if (checkResult.success && checkResult.rows.length > 0) {
      // ✅ Đã tồn tại → giảm 5 điểm mastery
      const existingId = checkResult.rows[0].id
      console.log('[processGrammarCollection] 📉 Grammar exists, decreasing mastery:', existingId)

      const updateMasteryQuery = `
      UPDATE grammar_analytics 
      SET mastery_score = GREATEST(0, mastery_score - 5), 
          updated_at = $2
      WHERE grammar_item_id = $1
    `
      if (window.api) {
        await window.api.cloudDatabase.query(updateMasteryQuery, [
          existingId,
          new Date().toISOString()
        ])
      }

      console.log('[processGrammarCollection] ✅ Mastery decreased by 5 points')
    } else {
      // ✅ Chưa tồn tại → thêm mới
      console.log('[processGrammarCollection] ➕ Creating new grammar:', collection.title)

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
      console.log('[processGrammarCollection] ✅ New grammar created')
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
