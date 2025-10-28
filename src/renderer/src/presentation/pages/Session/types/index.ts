// === SESSION TYPES ===
export interface Session {
  id: string
  title: string
  question_ids: string[]
  created_at: string
  expires_at?: string
  difficulty_level: number
}

export interface base_question {
  id: string
  question_type:
    | 'lexical_fix'
    | 'grammar_transformation'
    | 'sentence_puzzle'
    | 'translate'
    | 'reverse_translation'
    | 'gap_fill'
    | 'choice_one'
    | 'choice_multi'
    | 'matching'
    | 'true_false'
  context?: string
  difficulty_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  vocabulary_item_ids?: string[]
  grammar_points?: string[]
  created_at: string
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
  grammar_focus:
    | 'passive'
    | 'active'
    | 'tense_change'
    | 'conditional'
    | 'reported_speech'
    | 'question_form'
    | 'negative_form'
    | 'other'
  correct_answer: string
  alternative_answers?: string[]
  hint?: string
  explanation?: string
  must_use_words?: string[]
  word_limit?: number
}

export interface sentence_puzzle_question extends base_question {
  question_type: 'sentence_puzzle'
  scrambled_items: string[]
  correct_sentence: string
  correct_order?: number[]
  hint?: string
  language_code?: string
  translation?: string
}

export interface translate_question extends base_question {
  question_type: 'translate'
  source_sentence: string
  source_language: string
  correct_translation: string
  alternative_translations?: string[]
  hint?: string
  key_vocabulary?: string[]
}

export interface reverse_translation_question extends base_question {
  question_type: 'reverse_translation'
  english_sentence: string
  target_language: string
  correct_translation: string
  alternative_translations?: string[]
  hint?: string
  key_grammar_points?: string[]
}

export interface gap_fill_question extends base_question {
  question_type: 'gap_fill'
  sentence_with_gaps: string
  gaps: Array<{
    position: number
    correct_answer: string
    alternative_answers?: string[]
  }>
  hint?: string
  word_bank?: string[]
}

export interface choice_one_question extends base_question {
  question_type: 'choice_one'
  question_text: string
  options: Array<{
    id: string
    text: string
  }>
  correct_option_id: string
  hint?: string
  explanation?: string
}

export interface choice_multi_question extends base_question {
  question_type: 'choice_multi'
  question_text: string
  options: Array<{
    id: string
    text: string
  }>
  correct_option_ids: string[]
  min_selections?: number
  max_selections?: number
  hint?: string
  explanation?: string
}

export interface matching_question extends base_question {
  question_type: 'matching'
  instruction: string
  left_items: Array<{
    id: string
    text: string
  }>
  right_items: Array<{
    id: string
    text: string
  }>
  correct_matches: Array<{
    left_id: string
    right_id: string
  }>
  hint?: string
  match_type: 'word_definition' | 'word_synonym' | 'word_antonym' | 'word_translation' | 'other'
}

export interface true_false_question extends base_question {
  question_type: 'true_false'
  statement: string
  correct_answer: boolean
  hint?: string
  explanation?: string
  grammar_focus: string
}

export type Question =
  | lexical_fix_question
  | grammar_transformation_question
  | sentence_puzzle_question
  | translate_question
  | reverse_translation_question
  | gap_fill_question
  | choice_one_question
  | choice_multi_question
  | matching_question
  | true_false_question

export interface question_answer {
  id: string
  question_id: string
  user_answer: string
  is_correct: boolean
  created_at: string
}
