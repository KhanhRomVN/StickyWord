import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CollectionListPanel from './components/CollectionListPanel'
import CollectionDetailPanel from './components/CollectionDetailPanel'
import { vocabulary_items } from './types/vocabulary'
import { grammar_items } from './types/grammar'

const CollectionPage = () => {
  const [selectedItem, setSelectedItem] = useState<vocabulary_items | grammar_items | null>(null)
  const location = useLocation()
  const [filterType, setFilterType] = useState<'all' | vocabulary_items['item_type'] | 'grammar'>(
    'all'
  )

  useEffect(() => {
    const path = location.pathname

    if (path.includes('/collection/words')) {
      setFilterType('word')
    } else if (path.includes('/collection/phrases')) {
      setFilterType('phrase')
    } else if (path.includes('/collection/grammar')) {
      setFilterType('grammar')
    } else {
      setFilterType('all')
    }
  }, [location.pathname])

  const handleItemDeleted = async (itemId: string) => {
    setSelectedItem(null)
    // Trigger reload in CollectionListPanel by re-rendering
    window.dispatchEvent(new CustomEvent('item-deleted', { detail: { itemId } }))
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
