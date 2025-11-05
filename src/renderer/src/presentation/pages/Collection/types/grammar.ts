// === CORE GRAMMAR ===
export interface grammar_items {
  id: string
  item_type: 'tense' | 'structure' | 'rule' | 'pattern'
  title: string // e.g., "Present Perfect", "Conditional Sentences Type 2"
  difficulty_level?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  frequency_rank?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  category?: string // tenses, conditionals, passive, reported_speech, modals
  tags?: string[] // ["basic", "intermediate", "advanced", "formal", "spoken"]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// === GRAMMAR RULES & EXPLANATIONS ===
export interface grammar_rules {
  id: string
  grammar_item_id: string
  rule_description: string // Description of the rule
  translation?: string // Vietnamese translation
  formula?: string // e.g., "Subject + have/has + past participle"
  usage_context?: string // When to use this grammar
  notes?: string // Additional notes, exceptions
  created_at: string
}

export interface grammar_examples {
  id: string
  grammar_rule_id: string
  sentence: string
  translation?: string
  is_correct: boolean // true for correct examples, false for common mistakes
  explanation?: string // Why this is correct/incorrect
  created_at: string
}

// === COMMON MISTAKES ===
export interface grammar_common_mistakes {
  id: string
  grammar_item_id: string
  incorrect_example: string
  correct_example: string
  explanation: string
  translation?: string
  created_at: string
}

// === RELATIONSHIPS ===
export interface grammar_relationships {
  id: string
  grammar_item_id: string
  related_item_id: string
  relation_type: 'prerequisite' | 'related' | 'contrast' | 'progression'
  created_at: string
}

// === USER LEARNING ANALYTICS ===
export interface grammar_analytics {
  id: string
  grammar_item_id: string
  mastery_score: number // 0-100
  next_review?: string
  streak?: number
  last_reviewed?: string
  common_errors?: string[]
  created_at: string
  updated_at: string
}

// === ERROR TRACKING ===
export interface grammar_question_history {
  id: string
  grammar_item_id: string
  question_id: string
}

// === EXAMPLE DATA STRUCTURE ===
// Example 1: Present Perfect Tense
// {
//   "grammar_items": {
//     "id": "grammar_001",
//     "item_type": "tense",
//     "title": "Present Perfect",
//     "difficulty_level": 5,
//     "frequency_rank": 9,
//     "category": "tenses",
//     "tags": ["basic", "intermediate", "past_connection"],
//     "metadata": {},
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },
//
//   "grammar_rules": [
//     {
//       "id": "rule_001",
//       "grammar_item_id": "grammar_001",
//       "rule_description": "Used for actions that happened at an unspecified time before now",
//       "translation": "Dùng cho hành động đã xảy ra tại thời điểm không xác định trước bây giờ",
//       "formula": "Subject + have/has + past participle",
//       "usage_context": "Experience, completed actions with present relevance, actions that started in the past and continue to present",
//       "notes": "Often used with: ever, never, already, yet, just, since, for",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
//
//   "grammar_examples": [
//     {
//       "id": "ex_001a",
//       "grammar_rule_id": "rule_001",
//       "sentence": "I have visited Paris three times.",
//       "translation": "Tôi đã đến Paris ba lần.",
//       "is_correct": true,
//       "explanation": "Experience - no specific time mentioned",
//       "created_at": "2025-10-01T10:30:00Z"
//     },
//     {
//       "id": "ex_001b",
//       "grammar_rule_id": "rule_001",
//       "sentence": "She has just finished her homework.",
//       "translation": "Cô ấy vừa mới hoàn thành bài tập.",
//       "is_correct": true,
//       "explanation": "Recent completed action with 'just'",
//       "created_at": "2025-10-01T10:30:00Z"
//     },
//     {
//       "id": "ex_001c",
//       "grammar_rule_id": "rule_001",
//       "sentence": "I have visited Paris yesterday.",
//       "translation": "Tôi đã đến Paris hôm qua.",
//       "is_correct": false,
//       "explanation": "Cannot use Present Perfect with specific past time (yesterday). Use Simple Past instead.",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
//
//   "grammar_common_mistakes": [
//     {
//       "id": "mistake_001",
//       "grammar_item_id": "grammar_001",
//       "incorrect_example": "I have seen him yesterday.",
//       "correct_example": "I saw him yesterday.",
//       "explanation": "Don't use Present Perfect with specific past time expressions",
//       "translation": "Không dùng Present Perfect với thời gian quá khứ cụ thể",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],
//
//   "grammar_analytics": {
//     "id": "analytics_001",
//     "grammar_item_id": "grammar_001",
//     "mastery_score": 70,
//     "last_reviewed_at": "2025-10-13T08:20:00Z",
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-13T08:20:00Z"
//   }
// }
//
// Example 2: Conditional Sentences Type 2
// {
//   "grammar_items": {
//     "id": "grammar_002",
//     "item_type": "structure",
//     "title": "Conditional Sentences Type 2",
//     "difficulty_level": 6,
//     "frequency_rank": 7,
//     "category": "conditionals",
//     "tags": ["intermediate", "hypothetical", "unreal_present"],
//     "metadata": {},
//     "created_at": "2025-10-13T10:00:00Z",
//     "updated_at": "2025-10-13T10:00:00Z"
//   },
//
//   "grammar_rules": [
//     {
//       "id": "rule_002",
//       "grammar_item_id": "grammar_002",
//       "rule_description": "Used for unreal or unlikely situations in the present or future",
//       "translation": "Dùng cho tình huống không có thật hoặc không thể xảy ra ở hiện tại hoặc tương lai",
//       "formula": "If + subject + past simple, subject + would/could/might + base verb",
//       "usage_context": "Hypothetical situations, giving advice, imagining different present",
//       "notes": "Use 'were' for all persons with 'be' verb (If I were you...)",
//       "created_at": "2025-10-13T10:00:00Z"
//     }
//   ],
//
//   "grammar_examples": [
//     {
//       "id": "ex_002a",
//       "grammar_rule_id": "rule_002",
//       "sentence": "If I had a million dollars, I would travel the world.",
//       "translation": "Nếu tôi có một triệu đô la, tôi sẽ đi du lịch vòng quanh thế giới.",
//       "is_correct": true,
//       "explanation": "Hypothetical situation - I don't have a million dollars",
//       "created_at": "2025-10-13T10:00:00Z"
//     },
//     {
//       "id": "ex_002b",
//       "grammar_rule_id": "rule_002",
//       "sentence": "If I were you, I would accept the job offer.",
//       "translation": "Nếu tôi là bạn, tôi sẽ chấp nhận lời đề nghị công việc.",
//       "is_correct": true,
//       "explanation": "Giving advice using 'were' (not 'was')",
//       "created_at": "2025-10-13T10:00:00Z"
//     }
//   ],
//
//   "grammar_common_mistakes": [
//     {
//       "id": "mistake_002",
//       "grammar_item_id": "grammar_002",
//       "incorrect_example": "If I would have time, I would help you.",
//       "correct_example": "If I had time, I would help you.",
//       "explanation": "Don't use 'would' in the if-clause of Type 2 conditionals",
//       "translation": "Không dùng 'would' trong mệnh đề if của câu điều kiện loại 2",
//       "created_at": "2025-10-13T10:00:00Z"
//     }
//   ],
//
//   "grammar_analytics": {
//     "id": "analytics_002",
//     "grammar_item_id": "grammar_002",
//     "mastery_score": 65,
//     "last_reviewed_at": "2025-10-13T14:30:00Z",
//     "created_at": "2025-10-13T10:00:00Z",
//     "updated_at": "2025-10-13T14:30:00Z"
//   }
// }
