import { useState } from 'react'
import CustomButton from '../../../components/common/CustomButton'
import ThemeDrawer from '../../../components/drawer/ThemeDrawer'
import { Palette } from 'lucide-react'

const SettingPage = () => {
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false)

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

        <div className="space-y-4">
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

      <ThemeDrawer isOpen={isThemeDrawerOpen} onClose={() => setIsThemeDrawerOpen(false)} />
    </div>
  )
}

export default SettingPage
