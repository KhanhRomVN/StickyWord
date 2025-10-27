import { useEffect, useState } from 'react'
import { Session } from '../presentation/pages/Dashboard/types'

export const useSessionNotification = () => {
  const [newSession, setNewSession] = useState<Session | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const handleNewSession = (event: CustomEvent<{ session: Session }>) => {
      console.log('[useSessionNotification] 📬 New session received:', event.detail.session.id)
      setNewSession(event.detail.session)
      setShowPopup(true)
    }

    window.addEventListener('new-session-created', handleNewSession as EventListener)

    return () => {
      window.removeEventListener('new-session-created', handleNewSession as EventListener)
    }
  }, [])

  const closePopup = () => {
    setShowPopup(false)
    setNewSession(null)
  }

  return {
    newSession,
    showPopup,
    closePopup
  }
}
