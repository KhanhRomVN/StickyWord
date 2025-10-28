import { useState } from 'react'
import { BarChart3, TrendingUp, Eye, Download, Activity, CheckCircle } from 'lucide-react'
import CustomButton from '../../../../components/common/CustomButton'
import CustomBadge from '../../../../components/common/CustomBadge'

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

  const activeCount = Object.values(settings).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
          Analytics
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Theo dõi tiến độ và phân tích hiệu quả học tập
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Tính năng đang bật
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{activeCount}/4</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Theo dõi tiến độ
            </span>
          </div>
          <CustomBadge variant={settings.trackLearning ? 'success' : 'secondary'} size="sm">
            {settings.trackLearning ? 'Đang bật' : 'Đã tắt'}
          </CustomBadge>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Ghi nhận lỗi
            </span>
          </div>
          <CustomBadge variant={settings.trackMistakes ? 'success' : 'secondary'} size="sm">
            {settings.trackMistakes ? 'Đang bật' : 'Đã tắt'}
          </CustomBadge>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Theo dõi thời gian
            </span>
          </div>
          <CustomBadge variant={settings.trackTime ? 'success' : 'secondary'} size="sm">
            {settings.trackTime ? 'Đang bật' : 'Đã tắt'}
          </CustomBadge>
        </div>
      </div>

      {/* Tracking Options */}
      <div className="space-y-4">
        {/* Track Learning Progress */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Theo dõi tiến độ học</p>
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
        </div>

        {/* Track Mistakes */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:border-orange-400 dark:hover:border-orange-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Ghi nhận lỗi sai</p>
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
        </div>

        {/* Track Time */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Theo dõi thời gian</p>
                <p className="text-sm text-text-secondary">Ghi lại thời gian học mỗi day</p>
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
        </div>

        {/* Generate Reports */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:border-green-400 dark:hover:border-green-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Tạo báo cáo tự động</p>
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
      </div>

      {/* Export Button */}
      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text-primary">Xuất dữ liệu</h3>
            <p className="text-sm text-text-secondary">Tải xuống toàn bộ dữ liệu analytics</p>
          </div>
          <CustomBadge variant="info" size="sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sẵn sàng
          </CustomBadge>
        </div>
        <CustomButton variant="secondary" size="md" icon={Download} className="w-full">
          Xuất dữ liệu Analytics
        </CustomButton>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-start gap-3">
        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          📊 Dữ liệu analytics giúp bạn hiểu rõ điểm mạnh, điểm yếu và tối ưu lộ trình học
        </p>
      </div>
    </div>
  )
}

export default AnalyticsSection
