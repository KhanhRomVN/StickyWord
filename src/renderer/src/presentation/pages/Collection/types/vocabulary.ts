// === CORE VOCABULARY ===
export interface vocabulary_item {
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
}

// === DEFINITIONS & EXAMPLES ===
export interface definition {
  id: string
  vocabulary_item_id: string
  meaning: string
  translation?: string
  // Classification - moved from vocabulary_item
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
export interface example {
  id: string
  definition_id: string
  sentence: string
  translation?: string
  created_at: string
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
// Example 1: Phrase (idiom)
// {
//   "vocabulary_item": {
//     "id": "vocab_001",
//     "item_type": "phrase",
//     "content": "break the ice",
//     "pronunciation": "/breɪk ðə aɪs/",
//     "difficulty_level": 5,
//     "frequency_rank": 7,
//     "category": "daily",
//     "tags": ["informal", "social", "communication", "american", "british"],
//     "metadata": {},
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },
//
//   "definitions": [
//     {
//       "id": "def_001",
//       "vocabulary_item_id": "vocab_001",
//       "meaning": "To make people feel more relaxed in a social situation",
//       "translation": "Phá vỡ sự im lặng awkward, làm cho không khí thoải mái hơn",
//       "phrase_type": "idiom",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
//
//   "examples": [
//     {
//       "id": "ex_001",
//       "definition_id": "def_001",
//       "sentence": "He told a joke to break the ice at the meeting.",
//       "translation": "Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng awkward.",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
//
//   "vocabulary_analytics": {
//     "id": "analytics_001",
//     "vocabulary_item_id": "vocab_001",
//     "mastery_score": 75,
//     "last_reviewed_at": "2025-10-13T08:20:00Z",
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-13T08:20:00Z"
//   }
// }
//
// Example 2: Word with multiple meanings (different word types)
// {
//   "vocabulary_item": {
//     "id": "vocab_002",
//     "item_type": "word",
//     "content": "play",
//     "pronunciation": "/pleɪ/",
//     "difficulty_level": 3,
//     "frequency_rank": 9,
//     "category": "daily",
//     "tags": ["common", "basic"],
//     "metadata": {},
//     "created_at": "2025-10-13T10:00:00Z",
//     "updated_at": "2025-10-13T10:00:00Z"
//   },
//
//   "definitions": [
//     {
//       "id": "def_002a",
//       "vocabulary_item_id": "vocab_002",
//       "meaning": "A dramatic work for the stage or to be broadcast",
//       "translation": "Một vở kịch để biểu diễn trên sân khấu hoặc phát sóng",
//       "word_type": "noun",
//       "created_at": "2025-10-13T10:00:00Z"
//     },
//     {
//       "id": "def_002b",
//       "vocabulary_item_id": "vocab_002",
//       "meaning": "To engage in activity for enjoyment and recreation",
//       "translation": "Tham gia vào hoạt động để giải trí và vui chơi",
//       "word_type": "verb",
//       "created_at": "2025-10-13T10:00:00Z"
//     },
//     {
//       "id": "def_002c",
//       "vocabulary_item_id": "vocab_002",
//       "meaning": "The activity of taking part in a sport or game",
//       "translation": "Hoạt động tham gia vào một môn thể thao hoặc trò chơi",
//       "word_type": "noun",
//       "created_at": "2025-10-13T10:00:00Z"
//     }
//   ],
//
//   "examples": [
//     {
//       "id": "ex_002a",
//       "definition_id": "def_002a",
//       "sentence": "We watched a play at the theater last night.",
//       "translation": "Chúng tôi đã xem một vở kịch ở rạp hát tối qua.",
//       "created_at": "2025-10-13T10:00:00Z"
//     },
//     {
//       "id": "ex_002b",
//       "definition_id": "def_002b",
//       "sentence": "Children love to play in the park.",
//       "translation": "Trẻ em thích chơi ở công viên.",
//       "created_at": "2025-10-13T10:00:00Z"
//     },
//     {
//       "id": "ex_002c",
//       "definition_id": "def_002c",
//       "sentence": "That was an amazing play in the football match!",
//       "translation": "Đó là một pha bóng tuyệt vời trong trận đấu bóng đá!",
//       "created_at": "2025-10-13T10:00:00Z"
//     }
//   ],
//
//   "vocabulary_analytics": {
//     "id": "analytics_002",
//     "vocabulary_item_id": "vocab_002",
//     "mastery_score": 85,
//     "last_reviewed_at": "2025-10-13T14:30:00Z",
//     "created_at": "2025-10-13T10:00:00Z",
//     "updated_at": "2025-10-13T14:30:00Z"
//   }
// }
