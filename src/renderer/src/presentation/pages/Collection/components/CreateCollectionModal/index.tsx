import { useState, useEffect } from 'react'
import CreateWordContent from './components/CreateWordContent'
import CreatePhraseContent from './components/CreatePhraseContent'
import CreateGrammarContent from './components/CreateGrammarContent'
import { vocabulary_item } from '../../types/vocabulary'
import { grammar_item } from '../../types/grammar'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[] | grammar_item[]) => void
  defaultType?: 'word' | 'phrase' | 'grammar'
}

type CollectionType = 'words' | 'phrases' | 'grammar' | 'pronunciation'

const CreateCollectionModal = ({
  isOpen,
  onClose,
  onCreateSuccess,
  defaultType
}: CreateCollectionModalProps) => {
  const [collectionType, setCollectionType] = useState<CollectionType>('words')

  // Set collection type from defaultType prop, fallback to 'words'
  useEffect(() => {
    if (isOpen && defaultType) {
      if (defaultType === 'word') {
        setCollectionType('words')
      } else if (defaultType === 'phrase') {
        setCollectionType('phrases')
      } else if (defaultType === 'grammar') {
        setCollectionType('grammar')
      }
    }
  }, [isOpen, defaultType])

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
