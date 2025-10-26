import { useState, useMemo, useEffect } from 'react'
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'
import CollectionCard from './components/CollectionCard'
import CreateCollectionModal from '../CreateCollectionModal'
import CustomButton from '../../../../../components/common/CustomButton'
import { Plus, Search } from 'lucide-react'

type FilterType = 'all' | vocabulary_item['item_type'] | grammar_item['item_type'] | 'grammar'

interface CollectionListPanelProps {
  onSelectItem: (item: vocabulary_item | grammar_item | null) => void
  selectedItem: vocabulary_item | grammar_item | null
  defaultFilterType?: 'all' | vocabulary_item['item_type'] | 'grammar'
  onItemDeleted?: (itemId: string) => void
}
const CollectionListPanel = ({
  onSelectItem,
  selectedItem,
  defaultFilterType = 'all',
  onItemDeleted
}: CollectionListPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>(defaultFilterType)
  const [sortBy] = useState<'newest' | 'oldest' | 'content'>('newest')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [items, setItems] = useState<(vocabulary_item | grammar_item)[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Type guard để kiểm tra xem item có phải grammar_item không
  const isGrammarItem = (item: vocabulary_item | grammar_item): item is grammar_item => {
    return 'title' in item && !('content' in item)
  }

  // Helper: Convert filterType để dùng với API
  const getApiFilterType = (filter: FilterType): 'all' | 'word' | 'phrase' | 'grammar' => {
    if (filter === 'all') return 'all'
    if (filter === 'word' || filter === 'phrase') return filter
    // Nếu là grammar types ('tense', 'structure', 'rule', 'pattern', 'grammar'), trả về 'grammar'
    return 'grammar'
  }

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

  // Reload items when an item is deleted
  useEffect(() => {
    if (onItemDeleted) {
      const handleDelete = async (itemId: string) => {
        console.log('[CollectionListPanel] Reloading after delete:', itemId)
        await loadItems(filterType)
        onSelectItem(null)
      }

      // Store the handler for cleanup
      const deleteHandler = (itemId: string) => handleDelete(itemId)
      return () => {
        // Cleanup if needed
      }
    }
  }, [onItemDeleted, filterType, onSelectItem])

  // Listen for item deletion events
  useEffect(() => {
    const handleItemDeletedEvent = (event: CustomEvent) => {
      const { itemId } = event.detail
      console.log('[CollectionListPanel] Item deleted event received:', itemId)
      loadItems(filterType)
      onSelectItem(null)
    }

    window.addEventListener('item-deleted', handleItemDeletedEvent as EventListener)

    return () => {
      window.removeEventListener('item-deleted', handleItemDeletedEvent as EventListener)
    }
  }, [filterType, onSelectItem])

  const loadItems = async (filter: FilterType) => {
    try {
      setIsLoading(true)

      const apiFilter = getApiFilterType(filter)

      const { getCloudDatabase } = await import('../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        const response = await db.getAllItems(apiFilter)
        setItems(response as (vocabulary_item | grammar_item)[])
      } else {
        console.warn('[CollectionListPanel] ⚠️ Database not connected')
        setItems([])
      }
    } catch (error) {
      console.error('[CollectionListPanel] ❌ Error loading items:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const getSearchableText = (item: vocabulary_item | grammar_item): string => {
    return isGrammarItem(item) ? item.title : item.content
  }

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const searchableText = getSearchableText(item)
      const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase())

      // Check if filter matches
      let matchesType = filterType === 'all'

      if (!matchesType) {
        if (filterType === 'word' || filterType === 'phrase') {
          // Vocabulary filter
          matchesType = item.item_type === filterType
        } else {
          // Grammar filter (tense, structure, rule, pattern)
          matchesType = isGrammarItem(item) && item.item_type === filterType
        }
      }

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
          const aText = getSearchableText(a)
          const bText = getSearchableText(b)
          return aText.localeCompare(bText)
        default:
          return 0
      }
    })

    return filtered
  }, [items, searchTerm, filterType, sortBy])

  const handleCreateSuccess = async (newItems: (vocabulary_item | grammar_item)[]) => {
    try {
      if (newItems.length === 0) {
        console.warn('[CollectionListPanel] ⚠️ No items to save!')
        return
      }

      // ✅ Reload list
      await loadItems(filterType)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('[CollectionListPanel] ❌ Error saving:', error)
      alert(`Lỗi khi lưu: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
