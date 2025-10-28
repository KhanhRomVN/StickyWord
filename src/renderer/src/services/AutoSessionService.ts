import { Session } from '../presentation/pages/Session/types'
import { Question } from '../presentation/pages/Question/types'
import { createCreateCollectionService } from '../presentation/pages/Collection/services/CreateCollectionService'

export interface AutoSessionConfig {
  enabled: boolean
  interval_minutes: number
  max_pending_sessions: number
  session_expiry_hours: number
  question_count: number
  difficulty_range?: [number, number]
}

export class AutoSessionService {
  private intervalId: NodeJS.Timeout | null = null
  private onSessionCreated?: (session: Session) => void
  private readonly intervalMinutes: number
  private readonly maxPendingSessions: number
  private readonly sessionExpiryHours: number
  private readonly questionCount: number
  private readonly difficultyRange?: [number, number]

  constructor(config: AutoSessionConfig, onSessionCreated?: (session: Session) => void) {
    this.intervalMinutes = config.interval_minutes
    this.maxPendingSessions = config.max_pending_sessions
    this.sessionExpiryHours = config.session_expiry_hours
    this.questionCount = config.question_count
    this.difficultyRange = config.difficulty_range
    this.onSessionCreated = onSessionCreated
  }

  start() {
    const intervalMs = this.intervalMinutes * 60 * 1000
    const nextRunTime = new Date(Date.now() + intervalMs)

    console.log('[AutoSessionService] 🚀 Starting auto-create loop...', {
      interval_minutes: this.intervalMinutes,
      interval_ms: intervalMs,
      next_run_at: nextRunTime.toLocaleString('vi-VN'),
      max_pending: this.maxPendingSessions,
      question_count: this.questionCount
    })

    // Tạo session ngay lập tức lần đầu (optional)
    this.createAutoSession()

    this.intervalId = setInterval(async () => {
      const now = new Date()
      console.log('[AutoSessionService] ⏰ Timer triggered at:', now.toLocaleString('vi-VN'))
      await this.createAutoSession()
    }, intervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[AutoSessionService] Stopped auto-create loop')
    }
  }

  private async createAutoSession() {
    const startTime = Date.now()
    console.log('[AutoSessionService] 📝 Creating auto session...', {
      timestamp: new Date().toLocaleString('vi-VN'),
      config: {
        interval_minutes: this.intervalMinutes,
        max_pending: this.maxPendingSessions,
        question_count: this.questionCount
      }
    })

    try {
      const pendingSessions = await this.getPendingSessions()
      console.log('[AutoSessionService] 📊 Pending sessions check:', {
        current: pendingSessions.length,
        max: this.maxPendingSessions,
        can_create: pendingSessions.length < this.maxPendingSessions
      })

      if (pendingSessions.length >= this.maxPendingSessions) {
        console.log('[AutoSessionService] ⛔ Max pending sessions reached, skipping')
        return
      }

      console.log('[AutoSessionService] 🤖 Generating questions with AI...')
      const questions = await this.generateQuestionsWithAI()

      if (questions.length === 0) {
        console.warn('[AutoSessionService] ⚠️ No questions generated')
        return
      }

      console.log('[AutoSessionService] ✅ Generated questions:', questions.length)

      // 🔥 Lưu session vào cloud database
      console.log('[AutoSessionService] 💾 Saving session to cloud database...')
      const session = await sessionService.createSession(questions, this.sessionExpiryHours)

      console.log('[AutoSessionService] ✅ Session saved:', {
        session_id: session.id,
        question_count: questions.length,
        expires_at: new Date(session.expires_at).toLocaleString('vi-VN')
      })

      // Hiển thị popup window nếu behavior là 'surprise'
      const configStr = await window.api.storage.get('auto_session_config')
      const config = configStr || {}

      if (config.popup_behavior === 'surprise') {
        console.log('[AutoSessionService] 🚀 Showing surprise popup window...')
        await window.api.popup.showSession(session)
      }

      this.onSessionCreated?.(session)

      const duration = Date.now() - startTime
      console.log('[AutoSessionService] ✅ Session created successfully:', {
        session_id: session.id,
        duration_ms: duration,
        next_run_in: `${this.intervalMinutes} minutes`
      })
    } catch (error) {
      console.error('[AutoSessionService] Error creating auto session:', error)
    }
  }

  private async generateQuestionsWithAI(
    vocabularyIds: string[],
    grammarIds: string[]
  ): Promise<Question[]> {
    try {
      console.log('[AutoSessionService] 🤖 Fetching API keys...')
      const apiKeysStr = localStorage.getItem('gemini_api_keys')
      if (!apiKeysStr) {
        console.warn('[AutoSessionService] ⚠️ No Gemini API keys found')
        return []
      }

      const apiKeys = JSON.parse(apiKeysStr)
      if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
        console.warn('[AutoSessionService] ⚠️ No valid API keys available')
        return []
      }

      const selectedKey = apiKeys[0]
      console.log('[AutoSessionService] ✅ Using API key:', {
        name: selectedKey.name,
        key_preview: selectedKey.key.substring(0, 10) + '...'
      })

      const service = createCreateCollectionService(selectedKey.key)
      const prompt = this.buildQuestionsPrompt()

      console.log('[AutoSessionService] 📤 Sending prompt to Gemini API...')
      console.log('[AutoSessionService] 📝 Prompt preview:', prompt.substring(0, 200) + '...')

      const textResponse = await service.generateQuestions(prompt)

      console.log('[AutoSessionService] 📥 Received response from API')
      console.log(
        '[AutoSessionService] 📝 Response preview:',
        textResponse.substring(0, 300) + '...'
      )

      // Parse JSON từ response
      const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/)
      const jsonText = jsonMatch ? jsonMatch[1] : textResponse

