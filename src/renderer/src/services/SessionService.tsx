import { getCloudDatabase } from './CloudDatabaseService'
import { Session } from '../presentation/pages/Session/types'
import { Question } from '../presentation/pages/Question/types'

export class SessionService {
  /**
   * Lấy số session pending hiện tại
   */
  async getPendingSessionCount(): Promise<number> {
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    const result = await window.api.cloudDatabase.query(
      `SELECT COUNT(*) as count FROM sessions WHERE status = 'pending'`
    )

    if (!result.success) {
      throw new Error(result.error || 'Failed to get pending session count')
    }

    return parseInt(result.rows[0]?.count || '0')
  }

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
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000)

    // 1. Lưu questions vào database
    for (const question of questions) {
      await this.saveQuestion(question)
    }

    // 2. Tạo session
    const session: Session = {
      id: sessionId,
      question_ids: questions.map((q) => q.id),
      status: 'pending',
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    }

    const result = await window.api.cloudDatabase.query(
      `
      INSERT INTO sessions (
        id, question_ids, status, total_questions, 
        completed_questions, correct_answers, 
        created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        session.id,
        session.question_ids,
        session.status,
        questions.length,
        0,
        0,
        session.created_at,
        session.expires_at
      ]
    )

    if (!result.success) {
      throw new Error(result.error || 'Failed to create session')
    }

    console.log('[SessionService] ✅ Session created:', sessionId)
    return session
  }

  /**
   * Lưu question vào database
   */
  private async saveQuestion(question: Question): Promise<void> {
    const result = await window.api.cloudDatabase.query(
      `
      INSERT INTO questions (
        id, question_type, question_data, 
        difficulty_level, vocabulary_item_ids, grammar_item_ids, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        question.id,
        question.question_type,
        JSON.stringify(question),
        question.difficulty_level,
        question.vocabulary_item_ids || [],
        question.grammar_points || [],
        question.created_at
      ]
    )

    if (!result.success) {
      console.warn('[SessionService] Failed to save question:', result.error)
    }
  }

  /**
   * Cập nhật lịch sử answer khi user trả lời câu hỏi
   */
  async saveAnswer(
    questionId: string,
    sessionId: string,
    userAnswer: string,
    isCorrect: boolean,
    timeTaken?: number
  ): Promise<void> {
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    const answerId = `ans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 1. Lưu answer vào question_answers
    const answerResult = await window.api.cloudDatabase.query(
      `
      INSERT INTO question_answers (
        id, question_id, session_id, user_answer, 
        is_correct, time_taken_seconds, answered_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        answerId,
        questionId,
        sessionId,
        userAnswer,
        isCorrect,
        timeTaken || null,
        new Date().toISOString()
      ]
    )

    if (!answerResult.success) {
      console.warn('[SessionService] Failed to save answer:', answerResult.error)
    }

    // 2. Cập nhật thống kê question
    const updateQuestionResult = await window.api.cloudDatabase.query(
      `
      UPDATE questions SET
        total_attempts = total_attempts + 1,
        correct_attempts = correct_attempts + CASE WHEN $2 THEN 1 ELSE 0 END,
        incorrect_attempts = incorrect_attempts + CASE WHEN $2 THEN 0 ELSE 1 END,
        last_answered_at = $3
      WHERE id = $1
      `,
      [questionId, isCorrect, new Date().toISOString()]
    )

    if (!updateQuestionResult.success) {
      console.warn('[SessionService] Failed to update question stats:', updateQuestionResult.error)
    }

    console.log('[SessionService] ✅ Answer saved:', { questionId, isCorrect })
  }

  /**
   * Hoàn thành session và cập nhật status
   */
  async completeSession(
    sessionId: string,
    totalQuestions: number,
    correctAnswers: number
  ): Promise<void> {
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    const result = await window.api.cloudDatabase.query(
      `
      UPDATE sessions SET
        status = 'completed',
        completed_questions = $2,
        correct_answers = $3,
        completed_at = $4
      WHERE id = $1
      `,
      [sessionId, totalQuestions, correctAnswers, new Date().toISOString()]
    )

    if (!result.success) {
      throw new Error(result.error || 'Failed to complete session')
    }

    console.log('[SessionService] ✅ Session completed:', sessionId)
  }

  /**
   * Lấy danh sách sessions
   */
  async getSessions(status?: 'pending' | 'active' | 'completed' | 'expired'): Promise<Session[]> {
    const db = getCloudDatabase()
    if (!db) throw new Error('Database not connected')

    let query = 'SELECT * FROM sessions'
    const params: any[] = []

    if (status) {
      query += ' WHERE status = $1'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const result = await window.api.cloudDatabase.query(query, params)

    if (!result.success) {
      throw new Error(result.error || 'Failed to get sessions')
    }

    return result.rows.map((row) => ({
      id: row.id,
      question_ids: row.question_ids,
      status: row.status,
      created_at: row.created_at,
      started_at: row.started_at,
      completed_at: row.completed_at,
      expires_at: row.expires_at
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
