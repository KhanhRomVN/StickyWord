import { vocabulary_item } from '../../../types'

interface PronunciationContentSectionProps {
  item: vocabulary_item
}

const PronunciationContentSection = ({ item }: PronunciationContentSectionProps) => {
  const playPronunciation = () => {
    // In real app, this would play audio
    console.log('Playing pronunciation for:', item.content)
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-text-primary mb-4">Phát âm</h2>
      <div className="bg-card-background rounded-lg p-4 border border-border-default">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            {item.pronunciation && (
              <p className="text-lg text-text-primary">
                <span className="font-medium">Cách đọc:</span> {item.pronunciation}
              </p>
            )}
            {item.ipa_notation && (
              <p className="text-lg font-mono text-text-primary">
                <span className="font-medium">IPA:</span> {item.ipa_notation}
              </p>
            )}
          </div>

          <button
            onClick={playPronunciation}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-1.414m-1.414-2.829a5 5 0 010-7.072m2.829 2.828a1 1 0 01-1.414 1.414"
              />
            </svg>
            Nghe phát âm
          </button>
        </div>

        {/* Pronunciation Tips */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
          <h4 className="font-medium text-text-primary mb-2">Mẹo phát âm:</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Chú ý trọng âm của từ</li>
            <li>• Nghe và lặp lại nhiều lần</li>
            <li>• Ghi âm và so sánh với bản gốc</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default PronunciationContentSection
