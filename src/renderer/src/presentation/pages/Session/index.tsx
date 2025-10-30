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

  // ✅ Listen for next question navigation
  useEffect(() => {
    const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    }

    const handleAllCompleted = async () => {
      const allAnswers = answers
      const finalQuestions = questions
      await handleCompleteSession(allAnswers, finalQuestions)
    }

    window.addEventListener('navigate-next-question', handleNextQuestion)
    window.addEventListener('all-questions-completed', handleAllCompleted)

    return () => {
      window.removeEventListener('navigate-next-question', handleNextQuestion)
      window.removeEventListener('all-questions-completed', handleAllCompleted)
    }
  }, [currentQuestionIndex, questions, answers])

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
        // ✅ Tính score_earn dựa trên time_spent và time_limit
        let scoreEarn = 0
        if (isCorrect && q.time_spent && q.time_limit) {
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

          scoreEarn = q.scores[scoreIndex]
        }

        return { ...q, user_answer: userAnswer, is_correct: isCorrect, score_earn: scoreEarn }
      }
      return q
    })

    setQuestions(updatedQuestions)

    // ✅ Tự động chuyển sang câu tiếp theo (nếu còn)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleCompleteSession = async (allAnswers: SessionAnswer[], finalQuestions: Question[]) => {
    try {
      const { getSessionStorageService } = await import('../../../services/SessionStorageService')
      const storageService = getSessionStorageService()
      const session = await storageService.getSessionById(sessionId || '')

      if (!session) {
        console.error('[SessionPage] ❌ Session not found')
        return
      }

      // ✅ BƯỚC 1: Xử lý câu sai và gửi prompt cho Gemini TRƯỚC
      const incorrectAnswers = allAnswers.filter((a) => !a.isCorrect)
      if (incorrectAnswers.length > 0) {
        await handleIncorrectAnswers(incorrectAnswers, finalQuestions)
      }

      // ✅ BƯỚC 2: Tính toán các metrics SAU KHI xử lý xong Gemini
      const correctCount = allAnswers.filter((a) => a.isCorrect).length
      const totalCount = allAnswers.length
      const accuracyRate = Math.round((correctCount / totalCount) * 100)

      // Tính total_time_spent từ questions
      const totalTimeSpent = finalQuestions.reduce((sum, q) => sum + (q.time_spent || 0), 0)

      // ✅ Tính total_score từ score_earn
      const totalScore = finalQuestions.reduce((sum, q) => sum + (q.score_earn || 0), 0)

      const completedSession = {
        ...session,
        questions: finalQuestions,
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        total_time_spent: totalTimeSpent,
        total_score: totalScore,
        accuracy_rate: accuracyRate
      }

      // ✅ BƯỚC 3: Lưu session vào localStorage
      await storageService.updateSession(sessionId || '', completedSession)

      // ✅ BƯỚC 4: Đồng bộ lên cloud database
      await storageService.saveSessionToCloud(completedSession)

      // ✅ BƯỚC 5: Hiển thị thông báo hoàn thành
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

      // ✅ LOG: In ra prompt gửi cho Gemini khi xử lý incorrect answers
      console.log('[handleIncorrectAnswers] 📤 Prompt gửi cho Gemini API:')
      console.log('='.repeat(80))
      console.log(prompt)
      console.log('='.repeat(80))

      const { createCreateCollectionService } = await import(
        '../../../presentation/pages/Collection/services/CreateCollectionService'
      )
      const service = createCreateCollectionService(selectedKey.key)
      const aiResponse = await service.generateQuestions(prompt)

      // ✅ LOG: In ra raw response từ Gemini
      console.log('[handleIncorrectAnswers] 📥 Raw response từ Gemini API:')
      console.log('='.repeat(80))
      console.log(aiResponse)
      console.log('='.repeat(80))

      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/)
      const jsonText = jsonMatch ? jsonMatch[1] : aiResponse
      const parsed = JSON.parse(jsonText)

      // ✅ LOG: In ra parsed JSON data
      console.log('[handleIncorrectAnswers] ✅ Parsed JSON data từ Gemini:')
      console.log('='.repeat(80))
      console.log(JSON.stringify(parsed, null, 2))
      console.log('='.repeat(80))
      console.log(
        `[handleIncorrectAnswers] 📊 Số collections được tạo: ${parsed.collections?.length || 0}`
      )

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
          info += `   Incorrect Word: "${q.incorrect_word}"\n`
          info += `   Correct Word: "${q.correct_word}"\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'grammar_transformation') {
          info += `   Original: "${q.original_sentence}"\n`
          info += `   Transformation: ${q.grammar_focus}\n`
          info += `   Correct Answer: "${q.correct_answer}"\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'sentence_puzzle') {
          info += `   Correct Sentence: "${q.correct_sentence}"\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'translate') {
          info += `   Source (${q.source_language}): "${q.source_sentence}"\n`
          info += `   Correct Translation: "${q.correct_translation}"\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'reverse_translation') {
          info += `   English: "${q.english_sentence}"\n`
          info += `   Correct Translation (${q.target_language}): "${q.correct_translation}"\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'gap_fill') {
          info += `   Sentence: "${q.sentence_with_gaps}"\n`
          const correctAnswers = q.gaps.map((g) => g.correct_answer).join(', ')
          info += `   Correct Answers: ${correctAnswers}\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'choice_one') {
          info += `   Question: "${q.question_text}"\n`
          const correctOption = q.options.find((o) => o.id === q.correct_option_id)
          info += `   Correct Option: ${correctOption?.text || q.correct_option_id}\n`
          const userOption = q.options.find((o) => o.id === q.user_answer)
          info += `   User Answer: ${userOption?.text || q.user_answer || '(no answer)'}\n`
        } else if (q.question_type === 'choice_multi') {
          info += `   Question: "${q.question_text}"\n`
          const correctOptions = q.options
            .filter((o) => q.correct_option_ids.includes(o.id))
            .map((o) => o.text)
          info += `   Correct Options: ${correctOptions.join(', ')}\n`
          try {
            const userAnswerIds = JSON.parse(q.user_answer || '[]')
            const userOptions = q.options
              .filter((o) => userAnswerIds.includes(o.id))
              .map((o) => o.text)
            info += `   User Answer: ${userOptions.join(', ') || '(no answer)'}\n`
          } catch {
            info += `   User Answer: (invalid format)\n`
          }
        } else if (q.question_type === 'matching') {
          info += `   Instruction: "${q.instruction}"\n`
          info += `   User Answer: "${q.user_answer || '(no answer)'}"\n`
        } else if (q.question_type === 'true_false') {
          info += `   Statement: "${q.statement}"\n`
          info += `   Correct Answer: ${q.correct_answer}\n`
          info += `   User Answer: ${q.user_answer || '(no answer)'}\n`
        }

        return info
      })
      .join('\n')
    return `Analyze these incorrect answers and generate vocabulary/grammar collections to help the user learn:

${questionsInfo}

**Requirements:**
- Identify key vocabulary words, phrases, or grammar points from incorrect answers
- ✅ CRITICAL FOR PHRASES: ONLY generate TRUE PHRASES (phrasal verbs, idioms, collocations, slang, expressions)
  - ✅ GOOD EXAMPLES: "break out", "give up", "run out of", "look forward to", "piece of cake", "spill the beans"
  - ❌ BAD EXAMPLES: "Can you help me?", "How are you?", "I am interested" (these are SENTENCES, not phrases)
  - ❌ AVOID: Basic questions, greetings, simple statements
- For each item, determine if it's a word, phrase, or grammar point
- Generate comprehensive definitions, examples, and explanations
- ✅ CRITICAL: difficulty_level và frequency_rank PHẢI là số nguyên từ 1-10 (KHÔNG dùng 4.5, 3.2, v.v)
- ✅ CRITICAL: wordType CHỈ dùng các giá trị: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection, determiner, exclamation
- ✅ CRITICAL: phraseType CHỈ dùng các giá trị: idiom, phrasal_verb, collocation, slang, expression

**Output Format (strict JSON):**
\`\`\`json
{
  "collections": [
    {
      "type": "phrase",
      "content": "break out",
      "pronunciation": "/breɪk aʊt/",
      "difficulty_level": 5,
      "frequency_rank": 7,
      "category": "phrasal_verbs",
      "tags": ["phrasal_verb", "action", "common"],
      "definitions": [
        {
          "meaning": "To escape from a place or situation",
          "translation": "Trốn thoát, bùng nổ",
          "phraseType": "phrasal_verb",
          "examples": [
            {
              "sentence": "The prisoners tried to break out of jail.",
              "translation": "Các tù nhân đã cố gắng trốn thoát khỏi nhà tù."
            },
            {
              "sentence": "A fire broke out in the building.",
              "translation": "Một đám cháy đã bùng phát trong tòa nhà."
            }
          ]
        }
      ],
      "metadata": {
        "common_mistakes": "Confused with 'break down' or 'break up'",
        "usage_note": "Can mean 'escape' or 'suddenly start'"
      }
    },
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

      // ✅ FIX: Dùng saveGrammarItem từ CloudDatabaseService
      // Service này sẽ tự động tạo grammar_rule trước khi tạo example
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
