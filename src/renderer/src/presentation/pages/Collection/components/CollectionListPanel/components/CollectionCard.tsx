import { vocabulary_item } from '../../../types/vocabulary'
import { grammar_item } from '../../../types/grammar'
import { BookOpen, MessageSquare, BookMarked, Star, BarChart3 } from 'lucide-react'

interface CollectionCardProps {
  item: vocabulary_item | grammar_item
  isSelected: boolean
  onClick: () => void
}

function isGrammarItem(item: vocabulary_item | grammar_item): item is grammar_item {
  const hasTitle = 'title' in item
  const hasContent = 'content' in item
  const result = hasTitle && !hasContent
  return result
}

const CollectionCard = ({ item, isSelected, onClick }: CollectionCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'word':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30'
      case 'phrase':
        return 'bg-green-500/20 text-green-600 border-green-500/30'
      case 'grammar':
      case 'tense':
      case 'structure':
      case 'rule':
      case 'pattern':
        return 'bg-purple-500/20 text-purple-600 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'word':
        return BookOpen
      case 'phrase':
        return MessageSquare
      case 'grammar':
      case 'tense':
      case 'structure':
      case 'rule':
      case 'pattern':
        return BookMarked
      default:
        return BookOpen
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'word':
        return 'Word'
      case 'phrase':
        return 'Phrase'
      case 'tense':
        return 'Tense'
      case 'structure':
        return 'Structure'
      case 'rule':
        return 'Rule'
      case 'pattern':
        return 'Pattern'
      case 'grammar':
        return 'Grammar'
      default:
        return 'Other'
    }
  }

  const displayText = isGrammarItem(item) ? item.title : item.content
  const TypeIcon = getTypeIcon(item.item_type)

  const getDifficultyColor = (level?: number) => {
    if (!level) return 'text-gray-400'
    if (level <= 3) return 'text-green-600 dark:text-green-400'
    if (level <= 6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getFrequencyColor = (rank?: number) => {
    if (!rank) return 'text-gray-400'
    if (rank >= 8) return 'text-blue-600 dark:text-blue-400'
    if (rank >= 5) return 'text-cyan-600 dark:text-cyan-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div
      className={`p-3 cursor-pointer transition-all duration-200 border-b border-border-default ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'bg-card-background hover:bg-sidebar-itemHover'
      }`}
      onClick={onClick}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r" />
      )}

      <div className="flex items-center gap-3">
        {/* Content - 2 dòng */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Dòng 1: Content/Title + Type badge */}
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-text-primary truncate">{displayText}</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0 ${getTypeColor(item.item_type)}`}
            >
              {getTypeLabel(item.item_type)}
            </span>
          </div>

          {/* Dòng 2: Metadata */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Difficulty */}
            {item.difficulty_level && item.difficulty_level > 0 && (
              <div className="flex items-center gap-1">
                <Star className={`w-3 h-3 ${getDifficultyColor(item.difficulty_level)}`} />
                <span className="text-xs text-text-secondary">{item.difficulty_level}</span>
              </div>
            )}

            {/* Frequency */}
            {item.frequency_rank && item.frequency_rank > 0 && (
              <div className="flex items-center gap-1">
                <BarChart3 className={`w-3 h-3 ${getFrequencyColor(item.frequency_rank)}`} />
                <span className="text-xs text-text-secondary">{item.frequency_rank}</span>
              </div>
            )}

            {/* Category */}
            {item.category && (
              <span className="text-xs text-text-secondary px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                {item.category}
              </span>
            )}

            {/* First tag */}
            {item.tags && item.tags.length > 0 && (
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                {item.tags[0]}
                {item.tags.length > 1 && ` +${item.tags.length - 1}`}
              </span>
            )}

            {/* No info message */}
            {!item.difficulty_level &&
              !item.frequency_rank &&
              !item.category &&
              (!item.tags || item.tags.length === 0) && (
                <span className="text-xs text-gray-400 dark:text-gray-500">No additional info</span>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionCard
