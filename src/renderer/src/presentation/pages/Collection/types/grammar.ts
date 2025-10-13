// === GRAMMAR CORE ===
export interface grammar_item {
  id: string
  content: string
  grammar_type:
    | 'tense'
    | 'conditional'
    | 'passive'
    | 'modal'
    | 'article'
    | 'preposition_usage'
    | 'sentence_structure'

  created_at: string
  updated_at: string
}

// === GRAMMAR DEFINITIONS & EXAMPLES ===
export interface grammar_definition {
  id: string
  grammar_item_id: string

  description: string
  explanation: string
  structure?: string
  translation?: string
  language_code: string // 'vi', 'ja', 'ko', 'zh', 'es', 'fr', etc.

  created_at: string
}

export interface grammar_example {
  id: string
  grammar_definition_id: string

  sentence: string
  translation?: string
  usage_note?: string
  language_code: string

  created_at: string
}

// === GRAMMAR MISTAKES ===
export interface grammar_mistake {
  id: string
  grammar_item_id: string

  incorrect_example: string
  correct_example: string
  explanation: string

  created_at: string
}

// === GRAMMAR METADATA ===
export interface grammar_metadata {
  id: string
  grammar_item_id: string

  difficulty_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  frequency_rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

  category: string // basic, intermediate, advanced
  tags: string[] // ["beginner", "common", "formal", "spoken"]

  is_active: boolean

  created_at: string
  updated_at: string
}

// === GRAMMAR LEARNING ANALYTICS ===
export interface grammar_analytics {
  id: string
  grammar_item_id: string

  mastery_score: number // 0-100
  times_seen: number
  times_correct: number
  times_incorrect: number

  first_learned_at: string
  last_reviewed_at?: string
  last_seen_at?: string

  created_at: string
  updated_at: string
}

// === GRAMMAR RECOMMENDATION ENGINE ===
export interface grammar_recommendation {
  id: string
  grammar_item_id: string

  priority_score: number // 0-100: độ ưu tiên hiển thị
  retention_rate: number // 0-1: khả năng nhớ dự đoán

  next_review_date?: string
  review_interval_days: number
  ease_factor: number // SuperMemo algorithm

  created_at: string
  updated_at: string
}

// === GRAMMAR LEARNING CONTEXT ===
export interface grammar_learning_context {
  id: string
  grammar_item_id: string
  question_id?: string

  sentence: string
  was_correct: boolean
  user_answer?: string
  context_type: 'grammar_exercise' | 'writing' | 'reading'

  timestamp: string
  created_at: string
}

// === GRAMMAR SOURCE TRACKING ===
export interface grammar_source {
  id: string
  grammar_item_id: string

  source_type: 'user_error' | 'imported' | 'ai_suggested' | 'manual_add'
  source_reference?: string // question_id hoặc import file name

  added_at: string
  created_at: string
}

// === EXAMPLE DATA STRUCTURE ===
// {
//   "grammar_item": {
//     "id": "grammar_001",
//     "content": "Present Perfect Continuous",
//     "grammar_type": "tense",
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },

//   "grammar_definition": {
//     "id": "gdef_001",
//     "grammar_item_id": "grammar_001",
//     "description": "The Present Perfect Continuous tense",
//     "explanation": "Used to describe actions that started in the past and are still continuing or have just finished, emphasizing the duration of the activity.",
//     "structure": "Subject + have/has + been + verb-ing",
//     "translation": "Thì Hiện tại Hoàn thành Tiếp diễn dùng để diễn tả hành động bắt đầu trong quá khứ và vẫn đang tiếp diễn hoặc vừa mới kết thúc, nhấn mạnh vào khoảng thời gian của hành động.",
//     "language_code": "vi",
//     "created_at": "2025-10-01T10:30:00Z"
//   },

//   "grammar_examples": [
//     {
//       "id": "gex_001",
//       "grammar_definition_id": "gdef_001",
//       "sentence": "I have been studying English for 5 years.",
//       "translation": "Tôi đã học tiếng Anh được 5 năm rồi.",
//       "usage_note": "Hành động bắt đầu trong quá khứ và vẫn tiếp tục đến hiện tại",
//       "language_code": "vi",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],

//   "grammar_mistakes": [
//     {
//       "id": "gmis_001",
//       "grammar_item_id": "grammar_001",
//       "incorrect_example": "I am studying English for 5 years.",
//       "correct_example": "I have been studying English for 5 years.",
//       "explanation": "Sai thì - cần dùng Present Perfect Continuous để diễn tả hành động kéo dài từ quá khứ đến hiện tại",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],

//   "grammar_metadata": {
//     "id": "gmeta_001",
//     "grammar_item_id": "grammar_001",
//     "difficulty_level": 6,
//     "frequency_rank": 5,
//     "category": "intermediate",
//     "tags": ["common", "spoken", "formal"],
//     "is_active": true,
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },

//   "grammar_analytics": {
//     "id": "gana_001",
//     "grammar_item_id": "grammar_001",
//     "mastery_score": 72,
//     "times_seen": 15,
//     "times_correct": 11,
//     "times_incorrect": 4,
//     "first_learned_at": "2025-09-15T14:20:00Z",
//     "last_reviewed_at": "2025-10-05T09:15:00Z",
//     "last_seen_at": "2025-10-07T16:45:00Z",
//     "created_at": "2025-09-15T14:20:00Z",
//     "updated_at": "2025-10-07T16:45:00Z"
//   }
// }
