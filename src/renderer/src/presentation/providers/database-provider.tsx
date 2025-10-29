import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DatabaseContextType {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connectionString: string | null
  connect: (connectionString: string) => Promise<boolean>
  disconnect: () => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

interface DatabaseProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'cloud_database_connection'

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionString, setConnectionString] = useState<string | null>(null)

  // Check saved connection on mount
  useEffect(() => {
    checkSavedConnection()
  }, [])

  const checkSavedConnection = async () => {
    try {
      setIsLoading(true)

      if (!window.api) {
        console.error('[DatabaseProvider] window.api is not available')
        setIsLoading(false)
        return
      }

      const saved = await window.api.storage.get(STORAGE_KEY)

      if (saved) {
        const { connectionString: savedConnectionString } = saved

        if (savedConnectionString) {
          const success = await testConnection(savedConnectionString)

          if (success) {
            const { setCloudDatabase } = await import('../../services/CloudDatabaseService')
            setCloudDatabase(savedConnectionString)

            setConnectionString(savedConnectionString)
            setIsConnected(true)
            setError(null)
          } else {
            console.warn(
              '[DatabaseProvider] ⚠️ Saved connection invalid, NOT removing from storage'
            )
            // ✅ KHÔNG xóa khi test fail, có thể do lỗi network tạm thời
            setError('Không thể kết nối đến database. Vui lòng kiểm tra lại trong Settings.')
          }
        }
      }
    } catch (err) {
      console.error('[DatabaseProvider] ❌ Error checking saved connection:', err)
      setError('Lỗi khi kiểm tra kết nối đã lưu')
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async (connString: string): Promise<boolean> => {
    try {
      const { CloudDatabaseService } = await import('../../services/CloudDatabaseService')
      const service = new CloudDatabaseService(connString)
      const isConnected = await service.testConnection()

      if (isConnected) {
        // ✅ Đảm bảo main process cũng connect
        const connectResult = await service.connect()
        if (!connectResult) {
          console.error('[DatabaseProvider] Main process connection failed')
          return false
        }
      }

      return isConnected
    } catch (err) {
      console.error('[DatabaseProvider] Connection test failed:', err)
      return false
    }
  }

  const connect = async (connString: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      if (!window.api) {
        console.error('[DatabaseProvider] window.api is not available')
        setError('Electron API không khả dụng')
        setIsLoading(false)
        return false
      }

      const success = await testConnection(connString)

      if (success) {
        // ✅ Khởi tạo singleton instance cho CloudDatabaseService
        const { setCloudDatabase } = await import('../../services/CloudDatabaseService')
        setCloudDatabase(connString)

        setConnectionString(connString)
        setIsConnected(true)
        await window.api.storage.set(STORAGE_KEY, { connectionString: connString })
        return true
      } else {
        setError('Không thể kết nối đến database')
        return false
      }
    } catch (err) {
      console.error('[DatabaseProvider] Connection error:', err)
      setError(err instanceof Error ? err.message : 'Lỗi kết nối không xác định')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    setIsConnected(false)
    setConnectionString(null)
    setError(null)

    if (window.api) {
      await window.api.storage.remove(STORAGE_KEY)
    }
  }

  return (
    <DatabaseContext.Provider
      value={{
        isConnected,
        isLoading,
        error,
        connectionString,
        connect,
        disconnect
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider')
  }
  return context
}
