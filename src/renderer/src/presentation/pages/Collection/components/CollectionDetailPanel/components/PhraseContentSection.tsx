import { vocabulary_item } from '../../../types'

interface PhraseContentSectionProps {
  item: vocabulary_item
}

const PhraseContentSection = ({ item }: PhraseContentSectionProps) => {
  // Sample data
  const sampleData = {
    definitions: [
      {
        id: '1',
        meaning:
          'To do or say something to make people feel more relaxed, especially at the beginning of a meeting or party',
        translation: 'Phá vỡ sự im lặng awkward, làm cho không khí thoải mái hơn',
        language_code: 'vi',
        examples: [
          {
            sentence: 'He told a joke to break the ice at the meeting.',
            translation:
              'Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng awkward trong cuộc họp.'
          },
          {
            sentence: "Let's play a game to break the ice.",
            translation: 'Hãy chơi một trò chơi để làm cho không khí thoải mái hơn.'
          }
        ]
      }
    ],
    usage: {
      context: 'informal, social situations',
      formality: 'neutral'
    }
  }

  return (
    <div className="space-y-6">
      {/* Definitions */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Ý nghĩa & Cách dùng</h2>
        <div className="space-y-4">
          {sampleData.definitions.map((def) => (
            <div
              key={def.id}
              className="bg-card-background rounded-lg p-4 border border-border-default"
            >
              <p className="text-text-primary mb-2">{def.meaning}</p>
              <p className="text-text-secondary italic mb-3">{def.translation}</p>

              <div className="flex gap-4 text-sm mb-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">
                  {sampleData.usage.context}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded">
                  {sampleData.usage.formality}
                </span>
              </div>

              {def.examples && def.examples.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Ví dụ:</h4>
                  {def.examples.map((example, index) => (
                    <div key={index} className="text-sm mb-2 last:mb-0">
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

      {/* Related Phrases */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Cụm từ liên quan</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-2 bg-card-background border border-border-default rounded-lg text-text-primary text-sm">
            ice breaker 🎯
          </span>
          <span className="px-3 py-2 bg-card-background border border-border-default rounded-lg text-text-primary text-sm">
            break the silence 🔊
          </span>
          <span className="px-3 py-2 bg-card-background border border-border-default rounded-lg text-text-primary text-sm">
            warm up the crowd 🔥
          </span>
        </div>
      </section>
    </div>
  )
}

export default PhraseContentSection
