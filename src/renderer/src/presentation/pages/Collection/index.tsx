import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CollectionListPanel from './components/CollectionListPanel'
import CollectionDetailPanel from './components/CollectionDetailPanel'
import { vocabulary_item } from './types'

const CollectionPage = () => {
  const [selectedItem, setSelectedItem] = useState<vocabulary_item | null>(null)
  const location = useLocation()
  const [filterType, setFilterType] = useState<'all' | vocabulary_item['item_type']>('all')

  // Auto filter based on route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/content/words')) {
      setFilterType('word')
    } else if (path.includes('/content/phrases')) {
      setFilterType('phrase')
    } else if (path.includes('/content/grammar')) {
      setFilterType('grammar')
    } else if (path.includes('/content/pronunciation')) {
      setFilterType('all') // hoặc có thể thêm logic riêng cho pronunciation
    } else {
      setFilterType('all')
    }
  }, [location.pathname])

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <div className="w-[30%] h-full border-r border-border-default">
        <CollectionListPanel
          onSelectItem={setSelectedItem}
          selectedItem={selectedItem}
          defaultFilterType={filterType}
        />
      </div>
      <div className="w-[70%] h-full">
        <CollectionDetailPanel selectedItem={selectedItem} />
      </div>
    </div>
  )
}

export default CollectionPage
