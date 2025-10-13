import { useState, useCallback, useMemo } from 'react'
import { Wand2, Plus, Trash2 } from 'lucide-react'
import CustomModal from '../../../../../../components/common/CustomModal'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import { grammar_item } from '../../../types/grammar'
import { useGeminiApiKeys } from '../../../../../../hooks/useGeminiApiKeys'

interface CreateGrammarContentProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: grammar_item[]) => void
}

interface GrammarFormData {
  content: string
  grammarType?: string
  definitions: Array<{
    description: string
    explanation: string
    structure?: string
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
  metadata: {
    difficulty_level?: number
    category?: string
  }
}

const GRAMMAR_TYPES = [
  { value: 'tense', label: 'Tense' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'passive', label: 'Passive' },
  { value: 'modal', label: 'Modal' },
  { value: 'article', label: 'Article' },
  { value: 'preposition_usage', label: 'Preposition Usage' },
  { value: 'sentence_structure', label: 'Sentence Structure' }
]

const CATEGORIES = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const CreateGrammarContent = ({ isOpen, onClose, onCreateSuccess }: CreateGrammarContentProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<GrammarFormData>({
    content: '',
    grammarType: '',
    definitions: [{ description: '', explanation: '', structure: '' }],
    examples: [{ sentence: '', translation: '', usage_note: '' }],
    commonMistakes: [{ incorrect: '', correct: '', explanation: '' }],
    metadata: { difficulty_level: 3, category: 'intermediate' }
  })
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  const hasApiKeys = useMemo(() => apiKeys.length > 0, [apiKeys])

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
    setAiError('')
  }

