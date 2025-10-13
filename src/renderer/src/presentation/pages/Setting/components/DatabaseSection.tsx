import { useState } from 'react'
import { Database, FolderOpen, Plus, CheckCircle2, XCircle } from 'lucide-react'
import CustomButton from '../../../../components/common/CustomButton'
import CustomBadge from '../../../../components/common/CustomBadge'
import { useDatabase } from '../../../../hooks/useDatabase'

const DatabaseSection = () => {
  const { isConnected, dbPath, createNewDatabase, selectExistingDatabase, refreshConnection } =
    useDatabase()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNew = async () => {
    setIsCreating(true)
    // TODO: Show file picker dialog
    // const path = await window.api.dialog.showSaveDialog({ ... })
    // if (path) await createNewDatabase(path)
    setIsCreating(false)
  }

  const handleSelectExisting = async () => {
    // TODO: Show file picker dialog
    // const path = await window.api.dialog.showOpenDialog({ ... })
    // if (path) await selectExistingDatabase(path)
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Database</h2>
          <p className="text-sm text-text-secondary">Quản lý kết nối và lưu trữ dữ liệu</p>
        </div>
      </div>

      <div className="p-6 border border-border rounded-lg bg-card-background space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-text-primary">
                {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
              </p>
              {dbPath && (
                <p className="text-xs text-text-secondary mt-1 font-mono break-all">{dbPath}</p>
              )}
            </div>
          </div>
          <CustomBadge variant={isConnected ? 'success' : 'error'} size="sm">
            {isConnected ? 'Active' : 'Inactive'}
          </CustomBadge>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <CustomButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleCreateNew}
            loading={isCreating}
            className="w-full"
          >
            Tạo database mới
          </CustomButton>

          <CustomButton
            variant="secondary"
            size="md"
            icon={FolderOpen}
            onClick={handleSelectExisting}
            className="w-full"
          >
            Chọn database có sẵn
          </CustomButton>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Database lưu trữ tất cả từ vựng, cụm từ, ngữ pháp và phát âm của bạn. Hãy backup
            thường xuyên để không mất dữ liệu.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DatabaseSection
