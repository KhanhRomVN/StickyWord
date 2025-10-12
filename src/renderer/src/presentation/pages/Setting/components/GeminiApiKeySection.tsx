import React, { useState } from 'react'
import { Eye, EyeOff, Trash2, Edit2 } from 'lucide-react'
import CustomInput from '../../../../components/common/CustomInput'
import CustomButton from '../../../../components/common/CustomButton'
import CustomModal from '../../../../components/common/CustomModal'
import { useGeminiApiKeys, GeminiApiKey } from '../../../../hooks/useGeminiApiKeys'

const GeminiApiKeySection: React.FC = () => {
  const { apiKeys, addApiKey, updateApiKey, deleteApiKey } = useGeminiApiKeys()

  // Form states
  const [formName, setFormName] = useState('')
  const [formKey, setFormKey] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState('')

  // Visibility states
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  // Modal states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

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
      } else {
        addApiKey(formName, formKey)
      }
      setFormName('')
      setFormKey('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    }
  }

  // Handle edit
  const handleEdit = (apiKey: GeminiApiKey) => {
    setFormName(apiKey.name)
    setFormKey(apiKey.key)
    setEditingId(apiKey.id)
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
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormName('')
    setFormKey('')
    setEditingId(null)
    setError('')
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mask API key
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.slice(0, 4)}${'*'.repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`
  }

  return (
    <>
      <div className="mt-8 p-6 border border-border rounded-lg bg-card-background">
        {/* Header */}
        <h2 className="text-lg font-semibold text-text-primary mb-6">Gemini API Keys</h2>

        {/* Form Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <h3 className="text-sm font-medium text-text-primary mb-4">
            {editingId ? 'Chỉnh sửa API Key' : 'Thêm API Key mới'}
          </h3>

          <div className="space-y-4">
            <CustomInput
              label="Tên API Key"
              placeholder="VD: Production API, Test API"
              value={formName}
              onChange={setFormName}
              size="md"
            />

            <CustomInput
              label="API Key"
              placeholder="Nhập API key của bạn"
              value={formKey}
              onChange={setFormKey}
              type="password"
              size="md"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 pt-2">
              <CustomButton
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="w-32"
              >
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </CustomButton>

              {editingId && (
                <CustomButton
                  variant="secondary"
                  size="md"
                  onClick={handleCancelEdit}
                  className="w-32"
                >
                  Hủy
                </CustomButton>
              )}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-4">
            Danh sách API Keys ({apiKeys.length})
          </h3>

          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-text-secondary text-sm">Chưa có API key nào</p>
              <p className="text-text-tertiary text-xs mt-1">Thêm API key mới ở phần trên</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="p-4 border border-border rounded-lg bg-background hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  {/* Key name */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {apiKey.name}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        Tạo ngày: {formatDate(apiKey.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Key display */}
                  <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <code className="text-xs font-mono text-text-primary flex-1 truncate break-all">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleVisibility(apiKey.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 flex-shrink-0"
                      title={visibleKeys.has(apiKey.id) ? 'Ẩn' : 'Hiển thị'}
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <CustomButton
                      variant="secondary"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleEdit(apiKey)}
                      className="flex-1"
                    >
                      Sửa
                    </CustomButton>
                    <CustomButton
                      variant="secondary"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteClick(apiKey.id)}
                      className="flex-1"
                    >
                      Xóa
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </>
  )
}

export default GeminiApiKeySection
