import { useState, useCallback, useMemo } from 'react'
import { Wand2, Plus, Trash2 } from 'lucide-react'
import CustomModal from '../../../../../../components/common/CustomModal'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomTag from '../../../../../../components/common/CustomTag'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import Metadata from '../../../../../../components/common/Metadata'
import { vocabulary_item } from '../../../types/vocabulary'
import { useGeminiApiKeys } from '../../../../../../hooks/useGeminiApiKeys'
import {
  createCreateCollectionService,
  AIPhraseResult
} from '../../../services/CreateCollectionService'

const PHRASE_TYPES = [
  { value: 'idiom', label: 'Idiom' },
  { value: 'phrasal_verb', label: 'Phrasal Verb' },
  { value: 'collocation', label: 'Collocation' },
  { value: 'slang', label: 'Slang' },
  { value: 'expression', label: 'Expression' }
]

interface CreatePhraseContentProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[]) => void
}

interface PhraseFormData {
  content: string
  pronunciation?: string
  definitions: Array<{
    meaning: string
    translation?: string
    phraseType?: string
    examples: Array<{
      sentence: string
      translation?: string
    }>
  }>
  difficulty_level: number
  frequency_rank: number
  category: string
  tags: string[]
  metadata: Record<string, any>
}

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
  { value: 'academic', label: 'Academic' }
]

