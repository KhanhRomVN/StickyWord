import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SessionCard from './components/SessionCard'
import CustomButton from '../../../components/common/CustomButton'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { getSessionService } from '../../../services/SessionService'
import { createCreateCollectionService } from '../Collection/services/CreateCollectionService'
import { Session } from '../Session/types'

// Type guard helper
const ensureApiAvailable = () => {
  if (!window.api) {
    throw new Error('Electron API không khả dụng')
  }
}

const SessionManagerPage = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingSessionCount, setPendingSessionCount] = useState(0)
  const [maxPendingSessions, setMaxPendingSessions] = useState(3)

  useEffect(() => {
    loadConfig()
    loadSessions()
  }, [])

  const loadConfig = async () => {
    try {
      ensureApiAvailable()
      const configStr = await window.api!.storage.get('auto_session_config')
      if (configStr) {
        let config: any
        if (typeof configStr === 'string') {
          config = JSON.parse(configStr)
        } else {
          config = configStr
        }
        setMaxPendingSessions(config.max_pending_sessions || 3)
      }
    } catch (error) {
      console.error('[SessionManager] Error loading config:', error)
    }
  }

  const loadSessions = async () => {
    try {
      setIsLoading(true)

      const { getSessionStorageService } = await import('../../../services/SessionStorageService')
      const storageService = getSessionStorageService()

      const localSessions = await storageService.getAllSessions()

      ensureApiAvailable()
      const cloudResult = await window.api!.cloudDatabase.query(
        'SELECT * FROM sessions ORDER BY created_at DESC'
      )

      const cloudSessions: Session[] = cloudResult.success
        ? cloudResult.rows.map((row: any) => ({
            id: row.id,
            title: row.title || `Session ${row.id.substring(0, 8)}`,
            description: row.description || '',
            questions: Array.isArray(row.questions) ? row.questions : [],
            status: (row.status as 'pending' | 'completed') || 'pending',
            created_at: row.created_at,
            completed_at: row.completed_at,
            expires_at: row.expires_at,
            difficulty_level: row.difficulty_level || 5,
            total_time_spent: row.total_time_spent,
            total_score: row.total_score,
            accuracy_rate: row.accuracy_rate,
            attempts_allowed: row.attempts_allowed || 1,
            target_language: row.target_language || 'en',
            source_language: row.source_language || 'vi',
            topics: Array.isArray(row.topics) ? row.topics : []
          }))
        : []

      const sessionMap = new Map<string, Session>()

      const allSessionsArray = [...localSessions, ...cloudSessions]
      allSessionsArray.forEach((session) => {
        if (!sessionMap.has(session.id)) {
          sessionMap.set(session.id, session)
        } else {
          const existing = sessionMap.get(session.id)!
          const sessionUpdated = (session as any).updated_at || session.created_at
          const existingUpdated = (existing as any).updated_at || existing.created_at

          if (
            session.status === 'completed' ||
            new Date(sessionUpdated).getTime() > new Date(existingUpdated).getTime()
          ) {
            sessionMap.set(session.id, session)
          }
        }
      })

      const allSessions = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setSessions(allSessions)

      const pendingCount = allSessions.filter((s) => s.status === 'pending').length
      setPendingSessionCount(pendingCount)
    } catch (error) {
      console.error('[SessionManager] Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSession = async () => {
    try {
      setIsCreating(true)

      // 1. Lấy collections có mastery_score thấp nhất
      const { getCloudDatabase } = await import('../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (!db) {
        throw new Error('Database not connected')
      }

      // Lấy 5 vocabulary items có mastery_score thấp nhất
      ensureApiAvailable()
      const vocabResult = await window.api!.cloudDatabase.query(
        `
        SELECT v.id, v.content, v.item_type
        FROM vocabulary_item v
        LEFT JOIN vocabulary_analytics va ON v.id = va.vocabulary_item_id
        ORDER BY COALESCE(va.mastery_score, 0) ASC
        LIMIT 5
        `
      )

      // Lấy 5 grammar items có mastery_score thấp nhất
      const grammarResult = await window.api!.cloudDatabase.query(
        `
        SELECT g.id, g.title, g.item_type
        FROM grammar_item g
        LEFT JOIN grammar_analytics ga ON g.id = ga.grammar_item_id
        ORDER BY COALESCE(ga.mastery_score, 0) ASC
        LIMIT 5
        `
      )

      const vocabularyIds = vocabResult.success ? vocabResult.rows.map((r) => r.id) : []
      const grammarIds = grammarResult.success ? grammarResult.rows.map((r) => r.id) : []

      if (vocabularyIds.length === 0 && grammarIds.length === 0) {
        console.warn('[SessionManager] ⚠️ No vocabulary or grammar items found in database')
        console.warn('[SessionManager] ⚠️ Will generate random questions instead')
      }

      // 2. Tạo prompt để generate questions
      const prompt = buildQuestionsPrompt(vocabularyIds, grammarIds)

      // 3. Gọi AI để tạo questions
      const apiKeysStr = await window.api!.storage.get('gemini_api_keys')

      if (!apiKeysStr) {
        console.error('[SessionManager] ❌ No Gemini API keys found in storage')
        throw new Error('No Gemini API keys found')
      }

      // Kiểm tra xem apiKeysStr đã là object hay chưa
      let apiKeys: any
      if (typeof apiKeysStr === 'string') {
        try {
          apiKeys = JSON.parse(apiKeysStr)
        } catch (parseError) {
          console.error('[SessionManager] ❌ Failed to parse API keys string:', apiKeysStr)
          throw new Error('Invalid API keys format in storage')
        }
      } else if (typeof apiKeysStr === 'object') {
        apiKeys = apiKeysStr
      } else {
        console.error('[SessionManager] ❌ Unexpected API keys type:', typeof apiKeysStr)
        throw new Error('Invalid API keys type in storage')
      }

      if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
        console.error('[SessionManager] ❌ No valid API keys available')
        throw new Error('No valid API keys available')
      }

      const selectedKey = apiKeys[0]
      const service = createCreateCollectionService(selectedKey.key)
      const textResponse = await service.generateQuestions(prompt)

      // Parse JSON từ response với error handling tốt hơn
      let parsed: any
      try {
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/)
        let jsonText = jsonMatch ? jsonMatch[1].trim() : textResponse.trim()
        const startIdx = jsonText.indexOf('{')
        const endIdx = jsonText.lastIndexOf('}')

        if (startIdx !== -1 && endIdx !== -1) {
          jsonText = jsonText.substring(startIdx, endIdx + 1)
        }

        parsed = JSON.parse(jsonText)
      } catch (parseError) {
        console.error('[SessionManager] ❌ JSON parse error:', parseError)
        console.error(
          '[SessionManager] ❌ Error type:',
          parseError instanceof Error ? parseError.constructor.name : typeof parseError
        )
        console.error(
          '[SessionManager] ❌ Error message:',
          parseError instanceof Error ? parseError.message : String(parseError)
        )
        console.error('[SessionManager] 📄 Full raw response:', textResponse)
        throw new Error(
          `Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        )
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.error('[SessionManager] ❌ Invalid questions format')
        console.error('[SessionManager] 📊 Parsed object keys:', Object.keys(parsed))
        console.error('[SessionManager] 📊 questions value:', parsed.questions)
        throw new Error('Invalid questions format from AI')
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid questions format from AI')
      }

      if (parsed.questions.length < 10) {
        console.warn(
          `[SessionManager] ⚠️ Only ${parsed.questions.length} questions generated, expected 10`
        )
      }

      const validationErrors: string[] = []

      parsed.questions.forEach((q: any, index: number) => {
        if (!q.question_type) {
          validationErrors.push(`Question ${index + 1}: Missing question_type`)
        }
        if (!q.context || q.context.trim() === '') {
          validationErrors.push(`Question ${index + 1}: Missing or empty context`)
        }
        if (!q.difficulty_level || typeof q.difficulty_level !== 'number') {
          validationErrors.push(`Question ${index + 1}: Missing or invalid difficulty_level`)
        }
        if (q.difficulty_level && (q.difficulty_level < 1 || q.difficulty_level > 10)) {
          validationErrors.push(`Question ${index + 1}: difficulty_level must be between 1-10`)
        }
      })

      if (validationErrors.length > 0) {
        console.error('[SessionManager] ❌ Validation errors:', validationErrors)
        console.error(
          '[SessionManager] 📋 Failed questions:',
          parsed.questions.map((q: any, i: number) => ({
            index: i + 1,
            question_type: q.question_type,
            has_context: !!q.context,
            difficulty_level: q.difficulty_level
          }))
        )
        throw new Error(`Question validation failed:\n${validationErrors.join('\n')}`)
      }

      // 4. Xử lý questions (đã validate ở trên)
      const questions = parsed.questions.map((q: any, index: number) => {
        const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`

        // Tính scores dựa trên difficulty_level
        const baseScore = q.difficulty_level * 10
        const scores: [number, number, number, number, number, number] = [
          baseScore + 20, // Rất nhanh (<30% time_limit)
          baseScore + 15, // Nhanh (<50% time_limit)
          baseScore + 10, // Trung bình (<70% time_limit)
          baseScore + 5, // Hơi chậm (<85% time_limit)
          baseScore, // Chậm (<100% time_limit)
          Math.floor(baseScore * 0.5) // Quá thời gian (>100% time_limit)
        ]

        // Tính time_limit dựa trên difficulty_level và question_type
        const baseTime = 30 // 30 seconds
        const typeMultiplier = [
          'translate',
          'grammar_transformation',
          'reverse_translation'
        ].includes(q.question_type)
          ? 2
          : 1
        const timeLimit = baseTime + q.difficulty_level * 5 * typeMultiplier

        const systemFields = {
          id: questionId,
          vocabulary_item_ids: vocabularyIds.length > 0 ? vocabularyIds : [],
          grammar_points: grammarIds.length > 0 ? grammarIds : [],
          created_at: new Date().toISOString(),
          scores: scores,
          time_limit: timeLimit
        }

        const processedQuestion = {
          ...q,
          ...systemFields
        }

        return processedQuestion
      })

      // 5. Tạo session và lưu questions
      const sessionService = getSessionService()
      const session = await sessionService.createSession(questions, 24)

      // 6. Chuyển tới SessionPage
      navigate(`/session?sessionId=${session.id}`)
    } catch (error) {
      console.error('[SessionManager] ❌ Error creating session:', error)
      console.error(
        '[SessionManager] ❌ Error type:',
        error instanceof Error ? error.constructor.name : typeof error
      )
      console.error(
        '[SessionManager] ❌ Error message:',
        error instanceof Error ? error.message : String(error)
      )
      console.error(
        '[SessionManager] ❌ Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      )

      // Log toàn bộ error object
      if (error && typeof error === 'object') {
        console.error(
          '[SessionManager] ❌ Error details:',
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        )
      }

      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(`Lỗi khi tạo session: ${errorMessage}`)
    } finally {
      setIsCreating(false)
    }
  }

  const buildQuestionsPrompt = (vocabularyIds: string[], grammarIds: string[]): string => {
    const hasCollections = vocabularyIds.length > 0 || grammarIds.length > 0

    const structureExamples = `
**QUESTION TYPE STRUCTURES:**

1. LEXICAL_FIX:
{
  "question_type": "lexical_fix",
  "incorrect_sentence": "I am very interesting in learning English.",
  "incorrect_word": "interesting",
  "word_position": 3,
  "correct_word": "interested",
  "correct_sentence": "I am very interested in learning English.",
  "context": "Tìm từ sai trong câu và sửa lại cho đúng",
  "hint": "Think about adjectives ending in -ed vs -ing",
  "explanation": "Use 'interested' for feelings, 'interesting' for things.",
  "error_type": "wrong_form",
  "difficulty_level": 3
}

2. GRAMMAR_TRANSFORMATION:
{
  "question_type": "grammar_transformation",
  "original_sentence": "They built this house in 1990.",
  "context": "Change to passive voice",
  "grammar_focus": "passive",
  "correct_answer": "This house was built in 1990.",
  "alternative_answers": ["This house was built by them in 1990."],
  "hint": "Move the object to the subject position",
  "explanation": "In passive voice, the object becomes the subject.",
  "difficulty_level": 5
}

3. SENTENCE_PUZZLE:
{
  "question_type": "sentence_puzzle",
  "scrambled_items": ["always", "early", "wakes", "she", "up"],
  "correct_sentence": "She always wakes up early.",
  "correct_order": [3, 0, 2, 4, 1],
  "context": "Sắp xếp các từ sau để tạo thành câu hoàn chỉnh",
  "hint": "Adverbs of frequency go before the main verb",
  "language_code": "en",
  "difficulty_level": 4
}

4. TRANSLATE:
{
  "question_type": "translate",
  "source_sentence": "Tôi đang học tiếng Anh.",
  "source_language": "vi",
  "correct_translation": "I am learning English.",
  "alternative_translations": ["I am studying English.", "I'm learning English."],
  "context": "Dịch câu tiếng Việt sang tiếng Anh",
  "hint": "Use present continuous for ongoing actions",
  "difficulty_level": 3
}

5. REVERSE_TRANSLATION:
{
  "question_type": "reverse_translation",
  "english_sentence": "I have been living here for five years.",
  "target_language": "vi",
  "correct_translation": "Tôi đã sống ở đây được năm năm.",
  "alternative_translations": ["Tôi đã ở đây được 5 năm.", "Tôi sống ở đây được năm năm rồi."],
  "context": "Dịch câu tiếng Anh sang tiếng Việt",
  "hint": "Focus on the duration aspect",
  "key_grammar_points": ["present_perfect_continuous"],
  "difficulty_level": 6
}

6. GAP_FILL:
{
  "question_type": "gap_fill",
  "sentence_with_gaps": "She _____ to the market every Sunday and _____ fresh vegetables.",
  "gaps": [
    {
      "position": 0,
      "correct_answer": "goes",
      "alternative_answers": []
    },
    {
      "position": 1,
      "correct_answer": "buys",
      "alternative_answers": ["purchases"]
    }
  ],
  "context": "Điền động từ thích hợp vào chỗ trống",
  "hint": "Use simple present tense",
  "word_bank": ["go", "goes", "buy", "buys", "went", "bought"],
  "difficulty_level": 3
}

7. CHOICE_ONE:
{
  "question_type": "choice_one",
  "question_text": "Which word means 'very tired'?",
  "options": [
    { "id": "opt_001", "text": "exhausted" },
    { "id": "opt_002", "text": "excited" },
    { "id": "opt_003", "text": "energetic" },
    { "id": "opt_004", "text": "relaxed" }
  ],
  "correct_option_id": "opt_001",
  "context": "Chọn từ đồng nghĩa với 'very tired'",
  "hint": "Think about extreme tiredness",
  "explanation": "'Exhausted' means extremely tired or worn out.",
  "difficulty_level": 4
}

8. CHOICE_MULTI:
{
  "question_type": "choice_multi",
  "question_text": "Which of the following are modal verbs?",
  "options": [
    { "id": "opt_m01", "text": "can" },
    { "id": "opt_m02", "text": "should" },
    { "id": "opt_m03", "text": "want" },
    { "id": "opt_m04", "text": "must" },
    { "id": "opt_m05", "text": "like" }
  ],
  "correct_option_ids": ["opt_m01", "opt_m02", "opt_m04"],
  "min_selections": 2,
  "max_selections": 4,
  "context": "Chọn tất cả các modal verbs từ danh sách",
  "hint": "Modal verbs express possibility, necessity, or permission",
  "explanation": "Modal verbs include can, could, may, might, must, shall, should, will, would.",
  "difficulty_level": 5
}

9. MATCHING:
{
  "question_type": "matching",
  "instruction": "Match each word with its definition",
  "left_items": [
    { "id": "left_01", "text": "enormous" },
    { "id": "left_02", "text": "tiny" },
    { "id": "left_03", "text": "ancient" },
    { "id": "left_04", "text": "modern" }
  ],
  "right_items": [
    { "id": "right_01", "text": "very small" },
    { "id": "right_02", "text": "very large" },
    { "id": "right_03", "text": "very old" },
    { "id": "right_04", "text": "recent or new" }
  ],
  "correct_matches": [
    { "left_id": "left_01", "right_id": "right_02" },
    { "left_id": "left_02", "right_id": "right_01" },
    { "left_id": "left_03", "right_id": "right_03" },
    { "left_id": "left_04", "right_id": "right_04" }
  ],
  "context": "Nối mỗi từ với định nghĩa của nó",
  "hint": "Think about size and time-related adjectives",
  "match_type": "word_definition",
  "difficulty_level": 4
}

10. TRUE_FALSE:
{
  "question_type": "true_false",
  "statement": "The present perfect tense is formed with 'have/has + past participle'.",
  "correct_answer": true,
  "context": "Đánh giá câu phát biểu về ngữ pháp present perfect",
  "hint": "Think about the structure of present perfect",
  "explanation": "The present perfect is indeed formed using have/has followed by the past participle.",
  "grammar_focus": "present_perfect",
  "difficulty_level": 3
}
`

    if (!hasCollections) {
      return `Generate 10 diverse English learning questions with random topics and question types.

**MANDATORY REQUIREMENTS:**
- Each question MUST have "difficulty_level" (integer from 3 to 7)
- Each question MUST have "context" (string in Vietnamese explaining the task)
- Difficulty range: 3-7/10 (mixed distribution)
- Question types: Mix of all 10 types (lexical_fix, grammar_transformation, translate, gap_fill, choice_one, choice_multi, sentence_puzzle, matching, true_false, reverse_translation)
- Topics: Randomly choose from daily life, work, travel, education, technology, health, etc.
- Each question MUST be unique and high quality
- STRICTLY follow the structure for each question type

${structureExamples}

**CRITICAL VALIDATION:**
Every question object MUST include these fields:
- "question_type" (one of the 10 types)
- "context" (Vietnamese instruction/description)
- "difficulty_level" (3, 4, 5, 6, or 7)
- All type-specific fields as shown in structures above

**Output Format:**
Return ONLY a valid JSON object with this structure:
\`\`\`json
{
  "questions": [
    ... array of 10 questions following the structures above ...
  ]
}
\`\`\`

Generate NOW with diverse topics and question types. Return ONLY valid JSON, no explanation.`
    }

    return `Generate 10 diverse English learning questions based on the provided vocabulary and grammar items.

**Vocabulary IDs:** ${vocabularyIds.join(', ')}
**Grammar IDs:** ${grammarIds.join(', ')}

**Requirements:**
- Difficulty range: 3-7/10 (mixed)
- Question types: Mix of all 10 types (lexical_fix, grammar_transformation, translate, gap_fill, choice_one, choice_multi, sentence_puzzle, matching, true_false, reverse_translation)
- Use the provided vocabulary and grammar items as the basis for questions
- Each question MUST be unique and high quality
- STRICTLY follow the structure for each question type

${structureExamples}

**Output Format:**
Return ONLY a valid JSON object with this structure:
\`\`\`json
{
  "questions": [
    ... array of 10 questions following the structures above ...
  ]
}
\`\`\`

Generate NOW with diverse question types. Return ONLY valid JSON, no explanation.`
  }

  const handleStartSession = (sessionId: string) => {
    navigate(`/session?sessionId=${sessionId}`)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa session này?')) {
      return
    }

    try {
      const { getSessionStorageService } = await import('../../../services/SessionStorageService')
      const storageService = getSessionStorageService()

      const localSession = await storageService.getSessionById(sessionId)

      ensureApiAvailable()
      const cloudResult = await window.api!.cloudDatabase.query(
        'SELECT * FROM sessions WHERE id = $1',
        [sessionId]
      )

      const cloudSession =
        cloudResult.success && cloudResult.rows.length > 0 ? cloudResult.rows[0] : null

      if (!localSession && !cloudSession) {
        console.warn(
          '[SessionManager] ⚠️ Session not found in both localStorage and cloud:',
          sessionId
        )
        alert('Session không tồn tại')
        return
      }

      if (cloudSession) {
        const deleteQuery = 'DELETE FROM sessions WHERE id = $1'
        const deleteResult = await window.api!.cloudDatabase.query(deleteQuery, [sessionId])

        if (!deleteResult.success) {
          throw new Error(deleteResult.error || 'Failed to delete session from cloud')
        }
      }

      if (localSession) {
        await storageService.deleteSession(sessionId)
      }

      await loadSessions()
    } catch (error) {
      console.error('[SessionManager] ❌ Error deleting session:', error)
      alert(`Lỗi khi xóa session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Session Manager</h1>
            <p className="text-text-secondary mt-1">Quản lý các phiên học tập của bạn</p>
          </div>
          <div className="flex items-center gap-2">
            <CustomButton variant="secondary" size="sm" icon={RefreshCw} onClick={loadSessions}>
              Làm mới
            </CustomButton>
            <CustomButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleCreateSession}
              disabled={isCreating || pendingSessionCount >= maxPendingSessions}
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Session'}
            </CustomButton>
          </div>
        </div>

        {/* Warning message khi đạt giới hạn */}
        {pendingSessionCount >= maxPendingSessions && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  Đã đạt giới hạn session chờ
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Bạn đã có <span className="font-bold">{pendingSessionCount}</span> session đang
                  chờ (giới hạn: <span className="font-bold">{maxPendingSessions}</span>). Vui lòng
                  hoàn thành hoặc xóa các session cũ trước khi tạo session mới.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-text-secondary">Đang tải sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-20 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main empty state card */}
            <div className="relative bg-card-background border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
              {/* Icon container with animation */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-lg">
                  <Plus className="w-12 h-12 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-text-primary mb-3">Chưa có session nào</h3>

              {/* Description */}
              <p className="text-text-secondary text-base mb-8 max-w-md mx-auto">
                Bắt đầu hành trình học tập của bạn bằng cách tạo session đầu tiên. Mỗi session sẽ
                giúp bạn rèn luyện kỹ năng tiếng Anh một cách hiệu quả.
              </p>

              {/* CTA Button */}
              <CustomButton
                variant="primary"
                size="md"
                icon={Plus}
                onClick={handleCreateSession}
                disabled={isCreating}
                loading={isCreating}
                className="mx-auto px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCreating ? 'Đang tạo session...' : 'Tạo Session Đầu Tiên'}
              </CustomButton>

              {/* Features list */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-1 text-sm">Học thông minh</h4>
                  <p className="text-xs text-text-secondary">
                    AI tự động tạo câu hỏi phù hợp với trình độ
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-1 text-sm">
                    Đánh giá chính xác
                  </h4>
                  <p className="text-xs text-text-secondary">Theo dõi tiến độ học tập chi tiết</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-1 text-sm">Linh hoạt</h4>
                  <p className="text-xs text-text-secondary">
                    Học mọi lúc, mọi nơi theo lịch trình
                  </p>
                </div>
              </div>

              {/* Quick tips */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                    ?
                  </span>
                  <span>
                    <span className="font-medium text-text-primary">Mẹo:</span> Bạn có thể cấu hình
                    tự động tạo session trong
                    <button
                      onClick={() => navigate('/settings')}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Settings → Session
                    </button>
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onStart={handleStartSession}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionManagerPage
