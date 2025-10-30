import { useEffect, useState } from 'react'
import type { API } from '../../../../../../../../preload/index'
import { vocabulary_item } from '../../../types/vocabulary'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import CustomTag from '../../../../../../components/common/CustomTag'
import Metadata from '../../../../../../components/common/Metadata'
import CustomButton from '../../../../../../components/common/CustomButton'
import { Plus, Trash2, Check, ChevronDown, ChevronRight } from 'lucide-react'

declare global {
  interface Window {
    api?: API
  }
}

interface WordContentSectionProps {
  item: vocabulary_item
  onDelete?: (itemId: string) => void
}

interface Definition {
  id: string
  meaning: string
  translation?: string
  word_type?: string
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

const WordContentSection = ({ item, onDelete }: WordContentSectionProps) => {
  // State để track current item - điều này là key để fix update issue
  const [currentItem, setCurrentItem] = useState<vocabulary_item>(item)

  useEffect(() => {
    setCurrentItem(item)
  }, [item])

  const getInitialDefinitions = (): Definition[] => {
    if (currentItem.metadata?.definitions && Array.isArray(currentItem.metadata.definitions)) {
      return currentItem.metadata.definitions.map((def: any) => ({
        id: def.id || `def_${Date.now()}`,
        meaning: def.meaning || '',
        translation: def.translation || '',
        word_type: def.word_type || def.wordType || '',
        examples: Array.isArray(def.examples)
          ? def.examples.map((ex: any) => ({
              sentence: ex.sentence || '',
              translation: ex.translation || ''
            }))
          : [{ sentence: '', translation: '' }]
      }))
    }
    return [
      {
        id: '1',
        meaning: '',
        translation: '',
        word_type: '',
        examples: [{ sentence: '', translation: '' }]
      }
    ]
  }

  const [formData, setFormData] = useState<FormData>({
    content: currentItem.content,
    pronunciation: currentItem.pronunciation || '',
    definitions: getInitialDefinitions(),
    difficulty_level: currentItem.difficulty_level || 0,
    frequency_rank: currentItem.frequency_rank || 0,
    category: currentItem.category || '',
    tags: currentItem.tags || [],
    metadata: currentItem.metadata || {}
  })

  // State độc lập cho từng field
  const [editingFields, setEditingFields] = useState<{
    [key: string]: { isEditing: boolean; pendingValue: string }
  }>({})

  // State cho collapse sections
  const [definitionsExpanded, setDefinitionsExpanded] = useState(false)
  const [examplesExpanded, setExamplesExpanded] = useState<{ [key: number]: boolean }>({})

  // ✅ FIX: Đồng bộ formData khi currentItem thay đổi
  useEffect(() => {
    setFormData({
      content: currentItem.content,
      pronunciation: currentItem.pronunciation || '',
      definitions: getInitialDefinitions(),
      difficulty_level: currentItem.difficulty_level || 0,
      frequency_rank: currentItem.frequency_rank || 0,
      category: currentItem.category || '',
      tags: currentItem.tags || [],
      metadata: currentItem.metadata || {}
    })
    setEditingFields({})
    setDefinitionsExpanded(false)
    setExamplesExpanded({})
  }, [currentItem.id])

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa từ "${currentItem.content}" này không?`)) {
      onDelete?.(currentItem.id)
    }
  }

  // Start editing field
  const startEditField = (fieldKey: string) => {
    let currentValue = ''

    if (fieldKey === 'content') {
      currentValue = currentItem.content
    } else if (fieldKey === 'pronunciation') {
      currentValue = currentItem.pronunciation || ''
    } else if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'meaning') {
        currentValue = formData.definitions[defIndex]?.meaning || ''
      } else if (field === 'translation') {
        currentValue = formData.definitions[defIndex]?.translation || ''
      }
    } else if (fieldKey.startsWith('ex_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const exIndex = parseInt(parts[2])
      const field = parts.slice(3).join('_')

      if (field === 'sentence') {
        currentValue = formData.definitions[defIndex]?.examples[exIndex]?.sentence || ''
      } else if (field === 'translation') {
        currentValue = formData.definitions[defIndex]?.examples[exIndex]?.translation || ''
      }
    }

    setEditingFields((prev) => {
      const newState = {
        ...prev,
        [fieldKey]: {
          isEditing: true,
          pendingValue: currentValue
        }
      }
      return newState
    })
  }

  // Handle input change while editing
  const handleFieldChange = (fieldKey: string, value: string) => {
    setEditingFields((prev) => {
      const newState = {
        ...prev,
        [fieldKey]: {
          ...prev[fieldKey],
          pendingValue: value
        }
      }
      return newState
    })
  }

  // Confirm field change
  const confirmFieldChange = async (fieldKey: string) => {
    const newValue = editingFields[fieldKey]?.pendingValue || ''

    let updatedDefinitions = [...formData.definitions]

    if (fieldKey === 'content') {
      setFormData((prev) => ({ ...prev, content: newValue }))
    } else if (fieldKey === 'pronunciation') {
      setFormData((prev) => ({ ...prev, pronunciation: newValue }))
    } else if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'meaning') {
        updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], meaning: newValue }
      } else if (field === 'translation') {
        updatedDefinitions[defIndex] = { ...updatedDefinitions[defIndex], translation: newValue }
      }

      setFormData((prev) => ({ ...prev, definitions: updatedDefinitions }))
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

      setFormData((prev) => ({ ...prev, definitions: updatedDefinitions }))
    }

    try {
      const updatedMetadata = {
        ...formData.metadata,
        definitions: updatedDefinitions
      }

      const updatedItem = {
        ...currentItem,
        [fieldKey === 'content'
          ? 'content'
          : fieldKey === 'pronunciation'
            ? 'pronunciation'
            : 'metadata']:
          fieldKey === 'content' || fieldKey === 'pronunciation' ? newValue : updatedMetadata,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_item)
        setCurrentItem(updatedItem as vocabulary_item)
      } else {
        throw new Error('Database not connected')
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating field:', error)
      alert(`Lỗi khi lưu: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setEditingFields((prev) => {
      const newState = { ...prev }
      delete newState[fieldKey]
      return newState
    })
  }

