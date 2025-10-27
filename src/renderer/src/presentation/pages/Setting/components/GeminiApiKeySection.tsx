import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Key,
  Plus,
  X,
  Check,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react'
import CustomInput from '../../../../components/common/CustomInput'
import CustomButton from '../../../../components/common/CustomButton'
import CustomModal from '../../../../components/common/CustomModal'
import CustomBadge from '../../../../components/common/CustomBadge'
import { useGeminiApiKeys, GeminiApiKey } from '../../../../hooks/useGeminiApiKeys'

const GeminiApiKeySection: React.FC = () => {
  const { apiKeys, addApiKey, updateApiKey, deleteApiKey } = useGeminiApiKeys()

  // Form states
  const [formName, setFormName] = useState('')
  const [formKey, setFormKey] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Visibility states
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  // Modal states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Validate form
  React.useEffect(() => {
    const isValid = formName.trim().length > 0 && formKey.trim().length > 0
    setIsFormValid(isValid)
    setError('')
  }, [formName, formKey])

  // Handle add/update
  const handleSubmit = () => {
    try {
      if (editingId) {
        updateApiKey(editingId, formName, formKey)
        setEditingId(null)
        setSuccess('Cập nhật API key thành công!')
      } else {
        addApiKey(formName, formKey)
        setSuccess('Thêm API key thành công!')
      }
      setFormName('')
      setFormKey('')
      setError('')
      setShowAddForm(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    }
  }

  // Handle edit
  const handleEdit = (apiKey: GeminiApiKey) => {
    setFormName(apiKey.name)
    setFormKey(apiKey.key)
    setEditingId(apiKey.id)
    setShowAddForm(true)
  }

  // Handle delete
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteApiKey(deleteTargetId)
      setDeleteModalOpen(false)
      setDeleteTargetId(null)
      setSuccess('Xóa API key thành công!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormName('')
    setFormKey('')
    setEditingId(null)
    setError('')
    setShowAddForm(false)
  }

  // Toggle key visibility
  const toggleVisibility = (id: string) => {
    const newSet = new Set(visibleKeys)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setVisibleKeys(newSet)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mask API key
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.slice(0, 4)}${'*'.repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`
  }

  // Calculate statistics
  const statistics = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.length // Giả sử tất cả đều active
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Gemini API Keys
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Quản lý API keys để sử dụng tính năng AI
          </p>
        </div>

        {!showAddForm && (
          <CustomButton
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Thêm API Key
          </CustomButton>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Keys</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {statistics.totalKeys}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Keys
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {statistics.activeKeys}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Total Usage
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">0</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1 underline"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">
              {editingId ? 'Chỉnh sửa API Key' : 'Thêm API Key mới'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <CustomInput
            label="Tên API Key"
            value={formName}
            onChange={setFormName}
            placeholder="VD: Production API, Test API..."
            size="sm"
            required
          />

          <CustomInput
            label="API Key"
            value={formKey}
            onChange={setFormKey}
            placeholder="Nhập API key của bạn..."
            type="password"
            size="sm"
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <CustomButton variant="secondary" size="sm" onClick={handleCancelEdit}>
              Hủy
            </CustomButton>
            <CustomButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!isFormValid}
              icon={editingId ? Check : Plus}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </CustomButton>
          </div>
        </div>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-card-background rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Chưa có API key nào</h3>
          <p className="text-sm text-text-secondary mb-4">
            Thêm API key đầu tiên để sử dụng tính năng AI
          </p>
          {!showAddForm && (
            <CustomButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Thêm API Key đầu tiên
            </CustomButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="bg-card-background rounded-xl border border-green-200 dark:border-green-700 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Key className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-text-primary">{apiKey.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CustomBadge variant="success" size="sm" className="text-xs">
                          Active
                        </CustomBadge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleEdit(apiKey)}
                      className="text-blue-600 hover:text-blue-700"
                      children={undefined}
                    />
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteClick(apiKey.id)}
                      className="text-red-600 hover:text-red-700"
                      children={undefined}
                    />
                  </div>
                </div>

                {/* API Key Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key
                    </span>
                    <button
                      onClick={() => toggleVisibility(apiKey.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Ẩn
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Hiện
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm break-all">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>Tạo lúc</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      {formatDate(apiKey.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Activity className="h-3 w-3" />
                      <span>Sử dụng</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">0 lần</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa"
        size="sm"
        actionText="Xóa"
        cancelText="Hủy"
        onAction={handleConfirmDelete}
      >
        <div className="p-6">
          <p className="text-text-primary">
            Bạn có chắc chắn muốn xóa API key này không? Hành động này không thể hoàn tác.
          </p>
        </div>
      </CustomModal>
    </div>
  )
}

export default GeminiApiKeySection
