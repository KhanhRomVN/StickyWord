// ============================================
// GEMINI API CONFIGURATION
// ============================================

export interface GeminiConfig {
  apiKey: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
}

// ============================================
// AI RESPONSE INTERFACES (Phù hợp cấu trúc DB mới)
// ============================================

export interface AIVocabularyDefinition {
  meaning: string
  translation: string
  usage_context?: string
  word_type?:
    | 'noun'
    | 'verb'
    | 'adjective'
    | 'adverb'
    | 'pronoun'
    | 'preposition'
    | 'conjunction'
    | 'interjection'
    | 'determiner'
    | 'exclamation'
  phrase_type?: 'idiom' | 'phrasal_verb' | 'collocation' | 'slang' | 'expression'
  examples: Array<{
    sentence: string
    translation: string
  }>
}

export interface AIVocabularyRelationship {
  relationship_type: 'synonyms' | 'antonyms' | 'word_family' | 'collocations' | 'common_phrases'
  items: string[] // Array of related words/phrases
}

export interface AIWordResult {
  word: string
  pronunciation: string // IPA notation
  difficulty_level?: number
  frequency_rank?: number
  category?: string
  tags?: string[]
  metadata?: Record<string, any> // Flat object only
  definitions: AIVocabularyDefinition[]
  relationships?: AIVocabularyRelationship[]
}

export interface AIPhraseResult {
  phrase: string
  pronunciation: string // IPA notation
  difficulty_level?: number
  frequency_rank?: number
  category?: string
  tags?: string[]
  metadata?: Record<string, any> // Flat object only
  definitions: AIVocabularyDefinition[]
  relationships?: AIVocabularyRelationship[]
}

export interface AIGrammarRule {
  rule_description: string
  translation: string
  formula?: string
  usage_context?: string
  notes?: string
  examples: Array<{
    sentence: string
    translation: string
    is_correct: boolean
    explanation?: string
  }>
}

export interface AIGrammarMistake {
  incorrect_example: string
  correct_example: string
  explanation: string
  translation?: string
}

export interface AIGrammarResult {
  title: string
  item_type: 'tense' | 'structure' | 'rule' | 'pattern'
  difficulty_level?: number
  frequency_rank?: number
  category?: string
  tags?: string[]
  metadata?: Record<string, any> // Flat object only
  rules: AIGrammarRule[]
  common_mistakes?: AIGrammarMistake[]
}

// ============================================
// GEMINI SERVICE CLASS
// ============================================

export class CreateCollectionService {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'
  private defaultModel = 'gemini-2.0-flash-exp'

  private config: GeminiConfig = {
    apiKey: '',
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 8192
  }

  constructor(apiKey: string, customConfig?: Partial<GeminiConfig>) {
    this.config.apiKey = apiKey
    if (customConfig) {
      this.config = { ...this.config, ...customConfig }
    }
  }

