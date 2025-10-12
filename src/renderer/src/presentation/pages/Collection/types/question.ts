export interface base_question {
  id: string
  question_type: 'lexical_fix' | 'grammar_transformation' | 'sentence_puzzle' | 'translate' | 'reverse_translation' | 'dictation'
  difficulty_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  estimated_time_seconds: number
  vocabulary_item_ids: string[]
  grammar_points?: string[]
  created_at: string
  updated_at: string
}

export interface lexical_fix_question extends base_question {
  question_type: 'lexical_fix'
  incorrect_sentence: string
  incorrect_word: string
  word_position?: number
  correct_word: string
  correct_sentence: string
  hint?: string
  explanation?: string
  error_type: 'wrong_word' | 'wrong_form' | 'wrong_collocation' | 'confused_word'
}

export interface grammar_transformation_question extends base_question {
  question_type: 'grammar_transformation'
  original_sentence: string
  transformation_instruction: string
  grammar_focus: 'passive' | 'active' | 'tense_change' | 'conditional' | 'reported_speech' | 'question_form' | 'negative_form' | 'other'
  correct_answer: string
  alternative_answers?: string[]
  hint?: string
  explanation?: string
  must_use_words?: string[]
  word_limit?: number
}

export interface sentence_puzzle_question extends base_question {
  question_type: 'sentence_puzzle'
  puzzle_type: 'word_order' | 'phrase_order' | 'character_scramble'
  scrambled_items: string[]
  correct_sentence: string
  correct_order?: number[]
  context?: string
  hint?: string
  translation?: string
  language_code?: string
}

export interface translate_question extends base_question {
  question_type: 'translate'
  source_sentence: string
  source_language: string
  correct_translation: string
  alternative_translations?: string[]
  context?: string
  hint?: string
  key_vocabulary?: string[]
}

export interface reverse_translation_question extends base_question {
  question_type: 'reverse_translation'
  english_sentence: string
  target_language: string
  correct_translation: string
  alternative_translations?: string[]
  context?: string
  hint?: string
  key_grammar_points?: string[]
}

export interface dictation_question extends base_question {
  question_type: 'dictation'
  audio_url: string
  audio_duration_seconds: number
  audio_speed: 'slow' | 'normal' | 'fast'
  speaker_accent?: 'american' | 'british' | 'australian' | 'other'
  correct_transcription: string
  can_replay: boolean
  max_replays?: number
  hint?: string
  has_background_noise?: boolean
  multiple_speakers?: boolean
}

export type Question = 
  | lexical_fix_question 
  | grammar_transformation_question 
  | sentence_puzzle_question 
  | translate_question 
  | reverse_translation_question 
  | dictation_question

export interface question_answer {
  id: string
  question_id: string
  user_id: string
  user_answer: string
  is_correct: boolean
  similarity_score?: number
  detected_errors?: Array<{
    error_type: string
    description: string
    position?: number
  }>
  time_taken_seconds: number
  answered_at: string
  ai_feedback?: string
  created_at: string
}

export interface question_bank {
  id: string
  name: string
  description?: string
  question_ids: string[]
  category: string
  tags: string[]
  difficulty_range: [number, number]
  is_public: boolean
  created_by?: string
  created_at: string
  updated_at: string
}