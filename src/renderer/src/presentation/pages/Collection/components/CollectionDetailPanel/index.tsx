// File: CollectionDetailPanel/index.tsx
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'
import WordContentSection from './components/WordContentSection'
import PhraseContentSection from './components/PhraseContentSection'
import GrammarContentSection from './components/GrammarContentSection'

interface CollectionDetailPanelProps {
  selectedItem: vocabulary_item | grammar_item | null
  onItemDeleted?: (itemId: string) => void // Thêm callback khi xóa
}

const CollectionDetailPanel = ({ selectedItem, onItemDeleted }: CollectionDetailPanelProps) => {
  const handleDeleteWord = async (itemId: string) => {
    try {
      // Gọi API xóa từ database
      const { getCloudDatabase } = await import('../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (!db) {
        throw new Error('Database not connected')
      }

      const deletedCount = await db.deleteItem(itemId)

      if (deletedCount > 0) {
        // Notify parent component
        onItemDeleted?.(itemId)
      } else {
        throw new Error('Item not found or already deleted')
      }
    } catch (error) {
      console.error('[CollectionDetailPanel] Error deleting item:', error)
      alert(`Lỗi khi xóa: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (!selectedItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-secondary p-8">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">Chọn một mục để xem chi tiết</h3>
          <p className="text-sm opacity-75">
            Chọn một từ vựng, cụm từ hoặc điểm ngữ pháp từ danh sách bên trái để xem thông tin chi
            tiết và các ví dụ.
          </p>
        </div>
      </div>
    )
  }

  // ✅ Fix: Type guard chính xác dựa trên cấu trúc dữ liệu
  const isVocabularyItem = (item: vocabulary_item | grammar_item): item is vocabulary_item => {
    return 'content' in item && !('title' in item)
  }

  const isGrammarItem = (item: vocabulary_item | grammar_item): item is grammar_item => {
    return 'title' in item && !('content' in item)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {isVocabularyItem(selectedItem) && selectedItem.item_type === 'word' && (
          <WordContentSection item={selectedItem} onDelete={handleDeleteWord} />
        )}
        {isVocabularyItem(selectedItem) && selectedItem.item_type === 'phrase' && (
          <PhraseContentSection item={selectedItem} />
        )}
        {isGrammarItem(selectedItem) && <GrammarContentSection item={selectedItem} />}
      </div>
    </div>
  )
}

export default CollectionDetailPanel
