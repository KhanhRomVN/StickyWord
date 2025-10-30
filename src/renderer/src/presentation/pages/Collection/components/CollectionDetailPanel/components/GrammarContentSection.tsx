import { useEffect, useState } from 'react'
import { grammar_item } from '../../../types/grammar'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import CustomTag from '../../../../../../components/common/CustomTag'
import Metadata from '../../../../../../components/common/Metadata'
import CustomButton from '../../../../../../components/common/CustomButton'
import { Plus, Trash2, Check, ChevronDown, ChevronRight } from 'lucide-react'

interface GrammarContentSectionProps {
  item: grammar_item
  onDelete?: (itemId: string) => void
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

const GrammarContentSection = ({ item, onDelete }: GrammarContentSectionProps) => {
  const [currentItem, setCurrentItem] = useState<grammar_item>(item)

  useEffect(() => {
    setCurrentItem(item)
  }, [item])

  const getInitialDefinitions = (): Definition[] => {
    if (currentItem.metadata?.definitions && Array.isArray(currentItem.metadata.definitions)) {
      return currentItem.metadata.definitions.map((def: any) => ({
        id: def.id || `def_${Date.now()}`,
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
      return currentItem.metadata.examples.map((ex: any) => ({
        id: ex.id || `ex_${Date.now()}`,
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
      return currentItem.metadata.commonMistakes.map((mistake: any) => ({
        id: mistake.id || `mistake_${Date.now()}`,
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

  const [editingFields, setEditingFields] = useState<{
    [key: string]: { isEditing: boolean; pendingValue: string }
  }>({})

  const [definitionsExpanded, setDefinitionsExpanded] = useState(false)
  const [examplesExpanded, setExamplesExpanded] = useState(false)
  const [mistakesExpanded, setMistakesExpanded] = useState(false)

  // ✅ FIX: Đồng bộ formData khi currentItem thay đổi
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
    setEditingFields({})
    setDefinitionsExpanded(false)
    setExamplesExpanded(false)
    setMistakesExpanded(false)
  }, [currentItem.id])

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa điểm ngữ pháp "${currentItem.title}" này không?`)) {
      onDelete?.(currentItem.id)
    }
  }

  const startEditField = (fieldKey: string) => {
    let currentValue = ''

    if (fieldKey === 'title') {
      currentValue = currentItem.title
    } else if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'description') {
        currentValue = formData.definitions[defIndex]?.description || ''
      } else if (field === 'explanation') {
        currentValue = formData.definitions[defIndex]?.explanation || ''
      } else if (field === 'structure') {
        currentValue = formData.definitions[defIndex]?.structure || ''
      } else if (field === 'translation') {
        currentValue = formData.definitions[defIndex]?.translation || ''
      }
    } else if (fieldKey.startsWith('ex_')) {
      const parts = fieldKey.split('_')
      const exIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'sentence') {
        currentValue = formData.examples[exIndex]?.sentence || ''
      } else if (field === 'translation') {
        currentValue = formData.examples[exIndex]?.translation || ''
      } else if (field === 'usage_note') {
        currentValue = formData.examples[exIndex]?.usage_note || ''
      }
    } else if (fieldKey.startsWith('mistake_')) {
      const parts = fieldKey.split('_')
      const mistakeIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'incorrect') {
        currentValue = formData.commonMistakes[mistakeIndex]?.incorrect || ''
      } else if (field === 'correct') {
        currentValue = formData.commonMistakes[mistakeIndex]?.correct || ''
      } else if (field === 'explanation') {
        currentValue = formData.commonMistakes[mistakeIndex]?.explanation || ''
      }
    }

    setEditingFields((prev) => ({
      ...prev,
      [fieldKey]: {
        isEditing: true,
        pendingValue: currentValue
      }
    }))
  }

  const handleFieldChange = (fieldKey: string, value: string) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        pendingValue: value
      }
    }))
  }

  const confirmFieldChange = async (fieldKey: string) => {
    const newValue = editingFields[fieldKey]?.pendingValue || ''

    let updatedDefinitions = [...formData.definitions]
    let updatedExamples = [...formData.examples]
    let updatedMistakes = [...formData.commonMistakes]

    if (fieldKey === 'title') {
      setFormData((prev) => ({ ...prev, title: newValue }))
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

      setFormData((prev) => ({ ...prev, definitions: updatedDefinitions }))
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

      setFormData((prev) => ({ ...prev, examples: updatedExamples }))
    } else if (fieldKey.startsWith('mistake_')) {
      const parts = fieldKey.split('_')
      const mistakeIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'incorrect') {
        updatedMistakes[mistakeIndex] = { ...updatedMistakes[mistakeIndex], incorrect: newValue }
      } else if (field === 'correct') {
        updatedMistakes[mistakeIndex] = { ...updatedMistakes[mistakeIndex], correct: newValue }
      } else if (field === 'explanation') {
        updatedMistakes[mistakeIndex] = { ...updatedMistakes[mistakeIndex], explanation: newValue }
      }

      setFormData((prev) => ({ ...prev, commonMistakes: updatedMistakes }))
    }

    try {
      const updatedMetadata = {
        ...formData.metadata,
        definitions: updatedDefinitions,
        examples: updatedExamples,
        commonMistakes: updatedMistakes
      }

      const updatedItem = {
        ...currentItem,
        [fieldKey === 'title' ? 'title' : 'metadata']:
          fieldKey === 'title' ? newValue : updatedMetadata,
        updated_at: new Date().toISOString()
      }

      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating field:', error)
      alert(`Lỗi khi lưu: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setEditingFields((prev) => {
      const newState = { ...prev }
      delete newState[fieldKey]
      return newState
    })
  }

  const handleItemTypeChange = async (value: string | string[]) => {
    const newValue = (typeof value === 'string' ? value : value[0]) as any
    setFormData((prev) => ({
      ...prev,
      item_type: newValue
    }))

    try {
      const updatedItem = {
        ...currentItem,
        item_type: newValue,
        updated_at: new Date().toISOString()
      }
      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating item type:', error)
    }
  }

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
      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating difficulty:', error)
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
      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
        setCurrentItem(updatedItem as grammar_item)
      }
    } catch (error) {
      console.error('[GrammarContentSection] Error updating frequency:', error)
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
      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
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
      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
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
      if (window.api?.vocabulary?.update) {
        await window.api.vocabulary.update(updatedItem)
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
          id: `def_${Date.now()}`,
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
    setFormData((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        { id: `ex_${Date.now()}`, sentence: '', translation: '', usage_note: '' }
      ]
    }))
  }

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      setFormData((prev) => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index)
      }))
    }
  }

  const addMistake = () => {
    setFormData((prev) => ({
      ...prev,
      commonMistakes: [
        ...prev.commonMistakes,
        { id: `mistake_${Date.now()}`, incorrect: '', correct: '', explanation: '' }
      ]
    }))
  }

  const removeMistake = (index: number) => {
    if (formData.commonMistakes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        commonMistakes: prev.commonMistakes.filter((_, i) => i !== index)
      }))
    }
  }

  const getDisplayValue = (fieldKey: string): string => {
    if (editingFields[fieldKey]?.isEditing) {
      return editingFields[fieldKey].pendingValue
    }

    if (fieldKey === 'title') return formData.title

    if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'description') return formData.definitions[defIndex]?.description || ''
      if (field === 'explanation') return formData.definitions[defIndex]?.explanation || ''
      if (field === 'structure') return formData.definitions[defIndex]?.structure || ''
      if (field === 'translation') return formData.definitions[defIndex]?.translation || ''
    }

    if (fieldKey.startsWith('ex_')) {
      const parts = fieldKey.split('_')
      const exIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'sentence') return formData.examples[exIndex]?.sentence || ''
      if (field === 'translation') return formData.examples[exIndex]?.translation || ''
      if (field === 'usage_note') return formData.examples[exIndex]?.usage_note || ''
    }

    if (fieldKey.startsWith('mistake_')) {
      const parts = fieldKey.split('_')
      const mistakeIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')

      if (field === 'incorrect') return formData.commonMistakes[mistakeIndex]?.incorrect || ''
      if (field === 'correct') return formData.commonMistakes[mistakeIndex]?.correct || ''
      if (field === 'explanation') return formData.commonMistakes[mistakeIndex]?.explanation || ''
    }

    return ''
  }

  const hasFieldChanged = (fieldKey: string): boolean => {
    if (!editingFields[fieldKey]?.isEditing) return false

    const pendingValue = editingFields[fieldKey].pendingValue
    let initialValue = ''

    if (fieldKey === 'title') {
      initialValue = currentItem.title
    } else if (fieldKey.startsWith('def_')) {
      const parts = fieldKey.split('_')
      const defIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')
      const initialDef = getInitialDefinitions()[defIndex]

      if (field === 'description') {
        initialValue = initialDef?.description || ''
      } else if (field === 'explanation') {
        initialValue = initialDef?.explanation || ''
      } else if (field === 'structure') {
        initialValue = initialDef?.structure || ''
      } else if (field === 'translation') {
        initialValue = initialDef?.translation || ''
      }
    } else if (fieldKey.startsWith('ex_')) {
      const parts = fieldKey.split('_')
      const exIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')
      const initialEx = getInitialExamples()[exIndex]

      if (field === 'sentence') {
        initialValue = initialEx?.sentence || ''
      } else if (field === 'translation') {
        initialValue = initialEx?.translation || ''
      } else if (field === 'usage_note') {
        initialValue = initialEx?.usage_note || ''
      }
    } else if (fieldKey.startsWith('mistake_')) {
      const parts = fieldKey.split('_')
      const mistakeIndex = parseInt(parts[1])
      const field = parts.slice(2).join('_')
      const initialMistake = getInitialCommonMistakes()[mistakeIndex]

      if (field === 'incorrect') {
        initialValue = initialMistake?.incorrect || ''
      } else if (field === 'correct') {
        initialValue = initialMistake?.correct || ''
      } else if (field === 'explanation') {
        initialValue = initialMistake?.explanation || ''
      }
    }

    return pendingValue !== initialValue
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Grammar Details</h2>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors border border-red-500/30"
          title="Delete this grammar point"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <CustomInput
              label="Title"
              value={getDisplayValue('title')}
              onChange={(val) => handleFieldChange('title', val)}
              onFocus={() => {
                if (!editingFields['title']?.isEditing) {
                  startEditField('title')
                }
              }}
              variant="default"
              size="sm"
            />
            {editingFields['title']?.isEditing && hasFieldChanged('title') && (
              <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                <button
                  onClick={() => confirmFieldChange('title')}
                  className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                  title="Confirm change"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <CustomCombobox
            label="Item Type"
            value={formData.item_type}
            options={GRAMMAR_ITEM_TYPES}
            onChange={handleItemTypeChange}
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
              { value: 'tenses', label: 'Tenses' },
              { value: 'conditionals', label: 'Conditionals' },
              { value: 'passive', label: 'Passive Voice' },
              { value: 'reported_speech', label: 'Reported Speech' },
              { value: 'modals', label: 'Modal Verbs' }
            ]}
            onChange={handleCategoryChange}
            creatable={true}
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
          />
        </div>
      </section>

      {/* Definitions Section */}
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
            Definitions
          </button>
          {definitionsExpanded && (
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addDefinition}>
              Add definition
            </CustomButton>
          )}
        </div>

        {definitionsExpanded && (
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
                  <div className="relative">
                    <CustomInput
                      label="Description"
                      value={getDisplayValue(`def_${defIndex}_description`)}
                      onChange={(val) => handleFieldChange(`def_${defIndex}_description`, val)}
                      onFocus={() => {
                        if (!editingFields[`def_${defIndex}_description`]?.isEditing) {
                          startEditField(`def_${defIndex}_description`)
                        }
                      }}
                      variant="default"
                      placeholder="Brief description"
                      size="sm"
                    />
                    {editingFields[`def_${defIndex}_description`]?.isEditing &&
                      hasFieldChanged(`def_${defIndex}_description`) && (
                        <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                          <button
                            onClick={() => confirmFieldChange(`def_${defIndex}_description`)}
                            className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                            title="Save description"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                  </div>

                  <div className="relative">
                    <CustomInput
                      label="Explanation"
                      value={getDisplayValue(`def_${defIndex}_explanation`)}
                      onChange={(val) => handleFieldChange(`def_${defIndex}_explanation`, val)}
                      onFocus={() => {
                        if (!editingFields[`def_${defIndex}_explanation`]?.isEditing) {
                          startEditField(`def_${defIndex}_explanation`)
                        }
                      }}
                      variant="default"
                      placeholder="Detailed explanation"
                      size="sm"
                    />
                    {editingFields[`def_${defIndex}_explanation`]?.isEditing &&
                      hasFieldChanged(`def_${defIndex}_explanation`) && (
                        <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                          <button
                            onClick={() => confirmFieldChange(`def_${defIndex}_explanation`)}
                            className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                            title="Save explanation"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                  </div>

                  <div className="relative">
                    <CustomInput
                      label="Structure"
                      value={getDisplayValue(`def_${defIndex}_structure`)}
                      onChange={(val) => handleFieldChange(`def_${defIndex}_structure`, val)}
                      onFocus={() => {
                        if (!editingFields[`def_${defIndex}_structure`]?.isEditing) {
                          startEditField(`def_${defIndex}_structure`)
                        }
                      }}
                      variant="default"
                      placeholder="Grammar structure or formula"
                      size="sm"
                    />
                    {editingFields[`def_${defIndex}_structure`]?.isEditing &&
                      hasFieldChanged(`def_${defIndex}_structure`) && (
                        <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                          <button
                            onClick={() => confirmFieldChange(`def_${defIndex}_structure`)}
                            className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                            title="Save structure"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                  </div>

                  <div className="relative">
                    <CustomInput
                      label="Translation"
                      value={getDisplayValue(`def_${defIndex}_translation`)}
                      onChange={(val) => handleFieldChange(`def_${defIndex}_translation`, val)}
                      onFocus={() => {
                        if (!editingFields[`def_${defIndex}_translation`]?.isEditing) {
                          startEditField(`def_${defIndex}_translation`)
                        }
                      }}
                      variant="default"
                      placeholder="Vietnamese translation"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Examples Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setExamplesExpanded(!examplesExpanded)}
            className="flex items-center gap-2 text-lg font-semibold text-text-primary hover:text-primary transition-colors"
          >
            {examplesExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            Examples
          </button>
          {examplesExpanded && (
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addExample}>
              Add example
            </CustomButton>
          )}
        </div>

        {examplesExpanded && (
          <div className="space-y-2">
            {formData.examples.map((example: Example, exIndex: number) => (
              <div key={example.id} className="p-3 bg-card-background rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Example {exIndex + 1}</span>
                  {formData.examples.length > 1 && (
                    <button
                      onClick={() => removeExample(exIndex)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <CustomInput
                    label="Example sentence"
                    value={getDisplayValue(`ex_${exIndex}_sentence`)}
                    onChange={(val) => handleFieldChange(`ex_${exIndex}_sentence`, val)}
                    onFocus={() => {
                      if (!editingFields[`ex_${exIndex}_sentence`]?.isEditing) {
                        startEditField(`ex_${exIndex}_sentence`)
                      }
                    }}
                    variant="default"
                    placeholder="Example sentence"
                    size="sm"
                  />
                  {editingFields[`ex_${exIndex}_sentence`]?.isEditing &&
                    hasFieldChanged(`ex_${exIndex}_sentence`) && (
                      <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                        <button
                          onClick={() => confirmFieldChange(`ex_${exIndex}_sentence`)}
                          className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                          title="Save sentence"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                </div>

                <div className="relative">
                  <CustomInput
                    label="Translate (example)"
                    value={getDisplayValue(`ex_${exIndex}_translation`)}
                    onChange={(val) => handleFieldChange(`ex_${exIndex}_translation`, val)}
                    onFocus={() => {
                      if (!editingFields[`ex_${exIndex}_translation`]?.isEditing) {
                        startEditField(`ex_${exIndex}_translation`)
                      }
                    }}
                    variant="default"
                    placeholder="Translation"
                    size="sm"
                  />
                  {editingFields[`ex_${exIndex}_translation`]?.isEditing &&
                    hasFieldChanged(`ex_${exIndex}_translation`) && (
                      <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                        <button
                          onClick={() => confirmFieldChange(`ex_${exIndex}_translation`)}
                          className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                          title="Save translation"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                </div>

                <div className="relative">
                  <CustomInput
                    label="Usage note"
                    value={getDisplayValue(`ex_${exIndex}_usage_note`)}
                    onChange={(val) => handleFieldChange(`ex_${exIndex}_usage_note`, val)}
                    onFocus={() => {
                      if (!editingFields[`ex_${exIndex}_usage_note`]?.isEditing) {
                        startEditField(`ex_${exIndex}_usage_note`)
                      }
                    }}
                    variant="default"
                    placeholder="Usage note"
                    size="sm"
                  />
                  {editingFields[`ex_${exIndex}_usage_note`]?.isEditing &&
                    hasFieldChanged(`ex_${exIndex}_usage_note`) && (
                      <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                        <button
                          onClick={() => confirmFieldChange(`ex_${exIndex}_usage_note`)}
                          className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                          title="Save usage note"
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
      </section>

      {/* Common Mistakes Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMistakesExpanded(!mistakesExpanded)}
            className="flex items-center gap-2 text-lg font-semibold text-text-primary hover:text-primary transition-colors"
          >
            {mistakesExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            Common Mistakes
          </button>
          {mistakesExpanded && (
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addMistake}>
              Add mistake
            </CustomButton>
          )}
        </div>

        {mistakesExpanded && (
          <div className="space-y-2">
            {formData.commonMistakes.map((mistake: CommonMistake, mistakeIndex: number) => (
              <div key={mistake.id} className="p-3 bg-card-background rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Mistake {mistakeIndex + 1}</span>
                  {formData.commonMistakes.length > 1 && (
                    <button
                      onClick={() => removeMistake(mistakeIndex)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <CustomInput
                    label="Incorrect example"
                    value={getDisplayValue(`mistake_${mistakeIndex}_incorrect`)}
                    onChange={(val) => handleFieldChange(`mistake_${mistakeIndex}_incorrect`, val)}
                    onFocus={() => {
                      if (!editingFields[`mistake_${mistakeIndex}_incorrect`]?.isEditing) {
                        startEditField(`mistake_${mistakeIndex}_incorrect`)
                      }
                    }}
                    variant="default"
                    placeholder="Incorrect example"
                    size="sm"
                  />
                  {editingFields[`mistake_${mistakeIndex}_incorrect`]?.isEditing &&
                    hasFieldChanged(`mistake_${mistakeIndex}_incorrect`) && (
                      <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                        <button
                          onClick={() => confirmFieldChange(`mistake_${mistakeIndex}_incorrect`)}
                          className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                          title="Save incorrect example"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                </div>

                <div className="relative">
                  <CustomInput
                    label="Correct example"
                    value={getDisplayValue(`mistake_${mistakeIndex}_correct`)}
                    onChange={(val) => handleFieldChange(`mistake_${mistakeIndex}_correct`, val)}
                    onFocus={() => {
                      if (!editingFields[`mistake_${mistakeIndex}_correct`]?.isEditing) {
                        startEditField(`mistake_${mistakeIndex}_correct`)
                      }
                    }}
                    variant="default"
                    placeholder="Correct example"
                    size="sm"
                  />
                  {editingFields[`mistake_${mistakeIndex}_correct`]?.isEditing &&
                    hasFieldChanged(`mistake_${mistakeIndex}_correct`) && (
                      <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                        <button
                          onClick={() => confirmFieldChange(`mistake_${mistakeIndex}_correct`)}
                          className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                          title="Save correct example"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                </div>

                <div className="relative">
                  <CustomInput
                    label="Explanation"
                    value={getDisplayValue(`mistake_${mistakeIndex}_explanation`)}
                    onChange={(val) =>
                      handleFieldChange(`mistake_${mistakeIndex}_explanation`, val)
                    }
                    onFocus={() => {
                      if (!editingFields[`mistake_${mistakeIndex}_explanation`]?.isEditing) {
                        startEditField(`mistake_${mistakeIndex}_explanation`)
                      }
                    }}
                    variant="default"
                    placeholder="Explanation"
                    size="sm"
                  />
                  {editingFields[`mistake_${mistakeIndex}_explanation`]?.isEditing &&
                    hasFieldChanged(`mistake_${mistakeIndex}_explanation`) && (
                      <div className="absolute right-2 top-[32px] flex gap-1 z-10">
                        <button
                          onClick={() => confirmFieldChange(`mistake_${mistakeIndex}_explanation`)}
                          className="p-1.5 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
                          title="Save explanation"
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
      </section>

      {/* Metadata Section */}
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

export default GrammarContentSection
