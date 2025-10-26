import { useState, useRef } from 'react'
import { dictation_question } from '../../../types'
import CustomButton from '../../../../../../components/common/CustomButton'
import CustomInput from '../../../../../../components/common/CustomInput'
import { CheckCircle, XCircle, Lightbulb, Play, Pause, RotateCcw } from 'lucide-react'

interface DictationViewProps {
  question: dictation_question
  userAnswer: string
  setUserAnswer: (answer: string) => void
  isSubmitted: boolean
  onSubmit: () => void
}

const DictationView = ({
  question,
  userAnswer,
  setUserAnswer,
  isSubmitted,
  onSubmit
}: DictationViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [replayCount, setReplayCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const canReplay =
    question.can_replay && (!question.max_replays || replayCount < question.max_replays)

  const handlePlayAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
      if (replayCount === 0) {
        setReplayCount(1)
      }
    }
  }

  const handleReplay = () => {
    if (!audioRef.current || !canReplay) return

    audioRef.current.currentTime = 0
    audioRef.current.play()
    setIsPlaying(true)
    setReplayCount((prev) => prev + 1)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const isCorrect =
    userAnswer.trim().toLowerCase() === question.correct_transcription.trim().toLowerCase()

  const getSpeedBadgeColor = (speed: string) => {
    switch (speed) {
      case 'slow':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'fast':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getSpeedLabel = (speed: string) => {
    switch (speed) {
      case 'slow':
        return 'Chậm'
      case 'normal':
        return 'Bình thường'
      case 'fast':
        return 'Nhanh'
      default:
        return speed
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Type Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-medium">
        🎧 Nghe viết
      </div>

      {/* Instruction */}
      <div className="bg-card-background p-4 rounded-lg border border-border-default">
        <h3 className="font-semibold text-text-primary mb-2">Yêu cầu:</h3>
        <p className="text-text-secondary">Nghe đoạn audio và viết lại những gì bạn nghe được.</p>
        <div className="flex items-center gap-3 mt-3 text-sm text-text-secondary">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getSpeedBadgeColor(question.audio_speed)}`}
          >
            Tốc độ: {getSpeedLabel(question.audio_speed)}
          </span>
          {question.speaker_accent && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
              Giọng: {question.speaker_accent}
            </span>
          )}
          {question.has_background_noise && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
              ⚠️ Có tiếng ồn
            </span>
          )}
          {question.multiple_speakers && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
              👥 Nhiều người nói
            </span>
          )}
        </div>
      </div>

      {/* Audio Player */}
      {!isSubmitted && (
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <audio
            ref={audioRef}
            src={question.audio_url}
            onEnded={handleAudioEnded}
            className="hidden"
          />

          <div className="flex items-center justify-center gap-4">
            <CustomButton
              variant="primary"
              size="lg"
              icon={isPlaying ? Pause : Play}
              onClick={handlePlayAudio}
            >
              {isPlaying ? 'Tạm dừng' : replayCount === 0 ? 'Phát audio' : 'Tiếp tục'}
            </CustomButton>

            {question.can_replay && replayCount > 0 && (
              <CustomButton
                variant="secondary"
                size="lg"
                icon={RotateCcw}
                onClick={handleReplay}
                disabled={!canReplay}
              >
                Nghe lại
                {question.max_replays && ` (${replayCount}/${question.max_replays})`}
              </CustomButton>
            )}
          </div>

          {question.can_replay && question.max_replays && (
            <p className="text-center text-sm text-text-secondary mt-3">
              {canReplay
                ? `Còn ${question.max_replays - replayCount} lần nghe lại`
                : 'Đã hết lượt nghe lại'}
            </p>
          )}

          <p className="text-center text-sm text-text-secondary mt-2">
            Thời lượng: {question.audio_duration_seconds}s
          </p>
        </div>
      )}

      {/* User Answer Input */}
      {!isSubmitted && (
        <div>
          <CustomInput
            label="Nội dung bạn nghe được:"
            value={userAnswer}
            onChange={setUserAnswer}
            placeholder="Nhập những gì bạn nghe được..."
            variant="primary"
            size="md"
            multiline
            rows={3}
          />
          {question.hint && (
            <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Gợi ý:</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">{question.hint}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {isSubmitted && (
        <div
          className={`p-4 rounded-lg border ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-300">Chính xác!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-800 dark:text-red-300">Chưa đúng</span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-text-secondary">
              <p className="font-medium mb-1">Nội dung bạn viết:</p>
              <p className="bg-white dark:bg-gray-800 p-2 rounded border border-current/20">
                {userAnswer || '(trống)'}
              </p>
            </div>
            {!isCorrect && (
              <div className="text-text-secondary">
                <p className="font-medium mb-1 text-green-600 dark:text-green-400">
                  Nội dung đúng:
                </p>
                <p className="bg-white dark:bg-gray-800 p-2 rounded border border-green-500/30">
                  {question.correct_transcription}
                </p>
              </div>
            )}
          </div>

          {/* Play audio again in result */}
          <div className="mt-4 pt-4 border-t border-current/20">
            <audio
              src={question.audio_url}
              controls
              className="w-full"
              style={{ height: '40px' }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <CustomButton
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={!userAnswer.trim() || replayCount === 0}
          className="w-full"
        >
          Kiểm tra đáp án
        </CustomButton>
      )}
    </div>
  )
}

export default DictationView
