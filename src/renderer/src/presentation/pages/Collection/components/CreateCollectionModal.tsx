import { useState, useCallback, useMemo } from 'react'
import { Wand2, Copy } from 'lucide-react'
import CustomModal from '../../../../components/common/CustomModal'
import CustomInput from '../../../../components/common/CustomInput'
import CustomCombobox from '../../../../components/common/CustomCombobox'
import CustomBadge from '../../../../components/common/CustomBadge'
import { vocabulary_item } from '../types'
import { useGeminiApiKeys } from '../../../../hooks/useGeminiApiKeys'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_item[]) => void
}

interface CollectionFormData {
  itemType: 'word' | 'phrase'
  content: string
  pronunciation?: string
  ipaNotation?: string
  wordType?: string
  phraseType?: string
  multipleMode: boolean
  multipleItems: string[]
}

const WORD_TYPES = [
  { value: 'noun', label: 'Danh từ' },
  { value: 'verb', label: 'Động từ' },
  { value: 'adjective', label: 'Tính từ' },
  { value: 'adverb', label: 'Trạng từ' },
  { value: 'pronoun', label: 'Đại từ' },
  { value: 'preposition', label: 'Giới từ' },
  { value: 'conjunction', label: 'Liên từ' },
  { value: 'interjection', label: 'Thán từ' },
  { value: 'determiner', label: 'Hạn định từ' },
  { value: 'exclamation', label: 'Cảm thán từ' }
]

const PHRASE_TYPES = [
  { value: 'idiom', label: 'Thành ngữ' },
  { value: 'phrasal_verb', label: 'Phrasal Verb' },
  { value: 'collocation', label: 'Collocation' },
  { value: 'slang', label: 'Slang' },
  { value: 'expression', label: 'Biểu thức' }
]

