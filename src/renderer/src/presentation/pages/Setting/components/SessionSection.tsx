import { useState, useEffect } from 'react'
import { Bell, Clock, Zap, Layout, AlertCircle } from 'lucide-react'
import CustomCombobox from '../../../../components/common/CustomCombobox'
import CustomBadge from '../../../../components/common/CustomBadge'
import CustomInput from '../../../../components/common/CustomInput'
import CustomButton from '../../../../components/common/CustomButton'
import { AutoSessionConfig } from '../../Dashboard/services/AutoSessionService'
import SessionPopup from '../../Dashboard/components/SessionPopup'
import { Session } from '../../SessionPopup/types'

interface ExtendedSessionConfig extends AutoSessionConfig {
  popup_behavior: 'surprise' | 'notification' | 'silent'
  require_user_active: boolean
}

const SessionSection = () => {
  const [config, setConfig] = useState<ExtendedSessionConfig>({
    enabled: false,
    interval_minutes: 30,
    popup_behavior: 'notification',
    require_user_active: true,
    max_pending_sessions: 3,
    session_expiry_hours: 24,
    question_count: 10
  })

  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testCountdown, setTestCountdown] = useState(0)
  const [showTestPopup, setShowTestPopup] = useState(false)
  const [testSession, setTestSession] = useState<Session | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      if (!window.api) {
        console.error('[SessionSection] window.api is not available')
        return
      }
      const savedConfig = await window.api.storage.get('auto_session_config')
      if (savedConfig) {
        setConfig(savedConfig)
      }
    } catch (error) {
      console.error('[SessionSection] Error loading config:', error)
    }
  }

  const saveConfig = async () => {
    try {
      setIsSaving(true)
      setSaveStatus('idle')

      if (!window.api) {
        console.error('[SessionSection] window.api is not available')
        setSaveStatus('error')
        return
      }

      console.log('[SessionSection] 💾 Saving config:', config)
      await window.api.storage.set('auto_session_config', config)

      setSaveStatus('success')
      console.log('[SessionSection] ✅ Config saved, reloading app...')

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('[SessionSection] ❌ Error saving config:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestSession = async () => {
    try {
      setIsTestRunning(true)
      setTestCountdown(10)
      console.log('[SessionSection] 🧪 Test mode: Creating session in 10 seconds...')

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setTestCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Wait 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Generate mock questions
      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        id: `test_q_${Date.now()}_${i}`,
        question_type: 'choice_one' as const,
        question_text: `Test question ${i + 1}: Which word is correct?`,
        options: [
          { id: 'a', text: 'Option A' },
          { id: 'b', text: 'Option B' },
          { id: 'c', text: 'Option C' },
          { id: 'd', text: 'Option D' }
        ],
        correct_option_id: 'a',
        difficulty_level: (Math.floor(Math.random() * 5) + 3) as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10,
        vocabulary_item_ids: [],
        grammar_points: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Create test session
      const testSession = {
        id: `test_session_${Date.now()}`,
        question_ids: mockQuestions.map((q) => q.id),
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      // Save to localStorage
      const sessionsStr = localStorage.getItem('practice_sessions')
      const sessions = sessionsStr ? JSON.parse(sessionsStr) : []
      sessions.push(testSession)
      localStorage.setItem('practice_sessions', JSON.stringify(sessions))

      // Save questions
      const questionsKey = `session_questions_${testSession.id}`
      localStorage.setItem(questionsKey, JSON.stringify(mockQuestions))

      console.log('[SessionSection] ✅ Test session created:', testSession.id)

      // Hiển thị popup dựa trên config
      if (config.popup_behavior === 'surprise') {
        console.log('[SessionSection] 🎉 Opening surprise popup window...')
        if (!window.api) {
          console.error('[SessionSection] window.api is not available')
          alert('❌ window.api không khả dụng')
          return
        }
        const result = await window.api.popup.showSession(testSession)
        if (result.success) {
          console.log('[SessionSection] ✅ Popup window opened successfully')
        } else {
          console.error('[SessionSection] ❌ Failed to open popup:', result.error)
          alert('❌ Failed to open popup window. Check console.')
        }
      } else if (config.popup_behavior === 'notification') {
        console.log('[SessionSection] 🔔 Showing notification (modal)...')
        setTestSession(testSession)
        setShowTestPopup(true)
      } else {
        console.log('[SessionSection] 🤫 Silent mode - no popup shown')
        alert('✅ Test session created silently. Check Dashboard.')
      }
    } catch (error) {
      console.error('[SessionSection] ❌ Test failed:', error)
      alert('❌ Test failed. Check console for details.')
    } finally {
      setIsTestRunning(false)
      setTestCountdown(0)
    }
  }

  const handleStartTestSession = () => {
    console.log('[SessionSection] 🎯 Starting test session:', testSession?.id)
    setShowTestPopup(false)
    // Navigate to question page
    window.location.hash = '#/questions'
  }

  const handleCloseTestPopup = () => {
    console.log('[SessionSection] ❌ Test popup closed')
    setShowTestPopup(false)
    setTestSession(null)
  }

  const intervalOptions = [
    { value: '1', label: '1 phút' },
    { value: '15', label: '15 phút' },
    { value: '30', label: '30 phút' },
    { value: '45', label: '45 phút' },
    { value: '60', label: '1 giờ' },
    { value: '120', label: '2 giờ' },
    { value: '180', label: '3 giờ' }
  ]

  const popupBehaviorOptions = [
    { value: 'surprise', label: 'Popup đột xuất (giữa màn hình)' },
    { value: 'notification', label: 'Thông báo (góc màn hình)' },
    { value: 'silent', label: 'Im lặng (không hiển thị)' }
  ]

  const getStatusInfo = () => {
    if (!config.enabled) {
      return {
        label: 'Đã tắt',
        variant: 'secondary' as const,
        description: 'Tính năng tự động tạo session đang tắt'
      }
    }

    return {
      label: 'Đang bật',
      variant: 'success' as const,
      description: `Tạo session mới mỗi ${config.interval_minutes} phút`
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          Đột xuất (Auto Session)
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Cấu hình tự động tạo session luyện tập định kỳ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Trạng thái
            </span>
          </div>
          <CustomBadge variant={statusInfo.variant} size="sm">
            {statusInfo.label}
          </CustomBadge>
          <p className="text-xs text-text-secondary mt-2">{statusInfo.description}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Tần suất</span>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {config.interval_minutes} phút
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Cách hiển thị
            </span>
          </div>
          <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
            {popupBehaviorOptions.find((opt) => opt.value === config.popup_behavior)?.label || ''}
          </p>
        </div>
      </div>

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Bật tính năng tự động</p>
              <p className="text-sm text-text-secondary">
                Tự động tạo session luyện tập theo lịch trình
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-600"></div>
          </label>
        </div>
      </div>

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <label className="font-semibold text-text-primary">Tần suất tạo session</label>
        </div>
        <CustomCombobox
          label=""
          value={config.interval_minutes.toString()}
          options={intervalOptions}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              interval_minutes: parseInt(typeof val === 'string' ? val : val[0])
            }))
          }
          size="sm"
        />
        <p className="text-xs text-text-secondary mt-2">
          Session mới sẽ được tạo tự động sau mỗi khoảng thời gian này
        </p>
      </div>

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-purple-500" />
          <label className="font-semibold text-text-primary">Cách hiển thị session</label>
        </div>
        <CustomCombobox
          label=""
          value={config.popup_behavior}
          options={popupBehaviorOptions}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              popup_behavior: (typeof val === 'string' ? val : val[0]) as
                | 'surprise'
                | 'notification'
                | 'silent'
            }))
          }
          size="sm"
        />
        <p className="text-sm text-text-secondary mt-3">
          {config.popup_behavior === 'surprise' &&
            '🎉 Popup xuất hiện đột ngột ở giữa màn hình, thu hút sự chú ý'}
          {config.popup_behavior === 'notification' &&
            '🔔 Thông báo nhỏ gọn ở góc màn hình, ít gây gián đoạn'}
          {config.popup_behavior === 'silent' && '🤫 Session được tạo thầm lặng, không hiển thị gì'}
        </p>
      </div>

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-green-500" />
          <label className="font-semibold text-text-primary">Số câu hỏi mỗi session</label>
        </div>
        <CustomInput
          value={config.question_count.toString()}
          onChange={(val) =>
            setConfig((prev) => ({ ...prev, question_count: parseInt(val) || 10 }))
          }
          placeholder="10"
          size="sm"
          min="5"
          max="50"
        />
        <p className="text-xs text-text-secondary mt-2">
          Mỗi session sẽ có {config.question_count} câu hỏi ngẫu nhiên (5-50 câu)
        </p>
      </div>

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <label className="font-semibold text-text-primary">Cài đặt nâng cao</label>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Yêu cầu user đang active</p>
              <p className="text-xs text-text-secondary">
                Chỉ tạo session khi phát hiện user đang sử dụng app
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.require_user_active}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, require_user_active: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary block mb-2">
              Số session chờ tối đa
            </label>
            <CustomInput
              value={config.max_pending_sessions.toString()}
              onChange={(val) =>
                setConfig((prev) => ({ ...prev, max_pending_sessions: parseInt(val) || 3 }))
              }
              placeholder="3"
              size="sm"
              min="1"
              max="10"
            />
            <p className="text-xs text-text-secondary mt-1">
              Dừng tạo session mới khi đạt giới hạn này
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary block mb-2">
              Thời gian hết hạn session (giờ)
            </label>
            <CustomInput
              value={config.session_expiry_hours.toString()}
              onChange={(val) =>
                setConfig((prev) => ({ ...prev, session_expiry_hours: parseInt(val) || 24 }))
              }
              placeholder="24"
              size="sm"
              min="1"
              max="168"
            />
            <p className="text-xs text-text-secondary mt-1">
              Session chưa làm sẽ tự động hết hạn sau thời gian này
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card-background rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <label className="font-semibold text-text-primary">Test Mode</label>
            <p className="text-xs text-text-secondary">
              Tạo session thử nghiệm với 10 câu hỏi mock sau 10 giây
            </p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-700 dark:text-orange-300">
              <p className="font-medium mb-1">Chức năng này dùng để test:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Kiểm tra luồng tạo session tự động</li>
                <li>Xem cách session được lưu vào localStorage</li>
                <li>Test popup/notification hiển thị</li>
                <li>Session sẽ xuất hiện trong Dashboard sau 10 giây</li>
              </ul>
            </div>
          </div>
        </div>

        {testCountdown > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                Tạo session sau: {testCountdown}s
              </span>
            </div>
          </div>
        )}

        <CustomButton
          variant="secondary"
          size="md"
          onClick={handleTestSession}
          disabled={isTestRunning}
          loading={isTestRunning}
          className="w-full"
        >
          {isTestRunning
            ? `Đang tạo test session... (${testCountdown}s)`
            : '🧪 Chạy Test Session (10s)'}
        </CustomButton>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-default">
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Đã lưu thành công!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Lỗi khi lưu cấu hình
            </span>
          )}
        </div>
        <CustomButton
          variant="primary"
          size="sm"
          onClick={saveConfig}
          disabled={isSaving}
          loading={isSaving}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </CustomButton>
      </div>

      {/* Test Session Popup */}
      {showTestPopup && testSession && (
        <SessionPopup
          session={testSession}
          onStart={handleStartTestSession}
          onClose={handleCloseTestPopup}
        />
      )}
    </div>
  )
}

export default SessionSection
