import { useState, useCallback, useMemo } from 'react'
import { Wand2, Plus, Trash2, X } from 'lucide-react'
import CustomModal from '../../../../../../components/common/CustomModal'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import { vocabulary_item } from '../../../types/vocabulary'
import { useGeminiApiKeys } from '../../../../../../hooks/useGeminiApiKeys'
import {
  createCreateCollectionService,
  AIWordResult
} from '../../../services/CreateCollectionService'

interface CreateWordModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[]) => void
}

interface WordFormData {
  content: string
  pronunciation?: string
  wordType?: string
  definitions: Array<{
    meaning: string
    translation?: string
    examples: Array<{
      sentence: string
      translation?: string
    }>
  }>
  metadata: {
    difficulty_level: number
    frequency_rank: number
    category: string
    tags: string[]
  }
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
  { value: 'academic', label: 'Academic' }
]

const COMMON_TAGS = [
  'formal',
  'informal',
  'british',
  'american',
  'spoken',
  'written',
  'common',
  'rare',
  'technical',
  'casual'
]

const CreateWordModal = ({ isOpen, onClose, onCreateSuccess }: CreateWordModalProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<WordFormData>({
    content: '',
    pronunciation: '',
    wordType: '',
    definitions: [{ meaning: '', translation: '', examples: [{ sentence: '', translation: '' }] }],
    metadata: {
      difficulty_level: 5,
      frequency_rank: 5,
      category: 'daily',
      tags: []
    }
  })
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')
  const [tagInput, setTagInput] = useState('')

  const hasApiKeys = useMemo(() => apiKeys.length > 0, [apiKeys])

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
    setAiError('')
  }

  const handlePronunciationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pronunciation: value }))
  }

  const handleWordTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      wordType: typeof value === 'string' ? value : value[0] || ''
    }))
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
        { meaning: '', translation: '', examples: [{ sentence: '', translation: '' }] }
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

  const handleMetadataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }))
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !formData.metadata.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, trimmedTag]
        }
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter((tag) => tag !== tagToRemove)
      }
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const fetchAIInfo = useCallback(async () => {
    if (!formData.content.trim()) {
      setAiError('Vui lòng nhập từ vựng')
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

      // Tạo service instance với API key
      const service = createCreateCollectionService(selectedApiKey.key)

      // Gọi API thông qua service
      const aiData: AIWordResult = await service.fetchSingleWord(formData.content.trim())

      // Populate data vào form
      setFormData((prev) => ({
        ...prev,
        pronunciation: aiData.ipaNotation || prev.pronunciation,
        wordType: aiData.wordType || prev.wordType,
        definitions:
          aiData.definitions && aiData.definitions.length > 0
            ? aiData.definitions
            : prev.definitions,
        metadata: {
          difficulty_level: prev.metadata.difficulty_level,
          frequency_rank: prev.metadata.frequency_rank,
          category: prev.metadata.category,
          tags: prev.metadata.tags
        }
      }))

      console.log('[CreateWordModal] AI data fetched successfully:', aiData)
    } catch (error) {
      console.error('[CreateWordModal] AI Error:', error)
      setAiError(
        error instanceof Error
          ? `Lỗi AI: ${error.message}`
          : 'Không thể lấy thông tin từ AI. Vui lòng thử lại.'
      )
    } finally {
      setIsLoadingAI(false)
    }
  }, [formData.content, hasApiKeys, apiKeys])

  const handleCreate = () => {
    if (!formData.content.trim()) {
      setAiError('Vui lòng nhập từ vựng')
      return
    }

    const newItem: vocabulary_item = {
      id: `vocab_${Date.now()}`,
      item_type: 'word',
      content: formData.content.trim(),
      pronunciation: formData.pronunciation || undefined,
      word_type: (formData.wordType as any) || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onCreateSuccess?.([newItem])
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setFormData({
      content: '',
      pronunciation: '',
      wordType: '',
      definitions: [
        { meaning: '', translation: '', examples: [{ sentence: '', translation: '' }] }
      ],
      metadata: {
        difficulty_level: 5,
        frequency_rank: 5,
        category: 'daily',
        tags: []
      }
    })
    setAiError('')
    setTagInput('')
  }

  const handleCancel = () => {
    handleReset()
    onClose()
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Thêm từ vựng mới"
      size="2xl"
      actionText="Tạo"
      cancelText="Hủy"
      onAction={handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={isLoadingAI || !formData.content.trim()}
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* LEFT PANEL - Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Thông tin cơ bản</h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Từ vựng
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
                placeholder="vd: persevere, resilience"
                variant="default"
                size="sm"
              />
            </div>

            <CustomInput
              type="text"
              label="Phát âm (IPA)"
              value={formData.pronunciation}
              onChange={handlePronunciationChange}
              placeholder="vd: /ˌpɜːrsəˈvɪrəns/"
              variant="default"
              size="sm"
            />

            <CustomCombobox
              label="Loại từ"
              value={formData.wordType}
              options={WORD_TYPES}
              onChange={handleWordTypeChange}
              placeholder="Chọn loại từ"
              size="sm"
            />

            {/* Metadata Section */}
            <div className="pt-4 border-t border-border-default space-y-4">
              <h3 className="font-semibold text-text-primary">Metadata</h3>

              <CustomCombobox
                label="Độ khó"
                value={formData.metadata.difficulty_level.toString()}
                options={DIFFICULTY_LEVELS}
                onChange={(val) =>
                  handleMetadataChange(
                    'difficulty_level',
                    parseInt(typeof val === 'string' ? val : val[0])
                  )
                }
                size="sm"
              />

              <CustomCombobox
                label="Tần suất sử dụng"
                value={formData.metadata.frequency_rank.toString()}
                options={FREQUENCY_RANKS}
                onChange={(val) =>
                  handleMetadataChange(
                    'frequency_rank',
                    parseInt(typeof val === 'string' ? val : val[0])
                  )
                }
                size="sm"
              />

              <CustomCombobox
                label="Danh mục"
                value={formData.metadata.category}
                options={CATEGORIES}
                onChange={(val) =>
                  handleMetadataChange('category', typeof val === 'string' ? val : val[0])
                }
                size="sm"
              />

              {/* Tags Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Nhập tag và nhấn Enter"
                      className="flex-1 px-3 py-2 text-sm bg-input-background border border-border-default rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
                    />
                    <button
                      onClick={() => handleAddTag(tagInput)}
                      disabled={!tagInput.trim()}
                      className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Common tags quick add */}
                  <div className="flex flex-wrap gap-1">
                    {COMMON_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        disabled={formData.metadata.tags.includes(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Selected tags */}
                  {formData.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-card-background rounded border border-border-default">
                      {formData.metadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-primary/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {aiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                {aiError}
              </div>
            )}

            {!hasApiKeys && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Không tìm thấy Gemini API key. Thêm key trong Settings để sử dụng tính năng AI.
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Definitions & Examples */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Định nghĩa & Ví dụ</h3>
              <button
                onClick={addDefinition}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30"
              >
                <Plus className="w-3 h-3" />
                Thêm định nghĩa
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {formData.definitions.map((def, defIndex) => (
                <div
                  key={defIndex}
                  className="p-3 border border-border-default rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-secondary">
                      Định nghĩa {defIndex + 1}
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
                    label="Nghĩa (tiếng Anh)"
                    value={def.meaning}
                    onChange={(val) => handleDefinitionChange(defIndex, 'meaning', val)}
                    placeholder="Nhập định nghĩa tiếng Anh"
                    variant="default"
                    size="sm"
                  />

                  <CustomInput
                    type="text"
                    label="Dịch nghĩa"
                    value={def.translation || ''}
                    onChange={(val) => handleDefinitionChange(defIndex, 'translation', val)}
                    placeholder="Nhập dịch nghĩa tiếng Việt"
                    variant="default"
                    size="sm"
                  />

                  {/* Examples */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary">Ví dụ</span>
                      <button
                        onClick={() => addExample(defIndex)}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-600 hover:bg-green-500/30"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm
                      </button>
                    </div>

                    {def.examples.map((example, exIndex) => (
                      <div key={exIndex} className="p-2 bg-card-background rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">Ví dụ {exIndex + 1}</span>
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
                          placeholder="Câu ví dụ"
                          variant="default"
                          size="sm"
                        />
                        <CustomInput
                          type="text"
                          value={example.translation || ''}
                          onChange={(val) =>
                            handleExampleChange(defIndex, exIndex, 'translation', val)
                          }
                          placeholder="Dịch nghĩa tiếng Việt"
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

export default CreateWordModal
