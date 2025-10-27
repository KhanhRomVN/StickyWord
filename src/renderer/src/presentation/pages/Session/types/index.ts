// === SESSION TYPES ===
export type SessionStatus = 'pending' | 'active' | 'completed' | 'expired'

export interface Session {
  id: string
  question_ids: string[]
  status: SessionStatus
  created_at: string
  started_at?: string
  completed_at?: string
  expires_at?: string
}
