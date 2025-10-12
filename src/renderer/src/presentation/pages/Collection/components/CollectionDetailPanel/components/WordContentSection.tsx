import { vocabulary_item } from '../../../types'

interface WordContentSectionProps {
  item: vocabulary_item
}

const WordContentSection = ({ item }: WordContentSectionProps) => {
  // Sample data - in real app, this would come from API
  const sampleData = {
    definitions: [
      {
        id: '1',
        meaning: 'Persistence in doing something despite difficulty or delay in achieving success',
        translation: 'Sự kiên trì, sự bền bỉ',
        language_code: 'vi',
        examples: [
          {
            sentence: 'Her perseverance through difficult times was truly inspiring.',
            translation:
              'Sự kiên trì của cô ấy qua những thời điểm khó khăn thực sự đáng khâm phục.'
          }
        ]
      }
    ],
    analytics: {
      mastery_score: 75,
      times_seen: 12,
      times_correct: 9
    }
  }

  return (
    <div className="space-y-6">
      {/* Definitions */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Định nghĩa</h2>
        <div className="space-y-4">
          {sampleData.definitions.map((def) => (
            <div
              key={def.id}
              className="bg-card-background rounded-lg p-4 border border-border-default"
            >
              <p className="text-text-primary mb-2">{def.meaning}</p>
              <p className="text-text-secondary italic mb-3">{def.translation}</p>

              {def.examples && def.examples.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Ví dụ:</h4>
                  {def.examples.map((example, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-text-primary">• {example.sentence}</p>
                      <p className="text-text-secondary italic ml-4">{example.translation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default WordContentSection
