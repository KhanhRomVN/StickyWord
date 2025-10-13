import { useState } from 'react'
import { BarChart3, TrendingUp, Eye, Download } from 'lucide-react'
import CustomButton from '../../../../components/common/CustomButton'

const AnalyticsSection = () => {
  const [settings, setSettings] = useState({
    trackLearning: true,
    trackMistakes: true,
    trackTime: true,
    generateReports: true
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Analytics</h2>
          <p className="text-sm text-text-secondary">
            Theo dõi tiến độ và phân tích hiệu quả học tập
          </p>
        </div>
      </div>

      <div className="p-6 border border-border rounded-lg bg-card-background space-y-4">
        {/* Tracking Options */}
        <div className="space-y-3">
          {/* Track Learning Progress */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-text-primary">Theo dõi tiến độ học</p>
                <p className="text-sm text-text-secondary">Lưu lịch sử và độ thành thạo</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trackLearning}
                onChange={() => toggleSetting('trackLearning')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Track Mistakes */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-text-primary">Ghi nhận lỗi sai</p>
                <p className="text-sm text-text-secondary">Phân tích các lỗi thường gặp</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trackMistakes}
                onChange={() => toggleSetting('trackMistakes')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Track Time */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-text-primary">Theo dõi thời gian</p>
                <p className="text-sm text-text-secondary">Ghi lại thời gian học mỗi ngày</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trackTime}
                onChange={() => toggleSetting('trackTime')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Generate Reports */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-text-primary">Tạo báo cáo tự động</p>
                <p className="text-sm text-text-secondary">Báo cáo hàng tuần/tháng</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.generateReports}
                onChange={() => toggleSetting('generateReports')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-border">
          <CustomButton variant="secondary" size="md" icon={Download} className="w-full">
            Xuất dữ liệu Analytics
          </CustomButton>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📊 Dữ liệu analytics giúp bạn hiểu rõ điểm mạnh, điểm yếu và tối ưu lộ trình học
          </p>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsSection
