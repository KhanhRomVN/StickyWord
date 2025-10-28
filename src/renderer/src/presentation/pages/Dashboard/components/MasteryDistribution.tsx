import { MasteryDistribution as MasteryDistributionType } from '../types'

interface MasteryDistributionProps {
  masteryDistribution: MasteryDistributionType
}

const MasteryDistribution = ({ masteryDistribution }: MasteryDistributionProps) => {
  const items = [
    { label: 'Beginner', value: masteryDistribution.beginner, color: 'bg-blue-500' },
    { label: 'Intermediate', value: masteryDistribution.intermediate, color: 'bg-green-500' },
    { label: 'Advanced', value: masteryDistribution.advanced, color: 'bg-orange-500' },
    { label: 'Mastered', value: masteryDistribution.mastered, color: 'bg-purple-500' }
  ]

  const total = Object.values(masteryDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-card-background border border-border-default rounded-lg p-6">
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = (item.value / total) * 100

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {item.value} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MasteryDistribution
