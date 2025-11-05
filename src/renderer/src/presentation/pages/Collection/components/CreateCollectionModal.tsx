import { useState, useEffect, useCallback, useMemo } from 'react'
import CustomModal from '../../../../components/common/CustomModal'
import CustomInput from '../../../../components/common/CustomInput'
import { vocabulary_items } from '../types/vocabulary'
import { grammar_items } from '../types/grammar'
import { useGeminiApiKeys } from '../../../../hooks/useGeminiApiKeys'
import {
  createCreateCollectionService,
  AIWordResult,
  AIPhraseResult,
  AIGrammarResult
} from '../services/CreateCollectionService'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess?: (items: vocabulary_items[] | grammar_items[]) => void
  defaultType?: 'word' | 'phrase' | 'grammar'
}

const CreateCollectionModal = ({
  isOpen,
  onClose,
  onCreateSuccess,
  defaultType = 'word'
}: CreateCollectionModalProps) => {
  const { apiKeys } = useGeminiApiKeys()
  const [inputValue, setInputValue] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  const hasApiKeys = useMemo(() => apiKeys.length > 0, [apiKeys])

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setAiError('')
    }
  }, [isOpen])

  const getModalTitle = () => {
    switch (defaultType) {
      case 'word':
        return 'Add new word'
      case 'phrase':
        return 'Add new phrase'
      case 'grammar':
        return 'Add new grammar point'
      default:
        return 'Add new item'
    }
  }

  const getPlaceholder = () => {
    switch (defaultType) {
      case 'word':
        return 'vd: persevere, resilience'
      case 'phrase':
        return 'vd: break the ice, take off'
      case 'grammar':
        return 'vd: Present Perfect, Conditional Type 2'
      default:
        return 'Enter text...'
    }
  }

  const handleCreate = useCallback(async () => {
    if (!inputValue.trim()) {
      setAiError('Vui lòng nhập nội dung')
      return
    }

    if (!hasApiKeys) {
      setAiError('Không tìm thấy Gemini API key. Vui lòng thêm trong Settings')
      return
    }

    setIsLoadingAI(true)
    setAiError('')

    try {
      // ✅ Kiểm tra trạng thái kết nối database
      if (!window.api) {
        throw new Error('Electron API không khả dụng')
      }

      const status = await window.api.cloudDatabase.status()
      if (!status.isConnected) {
        throw new Error('Database chưa được kết nối. Vui lòng kết nối trong Settings.')
      }

      const { getCloudDatabase } = await import('../../../../services/CloudDatabaseService')
      const db = getCloudDatabase()

      if (!db) {
        throw new Error('Không thể lấy database instance. Vui lòng thử kết nối lại trong Settings.')
      }

      // ✅ Gọi AI service
      const selectedApiKey = apiKeys[0]
      const service = createCreateCollectionService(selectedApiKey.key)

      if (defaultType === 'word') {
        const aiData: AIWordResult = await service.fetchWord(inputValue.trim())

        // ✅ 1. Tạo vocabulary_items (core)
        const vocabularyId = `vocab_${Date.now()}`
        const newItem: vocabulary_items = {
          id: vocabularyId,
          item_type: 'word',
          content: aiData.word,
          pronunciation: aiData.pronunciation || undefined,
          difficulty_level: aiData.difficulty_level ? (aiData.difficulty_level as any) : undefined,
          frequency_rank: aiData.frequency_rank ? (aiData.frequency_rank as any) : undefined,
          category: aiData.category || undefined,
          tags: aiData.tags || undefined,
          metadata: aiData.metadata || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await db.saveVocabularyItem(newItem)

        if (aiData.definitions && aiData.definitions.length > 0) {
          for (const def of aiData.definitions) {
            const definitionId = `def_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            await db.saveVocabularyDefinition({
              id: definitionId,
              vocabulary_item_id: vocabularyId,
              meaning: def.meaning,
              translation: def.translation || undefined,
              usage_context: def.usage_context || undefined,
              word_type: def.word_type || undefined,
              phrase_type: undefined,
              created_at: new Date().toISOString()
            })

            // ✅ Lưu examples cho definition này
            if (def.examples && def.examples.length > 0) {
              for (const example of def.examples) {
                await db.saveVocabularyExample({
                  id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  definition_id: definitionId,
                  sentence: example.sentence,
                  translation: example.translation || undefined,
                  created_at: new Date().toISOString()
                })
              }
            }
          }
        }

        // ✅ 3. Tạo vocabulary_relationships
        if (aiData.relationships && aiData.relationships.length > 0) {
          for (const rel of aiData.relationships) {
            if (rel.items && rel.items.length > 0) {
              for (const item of rel.items) {
                await db.saveVocabularyRelationship({
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  vocabulary_item_id: vocabularyId,
                  relationship_type: rel.relationship_type,
                  vocabulary_item_type: 'word',
                  content: item,
                  content_translation: undefined,
                  metadata: undefined,
                  created_at: new Date().toISOString()
                })
              }
            }
          }
        }

        onCreateSuccess?.([newItem])
      } else if (defaultType === 'phrase') {
        const aiData: AIPhraseResult = await service.fetchPhrase(inputValue.trim())

        // ✅ 1. Tạo vocabulary_items (core)
        const vocabularyId = `vocab_${Date.now()}`
        const newItem: vocabulary_items = {
          id: vocabularyId,
          item_type: 'phrase',
          content: aiData.phrase,
          pronunciation: aiData.pronunciation || undefined,
          difficulty_level: aiData.difficulty_level ? (aiData.difficulty_level as any) : undefined,
          frequency_rank: aiData.frequency_rank ? (aiData.frequency_rank as any) : undefined,
          category: aiData.category || undefined,
          tags: aiData.tags || undefined,
          metadata: aiData.metadata || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await db.saveVocabularyItem(newItem)

        if (aiData.definitions && aiData.definitions.length > 0) {
          for (const def of aiData.definitions) {
            const definitionId = `def_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            await db.saveVocabularyDefinition({
              id: definitionId,
              vocabulary_item_id: vocabularyId,
              meaning: def.meaning,
              translation: def.translation || undefined,
              usage_context: def.usage_context || undefined,
              word_type: undefined,
              phrase_type: def.phrase_type || undefined,
              created_at: new Date().toISOString()
            })

            // ✅ Lưu examples cho definition này
            if (def.examples && def.examples.length > 0) {
              for (const example of def.examples) {
                await db.saveVocabularyExample({
                  id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  definition_id: definitionId,
                  sentence: example.sentence,
                  translation: example.translation || undefined,
                  created_at: new Date().toISOString()
                })
              }
            }
          }
        }

        // ✅ 3. Tạo vocabulary_relationships
        if (aiData.relationships && aiData.relationships.length > 0) {
          for (const rel of aiData.relationships) {
            if (rel.items && rel.items.length > 0) {
              for (const item of rel.items) {
                await db.saveVocabularyRelationship({
                  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  vocabulary_item_id: vocabularyId,
                  relationship_type: rel.relationship_type,
                  vocabulary_item_type: 'phrase',
                  content: item,
                  content_translation: undefined,
                  metadata: undefined,
                  created_at: new Date().toISOString()
                })
              }
            }
          }
        }

        onCreateSuccess?.([newItem])
      } else if (defaultType === 'grammar') {
        const aiData: AIGrammarResult = await service.fetchGrammar(inputValue.trim())

        // ✅ 1. Tạo grammar_items (core)
        const grammarId = `grammar_${Date.now()}`
        const newItem: grammar_items = {
          id: grammarId,
          item_type: aiData.item_type || 'tense',
          title: aiData.title,
          difficulty_level: aiData.difficulty_level ? (aiData.difficulty_level as any) : undefined,
          frequency_rank: aiData.frequency_rank ? (aiData.frequency_rank as any) : undefined,
          category: aiData.category || undefined,
          tags: aiData.tags || undefined,
          metadata: aiData.metadata || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await db.saveGrammarItem(newItem)

        // ✅ 2. Tạo grammar_rules + grammar_examples
        if (aiData.rules && aiData.rules.length > 0) {
          for (const rule of aiData.rules) {
            const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            await db.saveGrammarRule({
              id: ruleId,
              grammar_item_id: grammarId,
              rule_description: rule.rule_description,
              translation: rule.translation || undefined,
              formula: rule.formula || undefined,
              usage_context: rule.usage_context || undefined,
              notes: rule.notes || undefined,
              created_at: new Date().toISOString()
            })

            // ✅ Lưu examples cho rule này
            if (rule.examples && rule.examples.length > 0) {
              for (const example of rule.examples) {
                await db.saveGrammarExample({
                  id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  grammar_rule_id: ruleId,
                  sentence: example.sentence,
                  translation: example.translation || undefined,
                  is_correct: example.is_correct,
                  explanation: example.explanation || undefined,
                  created_at: new Date().toISOString()
                })
              }
            }
          }
        }

        // ✅ 3. Tạo grammar_common_mistakes
        if (aiData.common_mistakes && aiData.common_mistakes.length > 0) {
          for (const mistake of aiData.common_mistakes) {
            await db.saveGrammarCommonMistake({
              id: `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              grammar_item_id: grammarId,
              incorrect_example: mistake.incorrect_example,
              correct_example: mistake.correct_example,
              explanation: mistake.explanation,
              translation: mistake.translation || undefined,
              created_at: new Date().toISOString()
            })
          }
        }

        onCreateSuccess?.([newItem])
      }

      // ✅ Reset và đóng modal
      setInputValue('')
      setAiError('')
      onClose()
    } catch (error) {
      console.error('[CreateCollectionModal] Error:', error)
      setAiError(error instanceof Error ? error.message : 'Lỗi khi tạo. Vui lòng thử lại.')
    } finally {
      setIsLoadingAI(false)
    }
  }, [inputValue, hasApiKeys, apiKeys, defaultType, onCreateSuccess, onClose])

  const handleCancel = () => {
    setInputValue('')
    setAiError('')
    onClose()
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={getModalTitle()}
      size="sm"
      actionText="Create with AI"
      cancelText="Cancel"
      onAction={handleCreate}
      actionLoading={isLoadingAI}
      actionDisabled={isLoadingAI || !inputValue.trim()}
    >
      <div className="p-6 space-y-4">
        {/* Input Field */}
        <CustomInput
          type="text"
          label={
            defaultType === 'grammar'
              ? 'Grammar Point'
              : defaultType === 'phrase'
                ? 'Phrase'
                : 'Word'
          }
          value={inputValue}
          onChange={(val) => {
            setInputValue(val)
            setAiError('')
          }}
          placeholder={getPlaceholder()}
          variant="default"
          size="sm"
          autoFocus={true}
        />

        {/* Error Display */}
        {aiError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            {aiError}
          </div>
        )}

        {/* No API Key Warning */}
        {!hasApiKeys && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ Gemini API key not found. Add key in Settings to use AI features.
          </div>
        )}

        {/* Loading State */}
        {isLoadingAI && (
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <div className="animate-spin w-4 h-4 border-2 border-border-default border-t-primary rounded-full" />
            <span>AI đang tạo thông tin chi tiết...</span>
          </div>
        )}
      </div>
    </CustomModal>
  )
}

export default CreateCollectionModal
