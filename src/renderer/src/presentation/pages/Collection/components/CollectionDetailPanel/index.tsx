// File: CollectionDetailPanel/index.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { vocabulary_items } from '../../types/vocabulary'
import { grammar_items } from '../../types/grammar'
import WordContentSection from './components/WordContentSection'
import PhraseContentSection from './components/PhraseContentSection'
import GrammarContentSection from './components/GrammarContentSection'
import { Info, List, Database, Trash2 } from 'lucide-react'

interface CollectionDetailPanelProps {
  selectedItem: vocabulary_items | grammar_items | null
  onItemDeleted?: (itemId: string) => void
}

type TabType = 'information' | 'definitions' | 'metadata'

interface TabConfig {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  activeColor: string
}

const TABS: TabConfig[] = [
  {
    id: 'information',
    label: 'Information',
    icon: Info,
    description: 'Basic information and metadata',
    color: 'text-blue-600 dark:text-blue-400',
    activeColor: 'border-blue-600 dark:border-blue-400'
  },
  {
    id: 'definitions',
    label: 'Definitions',
    icon: List,
    description: 'Definitions and examples',
    color: 'text-green-600 dark:text-green-400',
    activeColor: 'border-green-600 dark:border-green-400'
  },
  {
    id: 'metadata',
    label: 'Metadata',
    icon: Database,
    description: 'Additional metadata',
    color: 'text-purple-600 dark:text-purple-400',
    activeColor: 'border-purple-600 dark:border-purple-400'
  }
]

const CollectionDetailPanel = ({ selectedItem, onItemDeleted }: CollectionDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('information')

  const handleDeleteWord = async (itemId: string) => {
    try {
      const { getCloudDatabase } = await import('../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (!db) {
        throw new Error('Database not connected')
      }

      const deletedCount = await db.deleteItem(itemId)

      if (deletedCount > 0) {
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

  const isVocabularyItem = (item: vocabulary_items | grammar_items): item is vocabulary_items => {
    return 'content' in item && !('title' in item)
  }

  const isGrammarItem = (item: vocabulary_items | grammar_items): item is grammar_items => {
    return 'title' in item && !('content' in item)
  }

  const getItemTitle = () => {
    return isGrammarItem(selectedItem) ? selectedItem.title : selectedItem.content
  }

  const getItemType = () => {
    if (isGrammarItem(selectedItem)) return 'Grammar'
    return selectedItem.item_type === 'word' ? 'Word' : 'Phrase'
  }

  const renderTabContent = () => {
    if (isVocabularyItem(selectedItem) && selectedItem.item_type === 'word') {
      return (
        <WordContentSection item={selectedItem} onDelete={handleDeleteWord} activeTab={activeTab} />
      )
    }
    if (isVocabularyItem(selectedItem) && selectedItem.item_type === 'phrase') {
      return <PhraseContentSection item={selectedItem} activeTab={activeTab} />
    }
    if (isGrammarItem(selectedItem)) {
      return (
        <GrammarContentSection
          item={selectedItem}
          onDelete={handleDeleteWord}
          activeTab={activeTab}
        />
      )
    }
    return null
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section - Height khớp với CollectionListPanel */}
      <div className="flex-none border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            {/* Item Info */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl font-bold text-text-primary truncate">{getItemTitle()}</h1>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                    {getItemType()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                  {selectedItem.difficulty_level && (
                    <span className="font-medium">Difficulty: {selectedItem.difficulty_level}</span>
                  )}
                  {selectedItem.frequency_rank && (
                    <span className="font-medium">Frequency: {selectedItem.frequency_rank}</span>
                  )}
                  {selectedItem.category && (
                    <span className="font-medium">Category: {selectedItem.category}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteWord(selectedItem.id)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
              title="Delete Item"
            >
              <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative flex items-center gap-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2
                    ${
                      isActive
                        ? `${tab.color} ${tab.activeColor}`
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className={`h-4 w-4 ${isActive ? tab.color : ''}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CollectionDetailPanel
