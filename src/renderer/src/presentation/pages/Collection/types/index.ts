// === CORE VOCABULARY ===
export interface vocabulary_item {
  id: string
  item_type: 'word' | 'phrase' | 'grammar'
  content: string
  pronunciation?: string
  ipa_notation?: string
  
  // Classification
  word_type?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'interjection' | 'determiner' | 'exclamation'
  phrase_type?: 'idiom' | 'phrasal_verb' | 'collocation' | 'slang' | 'expression'
  grammar_type?: 'tense' | 'conditional' | 'passive' | 'modal' | 'article' | 'preposition_usage' | 'sentence_structure'
  
  created_at: string
  updated_at: string
}

// === DEFINITIONS & EXAMPLES ===
export interface definition {
  id: string
  vocabulary_item_id: string
  meaning: string
  translation?: string
  language_code: string // 'vi', 'ja', 'ko', 'zh', 'es', 'fr', etc. (ISO 639-1)
  created_at: string
}

export interface example {
  id: string
  definition_id: string
  sentence: string
  translation?: string
  language_code: string // 'vi', 'ja', 'ko', 'zh', 'es', 'fr', etc. (ISO 639-1)
  created_at: string
}

// === FILTERING & CATEGORIZATION ===
export interface vocabulary_metadata {
  id: string
  vocabulary_item_id: string
  
  // For filtering
  difficulty_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  frequency_rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  
  category: string // business, daily, travel, academic
  tags: string[] // ["formal", "informal", "british", "american"]
  
  is_active: boolean
  created_at: string
  updated_at: string
}

// === USER LEARNING ANALYTICS ===
export interface vocabulary_analytics {
  id: string
  vocabulary_item_id: string
  
  // Learning stats
  mastery_score: number // 0-100
  times_seen: number
  times_correct: number
  times_incorrect: number
  
  // Timestamps
  first_learned_at: string
  last_reviewed_at?: string
  last_seen_at?: string
  
  created_at: string
  updated_at: string
}

// === AI RECOMMENDATION ENGINE ===
export interface vocabulary_recommendation {
  id: string
  vocabulary_item_id: string
  
  // AI scoring
  priority_score: number // 0-100: độ ưu tiên hiển thị
  retention_rate: number // 0-1: khả năng nhớ dự đoán
  
  // Spaced repetition
  next_review_date?: string
  review_interval_days: number
  ease_factor: number // SuperMemo algorithm
  
  created_at: string
  updated_at: string
}

// === ERROR TRACKING ===
export interface vocabulary_mistake {
  id: string
  vocabulary_item_id: string
  
  incorrect_usage: string
  correct_usage: string
  context?: string
  
  occurred_at: string
  created_at: string
}

export interface confused_pair {
  id: string
  vocabulary_item_id: string
  confused_with_id: string // ID của từ bị nhầm lẫn
  
  confusion_count: number
  last_confused_at: string
  created_at: string
}

// === RELATIONSHIPS ===
export interface vocabulary_relation {
  id: string
  vocabulary_item_id: string
  related_item_id: string
  
  relation_type: 'synonym' | 'antonym' | 'collocation' | 'related' | 'similar_grammar'
  strength: number // 1-10: mức độ liên quan
  
  created_at: string
}

// === LEARNING CONTEXT ===
export interface learning_context {
  id: string
  vocabulary_item_id: string
  question_id?: string
  
  sentence: string
  was_correct: boolean
  user_answer?: string
  context_type: 'reading' | 'writing' | 'listening' | 'speaking' | 'grammar_exercise'
  
  timestamp: string
  created_at: string
}

// === SOURCE TRACKING ===
export interface vocabulary_source {
  id: string
  vocabulary_item_id: string
  
  source_type: 'user_error' | 'imported' | 'ai_suggested' | 'manual_add'
  source_reference?: string // question_id hoặc import file name
  
  added_at: string
  created_at: string
}


// {
//   "vocabulary_item": {
//     "id": "vocab_001",
//     "item_type": "phrase",
//     "content": "break the ice",
//     "pronunciation": "breyk thee ahys",
//     "ipa_notation": "/breɪk ðə aɪs/",
//     "phrase_type": "idiom",
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },
  
//   "definitions": [
//     {
//       "id": "def_001",
//       "vocabulary_item_id": "vocab_001",
//       "meaning": "To make people feel more relaxed in a social situation, especially at the beginning of a meeting or party",
//       "translation": "Phá vỡ sự im lặng awkward, làm cho không khí thoải mái hơn",
//       "language_code": "vi",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
  
//   "examples": [
//     {
//       "id": "ex_001",
//       "definition_id": "def_001",
//       "sentence": "He told a joke to break the ice at the meeting.",
//       "translation": "Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng awkward trong cuộc họp.",
//       "language_code": "vi",
//       "created_at": "2025-10-01T10:30:00Z"
//     },
//     {
//       "id": "ex_002",
//       "definition_id": "def_001",
//       "sentence": "Let's play a game to break the ice.",
//       "translation": "Hãy chơi một trò chơi để làm cho không khí thoải mái hơn.",
//       "language_code": "vi",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
  
//   "vocabulary_metadata": {
//     "id": "meta_001",
//     "vocabulary_item_id": "vocab_001",
//     "difficulty_level": 5,
//     "frequency_rank": 7,
//     "category": "daily",
//     "tags": ["informal", "social", "communication", "american", "british"],
//     "is_active": true,
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },
  
//   "vocabulary_analytics": {
//     "id": "analytics_001",
//     "vocabulary_item_id": "vocab_001",
//     "mastery_score": 65,
//     "first_learned_at": "2025-09-15T14:20:00Z",
//     "last_reviewed_at": "2025-10-05T09:15:00Z",
//     "last_seen_at": "2025-10-07T16:45:00Z",
//     "created_at": "2025-09-15T14:20:00Z",
//     "updated_at": "2025-10-07T16:45:00Z"
//   },
  
//   "vocabulary_recommendation": {
//     "id": "rec_001",
//     "vocabulary_item_id": "vocab_001",
//     "priority_score": 72,
//     "retention_rate": 0.68,
//     "next_review_date": "2025-10-10T10:00:00Z",
//     "review_interval_days": 3,
//     "ease_factor": 2.3,
//     "created_at": "2025-10-07T16:45:00Z",
//     "updated_at": "2025-10-07T16:45:00Z"
//   },
//
//   "learning_contexts": [
//     {
//       "id": "context_001",
//       "vocabulary_item_id": "vocab_001",
//       "question_id": "q_156",
//       "sentence": "At the party, Sarah tried to ___ by asking everyone about their hobbies.",
//       "was_correct": true,
//       "user_answer": "break the ice",
//       "context_type": "writing",
//       "timestamp": "2025-10-05T09:15:00Z",
//       "created_at": "2025-10-05T09:15:00Z"
//     },
//     {
//       "id": "context_002",
//       "vocabulary_item_id": "vocab_001",
//       "question_id": "q_198",
//       "sentence": "The presenter used a quiz to ___ before the presentation.",
//       "was_correct": false,
//       "user_answer": "breaking the ice",
//       "context_type": "grammar_exercise",
//       "timestamp": "2025-09-28T15:20:00Z",
//       "created_at": "2025-09-28T15:20:00Z"
//     }
//   ]
// }