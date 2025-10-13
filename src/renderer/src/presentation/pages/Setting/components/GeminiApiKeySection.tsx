import React, { useState } from 'react'
import { Eye, EyeOff, Trash2, Edit2, Key, Sparkles } from 'lucide-react'
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
      } else {
        addApiKey(formName, formKey)
      }
      setFormName('')
      setFormKey('')
      setError('')
      setShowAddForm(false)
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
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary">Gemini API Keys</h2>
            <p className="text-sm text-text-secondary">Quản lý API keys để sử dụng tính năng AI</p>
          </div>
          {!showAddForm && (
            <CustomButton
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => setShowAddForm(true)}
            >
              Thêm API Key
            </CustomButton>
          )}
        </div>

        <div className="p-6 border border-border rounded-lg bg-card-background space-y-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  {editingId ? '✏️ Chỉnh sửa API Key' : '➕ Thêm API Key mới'}
                </h3>
                {editingId && (
                  <CustomButton variant="ghost" size="sm" onClick={handleCancelEdit}>
                    Hủy
                  </CustomButton>
                )}
              </div>

              <CustomInput
                label="Tên API Key"
                placeholder="VD: Production API, Test API"
                value={formName}
                onChange={setFormName}
                size="sm"
                variant="primary"
              />

              <CustomInput
                label="API Key"
                placeholder="Nhập API key của bạn"
                value={formKey}
                onChange={setFormKey}
                type="password"
                size="sm"
                variant="primary"
              />

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <CustomButton
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="flex-1"
                >
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </CustomButton>

                {editingId && (
                  <CustomButton variant="secondary" size="sm" onClick={handleCancelEdit}>
                    Hủy
                  </CustomButton>
                )}
              </div>
            </div>
          )}

          {/* List Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Danh sách API Keys ({apiKeys.length})
              </h3>
              {apiKeys.length > 0 && (
                <CustomBadge variant="info" size="sm">
                  {apiKeys.length} key{apiKeys.length > 1 ? 's' : ''}
                </CustomBadge>
              )}
            </div>

            {apiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
                <Key className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-text-secondary text-sm font-medium">Chưa có API key nào</p>
                <p className="text-text-secondary text-xs mt-1 mb-4">
                  Thêm API key để sử dụng tính năng AI
                </p>
                {!showAddForm && (
                  <CustomButton
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => setShowAddForm(true)}
                  >
                    Thêm API Key đầu tiên
                  </CustomButton>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="group p-4 border border-border rounded-lg bg-background hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {apiKey.name}
                          </p>
                          <CustomBadge variant="success" size="sm">
                            Active
                          </CustomBadge>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          Tạo: {formatDate(apiKey.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Key Display */}
                    <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <code className="text-xs font-mono text-text-primary flex-1 truncate break-all">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => toggleVisibility(apiKey.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
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
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        className="flex-1 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Xóa
                      </CustomButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              🔒 API keys được lưu trữ an toàn trong localStorage. Không chia sẻ API key với người
              khác.
            </p>
          </div>
        </div>
      </section>

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