  // Combobox changes apply immediately
  const handleDifficultyChange = async (value: string | string[]) => {
    const newValue = parseInt(typeof value === 'string' ? value : value[0])
    setFormData((prev) => ({
      ...prev,
      difficulty_level: newValue
    }))

    try {
      const updatedItem = {
        ...currentItem,
        difficulty_level: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_item)
        setCurrentItem(updatedItem as vocabulary_item)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating difficulty:', error)
    }
  }

  const handleFrequencyChange = async (value: string | string[]) => {
    const newValue = parseInt(typeof value === 'string' ? value : value[0])
    setFormData((prev) => ({
      ...prev,
      frequency_rank: newValue
    }))

    try {
      const updatedItem = {
        ...currentItem,
        frequency_rank: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_item)
        setCurrentItem(updatedItem as vocabulary_item)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating frequency:', error)
    }
  }

  const handleCategoryChange = async (value: string | string[]) => {
    const newValue = typeof value === 'string' ? value : value[0]
    setFormData((prev) => ({
      ...prev,
      category: newValue
    }))

    try {
      const updatedItem = {
        ...currentItem,
        category: newValue,
        updated_at: new Date().toISOString()
      }

      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.updateVocabularyItem(updatedItem as vocabulary_item)
        setCurrentItem(updatedItem as vocabulary_item)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating category:', error)
    }
  }

