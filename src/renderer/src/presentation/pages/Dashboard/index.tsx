import { useState, useEffect } from 'react'
import SessionSection from './components/SessionSection'
import StatsOverview from './components/StatsOverview'
import WeeklyProgressChart from './components/WeeklyProgressChart'
import MasteryDistribution from './components/MasteryDistribution'
import { DashboardAnalytics } from './types'
import { Session } from '../Session/types'
import { FAKE_ANALYTICS, FAKE_SESSIONS } from './constants'

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      setAnalytics(FAKE_ANALYTICS)
      setSessions(FAKE_SESSIONS)
    } catch (error) {
      console.error('[DashboardPage] Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSession = (sessionId: string) => {
    window.location.hash = `#/session?sessionId=${sessionId}`
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">Track learning progress and manage</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Today</p>
            <p className="text-lg font-semibold text-text-primary">
              {new Date().toLocaleDateString('en-EN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Body - 2 Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Analytics (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {analytics && (
              <>
                <StatsOverview
                  totalVocabulary={analytics.totalVocabulary}
                  totalGrammar={analytics.totalGrammar}
                  totalQuestions={analytics.totalQuestions}
                  totalSessions={analytics.totalSessions}
                  averageAccuracy={analytics.averageAccuracy}
                  studyStreak={analytics.studyStreak}
                />

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-text-primary">Progress this week</h2>
                  <WeeklyProgressChart weeklyProgress={analytics.weeklyProgress} />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-text-primary">Level distribution</h2>
                  <MasteryDistribution masteryDistribution={analytics.masteryDistribution} />
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Sessions (1/3 width) */}
          <div className="lg:col-span-1">
            <SessionSection sessions={sessions} onStartSession={handleStartSession} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
