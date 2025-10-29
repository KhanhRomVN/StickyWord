import { getCloudDatabase } from './CloudDatabaseService'
import { Session } from '../presentation/pages/Session/types'
import { Question } from '../presentation/pages/Session/types'
import { getSessionStorageService } from './SessionStorageService'

export class SessionService {
  /**
   * Thuật toán lựa chọn thông minh vocabulary/grammar items
   * Ưu tiên: mastery_score thấp, last_reviewed_at xa nhất
   */
  async selectSmartItems(count: number = 10): Promise<{
    vocabularyIds: string[]
    grammarIds: string[]
  }> {
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    // Lấy vocabulary items (50% số lượng)
    if (!window.api) throw new Error('Electron API not available')

    if (!window.api) throw new Error('Electron API not available')

    const vocabCount = Math.ceil(count * 0.5)
    const vocabResult = await window.api.cloudDatabase.query(
      `
      SELECT v.id
      FROM vocabulary_item v
      LEFT JOIN vocabulary_analytics va ON v.id = va.vocabulary_item_id
      ORDER BY 
        COALESCE(va.mastery_score, 0) ASC,
        COALESCE(va.last_reviewed_at, v.created_at) ASC
      LIMIT $1
      `,
      [vocabCount]
    )

    // Lấy grammar items (50% số lượng)
    const grammarCount = count - vocabCount
    if (!window.api) throw new Error('Electron API not available')

    const grammarResult = await window.api.cloudDatabase.query(
      `
      SELECT g.id
      FROM grammar_item g
      LEFT JOIN grammar_analytics ga ON g.id = ga.grammar_item_id
      ORDER BY 
        COALESCE(ga.mastery_score, 0) ASC,
        COALESCE(ga.last_reviewed_at, g.created_at) ASC
      LIMIT $1
      `,
      [grammarCount]
    )

    return {
      vocabularyIds: vocabResult.rows.map((r) => r.id),
      grammarIds: grammarResult.rows.map((r) => r.id)
    }
  }

  /**
   * Tạo session mới và lưu vào database
   */
  async createSession(questions: Question[], expiryHours: number = 24): Promise<Session> {
    const storageService = getSessionStorageService()

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000)

    // Tính toán total_score từ questions
    const totalScore = questions.reduce((sum, q) => sum + q.scores[0], 0) // Lấy điểm cao nhất

    // Trích xuất topics từ questions (nếu có)
    const topicsSet = new Set<string>()
    questions.forEach((q) => {
      if (q.vocabulary_item_ids) {
        topicsSet.add('vocabulary')
      }
      if (q.grammar_points) {
        topicsSet.add('grammar')
      }
    })

    const session: Session = {
      id: sessionId,
      title: `Auto Session ${new Date().toLocaleString('vi-VN')}`,
      description: `Session gồm ${questions.length} câu hỏi`,
      questions: questions,
      status: 'pending',
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      difficulty_level:
        questions.reduce((sum, q) => sum + q.difficulty_level, 0) / questions.length,
      total_score: totalScore,
      attempts_allowed: 1,
      target_language: 'en',
      source_language: 'vi',
      topics: Array.from(topicsSet)
    }

    await storageService.saveSession(session)
    return session
  }

  /**
   * Hoàn thành session và cập nhật expires_at
   */
  async completeSession(sessionId: string): Promise<void> {
    const storageService = getSessionStorageService()

    const session = await storageService.getSessionById(sessionId)
    if (!session) throw new Error(`Session not found: ${sessionId}`)

    const updatedSession: Session = {
      ...session,
      status: 'completed'
    }

    await storageService.updateSession(sessionId, updatedSession)
    await storageService.saveSessionToCloud(updatedSession)
  }

  /**
   * Lấy danh sách sessions
   */
  async getSessions(filterByExpired?: boolean): Promise<Session[]> {
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    let query = 'SELECT * FROM sessions'
    const params: any[] = []

    if (filterByExpired !== undefined) {
      if (filterByExpired) {
        query += ' WHERE expires_at < $1'
      } else {
        query += ' WHERE expires_at >= $1'
      }
      params.push(new Date().toISOString())
    }

    query += ' ORDER BY created_at DESC'

    if (!window.api) throw new Error('Electron API not available')

    const result = await window.api.cloudDatabase.query(query, params)

    if (!result.success) {
      throw new Error(result.error || 'Failed to get sessions')
    }

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title || `Session ${row.id.substring(0, 8)}`,
      description: row.description || '',
      questions: Array.isArray(row.questions) ? row.questions : [],
      status: row.status || 'pending',
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
  }
}

// Singleton instance
let sessionServiceInstance: SessionService | null = null

export const getSessionService = (): SessionService => {
  if (!sessionServiceInstance) {
    sessionServiceInstance = new SessionService()
  }
  return sessionServiceInstance
}
