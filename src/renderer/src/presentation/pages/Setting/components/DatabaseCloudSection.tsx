import { useState, useEffect } from 'react'
import { Database, CheckCircle, XCircle, RefreshCw, AlertCircle, Trash2 } from 'lucide-react'
import CustomInput from '../../../../components/common/CustomInput'
import CustomButton from '../../../../components/common/CustomButton'
import CustomBadge from '../../../../components/common/CustomBadge'
import { useDatabase } from '../../../providers/database-provider'

const DatabaseCloudSection = () => {
  const { isConnected, isLoading, error, connectionString, connect, disconnect } = useDatabase()

  const [inputConnectionString, setInputConnectionString] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (connectionString) {
      setInputConnectionString(connectionString)
    }
  }, [connectionString])

  const handleTestConnection = async () => {
    if (!inputConnectionString.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập connection string'
      })
      return
    }

    try {
      setIsTestingConnection(true)
      setTestResult(null)

      if (!window.api) {
        throw new Error('Electron API không khả dụng')
      }

      const result = await window.api.cloudDatabase.testConnection(inputConnectionString)

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Kết nối thành công! Database khả dụng.'
        })
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Không thể kết nối đến database'
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Lỗi không xác định'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveAndConnect = async () => {
    if (!inputConnectionString.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập connection string'
      })
      return
    }

    try {
      setIsSaving(true)
      setTestResult(null)

      const success = await connect(inputConnectionString)

      if (success) {
        setTestResult({
          success: true,
          message: 'Đã lưu và kết nối thành công!'
        })
      } else {
        setTestResult({
          success: false,
          message: 'Không thể kết nối. Vui lòng kiểm tra lại connection string.'
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Lỗi không xác định'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setInputConnectionString('')
      setTestResult({
        success: true,
        message: 'Đã ngắt kết nối và xóa thông tin database'
      })
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Lỗi khi ngắt kết nối'
      })
    }
  }

  const maskConnectionString = (str: string) => {
    if (!str) return ''
    if (str.length <= 30) return str.substring(0, 10) + '***'
    return str.substring(0, 15) + '***' + str.substring(str.length - 10)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Cloud Database
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Quản lý kết nối đến PostgreSQL database trên cloud
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`rounded-lg p-4 border ${
            isConnected
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
            <span
              className={`text-sm font-medium ${
                isConnected
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Trạng thái kết nối
            </span>
          </div>
          <CustomBadge variant={isConnected ? 'success' : 'secondary'} size="sm">
            {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
          </CustomBadge>
        </div>

        {isConnected && connectionString && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Connection String
              </span>
            </div>
            <p className="text-sm font-mono text-blue-900 dark:text-blue-100 break-all">
              {maskConnectionString(connectionString)}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {testResult && (
        <div
          className={`border rounded-lg p-4 flex items-start gap-3 ${
            testResult.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              testResult.success
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {testResult.message}
          </p>
        </div>
      )}

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            PostgreSQL Connection String
          </label>
          <CustomInput
            value={inputConnectionString}
            onChange={setInputConnectionString}
            placeholder="postgresql://user:password@host:port/database"
            size="sm"
            disabled={isLoading || isConnected}
          />
          <p className="text-xs text-text-secondary mt-2">
            Ví dụ: postgresql://user:pass@db.supabase.co:5432/postgres
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium mb-1">Lưu ý bảo mật:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Connection string được mã hóa và lưu an toàn</li>
                <li>Không chia sẻ connection string với người khác</li>
                <li>Sử dụng user có quyền hạn phù hợp (không dùng superuser)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected ? (
            <>
              <CustomButton
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleTestConnection}
                disabled={isTestingConnection || !inputConnectionString.trim()}
                loading={isTestingConnection}
              >
                {isTestingConnection ? 'Đang kiểm tra...' : 'Test Connection'}
              </CustomButton>

              <CustomButton
                variant="primary"
                size="sm"
                icon={Database}
                onClick={handleSaveAndConnect}
                disabled={isSaving || !inputConnectionString.trim()}
                loading={isSaving}
              >
                {isSaving ? 'Đang kết nối...' : 'Lưu & Kết nối'}
              </CustomButton>
            </>
          ) : (
            <CustomButton
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              Ngắt kết nối & Xóa
            </CustomButton>
          )}
        </div>
      </div>

      <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Hướng dẫn lấy Connection String
        </h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <div>
            <p className="font-medium text-text-primary mb-1">Supabase:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
              <li>Vào Project Settings → Database</li>
              <li>Tìm mục "Connection string"</li>
              <li>Chọn "URI" và copy connection string</li>
              <li>Thay [YOUR-PASSWORD] bằng mật khẩu database của bạn</li>
            </ol>
          </div>

          <div>
            <p className="font-medium text-text-primary mb-1">Railway/Render:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
              <li>Vào Database settings</li>
              <li>Tìm "Connection URL" hoặc "DATABASE_URL"</li>
              <li>Copy connection string</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseCloudSection
