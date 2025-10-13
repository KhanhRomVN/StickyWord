import { useState, useCallback, useMemo } from 'react'
import { Wand2, Plus, Trash2 } from 'lucide-react'
import CustomModal from '../../../../../../components/common/CustomModal'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import { vocabulary_item } from '../../../types'
import { useGeminiApiKeys } from '../../../../../../hooks/useGeminiApiKeys'

interface CreatePhraseContentProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[]) => void
}

interface PhraseFormData {
  content: string
  ipaNotation?: string
  phraseType?: string
  definitions: Array<{
    meaning: string
    translation?: string
    examples: Array<{
      sentence: string
      translation?: string
    }>
  }>
  metadata: {
    difficulty_level?: number
    category?: string
    tags?: string[]
  }
}

const PHRASE_TYPES = [
  { value: 'idiom', label: 'Idiom' },
  { value: 'phrasal_verb', label: 'Phrasal Verb' },
  { value: 'collocation', label: 'Collocation' },
  { value: 'slang', label: 'Slang' },
  { value: 'expression', label: 'Expression' }
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
    ipaNotation: '',
    phraseType: '',
    definitions: [{ meaning: '', translation: '', examples: [{ sentence: '', translation: '' }] }],
    metadata: { difficulty_level: 3, category: 'daily', tags: [] }
  })
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  const hasApiKeys = useMemo(() => apiKeys.length > 0, [apiKeys])

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
    setAiError('')
  }

  const handleIpaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ipaNotation: value }))
  }

  const handlePhraseTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      phraseType: typeof value === 'string' ? value : value[0] || ''
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

  const fetchAIInfo = useCallback(async () => {
    if (!formData.content.trim()) {
      setAiError('Please enter a phrase')
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
      const prompt = `Find comprehensive information about the phrase "${formData.content}". 
                     Return JSON: {
                       "ipaNotation": "IPA notation",
                       "phraseType": "type (idiom/phrasal_verb/collocation/slang/expression)",
                       "definitions": [
                         {
                           "meaning": "English definition",
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
        ipaNotation: aiData.ipaNotation || prev.ipaNotation,
        phraseType: aiData.phraseType || prev.phraseType,
        definitions: aiData.definitions || prev.definitions
      }))
    } catch (error) {
      console.error('[CreatePhraseContent] AI Error:', error)
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
      setAiError('Please enter a phrase')
      return
    }

    if (!formData.definitions[0].meaning.trim()) {
      setAiError('Please add at least one definition')
      return
    }

    const newItem: vocabulary_item = {
      id: `vocab_${Date.now()}`,
      item_type: 'phrase',
      content: formData.content.trim(),
      ipa_notation: formData.ipaNotation || undefined,
      phrase_type: (formData.phraseType as any) || undefined,
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
      ipaNotation: '',
      phraseType: '',
      definitions: [
        { meaning: '', translation: '', examples: [{ sentence: '', translation: '' }] }
      ],
      metadata: { difficulty_level: 3, category: 'daily', tags: [] }
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
      title="Add New Phrase"
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phrase</label>
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
              placeholder="e.g. break the ice"
              variant="default"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CustomInput
              type="text"
              label="IPA Notation"
              value={formData.ipaNotation}
              onChange={handleIpaChange}
              placeholder="e.g. /breɪk ðə aɪs/"
              variant="default"
              size="sm"
            />
            <CustomCombobox
              label="Phrase Type"
              value={formData.phraseType}
              options={PHRASE_TYPES}
              onChange={handlePhraseTypeChange}
              placeholder="Select phrase type"
              size="sm"
            />
          </div>
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

          {formData.definitions.map((def, defIndex) => (
            <div key={defIndex} className="p-3 border border-border-default rounded-lg space-y-3">
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
                label="Meaning"
                value={def.meaning}
                onChange={(val) => handleDefinitionChange(defIndex, 'meaning', val)}
                placeholder="Enter English definition"
                variant="default"
                size="sm"
              />

              <CustomInput
                type="text"
                label="Translation"
                value={def.translation || ''}
                onChange={(val) => handleDefinitionChange(defIndex, 'translation', val)}
                placeholder="Enter Vietnamese translation"
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
                      onChange={(val) => handleExampleChange(defIndex, exIndex, 'sentence', val)}
                      placeholder="Example sentence"
                      variant="default"
                      size="sm"
                    />
                    <CustomInput
                      type="text"
                      value={example.translation || ''}
                      onChange={(val) => handleExampleChange(defIndex, exIndex, 'translation', val)}
                      placeholder="Vietnamese translation"
                      variant="default"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
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
              value={formData.metadata.category || 'daily'}
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

export default CreatePhraseContent
