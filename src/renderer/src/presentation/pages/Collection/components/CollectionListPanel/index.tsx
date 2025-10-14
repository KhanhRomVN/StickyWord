import { useState, useMemo, useEffect } from 'react'
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'
import CollectionCard from './components/CollectionCard'
import CreateCollectionModal from '../CreateCollectionModal'
import CustomButton from '../../../../../components/common/CustomButton'
import { Plus, Search } from 'lucide-react'

interface CollectionListPanelProps {
  onSelectItem: (item: vocabulary_item | null) => void
  selectedItem: vocabulary_item | null
  defaultFilterType?: 'all' | vocabulary_item['item_type']
}

const CollectionListPanel = ({
  onSelectItem,
  selectedItem,
  defaultFilterType = 'all'
}: CollectionListPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | vocabulary_item['item_type']>(
    defaultFilterType
  )
  const [sortBy] = useState<'newest' | 'oldest' | 'content'>('newest')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [items, setItems] = useState<vocabulary_item[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Update filter when defaultFilterType changes
  useEffect(() => {
    setFilterType(defaultFilterType)
  }, [defaultFilterType])

  // Reload items when filter type changes
  useEffect(() => {
    loadItems(filterType)
  }, [filterType])

  // Load items from database on mount
  useEffect(() => {
    loadItems('all')
  }, [])

  const loadItems = async (filter: 'all' | vocabulary_item['item_type']) => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
      if (window.api?.vocabulary?.getAll) {
        const response = await window.api.vocabulary.getAll(filter)
        setItems(response)
      } else {
        // Fallback to empty array if API not available
        setItems([])
      }
    } catch (error) {
      console.error('[CollectionListPanel] Error loading items:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || item.item_type === filterType
      return matchesSearch && matchesType
    })

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'content':
          return a.content.localeCompare(b.content)
        default:
          return 0
      }
    })

    return filtered
  }, [items, searchTerm, filterType, sortBy])

  const handleCreateSuccess = async (newItems: vocabulary_item[] | grammar_item[]) => {
    try {
      console.log('[CollectionListPanel] Saving items to database:', newItems)
      console.log('[CollectionListPanel] First item details:', JSON.stringify(newItems[0], null, 2))

      // Lưu từng item vào SQLite database
      for (const item of newItems) {
        console.log('[CollectionListPanel] Attempting to save item:', item.id)
        if (window.api?.vocabulary?.save) {
          const result = await window.api.vocabulary.save(item)
          console.log('[CollectionListPanel] Save result:', result)
        }
      }

      // Reload danh sách từ database
      await loadItems(filterType)
      setIsCreateModalOpen(false)

      console.log('[CollectionListPanel] Items saved successfully')
    } catch (error) {
      const err = error as Error
      console.error('[CollectionListPanel] Error saving items - Full error:', error)
      console.error('[CollectionListPanel] Error message:', err?.message)
      console.error('[CollectionListPanel] Error stack:', err?.stack)
      alert(`Lỗi khi lưu dữ liệu: ${err?.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border-default p-4 space-y-3">
        {/* Title và Create Button */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Collection</h2>
          <CustomButton
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add
          </CustomButton>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-card-background border border-border-default rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary p-8">
            <div className="animate-spin w-8 h-8 border-4 border-border-default border-t-primary rounded-full mb-3" />
            <p>Đang tải...</p>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary p-8 text-center">
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">Không tìm thấy kết quả</p>
            <p className="text-sm opacity-75 mt-1">
              {searchTerm.trim() ? 'Thử tìm kiếm với từ khác' : 'Hãy thêm collection mới'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {filteredAndSortedItems.map((item) => (
              <CollectionCard
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  )
}

export default CollectionListPanel