const CreatePhraseContent = ({ isOpen, onClose, onCreateSuccess }: CreatePhraseContentProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<PhraseFormData>({
    content: '',
    pronunciation: '',
    definitions: [
      {
        meaning: '',
        translation: '',
        phraseType: '',
        examples: [{ sentence: '', translation: '' }]
      }
    ],
    difficulty_level: 0,
    frequency_rank: 0,
    category: '',
    tags: [],
    metadata: {}
  })
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  const hasApiKeys = useMemo(() => apiKeys.length > 0, [apiKeys])

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
    setAiError('')
  }

  const handlePronunciationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pronunciation: value }))
  }

  const handlePhraseTypeChange = (defIndex: number, value: string | string[]) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      newDefs[defIndex] = {
        ...newDefs[defIndex],
        phraseType: typeof value === 'string' ? value : value[0] || ''
      }
      return { ...prev, definitions: newDefs }
    })
  }

  const handleDefinitionChange = (defIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      if (field === 'meaning' || field === 'translation') {
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
          meaning: '',
          translation: '',
          phraseType: '',
          examples: [{ sentence: '', translation: '' }]
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
          examples: newDefs[defIndex].examples.filter((_, i) => i !== exIndex)
        }
        return { ...prev, definitions: newDefs }
      })
    }
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
    setFormData((prev) => ({
      ...prev,
      tags: newTags
    }))
  }

  const handleMetadataChange = (newMetadata: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      metadata: newMetadata
    }))
  }

  const fetchAIInfo = useCallback(async () => {
    if (!formData.content.trim()) {
      setAiError('Vui lòng nhập cụm từ')
      return
    }

    if (!hasApiKeys) {
      setAiError('Không tìm thấy Gemini API key. Vui lòng thêm trong Settings')
      return
    }

    setIsLoadingAI(true)
    setAiError('')

    try {
      const selectedApiKey = apiKeys[0]
      const service = createCreateCollectionService(selectedApiKey.key)
      const aiData: AIPhraseResult = await service.fetchSinglePhrase(formData.content.trim())

      const flattenMetadata = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
        const flattened: Record<string, any> = {}

        Object.entries(obj || {}).forEach(([key, value]) => {
          const newKey = prefix ? `${prefix}_${key}` : key

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(flattened, flattenMetadata(value, newKey))
          } else {
            flattened[newKey] = value
          }
        })

        return flattened
      }

      setFormData((prev) => ({
        ...prev,
        pronunciation: aiData.ipaNotation || prev.pronunciation,
        definitions:
          aiData.definitions && aiData.definitions.length > 0
            ? aiData.definitions.map((def) => ({
                ...def,
                phraseType: aiData.phraseType || def.phraseType || ''
              }))
            : prev.definitions,
        difficulty_level: aiData.difficulty_level || prev.difficulty_level,
        frequency_rank: aiData.frequency_rank || prev.frequency_rank,
        category: aiData.category || prev.category,
        tags: aiData.tags || prev.tags,
        metadata: flattenMetadata(aiData.metadata || {})
      }))
    } catch (error) {
      console.error('[CreatePhraseContent] AI Error:', error)
      setAiError(
        error instanceof Error
          ? `Lỗi AI: ${error.message}`
          : 'Không thể lấy thông tin từ AI. Vui lòng thử lại.'
      )
    } finally {
      setIsLoadingAI(false)
    }
  }, [formData.content, hasApiKeys, apiKeys])

  const handleCreate = async () => {
    if (!formData.content.trim()) {
      setAiError('Vui lòng nhập cụm từ')
      return
    }

    const metadataWithDefinitions = {
      ...formData.metadata,
      definitions: formData.definitions
    }

    const newItem: vocabulary_item = {
      id: `vocab_${Date.now()}`,
      item_type: 'phrase',
      content: formData.content.trim(),
      pronunciation: formData.pronunciation || undefined,
      difficulty_level:
        formData.difficulty_level > 0 ? (formData.difficulty_level as any) : undefined,
      frequency_rank: formData.frequency_rank > 0 ? (formData.frequency_rank as any) : undefined,
      category: formData.category || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      metadata:
        Object.keys(metadataWithDefinitions).length > 0 ? metadataWithDefinitions : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { getCloudDatabase } = await import('../../../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (db) {
        await db.saveVocabularyItem(newItem)
        onCreateSuccess?.([newItem])
        handleReset()
        onClose()
      } else {
        setAiError('Không thể kết nối database')
      }
    } catch (error) {
      console.error('[CreatePhraseContent] Error saving:', error)
      setAiError(error instanceof Error ? error.message : 'Lỗi khi lưu')
    }
  }

  const handleReset = () => {
    setFormData({
      content: '',
      pronunciation: '',
      definitions: [
        {
          meaning: '',
          translation: '',
          phraseType: '',
          examples: [{ sentence: '', translation: '' }]
        }
      ],
      difficulty_level: 0,
      frequency_rank: 0,
      category: '',
      tags: [],
      metadata: {}
    })
    setAiError('')
  }

  const handleCancel = () => {
    handleReset()
    onClose()
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add new phrase"
      size="2xl"
      actionText="Create Phrase"
      cancelText="Cancel"
      onAction={handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={isLoadingAI || !formData.content.trim()}
    >
      <div className="p-6 h-[80vh] flex flex-col">
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* LEFT PANEL - Basic Info */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <h3 className="font-semibold text-text-primary">Basic information</h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phrase
                </label>
                <button
                  onClick={fetchAIInfo}
                  disabled={isLoadingAI || !formData.content.trim()}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!hasApiKeys ? 'Không tìm thấy Gemini API key' : ''}
                >
                  <Wand2 className="w-3 h-3" />
                  {isLoadingAI ? 'Đang tải...' : 'AI'}
                </button>
              </div>
              <CustomInput
                type="text"
                value={formData.content}
                onChange={handleContentChange}
                placeholder="vd: break the ice, take off"
                variant="default"
                size="sm"
              />
            </div>

            <CustomInput
              type="text"
              label="Pronunciation (IPA)"
              value={formData.pronunciation}
              onChange={handlePronunciationChange}
              placeholder="vd: /breɪk ðə aɪs/"
              variant="default"
              size="sm"
            />

            <div className="pt-4 border-t border-border-default space-y-4">
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
                creatable={true}
                size="sm"
              />

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Tags
                </label>
                <CustomTag
                  tags={formData.tags}
                  onTagsChange={handleTagsChange}
                  placeholder="Enter tag name..."
                  allowDuplicates={false}
                  className="mt-2"
                  size="sm"
                />
              </div>

              <div className="pt-4 border-t border-border-default">
                <Metadata
                  metadata={formData.metadata}
                  onMetadataChange={handleMetadataChange}
                  title="Custom Metadata"
                  size="sm"
                  collapsible={true}
                  defaultExpanded={false}
                  allowCreate={true}
                  allowDelete={true}
                  allowEdit={true}
                  hideEmpty={false}
                />
              </div>
            </div>

            {aiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                {aiError}
              </div>
            )}

            {!hasApiKeys && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Gemini API key not found. Add key in Settings to use AI features.
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Definitions & Examples */}
          <div className="flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-text-primary">Definition & Examples</h3>
              <button
                onClick={addDefinition}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30"
              >
                <Plus className="w-3 h-3" />
                Add definition
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto">
              {formData.definitions.map((def, defIndex) => (
                <div
                  key={defIndex}
                  className="p-3 border border-border-default rounded-lg space-y-3"
                >
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

                  <CustomCombobox
                    label="Phrase Type"
                    value={def.phraseType || ''}
                    options={PHRASE_TYPES}
                    onChange={(val) => handlePhraseTypeChange(defIndex, val)}
                    placeholder="Select phrase type"
                    size="sm"
                  />

                  <CustomInput
                    type="text"
                    label="Meaning (English)"
                    value={def.meaning}
                    onChange={(val) => handleDefinitionChange(defIndex, 'meaning', val)}
                    placeholder="Enter English definition"
                    variant="default"
                    size="sm"
                  />

                  <CustomInput
                    type="text"
                    label="Translate"
                    value={def.translation || ''}
                    onChange={(val) => handleDefinitionChange(defIndex, 'translation', val)}
                    placeholder="Enter translation"
                    variant="default"
                    size="sm"
                  />

                  {/* Examples */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary">Examples</span>
                      <button
                        onClick={() => addExample(defIndex)}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-600 hover:bg-green-500/30"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>

                    {def.examples.map((example, exIndex) => (
                      <div key={exIndex} className="p-2 bg-card-background rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Example {exIndex + 1}</span>
                          {def.examples.length > 1 && (
                            <button
                              onClick={() => removeExample(defIndex, exIndex)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <CustomInput
                          type="text"
                          value={example.sentence}
                          onChange={(val) =>
                            handleExampleChange(defIndex, exIndex, 'sentence', val)
                          }
                          placeholder="Example sentences"
                          variant="default"
                          size="sm"
                        />
                        <CustomInput
                          type="text"
                          value={example.translation || ''}
                          onChange={(val) =>
                            handleExampleChange(defIndex, exIndex, 'translation', val)
                          }
                          placeholder="Translate"
                          variant="default"
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  )
}

export default CreatePhraseContent