const CreateCollectionModal = ({
  isOpen,
  onClose,
  onCreateSuccess
}: CreateCollectionModalProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [formData, setFormData] = useState<CollectionFormData>({
    itemType: 'word',
    content: '',
    pronunciation: '',
    ipaNotation: '',
    wordType: '',
    phraseType: '',
    multipleMode: false,
    multipleItems: []
  })
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  const hasApiKeys = useMemo(() => apiKeys.length > 0, [apiKeys])

  const handleItemTypeChange = (type: 'word' | 'phrase') => {
    setFormData((prev) => ({
      ...prev,
      itemType: type,
      wordType: '',
      phraseType: ''
    }))
  }

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value
    }))
    setAiError('')
  }

  const handlePronunciationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      pronunciation: value
    }))
  }

  const handleIpaChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      ipaNotation: value
    }))
  }

  const handleWordTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      wordType: typeof value === 'string' ? value : value[0] || ''
    }))
  }

  const handlePhraseTypeChange = (value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      phraseType: typeof value === 'string' ? value : value[0] || ''
    }))
  }

  const handleMultipleItemsChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      multipleItems: value
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }))
  }

  const fetchAIInfo = useCallback(async () => {
    if (!formData.content.trim()) {
      setAiError('Vui lòng nhập content trước tiên')
      return
    }

    if (!hasApiKeys) {
      setAiError('Chưa có Gemini API key. Vui lòng thêm API key trong Settings')
      return
    }

    setIsLoadingAI(true)
    setAiError('')

    try {
      const selectedApiKey = apiKeys[0]

      const prompt =
        formData.itemType === 'word'
          ? `Tìm thông tin về từ "${formData.content}". 
             Trả về JSON với cấu trúc: {
               "pronunciation": "cách đọc (dạng tổng quát)",
               "ipaNotation": "IPA notation",
               "wordType": "loại từ (noun/verb/adjective/...)",
               "definition": "định nghĩa tiếng Anh"
             }
             Chỉ trả về JSON, không có text khác.`
          : `Tìm thông tin về cụm từ "${formData.content}". 
             Trả về JSON với cấu trúc: {
               "pronunciation": "cách đọc",
               "phraseType": "loại (idiom/phrasal_verb/...)",
               "definition": "định nghĩa tiếng Anh",
               "meaning": "nghĩa tiếng Việt"
             }
             Chỉ trả về JSON, không có text khác.`

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
        throw new Error('Không nhận được phản hồi từ API')
      }

      // Parse JSON từ response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Không thể phân tích phản hồi từ API')
      }

      const aiData = JSON.parse(jsonMatch[0])

      setFormData((prev) => ({
        ...prev,
        pronunciation: aiData.pronunciation || prev.pronunciation,
        ipaNotation: aiData.ipaNotation || prev.ipaNotation,
        wordType: aiData.wordType || prev.wordType,
        phraseType: aiData.phraseType || prev.phraseType
      }))
    } catch (error) {
      console.error('[CreateCollectionModal] AI Error:', error)
      setAiError(
        error instanceof Error ? `Lỗi AI: ${error.message}` : 'Lỗi khi gọi AI. Vui lòng thử lại'
      )
    } finally {
      setIsLoadingAI(false)
    }
  }, [formData.content, formData.itemType, hasApiKeys, apiKeys])

  const fetchMultipleItemsAI = useCallback(async () => {
    if (formData.multipleItems.length === 0) {
      setAiError('Vui lòng nhập ít nhất 1 item')
      return
    }

    if (!hasApiKeys) {
      setAiError('Chưa có Gemini API key. Vui lòng thêm API key trong Settings')
      return
    }

    setIsLoadingAI(true)
    setAiError('')

    try {
      const selectedApiKey = apiKeys[0]
      const itemsList = formData.multipleItems.join(', ')

      const prompt =
        formData.itemType === 'word'
          ? `Tìm thông tin cho các từ: "${itemsList}". 
             Trả về JSON array với cấu trúc mỗi item: {
               "content": "từ gốc",
               "pronunciation": "cách đọc",
               "ipaNotation": "IPA notation",
               "wordType": "loại từ"
             }
             Chỉ trả về JSON array, không có text khác.`
          : `Tìm thông tin cho các cụm từ: "${itemsList}". 
             Trả về JSON array với cấu trúc mỗi item: {
               "content": "cụm từ gốc",
               "pronunciation": "cách đọc",
               "phraseType": "loại"
             }
             Chỉ trả về JSON array, không có text khác.`

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
        throw new Error('Không nhận được phản hồi từ API')
      }

      // Parse JSON array từ response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Không thể phân tích phản hồi từ API')
      }

      const aiDataArray = JSON.parse(jsonMatch[0])

      if (Array.isArray(aiDataArray) && aiDataArray.length > 0) {
        // Giả sử sau khi lấy được dữ liệu, sẽ lưu vào database
        // Component cha sẽ xử lý phần này
        console.log('Dữ liệu từ AI:', aiDataArray)
        setAiError('')
        // Reset form sau khi thành công
        setFormData((prev) => ({
          ...prev,
          multipleItems: [],
          content: ''
        }))
      }
    } catch (error) {
      console.error('[CreateCollectionModal] Multiple Items AI Error:', error)
      setAiError(
        error instanceof Error ? `Lỗi AI: ${error.message}` : 'Lỗi khi gọi AI. Vui lòng thử lại'
      )
    } finally {
      setIsLoadingAI(false)
    }
  }, [formData.multipleItems, formData.itemType, hasApiKeys, apiKeys])

  const handleCreate = () => {
    if (!formData.content.trim()) {
      setAiError('Vui lòng nhập content')
      return
    }

    const newItem: vocabulary_item = {
      id: `vocab_${Date.now()}`,
      item_type: formData.itemType,
      content: formData.content.trim(),
      pronunciation: formData.pronunciation || undefined,
      ipa_notation: formData.ipaNotation || undefined,
      word_type: formData.itemType === 'word' ? (formData.wordType as any) : undefined,
      phrase_type: formData.itemType === 'phrase' ? (formData.phraseType as any) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onCreateSuccess?.([newItem])
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setFormData({
      itemType: 'word',
      content: '',
      pronunciation: '',
      ipaNotation: '',
      wordType: '',
      phraseType: '',
      multipleMode: false,
      multipleItems: []
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
      title="Thêm collection mới"
      size="lg"
      actionText="Tạo"
      cancelText="Hủy"
      onAction={formData.multipleMode ? fetchMultipleItemsAI : handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={
        isLoadingAI ||
        (formData.multipleMode ? formData.multipleItems.length === 0 : !formData.content.trim())
      }
    >
      <div className="p-6 space-y-4">
        {/* Type Selection */}
        <div className="flex gap-3">
          <button
            onClick={() => handleItemTypeChange('word')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              formData.itemType === 'word'
                ? 'bg-primary text-white'
                : 'bg-card-background border border-border-default text-text-secondary hover:border-primary'
            }`}
          >
            📝 Từ (Word)
          </button>
          <button
            onClick={() => handleItemTypeChange('phrase')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              formData.itemType === 'phrase'
                ? 'bg-primary text-white'
                : 'bg-card-background border border-border-default text-text-secondary hover:border-primary'
            }`}
          >
            💬 Cụm từ (Phrase)
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-card-background p-3 rounded-lg">
          <button
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                multipleMode: false,
                multipleItems: [],
                content: ''
              }))
            }
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
              !formData.multipleMode
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Thêm từng cái
          </button>
          <button
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                multipleMode: true,
                content: ''
              }))
            }
            disabled={!hasApiKeys}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
              formData.multipleMode
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title={!hasApiKeys ? 'Cần Gemini API key để dùng chế độ này' : ''}
          >
            Thêm danh sách
          </button>
        </div>

        {/* Single Item Mode */}
        {!formData.multipleMode && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.itemType === 'word' ? 'Từ' : 'Cụm từ'}
                </label>
                <button
                  onClick={fetchAIInfo}
                  disabled={isLoadingAI || !formData.content.trim()}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!hasApiKeys ? 'Cần Gemini API key để dùng AI' : ''}
                >
                  <Wand2 className="w-4 h-4" />
                  {isLoadingAI ? 'Đang lấy...' : 'AI'}
                </button>
              </div>
              <CustomInput
                type="text"
                value={formData.content}
                onChange={handleContentChange}
                placeholder={
                  formData.itemType === 'word'
                    ? 'Ví dụ: run, persevere'
                    : 'Ví dụ: break the ice, shut up'
                }
                variant="default"
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                type="text"
                label="Cách đọc"
                value={formData.pronunciation}
                onChange={handlePronunciationChange}
                placeholder="Ví dụ: run, per-suh-veer"
                variant="default"
                size="md"
              />
              <CustomInput
                type="text"
                label="IPA Notation"
                value={formData.ipaNotation}
                onChange={handleIpaChange}
                placeholder="Ví dụ: /rʌn/, /ˌpɜːrsəˈvɪrəns/"
                variant="default"
                size="md"
              />
            </div>

            {formData.itemType === 'word' && (
              <CustomCombobox
                label="Loại từ"
                value={formData.wordType}
                options={WORD_TYPES}
                onChange={handleWordTypeChange}
                placeholder="Chọn loại từ"
                size="md"
              />
            )}

            {formData.itemType === 'phrase' && (
              <CustomCombobox
                label="Loại cụm từ"
                value={formData.phraseType}
                options={PHRASE_TYPES}
                onChange={handlePhraseTypeChange}
                placeholder="Chọn loại cụm từ"
                size="md"
              />
            )}
          </div>
        )}

        {/* Multiple Items Mode */}
        {formData.multipleMode && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Danh sách {formData.itemType === 'word' ? 'từ' : 'cụm từ'} (mỗi dòng một item)
              </label>
              <textarea
                value={formData.multipleItems.join('\n')}
                onChange={(e) => handleMultipleItemsChange(e.target.value)}
                placeholder={
                  formData.itemType === 'word'
                    ? 'run\npersevere\nresilience'
                    : 'break the ice\nshut up\nkick the bucket'
                }
                className="w-full px-4 py-3 bg-card-background border border-border-default rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                rows={6}
              />
            </div>

            {formData.multipleItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.multipleItems.map((item, index) => (
                  <CustomBadge
                    key={index}
                    variant="primary"
                    size="sm"
                    icon={Copy}
                    className="cursor-default"
                  >
                    {item}
                  </CustomBadge>
                ))}
              </div>
            )}

            <div className="text-sm text-text-secondary">
              Tổng: <span className="font-medium">{formData.multipleItems.length}</span> item
            </div>
          </div>
        )}

        {/* Error Message */}
        {aiError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            {aiError}
          </div>
        )}

        {/* API Key Warning */}
        {!hasApiKeys && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ Chưa có Gemini API key. Vui lòng thêm trong Settings để sử dụng tính năng AI.
          </div>
        )}
      </div>
    </CustomModal>
  )
}

export default CreateCollectionModal
