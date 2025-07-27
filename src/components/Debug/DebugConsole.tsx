import React, { useState, useEffect, useRef } from 'react'
import { X, Bug, Eye, EyeOff, Trash2, Download, Copy, RefreshCw, Database } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { DatabaseCleanup } from '../../lib/databaseCleanup'
import { MeetingDataService } from '../../lib/meetingDataService'
import { executeUserReset } from '../../lib/executeReset'
import { DatabaseService } from '../../lib/database'

interface DebugLog {
  id: string
  timestamp: string
  type: 'navigation' | 'localStorage' | 'state' | 'render' | 'error' | 'info'
  category: string
  message: string
  data?: any
}

const DebugConsole: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const { currentView, selectedProject, selectedStakeholders, refreshMeetingData } = useApp()
  const { user } = useAuth()
  const [dbStats, setDbStats] = useState<any>(null)
  const [dbOperationStatus, setDbOperationStatus] = useState<string>('')
  const [testResult, setTestResult] = useState<string>('')

  // Intercept console.log and capture debug messages
  useEffect(() => {
    const originalConsoleLog = console.log
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    const addLog = (type: DebugLog['type'], category: string, message: string, data?: any) => {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-99), {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type,
          category,
          message,
          data
        }])
      }, 0)
    }

    // Override console methods to capture logs
    console.log = (...args) => {
      originalConsoleLog(...args)
      const message = args.join(' ')
      
      // Skip debug console's own logs to avoid recursion
      if (message.includes('DebugConsole') || message.includes('setState')) {
        return
      }
      
      // Categorize based on message content
      if (message.includes('🔍 INIT:')) {
        addLog('state', 'INITIALIZATION', message, args)
      } else if (message.includes('🔄 NAVIGATE:')) {
        addLog('navigation', 'NAVIGATION', message, args)
      } else if (message.includes('💾')) {
        addLog('localStorage', 'STORAGE', message, args)
      } else if (message.includes('🔍 RENDER:')) {
        addLog('render', 'RENDERING', message, args)
      } else if (message.includes('🔍 USER_EFFECT:')) {
        addLog('state', 'USER_STATE', message, args)
      } else if (message.includes('✅ HYDRATION:')) {
        addLog('state', 'HYDRATION', message, args)
      } else {
        addLog('info', 'GENERAL', message, args)
      }
    }

    console.error = (...args) => {
      originalConsoleError(...args)
      const message = args.join(' ')
      if (!message.includes('DebugConsole')) {
        addLog('error', 'ERROR', message, args)
      }
    }

    console.warn = (...args) => {
      originalConsoleWarn(...args)
      const message = args.join(' ')
      if (!message.includes('DebugConsole')) {
        addLog('error', 'WARNING', message, args)
      }
    }

    return () => {
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  // Track state changes
  useEffect(() => {
    const addStateLog = () => {
      setLogs(prev => [...prev, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type: 'state',
        category: 'STATE_CHANGE',
        message: `View: ${currentView}, Project: ${selectedProject?.name || 'none'}, Stakeholders: ${selectedStakeholders.length}`,
        data: { currentView, selectedProject: selectedProject?.name, stakeholderCount: selectedStakeholders.length }
      }])
    }

    // Use setTimeout to avoid setState during render
    const timer = setTimeout(addStateLog, 0)
    return () => clearTimeout(timer)
  }, [currentView, selectedProject, selectedStakeholders])

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const clearLogs = () => setLogs([])

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}-${log.category}: ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}-${log.category}: ${log.message}`
    ).join('\n')
    navigator.clipboard.writeText(logText)
  }

  // Database management functions
  const loadDbStats = async () => {
    if (!user?.id) return
    const stats = await DatabaseCleanup.getUserDataStats(user.id)
    setDbStats(stats)
  }

  const resetUserData = async () => {
    if (!user?.id) return
    if (!confirm('⚠️ This will DELETE ALL your meetings and progress data. Are you sure?')) return
    
    setDbOperationStatus('🚨 Performing complete reset...')
    
    try {
      await executeUserReset(user.id)
      setDbOperationStatus('✅ Complete reset successful! All data cleared.')
      await refreshMeetingData()
      await loadDbStats()
      
      // Force refresh the page to ensure clean state
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setDbOperationStatus(`❌ Reset failed: ${error}`)
    }
    
    setTimeout(() => setDbOperationStatus(''), 5000)
  }

  const fixCorruptedMeetings = async () => {
    if (!user?.id) return
    
    setDbOperationStatus('Fixing corrupted meetings...')
    const result = await DatabaseCleanup.fixCorruptedMeetings(user.id)
    
    if (result.success) {
      setDbOperationStatus(`✅ Fixed! Deleted ${result.deletedCount} corrupted meetings`)
      MeetingDataService.clearCache(user.id)
      await refreshMeetingData()
      await loadDbStats()
    } else {
      setDbOperationStatus(`❌ Error: ${result.message}`)
    }
    
    setTimeout(() => setDbOperationStatus(''), 3000)
  }

  const testTranscriptMeetingSave = async () => {
    if (!user?.id) {
      setTestResult('❌ No user logged in')
      return
    }

    if (!selectedProject || !selectedStakeholders?.length) {
      setTestResult('❌ Need to select project and stakeholders first')
      return
    }

    setTestResult('🧪 Testing transcript meeting save...')
    
    try {
      const testMeetingId = `test_transcript_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      
      // Create test transcript data
      const testMessages = [
        { speaker: 'user', content: 'Hello, can you tell me about your current requirements?', timestamp: new Date().toISOString() },
        { speaker: selectedStakeholders[0]?.name || 'Stakeholder', content: 'We need a better system to manage our processes.', timestamp: new Date().toISOString() },
        { speaker: 'user', content: 'What are the main pain points with the current system?', timestamp: new Date().toISOString() },
        { speaker: selectedStakeholders[0]?.name || 'Stakeholder', content: 'The biggest issue is efficiency and user experience.', timestamp: new Date().toISOString() }
      ]

      const testNotes = 'Test transcript meeting notes - Enhanced with analytics'
      const testSummary = 'Test meeting summary - Requirements discussion'
      const testTopics = ['requirements', 'pain points', 'efficiency']
      const testInsights = ['User experience is a priority', 'Current system needs improvement']

      console.log('🧪 DEBUG: Attempting to save test transcript meeting...')
      
      const success = await DatabaseService.saveMeetingData(
        testMeetingId,
        testMessages,
        testMessages,
        testNotes,
        testSummary,
        5, // 5 minutes duration
        testTopics,
        testInsights,
        {
          userId: user.id,
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          stakeholderIds: selectedStakeholders.map(s => s.id),
          stakeholderNames: selectedStakeholders.map(s => s.name),
          stakeholderRoles: selectedStakeholders.map(s => s.role),
          meetingType: 'voice-transcript'
        }
      )

      if (success) {
        setTestResult('✅ Test transcript meeting saved successfully!')
        console.log('🧪 DEBUG: Test transcript meeting saved to database')
        
        // Clear cache and refresh data
        MeetingDataService.forceClearAll()
        await refreshMeetingData()
        await loadDbStats()
      } else {
        setTestResult('❌ Failed to save test transcript meeting')
        console.log('🧪 DEBUG: Test transcript meeting save failed')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`)
      console.error('🧪 DEBUG: Error saving test transcript meeting:', error)
    }

    setTimeout(() => setTestResult(''), 5000)
  }

  // Load DB stats when user changes
  useEffect(() => {
    if (user?.id && isVisible) {
      loadDbStats()
    }
  }, [user?.id, isVisible])

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.type === filter
  )

  const getLogColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'navigation': return 'text-blue-600 bg-blue-50'
      case 'localStorage': return 'text-purple-600 bg-purple-50'
      case 'state': return 'text-green-600 bg-green-50'
      case 'render': return 'text-orange-600 bg-orange-50'
      case 'error': return 'text-red-600 bg-red-50'
              default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Open Debug Console"
      >
        <Bug size={20} />
      </button>
    )
  }

  return (
          <div className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 ${
      isMinimized ? 'w-80 h-12' : 'w-96 h-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bug size={16} />
          <span className="font-medium">Debug Console</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
            {filteredLogs.length} logs
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className="p-1 hover:bg-gray-700 rounded"
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            {autoScroll ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={copyLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Copy logs"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={downloadLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Download logs"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Filter Bar */}
          <div className="p-2 bg-gray-50 border-b">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full text-xs border rounded px-2 py-1"
            >
              <option value="all">All Logs</option>
              <option value="navigation">Navigation</option>
              <option value="localStorage">LocalStorage</option>
              <option value="state">State Changes</option>
              <option value="render">Rendering</option>
              <option value="error">Errors</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Current State Info */}
          <div className="p-2 bg-blue-50 border-b text-xs">
            <div><strong>User:</strong> {user?.email || 'Not logged in'}</div>
            <div><strong>View:</strong> {currentView}</div>
            <div><strong>Project:</strong> {selectedProject?.name || 'None'}</div>
            <div><strong>Stakeholders:</strong> {selectedStakeholders.length}</div>
          </div>

          {/* Database Management */}
          {user?.id && (
            <div className="p-2 bg-red-50 border-b text-xs">
              <div className="flex items-center space-x-1 mb-2">
                <Database size={12} />
                <strong>Database Management</strong>
                <button
                  onClick={loadDbStats}
                  className="p-1 bg-blue-500 text-white rounded text-xs"
                  title="Refresh stats"
                >
                  <RefreshCw size={10} />
                </button>
              </div>
              
              {dbStats && (
                <div className="mb-2 text-xs">
                  <div>Total: {dbStats.totalMeetings} | Valid: {dbStats.validMeetings} | Corrupted: {dbStats.corruptedMeetings}</div>
                </div>
              )}
              
              <div className="flex space-x-1 flex-wrap gap-1">
                <button
                  onClick={testTranscriptMeetingSave}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                  disabled={!selectedProject || !selectedStakeholders?.length}
                >
                  Test Transcript Save
                </button>
                <button
                  onClick={fixCorruptedMeetings}
                  className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                  disabled={!dbStats || dbStats.corruptedMeetings === 0}
                >
                  Fix Corrupted
                </button>
                <button
                  onClick={resetUserData}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Reset All Data
                </button>
              </div>
              
              {dbOperationStatus && (
                <div className="mt-1 text-xs font-medium">
                  {dbOperationStatus}
                </div>
              )}
              
              {testResult && (
                <div className="mt-1 text-xs font-medium">
                  {testResult}
                </div>
              )}
            </div>
          )}

          {/* Logs */}
          <div className="h-64 overflow-y-auto p-2 space-y-1 text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`p-2 rounded border-l-2 ${getLogColor(log.type)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">[{log.timestamp}]</span>
                  <span className="text-xs font-medium">{log.type.toUpperCase()}</span>
                </div>
                <div className="font-medium">{log.category}</div>
                <div className="break-words">{log.message}</div>
                {log.data && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">Data</summary>
                                          <pre className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 p-1 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </>
      )}
    </div>
  )
}

export default DebugConsole