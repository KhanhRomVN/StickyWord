import { vocabulary_items } from '../presentation/pages/Collection/types/vocabulary'
import { grammar_items } from '../presentation/pages/Collection/types/grammar'

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

  async saveVocabularyItem(item: vocabulary_items): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    // 1. Insert vocabulary_items
    const vocabQuery = `
    INSERT INTO vocabulary_items (
      id, item_type, content, pronunciation,
      difficulty_level, frequency_rank, category, tags, metadata,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      item.created_at,
      item.updated_at || item.created_at
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

        let validPhraseType = null

        const validWordTypes = [
          'noun',
          'verb',
          'adjective',
          'adverb',
          'pronoun',
          'preposition',
          'conjunction',
          'interjection',
          'determiner',
          'exclamation'
        ]
        const validPhraseTypes = ['idiom', 'phrasal_verb', 'collocation', 'slang', 'expression']

        if (def.wordType && validWordTypes.includes(def.wordType)) {
        }
        if (def.phraseType && validPhraseTypes.includes(def.phraseType)) {
          validPhraseType = def.phraseType
        }

        // ✅ Nếu wordType không hợp lệ nhưng là "phrase", chuyển sang phraseType
        if (def.wordType === 'phrase' && !validPhraseType) {
          validPhraseType = 'expression' // default fallback
        }

        const defQuery = `
        INSERT INTO vocabulary_definitions (
          id, vocabulary_item_id, meaning, translation, usage_context, word_type, phrase_type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `

        const defParams = [
          defId,
          item.id,
          def.meaning || '',
          def.translation || null,
          def.usage_context || null,
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
            INSERT INTO vocabulary_examples (
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

  async saveGrammarItem(item: grammar_items): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    // 1. Insert grammar_items
    const grammarQuery = `
    INSERT INTO grammar_items (
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
  ): Promise<(vocabulary_items | grammar_items)[]> {
    if (!window.api) throw new Error('Electron API not available')

    let vocabularyItems: vocabulary_items[] = []
    let grammarItems: grammar_items[] = []

    if (!filterType || filterType === 'all' || filterType === 'word' || filterType === 'phrase') {
      let vocabQuery = 'SELECT * FROM vocabulary_items'
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
      const grammarQuery = 'SELECT * FROM grammar_items ORDER BY created_at DESC'
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
      'DELETE FROM vocabulary_items WHERE id = $1',
      [id]
    )
    if (vocabResult.success) {
      changes = vocabResult.rowCount
    }

    if (changes === 0) {
      const grammarResult = await window.api.cloudDatabase.query(
        'DELETE FROM grammar_items WHERE id = $1',
        [id]
      )
      if (grammarResult.success) {
        changes = grammarResult.rowCount
      }
    }

    return changes
  }

  async updateVocabularyItem(item: vocabulary_items): Promise<number> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      UPDATE vocabulary_items SET
        content = $1,
        pronunciation = $2,
        difficulty_level = $3,
        frequency_rank = $4,
        category = $5,
        tags = $6,
        metadata = $7,
        updated_at = $8
      WHERE id = $9
    `

    const params = [
      item.content,
      item.pronunciation || null,
      item.difficulty_level || null,
      item.frequency_rank || null,
      item.category || null,
      JSON.stringify(item.tags || []),
      JSON.stringify(item.metadata || {}),
      new Date().toISOString(),
      item.id
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update vocabulary item')
    }
    return result.rowCount
  }

  async updateGrammarItem(item: grammar_items): Promise<number> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      UPDATE grammar_items SET
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

  async saveVocabularyDefinition(definition: {
    id: string
    vocabulary_item_id: string
    meaning: string
    translation?: string
    usage_context?: string
    word_type?: string
    phrase_type?: string
    created_at: string
  }): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      INSERT INTO vocabulary_definitions (
        id, vocabulary_item_id, meaning, translation, usage_context, word_type, phrase_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

    const params = [
      definition.id,
      definition.vocabulary_item_id,
      definition.meaning,
      definition.translation || null,
      definition.usage_context || null,
      definition.word_type || null,
      definition.phrase_type || null,
      definition.created_at
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save vocabulary definition')
    }
  }

  async getVocabularyWithDetails(itemId: string): Promise<vocabulary_items | null> {
    if (!window.api) throw new Error('Electron API not available')

    // 1. Get vocabulary item
    const itemQuery = 'SELECT * FROM vocabulary_items WHERE id = $1'
    const itemResult = await window.api.cloudDatabase.query(itemQuery, [itemId])

    if (!itemResult.success || itemResult.rows.length === 0) {
      return null
    }

    const item = itemResult.rows[0]

    // 2. Get definitions
    const defsQuery = `
      SELECT * FROM vocabulary_definitions 
      WHERE vocabulary_item_id = $1 
      ORDER BY created_at ASC
    `
    const defsResult = await window.api.cloudDatabase.query(defsQuery, [itemId])

    const definitions = []
    if (defsResult.success && defsResult.rows.length > 0) {
      for (const def of defsResult.rows) {
        // 3. Get examples for this definition
        const examplesQuery = `
          SELECT * FROM vocabulary_examples 
          WHERE definition_id = $1 
          ORDER BY created_at ASC
        `
        const examplesResult = await window.api.cloudDatabase.query(examplesQuery, [def.id])

        const examples =
          examplesResult.success && examplesResult.rows.length > 0
            ? examplesResult.rows.map((ex) => ({
                sentence: ex.sentence || '',
                translation: ex.translation || ''
              }))
            : [{ sentence: '', translation: '' }]

        definitions.push({
          id: def.id,
          vocabulary_item_id: def.vocabulary_item_id,
          meaning: def.meaning || '',
          translation: def.translation || '',
          usage_context: def.usage_context || '',
          word_type: def.word_type || undefined,
          phrase_type: def.phrase_type || undefined,
          created_at: def.created_at,
          examples
        })
      }
    }

    // 4. Merge vào metadata
    const finalItem: vocabulary_items = {
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
      metadata: {
        ...(typeof item.metadata === 'object' ? item.metadata : {}),
        definitions // ✅ Inject definitions từ DB vào metadata
      }
    }

    return finalItem
  }

  async saveVocabularyExample(example: {
    id: string
    definition_id: string
    sentence: string
    translation?: string
    created_at: string
  }): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      INSERT INTO vocabulary_examples (
        id, definition_id, sentence, translation, created_at
      ) VALUES ($1, $2, $3, $4, $5)
    `

    const params = [
      example.id,
      example.definition_id,
      example.sentence,
      example.translation || null,
      example.created_at
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save vocabulary example')
    }
  }

  async saveVocabularyRelationship(relationship: {
    id: string
    vocabulary_item_id: string
    relationship_type: string
    vocabulary_item_type: 'word' | 'phrase'
    content?: string
    content_translation?: string
    metadata?: Record<string, any>
    created_at: string
  }): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      INSERT INTO vocabulary_relationship (
        id, vocabulary_item_id, relationship_type, vocabulary_item_type, content, content_translation, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

    const params = [
      relationship.id,
      relationship.vocabulary_item_id,
      relationship.relationship_type,
      relationship.vocabulary_item_type,
      relationship.content || null,
      relationship.content_translation || null,
      JSON.stringify(relationship.metadata || {}),
      relationship.created_at
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save vocabulary relationship')
    }
  }

  async saveGrammarRule(rule: {
    id: string
    grammar_item_id: string
    rule_description: string
    translation?: string
    formula?: string
    usage_context?: string
    notes?: string
    created_at: string
  }): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      INSERT INTO grammar_rule (
        id, grammar_item_id, rule_description, translation, formula, usage_context, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

    const params = [
      rule.id,
      rule.grammar_item_id,
      rule.rule_description,
      rule.translation || null,
      rule.formula || null,
      rule.usage_context || null,
      rule.notes || null,
      rule.created_at
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save grammar rule')
    }
  }

  async saveGrammarExample(example: {
    id: string
    grammar_rule_id: string
    sentence: string
    translation?: string
    is_correct: boolean
    explanation?: string
    created_at: string
  }): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      INSERT INTO grammar_example (
        id, grammar_rule_id, sentence, translation, is_correct, explanation, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

    const params = [
      example.id,
      example.grammar_rule_id,
      example.sentence,
      example.translation || null,
      example.is_correct,
      example.explanation || null,
      example.created_at
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save grammar example')
    }
  }

  async saveGrammarCommonMistake(mistake: {
    id: string
    grammar_item_id: string
    incorrect_example: string
    correct_example: string
    explanation: string
    translation?: string
    created_at: string
  }): Promise<void> {
    if (!window.api) throw new Error('Electron API not available')

    const query = `
      INSERT INTO grammar_common_mistake (
        id, grammar_item_id, incorrect_example, correct_example, explanation, translation, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

    const params = [
      mistake.id,
      mistake.grammar_item_id,
      mistake.incorrect_example,
      mistake.correct_example,
      mistake.explanation,
      mistake.translation || null,
      mistake.created_at
    ]

    const result = await window.api.cloudDatabase.query(query, params)
    if (!result.success) {
      throw new Error(result.error || 'Failed to save grammar common mistake')
    }
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
