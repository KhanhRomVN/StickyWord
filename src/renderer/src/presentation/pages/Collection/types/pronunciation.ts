// === PRONUNCIATION CORE ===
export interface pronunciation_item {
  id: string
  content: string
  pronunciation: string
  ipa_notation: string

  created_at: string
  updated_at: string
}

// === PRONUNCIATION AUDIO ===
export interface pronunciation_audio {
  id: string
  pronunciation_item_id: string

  audio_url: string
  audio_duration_seconds: number
  audio_speed: 'slow' | 'normal' | 'fast'
  speaker_accent?: 'american' | 'british' | 'australian' | 'indian' | 'other'

  created_at: string
}

// === PRONUNCIATION GUIDE ===
export interface pronunciation_guide {
  id: string
  pronunciation_item_id: string

  description: string
  tips: string[] // Mẹo phát âm
  common_mistakes: string[]
  mouth_position?: string // Vị trí miệng
  tongue_position?: string // Vị trí lưỡi

  created_at: string
}

// === PRONUNCIATION BREAKDOWN ===
export interface phoneme_breakdown {
  id: string
  pronunciation_item_id: string

  phoneme: string // Âm thanh cơ bản (VD: /ɪ/, /ə/, /ŋ/)
  description: string // Mô tả cách phát âm
  mouth_shape: string // Hình dạng miệng
  air_flow: string // Cách thở

  position_in_word: number // Vị trí trong từ (0-based index)

  created_at: string
}

// === PRONUNCIATION METADATA ===
export interface pronunciation_metadata {
  id: string
  pronunciation_item_id: string

  difficulty_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  frequency_rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

  category: string // vowel, consonant, consonant_cluster, stress_pattern
  tags: string[] // ["common", "tricky", "american", "british"]

  is_active: boolean

  created_at: string
  updated_at: string
}

// === PRONUNCIATION LEARNING ANALYTICS ===
export interface pronunciation_analytics {
  id: string
  pronunciation_item_id: string

  mastery_score: number // 0-100
  times_practiced: number
  times_correct: number
  times_incorrect: number

  first_practiced_at: string
  last_practiced_at?: string
  last_seen_at?: string

  created_at: string
  updated_at: string
}

// === PRONUNCIATION RECOMMENDATION ENGINE ===
export interface pronunciation_recommendation {
  id: string
  pronunciation_item_id: string

  priority_score: number // 0-100: độ ưu tiên hiển thị
  retention_rate: number // 0-1: khả năng nhớ dự đoán

  next_review_date?: string
  review_interval_days: number
  ease_factor: number // SuperMemo algorithm

  created_at: string
  updated_at: string
}

// === PRONUNCIATION LEARNING CONTEXT ===
export interface pronunciation_learning_context {
  id: string
  pronunciation_item_id: string
  question_id?: string

  user_audio_url?: string // URL tới file âm thanh người dùng ghi
  was_correct: boolean
  accuracy_score?: number // 0-100: độ chính xác phát âm
  feedback?: string
  context_type: 'listening' | 'speaking' | 'dictation'

  timestamp: string
  created_at: string
}

// === PRONUNCIATION SOURCE TRACKING ===
export interface pronunciation_source {
  id: string
  pronunciation_item_id: string

  source_type: 'user_error' | 'imported' | 'ai_suggested' | 'manual_add'
  source_reference?: string // question_id hoặc import file name

  added_at: string
  created_at: string
}

// === EXAMPLE DATA STRUCTURE ===
// {
//   "pronunciation_item": {
//     "id": "pron_001",
//     "content": "perseverance",
//     "pronunciation": "pur-suh-veer-uhns",
//     "ipa_notation": "/ˌpɜːrsəˈvɪrəns/",
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },

//   "pronunciation_audio": [
//     {
//       "id": "audio_001",
//       "pronunciation_item_id": "pron_001",
//       "audio_url": "https://example.com/audio/perseverance-slow.mp3",
//       "audio_duration_seconds": 2.5,
//       "audio_speed": "slow",
//       "speaker_accent": "american",
//       "created_at": "2025-10-01T10:30:00Z"
//     },
//     {
//       "id": "audio_002",
//       "pronunciation_item_id": "pron_001",
//       "audio_url": "https://example.com/audio/perseverance-normal.mp3",
//       "audio_duration_seconds": 1.8,
//       "audio_speed": "normal",
//       "speaker_accent": "british",
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],

//   "pronunciation_guide": {
//     "id": "guide_001",
//     "pronunciation_item_id": "pron_001",
//     "description": "A 5-syllable word with emphasis on the second syllable",
//     "tips": [
//       "Chú ý trọng âm trên âm tiết thứ 2",
//       "Âm /ə/ xuất hiện ở các âm tiết yếu",
//       "Kết thúc bằng âm /ns/"
//     ],
//     "common_mistakes": [
//       "Nhầm trọng âm sang âm tiết thứ 1",
//       "Phát âm /ɪ/ thành /i:/"
//     ],
//     "mouth_position": "Miệng mở vừa phải",
//     "tongue_position": "Lưỡi ở giữa",
//     "created_at": "2025-10-01T10:30:00Z"
//   },

//   "phoneme_breakdown": [
//     {
//       "id": "phoneme_001",
//       "pronunciation_item_id": "pron_001",
//       "phoneme": "/pɜː/",
//       "description": "Phát âm như 'pur' trong tiếng Anh",
//       "mouth_shape": "Môi tính hình tròn nhỏ",
//       "air_flow": "Không khí phát ra từ miệng",
//       "position_in_word": 0,
//       "created_at": "2025-10-01T10:30:00Z"
//     }
//   ],

//   "pronunciation_metadata": {
//     "id": "pmeta_001",
//     "pronunciation_item_id": "pron_001",
//     "difficulty_level": 7,
//     "frequency_rank": 6,
//     "category": "consonant_cluster",
//     "tags": ["tricky", "common", "american"],
//     "is_active": true,
//     "created_at": "2025-10-01T10:30:00Z",
//     "updated_at": "2025-10-01T10:30:00Z"
//   },

//   "pronunciation_analytics": {
//     "id": "pana_001",
//     "pronunciation_item_id": "pron_001",
//     "mastery_score": 65,
//     "times_practiced": 8,
//     "times_correct": 5,
//     "times_incorrect": 3,
//     "first_practiced_at": "2025-09-15T14:20:00Z",
//     "last_practiced_at": "2025-10-05T09:15:00Z",
//     "last_seen_at": "2025-10-07T16:45:00Z",
//     "created_at": "2025-09-15T14:20:00Z",
//     "updated_at": "2025-10-07T16:45:00Z"
//   }
// }
