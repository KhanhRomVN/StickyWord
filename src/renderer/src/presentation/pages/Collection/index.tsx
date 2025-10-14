import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CollectionListPanel from './components/CollectionListPanel'
import CollectionDetailPanel from './components/CollectionDetailPanel'
import { vocabulary_item } from './types/vocabulary'
import { grammar_item } from './types/grammar' // ✅ Import grammar_item

const CollectionPage = () => {
  const [selectedItem, setSelectedItem] = useState<vocabulary_item | grammar_item | null>(null) // ✅ Add grammar_item
  const location = useLocation()
  const [filterType, setFilterType] = useState<'all' | vocabulary_item['item_type']>('all')

  useEffect(() => {
    const path = location.pathname
    console.log('[CollectionPage] Route changed:', path)

    if (path.includes('/collection/words')) {
      console.log('[CollectionPage] Setting filter: word')
      setFilterType('word')
    } else if (path.includes('/collection/phrases')) {
      console.log('[CollectionPage] Setting filter: phrase')
      setFilterType('phrase')
    } else if (path.includes('/collection/grammar')) {
      console.log('[CollectionPage] Setting filter: grammar')
      setFilterType('grammar')
    } else {
      console.log('[CollectionPage] Setting filter: all')
      setFilterType('all')
    }
  }, [location.pathname])

  const handleItemDeleted = (itemId: string) => {
    console.log('[CollectionPage] Item deleted:', itemId)
    setSelectedItem(null)
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <div className="w-[30%] h-full border-r border-border-default">
        <CollectionListPanel
          onSelectItem={setSelectedItem}
          selectedItem={selectedItem}
          defaultFilterType={filterType}
          onItemDeleted={handleItemDeleted} // ✅ Pass callback
        />
      </div>
      <div className="w-[70%] h-full">
        <CollectionDetailPanel selectedItem={selectedItem} onItemDeleted={handleItemDeleted} />
      </div>
    </div>
  )
}

export default CollectionPage
