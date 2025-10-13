import { useState } from 'react'
import { Palette, Sparkles } from 'lucide-react'
import CustomButton from '../../../../components/common/CustomButton'
import ThemeDrawer from '../../../../components/drawer/ThemeDrawer'

const AppearanceSection = () => {
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false)

  return (
    <>
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Giao diện</h2>
            <p className="text-sm text-text-secondary">Tùy chỉnh màu sắc và theme của ứng dụng</p>
          </div>
        </div>

        <div className="p-6 border border-border rounded-lg bg-card-background">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-lg border border-pink-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-pink-500" />
              <div>
                <p className="font-medium text-text-primary">Tùy chỉnh Theme</p>
                <p className="text-sm text-text-secondary">
                  Thay đổi màu sắc và giao diện theo sở thích
                </p>
              </div>
            </div>
            <CustomButton
              variant="primary"
              size="md"
              icon={Palette}
              onClick={() => setIsThemeDrawerOpen(true)}
            >
              Mở Theme Settings
            </CustomButton>
          </div>
        </div>
      </section>

      {/* Theme Drawer */}
      <ThemeDrawer isOpen={isThemeDrawerOpen} onClose={() => setIsThemeDrawerOpen(false)} />
    </>
  )
}

export default AppearanceSection
