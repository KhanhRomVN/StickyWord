import { vocabulary_item } from '../types'

export const filterItemsByType = (
  items: vocabulary_item[],
  type: 'all' | vocabulary_item['item_type']
): vocabulary_item[] => {
  if (type === 'all') return items
  return items.filter((item) => item.item_type === type)
}

export const searchItems = (items: vocabulary_item[], searchTerm: string): vocabulary_item[] => {
  if (!searchTerm.trim()) return items

  const term = searchTerm.toLowerCase()
  return items.filter(
    (item) =>
      item.content.toLowerCase().includes(term) ||
      item.pronunciation?.toLowerCase().includes(term) ||
      item.ipa_notation?.toLowerCase().includes(term)
  )
}

export const sortItems = (
  items: vocabulary_item[],
  sortBy: 'newest' | 'oldest' | 'content'
): vocabulary_item[] => {
  const sorted = [...items]

  switch (sortBy) {
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    case 'content':
      return sorted.sort((a, b) => a.content.localeCompare(b.content))
    default:
      return sorted
  }
}

export const getItemTypeColor = (type: string): string => {
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

export const getItemTypeLabel = (type: string): string => {
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

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
