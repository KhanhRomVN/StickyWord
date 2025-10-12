import { vocabulary_item } from '../../../types'

interface GrammarContentSectionProps {
  item: vocabulary_item
}

const GrammarContentSection = ({ item }: GrammarContentSectionProps) => {
  // Sample data
  const sampleData = {
    explanation: {
      description:
        'The Present Perfect Continuous tense is used to describe actions that started in the past and are still continuing or have just finished, emphasizing the duration of the activity.',
      structure: 'Subject + have/has + been + verb-ing',
      vietnamese:
        'Thì Hiện tại Hoàn thành Tiếp diễn dùng để diễn tả hành động bắt đầu trong quá khứ và vẫn đang tiếp diễn hoặc vừa mới kết thúc, nhấn mạnh vào khoảng thời gian của hành động.'
    },
    examples: [
      {
        sentence: 'I have been studying English for 5 years.',
        translation: 'Tôi đã học tiếng Anh được 5 năm rồi.',
        usage: 'Hành động bắt đầu trong quá khứ và vẫn tiếp tục đến hiện tại'
      },
      {
        sentence: 'She has been working here since 2020.',
        translation: 'Cô ấy đã làm việc ở đây từ năm 2020.',
        usage: 'Hành động bắt đầu tại thời điểm cụ thể trong quá khứ và vẫn tiếp tục'
      },
      {
        sentence: 'They have been waiting for you for two hours.',
        translation: 'Họ đã đợi bạn được 2 tiếng rồi.',
        usage: 'Nhấn mạnh vào khoảng thời gian của hành động'
      }
    ],
    commonMistakes: [
      {
        mistake: 'I am studying English for 5 years.',
        correction: 'I have been studying English for 5 years.',
        reason:
          'Sai thì - cần dùng Present Perfect Continuous để diễn tả hành động kéo dài từ quá khứ đến hiện tại'
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Giải thích</h2>
        <div className="bg-card-background rounded-lg p-4 border border-border-default space-y-3">
          <p className="text-text-primary">{sampleData.explanation.description}</p>
          <p className="text-text-secondary italic">{sampleData.explanation.vietnamese}</p>
          <div className="bg-primary/10 border border-primary/20 rounded p-3 mt-3">
            <h4 className="font-mono text-sm font-bold text-primary mb-1">Cấu trúc:</h4>
            <p className="font-mono text-text-primary">{sampleData.explanation.structure}</p>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Ví dụ</h2>
        <div className="space-y-3">
          {sampleData.examples.map((example, index) => (
            <div
              key={index}
              className="bg-card-background rounded-lg p-4 border border-border-default"
            >
              <p className="text-text-primary font-medium mb-1">{example.sentence}</p>
              <p className="text-text-secondary italic mb-2">{example.translation}</p>
              <p className="text-sm text-text-secondary">→ {example.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Common Mistakes */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Lỗi thường gặp</h2>
        <div className="space-y-3">
          {sampleData.commonMistakes.map((mistake, index) => (
            <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-red-500 mt-1">✗</span>
                <p className="text-text-primary line-through">{mistake.mistake}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="text-text-primary font-medium">{mistake.correction}</p>
                  <p className="text-sm text-text-secondary mt-1">{mistake.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default GrammarContentSection
