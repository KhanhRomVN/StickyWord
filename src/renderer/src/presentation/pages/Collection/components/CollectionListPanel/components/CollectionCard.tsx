import { vocabulary_item } from '../../../types/vocabulary'
import { grammar_item } from '../../../types/grammar'

interface CollectionCardProps {
  item: vocabulary_item | grammar_item
  isSelected: boolean
  onClick: () => void
}

// ✅ Correct type guard with detailed logging
function isGrammarItem(item: vocabulary_item | grammar_item): item is grammar_item {
  const hasTitle = 'title' in item
  const hasContent = 'content' in item
  const result = hasTitle && !hasContent

  console.log('[CollectionCard] Type guard check:', {
    id: item.id,
    has_title: hasTitle,
    has_content: hasContent,
    is_grammar: result,
    item_type: item.item_type,
    title: (item as any).title,
    content: (item as any).content
  })

  return result
}

const CollectionCard = ({ item, isSelected, onClick }: CollectionCardProps) => {
  console.log('[CollectionCard] Rendering item:', {
    id: item.id,
    item_type: item.item_type,
    is_grammar: isGrammarItem(item)
  })

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
        return '📝'
      case 'phrase':
        return '💬'
      case 'grammar':
      case 'tense':
      case 'structure':
      case 'rule':
      case 'pattern':
        return '📚'
      default:
        return '📌'
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

  // ✅ Get display text based on item type
  const displayText = isGrammarItem(item) ? item.title : item.content

  console.log('[CollectionCard] Display text:', displayText)

  return (
    <div
      className={`p-4 border-b border-border-default cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-sidebar-itemFocus border-l-4 border-l-primary'
          : 'hover:bg-sidebar-itemHover'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          {getTypeIcon(item.item_type)}
          {displayText}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.item_type)}`}
        >
          {getTypeLabel(item.item_type)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{item.category && `Category: ${item.category}`}</span>
        <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    </div>
  )
}

export default CollectionCard
