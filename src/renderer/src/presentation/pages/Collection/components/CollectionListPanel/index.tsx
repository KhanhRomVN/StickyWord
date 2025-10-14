import { useState, useMemo, useEffect } from 'react'
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'
import CollectionCard from './components/CollectionCard'
import CreateCollectionModal from '../CreateCollectionModal'
import CustomButton from '../../../../../components/common/CustomButton'
import { Plus, Search } from 'lucide-react'

interface CollectionListPanelProps {
  onSelectItem: (item: vocabulary_item | grammar_item | null) => void // ✅ Add grammar_item
  selectedItem: vocabulary_item | grammar_item | null // ✅ Add grammar_item
  defaultFilterType?: 'all' | vocabulary_item['item_type']
  onItemDeleted?: (itemId: string) => void // ✅ Add this prop
}

const CollectionListPanel = ({
  onSelectItem,
  selectedItem,
  defaultFilterType = 'all',
  onItemDeleted
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
      console.log('[CollectionListPanel] ========== LOAD ITEMS START ==========')
      console.log('[CollectionListPanel] Filter:', filter)

      setIsLoading(true)

      if (window.api?.vocabulary?.getAll) {
        const response = await window.api.vocabulary.getAll(filter)

        console.log('[CollectionListPanel] ✅ Response received:', response.length, 'items')
        console.log('[CollectionListPanel] Items breakdown:')

        const vocabItems = response.filter((item) => 'content' in item)
        const grammarItems = response.filter((item) => 'title' in item && !('content' in item))

        console.log('[CollectionListPanel]  - Vocabulary items:', vocabItems.length)
        console.log('[CollectionListPanel]  - Grammar items:', grammarItems.length)

        if (grammarItems.length > 0) {
          console.log('[CollectionListPanel] Grammar items detail:')
          grammarItems.forEach((item, idx) => {
            console.log(`  [${idx}]:`, {
              id: item.id,
              title: item.title,
              item_type: item.item_type
            })
          })
        }

        setItems(response)
      } else {
        console.warn('[CollectionListPanel] ⚠️ API not available')
        setItems([])
      }

      console.log('[CollectionListPanel] ========== LOAD ITEMS END ==========')
    } catch (error) {
      console.error('[CollectionListPanel] ❌ Error loading items:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedItems = useMemo(() => {
    console.log('[CollectionListPanel] ========== FILTERING ==========')
    console.log('[CollectionListPanel] Items to filter:', items.length)
    console.log('[CollectionListPanel] Search term:', searchTerm)
    console.log('[CollectionListPanel] Filter type:', filterType)

    let filtered = items.filter((item) => {
      // ✅ Xử lý cả vocabulary_item (content) và grammar_item (title)
      const searchableText = item.content || item.title || ''
      const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase())

      // ✅ Fix: Grammar items có item_type = 'tense'|'structure'|'rule'|'pattern'
      // Nên cần kiểm tra xem item có phải là grammar không (bằng cách check có title và không có content)
      const isGrammarItem = 'title' in item && !('content' in item)
      const matchesType =
        filterType === 'all' ||
        item.item_type === filterType ||
        (filterType === 'grammar' && isGrammarItem)

      const shouldInclude = matchesSearch && matchesType

      if (!shouldInclude) {
        console.log('[CollectionListPanel] Filtered out:', {
          id: item.id,
          searchableText,
          matchesSearch,
          matchesType
        })
      }

      return shouldInclude
    })

    console.log('[CollectionListPanel] After filter:', filtered.length, 'items')

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'content':
          // ✅ Xử lý cả content và title khi sort
          const aText = a.content || a.title || ''
          const bText = b.content || b.title || ''
          return aText.localeCompare(bText)
        default:
          return 0
      }
    })

    console.log('[CollectionListPanel] After sort:', filtered.length, 'items')
    console.log('[CollectionListPanel] ========== END FILTERING ==========')

    return filtered
  }, [items, searchTerm, filterType, sortBy])

  const handleCreateSuccess = async (newItems: vocabulary_item[] | grammar_item[]) => {
    try {
      console.log('[CollectionListPanel] ========== START SAVE PROCESS ==========')
      console.log('[CollectionListPanel] Received items count:', newItems.length)

      if (newItems.length === 0) {
        console.warn('[CollectionListPanel] ⚠️ No items to save!')
        return
      }

      // ✅ Save items
      for (const item of newItems) {
        console.log('[CollectionListPanel] Saving item:', item.id)

        if (window.api?.vocabulary?.save) {
          const result = await window.api.vocabulary.save(item)
          console.log('[CollectionListPanel] ✅ Save result:', result)
        }
      }

      // ✅ Reload list
      await loadItems(filterType)
      setIsCreateModalOpen(false)

      console.log('[CollectionListPanel] ========== SAVE PROCESS COMPLETED ==========')
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
