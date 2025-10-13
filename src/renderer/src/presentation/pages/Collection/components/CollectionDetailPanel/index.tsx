import { vocabulary_item } from '../../types'
import WordContentSection from './components/WordContentSection'
import PhraseContentSection from './components/PhraseContentSection'
import GrammarContentSection from './components/GrammarContentSection'
import PronunciationContentSection from './components/PronunciationContentSection'

interface CollectionDetailPanelProps {
  selectedItem: vocabulary_item | null
}

const CollectionDetailPanel = ({ selectedItem }: CollectionDetailPanelProps) => {
  if (!selectedItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-secondary p-8">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">Chọn một mục để xem chi tiết</h3>
          <p className="text-sm opacity-75">
            Chọn một từ vựng, cụm từ hoặc điểm ngữ pháp từ danh sách bên trái để xem thông tin chi
            tiết và các ví dụ.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 border-b border-border-default">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{selectedItem.content}</h1>
            {(selectedItem.pronunciation || selectedItem.ipa_notation) && (
              <div className="flex items-center gap-3 text-text-secondary">
                {selectedItem.pronunciation && (
                  <span className="text-lg">{selectedItem.pronunciation}</span>
                )}
                {selectedItem.ipa_notation && (
                  <span className="text-lg font-mono bg-card-background px-2 py-1 rounded">
                    {selectedItem.ipa_notation}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-button-bg hover:bg-button-bgHover text-button-bgText rounded text-sm transition-colors">
              Sửa
            </button>
            <button className="px-3 py-1 bg-button-secondBg hover:bg-button-secondBgHover text-button-bgText rounded text-sm transition-colors">
              Xóa
            </button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium capitalize">
            {selectedItem.item_type}
          </span>
          {/* word_type và phrase_type đã chuyển xuống definition, không còn hiển thị ở đây */}
          {selectedItem.grammar_type && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded text-xs font-medium capitalize">
              {selectedItem.grammar_type}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pronunciation Section */}
        {(selectedItem.pronunciation || selectedItem.ipa_notation) && (
          <PronunciationContentSection item={selectedItem} />
        )}

        {/* Type-specific Content Section */}
        {selectedItem.item_type === 'word' && <WordContentSection item={selectedItem} />}
        {selectedItem.item_type === 'phrase' && <PhraseContentSection item={selectedItem} />}
        {selectedItem.item_type === 'grammar' && <GrammarContentSection item={selectedItem} />}
      </div>
    </div>
  )
}

export default CollectionDetailPanel
