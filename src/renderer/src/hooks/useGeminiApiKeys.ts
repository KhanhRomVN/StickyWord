import { useState, useEffect, useCallback } from 'react'

export interface GeminiApiKey {
  id: string
  name: string
  key: string
  createdAt: string
}

const STORAGE_KEY = 'gemini_api_keys'

export const useGeminiApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<GeminiApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load API keys from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setApiKeys(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save API keys to localStorage
  const saveToStorage = useCallback((keys: GeminiApiKey[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    } catch (error) {
      console.error('Error saving API keys:', error)
    }
  }, [])

  // Add new API key
  const addApiKey = useCallback(
    (name: string, key: string) => {
      if (!name.trim() || !key.trim()) {
        throw new Error('Name và API key không được để trống')
      }

      const newKey: GeminiApiKey = {
        id: Date.now().toString(),
        name: name.trim(),
        key: key.trim(),
        createdAt: new Date().toISOString()
      }

      const updatedKeys = [...apiKeys, newKey]
      setApiKeys(updatedKeys)
      saveToStorage(updatedKeys)
      return newKey
    },
    [apiKeys, saveToStorage]
  )

  // Update API key
  const updateApiKey = useCallback(
    (id: string, name: string, key: string) => {
      if (!name.trim() || !key.trim()) {
        throw new Error('Name và API key không được để trống')
      }

      const updatedKeys = apiKeys.map((item) =>
        item.id === id
          ? {
              ...item,
              name: name.trim(),
              key: key.trim()
            }
          : item
      )

      setApiKeys(updatedKeys)
      saveToStorage(updatedKeys)
    },
    [apiKeys, saveToStorage]
  )

  // Delete API key
  const deleteApiKey = useCallback(
    (id: string) => {
      const updatedKeys = apiKeys.filter((item) => item.id !== id)
      setApiKeys(updatedKeys)
      saveToStorage(updatedKeys)
    },
    [apiKeys, saveToStorage]
  )

  // Get single API key by ID
  const getApiKey = useCallback(
    (id: string) => {
      return apiKeys.find((item) => item.id === id)
    },
    [apiKeys]
  )

  return {
    apiKeys,
    isLoading,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    getApiKey
  }
}
