import { useState, useCallback, useMemo } from 'react'
import { Wand2 } from 'lucide-react'
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

const CreateGrammarContent = ({ isOpen, onClose, onCreateSuccess }: CreateGrammarContentProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<GrammarFormData>({
    content: '',
    grammarType: ''
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
      const prompt = `Find information about the grammar point "${formData.content}". 
                     Return JSON: {
                       "grammarType": "type (tense/conditional/passive/modal/article/preposition_usage/sentence_structure)",
                       "explanation": "detailed explanation",
                       "structure": "grammatical structure or formula"
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
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
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
        grammarType: aiData.grammarType || prev.grammarType
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
      grammarType: ''
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
      size="lg"
      actionText="Create"
      cancelText="Cancel"
      onAction={handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={isLoadingAI || !formData.content.trim()}
    >
      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Grammar Point
            </label>
            <button
              onClick={fetchAIInfo}
              disabled={isLoadingAI || !formData.content.trim()}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!hasApiKeys ? 'No Gemini API key found' : ''}
            >
              <Wand2 className="w-3 h-3" />
              {isLoadingAI ? 'Loading...' : 'AI'}
            </button>
          </div>
          <CustomInput
            type="text"
            value={formData.content}
            onChange={handleContentChange}
            placeholder="e.g. Present Perfect Continuous, Passive Voice"
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
