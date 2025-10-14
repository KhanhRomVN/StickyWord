import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Export API type for TypeScript
export interface API {
  sqlite: {
    createDatabase: (path: string) => Promise<any>
    openDatabase: (path: string) => Promise<any>
    closeDatabase: () => Promise<any>
    runQuery: (query: string, params?: any[]) => Promise<any>
    getAllRows: (query: string, params?: any[]) => Promise<any>
    getOneRow: (query: string, params?: any[]) => Promise<any>
    status: () => Promise<{ isConnected: boolean; message: string }>
  }
  vocabulary: {
    save: (item: any) => Promise<any>
    getAll: (filterType?: string) => Promise<any[]>
    delete: (id: string) => Promise<any>
    update: (item: any) => Promise<any>
  }
  fileSystem: {
    showSaveDialog: (options: any) => Promise<any>
    showOpenDialog: (options: any) => Promise<any>
    exists: (path: string) => Promise<boolean>
    createDirectory: (path: string, options?: { recursive?: boolean }) => Promise<void>
  }
  storage: {
    set: (key: string, value: any) => Promise<void>
    get: (key: string) => Promise<any>
    remove: (key: string) => Promise<void>
  }
}

// Custom APIs for renderer
const api: API = {
  sqlite: {
    createDatabase: (path: string) => ipcRenderer.invoke('sqlite:create', path),
    openDatabase: (path: string) => ipcRenderer.invoke('sqlite:open', path),
    closeDatabase: () => ipcRenderer.invoke('sqlite:close'),
    runQuery: (query: string, params?: any[]) => ipcRenderer.invoke('sqlite:run', query, params),
    getAllRows: (query: string, params?: any[]) => ipcRenderer.invoke('sqlite:all', query, params),
    getOneRow: (query: string, params?: any[]) => ipcRenderer.invoke('sqlite:get', query, params),
    status: () => ipcRenderer.invoke('sqlite:status')
  },
  vocabulary: {
    save: (item: any) => ipcRenderer.invoke('vocabulary:save', item),
    getAll: (filterType?: string) => ipcRenderer.invoke('vocabulary:getAll', filterType),
    delete: (id: string) => ipcRenderer.invoke('vocabulary:delete', id),
    update: (item: any) => ipcRenderer.invoke('vocabulary:update', item)
  },
  fileSystem: {
    showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:save', options),
    showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:open', options),
    exists: (path: string) => ipcRenderer.invoke('fs:exists', path),
    createDirectory: (path: string, options?: { recursive?: boolean }) =>
      ipcRenderer.invoke('fs:createDirectory', path, options)
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
