import { useState, useCallback, useMemo } from 'react'
import { Wand2 } from 'lucide-react'
import CustomModal from '../../../../../../components/common/CustomModal'
import CustomInput from '../../../../../../components/common/CustomInput'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import { vocabulary_item } from '../../../types'
import { useGeminiApiKeys } from '../../../../../../hooks/useGeminiApiKeys'

interface CreateWordContentProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[]) => void
}

interface WordFormData {
  content: string
  pronunciation?: string
  ipaNotation?: string
  wordType?: string
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

const CreateWordContent = ({ isOpen, onClose, onCreateSuccess }: CreateWordContentProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<WordFormData>({
    content: '',
    pronunciation: '',
    ipaNotation: '',
    wordType: ''
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

  const handleIpaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ipaNotation: value }))
  }

  const handleWordTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      wordType: typeof value === 'string' ? value : value[0] || ''
    }))
  }

  const fetchAIInfo = useCallback(async () => {
    if (!formData.content.trim()) {
      setAiError('Please enter a word')
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
      const prompt = `Find information about the word "${formData.content}". 
                     Return JSON: {
                       "pronunciation": "pronunciation",
                       "ipaNotation": "IPA notation",
                       "wordType": "word type (noun/verb/adjective/...)",
                       "definition": "English definition"
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
        pronunciation: aiData.pronunciation || prev.pronunciation,
        ipaNotation: aiData.ipaNotation || prev.ipaNotation,
        wordType: aiData.wordType || prev.wordType
      }))
    } catch (error) {
      console.error('[CreateWordContent] AI Error:', error)
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
      setAiError('Please enter a word')
      return
    }

    const newItem: vocabulary_item = {
      id: `vocab_${Date.now()}`,
      item_type: 'word',
      content: formData.content.trim(),
      pronunciation: formData.pronunciation || undefined,
      ipa_notation: formData.ipaNotation || undefined,
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
      ipaNotation: '',
      wordType: ''
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
      title="Add New Word"
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Word</label>
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
            placeholder="e.g. persevere, resilience"
            variant="default"
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CustomInput
            type="text"
            label="Pronunciation"
            value={formData.pronunciation}
            onChange={handlePronunciationChange}
            placeholder="e.g. per-suh-veer"
            variant="default"
            size="sm"
          />
          <CustomInput
            type="text"
            label="IPA Notation"
            value={formData.ipaNotation}
            onChange={handleIpaChange}
            placeholder="e.g. /ˌpɜːrsəˈvɪrəns/"
            variant="default"
            size="sm"
          />
        </div>

        <CustomCombobox
          label="Word Type"
          value={formData.wordType}
          options={WORD_TYPES}
          onChange={handleWordTypeChange}
          placeholder="Select word type"
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

export default CreateWordContent
