import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CreateWordContent from './components/CreateWordContent'
import CreatePhraseContent from './components/CreatePhraseContent'
import CreateGrammarContent from './components/CreateGrammarContent'
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[] | grammar_item[]) => void
}

type CollectionType = 'words' | 'phrases' | 'grammar' | 'pronunciation'

const CreateCollectionModal = ({
  isOpen,
  onClose,
  onCreateSuccess
}: CreateCollectionModalProps) => {
  const location = useLocation()
  const [collectionType, setCollectionType] = useState<CollectionType>('words')

  // Auto-detect collection type from URL
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/collection/words')) {
      setCollectionType('words')
    } else if (path.includes('/collection/phrases')) {
      setCollectionType('phrases')
    } else if (path.includes('/collection/grammar')) {
      setCollectionType('grammar')
    } else if (path.includes('/collection/pronunciation')) {
      setCollectionType('pronunciation')
    }
  }, [location.pathname])

  const handleCreateSuccess = (items: any[]) => {
    onCreateSuccess?.(items)
  }

  return (
    <>
      {collectionType === 'words' && (
        <CreateWordContent
          isOpen={isOpen}
          onClose={onClose}
          onCreateSuccess={handleCreateSuccess}
        />
      )}

      {collectionType === 'phrases' && (
        <CreatePhraseContent
          isOpen={isOpen}
          onClose={onClose}
          onCreateSuccess={handleCreateSuccess}
        />
      )}

      {collectionType === 'grammar' && (
        <CreateGrammarContent
          isOpen={isOpen}
          onClose={onClose}
          onCreateSuccess={handleCreateSuccess}
        />
      )}
    </>
  )
}

export default CreateCollectionModal
