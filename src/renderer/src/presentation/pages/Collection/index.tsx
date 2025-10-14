// File: Collection/index.tsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CollectionListPanel from './components/CollectionListPanel'
import CollectionDetailPanel from './components/CollectionDetailPanel'
import { vocabulary_item } from './types/vocabulary'

const CollectionPage = () => {
  const [selectedItem, setSelectedItem] = useState<vocabulary_item | null>(null)
  const location = useLocation()
  const [filterType, setFilterType] = useState<'all' | vocabulary_item['item_type']>('all')

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/collection/words')) {
      setFilterType('word') // ✅ Không có 's'
    } else if (path.includes('/collection/phrases')) {
      setFilterType('phrase') // ✅ Không có 's'
    } else if (path.includes('/collection/grammar')) {
      setFilterType('grammar') // ✅ Thêm case này
    } else {
      setFilterType('all')
    }
  }, [location.pathname])

  const handleItemDeleted = (itemId: string) => {
    console.log('[CollectionPage] Item deleted:', itemId)
    // Clear selection
    setSelectedItem(null)
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <div className="w-[30%] h-full border-r border-border-default">
        <CollectionListPanel
          onSelectItem={setSelectedItem}
          selectedItem={selectedItem}
          defaultFilterType={filterType}
          onItemDeleted={handleItemDeleted}
        />
      </div>
      <div className="w-[70%] h-full">
        <CollectionDetailPanel selectedItem={selectedItem} onItemDeleted={handleItemDeleted} />
      </div>
    </div>
  )
}

export default CollectionPage
