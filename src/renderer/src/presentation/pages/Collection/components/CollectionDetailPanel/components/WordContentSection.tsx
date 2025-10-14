import { useState } from 'react'
import { vocabulary_item } from '../../../types/vocabulary'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import CustomTag from '../../../../../../components/common/CustomTag'
import Metadata from '../../../../../../components/common/Metadata'
import CustomButton from '../../../../../../components/common/CustomButton'
import { Plus, Trash2 } from 'lucide-react'

interface WordContentSectionProps {
  item: vocabulary_item
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

const DIFFICULTY_LEVELS = [
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
]

const FREQUENCY_RANKS = [
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
]

const CATEGORIES = [
  { value: 'business', label: 'Business' },
  { value: 'daily', label: 'Daily' },
  { value: 'travel', label: 'Travel' },
  { value: 'academic', label: 'Academic' },
  { value: 'technical', label: 'Technical' },
  { value: 'slang', label: 'Slang' },
  { value: 'formal', label: 'Formal' }
]

const WordContentSection = ({ item }: WordContentSectionProps) => {
  // Lấy definitions từ metadata.definitions hoặc khởi tạo mặc định
  const getInitialDefinitions = (): Definition[] => {
    if (item.metadata?.definitions && Array.isArray(item.metadata.definitions)) {
      return item.metadata.definitions as Definition[]
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

  const [isEditing, setIsEditing] = useState(true)
  const [formData, setFormData] = useState({
    content: item.content,
    pronunciation: item.pronunciation || '',
    definitions: getInitialDefinitions(),
    difficulty_level: item.difficulty_level || 0,
    frequency_rank: item.frequency_rank || 0,
    category: item.category || '',
    tags: item.tags || [],
    metadata: item.metadata || {}
  })

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handlePronunciationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pronunciation: value }))
  }

  const handleDifficultyChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      difficulty_level: parseInt(typeof value === 'string' ? value : value[0])
    }))
  }

  const handleFrequencyChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      frequency_rank: parseInt(typeof value === 'string' ? value : value[0])
    }))
  }

  const handleCategoryChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      category: typeof value === 'string' ? value : value[0]
    }))
  }

  const handleTagsChange = (newTags: string[]) => {
    setFormData((prev) => ({ ...prev, tags: newTags }))
  }

  const handleMetadataChange = (newMetadata: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, metadata: newMetadata }))
  }

  const handleDefinitionChange = (defIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      if (field === 'meaning' || field === 'translation' || field === 'word_type') {
        newDefs[defIndex] = { ...newDefs[defIndex], [field]: value }
      }
      return { ...prev, definitions: newDefs }
    })
  }

  const handleExampleChange = (defIndex: number, exIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      const newExamples = [...newDefs[defIndex].examples]
      if (field === 'sentence' || field === 'translation') {
        newExamples[exIndex] = { ...newExamples[exIndex], [field]: value }
      }
      newDefs[defIndex] = { ...newDefs[defIndex], examples: newExamples }
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

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label="Word"
            value={formData.content}
            onChange={handleContentChange}
            disabled={!isEditing}
            variant={isEditing ? 'default' : 'filled'}
            size="sm"
          />

          <CustomInput
            label="Pronunciation (IPA)"
            value={formData.pronunciation}
            onChange={handlePronunciationChange}
            disabled={!isEditing}
            variant={isEditing ? 'default' : 'filled'}
            placeholder="vd: /ˌpɜːrsəˈvɪrəns/"
            size="sm"
          />

          <CustomCombobox
            label="Difficulty"
            value={formData.difficulty_level > 0 ? formData.difficulty_level.toString() : ''}
            options={DIFFICULTY_LEVELS}
            onChange={handleDifficultyChange}
            size="sm"
          />

          <CustomCombobox
            label="Frequency"
            value={formData.frequency_rank > 0 ? formData.frequency_rank.toString() : ''}
            options={FREQUENCY_RANKS}
            onChange={handleFrequencyChange}
            size="sm"
          />

          <CustomCombobox
            label="Category"
            value={formData.category}
            options={CATEGORIES}
            onChange={handleCategoryChange}
            creatable={isEditing}
            size="sm"
          />
        </div>

        {/* Tags */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <CustomTag
            tags={formData.tags}
            onTagsChange={handleTagsChange}
            disabled={!isEditing}
            placeholder="Add tag..."
            allowDuplicates={false}
          />
        </div>
      </section>

      {/* Definitions & Examples */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Definition & Examples</h3>
          {isEditing && (
            <CustomButton variant="secondary" size="sm" icon={Plus} onClick={addDefinition}>
              Add definition
            </CustomButton>
          )}
        </div>

        <div className="space-y-4">
          {formData.definitions.map((def: Definition, defIndex: number) => (
            <div key={def.id} className="p-4 border border-border-default rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  Defineition {defIndex + 1}
                </span>
                {isEditing && formData.definitions.length > 1 && (
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
                  label="Meaning (English)"
                  value={def.meaning}
                  onChange={(val) => handleDefinitionChange(defIndex, 'meaning', val)}
                  disabled={!isEditing}
                  variant={isEditing ? 'default' : 'filled'}
                  placeholder="Enter English definition"
                  size="sm"
                />

                <CustomInput
                  label="Translate"
                  value={def.translation || ''}
                  onChange={(val) => handleDefinitionChange(defIndex, 'translation', val)}
                  disabled={!isEditing}
                  variant={isEditing ? 'default' : 'filled'}
                  placeholder="Enter translation"
                  size="sm"
                />

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

              {/* Examples */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Example</span>
                  {isEditing && (
                    <button
                      onClick={() => addExample(defIndex)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add example
                    </button>
                  )}
                </div>

                {def.examples.map((example: any, exIndex: number) => (
                  <div key={exIndex} className="p-3 bg-card-background rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">Example {exIndex + 1}</span>
                      {isEditing && def.examples.length > 1 && (
                        <button
                          onClick={() => removeExample(defIndex, exIndex)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <CustomInput
                      label="Example sentence"
                      value={example.sentence}
                      onChange={(val) => handleExampleChange(defIndex, exIndex, 'sentence', val)}
                      disabled={!isEditing}
                      variant={isEditing ? 'default' : 'filled'}
                      placeholder="Example sentence"
                      size="sm"
                    />
                    <CustomInput
                      label="Translate (example)"
                      value={example.translation || ''}
                      onChange={(val) => handleExampleChange(defIndex, exIndex, 'translation', val)}
                      disabled={!isEditing}
                      variant={isEditing ? 'default' : 'filled'}
                      placeholder="Translation"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metadata */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Metadata</h3>
        <Metadata
          metadata={formData.metadata}
          onMetadataChange={handleMetadataChange}
          readOnly={!isEditing}
          allowCreate={isEditing}
          allowDelete={isEditing}
          allowEdit={isEditing}
          size="sm"
          collapsible={true}
          defaultExpanded={false}
        />
      </section>
    </div>
  )
}

export default WordContentSection
