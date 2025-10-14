import { useState, useCallback, useMemo } from 'react'
import { Wand2, Plus, Trash2 } from 'lucide-react'
import CustomModal from '../../../../../../components/common/CustomModal'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomTag from '../../../../../../components/common/CustomTag'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import Metadata from '../../../../../../components/common/Metadata'
import { grammar_item } from '../../../types/grammar'
import { useGeminiApiKeys } from '../../../../../../hooks/useGeminiApiKeys'
import {
  createCreateCollectionService,
  AIGrammarResult
} from '../../../services/CreateCollectionService'

const GRAMMAR_ITEM_TYPES = [
  { value: 'tense', label: 'Tense' },
  { value: 'structure', label: 'Structure' },
  { value: 'rule', label: 'Rule' },
  { value: 'pattern', label: 'Pattern' }
]

interface CreateGrammarContentProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: grammar_item[]) => void
}

interface GrammarFormData {
  title: string
  item_type: 'tense' | 'structure' | 'rule' | 'pattern'
  definitions: Array<{
    description: string
    explanation: string
    structure?: string
    translation?: string
  }>
  examples: Array<{
    sentence: string
    translation?: string
    usage_note?: string
  }>
  commonMistakes: Array<{
    incorrect: string
    correct: string
    explanation: string
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
  { value: 'tenses', label: 'Tenses' },
  { value: 'conditionals', label: 'Conditionals' },
  { value: 'passive', label: 'Passive Voice' },
  { value: 'reported_speech', label: 'Reported Speech' },
  { value: 'modals', label: 'Modal Verbs' }
]

const CreateGrammarContent = ({ isOpen, onClose, onCreateSuccess }: CreateGrammarContentProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<GrammarFormData>({
    title: '',
    item_type: 'tense',
    definitions: [
      {
        description: '',
        explanation: '',
        structure: '',
        translation: ''
      }
    ],
    examples: [
      {
        sentence: '',
        translation: '',
        usage_note: ''
      }
    ],
    commonMistakes: [
      {
        incorrect: '',
        correct: '',
        explanation: ''
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

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }))
    setAiError('')
  }

  const handleItemTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      item_type: (typeof value === 'string' ? value : value[0]) as any
    }))
  }

  const handleDefinitionChange = (defIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      if (
        field === 'description' ||
        field === 'explanation' ||
        field === 'structure' ||
        field === 'translation'
      ) {
        newDefs[defIndex] = { ...newDefs[defIndex], [field]: value }
      }
      return { ...prev, definitions: newDefs }
    })
  }

  const handleExampleChange = (exIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newExamples = [...prev.examples]
      if (field === 'sentence' || field === 'translation' || field === 'usage_note') {
        newExamples[exIndex] = { ...newExamples[exIndex], [field]: value }
      }
      return { ...prev, examples: newExamples }
    })
  }

  const handleMistakeChange = (mistakeIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newMistakes = [...prev.commonMistakes]
      if (field === 'incorrect' || field === 'correct' || field === 'explanation') {
        newMistakes[mistakeIndex] = { ...newMistakes[mistakeIndex], [field]: value }
      }
      return { ...prev, commonMistakes: newMistakes }
    })
  }

  const addDefinition = () => {
    setFormData((prev) => ({
      ...prev,
      definitions: [
        ...prev.definitions,
        {
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
        {
          sentence: '',
          translation: '',
          usage_note: ''
        }
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
        {
          incorrect: '',
          correct: '',
          explanation: ''
        }
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
    if (!formData.title.trim()) {
      setAiError('Vui lòng nhập tiêu đề điểm ngữ pháp')
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
      const aiData: AIGrammarResult = await service.fetchSingleGrammar(formData.title.trim())

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
        difficulty_level: aiData.difficulty_level || prev.difficulty_level,
        frequency_rank: aiData.frequency_rank || prev.frequency_rank,
        category: aiData.category || prev.category,
        tags: aiData.tags || prev.tags,
        definitions:
          aiData.definitions && aiData.definitions.length > 0
            ? aiData.definitions
            : prev.definitions,
        examples: aiData.examples && aiData.examples.length > 0 ? aiData.examples : prev.examples,
        commonMistakes:
          aiData.commonMistakes && aiData.commonMistakes.length > 0
            ? aiData.commonMistakes
            : prev.commonMistakes,
        metadata: flattenMetadata(aiData.metadata || {})
      }))
    } catch (error) {
      console.error('[CreateGrammarContent] AI Error:', error)
      setAiError(
        error instanceof Error
          ? `Lỗi AI: ${error.message}`
          : 'Không thể lấy thông tin từ AI. Vui lòng thử lại.'
      )
    } finally {
      setIsLoadingAI(false)
    }
  }, [formData.title, hasApiKeys, apiKeys])

  const handleCreate = () => {
    if (!formData.title.trim()) {
      setAiError('Vui lòng nhập tiêu đề điểm ngữ pháp')
      return
    }

    const metadataWithDetails = {
      ...formData.metadata,
      definitions: formData.definitions,
      examples: formData.examples,
      commonMistakes: formData.commonMistakes
    }

    const newItem: grammar_item = {
      id: `grammar_${Date.now()}`,
      item_type: formData.item_type,
      title: formData.title.trim(),
      difficulty_level:
        formData.difficulty_level > 0 ? (formData.difficulty_level as any) : undefined,
      frequency_rank: formData.frequency_rank > 0 ? (formData.frequency_rank as any) : undefined,
      category: formData.category || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      metadata: Object.keys(metadataWithDetails).length > 0 ? metadataWithDetails : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      onCreateSuccess?.([newItem])
    } catch (error) {
      console.error('[CreateGrammarContent] ❌ Error calling onCreateSuccess:', error)
    }

    handleReset()
    onClose()
  }

  const handleReset = () => {
    setFormData({
      title: '',
      item_type: 'tense',
      definitions: [
        {
          description: '',
          explanation: '',
          structure: '',
          translation: ''
        }
      ],
      examples: [
        {
          sentence: '',
          translation: '',
          usage_note: ''
        }
      ],
      commonMistakes: [
        {
          incorrect: '',
          correct: '',
          explanation: ''
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
      title="Add new grammar point"
      size="2xl"
      actionText="Tạo"
      cancelText="Hủy"
      onAction={handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={isLoadingAI || !formData.title.trim()}
    >
      <div className="p-6 h-[80vh] flex flex-col">
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* LEFT PANEL - Basic Info */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <h3 className="font-semibold text-text-primary">Basic information</h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grammar Title
                </label>
                <button
                  onClick={fetchAIInfo}
                  disabled={isLoadingAI || !formData.title.trim()}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!hasApiKeys ? 'Không tìm thấy Gemini API key' : ''}
                >
                  <Wand2 className="w-3 h-3" />
                  {isLoadingAI ? 'Đang tải...' : 'AI'}
                </button>
              </div>
              <CustomInput
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="vd: Present Perfect, Conditional Type 2"
                variant="default"
                size="sm"
              />
            </div>

            <CustomCombobox
              label="Item Type"
              value={formData.item_type}
              options={GRAMMAR_ITEM_TYPES}
              onChange={handleItemTypeChange}
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

          {/* RIGHT PANEL - Definitions, Examples & Mistakes */}
          <div className="flex flex-col space-y-4 overflow-y-auto">
            {/* Definitions Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary">Definitions</h3>
                <button
                  onClick={addDefinition}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {formData.definitions.map((def, defIndex) => (
                  <div
                    key={defIndex}
                    className="p-3 border border-border-default rounded-lg space-y-2"
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

                    <CustomInput
                      type="text"
                      label="Description"
                      value={def.description}
                      onChange={(val) => handleDefinitionChange(defIndex, 'description', val)}
                      placeholder="Brief description"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      label="Explanation"
                      value={def.explanation}
                      onChange={(val) => handleDefinitionChange(defIndex, 'explanation', val)}
                      placeholder="Detailed explanation"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      label="Structure"
                      value={def.structure || ''}
                      onChange={(val) => handleDefinitionChange(defIndex, 'structure', val)}
                      placeholder="Grammar structure or formula"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      label="Translation"
                      value={def.translation || ''}
                      onChange={(val) => handleDefinitionChange(defIndex, 'translation', val)}
                      placeholder="Vietnamese translation"
                      variant="default"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Examples Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary">Examples</h3>
                <button
                  onClick={addExample}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-600 hover:bg-green-500/30"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {formData.examples.map((example, exIndex) => (
                  <div key={exIndex} className="p-2 bg-card-background rounded space-y-2">
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

                    <CustomInput
                      type="text"
                      value={example.sentence}
                      onChange={(val) => handleExampleChange(exIndex, 'sentence', val)}
                      placeholder="Example sentence"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      value={example.translation || ''}
                      onChange={(val) => handleExampleChange(exIndex, 'translation', val)}
                      placeholder="Translation"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      value={example.usage_note || ''}
                      onChange={(val) => handleExampleChange(exIndex, 'usage_note', val)}
                      placeholder="Usage note"
                      variant="default"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary">Common Mistakes</h3>
                <button
                  onClick={addMistake}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-600 hover:bg-orange-500/30"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {formData.commonMistakes.map((mistake, mistakeIndex) => (
                  <div key={mistakeIndex} className="p-2 bg-card-background rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">
                        Mistake {mistakeIndex + 1}
                      </span>
                      {formData.commonMistakes.length > 1 && (
                        <button
                          onClick={() => removeMistake(mistakeIndex)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <CustomInput
                      type="text"
                      value={mistake.incorrect}
                      onChange={(val) => handleMistakeChange(mistakeIndex, 'incorrect', val)}
                      placeholder="Incorrect example"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      value={mistake.correct}
                      onChange={(val) => handleMistakeChange(mistakeIndex, 'correct', val)}
                      placeholder="Correct example"
                      variant="default"
                      size="sm"
                    />

                    <CustomInput
                      type="text"
                      value={mistake.explanation}
                      onChange={(val) => handleMistakeChange(mistakeIndex, 'explanation', val)}
                      placeholder="Explanation"
                      variant="default"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  )
}

export default CreateGrammarContent
