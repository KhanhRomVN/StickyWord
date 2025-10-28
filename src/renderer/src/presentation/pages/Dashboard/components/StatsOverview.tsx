import { TrendingUp, BookOpen, MessageSquare, Flame } from 'lucide-react'

interface StatsOverviewProps {
  totalVocabulary: number
  totalGrammar: number
  averageAccuracy: number
  studyStreak: number
}

const StatsOverview = ({
  totalVocabulary,
  totalGrammar,
  averageAccuracy,
  studyStreak
}: StatsOverviewProps) => {
  const stats = [
    {
      label: 'Vocabulary',
      value: totalVocabulary,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Grammar',
      value: totalGrammar,
      icon: MessageSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Accuracy',
      value: `${averageAccuracy}%`,
      icon: TrendingUp,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
    {
      label: 'Streak',
      value: `${studyStreak} day`,
      icon: Flame,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10'
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card-background border border-border-default rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
            <p className="text-sm text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsOverview
