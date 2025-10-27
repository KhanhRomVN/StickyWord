import { X, Play, Clock } from 'lucide-react'
import { Session } from '../types'
import CustomButton from '../../../../components/common/CustomButton'

interface SessionPopupProps {
  session: Session
  onStart: () => void
  onClose: () => void
}

const SessionPopup = ({ session, onStart, onClose }: SessionPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Giờ luyện tập!</h3>
              <p className="text-sm text-text-secondary">Session mới đã sẵn sàng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-border">
          <CustomButton variant="secondary" size="md" onClick={onClose} className="flex-1">
            Để sau
          </CustomButton>
          <CustomButton
            variant="primary"
            size="md"
            icon={Play}
            onClick={onStart}
            className="flex-1"
          >
            Bắt đầu ngay
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

export default SessionPopup
