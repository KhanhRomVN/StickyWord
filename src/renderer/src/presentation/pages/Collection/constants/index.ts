export const COLLECTION_TYPES = {
  WORD: 'word',
  PHRASE: 'phrase',
  GRAMMAR: 'grammar'
} as const

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very easy', color: 'text-green-500' },
  { value: 2, label: 'Easy', color: 'text-green-400' },
  { value: 3, label: 'Medium', color: 'text-yellow-500' },
  { value: 4, label: 'Quite difficult', color: 'text-orange-500' },
  { value: 5, label: 'Difficult', color: 'text-red-500' }
] as const

export const WORD_TYPES = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'determiner',
  'exclamation'
] as const

export const PHRASE_TYPES = ['idiom', 'phrasal_verb', 'collocation', 'slang', 'expression'] as const

export const GRAMMAR_TYPES = [
  'tense',
  'conditional',
  'passive',
  'modal',
  'article',
  'preposition_usage',
  'sentence_structure'
] as const
