import { useState, useEffect } from 'react'

interface DatabaseState {
  isConnected: boolean
  dbPath: string | null
  isLoading: boolean
}

export const useDatabase = () => {
  const [state, setState] = useState<DatabaseState>({
    isConnected: false,
    dbPath: null,
    isLoading: true
  })

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  const checkDatabaseConnection = async () => {
    try {
      // Kiểm tra xem có database path trong localStorage không
      const savedDbPath = localStorage.getItem('db-path')

      if (savedDbPath && window.api) {
        // Verify database còn tồn tại
        const exists = await window.api.fileSystem.exists(savedDbPath)

        if (exists) {
          setState({
            isConnected: true,
            dbPath: savedDbPath,
            isLoading: false
          })
          return
        }
      }

      setState({
        isConnected: false,
        dbPath: null,
        isLoading: false
      })
    } catch (error) {
      console.error('[useDatabase] Error checking connection:', error)
      setState({
        isConnected: false,
        dbPath: null,
        isLoading: false
      })
    }
  }

  const createNewDatabase = async (path: string) => {
    try {
      if (!window.api) throw new Error('API not available')

      await window.api.sqlite.createDatabase(path)
      localStorage.setItem('db-path', path)
      setState({
        isConnected: true,
        dbPath: path,
        isLoading: false
      })
      return true
    } catch (error) {
      console.error('[useDatabase] Error creating database:', error)
      return false
    }
  }

  const selectExistingDatabase = async (path: string) => {
    try {
      if (!window.api) throw new Error('API not available')

      // Kiểm tra file có tồn tại không
      const exists = await window.api.fileSystem.exists(path)
      if (!exists) {
        throw new Error('Database file does not exist')
      }

      // Thử mở database để validate
      await window.api.sqlite.openDatabase(path)

      // Kiểm tra database connection status
      const status = await window.api.sqlite.status()
      if (!status.isConnected) {
        throw new Error('Invalid database file')
      }

      localStorage.setItem('db-path', path)
      setState({
        isConnected: true,
        dbPath: path,
        isLoading: false
      })
      return true
    } catch (error) {
      console.error('[useDatabase] Error selecting database:', error)
      return false
    }
  }

  return {
    ...state,
    createNewDatabase,
    selectExistingDatabase,
    refreshConnection: checkDatabaseConnection
  }
}
