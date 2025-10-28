import { DashboardAnalytics, WeeklyProgress } from '../types'
import { Session } from '../../Session/types'

// Fake Weekly Progress Data
const generateWeeklyProgress = (): WeeklyProgress[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date()

  return days.map((day, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))

    const questionsCompleted = Math.floor(Math.random() * 20) + 5
    const correctAnswers = Math.floor(questionsCompleted * (Math.random() * 0.3 + 0.6))
    const accuracy = (correctAnswers / questionsCompleted) * 100

    return {
      day,
      date: date.toISOString().split('T')[0],
      questionsCompleted,
      correctAnswers,
      studyTimeMinutes: Math.floor(Math.random() * 45) + 15,
      accuracy: Math.round(accuracy * 10) / 10
    }
  })
}

// Fake Analytics Data
export const FAKE_ANALYTICS: DashboardAnalytics = {
  totalVocabulary: 487,
  totalGrammar: 52,
  totalQuestions: 1243,
  totalSessions: 89,
  averageAccuracy: 78.5,
  studyStreak: 12,
  weeklyProgress: generateWeeklyProgress(),
  masteryDistribution: {
    beginner: 145,
    intermediate: 198,
    advanced: 112,
    mastered: 84
  }
}

// Fake Sessions Data
export const FAKE_SESSIONS: Session[] = [
  {
    id: 'session_001',
    title: 'Daily Practice #45',
    question_ids: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty_level: 5
  },
  {
    id: 'session_002',
    title: 'Grammar Review #12',
    question_ids: [],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty_level: 6
  },
  {
    id: 'session_003',
    title: 'Vocabulary Quiz #23',
    question_ids: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty_level: 4
  },
  {
    id: 'session_004',
    title: 'Advanced Practice #8',
    question_ids: [],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty_level: 8
  },
  {
    id: 'session_005',
    title: 'Quick Test #67',
    question_ids: [],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty_level: 3
  }
]
