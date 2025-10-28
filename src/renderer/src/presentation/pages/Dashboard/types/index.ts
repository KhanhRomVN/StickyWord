// === ANALYTICS TYPES ===
export interface DashboardAnalytics {
  totalVocabulary: number
  totalGrammar: number
  totalQuestions: number
  totalSessions: number
  averageAccuracy: number
  studyStreak: number
  weeklyProgress: WeeklyProgress[]
  masteryDistribution: MasteryDistribution
}

export interface WeeklyProgress {
  day: string
  date: string
  questionsCompleted: number
  correctAnswers: number
  studyTimeMinutes: number
  accuracy: number
}

export interface MasteryDistribution {
  beginner: number
  intermediate: number
  advanced: number
  mastered: number
}

// File: src/renderer/src/presentation/pages/Dashboard/types/collection-analytics.ts

export interface CollectionItemAnalytics {
  id: string
  content: string
  item_type: 'word' | 'phrase' | 'grammar'
  category?: string
  difficulty_level: number
  mastery_score: number
  total_attempts: number
  correct_attempts: number
  last_reviewed_at?: string
  created_at: string
  accuracy: number
  days_since_review: number
  trending_score: number
}

export interface CollectionAnalytics {
  needsReview: CollectionItemAnalytics[]
  recentlyAdded: CollectionItemAnalytics[]
  mostDifficult: CollectionItemAnalytics[]
  highPerformance: CollectionItemAnalytics[]
  lowPerformance: CollectionItemAnalytics[]
  trending: CollectionItemAnalytics[]
}

export interface CategoryStats {
  category: string
  total: number
  mastered: number
  needsReview: number
  averageAccuracy: number
}

export interface CollectionOverview {
  totalItems: number
  vocabularyCount: number
  grammarCount: number
  averageMastery: number
  itemsNeedingReview: number
  categoryStats: CategoryStats[]
}
