import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SessionCard from './components/SessionCard'
import CustomButton from '../../../components/common/CustomButton'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { getSessionService } from '../../../services/SessionService'
import { createCreateCollectionService } from '../Collection/services/CreateCollectionService'

// Type guard helper
const ensureApiAvailable = () => {
  if (!window.api) {
    throw new Error('Electron API không khả dụng')
  }
}

interface Session {
  id: string
  title?: string
  question_ids: string[]
  status: 'pending' | 'completed'
  created_at: string
  expires_at?: string
  difficulty_level?: number
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
        console.log('[SessionManager] 📊 Loaded config:', {
          max_pending_sessions: config.max_pending_sessions
        })
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
      const allSessions = await storageService.getAllSessions()

      setSessions(allSessions)

      const pendingCount = allSessions.filter((s) => s.status === 'pending').length
      setPendingSessionCount(pendingCount)
      console.log('[SessionManager] 📊 Pending sessions:', {
        count: pendingCount,
        max: maxPendingSessions
      })
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
      console.log('[SessionManager] 🔍 Fetching vocabulary items...')
      const vocabResult = await window.api!.cloudDatabase.query(
        `
        SELECT v.id, v.content, v.item_type
        FROM vocabulary_item v
        LEFT JOIN vocabulary_analytics va ON v.id = va.vocabulary_item_id
        ORDER BY COALESCE(va.mastery_score, 0) ASC
        LIMIT 5
        `
      )
      console.log('[SessionManager] 📊 Vocabulary query result:', {
        success: vocabResult.success,
        rowCount: vocabResult.rows?.length || 0,
        error: vocabResult.error || 'none'
      })

      // Lấy 5 grammar items có mastery_score thấp nhất
      console.log('[SessionManager] 🔍 Fetching grammar items...')
      const grammarResult = await window.api!.cloudDatabase.query(
        `
        SELECT g.id, g.title, g.item_type
        FROM grammar_item g
        LEFT JOIN grammar_analytics ga ON g.id = ga.grammar_item_id
        ORDER BY COALESCE(ga.mastery_score, 0) ASC
        LIMIT 5
        `
      )
      console.log('[SessionManager] 📊 Grammar query result:', {
        success: grammarResult.success,
        rowCount: grammarResult.rows?.length || 0,
        error: grammarResult.error || 'none'
      })

      const vocabularyIds = vocabResult.success ? vocabResult.rows.map((r) => r.id) : []
      const grammarIds = grammarResult.success ? grammarResult.rows.map((r) => r.id) : []

      console.log('[SessionManager] ✅ Selected items:', {
        vocabularyIds,
        grammarIds,
        totalItems: vocabularyIds.length + grammarIds.length
      })

      if (vocabularyIds.length === 0 && grammarIds.length === 0) {
        console.warn('[SessionManager] ⚠️ No vocabulary or grammar items found in database')
        console.warn('[SessionManager] ⚠️ Will generate random questions instead')
      }

      // 2. Tạo prompt để generate questions
      console.log('[SessionManager] 📝 Building prompt...')
      const prompt = buildQuestionsPrompt(vocabularyIds, grammarIds)
      console.log('[SessionManager] 📝 Prompt length:', prompt.length)
      console.log('[SessionManager] 📝 Prompt preview:', prompt.substring(0, 500))

      // 3. Gọi AI để tạo questions
      console.log('[SessionManager] 🔑 Getting Gemini API keys...')
      const apiKeysStr = await window.api!.storage.get('gemini_api_keys')
      console.log('[SessionManager] 🔍 API keys raw value:', apiKeysStr)
      console.log('[SessionManager] 🔍 API keys type:', typeof apiKeysStr)
      console.log('[SessionManager] 🔍 API keys length:', apiKeysStr?.length)

      if (!apiKeysStr) {
        console.error('[SessionManager] ❌ No Gemini API keys found in storage')
        throw new Error('No Gemini API keys found')
      }

      // Kiểm tra xem apiKeysStr đã là object hay chưa
      let apiKeys: any
      if (typeof apiKeysStr === 'string') {
        console.log('[SessionManager] 🔧 Parsing API keys from string...')
        try {
          apiKeys = JSON.parse(apiKeysStr)
        } catch (parseError) {
          console.error('[SessionManager] ❌ Failed to parse API keys string:', apiKeysStr)
          throw new Error('Invalid API keys format in storage')
        }
      } else if (typeof apiKeysStr === 'object') {
        console.log('[SessionManager] 🔧 API keys already an object, using directly')
        apiKeys = apiKeysStr
      } else {
        console.error('[SessionManager] ❌ Unexpected API keys type:', typeof apiKeysStr)
        throw new Error('Invalid API keys type in storage')
      }

      console.log('[SessionManager] 🔑 Processed API keys:', {
        isArray: Array.isArray(apiKeys),
        count: Array.isArray(apiKeys) ? apiKeys.length : 0,
        keys: Array.isArray(apiKeys)
          ? apiKeys.map((k: any) => ({
              hasKey: !!k.key,
              keyPreview: k.key?.substring(0, 10) + '...'
            }))
          : 'not an array'
      })