  const handleGrammarTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      grammarType: typeof value === 'string' ? value : value[0] || ''
    }))
  }

  const handleDefinitionChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newDefs = [...prev.definitions]
      newDefs[index] = { ...newDefs[index], [field]: value }
      return { ...prev, definitions: newDefs }
    })
  }

  const addDefinition = () => {
    setFormData((prev) => ({
      ...prev,
      definitions: [...prev.definitions, { description: '', explanation: '', structure: '' }]
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

  const handleExampleChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newExamples = [...prev.examples]
      newExamples[index] = { ...newExamples[index], [field]: value }
      return { ...prev, examples: newExamples }
    })
  }

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { sentence: '', translation: '', usage_note: '' }]
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

  const handleMistakeChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newMistakes = [...prev.commonMistakes]
      newMistakes[index] = { ...newMistakes[index], [field]: value }
      return { ...prev, commonMistakes: newMistakes }
    })
  }

  const addMistake = () => {
    setFormData((prev) => ({
      ...prev,
      commonMistakes: [...prev.commonMistakes, { incorrect: '', correct: '', explanation: '' }]
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

  const fetchAIInfo = useCallback(async () => {
    if (!formData.content.trim()) {
      setAiError('Please enter a grammar point')
      return
    }

    if (!hasApiKeys) {
      setAiError('No Gemini API key found. Please add one in Settings')
      return
    }

    setIsLoadingAI(true)
    setAiError('')

    try {
      const selectedApiKey = apiKeys[0]
      const prompt = `Find comprehensive information about the grammar point "${formData.content}". 
                     Return JSON: {
                       "grammarType": "type (tense/conditional/passive/modal/article/preposition_usage/sentence_structure)",
                       "definitions": [
                         {
                           "description": "brief description",
                           "explanation": "detailed explanation",
                           "structure": "grammatical structure or formula"
                         }
                       ],
                       "examples": [
                         {
                           "sentence": "example sentence",
                           "translation": "Vietnamese translation"
                         }
                       ]
                     }
                     Only return JSON, no other text.`

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': selectedApiKey.key
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!content) {
        throw new Error('No response from API')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse API response')
      }

      const aiData = JSON.parse(jsonMatch[0])

      setFormData((prev) => ({
        ...prev,
        grammarType: aiData.grammarType || prev.grammarType,
        definitions: aiData.definitions || prev.definitions,
        examples: aiData.examples || prev.examples
      }))
    } catch (error) {
      console.error('[CreateGrammarContent] AI Error:', error)
      setAiError(
        error instanceof Error
          ? `AI Error: ${error.message}`
          : 'Failed to fetch AI info. Try again.'
      )
    } finally {
      setIsLoadingAI(false)
    }
  }, [formData.content, hasApiKeys, apiKeys])

  const handleCreate = () => {
    if (!formData.content.trim()) {
      setAiError('Please enter a grammar point')
      return
    }

    if (!formData.definitions[0].description.trim()) {
      setAiError('Please add at least one definition description')
      return
    }

    const newItem: grammar_item = {
      id: `grammar_${Date.now()}`,
      content: formData.content.trim(),
      grammar_type: (formData.grammarType as any) || 'tense',
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
      grammarType: '',
      definitions: [{ description: '', explanation: '', structure: '' }],
      examples: [{ sentence: '', translation: '', usage_note: '' }],
      commonMistakes: [{ incorrect: '', correct: '', explanation: '' }],
      metadata: { difficulty_level: 3, category: 'intermediate' }
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
      title="Add New Grammar"
      size="2xl"
      actionText="Create"
      cancelText="Cancel"
      onAction={handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={isLoadingAI || !formData.content.trim()}
    >
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-text-primary">Basic Information</h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Grammar Point
              </label>
              <button
                onClick={fetchAIInfo}
                disabled={isLoadingAI || !formData.content.trim()}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wand2 className="w-3 h-3" />
                {isLoadingAI ? 'Loading...' : 'AI'}
              </button>
            </div>
            <CustomInput
              type="text"
              value={formData.content}
              onChange={handleContentChange}
              placeholder="e.g. Present Perfect Continuous"
              variant="default"
              size="sm"
            />
          </div>

          <CustomCombobox
            label="Grammar Type"
            value={formData.grammarType}
            options={GRAMMAR_TYPES}
            onChange={handleGrammarTypeChange}
            placeholder="Select grammar type"
            size="sm"
          />
        </div>

        {/* Definitions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Definitions</h3>
            <button
              onClick={addDefinition}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30"
            >
              <Plus className="w-3 h-3" />
              Add Definition
            </button>
          </div>

          {formData.definitions.map((def, index) => (
            <div key={index} className="p-3 border border-border-default rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  Definition {index + 1}
                </span>
                {formData.definitions.length > 1 && (
                  <button
                    onClick={() => removeDefinition(index)}
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
                onChange={(val) => handleDefinitionChange(index, 'description', val)}
                placeholder="Brief description"
                variant="default"
                size="sm"
              />

              <CustomInput
                type="text"
                label="Explanation"
                value={def.explanation}
                onChange={(val) => handleDefinitionChange(index, 'explanation', val)}
                placeholder="Detailed explanation"
                variant="default"
                multiline
                rows={3}
                size="sm"
              />

              <CustomInput
                type="text"
                label="Structure/Formula"
                value={def.structure || ''}
                onChange={(val) => handleDefinitionChange(index, 'structure', val)}
                placeholder="e.g. Subject + have/has + been + verb-ing"
                variant="default"
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Examples</h3>
            <button
              onClick={addExample}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-600 hover:bg-green-500/30"
            >
              <Plus className="w-3 h-3" />
              Add Example
            </button>
          </div>

          {formData.examples.map((example, index) => (
            <div key={index} className="p-3 border border-border-default rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Example {index + 1}</span>
                {formData.examples.length > 1 && (
                  <button
                    onClick={() => removeExample(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <CustomInput
                type="text"
                label="Sentence"
                value={example.sentence}
                onChange={(val) => handleExampleChange(index, 'sentence', val)}
                placeholder="Example sentence"
                variant="default"
                size="sm"
              />

              <CustomInput
                type="text"
                label="Translation"
                value={example.translation || ''}
                onChange={(val) => handleExampleChange(index, 'translation', val)}
                placeholder="Vietnamese translation"
                variant="default"
                size="sm"
              />

              <CustomInput
                type="text"
                label="Usage Note"
                value={example.usage_note || ''}
                onChange={(val) => handleExampleChange(index, 'usage_note', val)}
                placeholder="When to use this"
                variant="default"
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Common Mistakes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Common Mistakes</h3>
            <button
              onClick={addMistake}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/20 text-red-600 hover:bg-red-500/30"
            >
              <Plus className="w-3 h-3" />
              Add Mistake
            </button>
          </div>

          {formData.commonMistakes.map((mistake, index) => (
            <div
              key={index}
              className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Mistake {index + 1}</span>
                {formData.commonMistakes.length > 1 && (
                  <button
                    onClick={() => removeMistake(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <CustomInput
                type="text"
                label="Incorrect Usage"
                value={mistake.incorrect}
                onChange={(val) => handleMistakeChange(index, 'incorrect', val)}
                placeholder="Wrong way to use it"
                variant="default"
                size="sm"
              />

              <CustomInput
                type="text"
                label="Correct Usage"
                value={mistake.correct}
                onChange={(val) => handleMistakeChange(index, 'correct', val)}
                placeholder="Right way to use it"
                variant="default"
                size="sm"
              />

              <CustomInput
                type="text"
                label="Explanation"
                value={mistake.explanation}
                onChange={(val) => handleMistakeChange(index, 'explanation', val)}
                placeholder="Why it's wrong"
                variant="default"
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary">Metadata</h3>
          <div className="grid grid-cols-2 gap-3">
            <CustomCombobox
              label="Difficulty Level"
              value={formData.metadata.difficulty_level?.toString() || '3'}
              options={[
                { value: '1', label: 'Very Easy' },
                { value: '2', label: 'Easy' },
                { value: '3', label: 'Medium' },
                { value: '4', label: 'Hard' },
                { value: '5', label: 'Very Hard' }
              ]}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    difficulty_level: parseInt(typeof val === 'string' ? val : val[0])
                  }
                }))
              }
              size="sm"
            />
            <CustomCombobox
              label="Category"
              value={formData.metadata.category || 'intermediate'}
              options={CATEGORIES}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    category: typeof val === 'string' ? val : val[0]
                  }
                }))
              }
              size="sm"
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
            ⚠️ No Gemini API key found. Add one in Settings to use AI features.
          </div>
        )}
      </div>
    </CustomModal>
  )
}

export default CreateGrammarContent
