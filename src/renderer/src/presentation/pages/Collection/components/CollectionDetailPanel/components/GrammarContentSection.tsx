import { useEffect, useState } from 'react'
import { grammar_item } from '../../../types/grammar'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import CustomTag from '../../../../../../components/common/CustomTag'
import Metadata from '../../../../../../components/common/Metadata'
import CustomButton from '../../../../../../components/common/CustomButton'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface GrammarContentSectionProps {
  item: grammar_item
  onDelete?: (itemId: string) => void
  activeTab: 'information' | 'definitions' | 'metadata'
}

interface Definition {
  id: string
  description: string
  explanation: string
  structure?: string
  translation?: string
}

interface Example {
  id: string
  sentence: string
  translation?: string
  usage_note?: string
}

interface CommonMistake {
  id: string
  incorrect: string
  correct: string
  explanation: string
}

interface FormData {
  title: string
  item_type: 'tense' | 'structure' | 'rule' | 'pattern'
  definitions: Definition[]
  examples: Example[]
  commonMistakes: CommonMistake[]
  difficulty_level: number
  frequency_rank: number
  category: string
  tags: string[]
  metadata: Record<string, any>
}

const GRAMMAR_ITEM_TYPES = [
  { value: 'tense', label: 'Tense' },
  { value: 'structure', label: 'Structure' },
  { value: 'rule', label: 'Rule' },
  { value: 'pattern', label: 'Pattern' }
]

const GrammarContentSection = ({ item, onDelete, activeTab }: GrammarContentSectionProps) => {
  const [currentItem, setCurrentItem] = useState<grammar_item>(item)
  const [creatingExample, setCreatingExample] = useState(false)
  const [creatingMistake, setCreatingMistake] = useState(false)
  const [newExampleData, setNewExampleData] = useState({
    sentence: '',
    translation: '',
    usage_note: ''
  })
  const [newMistakeData, setNewMistakeData] = useState({
    incorrect: '',
    correct: '',
    explanation: ''
  })

  // Example slider state
  const [exampleSlideIndex, setExampleSlideIndex] = useState(0)
  const [mistakeSlideIndex, setMistakeSlideIndex] = useState(0)

  useEffect(() => {
    setCurrentItem(item)
  }, [item])

  const getInitialDefinitions = (): Definition[] => {
    if (currentItem.metadata?.definitions && Array.isArray(currentItem.metadata.definitions)) {
      return currentItem.metadata.definitions.map((def: any, index: number) => ({
        id: def.id || `def_${Date.now()}_${index}`,
        description: def.description || '',
        explanation: def.explanation || '',
        structure: def.structure || '',
        translation: def.translation || ''
      }))
    }
    return [
      {
        id: '1',
        description: '',
        explanation: '',
        structure: '',
        translation: ''
      }
    ]
  }

  const getInitialExamples = (): Example[] => {
    if (currentItem.metadata?.examples && Array.isArray(currentItem.metadata.examples)) {
      return currentItem.metadata.examples.map((ex: any, index: number) => ({
        id: ex.id || `ex_${Date.now()}_${index}`,
        sentence: ex.sentence || '',
        translation: ex.translation || '',
        usage_note: ex.usage_note || ''
      }))
    }
    return [{ id: '1', sentence: '', translation: '', usage_note: '' }]
  }

  const getInitialCommonMistakes = (): CommonMistake[] => {
    if (
      currentItem.metadata?.commonMistakes &&
      Array.isArray(currentItem.metadata.commonMistakes)
    ) {
      return currentItem.metadata.commonMistakes.map((mistake: any, index: number) => ({
        id: mistake.id || `mistake_${Date.now()}_${index}`,
        incorrect: mistake.incorrect || '',
        correct: mistake.correct || '',
        explanation: mistake.explanation || ''
      }))
    }
    return [{ id: '1', incorrect: '', correct: '', explanation: '' }]
  }

  const [formData, setFormData] = useState<FormData>({
    title: currentItem.title,
    item_type: currentItem.item_type,
    definitions: getInitialDefinitions(),
    examples: getInitialExamples(),
    commonMistakes: getInitialCommonMistakes(),
    difficulty_level: currentItem.difficulty_level || 0,
    frequency_rank: currentItem.frequency_rank || 0,
    category: currentItem.category || '',
    tags: currentItem.tags || [],
    metadata: currentItem.metadata || {}
  })

  // Cache initial data
  const [initialData, setInitialData] = useState({
    definitions: getInitialDefinitions(),
    examples: getInitialExamples(),
    commonMistakes: getInitialCommonMistakes()
  })

  useEffect(() => {
    const newInitialData = {
      definitions: getInitialDefinitions(),
      examples: getInitialExamples(),
      commonMistakes: getInitialCommonMistakes()
    }
    setInitialData(newInitialData)
  }, [currentItem.id])

  useEffect(() => {
    setFormData({
      title: currentItem.title,
      item_type: currentItem.item_type,
      definitions: getInitialDefinitions(),
      examples: getInitialExamples(),
      commonMistakes: getInitialCommonMistakes(),
      difficulty_level: currentItem.difficulty_level || 0,
      frequency_rank: currentItem.frequency_rank || 0,
      category: currentItem.category || '',
      tags: currentItem.tags || [],
      metadata: currentItem.metadata || {}
    })
    setExampleSlideIndex(0)
    setMistakeSlideIndex(0)
  }, [currentItem.id])

  const handleSaveField = async (fieldKey: string, newValue: string) => {
    try {
      let updatedDefinitions = [...formData.definitions]
      let updatedExamples = [...formData.examples]
      let updatedMistakes = [...formData.commonMistakes]
      let updatedItem: Partial<grammar_item> = {}

      if (fieldKey === 'title') {
        updatedItem.title = newValue
      } else if (fieldKey.startsWith('def_')) {
        const parts = fieldKey.split('_')
        const defIndex = parseInt(parts[1])
        const field = parts.slice(2).join('_')

        if (field === 'description') {
          updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], description: newValue }
        } else if (field === 'explanation') {
          updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], explanation: newValue }
        } else if (field === 'structure') {
          updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], structure: newValue }
        } else if (field === 'translation') {
          updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], translation: newValue }
        }

        updatedItem.metadata = {
          ...formData.metadata,
          definitions: updatedDefinitions
        }
      } else if (fieldKey.startsWith('ex_')) {
        const parts = fieldKey.split('_')
        const exIndex = parseInt(parts[1])
        const field = parts.slice(2).join('_')

        if (field === 'sentence') {
          updatedExamples[exIndex] = { ...updatedExamples[exIndex], sentence: newValue }
        } else if (field === 'translation') {
          updatedExamples[exIndex] = { ...updatedExamples[exIndex], translation: newValue }
        } else if (field === 'usage_note') {
          updatedExamples[exIndex] = { ...updatedExamples[exIndex], usage_note: newValue }
        }

        updatedItem.metadata = {
          ...formData.metadata,
          examples: updatedExamples
        }
      } else if (fieldKey.startsWith('mistake_')) {
        const parts = fieldKey.split('_')
        const mistakeIndex = parseInt(parts[1])
        const field = parts.slice(2).join('_')

        if (field === 'incorrect') {
          updatedMistakes[mistakeIndex] = { ...updatedMistakes[mistakeIndex], incorrect: newValue }
        } else if (field === 'correct') {
          updatedMistakes[mistakeIndex] = { ...updatedMistakes[mistakeIndex], correct: newValue }
        } else if (field === 'explanation') {
          updatedMistakes[mistakeIndex] = {
            ...updatedMistakes[mistakeIndex],
            explanation: newValue
          }
        }

        updatedItem.metadata = {
          ...formData.metadata,
          commonMistakes: updatedMistakes
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
        await db.updateGrammarItem(finalItem as grammar_item)
        setCurrentItem(finalItem as grammar_item)
        setFormData((prev) => ({
          ...prev,
          ...updatedItem,
          definitions: updatedDefinitions,
          examples: updatedExamples,
          commonMistakes: updatedMistakes
        }))
        setInitialData({
          definitions: updatedDefinitions,
          examples: updatedExamples,
          commonMistakes: updatedMistakes
        })
      } else {
        throw new Error('Database not connected')
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error saving field:', error)
      throw error
    }
  }

  const handleItemTypeChange = (value: string | string[]) => {
    const newValue = (typeof value === 'string' ? value : value[0]) as any
    setFormData((prev) => ({
      ...prev,
      item_type: newValue
    }))
  }

  const handleSaveItemType = async (value: string | string[]) => {
    const newValue = (typeof value === 'string' ? value : value[0]) as any
    try {
      const updatedItem = {
        ...currentItem,
        item_type: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateGrammarItem(updatedItem as grammar_item)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating item type:', error)
    }
  }

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
        await db.updateGrammarItem(updatedItem as grammar_item)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating difficulty:', error)
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
        await db.updateGrammarItem(updatedItem as grammar_item)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating frequency:', error)
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
        await db.updateGrammarItem(updatedItem as grammar_item)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating category:', error)
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
        await db.updateGrammarItem(updatedItem as grammar_item)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating tags:', error)
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
        await db.updateGrammarItem(updatedItem as grammar_item)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating metadata:', error)
    }
  }

  const addDefinition = () => {
    setFormData((prev) => ({
      ...prev,
      definitions: [
        ...prev.definitions,
        {
          id: `def_${Date.now()}_${prev.definitions.length}`,
          description: '',
          explanation: '',
          structure: '',
          translation: ''
        }
      ]
    }))
  }

  const removeDefinition = (index: number) => {
    if (formData.definitions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        definitions: prev.definitions.filter((_, i) => i !== index)
      }))
    }
  }

  const addExample = () => {
    const isFirstExample = formData.examples.length === 0

    setFormData((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        {
          id: `ex_${Date.now()}_${prev.examples.length}`,
          sentence: '',
          translation: '',
          usage_note: ''
        }
      ]
    }))

    // Move to new example if first one
    if (isFirstExample) {
      setExampleSlideIndex(formData.examples.length)
    }
  }

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      setFormData((prev) => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index)
      }))

      // Adjust slide index if needed
      if (exampleSlideIndex >= index && exampleSlideIndex > 0) {
        setExampleSlideIndex(exampleSlideIndex - 1)
      }
    }
  }

  const addMistake = () => {
    const isFirstMistake = formData.commonMistakes.length === 0

    setFormData((prev) => ({
      ...prev,
      commonMistakes: [
        ...prev.commonMistakes,
        {
          id: `mistake_${Date.now()}_${prev.commonMistakes.length}`,
          incorrect: '',
          correct: '',
          explanation: ''
        }
      ]
    }))

    // Move to new mistake if first one
    if (isFirstMistake) {
      setMistakeSlideIndex(formData.commonMistakes.length)
    }
  }

  const removeMistake = (index: number) => {
    if (formData.commonMistakes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        commonMistakes: prev.commonMistakes.filter((_, i) => i !== index)
      }))

      // Adjust slide index if needed
      if (mistakeSlideIndex >= index && mistakeSlideIndex > 0) {
        setMistakeSlideIndex(mistakeSlideIndex - 1)
      }
    }
  }

  const goToExampleSlide = (slideIndex: number) => {
    setExampleSlideIndex(slideIndex)
  }

  const goToNextExample = () => {
    if (exampleSlideIndex < formData.examples.length - 1) {
      setExampleSlideIndex(exampleSlideIndex + 1)
    }
  }

  const goToPrevExample = () => {
    if (exampleSlideIndex > 0) {
      setExampleSlideIndex(exampleSlideIndex - 1)
    }
  }

  const goToMistakeSlide = (slideIndex: number) => {
    setMistakeSlideIndex(slideIndex)
  }

  const goToNextMistake = () => {
    if (mistakeSlideIndex < formData.commonMistakes.length - 1) {
      setMistakeSlideIndex(mistakeSlideIndex + 1)
    }
  }

  const goToPrevMistake = () => {
    if (mistakeSlideIndex > 0) {
      setMistakeSlideIndex(mistakeSlideIndex - 1)
    }
  }

  const startCreateExample = () => {
    setCreatingExample(true)
    setNewExampleData({ sentence: '', translation: '', usage_note: '' })
  }

  const cancelCreateExample = () => {
    setCreatingExample(false)
    setNewExampleData({ sentence: '', translation: '', usage_note: '' })
  }

  const confirmCreateExample = () => {
    if (!newExampleData.sentence.trim()) {
      alert('Please enter example sentence')
      return
    }

    setFormData((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        {
          id: `ex_${Date.now()}_${prev.examples.length}`,
          sentence: newExampleData.sentence,
          translation: newExampleData.translation,
          usage_note: newExampleData.usage_note
        }
      ]
    }))

    // Move to new example
    setExampleSlideIndex(formData.examples.length)

    // Reset form
    setCreatingExample(false)
    setNewExampleData({ sentence: '', translation: '', usage_note: '' })
  }

  const startCreateMistake = () => {
    setCreatingMistake(true)
    setNewMistakeData({ incorrect: '', correct: '', explanation: '' })
  }

  const cancelCreateMistake = () => {
    setCreatingMistake(false)
    setNewMistakeData({ incorrect: '', correct: '', explanation: '' })
  }

  const confirmCreateMistake = () => {
    if (!newMistakeData.incorrect.trim() || !newMistakeData.correct.trim()) {
      alert('Please enter both incorrect and correct examples')
      return
    }

    setFormData((prev) => ({
      ...prev,
      commonMistakes: [
        ...prev.commonMistakes,
        {
          id: `mistake_${Date.now()}_${prev.commonMistakes.length}`,
          incorrect: newMistakeData.incorrect,
          correct: newMistakeData.correct,
          explanation: newMistakeData.explanation
        }
      ]
    }))

    // Move to new mistake
    setMistakeSlideIndex(formData.commonMistakes.length)

    // Reset form
    setCreatingMistake(false)
    setNewMistakeData({ incorrect: '', correct: '', explanation: '' })
  }

  const renderInformationTab = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label="Title"
          value={formData.title}
          onChange={(val) => setFormData((prev) => ({ ...prev, title: val }))}
          variant="default"
          size="sm"
          trackChanges={true}
          initialValue={currentItem.title}
          onSave={async (val) => await handleSaveField('title', val)}
        />

        <CustomCombobox
          label="Item Type"
          value={formData.item_type}
          options={GRAMMAR_ITEM_TYPES}
          onChange={handleItemTypeChange}
          onSave={handleSaveItemType}
          size="sm"
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
            { value: 'tenses', label: 'Tenses' },
            { value: 'conditionals', label: 'Conditionals' },
            { value: 'passive', label: 'Passive Voice' },
            { value: 'reported_speech', label: 'Reported Speech' },
            { value: 'modals', label: 'Modal Verbs' }
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

  const renderDefinitionsTab = () => (
    <div className="p-6 space-y-6">
      {/* Definitions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Definitions</h3>
          <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addDefinition}>
            Add definition
          </CustomButton>
        </div>

        <div className="space-y-4">
          {formData.definitions.map((def: Definition, defIndex: number) => (
            <div key={def.id} className="p-4 border border-border-default rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  Definition {defIndex + 1}
                </span>
                {formData.definitions.length > 1 && (
                  <button
                    onClick={() => removeDefinition(defIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <CustomInput
                  label="Description"
                  value={def.description}
                  onChange={(val) => {
                    const newDefs = [...formData.definitions]
                    newDefs[defIndex] = { ...newDefs[defIndex], description: val }
                    setFormData((prev) => ({ ...prev, definitions: newDefs }))
                  }}
                  variant="default"
                  placeholder="Brief description"
                  size="sm"
                  multiline={true}
                  minRows={1}
                  maxRows={10}
                  autoResize={true}
                  trackChanges={true}
                  initialValue={initialData.definitions[defIndex]?.description || ''}
                  onSave={async (val) => await handleSaveField(`def_${defIndex}_description`, val)}
                />

                <CustomInput
                  label="Explanation"
                  value={def.explanation}
                  onChange={(val) => {
                    const newDefs = [...formData.definitions]
                    newDefs[defIndex] = { ...newDefs[defIndex], explanation: val }
                    setFormData((prev) => ({ ...prev, definitions: newDefs }))
                  }}
                  variant="default"
                  placeholder="Detailed explanation"
                  size="sm"
                  multiline={true}
                  minRows={1}
                  maxRows={10}
                  autoResize={true}
                  trackChanges={true}
                  initialValue={initialData.definitions[defIndex]?.explanation || ''}
                  onSave={async (val) => await handleSaveField(`def_${defIndex}_explanation`, val)}
                />

                <CustomInput
                  label="Structure"
                  value={def.structure || ''}
                  onChange={(val) => {
                    const newDefs = [...formData.definitions]
                    newDefs[defIndex] = { ...newDefs[defIndex], structure: val }
                    setFormData((prev) => ({ ...prev, definitions: newDefs }))
                  }}
                  variant="default"
                  placeholder="Grammar structure or formula"
                  size="sm"
                  trackChanges={true}
                  initialValue={initialData.definitions[defIndex]?.structure || ''}
                  onSave={async (val) => await handleSaveField(`def_${defIndex}_structure`, val)}
                />

                <CustomInput
                  label="Translation"
                  value={def.translation || ''}
                  onChange={(val) => {
                    const newDefs = [...formData.definitions]
                    newDefs[defIndex] = { ...newDefs[defIndex], translation: val }
                    setFormData((prev) => ({ ...prev, definitions: newDefs }))
                  }}
                  variant="default"
                  placeholder="Vietnamese translation"
                  size="sm"
                  multiline={true}
                  minRows={1}
                  maxRows={10}
                  autoResize={true}
                  trackChanges={true}
                  initialValue={initialData.definitions[defIndex]?.translation || ''}
                  onSave={async (val) => await handleSaveField(`def_${defIndex}_translation`, val)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Examples Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Examples</h3>
          <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addExample}>
            Add example
          </CustomButton>
        </div>

        {formData.examples.length > 0 ? (
          <div className="space-y-4">
            {/* Example Slider */}
            <div className="relative p-4 border border-border-default rounded-lg">
              <div className="transition-all duration-200">
                <div className="space-y-4">
                  <CustomInput
                    label="Example sentence"
                    value={formData.examples[exampleSlideIndex]?.sentence || ''}
                    onChange={(val) => {
                      const newExamples = [...formData.examples]
                      newExamples[exampleSlideIndex] = {
                        ...newExamples[exampleSlideIndex],
                        sentence: val
                      }
                      setFormData((prev) => ({ ...prev, examples: newExamples }))
                    }}
                    variant="default"
                    placeholder="Example sentence"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                    trackChanges={true}
                    initialValue={initialData.examples[exampleSlideIndex]?.sentence || ''}
                    onSave={async (val) =>
                      await handleSaveField(`ex_${exampleSlideIndex}_sentence`, val)
                    }
                  />

                  <CustomInput
                    label="Translate (example)"
                    value={formData.examples[exampleSlideIndex]?.translation || ''}
                    onChange={(val) => {
                      const newExamples = [...formData.examples]
                      newExamples[exampleSlideIndex] = {
                        ...newExamples[exampleSlideIndex],
                        translation: val
                      }
                      setFormData((prev) => ({ ...prev, examples: newExamples }))
                    }}
                    variant="default"
                    placeholder="Translation"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                    trackChanges={true}
                    initialValue={initialData.examples[exampleSlideIndex]?.translation || ''}
                    onSave={async (val) =>
                      await handleSaveField(`ex_${exampleSlideIndex}_translation`, val)
                    }
                  />

                  <CustomInput
                    label="Usage note"
                    value={formData.examples[exampleSlideIndex]?.usage_note || ''}
                    onChange={(val) => {
                      const newExamples = [...formData.examples]
                      newExamples[exampleSlideIndex] = {
                        ...newExamples[exampleSlideIndex],
                        usage_note: val
                      }
                      setFormData((prev) => ({ ...prev, examples: newExamples }))
                    }}
                    variant="default"
                    placeholder="Usage note"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                    trackChanges={true}
                    initialValue={initialData.examples[exampleSlideIndex]?.usage_note || ''}
                    onSave={async (val) =>
                      await handleSaveField(`ex_${exampleSlideIndex}_usage_note`, val)
                    }
                  />
                </div>
              </div>

              {/* Pagination + Action Buttons */}
              <div className="flex items-center justify-between mt-4">
                {/* Left: Pagination */}
                {formData.examples.length > 1 ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToPrevExample}
                      disabled={exampleSlideIndex === 0}
                      className="p-2 rounded-lg bg-card-background border border-border-default hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      title="Previous example"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-sm font-medium text-text-primary">
                      {exampleSlideIndex + 1} / {formData.examples.length}
                    </span>

                    <button
                      onClick={goToNextExample}
                      disabled={exampleSlideIndex === formData.examples.length - 1}
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
                  {formData.examples.length > 1 && (
                    <button
                      onClick={() => removeExample(exampleSlideIndex)}
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
                    onClick={startCreateExample}
                    children={undefined}
                  ></CustomButton>
                </div>
              </div>
            </div>

            {/* Create Example Form */}
            {creatingExample && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-background/50 border border-border-default rounded-lg"
              >
                <h4 className="text-sm font-semibold text-text-primary mb-4">Create Example</h4>
                <div className="space-y-3">
                  <CustomInput
                    label="Example sentence"
                    value={newExampleData.sentence}
                    onChange={(val) => setNewExampleData((prev) => ({ ...prev, sentence: val }))}
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
                    value={newExampleData.translation}
                    onChange={(val) => setNewExampleData((prev) => ({ ...prev, translation: val }))}
                    variant="default"
                    placeholder="Enter translation"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                  />
                  <CustomInput
                    label="Usage note"
                    value={newExampleData.usage_note}
                    onChange={(val) => setNewExampleData((prev) => ({ ...prev, usage_note: val }))}
                    variant="default"
                    placeholder="Enter usage note"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                  />
                  <div className="flex justify-end gap-2">
                    <div className="w-auto">
                      <CustomButton variant="ghost" size="sm" onClick={cancelCreateExample}>
                        Cancel
                      </CustomButton>
                    </div>
                    <div className="w-auto">
                      <CustomButton variant="primary" size="sm" onClick={confirmCreateExample}>
                        Create
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-text-secondary">
            <p className="mb-4">No examples yet</p>
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addExample}>
              Add first example
            </CustomButton>
          </div>
        )}
      </div>

      {/* Common Mistakes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Common Mistakes</h3>
          <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addMistake}>
            Add mistake
          </CustomButton>
        </div>

        {formData.commonMistakes.length > 0 ? (
          <div className="space-y-4">
            {/* Mistake Slider */}
            <div className="relative p-4 border border-border-default rounded-lg">
              <div className="transition-all duration-200">
                <div className="space-y-4">
                  <CustomInput
                    label="Incorrect example"
                    value={formData.commonMistakes[mistakeSlideIndex]?.incorrect || ''}
                    onChange={(val) => {
                      const newMistakes = [...formData.commonMistakes]
                      newMistakes[mistakeSlideIndex] = {
                        ...newMistakes[mistakeSlideIndex],
                        incorrect: val
                      }
                      setFormData((prev) => ({ ...prev, commonMistakes: newMistakes }))
                    }}
                    variant="default"
                    placeholder="Incorrect example"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                    trackChanges={true}
                    initialValue={initialData.commonMistakes[mistakeSlideIndex]?.incorrect || ''}
                    onSave={async (val) =>
                      await handleSaveField(`mistake_${mistakeSlideIndex}_incorrect`, val)
                    }
                  />

                  <CustomInput
                    label="Correct example"
                    value={formData.commonMistakes[mistakeSlideIndex]?.correct || ''}
                    onChange={(val) => {
                      const newMistakes = [...formData.commonMistakes]
                      newMistakes[mistakeSlideIndex] = {
                        ...newMistakes[mistakeSlideIndex],
                        correct: val
                      }
                      setFormData((prev) => ({ ...prev, commonMistakes: newMistakes }))
                    }}
                    variant="default"
                    placeholder="Correct example"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                    trackChanges={true}
                    initialValue={initialData.commonMistakes[mistakeSlideIndex]?.correct || ''}
                    onSave={async (val) =>
                      await handleSaveField(`mistake_${mistakeSlideIndex}_correct`, val)
                    }
                  />

                  <CustomInput
                    label="Explanation"
                    value={formData.commonMistakes[mistakeSlideIndex]?.explanation || ''}
                    onChange={(val) => {
                      const newMistakes = [...formData.commonMistakes]
                      newMistakes[mistakeSlideIndex] = {
                        ...newMistakes[mistakeSlideIndex],
                        explanation: val
                      }
                      setFormData((prev) => ({ ...prev, commonMistakes: newMistakes }))
                    }}
                    variant="default"
                    placeholder="Explanation"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                    trackChanges={true}
                    initialValue={initialData.commonMistakes[mistakeSlideIndex]?.explanation || ''}
                    onSave={async (val) =>
                      await handleSaveField(`mistake_${mistakeSlideIndex}_explanation`, val)
                    }
                  />
                </div>
              </div>

              {/* Pagination + Action Buttons */}
              <div className="flex items-center justify-between mt-4">
                {/* Left: Pagination */}
                {formData.commonMistakes.length > 1 ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToPrevMistake}
                      disabled={mistakeSlideIndex === 0}
                      className="p-2 rounded-lg bg-card-background border border-border-default hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      title="Previous mistake"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-sm font-medium text-text-primary">
                      {mistakeSlideIndex + 1} / {formData.commonMistakes.length}
                    </span>

                    <button
                      onClick={goToNextMistake}
                      disabled={mistakeSlideIndex === formData.commonMistakes.length - 1}
                      className="p-2 rounded-lg bg-card-background border border-border-default hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      title="Next mistake"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2">
                  {formData.commonMistakes.length > 1 && (
                    <button
                      onClick={() => removeMistake(mistakeSlideIndex)}
                      className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      title="Remove mistake"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={startCreateMistake}
                    children={undefined}
                  ></CustomButton>
                </div>
              </div>
            </div>

            {/* Create Mistake Form */}
            {creatingMistake && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-background/50 border border-border-default rounded-lg"
              >
                <h4 className="text-sm font-semibold text-text-primary mb-4">
                  Create Common Mistake
                </h4>
                <div className="space-y-3">
                  <CustomInput
                    label="Incorrect example"
                    value={newMistakeData.incorrect}
                    onChange={(val) => setNewMistakeData((prev) => ({ ...prev, incorrect: val }))}
                    variant="default"
                    placeholder="Enter incorrect example"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                  />
                  <CustomInput
                    label="Correct example"
                    value={newMistakeData.correct}
                    onChange={(val) => setNewMistakeData((prev) => ({ ...prev, correct: val }))}
                    variant="default"
                    placeholder="Enter correct example"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                  />
                  <CustomInput
                    label="Explanation"
                    value={newMistakeData.explanation}
                    onChange={(val) => setNewMistakeData((prev) => ({ ...prev, explanation: val }))}
                    variant="default"
                    placeholder="Enter explanation"
                    size="sm"
                    multiline={true}
                    minRows={1}
                    maxRows={10}
                    autoResize={true}
                  />
                  <div className="flex justify-end gap-2">
                    <div className="w-auto">
                      <CustomButton variant="ghost" size="sm" onClick={cancelCreateMistake}>
                        Cancel
                      </CustomButton>
                    </div>
                    <div className="w-auto">
                      <CustomButton variant="primary" size="sm" onClick={confirmCreateMistake}>
                        Create
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-text-secondary">
            <p className="mb-4">No common mistakes yet</p>
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addMistake}>
              Add first mistake
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  )

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

export default GrammarContentSection
