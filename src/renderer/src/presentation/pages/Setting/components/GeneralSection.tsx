import { useState } from 'react'
import { Settings, Globe, Volume2, Keyboard } from 'lucide-react'
import CustomCombobox from '../../../../components/common/CustomCombobox'

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

  const shortcutOptions = [
    { value: 'ctrl+shift+s', label: 'Ctrl + Shift + S' },
    { value: 'ctrl+alt+s', label: 'Ctrl + Alt + S' },
    { value: 'alt+shift+s', label: 'Alt + Shift + S' }
  ]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-500/10 rounded-lg">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Cài đặt chung</h2>
          <p className="text-sm text-text-secondary">Các tùy chọn cơ bản của ứng dụng</p>
        </div>
      </div>

      <div className="p-6 border border-border rounded-lg bg-card-background space-y-4">
        {/* Language */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <label className="text-sm font-medium text-text-primary">Ngôn ngữ giao diện</label>
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
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-text-primary">Âm thanh</p>
              <p className="text-sm text-text-secondary">Bật/tắt âm thanh thông báo</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => setSettings((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Auto Start */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-text-primary">Tự động khởi động</p>
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

        {/* Shortcut Key */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-orange-500" />
            <label className="text-sm font-medium text-text-primary">Phím tắt</label>
          </div>
          <CustomCombobox
            label=""
            value={settings.shortcutKey}
            options={shortcutOptions}
            onChange={(val) =>
              setSettings((prev) => ({
                ...prev,
                shortcutKey: typeof val === 'string' ? val : val[0]
              }))
            }
            size="sm"
          />
          <p className="text-xs text-text-secondary mt-1">
            Dùng phím tắt để nhanh chóng mở/đóng popup
          </p>
        </div>
      </div>
    </section>
  )
}

export default GeneralSection
