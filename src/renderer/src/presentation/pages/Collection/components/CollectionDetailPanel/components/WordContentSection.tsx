import { useEffect, useState } from 'react'
import type { API } from '../../../../../../../../preload/index'
import { vocabulary_items } from '../../../types/vocabulary'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import CustomTag from '../../../../../../components/common/CustomTag'
import Metadata from '../../../../../../components/common/Metadata'
import CustomButton from '../../../../../../components/common/CustomButton'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

declare global {
  interface Window {
    api?: API
  }
}

interface WordContentSectionProps {
  item: vocabulary_items
  onDelete?: (itemId: string) => void
  activeTab: 'information' | 'definitions' | 'metadata'
}

interface Definition {
  id: string
  vocabulary_item_id?: string
  meaning: string
  translation?: string
  usage_context?: string
  word_type?:
    | 'noun'
    | 'verb'
    | 'adjective'
    | 'adverb'
    | 'pronoun'
    | 'preposition'
    | 'conjunction'
    | 'interjection'
    | 'determiner'
    | 'exclamation'
  phrase_type?: 'idiom' | 'phrasal_verb' | 'collocation' | 'slang' | 'expression'
  created_at?: string
  examples: Array<{
    sentence: string
    translation?: string
  }>
}

interface FormData {
  content: string
  pronunciation: string
  definitions: Definition[]
  difficulty_level: number
  frequency_rank: number
  category: string
  tags: string[]
  metadata: Record<string, any>
}

const WORD_TYPES = [
  { value: 'noun', label: 'Noun' },
  { value: 'verb', label: 'Verb' },
  { value: 'adjective', label: 'Adjective' },
  { value: 'adverb', label: 'Adverb' },
  { value: 'pronoun', label: 'Pronoun' },
  { value: 'preposition', label: 'Preposition' },
  { value: 'conjunction', label: 'Conjunction' },
  { value: 'interjection', label: 'Interjection' },
  { value: 'determiner', label: 'Determiner' },
  { value: 'exclamation', label: 'Exclamation' }
]

const WordContentSection = ({ item, activeTab }: WordContentSectionProps) => {
  const [currentItem, setCurrentItem] = useState<vocabulary_items>(item)
  const [creatingExample, setCreatingExample] = useState<Record<number, boolean>>({})
  const [newExampleData, setNewExampleData] = useState<
    Record<number, { sentence: string; translation: string }>
  >({})

  const startCreateExample = (defIndex: number) => {
    setCreatingExample((prev) => ({ ...prev, [defIndex]: true }))
    setNewExampleData((prev) => ({ ...prev, [defIndex]: { sentence: '', translation: '' } }))
  }

  const cancelCreateExample = (defIndex: number) => {
    setCreatingExample((prev) => ({ ...prev, [defIndex]: false }))
    setNewExampleData((prev) => {
      const newData = { ...prev }
      delete newData[defIndex]
      return newData
    })
  }

  const confirmCreateExample = (defIndex: number) => {
    const data = newExampleData[defIndex]
    if (!data?.sentence.trim()) {
      alert('Please enter example sentence')
      return
    }

    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      newDefs[defIndex] = {
        ...newDefs[defIndex],
        examples: [
          ...newDefs[defIndex].examples,
          { sentence: data.sentence, translation: data.translation }
        ]
      }
      return { ...prev, definitions: newDefs }
    })

    // Move to new example
    const newIndex = formData.definitions[defIndex].examples.length
    goToExampleSlide(defIndex, newIndex)

    // Reset form
    setCreatingExample((prev) => ({ ...prev, [defIndex]: false }))
    setNewExampleData((prev) => {
      const newData = { ...prev }
      delete newData[defIndex]
      return newData
    })
  }

  const handleNewExampleChange = (
    defIndex: number,
    field: 'sentence' | 'translation',
    value: string
  ) => {
    setNewExampleData((prev) => ({
      ...prev,
      [defIndex]: {
        ...prev[defIndex],
        [field]: value
      }
    }))
  }

  useEffect(() => {
    setCurrentItem(item)
  }, [item])

  const getInitialDefinitions = (): Definition[] => {
    if (currentItem.metadata?.definitions && Array.isArray(currentItem.metadata.definitions)) {
      const mappedDefs = currentItem.metadata.definitions.map((def: any, index: number) => ({
        id: def.id || `def_${Date.now()}_${index}`,
        vocabulary_item_id: def.vocabulary_item_id || currentItem.id,
        meaning: def.meaning || '',
        translation: def.translation || '',
        usage_context: def.usage_context || '',
        word_type: def.word_type || '',
        phrase_type: def.phrase_type || undefined,
        created_at: def.created_at || new Date().toISOString(),
        examples: Array.isArray(def.examples)
          ? def.examples.map((ex: any) => ({
              sentence: ex.sentence || '',
              translation: ex.translation || ''
            }))
          : [{ sentence: '', translation: '' }]
      }))

      return mappedDefs
    }

    return [
      {
        id: '1',
        vocabulary_item_id: currentItem.id,
        meaning: '',
        translation: '',
        usage_context: '',
        word_type: undefined,
        phrase_type: undefined,
        created_at: new Date().toISOString(),
        examples: [{ sentence: '', translation: '' }]
      }
    ]
  }

  const [formData, setFormData] = useState<FormData>(() => {
    return {
      content: currentItem.content,
      pronunciation: currentItem.pronunciation || '',
      definitions: getInitialDefinitions(),
      difficulty_level: currentItem.difficulty_level || 0,
      frequency_rank: currentItem.frequency_rank || 0,
      category: currentItem.category || '',
      tags: currentItem.tags || [],
      metadata: currentItem.metadata || {}
    }
  })

  const [activeDefTab, setActiveDefTab] = useState<Record<number, 'definition' | 'example'>>({})
  const [exampleSlideIndex, setExampleSlideIndex] = useState<Record<number, number>>({})
  const [initialDefinitions, setInitialDefinitions] = useState<Definition[]>([])

  useEffect(() => {
    const newInitialDefs = getInitialDefinitions()
    const newFormData = {
      content: currentItem.content,
      pronunciation: currentItem.pronunciation || '',
      definitions: newInitialDefs,
      difficulty_level: currentItem.difficulty_level || 0,
      frequency_rank: currentItem.frequency_rank || 0,
      category: currentItem.category || '',
      tags: currentItem.tags || [],
      metadata: currentItem.metadata || {}
    }

    setInitialDefinitions(newInitialDefs)
    setFormData(newFormData)
    setActiveDefTab({})
    setExampleSlideIndex({})
  }, [currentItem.id, currentItem.metadata])

  const handleDifficultyChange = (value: string | string[]) => {
    const newValue = parseInt(typeof value === 'string' ? value : value[0])
    setFormData((prev) => ({
      ...prev,
      difficulty_level: newValue
    }))
  }

  const handleSaveDifficulty = async (value: string | string[]) => {
    const newValue = parseInt(typeof value === 'string' ? value : value[0])
    try {
      const updatedItem = {
        ...currentItem,
        difficulty_level: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_items)
        setCurrentItem(updatedItem as vocabulary_items)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating difficulty:', error)
    }
  }

  const handleFrequencyChange = (value: string | string[]) => {
    const newValue = parseInt(typeof value === 'string' ? value : value[0])
    setFormData((prev) => ({
      ...prev,
      frequency_rank: newValue
    }))
  }

  const handleSaveFrequency = async (value: string | string[]) => {
    const newValue = parseInt(typeof value === 'string' ? value : value[0])
    try {
      const updatedItem = {
        ...currentItem,
        frequency_rank: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_items)
        setCurrentItem(updatedItem as vocabulary_items)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating frequency:', error)
    }
  }

  const handleCategoryChange = (value: string | string[]) => {
    const newValue = typeof value === 'string' ? value : value[0]
    setFormData((prev) => ({
      ...prev,
      category: newValue
    }))
  }

  const handleSaveCategory = async (value: string | string[]) => {
    const newValue = typeof value === 'string' ? value : value[0]
    try {
      const updatedItem = {
        ...currentItem,
        category: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_items)
        setCurrentItem(updatedItem as vocabulary_items)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating category:', error)
    }
  }

  const handleTagsChange = async (newTags: string[]) => {
    setFormData((prev) => ({ ...prev, tags: newTags }))

    try {
      const updatedItem = {
        ...currentItem,
        tags: newTags,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_items)
        setCurrentItem(updatedItem as vocabulary_items)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating tags:', error)
    }
  }

  const handleWordTypeChange = (defIndex: number, value: string | string[]) => {
    const newValue = typeof value === 'string' ? value : value[0] || ''
    handleDefinitionChange(defIndex, 'word_type', newValue)
  }

  const handleSaveWordType = async (defIndex: number, value: string | string[]) => {
    const newValue = typeof value === 'string' ? value : value[0] || ''
    try {
      const updatedDefinitions = [...formData.definitions]
      updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], word_type: newValue }

      const updatedItem = {
        ...currentItem,
        metadata: {
          ...formData.metadata,
          definitions: updatedDefinitions
        },
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_items)
        setCurrentItem(updatedItem as vocabulary_items)
        setFormData((prev) => ({ ...prev, definitions: updatedDefinitions }))
        setInitialDefinitions(updatedDefinitions)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating word type:', error)
    }
  }

  const handleMetadataChange = async (newMetadata: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, metadata: newMetadata }))

    try {
      const updatedItem = {
        ...currentItem,
        metadata: newMetadata,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_items)
        setCurrentItem(updatedItem as vocabulary_items)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating metadata:', error)
    }
  }

  const handleDefinitionChange = (defIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      if (
        field === 'meaning' ||
        field === 'translation' ||
        field === 'usage_context' ||
        field === 'word_type'
      ) {
        newDefs[defIndex] = { ...newDefs[defIndex], [field]: value }
      }
      return { ...prev, definitions: newDefs }
    })
  }

  const addDefinition = () => {
    setFormData((prev) => ({
      ...prev,
      definitions: [
        ...prev.definitions,
        {
          id: `def_${Date.now()}_${prev.definitions.length}`,
          vocabulary_item_id: currentItem.id,
          meaning: '',
          translation: '',
          usage_context: '',
          word_type: undefined,
          phrase_type: undefined,
          created_at: new Date().toISOString(),
          examples: [{ sentence: '', translation: '' }]
        }
      ]
    }))
  }

  const removeDefinition = (index: number) => {
    if (formData.definitions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        definitions: prev.definitions.filter((_: Definition, i: number) => i !== index)
      }))
    }
  }

  const addExample = (defIndex: number) => {
    const isFirstExample = formData.definitions[defIndex].examples.length === 0

    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      newDefs[defIndex] = {
        ...newDefs[defIndex],
        examples: [...newDefs[defIndex].examples, { sentence: '', translation: '' }]
      }
      return { ...prev, definitions: newDefs }
    })

    // Auto switch to example tab when adding first example
    if (isFirstExample) {
      setActiveDefTab((prev) => ({ ...prev, [defIndex]: 'example' }))
    }
  }

  const removeExample = (defIndex: number, exIndex: number) => {
    if (formData.definitions[defIndex].examples.length > 1) {
      setFormData((prev) => {
        const newDefs = [...prev.definitions]
        newDefs[defIndex] = {
          ...newDefs[defIndex],
          examples: newDefs[defIndex].examples.filter((_: any, i: number) => i !== exIndex)
        }
        return { ...prev, definitions: newDefs }
      })

      // Adjust slide index if needed
      setExampleSlideIndex((prev) => {
        const currentIndex = prev[defIndex] || 0
        if (currentIndex >= exIndex && currentIndex > 0) {
          return { ...prev, [defIndex]: currentIndex - 1 }
        }
        return prev
      })
    }
  }

  const goToExampleSlide = (defIndex: number, slideIndex: number) => {
    setExampleSlideIndex((prev) => ({ ...prev, [defIndex]: slideIndex }))
  }

  const goToNextExample = (defIndex: number) => {
    const currentIndex = exampleSlideIndex[defIndex] || 0
    const maxIndex = formData.definitions[defIndex]?.examples.length - 1 || 0
    if (currentIndex < maxIndex) {
      goToExampleSlide(defIndex, currentIndex + 1)
    }
  }

  const goToPrevExample = (defIndex: number) => {
    const currentIndex = exampleSlideIndex[defIndex] || 0
    if (currentIndex > 0) {
      goToExampleSlide(defIndex, currentIndex - 1)
    }
  }

  // ✅ Handler để save field changes
  const handleSaveField = async (fieldKey: string, newValue: string) => {
    try {
      let updatedDefinitions = [...formData.definitions]
      let updatedItem: Partial<vocabulary_items> = {}

      if (fieldKey === 'content') {
        updatedItem.content = newValue
      } else if (fieldKey === 'pronunciation') {
        updatedItem.pronunciation = newValue
      } else if (fieldKey.startsWith('def_')) {
        const parts = fieldKey.split('_')
        const defIndex = parseInt(parts[1])
        const field = parts.slice(2).join('_')

        if (field === 'meaning') {
          updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], meaning: newValue }
        } else if (field === 'translation') {
          updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], translation: newValue }
        } else if (field === 'usage_context') {
          updatedDefinitions[defIndex] = {
            ...updatedDefinitions[defIndex],
            usage_context: newValue
          }
        }

        updatedItem.metadata = {
          ...formData.metadata,
          definitions: updatedDefinitions
        }
      } else if (fieldKey.startsWith('ex_')) {
        const parts = fieldKey.split('_')
        const defIndex = parseInt(parts[1])
        const exIndex = parseInt(parts[2])
        const field = parts.slice(3).join('_')

        const newExamples = [...updatedDefinitions[defIndex].examples]
        if (field === 'sentence') {
          newExamples[exIndex] = { ...newExamples[exIndex], sentence: newValue }
        } else if (field === 'translation') {
          newExamples[exIndex] = { ...newExamples[exIndex], translation: newValue }
        }
        updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], examples: newExamples }

        updatedItem.metadata = {
          ...formData.metadata,
          definitions: updatedDefinitions
        }
      }

      const finalItem = {
        ...currentItem,
        ...updatedItem,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(finalItem as vocabulary_items)
        setCurrentItem(finalItem as vocabulary_items)
        setFormData((prev) => ({
          ...prev,
          ...updatedItem,
          definitions: updatedDefinitions
        }))
        setInitialDefinitions(updatedDefinitions)
      } else {
        throw new Error('Database not connected')
      }
    } catch (error) {
      console.error('[WordContentSection] Error saving field:', error)
      throw error
    }
  }

  const renderInformationTab = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label="Word"
          value={formData.content}
          onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
          variant="default"
          size="sm"
          trackChanges={true}
          initialValue={currentItem.content}
          onSave={async (val) => await handleSaveField('content', val)}
        />

        <CustomInput
          label="Pronunciation (IPA)"
          value={formData.pronunciation}
          onChange={(val) => setFormData((prev) => ({ ...prev, pronunciation: val }))}
          variant="default"
          placeholder="vd: /ˌpɜːrsəˈvɪrəns/"
          size="sm"
          trackChanges={true}
          initialValue={currentItem.pronunciation || ''}
          onSave={async (val) => await handleSaveField('pronunciation', val)}
        />

        <CustomCombobox
          label="Difficulty"
          value={formData.difficulty_level > 0 ? formData.difficulty_level.toString() : ''}
          options={[
            { value: '1', label: 'Level 1 - Very Easy' },
            { value: '2', label: 'Level 2 - Easy' },
            { value: '3', label: 'Level 3' },
            { value: '4', label: 'Level 4' },
            { value: '5', label: 'Level 5 - Medium' },
            { value: '6', label: 'Level 6' },
            { value: '7', label: 'Level 7' },
            { value: '8', label: 'Level 8' },
            { value: '9', label: 'Level 9' },
            { value: '10', label: 'Level 10 - Very Hard' }
          ]}
          onChange={handleDifficultyChange}
          onSave={handleSaveDifficulty}
          size="sm"
        />

        <CustomCombobox
          label="Frequency"
          value={formData.frequency_rank > 0 ? formData.frequency_rank.toString() : ''}
          options={[
            { value: '1', label: 'Rank 1 - Very Rare' },
            { value: '2', label: 'Rank 2' },
            { value: '3', label: 'Rank 3' },
            { value: '4', label: 'Rank 4' },
            { value: '5', label: 'Rank 5 - Medium' },
            { value: '6', label: 'Rank 6' },
            { value: '7', label: 'Rank 7' },
            { value: '8', label: 'Rank 8' },
            { value: '9', label: 'Rank 9' },
            { value: '10', label: 'Rank 10 - Very Common' }
          ]}
          onChange={handleFrequencyChange}
          onSave={handleSaveFrequency}
          size="sm"
        />

        <CustomCombobox
          label="Category"
          value={formData.category}
          options={[
            { value: 'business', label: 'Business' },
            { value: 'daily', label: 'Daily' },
            { value: 'travel', label: 'Travel' },
            { value: 'academic', label: 'Academic' },
            { value: 'technical', label: 'Technical' },
            { value: 'slang', label: 'Slang' },
            { value: 'formal', label: 'Formal' }
          ]}
          onChange={handleCategoryChange}
          creatable={true}
          onSave={handleSaveCategory}
          size="sm"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <CustomTag
          tags={formData.tags}
          onTagsChange={handleTagsChange}
          placeholder="Add tag..."
          allowDuplicates={false}
          size="sm"
        />
      </div>
    </div>
  )

  const renderDefinitionsTab = () => {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-primary">Definitions & Examples</h3>
            <p className="text-sm text-text-secondary mt-1">
              {formData.definitions.length} definition{formData.definitions.length > 1 ? 's' : ''}{' '}
              total
            </p>
          </div>
          <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addDefinition}>
            Add definition
          </CustomButton>
        </div>

        <div className="space-y-5">
          {formData.definitions.map((def: Definition, defIndex: number) => {
            const currentTab = activeDefTab[defIndex] || 'definition'
            const currentSlide = exampleSlideIndex[defIndex] || 0

            return (
              <div
                key={def.id}
                className="group relative p-5 bg-gradient-to-br from-card-background to-card-background/50 border-2 border-border-default rounded-xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/*  HEADER */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-default">
                  <div className="flex items-center gap-4">
                    {/* Badge Number */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        [
                          'bg-blue-500',
                          'bg-green-500',
                          'bg-purple-500',
                          'bg-orange-500',
                          'bg-pink-500',
                          'bg-teal-500',
                          'bg-red-500',
                          'bg-indigo-500',
                          'bg-yellow-500',
                          'bg-cyan-500'
                        ][defIndex % 10]
                      }`}
                    >
                      <span className="text-white font-bold text-base">{defIndex + 1}</span>
                    </div>

                    {/* Tab Bar */}
                    <div className="flex items-center gap-1 p-1 bg-background/50 rounded-lg border border-border-default">
                      <button
                        onClick={() =>
                          setActiveDefTab((prev) => ({ ...prev, [defIndex]: 'definition' }))
                        }
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                          currentTab === 'definition'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-card-background'
                        }`}
                      >
                        Definition
                      </button>
                      <button
                        onClick={() =>
                          setActiveDefTab((prev) => ({ ...prev, [defIndex]: 'example' }))
                        }
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                          currentTab === 'example'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-card-background'
                        }`}
                      >
                        Example
                        <span
                          className={`px-1.5 py-0.5 text-xs rounded-full font-semibold ${
                            currentTab === 'example'
                              ? 'bg-white/20 text-white'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {def.examples.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {formData.definitions.length > 1 && (
                    <button
                      onClick={() => removeDefinition(defIndex)}
                      className="p-2 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove definition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* TAB CONTENT với Framer Motion */}
                <AnimatePresence mode="wait">
                  {currentTab === 'definition' && (
                    <motion.div
                      key={`def-content-${defIndex}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <CustomInput
                        label="Meaning (English)"
                        value={formData.definitions[defIndex]?.meaning || ''}
                        onChange={(val) => handleDefinitionChange(defIndex, 'meaning', val)}
                        variant="default"
                        placeholder="Enter English definition"
                        size="sm"
                        multiline={true}
                        minRows={1}
                        maxRows={10}
                        autoResize={true}
                        trackChanges={true}
                        initialValue={initialDefinitions[defIndex]?.meaning || ''}
                        onSave={async (val) =>
                          await handleSaveField(`def_${defIndex}_meaning`, val)
                        }
                      />

                      <CustomInput
                        label="Translation"
                        value={formData.definitions[defIndex]?.translation || ''}
                        onChange={(val) => handleDefinitionChange(defIndex, 'translation', val)}
                        variant="default"
                        placeholder="Enter Vietnamese translation"
                        size="sm"
                        multiline={true}
                        minRows={1}
                        maxRows={10}
                        autoResize={true}
                        trackChanges={true}
                        initialValue={initialDefinitions[defIndex]?.translation || ''}
                        onSave={async (val) =>
                          await handleSaveField(`def_${defIndex}_translation`, val)
                        }
                      />

                      <CustomInput
                        label="Usage Context"
                        value={formData.definitions[defIndex]?.usage_context || ''}
                        onChange={(val) => handleDefinitionChange(defIndex, 'usage_context', val)}
                        variant="default"
                        placeholder="When to use this definition (e.g., 'formal writing', 'spoken English')"
                        size="sm"
                        multiline={true}
                        minRows={1}
                        maxRows={5}
                        autoResize={true}
                        trackChanges={true}
                        initialValue={initialDefinitions[defIndex]?.usage_context || ''}
                        onSave={async (val) =>
                          await handleSaveField(`def_${defIndex}_usage_context`, val)
                        }
                      />

                      <div className="relative">
                        <CustomInput
                          label="Example sentence"
                          value={def.examples[currentSlide]?.sentence || ''}
                          onChange={(val) => {
                            const newDefs = [...formData.definitions]
                            const newExamples = [...newDefs[defIndex].examples]
                            newExamples[currentSlide] = {
                              ...newExamples[currentSlide],
                              sentence: val
                            }
                            newDefs[defIndex] = { ...newDefs[defIndex], examples: newExamples }
                            setFormData((prev) => ({ ...prev, definitions: newDefs }))
                          }}
                          variant="default"
                          placeholder="Example sentence"
                          size="sm"
                          multiline={true}
                          minRows={1}
                          maxRows={10}
                          autoResize={true}
                          trackChanges={true}
                          initialValue={
                            initialDefinitions[defIndex]?.examples[currentSlide]?.sentence || ''
                          }
                          onSave={async (val) =>
                            await handleSaveField(`ex_${defIndex}_${currentSlide}_sentence`, val)
                          }
                        />
                      </div>

                      <CustomCombobox
                        label="Type"
                        value={def.word_type || ''}
                        options={WORD_TYPES}
                        onChange={(val) => handleWordTypeChange(defIndex, val)}
                        onSave={(val) => handleSaveWordType(defIndex, val)}
                        placeholder="Select word type"
                        size="sm"
                      />
                    </motion.div>
                  )}

                  {currentTab === 'example' && (
                    <motion.div
                      key={`example-content-${defIndex}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Custom Example Slider */}
                      <div className="relative">
                        {def.examples.length > 0 ? (
                          <>
                            {/* Example Content */}
                            <div className="transition-all duration-200">
                              <div className="space-y-4">
                                <CustomInput
                                  label="Example sentence"
                                  value={def.examples[currentSlide]?.sentence || ''}
                                  onChange={(val) => {
                                    const newDefs = [...formData.definitions]
                                    const newExamples = [...newDefs[defIndex].examples]
                                    newExamples[currentSlide] = {
                                      ...newExamples[currentSlide],
                                      sentence: val
                                    }
                                    newDefs[defIndex] = {
                                      ...newDefs[defIndex],
                                      examples: newExamples
                                    }
                                    setFormData((prev) => ({ ...prev, definitions: newDefs }))
                                  }}
                                  variant="default"
                                  placeholder="Example sentence"
                                  size="sm"
                                  multiline={true}
                                  minRows={1}
                                  maxRows={10}
                                  autoResize={true}
                                  trackChanges={true}
                                  initialValue={
                                    initialDefinitions[defIndex]?.examples[currentSlide]
                                      ?.sentence || ''
                                  }
                                  onSave={async (val) =>
                                    await handleSaveField(
                                      `ex_${defIndex}_${currentSlide}_sentence`,
                                      val
                                    )
                                  }
                                />

                                <CustomInput
                                  label="Translate (example)"
                                  value={def.examples[currentSlide]?.translation || ''}
                                  onChange={(val) => {
                                    const newDefs = [...formData.definitions]
                                    const newExamples = [...newDefs[defIndex].examples]
                                    newExamples[currentSlide] = {
                                      ...newExamples[currentSlide],
                                      translation: val
                                    }
                                    newDefs[defIndex] = {
                                      ...newDefs[defIndex],
                                      examples: newExamples
                                    }
                                    setFormData((prev) => ({ ...prev, definitions: newDefs }))
                                  }}
                                  variant="default"
                                  placeholder="Translation"
                                  size="sm"
                                  multiline={true}
                                  minRows={1}
                                  maxRows={10}
                                  autoResize={true}
                                  trackChanges={true}
                                  initialValue={
                                    initialDefinitions[defIndex]?.examples[currentSlide]
                                      ?.translation || ''
                                  }
                                  onSave={async (val) =>
                                    await handleSaveField(
                                      `ex_${defIndex}_${currentSlide}_translation`,
                                      val
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* Pagination + Action Buttons */}
                            <div className="flex items-center justify-between mt-4">
                              {/* Left: Pagination */}
                              {def.examples.length > 1 ? (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => goToPrevExample(defIndex)}
                                    disabled={currentSlide === 0}
                                    className="p-2 rounded-lg bg-card-background border border-border-default hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                    title="Previous example"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>

                                  <span className="text-sm font-medium text-text-primary">
                                    {currentSlide + 1} / {def.examples.length}
                                  </span>

                                  <button
                                    onClick={() => goToNextExample(defIndex)}
                                    disabled={currentSlide === def.examples.length - 1}
                                    className="p-2 rounded-lg bg-card-background border border-border-default hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                    title="Next example"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div></div>
                              )}

                              {/* Right: Action Buttons */}
                              <div className="flex items-center gap-2">
                                {def.examples.length > 1 && (
                                  <button
                                    onClick={() => removeExample(defIndex, currentSlide)}
                                    className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                    title="Remove example"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                <CustomButton
                                  variant="ghost"
                                  size="sm"
                                  icon={Plus}
                                  onClick={() => startCreateExample(defIndex)}
                                  children={undefined}
                                ></CustomButton>
                              </div>
                            </div>

                            {/* Create Example Form */}
                            {creatingExample[defIndex] && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 p-4 bg-background/50 border border-border-default rounded-lg"
                              >
                                <h4 className="text-sm font-semibold text-text-primary mb-4">
                                  Create Example
                                </h4>
                                <div className="space-y-3">
                                  <CustomInput
                                    label="Example sentence"
                                    value={newExampleData[defIndex]?.sentence || ''}
                                    onChange={(val) =>
                                      handleNewExampleChange(defIndex, 'sentence', val)
                                    }
                                    variant="default"
                                    placeholder="Enter example sentence"
                                    size="sm"
                                    multiline={true}
                                    minRows={1}
                                    maxRows={10}
                                    autoResize={true}
                                  />
                                  <CustomInput
                                    label="Translate (example)"
                                    value={newExampleData[defIndex]?.translation || ''}
                                    onChange={(val) =>
                                      handleNewExampleChange(defIndex, 'translation', val)
                                    }
                                    variant="default"
                                    placeholder="Enter translation"
                                    size="sm"
                                    multiline={true}
                                    minRows={1}
                                    maxRows={10}
                                    autoResize={true}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <div className="w-auto">
                                      <CustomButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => cancelCreateExample(defIndex)}
                                      >
                                        Cancel
                                      </CustomButton>
                                    </div>
                                    <div className="w-auto">
                                      <CustomButton
                                        variant="primary"
                                        size="sm"
                                        onClick={() => confirmCreateExample(defIndex)}
                                      >
                                        Create
                                      </CustomButton>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <div className="p-8 text-center text-text-secondary">
                            <p className="mb-4">No examples yet</p>
                            <CustomButton
                              variant="secondary"
                              size="sm"
                              icon={Plus}
                              onClick={() => addExample(defIndex)}
                            >
                              Add first example
                            </CustomButton>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMetadataTab = () => (
    <div className="p-6">
      <Metadata
        metadata={formData.metadata}
        onMetadataChange={handleMetadataChange}
        readOnly={false}
        allowCreate={true}
        allowDelete={true}
        allowEdit={true}
        size="sm"
        collapsible={true}
        defaultExpanded={true}
      />
    </div>
  )

  return (
    <div className="h-full">
      {activeTab === 'information' && renderInformationTab()}
      {activeTab === 'definitions' && renderDefinitionsTab()}
      {activeTab === 'metadata' && renderMetadataTab()}
    </div>
  )
}

export default WordContentSection
