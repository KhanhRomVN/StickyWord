import { Settings as SettingsIcon } from 'lucide-react'
import AppearanceSection from './components/AppearanceSection'
import GeminiApiKeySection from './components/GeminiApiKeySection'
import DatabaseSection from './components/DatabaseSection'
import PopupBehaviorSection from './components/PopupBehaviorSection'
import AnalyticsSection from './components/AnalyticsSection'
import GeneralSection from './components/GeneralSection'

const SettingPage = () => {
  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
              <p className="text-text-secondary mt-1">
                Quản lý cài đặt và tùy chỉnh ứng dụng theo ý muốn
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid Layout */}
        <div className="space-y-6">
          {/* Row 1: General + Appearance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <GeneralSection />
            </div>
            <div>
              <AppearanceSection />
            </div>
          </div>

          {/* Row 2: Database (Full Width) */}
          <DatabaseSection />

          {/* Row 3: Gemini API (Full Width) */}
          <GeminiApiKeySection />

          {/* Row 4: Popup Behavior (Full Width) */}
          <PopupBehaviorSection />

          {/* Row 5: Analytics (Full Width) */}
          <AnalyticsSection />
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center text-sm text-text-secondary">
            <p>StickyWord v1.0.0</p>
            <p className="mt-1">Made with ❤️ for language learners | © 2025 All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingPage
