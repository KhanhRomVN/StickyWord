import { useState, useMemo, useEffect } from 'react'
import { vocabulary_item } from '../../types'
import CollectionCard from './components/CollectionCard'

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

  // Update filter when defaultFilterType changes
  useEffect(() => {
    setFilterType(defaultFilterType)
  }, [defaultFilterType])

  // Sample data - in real app, this would come from API or store
  const sampleItems: vocabulary_item[] = useMemo(
    () => [
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
    ],
    []
  )

  const filteredAndSortedItems = useMemo(() => {
    let filtered = sampleItems.filter((item) => {
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
  }, [sampleItems, searchTerm, filterType, sortBy])

  return (
    <div className="h-full flex flex-col">
      {/* Header với search và filter */}
      <div className=" border-b border-border-default space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-transparent rounded-lg focus:outline-none focus:border-border-focus text-text-primary"
          />
        </div>
      </div>

      {/* Danh sách items */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
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
            <p>Không tìm thấy kết quả phù hợp</p>
          </div>
        ) : (
          filteredAndSortedItems.map((item) => (
            <CollectionCard
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={() => onSelectItem(item)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CollectionListPanel
