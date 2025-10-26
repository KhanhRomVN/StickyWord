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
    estimated_time_seconds: 45,
    vocabulary_item_ids: ['vocab_001'],
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z'
  },
  {
    id: 'q_lex_002',
    question_type: 'lexical_fix',
    incorrect_sentence: 'She made a big fault in the exam.',
    incorrect_word: 'fault',
    word_position: 3,
    correct_word: 'mistake',
    correct_sentence: 'She made a big mistake in the exam.',
    hint: 'What word commonly collocates with "make"?',
    explanation:
      'We "make mistakes", not "make faults". "Fault" is more about responsibility or blame.',
    error_type: 'wrong_collocation',
    difficulty_level: 4,
    estimated_time_seconds: 50,
    vocabulary_item_ids: ['vocab_002'],
    created_at: '2025-01-02T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z'
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
    estimated_time_seconds: 60,
    vocabulary_item_ids: [],
    grammar_points: ['passive_voice'],
    created_at: '2025-01-03T10:00:00Z',
    updated_at: '2025-01-03T10:00:00Z'
  },
  {
    id: 'q_gram_002',
    question_type: 'grammar_transformation',
    original_sentence: 'She said, "I am going to the store."',
    transformation_instruction: 'Change to reported speech',
    grammar_focus: 'reported_speech',
    correct_answer: 'She said that she was going to the store.',
    alternative_answers: ['She said she was going to the store.'],
    hint: 'Remember to backshift tenses',
    explanation: 'When reporting speech, we typically backshift tenses and change pronouns.',
    difficulty_level: 6,
    estimated_time_seconds: 70,
    vocabulary_item_ids: [],
    grammar_points: ['reported_speech'],
    created_at: '2025-01-04T10:00:00Z',
    updated_at: '2025-01-04T10:00:00Z'
  },

  // Sentence Puzzle Questions
  {
    id: 'q_puzzle_001',
    question_type: 'sentence_puzzle',
    puzzle_type: 'word_order',
    scrambled_items: ['always', 'early', 'wakes', 'she', 'up'],
    correct_sentence: 'She always wakes up early.',
    correct_order: [3, 0, 2, 4, 1],
    context: 'Adverb placement in present simple',
    hint: 'Adverbs of frequency go before the main verb',
    translation: 'Cô ấy luôn thức dậy sớm.',
    language_code: 'en',
    difficulty_level: 4,
    estimated_time_seconds: 55,
    vocabulary_item_ids: [],
    grammar_points: ['adverb_placement'],
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z'
  },
  {
    id: 'q_puzzle_002',
    question_type: 'sentence_puzzle',
    puzzle_type: 'phrase_order',
    scrambled_items: ['to the party', 'if I had known', 'I would have gone', 'you were coming'],
    correct_sentence: 'I would have gone to the party if I had known you were coming.',
    correct_order: [2, 0, 1, 3],
    context: 'Third conditional structure',
    hint: 'Main clause first, then if-clause',
    translation: 'Tôi đã đến bữa tiệc nếu tôi biết bạn sẽ đến.',
    language_code: 'en',
    difficulty_level: 7,
    estimated_time_seconds: 80,
    vocabulary_item_ids: [],
    grammar_points: ['conditional_type_3'],
    created_at: '2025-01-06T10:00:00Z',
    updated_at: '2025-01-06T10:00:00Z'
  },

  // Translate Questions
  {
    id: 'q_trans_001',
    question_type: 'translate',
    source_sentence: 'Tôi đang học tiếng Anh.',
    source_language: 'vi',
    correct_translation: 'I am learning English.',
    alternative_translations: ['I am studying English.', "I'm learning English."],
    context: 'Present continuous tense',
    hint: 'Use present continuous for ongoing actions',
    key_vocabulary: ['learning', 'English'],
    difficulty_level: 3,
    estimated_time_seconds: 45,
    vocabulary_item_ids: [],
    created_at: '2025-01-07T10:00:00Z',
    updated_at: '2025-01-07T10:00:00Z'
  },
  {
    id: 'q_trans_002',
    question_type: 'translate',
    source_sentence: 'Nếu trời mưa, tôi sẽ ở nhà.',
    source_language: 'vi',
    correct_translation: 'If it rains, I will stay at home.',
    alternative_translations: [
      "If it rains, I'll stay at home.",
      'I will stay at home if it rains.'
    ],
    context: 'First conditional',
    hint: 'Use simple present in if-clause, will in main clause',
    key_vocabulary: ['rain', 'stay at home'],
    difficulty_level: 5,
    estimated_time_seconds: 60,
    vocabulary_item_ids: [],
    grammar_points: ['conditional_type_1'],
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z'
  },

  // Reverse Translation Questions
  {
    id: 'q_rev_001',
    question_type: 'reverse_translation',
    english_sentence: 'I have been living here for five years.',
    target_language: 'vi',
    correct_translation: 'Tôi đã sống ở đây được năm năm.',
    alternative_translations: ['Tôi đã ở đây được 5 năm.', 'Tôi sống ở đây được năm năm rồi.'],
    context: 'Present perfect continuous with duration',
    hint: 'Focus on the duration aspect',
    key_grammar_points: ['present_perfect_continuous'],
    difficulty_level: 6,
    estimated_time_seconds: 65,
    vocabulary_item_ids: [],
    created_at: '2025-01-09T10:00:00Z',
    updated_at: '2025-01-09T10:00:00Z'
  },
  {
    id: 'q_rev_002',
    question_type: 'reverse_translation',
    english_sentence: 'She wishes she had studied harder.',
    target_language: 'vi',
    correct_translation: 'Cô ấy ước gì cô ấy đã học chăm chỉ hơn.',
    alternative_translations: ['Cô ấy ước mình đã học hành chăm chỉ hơn.'],
    context: 'Wish + past perfect for past regret',
    hint: 'Express regret about the past',
    key_grammar_points: ['wish_past_perfect'],
    difficulty_level: 7,
    estimated_time_seconds: 70,
    vocabulary_item_ids: [],
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z'
  },

  // Dictation Questions
  {
    id: 'q_dict_001',
    question_type: 'dictation',
    audio_url: 'https://example.com/audio/dict_001.mp3',
    audio_duration_seconds: 5,
    audio_speed: 'normal',
    speaker_accent: 'american',
    correct_transcription: 'The quick brown fox jumps over the lazy dog.',
    can_replay: true,
    max_replays: 3,
    hint: 'Listen for the animals mentioned',
    has_background_noise: false,
    multiple_speakers: false,
    difficulty_level: 4,
    estimated_time_seconds: 90,
    vocabulary_item_ids: [],
    created_at: '2025-01-11T10:00:00Z',
    updated_at: '2025-01-11T10:00:00Z'
  },
  {
    id: 'q_dict_002',
    question_type: 'dictation',
    audio_url: 'https://example.com/audio/dict_002.mp3',
    audio_duration_seconds: 8,
    audio_speed: 'fast',
    speaker_accent: 'british',
    correct_transcription: 'Climate change is one of the most pressing issues of our time.',
    can_replay: true,
    max_replays: 2,
    hint: 'Topic is about environmental issues',
    has_background_noise: false,
    multiple_speakers: false,
    difficulty_level: 8,
    estimated_time_seconds: 120,
    vocabulary_item_ids: [],
    created_at: '2025-01-12T10:00:00Z',
    updated_at: '2025-01-12T10:00:00Z'
  }
]
