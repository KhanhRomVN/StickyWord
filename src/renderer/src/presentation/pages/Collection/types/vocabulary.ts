// === CORE VOCABULARY ===
export interface vocabulary_item {
  id: string
  item_type: 'word' | 'phrase'
  content: string
  pronunciation?: string // IPA notation (e.g., /ˌpɜːrsəˈvɪrəns/)

  // Classification
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
  updated_at: string
}

// === DEFINITIONS & EXAMPLES ===
export interface definition {
  id: string
  vocabulary_item_id: string
  meaning: string
  translation?: string
  created_at: string
}

export interface example {
  id: string
  definition_id: string
  sentence: string
  translation?: string
  created_at: string
}

// === FILTERING & CATEGORIZATION ===
export interface vocabulary_metadata {
  id: string
  vocabulary_item_id: string
  difficulty_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  frequency_rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  category: string // business, daily, travel, academic
  tags: string[] // ["formal", "informal", "british", "american"]
  created_at: string
  updated_at: string
}

// === RELATIONSHIPS ===
export interface vocabulary_relation {
  id: string
  vocabulary_item_id: string
  related_item_id: string
  relation_type: 'synonym' | 'antonym' | 'collocation' | 'related'
  created_at: string
}

// === USER LEARNING ANALYTICS ===
export interface vocabulary_analytics {
  id: string
  vocabulary_item_id: string
  mastery_score: number // 0-100
  last_reviewed_at?: string
  created_at: string
  updated_at: string
}

// === ERROR TRACKING ===
export interface vocabulary_question_history {
  id: string
  vocabulary_item_id: string
  question_id: string
}

// === EXAMPLE DATA STRUCTURE ===
// {
//   "vocabulary_item": {
//     "id": "vocab_001",
//     "item_type": "phrase",
//     "content": "break the ice",
//     "pronunciation": "/breɪk ðə aɪs/",
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
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],

//   "examples": [
//     {
//       "id": "ex_001",
//       "definition_id": "def_001",
//       "sentence": "He told a joke to break the ice at the meeting.",
//       "translation": "Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng awkward trong cuộc họp.",
//       "created_at": "2025-10-01T10:30:00Z"
//     },
//     {
//       "id": "ex_002",
//       "definition_id": "def_001",
//       "sentence": "Let's play a game to break the ice.",
//       "translation": "Hãy chơi một trò chơi để làm cho không khí thoải mái hơn.",
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
// === VOCABULARY RELATIONS EXAMPLE ===
// {
//   "vocabulary_relation": [
//     {
//       "id": "rel_001",
//       "vocabulary_item_id": "vocab_001",
//       "related_item_id": "vocab_045",
//       "relation_type": "synonym",
//       "created_at": "2025-10-01T10:35:00Z"
//     },
//     {
//       "id": "rel_002",
//       "vocabulary_item_id": "vocab_001",
//       "related_item_id": "vocab_078",
//       "relation_type": "related",
//       "created_at": "2025-10-01T10:36:00Z"
//     }
//   ]
// }
// === VOCABULARY ANALYTICS EXAMPLE ===
// {
//   "vocabulary_analytics": {
//     "id": "analytics_001",
//     "vocabulary_item_id": "vocab_001",
//     "mastery_score": 75,
//     "last_reviewed_at": "2025-10-13T08:20:00Z",
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-13T08:20:00Z"
//   }
// }
// === VOCABULARY QUESTION HISTORY EXAMPLE ===
// {
//   "vocabulary_question_history": [
//     {
//       "id": "history_001",
//       "vocabulary_item_id": "vocab_001",
//       "question_id": "quiz_045"
//     },
//     {
//       "id": "history_002",
//       "vocabulary_item_id": "vocab_001",
//       "question_id": "quiz_128"
//     },
//     {
//       "id": "history_003",
//       "vocabulary_item_id": "vocab_001",
//       "question_id": "quiz_256"
//     }
//   ]
// }
