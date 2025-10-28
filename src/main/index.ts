import * as dotenv from 'dotenv'
dotenv.config()
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'

let mainWindow: BrowserWindow | null = null
let cloudDbPool: Pool | null = null

// Storage file path
const getStorageFilePath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'email-manager-config.json')
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.maximize()
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])

    // Enable auto-reload in development
    mainWindow.webContents.on('did-fail-load', () => {
      if (mainWindow) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] as string)
      }
    })

    if (is.dev && mainWindow) {
      mainWindow.webContents.on('did-finish-load', () => {
        if (mainWindow) {
          mainWindow.blur()
          mainWindow.webContents.openDevTools({ mode: 'detach' })
        }
      })
    }
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Setup IPC handlers for storage operations
function setupStorageHandlers() {
  // Set storage value
  ipcMain.handle('storage:set', async (_event, key: string, value: any) => {
    try {
      const storagePath = getStorageFilePath()
      let data: Record<string, any> = {}

      // Read existing data if file exists
      if (fs.existsSync(storagePath)) {
        const fileContent = fs.readFileSync(storagePath, 'utf8')
        try {
          data = JSON.parse(fileContent)
        } catch (parseError) {
          console.warn('Failed to parse storage file, creating new one')
          data = {}
        }
      }

      // Update data
      data[key] = value

      // Write back to file
      fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8')
    } catch (error) {
      console.error('Error setting storage value:', error)
      throw error
    }
  })

  // Get storage value
  ipcMain.handle('storage:get', async (_event, key: string) => {
    try {
      const storagePath = getStorageFilePath()

      if (!fs.existsSync(storagePath)) {
        return null
      }

      const fileContent = fs.readFileSync(storagePath, 'utf8')
      try {
        const data = JSON.parse(fileContent)
        return data[key] || null
      } catch (parseError) {
        console.warn('Failed to parse storage file')
        return null
      }
    } catch (error) {
      console.error('Error getting storage value:', error)
      return null
    }
  })

  // Remove storage value
  ipcMain.handle('storage:remove', async (_event, key: string) => {
    try {
      const storagePath = getStorageFilePath()

      if (!fs.existsSync(storagePath)) {
        return
      }

      const fileContent = fs.readFileSync(storagePath, 'utf8')
      try {
        const data = JSON.parse(fileContent)
        delete data[key]
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8')
      } catch (parseError) {
        console.warn('Failed to parse storage file')
      }
    } catch (error) {
      console.error('Error removing storage value:', error)
      throw error
    }
  })
}

