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
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const { connectionString: savedConnectionString } = JSON.parse(saved)

        if (savedConnectionString) {
          const success = await testConnection(savedConnectionString)

          if (success) {
            // ✅ Khởi tạo singleton instance cho CloudDatabaseService
            const { setCloudDatabase } = await import('../../services/CloudDatabaseService')
            setCloudDatabase(savedConnectionString)

            setConnectionString(savedConnectionString)
            setIsConnected(true)
            setError(null)
            console.log('[DatabaseProvider] Cloud database instance initialized')
          } else {
            localStorage.removeItem(STORAGE_KEY)
            setError('Kết nối đã lưu không hợp lệ')
          }
        }
      }
    } catch (err) {
      console.error('[DatabaseProvider] Error checking saved connection:', err)
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
        console.log('[DatabaseProvider] Connection successful, schema ready')
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

      const success = await testConnection(connString)

      if (success) {
        // ✅ Khởi tạo singleton instance cho CloudDatabaseService
        const { setCloudDatabase } = await import('../../services/CloudDatabaseService')
        setCloudDatabase(connString)

        setConnectionString(connString)
        setIsConnected(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ connectionString: connString }))
        console.log('[DatabaseProvider] Cloud database instance initialized')
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

  const disconnect = () => {
    setIsConnected(false)
    setConnectionString(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
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
