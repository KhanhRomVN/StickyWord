import { useState, useMemo, useEffect } from 'react'
import { vocabulary_item } from '../../types'
import CollectionCard from './components/CollectionCard'
import CreateCollectionModal from '../CreateCollectionModal'
import CustomButton from '../../../../../components/common/CustomButton'
import { Plus, Search } from 'lucide-react'

interface CollectionListPanelProps {
  onSelectItem: (item: vocabulary_item) => void
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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'content'>('newest')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [items, setItems] = useState<vocabulary_item[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Update filter when defaultFilterType changes
  useEffect(() => {
    setFilterType(defaultFilterType)
  }, [defaultFilterType, location.pathname])

  // Reload items when filter type changes
  useEffect(() => {
    loadItems(filterType)
  }, [filterType])

  // Load items from database on mount (mock for now)
  useEffect(() => {
    loadItems('all')
  }, [])

  const loadItems = async (filter?: 'all' | vocabulary_item['item_type']) => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
      // const response = await window.api.database.getVocabularyItems(filter)
      // setItems(response)

      // Mock data - sẽ thay thế bằng API thật
      const allItems: vocabulary_item[] = [
        {
          id: '1',
          item_type: 'word',
          content: 'perseverance',
          pronunciation: 'pur-suh-veer-uhns',
          ipa_notation: '/ˌpɜːrsəˈvɪrəns/',
          word_type: 'noun',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          item_type: 'phrase',
          content: 'break the ice',
          pronunciation: 'breyk thee ahys',
          ipa_notation: '/breɪk ðə aɪs/',
          phrase_type: 'idiom',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-14T14:20:00Z'
        },
        {
          id: '3',
          item_type: 'grammar',
          content: 'Present Perfect Continuous',
          grammar_type: 'tense',
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z'
        },
        {
          id: '4',
          item_type: 'word',
          content: 'resilient',
          pronunciation: 'ri-zil-yuhnt',
          ipa_notation: '/rɪˈzɪljənt/',
          word_type: 'adjective',
          created_at: '2024-01-12T16:45:00Z',
          updated_at: '2024-01-12T16:45:00Z'
        }
      ]
      setItems(sampleItems)
    } catch (error) {
      console.error('[CollectionListPanel] Error loading items:', error)
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

  const handleCreateSuccess = (newItems: vocabulary_item[]) => {
    // TODO: Save to database
    // await window.api.database.saveVocabularyItems(newItems)

    // For now, just add to local state
    setItems((prev) => [...prev, ...newItems])
    setIsCreateModalOpen(false)
  }

  const handleDeleteItem = (itemId: string) => {
    // TODO: Delete from database
    // await window.api.database.deleteVocabularyItem(itemId)

    setItems((prev) => prev.filter((item) => item.id !== itemId))
    if (selectedItem?.id === itemId) {
      onSelectItem(null)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border-default p-4 space-y-3">
        {/* Title và Create Button */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Bộ sưu tập</h2>
          <CustomButton
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Thêm
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
                onDelete={() => handleDeleteItem(item.id)}
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