// Helper function to initialize schema
async function initializeCloudDatabaseSchema() {
  try {
    if (!cloudDbPool) throw new Error('Cloud database not connected')

    const queries = [
      // === VOCABULARY TABLES ===
      `CREATE TABLE IF NOT EXISTS vocabulary_item (
        id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL CHECK (item_type IN ('word', 'phrase')),
        content TEXT NOT NULL,
        pronunciation TEXT,
        difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
        frequency_rank INTEGER CHECK (frequency_rank BETWEEN 1 AND 10),
        category TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS definition (
        id TEXT PRIMARY KEY,
        vocabulary_item_id TEXT NOT NULL REFERENCES vocabulary_item(id) ON DELETE CASCADE,
        meaning TEXT NOT NULL,
        translation TEXT,
        word_type TEXT CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner', 'exclamation')),
        phrase_type TEXT CHECK (phrase_type IN ('idiom', 'phrasal_verb', 'collocation', 'slang', 'expression')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS example (
        id TEXT PRIMARY KEY,
        definition_id TEXT NOT NULL REFERENCES definition(id) ON DELETE CASCADE,
        sentence TEXT NOT NULL,
        translation TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS vocabulary_relation (
        id TEXT PRIMARY KEY,
        vocabulary_item_id TEXT NOT NULL REFERENCES vocabulary_item(id) ON DELETE CASCADE,
        related_item_id TEXT NOT NULL REFERENCES vocabulary_item(id) ON DELETE CASCADE,
        relation_type TEXT NOT NULL CHECK (relation_type IN ('synonym', 'antonym', 'collocation', 'related')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS vocabulary_analytics (
        id TEXT PRIMARY KEY,
        vocabulary_item_id TEXT NOT NULL REFERENCES vocabulary_item(id) ON DELETE CASCADE,
        mastery_score INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
        last_reviewed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS vocabulary_question_history (
        id TEXT PRIMARY KEY,
        vocabulary_item_id TEXT NOT NULL REFERENCES vocabulary_item(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL
      )`,

      // === GRAMMAR TABLES ===
      `CREATE TABLE IF NOT EXISTS grammar_item (
        id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL CHECK (item_type IN ('tense', 'structure', 'rule', 'pattern')),
        title TEXT NOT NULL,
        difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
        frequency_rank INTEGER CHECK (frequency_rank BETWEEN 1 AND 10),
        category TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS grammar_rule (
        id TEXT PRIMARY KEY,
        grammar_item_id TEXT NOT NULL REFERENCES grammar_item(id) ON DELETE CASCADE,
        rule_description TEXT NOT NULL,
        translation TEXT,
        formula TEXT,
        usage_context TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS grammar_example (
        id TEXT PRIMARY KEY,
        grammar_rule_id TEXT NOT NULL REFERENCES grammar_rule(id) ON DELETE CASCADE,
        sentence TEXT NOT NULL,
        translation TEXT,
        is_correct BOOLEAN NOT NULL DEFAULT true,
        explanation TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS grammar_common_mistake (
        id TEXT PRIMARY KEY,
        grammar_item_id TEXT NOT NULL REFERENCES grammar_item(id) ON DELETE CASCADE,
        incorrect_example TEXT NOT NULL,
        correct_example TEXT NOT NULL,
        explanation TEXT NOT NULL,
        translation TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS grammar_relation (
        id TEXT PRIMARY KEY,
        grammar_item_id TEXT NOT NULL REFERENCES grammar_item(id) ON DELETE CASCADE,
        related_item_id TEXT NOT NULL REFERENCES grammar_item(id) ON DELETE CASCADE,
        relation_type TEXT NOT NULL CHECK (relation_type IN ('prerequisite', 'related', 'contrast', 'progression')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS grammar_analytics (
        id TEXT PRIMARY KEY,
        grammar_item_id TEXT NOT NULL REFERENCES grammar_item(id) ON DELETE CASCADE,
        mastery_score INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
        last_reviewed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS grammar_question_history (
        id TEXT PRIMARY KEY,
        grammar_item_id TEXT NOT NULL REFERENCES grammar_item(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL
      )`,

      // === QUESTIONS TABLE ===
      `CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        question_type TEXT NOT NULL,
        question_data JSONB NOT NULL,
        difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
        vocabulary_item_ids TEXT[],
        grammar_item_ids TEXT[],
        total_attempts INTEGER DEFAULT 0,
        correct_attempts INTEGER DEFAULT 0,
        incorrect_attempts INTEGER DEFAULT 0,
        last_answered_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,

      // === SESSIONS TABLE ===
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        question_ids TEXT[] NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'expired')),
        total_questions INTEGER NOT NULL,
        completed_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )`,

      // === QUESTION ANSWERS TABLE ===
      `CREATE TABLE IF NOT EXISTS question_answers (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
        user_answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_taken_seconds INTEGER,
        answered_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,

      // === AUTO DELETE TRIGGERS ===
      // Tự động xóa questions sau 30 day
      `CREATE OR REPLACE FUNCTION delete_old_questions()
      RETURNS trigger AS $$
      BEGIN
        DELETE FROM questions WHERE created_at < NOW() - INTERVAL '30 days';
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`,

      `DROP TRIGGER IF EXISTS trigger_delete_old_questions ON questions`,

      `CREATE TRIGGER trigger_delete_old_questions
      AFTER INSERT ON questions
      EXECUTE FUNCTION delete_old_questions()`,

      // Tự động xóa sessions đã hết hạn
      `CREATE OR REPLACE FUNCTION delete_expired_sessions()
      RETURNS trigger AS $$
      BEGIN
        DELETE FROM sessions WHERE expires_at < NOW() AND status IN ('pending', 'expired');
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`,

      `DROP TRIGGER IF EXISTS trigger_delete_expired_sessions ON sessions`,

      `CREATE TRIGGER trigger_delete_expired_sessions
      AFTER INSERT ON sessions
      EXECUTE FUNCTION delete_expired_sessions()`,

      // Tự động cập nhật session status khi hết hạn
      `CREATE OR REPLACE FUNCTION update_expired_sessions()
      RETURNS trigger AS $$
      BEGIN
        UPDATE sessions 
        SET status = 'expired' 
        WHERE expires_at < NOW() AND status = 'pending';
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`,

      `DROP TRIGGER IF EXISTS trigger_update_expired_sessions ON sessions`,

      `CREATE TRIGGER trigger_update_expired_sessions
      AFTER INSERT ON sessions
      EXECUTE FUNCTION update_expired_sessions()`,

      // === INDEXES ===
      `CREATE INDEX IF NOT EXISTS idx_vocab_type ON vocabulary_item(item_type)`,
      `CREATE INDEX IF NOT EXISTS idx_vocab_created ON vocabulary_item(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_definition_vocab ON definition(vocabulary_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_example_def ON example(definition_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vocab_relation ON vocabulary_relation(vocabulary_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vocab_analytics ON vocabulary_analytics(vocabulary_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_type ON grammar_item(item_type)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_created ON grammar_item(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_rule ON grammar_rule(grammar_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_example ON grammar_example(grammar_rule_id)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_mistake ON grammar_common_mistake(grammar_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_relation ON grammar_relation(grammar_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_grammar_analytics ON grammar_analytics(grammar_item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_question_answers_question ON question_answers(question_id)`,
      `CREATE INDEX IF NOT EXISTS idx_question_answers_session ON question_answers(session_id)`
    ]

    for (const query of queries) {
      await cloudDbPool.query(query)
    }

    console.log('[initializeCloudDatabaseSchema] Schema created successfully')
    return { success: true }
  } catch (error) {
    console.error('[initializeCloudDatabaseSchema] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Schema initialization failed'
    }
  }
}

// Setup IPC handlers for cloud database operations
function setupCloudDatabaseHandlers() {
  // Test cloud database connection
  ipcMain.handle('cloud-db:test-connection', async (_event, connectionString: string) => {
    let testPool: Pool | null = null
    try {
      testPool = new Pool({ connectionString })
      await testPool.query('SELECT 1')
      return { success: true }
    } catch (error) {
      console.error('[cloud-db:test-connection] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      if (testPool) {
        await testPool.end()
      }
    }
  })

  // Connect to cloud database
  ipcMain.handle('cloud-db:connect', async (_event, connectionString: string) => {
    try {
      // Close existing connection if any
      if (cloudDbPool) {
        await cloudDbPool.end()
      }

      cloudDbPool = new Pool({ connectionString })

      // Test connection
      await cloudDbPool.query('SELECT 1')

      // Auto-initialize schema after successful connection
      console.log('[cloud-db:connect] Connection successful, initializing schema...')
      const initResult = await initializeCloudDatabaseSchema()

      if (!initResult.success) {
        console.warn('[cloud-db:connect] Schema initialization warning:', initResult.error)
        // Don't fail connection if schema already exists
      } else {
        console.log('[cloud-db:connect] Schema initialized successfully')
      }

      return { success: true }
    } catch (error) {
      console.error('[cloud-db:connect] Error:', error)
      cloudDbPool = null
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  })

  // Disconnect from cloud database
  ipcMain.handle('cloud-db:disconnect', async () => {
    try {
      if (cloudDbPool) {
        await cloudDbPool.end()
        cloudDbPool = null
      }
      return { success: true }
    } catch (error) {
      console.error('[cloud-db:disconnect] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Disconnect failed'
      }
    }
  })

  // Initialize cloud database schema
  ipcMain.handle('cloud-db:initialize-schema', async () => {
    try {
      if (!cloudDbPool) throw new Error('Cloud database not connected')

      const queries = [
        `CREATE TABLE IF NOT EXISTS vocabulary_item (
          id TEXT PRIMARY KEY,
          item_type TEXT NOT NULL,
          content TEXT NOT NULL,
          pronunciation TEXT,
          difficulty_level INTEGER,
          frequency_rank INTEGER,
          category TEXT,
          tags JSONB,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS grammar_item (
          id TEXT PRIMARY KEY,
          item_type TEXT NOT NULL,
          title TEXT NOT NULL,
          difficulty_level INTEGER,
          frequency_rank INTEGER,
          category TEXT,
          tags JSONB,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL
        )`,
        `CREATE INDEX IF NOT EXISTS idx_vocab_type ON vocabulary_item(item_type)`,
        `CREATE INDEX IF NOT EXISTS idx_grammar_type ON grammar_item(item_type)`
      ]

      for (const query of queries) {
        await cloudDbPool.query(query)
      }

      return { success: true }
    } catch (error) {
      console.error('[cloud-db:initialize-schema] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Schema initialization failed'
      }
    }
  })

  // Execute cloud database query
  ipcMain.handle('cloud-db:query', async (_event, query: string, params: any[] = []) => {
    try {
      if (!cloudDbPool) throw new Error('Cloud database not connected')

      const result = await cloudDbPool.query(query, params)
      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount
      }
    } catch (error) {
      console.error('[cloud-db:query] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
        rows: [],
        rowCount: 0
      }
    }
  })

  // Get connection status
  ipcMain.handle('cloud-db:status', async () => {
    return {
      isConnected: cloudDbPool !== null
    }
  })
}

// Setup IPC handlers for popup windows
function setupPopupHandlers() {
  ipcMain.handle('popup:show-session', async (_event, sessionData: any) => {
    try {
      // Get screen dimensions
      const { screen } = require('electron')
      const primaryDisplay = screen.getPrimaryDisplay()
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

      // Popup config: small window, bottom-right corner
      const popupWidth = 420
      const popupHeight = 280
      const padding = 20

      const popupWindow = new BrowserWindow({
        width: popupWidth,
        height: popupHeight,
        x: screenWidth - popupWidth - padding,
        y: screenHeight - popupHeight - padding,
        show: false,
        frame: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: false,
        skipTaskbar: false,
        backgroundColor: '#1f2937',
        title: 'Session Notification',
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false,
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      popupWindow.setMenuBarVisibility(false)

      // Load popup HTML
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        popupWindow.loadURL(
          `${process.env['ELECTRON_RENDERER_URL']}#/popup-session?sessionId=${sessionData.id}`
        )
      } else {
        popupWindow.loadFile(join(__dirname, '../renderer/index.html'), {
          hash: `/popup-session?sessionId=${sessionData.id}`
        })
      }

      // Show with fade-in animation
      popupWindow.once('ready-to-show', () => {
        popupWindow.show()
        popupWindow.focus()
      })

      return { success: true }
    } catch (error) {
      console.error('[popup:show-session] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to show popup'
      }
    }
  })

  // Hide popup and show/focus main window
  ipcMain.handle('popup:hide-and-focus-main', async (_event, sessionId: string) => {
    try {
      // Hide all popup windows
      const allWindows = BrowserWindow.getAllWindows()
      allWindows.forEach((win) => {
        if (win !== mainWindow && win.getTitle() === 'Session Notification') {
          win.hide()
        }
      })

      // Show and focus main window
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()

        // Navigate to session page
        mainWindow.webContents.send('navigate-to-session', sessionId)
      }

      return { success: true }
    } catch (error) {
      console.error('[popup:hide-and-focus-main] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to focus main window'
      }
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Setup IPC handlers
  setupStorageHandlers()
  setupCloudDatabaseHandlers()
  setupPopupHandlers()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // Hot reload in development
  if (is.dev) {
    app.on('activate', () => {
      if (mainWindow === null) createWindow()
    })

    if (mainWindow) {
      mainWindow.webContents.on('destroyed', () => {
        mainWindow = null
      })
    }
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', async () => {
  // Close cloud database connection when app is closing
  if (cloudDbPool) {
    try {
      await cloudDbPool.end()
    } catch (err) {
      console.error('Error closing cloud database on app quit:', err)
    }
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})
