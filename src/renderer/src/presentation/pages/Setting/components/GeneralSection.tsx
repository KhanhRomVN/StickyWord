import { useState } from 'react'
import { Settings, Globe, Volume2, Zap, Monitor } from 'lucide-react'
import CustomCombobox from '../../../../components/common/CustomCombobox'
import CustomBadge from '../../../../components/common/CustomBadge'

const GeneralSection = () => {
  const [settings, setSettings] = useState({
    language: 'vi',
    soundEnabled: true,
    autoStart: false,
    shortcutKey: 'ctrl+shift+s'
  })

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          Cài đặt chung
        </h2>
        <p className="text-sm text-text-secondary mt-1">Các tùy chọn cơ bản của ứng dụng</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Ngôn ngữ</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {languageOptions.find((opt) => opt.value === settings.language)?.label}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Âm thanh
            </span>
          </div>
          <CustomBadge variant={settings.soundEnabled ? 'success' : 'secondary'} size="sm">
            {settings.soundEnabled ? 'Bật' : 'Tắt'}
          </CustomBadge>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Tự động khởi động
            </span>
          </div>
          <CustomBadge variant={settings.autoStart ? 'success' : 'secondary'} size="sm">
            {settings.autoStart ? 'Đang bật' : 'Đã tắt'}
          </CustomBadge>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Language */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">Ngôn ngữ giao diện</h3>
              <p className="text-sm text-text-secondary">Chọn ngôn ngữ hiển thị</p>
            </div>
          </div>
          <CustomCombobox
            label=""
            value={settings.language}
            options={languageOptions}
            onChange={(val) =>
              setSettings((prev) => ({
                ...prev,
                language: typeof val === 'string' ? val : val[0]
              }))
            }
            size="sm"
          />
        </div>

        {/* Sound */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Âm thanh</p>
                <p className="text-sm text-text-secondary">Bật/tắt âm thanh thông báo</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, soundEnabled: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Auto Start */}
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Tự động khởi động</p>
                <p className="text-sm text-text-secondary">Mở app khi khởi động máy tính</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoStart: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-start gap-3">
        <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Các cài đặt này sẽ được lưu tự động và áp dụng cho toàn bộ ứng dụng.
        </p>
      </div>
    </div>
  )
}

export default GeneralSection
