import { vocabulary_item } from '../presentation/pages/Collection/types/vocabulary'
import { grammar_item } from '../presentation/pages/Collection/types/grammar'

export class CloudDatabaseService {
  private connectionString: string

  constructor(connectionString: string) {
    this.connectionString = connectionString
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!window.api) throw new Error('Electron API not available')
      const result = await window.api.cloudDatabase.testConnection(this.connectionString)
      return result.success
    } catch (error) {
      console.error('[CloudDatabaseService] Connection test failed:', error)
      return false
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (!window.api) throw new Error('Electron API not available')
      const result = await window.api.cloudDatabase.connect(this.connectionString)

      return result.success
    } catch (error) {
      console.error('[CloudDatabaseService] Connect failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (!window.api) throw new Error('Electron API not available')
      await window.api.cloudDatabase.disconnect()
    } catch (error) {
      console.error('[CloudDatabaseService] Disconnect failed:', error)
    }
  }

  async initializeSchema(): Promise<void> {
    try {
      if (!window.api) throw new Error('Electron API not available')
      const result = await window.api.cloudDatabase.initializeSchema()
      if (!result.success) {
        throw new Error(result.error || 'Failed to initialize schema')
      }
    } catch (error) {
      console.error('[CloudDatabaseService] Schema initialization failed:', error)
      throw error
    }
  }

  async saveVocabularyItem(item: vocabulary_item): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    // 1. Insert vocabulary_item
    const vocabQuery = `
    INSERT INTO vocabulary_item (
      id, item_type, content, pronunciation,
      difficulty_level, frequency_rank, category, tags, metadata,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `

    const vocabParams = [
      item.id,
      item.item_type,
      item.content,
      item.pronunciation || null,
      item.difficulty_level || null,
      item.frequency_rank || null,
      item.category || null,
      JSON.stringify(item.tags || []),
      JSON.stringify(item.metadata || {}),
      item.created_at
    ]

    const vocabResult = await window.api.cloudDatabase.query(vocabQuery, vocabParams)
    if (!vocabResult.success) {
      throw new Error(vocabResult.error || 'Failed to save vocabulary item')
    }

    // 2. Insert definitions and examples from metadata
    const definitions = item.metadata?.definitions
    if (definitions && Array.isArray(definitions)) {
      for (const def of definitions) {
        const defId = `def_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const defQuery = `
        INSERT INTO definition (
          id, vocabulary_item_id, meaning, translation, word_type, phrase_type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `

        const defParams = [
          defId,
          item.id,
          def.meaning || '',
          def.translation || null,
          def.wordType || null,
          def.phraseType || null,
          new Date().toISOString()
        ]

        const defResult = await window.api.cloudDatabase.query(defQuery, defParams)
        if (!defResult.success) {
          console.warn('[saveVocabularyItem] Failed to save definition:', defResult.error)
          continue
        }

        // 3. Insert examples for this definition
        const examples = def.examples
        if (examples && Array.isArray(examples)) {
          for (const example of examples) {
            const exampleId = `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            const exampleQuery = `
            INSERT INTO example (
              id, definition_id, sentence, translation, created_at
            ) VALUES ($1, $2, $3, $4, $5)
          `

            const exampleParams = [
              exampleId,
              defId,
              example.sentence || '',
              example.translation || null,
              new Date().toISOString()
            ]

            const exampleResult = await window.api.cloudDatabase.query(exampleQuery, exampleParams)
            if (!exampleResult.success) {
              console.warn('[saveVocabularyItem] Failed to save example:', exampleResult.error)
            }
          }
        }
      }
    }
  }

  async saveGrammarItem(item: grammar_item): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    // 1. Insert grammar_item
    const grammarQuery = `
    INSERT INTO grammar_item (
      id, item_type, title,
      difficulty_level, frequency_rank, category, tags, metadata,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `

    const grammarParams = [
      item.id,
      item.item_type,
      item.title,
      item.difficulty_level || null,
      item.frequency_rank || null,
      item.category || null,
      JSON.stringify(item.tags || []),
      JSON.stringify(item.metadata || {}),
      item.created_at
    ]

    const grammarResult = await window.api.cloudDatabase.query(grammarQuery, grammarParams)
    if (!grammarResult.success) {
      throw new Error(grammarResult.error || 'Failed to save grammar item')
    }

    // 2. Insert definitions (grammar rules) from metadata
    const definitions = item.metadata?.definitions
    if (definitions && Array.isArray(definitions)) {
      for (const def of definitions) {
        const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const ruleQuery = `
        INSERT INTO grammar_rule (
          id, grammar_item_id, rule_description, translation, formula, usage_context, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `

        const ruleParams = [
          ruleId,
          item.id,
          def.description || '',
          def.translation || null,
          def.structure || null,
          def.explanation || null,
          null,
          new Date().toISOString()
        ]

        const ruleResult = await window.api.cloudDatabase.query(ruleQuery, ruleParams)
        if (!ruleResult.success) {
          console.warn('[saveGrammarItem] Failed to save grammar rule:', ruleResult.error)
        }
      }
    }

    // 3. Insert examples from metadata
    const examples = item.metadata?.examples
    if (examples && Array.isArray(examples)) {
      // Note: grammar_example cần grammar_rule_id, nhưng ở đây chúng ta insert examples độc lập
      // Bạn có thể cần điều chỉnh logic này tùy vào cấu trúc dữ liệu thực tế
      const firstRuleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      for (const example of examples) {
        const exampleId = `gex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const exampleQuery = `
        INSERT INTO grammar_example (
          id, grammar_rule_id, sentence, translation, is_correct, explanation, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `

        const exampleParams = [
          exampleId,
          firstRuleId,
          example.sentence || '',
          example.translation || null,
          true,
          example.usage_note || null,
          new Date().toISOString()
        ]

        const exampleResult = await window.api.cloudDatabase.query(exampleQuery, exampleParams)
        if (!exampleResult.success) {
          console.warn('[saveGrammarItem] Failed to save grammar example:', exampleResult.error)
        }
      }
    }

    // 4. Insert common mistakes from metadata
    const commonMistakes = item.metadata?.commonMistakes
    if (commonMistakes && Array.isArray(commonMistakes)) {
      for (const mistake of commonMistakes) {
        const mistakeId = `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const mistakeQuery = `
        INSERT INTO grammar_common_mistake (
          id, grammar_item_id, incorrect_example, correct_example, explanation, translation, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `

        const mistakeParams = [
          mistakeId,
          item.id,
          mistake.incorrect || '',
          mistake.correct || '',
          mistake.explanation || '',
          null,
          new Date().toISOString()
        ]

        const mistakeResult = await window.api.cloudDatabase.query(mistakeQuery, mistakeParams)
        if (!mistakeResult.success) {
          console.warn('[saveGrammarItem] Failed to save common mistake:', mistakeResult.error)
        }
      }
    }
  }

  async getAllItems(
    filterType?: 'all' | 'word' | 'phrase' | 'grammar'
  ): Promise<(vocabulary_item | grammar_item)[]> {
    if (!window.api) throw new Error('Electron API not available')

    let vocabularyItems: vocabulary_item[] = []
    let grammarItems: grammar_item[] = []

    if (!filterType || filterType === 'all' || filterType === 'word' || filterType === 'phrase') {
      let vocabQuery = 'SELECT * FROM vocabulary_item'
      const vocabParams: any[] = []

      if (filterType && filterType !== 'all') {
        vocabQuery += ' WHERE item_type = $1'
        vocabParams.push(filterType)
      }

      vocabQuery += ' ORDER BY created_at DESC'

      const vocabResult = await window.api.cloudDatabase.query(vocabQuery, vocabParams)
      if (vocabResult.success) {
        vocabularyItems = vocabResult.rows.map((row) => ({
          ...row,
          tags: Array.isArray(row.tags) ? row.tags : [],
          metadata: typeof row.metadata === 'object' ? row.metadata : {}
        }))
      }
    }

    if (!filterType || filterType === 'all' || filterType === 'grammar') {
      const grammarQuery = 'SELECT * FROM grammar_item ORDER BY created_at DESC'
      const grammarResult = await window.api.cloudDatabase.query(grammarQuery)
      if (grammarResult.success) {
        grammarItems = grammarResult.rows.map((row) => ({
          ...row,
          tags: Array.isArray(row.tags) ? row.tags : [],
          metadata: typeof row.metadata === 'object' ? row.metadata : {}
        }))
      }
    }

    const allItems = [...vocabularyItems, ...grammarItems].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return allItems
  }

  async deleteItem(id: string): Promise<number> {
    if (!window.api) throw new Error('Electron API not available')

    let changes = 0

    const vocabResult = await window.api.cloudDatabase.query(
      'DELETE FROM vocabulary_item WHERE id = $1',
      [id]
    )
    if (vocabResult.success) {
      changes = vocabResult.rowCount
    }

    if (changes === 0) {
      const grammarResult = await window.api.cloudDatabase.query(
        'DELETE FROM grammar_item WHERE id = $1',
        [id]
      )
      if (grammarResult.success) {
        changes = grammarResult.rowCount
      }
    }

    return changes
  }

  async updateVocabularyItem(item: vocabulary_item): Promise<number> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      UPDATE vocabulary_item SET
        content = $1,
        pronunciation = $2,
        difficulty_level = $3,
        frequency_rank = $4,
        category = $5,
        tags = $6,
        metadata = $7
      WHERE id = $8
    `

    const params = [
      item.content,
      item.pronunciation || null,
      item.difficulty_level || null,
      item.frequency_rank || null,
      item.category || null,
      JSON.stringify(item.tags || []),
      JSON.stringify(item.metadata || {}),
      item.id
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update vocabulary item')
    }
    return result.rowCount
  }

  async updateGrammarItem(item: grammar_item): Promise<number> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      UPDATE grammar_item SET
        title = $1,
        difficulty_level = $2,
        frequency_rank = $3,
        category = $4,
        tags = $5,
        metadata = $6
      WHERE id = $7
    `

    const params = [
      item.title,
      item.difficulty_level || null,
      item.frequency_rank || null,
      item.category || null,
      JSON.stringify(item.tags || []),
      JSON.stringify(item.metadata || {}),
      item.id
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update grammar item')
    }
    return result.rowCount
  }
}

// Singleton instance
let cloudDatabaseInstance: CloudDatabaseService | null = null

export const getCloudDatabase = (): CloudDatabaseService | null => {
  return cloudDatabaseInstance
}

export const setCloudDatabase = (connectionString: string): CloudDatabaseService => {
  cloudDatabaseInstance = new CloudDatabaseService(connectionString)
  return cloudDatabaseInstance
}