  // Tag changes apply immediately
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
        await db.updateVocabularyItem(updatedItem as vocabulary_item)
        setCurrentItem(updatedItem as vocabulary_item)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating tags:', error)
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
        await db.updateVocabularyItem(updatedItem as vocabulary_item)
        setCurrentItem(updatedItem as vocabulary_item)
      }
    } catch (error) {
      console.error('[WordContentSection] Error updating metadata:', error)
    }
  }

  // Definitions handlers
  const handleDefinitionChange = (defIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      if (field === 'meaning' || field === 'translation' || field === 'word_type') {
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
          id: `def_${Date.now()}`,
          meaning: '',
          translation: '',
          word_type: '',
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
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      newDefs[defIndex] = {
        ...newDefs[defIndex],
        examples: [...newDefs[defIndex].examples, { sentence: '', translation: '' }]
      }
      return { ...prev, definitions: newDefs }
    })
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
    }
  }

  // Toggle examples collapse
  const toggleExamplesExpanded = (defIndex: number) => {
    setExamplesExpanded((prev) => ({
      ...prev,
      [defIndex]: !prev[defIndex]
    }))
  }

  // Helper để lấy giá trị hiển thị
  const getDisplayValue = (fieldKey: string): string => {
    if (editingFields[fieldKey]?.isEditing) {
      return editingFields[fieldKey].pendingValue
    }

    if (fieldKey === 'content') return formData.content
    if (fieldKey === 'pronunciation') return formData.pronunciation

    if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'meaning') return formData.definitions[defIndex]?.meaning || ''
      if (field === 'translation') return formData.definitions[defIndex]?.translation || ''
    }

    if (fieldKey.startsWith('ex_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const exIndex = parseInt(parts[2])
      const field = parts.slice(3).join('_')

      if (field === 'sentence')
        return formData.definitions[defIndex]?.examples[exIndex]?.sentence || ''
      if (field === 'translation')
        return formData.definitions[defIndex]?.examples[exIndex]?.translation || ''
    }

    return ''
  }

  // Helper để kiểm tra có thay đổi không
  const hasFieldChanged = (fieldKey: string): boolean => {
    if (!editingFields[fieldKey]?.isEditing) return false

    const pendingValue = editingFields[fieldKey].pendingValue

    let initialValue = ''

    if (fieldKey === 'content') {
      initialValue = currentItem.content
    } else if (fieldKey === 'pronunciation') {
      initialValue = currentItem.pronunciation || ''
    } else if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')
      const initialDef = getInitialDefinitions()[defIndex]

      if (field === 'meaning') {
        initialValue = initialDef?.meaning || ''
      } else if (field === 'translation') {
        initialValue = initialDef?.translation || ''
      }
    } else if (fieldKey.startsWith('ex_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const exIndex = parseInt(parts[2])
      const field = parts.slice(3).join('_')
      const initialDef = getInitialDefinitions()[defIndex]

      if (field === 'sentence') {
        initialValue = initialDef?.examples[exIndex]?.sentence || ''
      } else if (field === 'translation') {
        initialValue = initialDef?.examples[exIndex]?.translation || ''
      }
    }

    return pendingValue !== initialValue
  }

  return (
    <div className="space-y-6">
      {/* Header với Delete Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Word Details</h2>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors border border-red-500/30"
          title="Delete this word"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Content Input with Confirmation */}
          <div className="relative">
            <CustomInput
              label="Word"
              value={getDisplayValue('content')}
              onChange={(val) => handleFieldChange('content', val)}
              onFocus={() => {
                if (!editingFields['content']?.isEditing) {
                  startEditField('content')
                }
              }}
              variant="default"
              size="sm"
            />
            {editingFields['content']?.isEditing && hasFieldChanged('content') && (
              <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                <button
                  onClick={() => confirmFieldChange('content')}
                  className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                  title="Confirm change"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Pronunciation Input with Confirmation */}
          <div className="relative">
            <CustomInput
              label="Pronunciation (IPA)"
              value={getDisplayValue('pronunciation')}
              onChange={(val) => handleFieldChange('pronunciation', val)}
              onFocus={() => {
                if (!editingFields['pronunciation']?.isEditing) {
                  startEditField('pronunciation')
                }
              }}
              variant="default"
              placeholder="vd: /ˌpɜːrsəˈvɪrəns/"
              size="sm"
            />
            {editingFields['pronunciation']?.isEditing && hasFieldChanged('pronunciation') && (
              <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                <button
                  onClick={() => confirmFieldChange('pronunciation')}
                  className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                  title="Confirm change"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Combobox - updates immediately */}
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
            size="sm"
          />
        </div>

        {/* Tags - updates immediately */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <CustomTag
            tags={formData.tags}
            onTagsChange={handleTagsChange}
            placeholder="Add tag..."
            allowDuplicates={false}
          />
        </div>
      </section>

      {/* Definitions & Examples */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setDefinitionsExpanded(!definitionsExpanded)}
            className="flex items-center gap-2 text-lg font-semibold text-text-primary hover:text-primary transition-colors"
          >
            {definitionsExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            Definition & Examples
          </button>
          {definitionsExpanded && (
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addDefinition}>
              Add definition
            </CustomButton>
          )}
        </div>

        {definitionsExpanded && (
          <div className="space-y-4">
            {formData.definitions.map((def: Definition, defIndex: number) => {
              return (
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
                    {/* Meaning Input with Confirmation */}
                    <div className="relative">
                      <CustomInput
                        label="Meaning (English)"
                        value={getDisplayValue(`def_${defIndex}_meaning`)}
                        onChange={(val) => handleFieldChange(`def_${defIndex}_meaning`, val)}
                        onFocus={() => {
                          if (!editingFields[`def_${defIndex}_meaning`]?.isEditing) {
                            startEditField(`def_${defIndex}_meaning`)
                          }
                        }}
                        variant="default"
                        placeholder="Enter English definition"
                        size="sm"
                      />
                      {editingFields[`def_${defIndex}_meaning`]?.isEditing &&
                        hasFieldChanged(`def_${defIndex}_meaning`) && (
                          <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                            <button
                              onClick={() => confirmFieldChange(`def_${defIndex}_meaning`)}
                              className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                              title="Save meaning"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Translation Input with Confirmation */}
                    <div className="relative">
                      <CustomInput
                        label="Translate"
                        value={getDisplayValue(`def_${defIndex}_translation`)}
                        onChange={(val) => handleFieldChange(`def_${defIndex}_translation`, val)}
                        onFocus={() => {
                          if (!editingFields[`def_${defIndex}_translation`]?.isEditing) {
                            startEditField(`def_${defIndex}_translation`)
                          }
                        }}
                        variant="default"
                        placeholder="Enter translation"
                        size="sm"
                      />
                      {editingFields[`def_${defIndex}_translation`]?.isEditing &&
                        hasFieldChanged(`def_${defIndex}_translation`) && (
                          <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                            <button
                              onClick={() => confirmFieldChange(`def_${defIndex}_translation`)}
                              className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                              title="Save translation"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                    </div>

                    <CustomCombobox
                      label="Type"
                      value={def.word_type || ''}
                      options={WORD_TYPES}
                      onChange={(val) =>
                        handleDefinitionChange(
                          defIndex,
                          'word_type',
                          typeof val === 'string' ? val : val[0] || ''
                        )
                      }
                      placeholder="Select word type"
                      size="sm"
                    />
                  </div>

                  {/* Examples - Collapsible */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleExamplesExpanded(defIndex)}
                        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {examplesExpanded[defIndex] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        Example ({def.examples.length})
                      </button>
                      {examplesExpanded[defIndex] && (
                        <button
                          onClick={() => addExample(defIndex)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add example
                        </button>
                      )}
                    </div>

                    {examplesExpanded[defIndex] && (
                      <div className="space-y-2">
                        {def.examples.map((_: any, exIndex: number) => (
                          <div key={exIndex} className="p-3 bg-card-background rounded space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-secondary">
                                Example {exIndex + 1}
                              </span>
                              {def.examples.length > 1 && (
                                <button
                                  onClick={() => removeExample(defIndex, exIndex)}
                                  className="text-red-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Example Sentence Input with Confirmation */}
                            <div className="relative">
                              <CustomInput
                                label="Example sentence"
                                value={getDisplayValue(`ex_${defIndex}_${exIndex}_sentence`)}
                                onChange={(val) =>
                                  handleFieldChange(`ex_${defIndex}_${exIndex}_sentence`, val)
                                }
                                onFocus={() => {
                                  if (
                                    !editingFields[`ex_${defIndex}_${exIndex}_sentence`]?.isEditing
                                  ) {
                                    startEditField(`ex_${defIndex}_${exIndex}_sentence`)
                                  }
                                }}
                                variant="default"
                                placeholder="Example sentence"
                                size="sm"
                              />
                              {editingFields[`ex_${defIndex}_${exIndex}_sentence`]?.isEditing &&
                                hasFieldChanged(`ex_${defIndex}_${exIndex}_sentence`) && (
                                  <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                                    <button
                                      onClick={() =>
                                        confirmFieldChange(`ex_${defIndex}_${exIndex}_sentence`)
                                      }
                                      className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                                      title="Save sentence"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                            </div>

                            {/* Example Translation Input with Confirmation */}
                            <div className="relative">
                              <CustomInput
                                label="Translate (example)"
                                value={getDisplayValue(`ex_${defIndex}_${exIndex}_translation`)}
                                onChange={(val) =>
                                  handleFieldChange(`ex_${defIndex}_${exIndex}_translation`, val)
                                }
                                onFocus={() => {
                                  if (
                                    !editingFields[`ex_${defIndex}_${exIndex}_translation`]
                                      ?.isEditing
                                  ) {
                                    startEditField(`ex_${defIndex}_${exIndex}_translation`)
                                  }
                                }}
                                variant="default"
                                placeholder="Translation"
                                size="sm"
                              />
                              {editingFields[`ex_${defIndex}_${exIndex}_translation`]?.isEditing &&
                                hasFieldChanged(`ex_${defIndex}_${exIndex}_translation`) && (
                                  <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                                    <button
                                      onClick={() =>
                                        confirmFieldChange(`ex_${defIndex}_${exIndex}_translation`)
                                      }
                                      className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                                      title="Save translation"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Metadata */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Metadata</h3>
        <Metadata
          metadata={formData.metadata}
          onMetadataChange={handleMetadataChange}
          readOnly={false}
          allowCreate={true}
          allowDelete={true}
          allowEdit={true}
          size="sm"
          collapsible={true}
          defaultExpanded={false}
        />
      </section>
    </div>
  )
}

export default WordContentSection
