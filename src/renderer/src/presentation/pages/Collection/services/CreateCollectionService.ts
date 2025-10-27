export interface GeminiConfig {
  apiKey: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
}

export interface WordDefinition {
  meaning: string
  translation: string
  wordType?: string // Thêm word_type vào definition
  phraseType?: string // Thêm phrase_type vào definition
  examples: Array<{
    sentence: string
    translation: string
  }>
}

export interface AIWordResult {
  word: string
  ipaNotation: string
  wordType: string
  pronunciation?: string
  difficulty_level?: number
  frequency_rank?: number
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  definitions: WordDefinition[]
}

export interface AIPhraseResult {
  phrase: string
  ipaNotation: string
  phraseType: string
  pronunciation?: string
  difficulty_level?: number
  frequency_rank?: number
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  definitions: WordDefinition[]
}

export interface AIGrammarResult {
  content: string
  grammarType: string
  difficulty_level?: number
  frequency_rank?: number
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  definitions: Array<{
    description: string
    explanation: string
    structure?: string
    translation?: string
  }>
  examples: Array<{
    sentence: string
    translation?: string
    usage_note?: string
  }>
  commonMistakes?: Array<{
    incorrect: string
    correct: string
    explanation: string
  }>
}

export interface AIPronunciationResult {
  content: string
  ipaNotation: string
  phonemeBreakdown: Array<{
    phoneme: string
    description: string
    mouth_shape?: string
    tongue_position?: string
  }>
  guide: {
    tips: string[]
    common_mistakes: string[]
    mouth_position?: string
    tongue_position?: string
  }
}

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
  private buildSingleWordPrompt(word: string): string {
    return `Find comprehensive information for the English word: "${word}"

Return information in this JSON structure:
{
  "words": [
    {
      "word": "${word}",
      "pronunciation": "simple pronunciation guide (e.g., per-suh-veer-uhns)",
      "ipaNotation": "IPA notation with / / (e.g., /ˌpɜːrsəˈvɪrəns/)",
      "wordType": "noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|determiner|exclamation",
      "difficulty_level": 1-10 (1=very easy, 10=very hard),
      "frequency_rank": 1-10 (1=very rare, 10=very common),
      "category": "business|daily|travel|academic",
      "tags": ["tag1", "tag2", "tag3"],
      "metadata": {
        "etymology": "word origin and history",
        "synonyms": ["synonym1", "synonym2", "synonym3"],
        "antonyms": ["antonym1", "antonym2"],
        "common_phrases": ["phrase1", "phrase2", "phrase3"],
        "word_family": ["related1", "related2", "related3"],
        "learning_tip": "helpful tip for remembering this word",
        "register": "formal/informal/neutral",
        "collocations": ["collocation1", "collocation2"],
        "mnemonic": "memory trick to remember",
        "usage_note": "special usage notes"
      },
      "definitions": [
        {
          "meaning": "Clear English definition",
          "translation": "Accurate Vietnamese translation (nghĩa tiếng Việt)",
          "wordType": "noun|verb|adjective|adverb|etc",
          "examples": [
            {
              "sentence": "Natural example sentence in English",
              "translation": "Ví dụ tự nhiên bằng tiếng Việt"
            },
            {
              "sentence": "Another example showing different usage",
              "translation": "Ví dụ khác cho thấy cách dùng khác"
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- The word must have at least 1 definition with 2 examples
- Vietnamese translations must be accurate and natural
- IPA notation must use proper format: /ˌpɜːrsəˈvɪrəns/
- Simple pronunciation: per-suh-veer-uhns
- difficulty_level (1-10), frequency_rank (1-10), category, and tags are REQUIRED fields
- Tags should be relevant to the word (e.g., ["formal", "business", "common", "academic"])
- metadata is a FLAT object with simple key-value pairs (NO nested objects)
- Use ONLY these data types: string, number, boolean, array
- Be creative with field names! Examples: etymology, mnemonic, register, usage_note, collocations, word_family, etc.
- Arrays should contain simple strings only
- NO nested objects inside metadata
- More metadata fields = better learning experience
- Return ONLY valid JSON, no other text
- Examples should be practical and common usage`
  }

  /**
   * Build prompt for multiple words
   */
  private buildMultiWordsPrompt(words: string[]): string {
    const wordStrings = words.join(', ')
    return `Find comprehensive information for these English words: ${wordStrings}

For EACH word, return information in this JSON structure:
{
  "words": [
    {
      "word": "the exact word",
      "pronunciation": "simple pronunciation guide (e.g., per-suh-veer-uhns)",
      "ipaNotation": "IPA notation with / / (e.g., /ˌpɜːrsəˈvɪrəns/)",
      "wordType": "noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|determiner|exclamation",
      "definitions": [
        {
          "meaning": "Clear English definition",
          "translation": "Accurate Vietnamese translation (nghĩa tiếng Việt)",
          "wordType": "noun|verb|adjective|adverb|etc",
          "examples": [
            {
              "sentence": "Natural example sentence in English",
              "translation": "Ví dụ tự nhiên bằng tiếng Việt"
            },
            {
              "sentence": "Another example showing different usage",
              "translation": "Ví dụ khác cho thấy cách dùng khác"
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- Return information for ALL ${words.length} wordsexport interface AIWordResult {
- Each word must have at least 1 definition with 2 examples
- Vietnamese translations must be accurate and natural
- IPA notation must use proper format: /ˌpɜːrsəˈvɪrəns/
- Simple pronunciation: per-suh-veer-uhns
- Metadata is a FLEXIBLE object - be creative with field names and data types
- Include difficulty_level (1-10), frequency_rank (1-10), category, tags
- Add ANY other helpful fields: etymology, mnemonics, usage patterns, cultural context, etc.
- Use various data types: strings, numbers, booleans, arrays, nested objects
- More comprehensive metadata = better learning experience
- Tags should be relevant to each word
- Return ONLY valid JSON, no other text
- Examples should be practical and common usage`
  }

  /**
   * Build prompt for single phrase
   */
  private buildSinglePhrasePrompt(phrase: string): string {
    return `Find comprehensive information for the English phrase: "${phrase}"

Return information in this JSON structure:
{
  "phrases": [
    {
      "phrase": "${phrase}",
      "pronunciation": "simple pronunciation guide",
      "ipaNotation": "IPA notation with / /",
      "phraseType": "idiom|phrasal_verb|collocation|slang|expression",
      "difficulty_level": 1-10 (1=very easy, 10=very hard),
      "frequency_rank": 1-10 (1=very rare, 10=very common),
      "category": "business|daily|travel|academic",
      "tags": ["tag1", "tag2", "tag3"],
      "metadata": {
        "origin": "phrase origin and history",
        "similar_phrases": ["phrase1", "phrase2"],
        "opposite_phrases": ["phrase1", "phrase2"],
        "register": "formal/informal/neutral",
        "common_contexts": ["context1", "context2"],
        "cultural_note": "cultural context if any",
        "learning_tip": "helpful tip for remembering"
      },
      "definitions": [
        {
          "meaning": "Clear English definition",
          "translation": "Accurate Vietnamese translation",
          "phraseType": "idiom|phrasal_verb|collocation|slang|expression",
          "examples": [
            {
              "sentence": "Natural example in context",
              "translation": "Ví dụ tự nhiên bằng tiếng Việt"
            },
            {
              "sentence": "Another contextual example",
              "translation": "Ví dụ ngữ cảnh khác"
            }
          ]
        }
      ],
    }
  ]
}

IMPORTANT RULES:
- The phrase must have at least 1 definition with 2 examples
- difficulty_level (1-10), frequency_rank (1-10), category, and tags are REQUIRED fields
- Tags should be relevant to the phrase (e.g., ["informal", "common", "spoken", "business"])
- metadata is a FLAT object with simple key-value pairs (NO nested objects)
- Use ONLY these data types: string, number, boolean, array
- Be creative with field names! Examples: origin, cultural_note, register, similar_phrases, etc.
- Arrays should contain simple strings only
- NO nested objects inside metadata
- More metadata fields = better learning experience
- Vietnamese translations must be natural and accurate
- Return ONLY valid JSON, no other text`
  }

  /**
   * Build prompt for multiple phrases
   */
  private buildMultiPhrasesPrompt(phrases: string[]): string {
    const phraseStrings = phrases.join(', ')
    return `Find comprehensive information for these English phrases: ${phraseStrings}

For EACH phrase, return information in this JSON structure:
{
  "phrases": [
    {
      "phrase": "the exact phrase",
      "pronunciation": "simple pronunciation guide",
      "ipaNotation": "IPA notation with / /",
      "phraseType": "idiom|phrasal_verb|collocation|slang|expression",
      "difficulty_level": 1-10 (1=very easy, 10=very hard),
      "frequency_rank": 1-10 (1=very rare, 10=very common),
      "category": "business|daily|travel|academic",
      "tags": ["tag1", "tag2", "tag3"],
      "metadata": {
        "origin": "phrase origin",
        "similar_phrases": ["phrase1", "phrase2"],
        "register": "formal/informal/neutral",
        "learning_tip": "helpful tip"
      },
      "definitions": [
        {
          "meaning": "Clear English definition",
          "translation": "Accurate Vietnamese translation",
          "phraseType": "idiom|phrasal_verb|collocation|slang|expression",
          "examples": [
            {
              "sentence": "Natural example in context",
              "translation": "Ví dụ tự nhiên bằng tiếng Việt"
            }
          ]
        }
      ],
    }
  ]
}

IMPORTANT RULES:
- Return information for ALL ${phrases.length} phrases
- Each phrase must have at least 1 definition with 2 examples
- difficulty_level (1-10), frequency_rank (1-10), category, and tags are REQUIRED fields
- Tags should be relevant to each phrase
- metadata is a FLAT object - be creative with field names
- Include usage context (formal/informal/neutral)
- Vietnamese translations must be natural and accurate
- Return ONLY valid JSON, no other text`
  }

  /**
   * Build prompt for single grammar point
   */
  private buildSingleGrammarPrompt(grammarPoint: string): string {
    return `Find comprehensive information for the English grammar point: "${grammarPoint}"

Return information in this JSON structure:
{
  "grammar": [
    {
      "content": "${grammarPoint}",
      "grammarType": "tense|conditional|passive|modal|article|preposition_usage|sentence_structure",
      "difficulty_level": 1-10 (1=very easy, 10=very hard),
      "frequency_rank": 1-10 (1=very rare, 10=very common),
      "category": "tenses|conditionals|passive|reported_speech|modals",
      "tags": ["tag1", "tag2", "tag3"],
      "metadata": {
        "usage_context": "when to use this grammar point",
        "common_contexts": ["context1", "context2"],
        "related_grammar": ["related point 1", "related point 2"],
        "learning_tip": "helpful tip for understanding",
        "formality": "formal/informal/neutral",
        "register": "spoken/written/both"
      },
      "definitions": [
        {
          "description": "Brief description",
          "explanation": "Detailed explanation in English",
          "structure": "Grammatical structure or formula",
          "translation": "Detailed Vietnamese explanation"
        }
      ],
      "examples": [
        {
          "sentence": "Example sentence",
          "translation": "Ví dụ bằng tiếng Việt",
          "usage_note": "When and how to use this"
        },
        {
          "sentence": "Another example sentence",
          "translation": "Ví dụ khác bằng tiếng Việt",
          "usage_note": "Different usage context"
        },
        {
          "sentence": "Third example sentence",
          "translation": "Ví dụ thứ ba bằng tiếng Việt",
          "usage_note": "Yet another usage context"
        }
      ],
      "commonMistakes": [
        {
          "incorrect": "Wrong usage example",
          "correct": "Correct usage example",
          "explanation": "Why it's wrong and how to fix"
        },
        {
          "incorrect": "Another wrong usage",
          "correct": "Another correct usage",
          "explanation": "Explanation of the mistake"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- difficulty_level (1-10), frequency_rank (1-10), category, and tags are REQUIRED fields
- Tags should be relevant to the grammar point (e.g., ["basic", "intermediate", "advanced", "formal", "spoken"])
- metadata is a FLAT object with simple key-value pairs (NO nested objects)
- Use ONLY these data types: string, number, boolean, array
- Be creative with field names! Examples: usage_context, common_contexts, related_grammar, learning_tip, etc.
- Arrays should contain simple strings only
- NO nested objects inside metadata
- More metadata fields = better learning experience
- Must have clear structure/formula
- Include at least 3 examples and 2 common mistakes
- Vietnamese explanations must be detailed and accurate
- Return ONLY valid JSON, no other text`
  }

  /**
   * Build prompt for multiple grammar points
   */
  private buildMultiGrammarPrompt(grammarPoints: string[]): string {
    const grammarStrings = grammarPoints.join(', ')
    return `Find comprehensive information for these English grammar points: ${grammarStrings}

For EACH grammar point, return information in this JSON structure:
{
  "grammar": [
    {
      "content": "the exact grammar point name",
      "grammarType": "tense|conditional|passive|modal|article|preposition_usage|sentence_structure",
      "difficulty_level": 1-10 (1=very easy, 10=very hard),
      "frequency_rank": 1-10 (1=very rare, 10=very common),
      "category": "tenses|conditionals|passive|reported_speech|modals",
      "tags": ["tag1", "tag2", "tag3"],
      "metadata": {
        "usage_context": "when to use this grammar point",
        "common_contexts": ["context1", "context2"],
        "related_grammar": ["related point 1", "related point 2"],
        "learning_tip": "helpful tip for understanding"
      },
      "definitions": [
        {
          "description": "Brief description",
          "explanation": "Detailed explanation in English",
          "structure": "Grammatical structure or formula",
          "translation": "Detailed Vietnamese explanation"
        }
      ],
      "examples": [
        {
          "sentence": "Example sentence",
          "translation": "Ví dụ bằng tiếng Việt",
          "usage_note": "When and how to use this"
        }
      ],
      "commonMistakes": [
        {
          "incorrect": "Wrong usage example",
          "correct": "Correct usage example",
          "explanation": "Why it's wrong and how to fix"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- Return information for ALL ${grammarPoints.length} grammar points
- difficulty_level (1-10), frequency_rank (1-10), category, and tags are REQUIRED fields
- Tags should be relevant to each grammar point
- metadata is a FLAT object - be creative with field names
- Each must have clear structure/formula
- Include at least 3 examples and 2 common mistakes
- Vietnamese explanations must be detailed and accurate
- Return ONLY valid JSON, no other text`
  }

  /**
   * Fetch comprehensive information for a single word
   */
  async fetchSingleWord(word: string): Promise<AIWordResult> {
    const prompt = this.buildSingleWordPrompt(word)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ words: AIWordResult[] }>(content)

    if (!parsed.words || parsed.words.length === 0) {
      throw new Error('No word data returned from API')
    }

    return parsed.words[0]
  }

  /**
   * Fetch comprehensive information for multiple words
   */
  async fetchMultipleWords(words: string[]): Promise<AIWordResult[]> {
    const prompt = this.buildMultiWordsPrompt(words)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ words: AIWordResult[] }>(content)

    if (!parsed.words || parsed.words.length === 0) {
      throw new Error('No word data returned from API')
    }

    return parsed.words
  }

  /**
   * Fetch comprehensive information for a single phrase
   */
  async fetchSinglePhrase(phrase: string): Promise<AIPhraseResult> {
    const prompt = this.buildSinglePhrasePrompt(phrase)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ phrases: AIPhraseResult[] }>(content)

    if (!parsed.phrases || parsed.phrases.length === 0) {
      throw new Error('No phrase data returned from API')
    }

    return parsed.phrases[0]
  }

  /**
   * Fetch comprehensive information for multiple phrases
   */
  async fetchMultiplePhrases(phrases: string[]): Promise<AIPhraseResult[]> {
    const prompt = this.buildMultiPhrasesPrompt(phrases)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ phrases: AIPhraseResult[] }>(content)

    if (!parsed.phrases || parsed.phrases.length === 0) {
      throw new Error('No phrase data returned from API')
    }

    return parsed.phrases
  }

  /**
   * Fetch comprehensive information for a single grammar point
   */
  async fetchSingleGrammar(grammarPoint: string): Promise<AIGrammarResult> {
    const prompt = this.buildSingleGrammarPrompt(grammarPoint)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ grammar: AIGrammarResult[] }>(content)

    if (!parsed.grammar || parsed.grammar.length === 0) {
      throw new Error('No grammar data returned from API')
    }

    return parsed.grammar[0]
  }

  /**
   * Fetch comprehensive information for multiple grammar points
   */
  async fetchMultipleGrammar(grammarPoints: string[]): Promise<AIGrammarResult[]> {
    const prompt = this.buildMultiGrammarPrompt(grammarPoints)
    const content = await this.makeRequest(prompt)
    const parsed = this.extractJSON<{ grammar: AIGrammarResult[] }>(content)

    if (!parsed.grammar || parsed.grammar.length === 0) {
      throw new Error('No grammar data returned from API')
    }

    return parsed.grammar
  }

  /**
   * Generate practice questions with AI
   */
  async generateQuestions(prompt: string): Promise<string> {
    try {
      const content = await this.makeRequest(prompt)
      return content
    } catch (error) {
      console.error('[CreateCollectionService] Error generating questions:', error)
      throw error
    }
  }
}

// Singleton instance factory
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
