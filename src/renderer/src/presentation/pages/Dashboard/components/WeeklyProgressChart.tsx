import { WeeklyProgress } from '../types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface WeeklyProgressChartProps {
  weeklyProgress: WeeklyProgress[]
}

const WeeklyProgressChart = ({ weeklyProgress }: WeeklyProgressChartProps) => {
  const chartData = weeklyProgress.map((day) => ({
    day: day.day,
    'Câu hỏi': day.questionsCompleted,
    'Thời gian (phút)': day.studyTimeMinutes,
    'Độ chính xác (%)': day.accuracy
  }))

  return (
    <div className="bg-card-background border border-border-default rounded-lg p-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />

          <XAxis
            dataKey="day"
            className="text-xs text-text-secondary"
            tick={{ fill: 'currentColor' }}
          />

          <YAxis
            yAxisId="left"
            className="text-xs text-text-secondary"
            tick={{ fill: 'currentColor' }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs text-text-secondary"
            tick={{ fill: 'currentColor' }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card-background)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Câu hỏi"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Thời gian (phút)"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Độ chính xác (%)"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeeklyProgressChart
