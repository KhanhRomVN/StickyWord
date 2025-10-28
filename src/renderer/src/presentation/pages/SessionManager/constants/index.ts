import { Session } from '../../Session/types'

export const FAKE_SESSIONS_MANAGER: Session[] = [
  {
    id: 'session_001',
    question_ids: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'session_002',
    question_ids: ['q11', 'q12', 'q13', 'q14', 'q15'],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'session_003',
    question_ids: ['q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22', 'q23'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]
