import { Session } from '../presentation/pages/Session/types'

const SESSION_STORAGE_KEY = 'app_sessions'
const QUESTIONS_STORAGE_PREFIX = 'session_questions_'

export class SessionStorageService {
  /**
   * Lưu session vào localStorage
   */
  async saveSession(session: Session): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    try {
      const sessions = await this.getAllSessions()
      const existingIndex = sessions.findIndex((s) => s.id === session.id)

      if (existingIndex !== -1) {
        sessions[existingIndex] = session
      } else {
        sessions.push(session)
      }

      await window.api.storage.set(SESSION_STORAGE_KEY, sessions)

      console.log('[SessionStorageService] ✅ Session saved to localStorage:', session.id)
    } catch (error) {
      console.error('[SessionStorageService] ❌ Error saving session:', error)
      throw error
    }
  }

  /**
   * Lưu session hoàn thành vào cloud database
   */
  async saveSessionToCloud(session: Session): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    try {
      const query = `
      INSERT INTO sessions (
        id, title, questions, status, created_at,
        expires_at, difficulty_level, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        questions = EXCLUDED.questions,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at
    `

      const params = [
        session.id,
        session.title,
        JSON.stringify(session.questions),
        session.status,
        session.created_at,
        session.expires_at || null,
        session.difficulty_level,
        new Date().toISOString()
      ]

      const result = await window.api.cloudDatabase.query(query, params)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save session to cloud')
      }

      console.log('[SessionStorageService] ✅ Session saved to cloud database:', session.id)
    } catch (error) {
      console.error('[SessionStorageService] ❌ Error saving session to cloud:', error)
      throw error
    }
  }

  /**
   * Lấy tất cả sessions
   */
  async getAllSessions(): Promise<Session[]> {
    if (!window.api) throw new Error('Electron API not available')

    try {
      const sessions = await window.api.storage.get(SESSION_STORAGE_KEY)
      return Array.isArray(sessions) ? sessions : []
    } catch (error) {
      console.error('[SessionStorageService] ❌ Error getting sessions:', error)
      return []
    }
  }

  /**
   * Lấy session theo ID
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    const sessions = await this.getAllSessions()
    return sessions.find((s) => s.id === sessionId) || null
  }

  /**
   * Lấy sessions theo trạng thái (pending/completed/expired)
   */
  async getSessionsByStatus(filterByExpired?: boolean): Promise<Session[]> {
    const sessions = await this.getAllSessions()
    const now = new Date().toISOString()

    if (filterByExpired === undefined) {
      return sessions
    }

    return sessions.filter((session) => {
      if (!session.expires_at) return false

      if (filterByExpired) {
        return session.expires_at < now
      } else {
        return session.expires_at >= now
      }
    })
  }

  /**
   * Cập nhật session (ví dụ: đánh dấu completed)
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    try {
      const sessions = await this.getAllSessions()
      const index = sessions.findIndex((s) => s.id === sessionId)

      if (index === -1) {
        throw new Error(`Session not found: ${sessionId}`)
      }

      sessions[index] = { ...sessions[index], ...updates }
      await window.api.storage.set(SESSION_STORAGE_KEY, sessions)

      console.log('[SessionStorageService] ✅ Session updated:', sessionId)
    } catch (error) {
      console.error('[SessionStorageService] ❌ Error updating session:', error)
      throw error
    }
  }

  /**
   * Xóa session và questions liên quan
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    try {
      // 1. Xóa session
      const sessions = await this.getAllSessions()
      const filteredSessions = sessions.filter((s) => s.id !== sessionId)
      await window.api.storage.set(SESSION_STORAGE_KEY, filteredSessions)

      // 2. Xóa questions
      const storageKey = `${QUESTIONS_STORAGE_PREFIX}${sessionId}`
      await window.api.storage.remove(storageKey)

      console.log('[SessionStorageService] ✅ Session deleted:', sessionId)
    } catch (error) {
      console.error('[SessionStorageService] ❌ Error deleting session:', error)
      throw error
    }
  }

  /**
   * Đếm số lượng pending sessions
   */
  async countPendingSessions(): Promise<number> {
    const sessions = await this.getSessionsByStatus(false) // false = chưa hết hạn
    return sessions.length
  }
}

// Singleton instance
let sessionStorageInstance: SessionStorageService | null = null

export const getSessionStorageService = (): SessionStorageService => {
  if (!sessionStorageInstance) {
    sessionStorageInstance = new SessionStorageService()
  }
  return sessionStorageInstance
}
