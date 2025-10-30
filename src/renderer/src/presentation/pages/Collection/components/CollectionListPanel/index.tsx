import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'
import CollectionCard from './components/CollectionCard'
import CreateCollectionModal from '../CreateCollectionModal'
import CustomButton from '../../../../../components/common/CustomButton'
import CustomDropdown from '../../../../../components/common/CustomDropdown'
import FilterOverlay from './components/FilterOverlay'
import { Filter, Plus, Search, BookOpen, MessageSquare, BookMarked } from 'lucide-react'

type FilterType = 'all' | vocabulary_item['item_type'] | grammar_item['item_type'] | 'grammar'

interface CollectionListPanelProps {
  onSelectItem: (item: vocabulary_item | grammar_item | null) => void
  selectedItem: vocabulary_item | grammar_item | null
  defaultFilterType?: 'all' | vocabulary_item['item_type'] | 'grammar'
  onItemDeleted?: (itemId: string) => void
}
const CollectionListPanel = ({ onSelectItem, selectedItem }: CollectionListPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType] = useState<FilterType>('all')
  const [sortBy] = useState<'newest' | 'oldest' | 'content'>('newest')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false)
  const [createType, setCreateType] = useState<'word' | 'phrase' | 'grammar'>('word')
  const [items, setItems] = useState<(vocabulary_item | grammar_item)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<{
    // ✅ State cho filters
    item_type: string[]
    difficulty_level: string[]
    frequency_rank: string[]
    category: string[]
    tags: string[]
  }>({
    item_type: [],
    difficulty_level: [],
    frequency_rank: [],
    category: [],
    tags: []
  })

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

  // ✅ FIX: Track if initial load is done
  const initialLoadDone = useRef(false)
  const isMounted = useRef(true)

  // ✅ FIX: Load items only once on mount
  useEffect(() => {
    console.log(
      '[CollectionListPanel] 🎬 Initial useEffect triggered, initialLoadDone:',
      initialLoadDone.current
    )
    if (!initialLoadDone.current) {
      console.log('[CollectionListPanel] 🔥 First load - calling loadItems("all")')
      loadItems('all')
      initialLoadDone.current = true
    } else {
      console.log('[CollectionListPanel] ⏭️ Skip initial load - already done')
    }
  }, [])

  // ✅ FIX: Set isMounted = true khi component mount
  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  // ✅ FIX: Listen for item deletion events
  useEffect(() => {
    const handleItemDeletedEvent = () => {
      if (isMounted.current) {
        loadItems(filterType)
        onSelectItem(null)
      }
    }

    window.addEventListener('item-deleted', handleItemDeletedEvent as EventListener)

    return () => {
      window.removeEventListener('item-deleted', handleItemDeletedEvent as EventListener)
    }
  }, [filterType])

  // ✅ FIX: useCallback để tránh re-create function
  const loadItems = useCallback(async (filter: FilterType) => {
    console.log('[CollectionListPanel] 🔄 loadItems called with filter:', filter)

    try {
      console.log('[CollectionListPanel] 📝 Setting isLoading to true')
      setIsLoading(true)

      const apiFilter = getApiFilterType(filter)

      console.log('[CollectionListPanel] 🔍 Loading items with filter:', {
        filterType: filter,
        apiFilter: apiFilter,
        isMounted: isMounted.current
      })

      const { getCloudDatabase } = await import('../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      console.log('[CollectionListPanel] 🗄️ Database status:', {
        dbExists: !!db,
        isMounted: isMounted.current
      })

      if (db && isMounted.current) {
        console.log('[CollectionListPanel] 🚀 Calling db.getAllItems...')
        const response = await db.getAllItems(apiFilter)
        console.log('[CollectionListPanel] ✅ Loaded items:', {
          count: response.length,
          filter: apiFilter,
          items: response,
          isMounted: isMounted.current
        })

        console.log('[CollectionListPanel] 💾 Setting items state...')
        setItems(response as (vocabulary_item | grammar_item)[])
        console.log('[CollectionListPanel] ✔️ Items state set successfully')
      } else {
        console.warn('[CollectionListPanel] ⚠️ Database not connected or unmounted:', {
          db: !!db,
          isMounted: isMounted.current
        })
        if (isMounted.current) {
          setItems([])
        }
      }
    } catch (error) {
      console.error('[CollectionListPanel] ❌ Error loading items:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      if (isMounted.current) {
        setItems([])
      }
    } finally {
      console.log(
        '[CollectionListPanel] 🏁 Finally block - setting isLoading to false, isMounted:',
        isMounted.current
      )
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  const getSearchableText = (item: vocabulary_item | grammar_item): string => {
    return isGrammarItem(item) ? item.title : item.content
  }

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const searchableText = getSearchableText(item)
      const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase())

      // ✅ Filter theo item_type
      const matchesItemType =
        filters.item_type.length === 0 ||
        filters.item_type.includes(item.item_type) ||
        (filters.item_type.includes('grammar') && isGrammarItem(item))

      // ✅ Filter theo difficulty_level
      const matchesDifficulty =
        filters.difficulty_level.length === 0 ||
        (item.difficulty_level &&
          filters.difficulty_level.includes(item.difficulty_level.toString()))

      // ✅ Filter theo frequency_rank
      const matchesFrequency =
        filters.frequency_rank.length === 0 ||
        (item.frequency_rank && filters.frequency_rank.includes(item.frequency_rank.toString()))

      // ✅ Filter theo category
      const matchesCategory =
        filters.category.length === 0 || (item.category && filters.category.includes(item.category))

      // ✅ Filter theo tags
      const matchesTags =
        filters.tags.length === 0 ||
        (item.tags && item.tags.some((tag) => filters.tags.includes(tag)))

      return (
        matchesSearch &&
        matchesItemType &&
        matchesDifficulty &&
        matchesFrequency &&
        matchesCategory &&
        matchesTags
      )
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
  }, [items, searchTerm, filters, sortBy])

  const uniqueValues = useMemo(() => {
    const types = new Set<string>()
    const levels = new Set<string>()
    const ranks = new Set<string>()
    const categories = new Set<string>()
    const tags = new Set<string>()

    items.forEach((item) => {
      // Item types
      if (isGrammarItem(item)) {
        types.add('grammar')
      } else {
        types.add(item.item_type)
      }

      // Difficulty levels
      if (item.difficulty_level) {
        levels.add(item.difficulty_level.toString())
      }

      // Frequency ranks
      if (item.frequency_rank) {
        ranks.add(item.frequency_rank.toString())
      }

      // Categories
      if (item.category) {
        categories.add(item.category)
      }

      // Tags
      if (item.tags) {
        item.tags.forEach((tag) => tags.add(tag))
      }
    })

    return {
      itemTypes: Array.from(types),
      difficultyLevels: Array.from(levels).sort((a, b) => parseInt(a) - parseInt(b)),
      frequencyRanks: Array.from(ranks).sort((a, b) => parseInt(a) - parseInt(b)),
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort()
    }
  }, [items])

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
        {/* Title và Buttons */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Collection Manager</h2>
          <div className="flex items-center gap-2">
            <CustomButton
              size="sm"
              variant="ghost"
              icon={Filter}
              onClick={() => setIsFilterOpen(true)}
              children={undefined}
            />
            <div className="relative">
              <CustomButton
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                children={undefined}
              />
              {isCreateDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[998]"
                    onClick={() => setIsCreateDropdownOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 z-[999]">
                    <CustomDropdown
                      options={[
                        {
                          value: 'word',
                          label: 'Add Word',
                          icon: <BookOpen className="w-3.5 h-3.5" />
                        },
                        {
                          value: 'phrase',
                          label: 'Add Phrase',
                          icon: <MessageSquare className="w-3.5 h-3.5" />
                        },
                        {
                          value: 'grammar',
                          label: 'Add Grammar',
                          icon: <BookMarked className="w-3.5 h-3.5" />
                        }
                      ]}
                      onSelect={(value) => {
                        setCreateType(value as 'word' | 'phrase' | 'grammar')
                        setIsCreateModalOpen(true)
                        setIsCreateDropdownOpen(false)
                      }}
                      align="right"
                      width="w-40"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
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
        {(() => {
          console.log('[CollectionListPanel] 🎨 Render state:', {
            isLoading,
            itemsLength: items.length,
            filteredLength: filteredAndSortedItems.length,
            searchTerm,
            filters
          })
          return null
        })()}

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
        onClose={() => {
          setIsCreateModalOpen(false)
          setIsCreateDropdownOpen(false)
        }}
        onCreateSuccess={handleCreateSuccess}
        defaultType={createType}
      />

      {/* ✅ Filter Overlay */}
      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        availableItemTypes={uniqueValues.itemTypes}
        availableDifficultyLevels={uniqueValues.difficultyLevels}
        availableFrequencyRanks={uniqueValues.frequencyRanks}
        availableCategories={uniqueValues.categories}
        availableTags={uniqueValues.tags}
      />
    </div>
  )
}

export default CollectionListPanel
