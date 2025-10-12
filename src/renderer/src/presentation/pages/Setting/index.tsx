import { useState } from 'react'
import CustomButton from '../../../components/common/CustomButton'
import ThemeDrawer from '../../../components/drawer/ThemeDrawer'
import GeminiApiKeySection from './components/GeminiApiKeySection'
import { Palette } from 'lucide-react'

const SettingPage = () => {
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false)

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Settings</h1>

        {/* Theme Settings Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Giao diện</h2>
          <div className="p-6 border border-border rounded-lg bg-card-background">
            <CustomButton
              variant="primary"
              size="md"
              icon={Palette}
              onClick={() => setIsThemeDrawerOpen(true)}
            >
              Theme Settings
            </CustomButton>
          </div>
        </div>

        {/* Gemini API Keys Section */}
        <GeminiApiKeySection />
      </div>

      {/* Theme Drawer */}
      <ThemeDrawer isOpen={isThemeDrawerOpen} onClose={() => setIsThemeDrawerOpen(false)} />
    </div>
  )
}

export default SettingPage
