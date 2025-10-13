import { useState } from 'react'
import { Bell, Clock, Target, Zap } from 'lucide-react'
import CustomCombobox from '../../../../components/common/CustomCombobox'

const PopupBehaviorSection = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    frequency: '30',
    difficulty: 'adaptive',
    questionTypes: ['word', 'phrase', 'grammar'],
    priority: 'mastery'
  })

  const frequencyOptions = [
    { value: '15', label: 'Mỗi 15 phút' },
    { value: '30', label: 'Mỗi 30 phút' },
    { value: '60', label: 'Mỗi 1 giờ' },
    { value: '120', label: 'Mỗi 2 giờ' }
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
    { value: 'adaptive', label: 'Tự động điều chỉnh' }
  ]

  const questionTypeOptions = [
    { value: 'word', label: 'Từ vựng' },
    { value: 'phrase', label: 'Cụm từ' },
    { value: 'grammar', label: 'Ngữ pháp' },
    { value: 'pronunciation', label: 'Phát âm' }
  ]

  const priorityOptions = [
    { value: 'mastery', label: 'Độ thành thạo thấp' },
    { value: 'recent', label: 'Mới thêm gần đây' },
    { value: 'random', label: 'Ngẫu nhiên' },
    { value: 'spaced', label: 'Spaced Repetition' }
  ]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Đột xuất (Pop-up)</h2>
          <p className="text-sm text-text-secondary">
            Cấu hình câu hỏi xuất hiện khi bạn đang làm việc
          </p>
        </div>
      </div>

      <div className="p-6 border border-border rounded-lg bg-card-background space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-text-primary">Bật tính năng đột xuất</p>
              <p className="text-sm text-text-secondary">
                Hiển thị câu hỏi tự động trong khi làm việc
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frequency */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <label className="text-sm font-medium text-text-primary">Tần suất</label>
            </div>
            <CustomCombobox
              label=""
              value={settings.frequency}
              options={frequencyOptions}
              onChange={(val) =>
                setSettings((prev) => ({
                  ...prev,
                  frequency: typeof val === 'string' ? val : val[0]
                }))
              }
              size="sm"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <label className="text-sm font-medium text-text-primary">Độ khó</label>
            </div>
            <CustomCombobox
              label=""
              value={settings.difficulty}
              options={difficultyOptions}
              onChange={(val) =>
                setSettings((prev) => ({
                  ...prev,
                  difficulty: typeof val === 'string' ? val : val[0]
                }))
              }
              size="sm"
            />
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Loại câu hỏi</label>
          <CustomCombobox
            label=""
            value={settings.questionTypes}
            options={questionTypeOptions}
            onChange={(val) =>
              setSettings((prev) => ({
                ...prev,
                questionTypes: Array.isArray(val) ? val : [val]
              }))
            }
            multiple
            size="sm"
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Ưu tiên hiển thị</label>
          <CustomCombobox
            label=""
            value={settings.priority}
            options={priorityOptions}
            onChange={(val) =>
              setSettings((prev) => ({
                ...prev,
                priority: typeof val === 'string' ? val : val[0]
              }))
            }
            size="sm"
          />
        </div>

        {/* Info Box */}
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✨ AI sẽ tự động tạo câu hỏi dựa trên độ thành thạo và lịch sử học tập của bạn
          </p>
        </div>
      </div>
    </section>
  )
}

export default PopupBehaviorSection
