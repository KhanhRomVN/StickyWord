import { vocabulary_item } from '../../../types'

interface CollectionCardProps {
  item: vocabulary_item
  isSelected: boolean
  onClick: () => void
}

const CollectionCard = ({ item, isSelected, onClick }: CollectionCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'word':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30'
      case 'phrase':
        return 'bg-green-500/20 text-green-600 border-green-500/30'
      case 'grammar':
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
        return '📚'
      default:
        return '📌'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'word':
        return 'Từ'
      case 'phrase':
        return 'Cụm từ'
      case 'grammar':
        return 'Ngữ pháp'
      default:
        return 'Khác'
    }
  }

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
          {item.content}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.item_type)}`}
        >
          {getTypeLabel(item.item_type)}
        </span>
      </div>

      {(item.pronunciation || item.ipa_notation) && (
        <div className="flex items-center gap-2 mb-2">
          {item.pronunciation && (
            <span className="text-sm text-text-secondary">{item.pronunciation}</span>
          )}
          {item.ipa_notation && (
            <span className="text-sm text-text-secondary font-mono">{item.ipa_notation}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>
          {/* word_type và phrase_type đã chuyển xuống definition */}
          {item.grammar_type && `Loại: ${item.grammar_type}`}
        </span>
        <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    </div>
  )
}

export default CollectionCard
