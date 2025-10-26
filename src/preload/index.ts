import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Export API type for TypeScript
export interface API {
  cloudDatabase: {
    testConnection: (connectionString: string) => Promise<{ success: boolean; error?: string }>
    connect: (connectionString: string) => Promise<{ success: boolean; error?: string }>
    disconnect: () => Promise<{ success: boolean; error?: string }>
    initializeSchema: () => Promise<{ success: boolean; error?: string }>
    query: (
      query: string,
      params?: any[]
    ) => Promise<{ success: boolean; rows: any[]; rowCount: number; error?: string }>
    status: () => Promise<{ isConnected: boolean }>
  }
  storage: {
    set: (key: string, value: any) => Promise<void>
    get: (key: string) => Promise<any>
    remove: (key: string) => Promise<void>
  }
}

// Custom APIs for renderer
const api: API = {
  cloudDatabase: {
    testConnection: (connectionString: string) =>
      ipcRenderer.invoke('cloud-db:test-connection', connectionString),
    connect: (connectionString: string) => ipcRenderer.invoke('cloud-db:connect', connectionString),
    disconnect: () => ipcRenderer.invoke('cloud-db:disconnect'),
    initializeSchema: () => ipcRenderer.invoke('cloud-db:initialize-schema'),
    query: (query: string, params?: any[]) => ipcRenderer.invoke('cloud-db:query', query, params),
    status: () => ipcRenderer.invoke('cloud-db:status')
  },
  storage: {
    set: (key: string, value: any) => ipcRenderer.invoke('storage:set', key, value),
    get: (key: string) => ipcRenderer.invoke('storage:get', key),
    remove: (key: string) => ipcRenderer.invoke('storage:remove', key)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', api) // For compatibility
  } catch (error) {
    console.error(error)
  }
} else {
  // TypeScript now knows these properties exist on Window
  ;(window as any).electron = electronAPI
  ;(window as any).api = api
  ;(window as any).electronAPI = api
}
