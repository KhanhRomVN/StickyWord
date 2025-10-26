import { Question } from '../types'

export const FAKE_QUESTIONS: Question[] = [
  // Lexical Fix Questions
  {
    id: 'q_lex_001',
    question_type: 'lexical_fix',
    incorrect_sentence: 'I am very interesting in learning English.',
    incorrect_word: 'interesting',
    word_position: 3,
    correct_word: 'interested',
    correct_sentence: 'I am very interested in learning English.',
    hint: 'Think about adjectives ending in -ed vs -ing',
    explanation:
      'Use "interested" to describe a person\'s feeling, "interesting" to describe something that causes interest.',
    error_type: 'wrong_form',
    difficulty_level: 3,
    vocabulary_item_ids: ['vocab_001'],
    grammar_points: [],
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z'
  },
  // Grammar Transformation Questions
  {
    id: 'q_gram_001',
    question_type: 'grammar_transformation',
    original_sentence: 'They built this house in 1990.',
    transformation_instruction: 'Change to passive voice',
    grammar_focus: 'passive',
    correct_answer: 'This house was built in 1990.',
    alternative_answers: ['This house was built by them in 1990.'],
    hint: 'Move the object to the subject position',
    explanation:
      'In passive voice, the object becomes the subject, and we use "be + past participle".',
    difficulty_level: 5,
    vocabulary_item_ids: [],
    grammar_points: ['passive_voice'],
    created_at: '2025-01-03T10:00:00Z',
    updated_at: '2025-01-03T10:00:00Z'
  },

  // Sentence Puzzle Questions
  {
    id: 'q_puzzle_001',
    question_type: 'sentence_puzzle',
    scrambled_items: ['always', 'early', 'wakes', 'she', 'up'],
    correct_sentence: 'She always wakes up early.',
    correct_order: [3, 0, 2, 4, 1],
    hint: 'Adverbs of frequency go before the main verb',
    language_code: 'en',
    difficulty_level: 4,
    vocabulary_item_ids: [],
    grammar_points: ['adverb_placement'],
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z'
  },

  // Translate Questions
  {
    id: 'q_trans_001',
    question_type: 'translate',
    source_sentence: 'Tôi đang học tiếng Anh.',
    source_language: 'vi',
    correct_translation: 'I am learning English.',
    alternative_translations: ['I am studying English.', "I'm learning English."],
    hint: 'Use present continuous for ongoing actions',
    difficulty_level: 3,
    vocabulary_item_ids: [],
    grammar_points: [],
    created_at: '2025-01-07T10:00:00Z',
    updated_at: '2025-01-07T10:00:00Z'
  },

  // Reverse Translation Questions
  {
    id: 'q_rev_001',
    question_type: 'reverse_translation',
    english_sentence: 'I have been living here for five years.',
    target_language: 'vi',
    correct_translation: 'Tôi đã sống ở đây được năm năm.',
    alternative_translations: ['Tôi đã ở đây được 5 năm.', 'Tôi sống ở đây được năm năm rồi.'],
    hint: 'Focus on the duration aspect',
    key_grammar_points: ['present_perfect_continuous'],
    difficulty_level: 6,
    vocabulary_item_ids: [],
    grammar_points: [],
    created_at: '2025-01-09T10:00:00Z',
    updated_at: '2025-01-09T10:00:00Z'
  },

  // Gap Fill Questions
  {
    id: 'q_gap_001',
    question_type: 'gap_fill',
    sentence_with_gaps: 'She _____ to the market every Sunday and _____ fresh vegetables.',
    gaps: [
      {
        position: 0,
        correct_answer: 'goes',
        alternative_answers: []
      },
      {
        position: 1,
        correct_answer: 'buys',
        alternative_answers: ['purchases']
      }
    ],
    context: 'Complete the sentence with appropriate verbs',
    hint: 'Use simple present tense',
    word_bank: ['go', 'goes', 'buy', 'buys', 'went', 'bought'],
    difficulty_level: 3,
    vocabulary_item_ids: ['vocab_010', 'vocab_011'],
    grammar_points: ['simple_present'],
    created_at: '2025-01-11T10:00:00Z',
    updated_at: '2025-01-11T10:00:00Z'
  },

  // Choice One Questions
  {
    id: 'q_choice_001',
    question_type: 'choice_one',
    question_text: 'Which word means "very tired"?',
    options: [
      { id: 'opt_001', text: 'exhausted' },
      { id: 'opt_002', text: 'excited' },
      { id: 'opt_003', text: 'energetic' },
      { id: 'opt_004', text: 'relaxed' }
    ],
    correct_option_id: 'opt_001',
    context: 'Choose the synonym',
    hint: 'Think about extreme tiredness',
    explanation: '"Exhausted" means extremely tired or worn out.',
    difficulty_level: 4,
    vocabulary_item_ids: ['vocab_020'],
    grammar_points: [],
    created_at: '2025-01-13T10:00:00Z',
    updated_at: '2025-01-13T10:00:00Z'
  },

  // Choice Multi Questions
  {
    id: 'q_multi_001',
    question_type: 'choice_multi',
    question_text: 'Which of the following are modal verbs?',
    options: [
      { id: 'opt_m01', text: 'can' },
      { id: 'opt_m02', text: 'should' },
      { id: 'opt_m03', text: 'want' },
      { id: 'opt_m04', text: 'must' },
      { id: 'opt_m05', text: 'like' }
    ],
    correct_option_ids: ['opt_m01', 'opt_m02', 'opt_m04'],
    min_selections: 2,
    max_selections: 4,
    context: 'Select all modal verbs from the list',
    hint: 'Modal verbs express possibility, necessity, or permission',
    explanation: 'Modal verbs include can, could, may, might, must, shall, should, will, would.',
    difficulty_level: 5,
    vocabulary_item_ids: [],
    grammar_points: ['modal_verbs'],
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },

  // Matching Questions
  {
    id: 'q_match_001',
    question_type: 'matching',
    instruction: 'Match each word with its definition',
    left_items: [
      { id: 'left_01', text: 'enormous' },
      { id: 'left_02', text: 'tiny' },
      { id: 'left_03', text: 'ancient' },
      { id: 'left_04', text: 'modern' }
    ],
    right_items: [
      { id: 'right_01', text: 'very small' },
      { id: 'right_02', text: 'very large' },
      { id: 'right_03', text: 'very old' },
      { id: 'right_04', text: 'recent or new' }
    ],
    correct_matches: [
      { left_id: 'left_01', right_id: 'right_02' },
      { left_id: 'left_02', right_id: 'right_01' },
      { left_id: 'left_03', right_id: 'right_03' },
      { left_id: 'left_04', right_id: 'right_04' }
    ],
    hint: 'Think about size and time-related adjectives',
    match_type: 'word_definition',
    difficulty_level: 4,
    vocabulary_item_ids: ['vocab_030', 'vocab_031', 'vocab_032', 'vocab_033'],
    grammar_points: [],
    created_at: '2025-01-17T10:00:00Z',
    updated_at: '2025-01-17T10:00:00Z'
  },

  // True/False Questions
  {
    id: 'q_tf_001',
    question_type: 'true_false',
    statement: 'The present perfect tense is formed with "have/has + past participle".',
    correct_answer: true,
    context: 'Grammar statement about present perfect tense',
    hint: 'Think about the structure of present perfect',
    explanation:
      'The present perfect is indeed formed using have/has followed by the past participle of the main verb.',
    grammar_focus: 'present_perfect',
    difficulty_level: 3,
    vocabulary_item_ids: [],
    grammar_points: ['present_perfect'],
    created_at: '2025-01-19T10:00:00Z',
    updated_at: '2025-01-19T10:00:00Z'
  }
]