      console.log('[AutoSessionService] 🔍 Parsing JSON...')
      const parsed = JSON.parse(jsonText)

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.warn('[AutoSessionService] ⚠️ Invalid questions format from AI:', parsed)
        return []
      }

      console.log('[AutoSessionService] ✅ Successfully parsed questions:', parsed.questions.length)

      const questions: Question[] = parsed.questions.map((q: any, index: number) => {
        const question: Question = {
          ...q,
          id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          difficulty_level: q.difficulty_level || 5,
          vocabulary_item_ids: vocabularyIds.slice(0, 2),
          grammar_points: grammarIds.slice(0, 2)
        }

        console.log(`[AutoSessionService] 📋 Question ${index + 1}:`, {
          type: question.question_type,
          difficulty: question.difficulty_level
        })

        return question
      })

      console.log(`[AutoSessionService] ✅ Generated ${questions.length} questions from AI`)
      return questions
    } catch (error) {
      console.error('[AutoSessionService] ❌ Error generating questions:', error)
      if (error instanceof Error) {
        console.error('[AutoSessionService] ❌ Error details:', {
          message: error.message,
          stack: error.stack
        })
      }
      return []
    }
  }

  private buildQuestionsPrompt(): string {
    return `Generate ${this.questionCount} diverse English learning questions with random topics and question types.

**Requirements:**
- Difficulty range: ${this.difficultyRange ? `${this.difficultyRange[0]}-${this.difficultyRange[1]}/10` : '3-7/10 (mixed)'}
- Question types: Mix of lexical_fix, grammar_transformation, translate, gap_fill, choice_one, choice_multi
- Topics: Randomly choose from daily life, work, travel, education, technology, health, etc.
- Each question MUST be unique and high quality

**Question Type Details:**

1. **lexical_fix**: Find and fix incorrect word
   - incorrect_sentence, incorrect_word, correct_word, correct_sentence
   - error_type: 'wrong_word' | 'wrong_form' | 'wrong_collocation' | 'confused_word'
   - hint, explanation

2. **grammar_transformation**: Transform sentence structure
   - original_sentence, transformation_instruction, correct_answer
   - grammar_focus: 'passive' | 'tense_change' | 'conditional' | 'reported_speech'
   - alternative_answers (array), hint, explanation

3. **translate**: Vietnamese to English
   - source_sentence (Vietnamese), source_language: 'vi'
   - correct_translation, alternative_translations (array)
   - hint, key_vocabulary (array)

4. **gap_fill**: Fill in blanks
   - sentence_with_gaps (use ____ for gaps)
   - gaps: [{ position: number, correct_answer: string, alternative_answers: [] }]
   - word_bank (optional array), hint

5. **choice_one**: Single choice question
   - question_text, options: [{ id: string, text: string }]
   - correct_option_id, hint, explanation

6. **choice_multi**: Multiple choice question
   - question_text, options: [{ id: string, text: string }]
   - correct_option_ids (array), hint, explanation

**Output Format (strict JSON):**
\`\`\`json
{
  "questions": [
    {
      "question_type": "lexical_fix",
      "incorrect_sentence": "I am very interesting in learning English.",
      "incorrect_word": "interesting",
      "correct_word": "interested",
      "correct_sentence": "I am very interested in learning English.",
      "error_type": "wrong_form",
      "hint": "Think about adjectives ending in -ed vs -ing",
      "explanation": "Use 'interested' for feelings, 'interesting' for things.",
      "difficulty_level": 3
    },
    {
      "question_type": "translate",
      "source_sentence": "Tôi thường đi bộ đến trường mỗi day.",
      "source_language": "vi",
      "correct_translation": "I usually walk to school every day.",
      "alternative_translations": ["I walk to school every day.", "I often walk to school daily."],
      "hint": "Use present simple for habits",
      "difficulty_level": 4
    }
  ]
}
\`\`\`

Generate NOW with diverse topics and question types. Return ONLY valid JSON, no explanation.`
  }
}

let autoSessionServiceInstance: AutoSessionService | null = null

export const getAutoSessionService = (
  config: AutoSessionConfig,
  onSessionCreated?: (session: Session) => void
): AutoSessionService => {
  if (!autoSessionServiceInstance) {
    autoSessionServiceInstance = new AutoSessionService(config, onSessionCreated)
  }
  return autoSessionServiceInstance
}

export const destroyAutoSessionService = () => {
  if (autoSessionServiceInstance) {
    autoSessionServiceInstance.stop()
    autoSessionServiceInstance = null
  }
}
