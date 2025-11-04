// === CORE VOCABULARY ===
export interface vocabulary_items {
  id: string
  item_type: 'word' | 'phrase'
  content: string
  pronunciation?: string
  difficulty_level?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  frequency_rank?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at?: string
}

// === DEFINITIONS & EXAMPLES ===
export interface vocabulary_definitions {
  id: string
  vocabulary_item_id: string
  meaning: string
  translation?: string
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
  created_at: string
}

export interface vocabulary_examples {
  id: string
  definition_id: string
  sentence: string
  translation?: string
  created_at: string
}

// === VOCABULARY RELATIONSHIPS ===
export interface vocabulary_relationships {
  id: string
  vocabulary_item_id: string
  relationship_type: string // synonyms, antonyms, word_family, collocations, common_phrases
  vocabulary_item_type: 'word' | 'phrase'
  content?: string
  content_translation?: string
  metadata?: Record<string, any>
  created_at: string
}

// === USER LEARNING ANALYTICS ===
export interface vocabulary_analytics {
  id: string
  vocabulary_item_id: string
  mastery_score: number // 0-100
  next_review?: string
  streak?: number
  last_reviewed?: string
  common_errors?: string[]
  created_at: string
  updated_at: string
}