  /**
   * Make API request to Gemini
   */
  private async makeRequest(prompt: string, model?: string): Promise<string> {
    const modelName = model || this.config.model || this.defaultModel
    const url = `${this.baseUrl}/${modelName}:generateContent`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: this.config.temperature,
            topK: this.config.topK,
            topP: this.config.topP,
            maxOutputTokens: this.config.maxOutputTokens
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message || `API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!content) {
        throw new Error('No response from API')
      }

      return content
    } catch (error) {
      console.error('[CreateCollectionService] API Error:', error)
      throw error
    }
  }

  /**
   * Extract JSON from AI response
   */
  private extractJSON<T>(content: string): T {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response')
    }
    return JSON.parse(jsonMatch[0])
  }

  /**
   * Build prompt for single word
   */
  private buildWordPrompt(word: string): string {
    return `Analyze the English word: "${word}" and return comprehensive learning data.

Return ONLY valid JSON in this EXACT structure:
{
  "words": [
    {
      "word": "${word}",
      "pronunciation": "/ˌpɜːrsəˈvɪrəns/",
      "difficulty_level": 5,
      "frequency_rank": 7,
      "category": "academic",
      "tags": ["formal", "business", "academic"],
      "metadata": {
        "etymology": "From Latin perseverare meaning 'to persist'",
        "register": "formal",
        "learning_tip": "Think of 'persevere' + 'ance' suffix",
        "mnemonic": "PERson who SEVERes through challenges shows perseverance"
      },
      "definitions": [
        {
          "meaning": "The quality of continuing to try to achieve a goal despite difficulties",
          "translation": "Sự kiên trì, bền bỉ trong việc theo đuổi mục tiêu bất chấp khó khăn",
          "usage_context": "Used in formal contexts, often in business or academic writing",
          "word_type": "noun",
          "examples": [
            {
              "sentence": "Her perseverance in learning English finally paid off.",
              "translation": "Sự kiên trì học tiếng Anh của cô ấy cuối cùng đã được đền đáp."
            },
            {
              "sentence": "Success requires talent and perseverance.",
              "translation": "Thành công đòi hỏi tài năng và sự kiên trì."
            }
          ]
        }
      ],
      "relationships": [
        {
          "relationship_type": "synonyms",
          "items": ["persistence", "determination", "tenacity", "steadfastness"]
        },
        {
          "relationship_type": "antonyms",
          "items": ["giving up", "quitting", "surrender"]
        },
        {
          "relationship_type": "word_family",
          "items": ["persevere (verb)", "perseverant (adjective)", "persevering (adjective)"]
        },
        {
          "relationship_type": "collocations",
          "items": ["show perseverance", "demonstrate perseverance", "require perseverance", "with perseverance"]
        }
      ]
    }
  ]
}

CRITICAL RULES:
✅ REQUIRED FIELDS (must have values):
   - word, pronunciation (IPA format /.../)
   - difficulty_level (1-10), frequency_rank (1-10)
   - category, tags (array with at least 2 tags)

✅ DEFINITIONS (at least 1 required):
   - Each definition MUST have: meaning, translation, word_type
   - word_type: noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|determiner|exclamation
   - Each definition MUST have at least 2 examples
   - usage_context is optional but recommended

✅ RELATIONSHIPS (optional but highly recommended):
   - relationship_type: synonyms|antonyms|word_family|collocations|common_phrases
   - items: array of strings (at least 2 items per relationship)

✅ METADATA (flat object only):
   - Use simple key-value pairs ONLY (string, number, boolean, string[])
   - NO nested objects allowed
   - Recommended fields: etymology, register, learning_tip, mnemonic, usage_note

✅ QUALITY GUIDELINES:
   - difficulty_level: 1=very easy (cat, dog), 10=very hard (obfuscate, serendipitous)
   - frequency_rank: 1=very rare (seldom used), 10=very common (daily use)
   - category: business|daily|travel|academic|technical|slang|formal
   - Vietnamese must be natural and culturally appropriate
   - Examples must be practical and commonly used

Return ONLY JSON, no markdown, no explanations.`
  }

  /**
   * Build prompt for single phrase
   */
  private buildPhrasePrompt(phrase: string): string {
    return `Analyze the English phrase: "${phrase}" and return comprehensive learning data.

Return ONLY valid JSON in this EXACT structure:
{
  "phrases": [
    {
      "phrase": "${phrase}",
      "pronunciation": "/breɪk ði aɪs/",
      "difficulty_level": 6,
      "frequency_rank": 8,
      "category": "daily",
      "tags": ["idiom", "social", "common", "informal"],
      "metadata": {
        "origin": "From the practice of breaking ice on rivers to allow boats to pass",
        "register": "informal",
        "formality": "casual",
        "common_contexts": "social gatherings, meetings, networking events",
        "cultural_note": "Very common in English-speaking business culture",
        "learning_tip": "Think of breaking literal ice = making things less cold/awkward"
      },
      "definitions": [
        {
          "meaning": "To do or say something to make people feel more relaxed in a social situation",
          "translation": "Phá tan sự ngượng ngùng, làm tan băng trong giao tiếp",
          "usage_context": "Used when meeting new people or starting conversations",
          "phrase_type": "idiom",
          "examples": [
            {
              "sentence": "He told a joke to break the ice at the beginning of the meeting.",
              "translation": "Anh ấy kể một câu chuyện cười để phá tan sự ngượng ngùng lúc đầu cuộc họp."
            },
            {
              "sentence": "Small talk about the weather is a good way to break the ice.",
              "translation": "Nói chuyện phiếm về thời tiết là cách tốt để bắt đầu cuộc trò chuyện."
            }
          ]
        }
      ],
      "relationships": [
        {
          "relationship_type": "synonyms",
          "items": ["ease tension", "lighten the mood", "warm up the atmosphere"]
        },
        {
          "relationship_type": "common_phrases",
          "items": ["break the silence", "start a conversation", "make introductions"]
        },
        {
          "relationship_type": "collocations",
          "items": ["break the ice with someone", "help break the ice", "try to break the ice"]
        }
      ]
    }
  ]
}

CRITICAL RULES:
✅ REQUIRED FIELDS:
   - phrase, pronunciation (IPA format /.../)
   - difficulty_level (1-10), frequency_rank (1-10)
   - category, tags (array with at least 2 tags)

✅ DEFINITIONS (at least 1 required):
   - Each definition MUST have: meaning, translation, phrase_type
   - phrase_type: idiom|phrasal_verb|collocation|slang|expression
   - Each definition MUST have at least 2 examples
   - usage_context is optional but recommended

✅ RELATIONSHIPS (optional but highly recommended):
   - relationship_type: synonyms|antonyms|common_phrases|collocations
   - items: array of strings (at least 2 items)

✅ METADATA (flat object only):
   - Simple key-value pairs: string, number, boolean, string[]
   - NO nested objects
   - Recommended: origin, register, formality, common_contexts, cultural_note, learning_tip

✅ QUALITY GUIDELINES:
   - difficulty_level: 1=very easy, 10=very hard
   - frequency_rank: 1=very rare, 10=very common
   - category: business|daily|travel|academic|slang|informal|formal
   - Vietnamese translations must be natural and culturally appropriate

Return ONLY JSON, no markdown, no explanations.`
  }

  /**
   * Build prompt for single grammar point
   */
  private buildGrammarPrompt(grammarPoint: string): string {
    return `Analyze the English grammar point: "${grammarPoint}" and return comprehensive learning data.

Return ONLY valid JSON in this EXACT structure:
{
  "grammar": [
    {
      "title": "${grammarPoint}",
      "item_type": "tense",
      "difficulty_level": 5,
      "frequency_rank": 9,
      "category": "tenses",
      "tags": ["basic", "intermediate", "past_connection", "common"],
      "metadata": {
        "usage_context": "Experience, completed actions with present relevance",
        "common_contexts": "talking about experiences, recent actions, ongoing situations",
        "related_grammar": "Simple Past, Present Perfect Continuous",
        "formality": "formal and informal",
        "register": "spoken and written",
        "learning_tip": "Focus on the connection between past action and present result"
      },
      "rules": [
        {
          "rule_description": "Used for actions that happened at an unspecified time before now",
          "translation": "Dùng cho hành động đã xảy ra tại thời điểm không xác định trước bây giờ",
          "formula": "Subject + have/has + past participle",
          "usage_context": "Experience, completed actions with present relevance, actions starting in past continuing to present",
          "notes": "Often used with: ever, never, already, yet, just, since, for",
          "examples": [
            {
              "sentence": "I have visited Paris three times.",
              "translation": "Tôi đã đến Paris ba lần.",
              "is_correct": true,
              "explanation": "Experience - no specific time mentioned"
            },
            {
              "sentence": "She has just finished her homework.",
              "translation": "Cô ấy vừa mới hoàn thành bài tập.",
              "is_correct": true,
              "explanation": "Recent completed action with 'just'"
            },
            {
              "sentence": "I have visited Paris yesterday.",
              "translation": "Tôi đã đến Paris hôm qua. (SAI)",
              "is_correct": false,
              "explanation": "Cannot use Present Perfect with specific past time (yesterday). Use Simple Past instead."
            }
          ]
        },
        {
          "rule_description": "Used with 'since' and 'for' to show duration",
          "translation": "Dùng với 'since' và 'for' để thể hiện khoảng thời gian",
          "formula": "Subject + have/has + past participle + for/since + time",
          "usage_context": "Duration from past to present",
          "notes": "'since' + specific point in time, 'for' + period of time",
          "examples": [
            {
              "sentence": "I have lived here for 5 years.",
              "translation": "Tôi đã sống ở đây được 5 năm.",
              "is_correct": true,
              "explanation": "Duration with 'for' + period"
            },
            {
              "sentence": "She has worked here since 2020.",
              "translation": "Cô ấy đã làm việc ở đây từ năm 2020.",
              "is_correct": true,
              "explanation": "Duration with 'since' + specific time"
            }
          ]
        }
      ],
      "common_mistakes": [
        {
          "incorrect_example": "I have seen him yesterday.",
          "correct_example": "I saw him yesterday.",
          "explanation": "Don't use Present Perfect with specific past time expressions (yesterday, last week, in 2019)",
          "translation": "Không dùng Present Perfect với thời gian quá khứ cụ thể"
        },
        {
          "incorrect_example": "I have went to the store.",
          "correct_example": "I have gone to the store.",
          "explanation": "Use past participle 'gone', not simple past 'went'",
          "translation": "Dùng quá khứ phân từ 'gone', không phải quá khứ đơn 'went'"
        },
        {
          "incorrect_example": "She has buy a new car.",
          "correct_example": "She has bought a new car.",
          "explanation": "Use past participle 'bought', not base form 'buy'",
          "translation": "Dùng quá khứ phân từ 'bought', không phải dạng nguyên thể 'buy'"
        }
      ]
    }
  ]
}

CRITICAL RULES:
✅ REQUIRED FIELDS:
   - title, item_type (tense|structure|rule|pattern)
   - difficulty_level (1-10), frequency_rank (1-10)
   - category, tags (array with at least 2 tags)

✅ RULES (at least 1 required, recommend 2-3):
   - Each rule MUST have: rule_description, translation, formula
   - Each rule MUST have at least 2 examples (mix of correct=true and correct=false)
   - usage_context and notes are optional but highly recommended

✅ COMMON_MISTAKES (at least 2 required):
   - Each mistake MUST have: incorrect_example, correct_example, explanation
   - translation is optional but recommended
   - Focus on real mistakes learners make

✅ METADATA (flat object only):
   - Simple key-value pairs: string, number, boolean, string[]
   - NO nested objects
   - Recommended: usage_context, common_contexts, related_grammar, formality, register, learning_tip

✅ QUALITY GUIDELINES:
   - difficulty_level: 1=very easy, 10=very hard
   - frequency_rank: 1=very rare, 10=very common
   - category: tenses|conditionals|passive|reported_speech|modals|articles|prepositions
   - Vietnamese must be detailed, accurate, and educational

Return ONLY JSON, no markdown, no explanations.`
  }

  /**
   * Fetch comprehensive information for a single word
   */
  async fetchWord(word: string): Promise<AIWordResult> {
    const prompt = this.buildWordPrompt(word)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ words: AIWordResult[] }>(content)

    if (!parsed.words || parsed.words.length === 0) {
      throw new Error('No word data returned from API')
    }

    return parsed.words[0]
  }

  /**
   * Fetch comprehensive information for a single phrase
   */
  async fetchPhrase(phrase: string): Promise<AIPhraseResult> {
    const prompt = this.buildPhrasePrompt(phrase)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ phrases: AIPhraseResult[] }>(content)

    if (!parsed.phrases || parsed.phrases.length === 0) {
      throw new Error('No phrase data returned from API')
    }

    return parsed.phrases[0]
  }

  /**
   * Fetch comprehensive information for a single grammar point
   */
  async fetchGrammar(grammarPoint: string): Promise<AIGrammarResult> {
    const prompt = this.buildGrammarPrompt(grammarPoint)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ grammar: AIGrammarResult[] }>(content)

    if (!parsed.grammar || parsed.grammar.length === 0) {
      throw new Error('No grammar data returned from API')
    }

    return parsed.grammar[0]
  }
}

// ============================================
// SINGLETON INSTANCE FACTORY
// ============================================

let CreateCollectionServiceInstance: CreateCollectionService | null = null

export const createCreateCollectionService = (
  apiKey: string,
  config?: Partial<GeminiConfig>
): CreateCollectionService => {
  CreateCollectionServiceInstance = new CreateCollectionService(apiKey, config)
  return CreateCollectionServiceInstance
}

export const getCreateCollectionService = (): CreateCollectionService | null => {
  return CreateCollectionServiceInstance
}

export default CreateCollectionService