      if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
        console.error('[SessionManager] ❌ No valid API keys available')
        throw new Error('No valid API keys available')
      }

      const selectedKey = apiKeys[0]
      console.log('[SessionManager] 🔑 Using API key:', {
        hasKey: !!selectedKey.key,
        keyLength: selectedKey.key?.length || 0,
        keyPreview: selectedKey.key?.substring(0, 10) + '...'
      })

      const service = createCreateCollectionService(selectedKey.key)

      console.log('[SessionManager] 🤖 Generating questions with AI...')
      const textResponse = await service.generateQuestions(prompt)
      console.log('[SessionManager] 📦 Raw AI response length:', textResponse.length)
      console.log('[SessionManager] 📦 Raw AI response preview:', textResponse.substring(0, 500))

      // Parse JSON từ response với error handling tốt hơn
      let parsed: any
      try {
        // Thử match JSON block trong markdown
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/)
        console.log('[SessionManager] 🔍 JSON markdown block found:', !!jsonMatch)

        let jsonText = jsonMatch ? jsonMatch[1].trim() : textResponse.trim()
        console.log('[SessionManager] 📝 Extracted text length:', jsonText.length)
        console.log('[SessionManager] 📝 Extracted text preview:', jsonText.substring(0, 300))

        // Loại bỏ text thừa trước { và sau }
        const startIdx = jsonText.indexOf('{')
        const endIdx = jsonText.lastIndexOf('}')
        console.log('[SessionManager] 🎯 JSON boundaries:', { startIdx, endIdx })

        if (startIdx !== -1 && endIdx !== -1) {
          jsonText = jsonText.substring(startIdx, endIdx + 1)
          console.log('[SessionManager] ✂️ Trimmed JSON length:', jsonText.length)
          console.log('[SessionManager] ✂️ Trimmed JSON preview:', jsonText.substring(0, 300))
        }

        console.log('[SessionManager] 🔧 Attempting JSON.parse...')
        parsed = JSON.parse(jsonText)
        console.log('[SessionManager] ✅ JSON parsed successfully')
        console.log('[SessionManager] 📊 Parsed structure:', {
          hasQuestions: !!parsed.questions,
          questionsType: typeof parsed.questions,
          isArray: Array.isArray(parsed.questions),
          questionsCount: parsed.questions?.length || 0
        })
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

      console.log('[SessionManager] 🔢 Questions count:', parsed.questions.length)

      if (parsed.questions.length < 10) {
        console.warn(
          `[SessionManager] ⚠️ Only ${parsed.questions.length} questions generated, expected 10`
        )
      }

      // Validate các question có đủ trường bắt buộc không
      console.log('[SessionManager] 🔍 Starting question validation...')
      const validationErrors: string[] = []

      parsed.questions.forEach((q: any, index: number) => {
        console.log(`[SessionManager] 📝 Validating question ${index + 1}:`, {
          question_type: q.question_type,
          has_context: !!q.context,
          context_length: q.context?.length || 0,
          difficulty_level: q.difficulty_level,
          difficulty_type: typeof q.difficulty_level
        })

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

      console.log('[SessionManager] ✅ All questions validated successfully')
      console.log('[SessionManager] 📊 Generated questions:', parsed.questions.length)

      // 4. Xử lý questions (đã validate ở trên)
      console.log('[SessionManager] 🔧 Processing questions...')
      const questions = parsed.questions.map((q: any, index: number) => {
        const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`

        const systemFields = {
          id: questionId,
          vocabulary_item_ids: vocabularyIds.length > 0 ? vocabularyIds : [],
          grammar_points: grammarIds.length > 0 ? grammarIds : [],
          created_at: new Date().toISOString()
        }

        console.log(`[SessionManager] 📝 Processing question ${index + 1}:`, {
          question_type: q.question_type,
          has_vocabulary: vocabularyIds.length > 0,
          has_grammar: grammarIds.length > 0
        })

        const processedQuestion = {
          ...q,
          ...systemFields
        }

        console.log(`[SessionManager] ✅ Question ${index + 1} processed:`, {
          id: processedQuestion.id,
          question_type: processedQuestion.question_type,
          difficulty_level: processedQuestion.difficulty_level
        })

        return processedQuestion
      })

      console.log('[SessionManager] ✅ Processed questions:', questions.length)

      // 5. Tạo session và lưu questions
      const sessionService = getSessionService()
      const session = await sessionService.createSession(questions, 24)

      console.log('[SessionManager] Session created:', session.id)

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
      ensureApiAvailable()
      await window.api!.cloudDatabase.query('DELETE FROM sessions WHERE id = $1', [sessionId])
      await loadSessions()
    } catch (error) {
      console.error('[SessionManager] Error deleting session:', error)
      alert('Lỗi khi xóa session')
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
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card-background">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-text-secondary">Chưa có session nào</p>
            <p className="text-sm text-text-secondary mt-1">Nhấn "Tạo Session" để bắt đầu</p>
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
