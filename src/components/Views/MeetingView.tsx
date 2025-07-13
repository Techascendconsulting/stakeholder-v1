import React, { useState, useEffect, useCallback } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag } from 'lucide-react'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { messageQueue, QueuedMessage } from '../../lib/messageQueue'
import { audioOrchestrator, AudioPlaybackState } from '../../lib/audioOrchestrator'
import { DatabaseService, Project, Stakeholder, Message, Student } from '../../lib/database'
import { useApp } from '../../contexts/AppContext'
import { QuestionBankService, QuestionTemplate } from '../../lib/questionBank'

const MeetingView: React.FC = () => {
  console.log('🎬 DEBUG: MeetingView component rendered')
  const { selectedProject, selectedStakeholders, user, setCurrentView } = useApp()
  console.log('🎬 DEBUG: MeetingView data:', {
    selectedProject: selectedProject?.name || 'null',
    selectedStakeholders: selectedStakeholders?.length || 0,
    user: user?.email || 'null'
  })
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCustomQuestionForm, setShowCustomQuestionForm] = useState(false)
  const [customQuestion, setCustomQuestion] = useState('')
  const [audioState, setAudioState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentMessageId: null,
    queueLength: 0,
    currentPosition: 0,
    duration: 0
  })
  const [processedMessages, setProcessedMessages] = useState<QueuedMessage[]>([])

  // Initialize meeting when project and stakeholders are selected
  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0 && user) {
      initializeMeeting()
    }
  }, [selectedProject, selectedStakeholders, user])

  // Subscribe to audio state changes
  useEffect(() => {
    const handleStateChange = (state: AudioPlaybackState) => {
      setAudioState(state)
    }

    audioOrchestrator.onStateChange(handleStateChange)
    return () => audioOrchestrator.offStateChange(handleStateChange)
  }, [])

  // Subscribe to message queue processing
  useEffect(() => {
    const handleMessageProcessed = (message: QueuedMessage) => {
      setProcessedMessages(prev => [...prev, message])
    }

    messageQueue.onMessageProcessed(handleMessageProcessed)
    return () => messageQueue.offMessageProcessed(handleMessageProcessed)
  }, [])

  // Generate suggested questions based on project and stakeholder
  const getSuggestedQuestions = (category: 'as-is' | 'to-be'): QuestionTemplate[] => {
    if (!selectedProject || selectedStakeholders.length === 0) return []

    const stakeholderRole = selectedStakeholders[0]?.role || ''
    let questions = QuestionBankService.getQuestionsForStakeholder(
      stakeholderRole,
      selectedProject.name,
      category
    )

    // Apply search filter
    if (searchTerm) {
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      questions = questions.filter(q => 
        selectedTags.some(tag => q.tags.includes(tag))
      )
    }

    return questions
  }

  const handleQuestionClick = (questionTemplate: QuestionTemplate) => {
    setInputMessage(questionTemplate.question)
    setShowQuestionHelper(false)
  }

  const handleAddCustomQuestion = () => {
    if (!customQuestion.trim() || selectedStakeholders.length === 0) return

    const stakeholderRole = selectedStakeholders[0]?.role || ''
    QuestionBankService.addCustomQuestion({
      category: selectedQuestionCategory,
      stakeholderRoles: [stakeholderRole],
      projectTypes: [],
      question: customQuestion,
      tags: ['custom'],
      priority: 'medium'
    })

    setCustomQuestion('')
    setShowCustomQuestionForm(false)
  }

  const availableTags = QuestionBankService.getQuestionTags()

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSaveNotes = async () => {
    if (!currentMeetingId || messages.length === 0) return
    
    // Save meeting notes - this could be enhanced to save to a specific notes table
    console.log('Saving meeting notes for meeting:', currentMeetingId)
    alert('Meeting notes saved successfully!')
  }

  const handleAnalyzeAnswers = () => {
    if (messages.length === 0) {
      alert('No conversation to analyze yet. Please conduct the interview first.')
      return
    }
    
    // Store the current meeting data for analysis
    const analysisData = {
      project: selectedProject,
      stakeholders: selectedStakeholders,
      messages: messages,
      meetingId: currentMeetingId
    }
    
    // Store in sessionStorage for the analysis page
    sessionStorage.setItem('meetingAnalysis', JSON.stringify(analysisData))
    
    // Navigate to analysis page
    setCurrentView('analysis')
  }

  const initializeMeeting = async () => {
    if (!selectedProject || !user) return

    try {
      // Create a new meeting in the database
      const meetingId = await DatabaseService.createMeeting(
        selectedProject.id,
        user.id,
        selectedStakeholders.map(s => s.id),
        selectedStakeholders.length > 1 ? 'group' : 'individual'
      )

      if (meetingId) {
        setCurrentMeetingId(meetingId)
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          meeting_id: meetingId,
          speaker_type: 'system',
          content: `Welcome to your meeting for ${selectedProject.name}. The following stakeholders are present: ${selectedStakeholders.map(s => s.name).join(', ')}. `,
          sequence_number: 1,
          created_at: new Date().toISOString()
        }

        setMessages([welcomeMessage])
        await DatabaseService.saveMessage(
          meetingId,
          'system',
          welcomeMessage.content
        )
      }
    } catch (error) {
      console.error('Error initializing meeting:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProject || !currentMeetingId || isLoading) return

    setIsLoading(true)

    try {
      // Add user message to the conversation
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        meeting_id: currentMeetingId,
        speaker_type: 'ba',
        speaker_id: user.id,
        content: inputMessage,
        sequence_number: messages.length + 1,
        created_at: new Date().toISOString()
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      // Save user message to database
      await DatabaseService.saveMessage(
        currentMeetingId,
        'ba',
        inputMessage,
        user.id
      )

      // Get first interaction status for all stakeholders
      const firstInteractionStatus = await DatabaseService.getFirstInteractionStatus(
        user.id,
        selectedStakeholders.map(s => s.id),
        selectedProject.id
      )

      // Generate AI response
      const aiResponse = await stakeholderAI.generateResponse(
        selectedProject,
        selectedStakeholders,
        updatedMessages,
        inputMessage,
        user.id,
        firstInteractionStatus
      )

      // Parse and queue the AI response for audio playback
      const queuedMessages = await messageQueue.parseAndQueueResponse(
        aiResponse,
        selectedStakeholders,
        true // Auto-play audio
      )

      // Add AI response to messages
      const aiMessage: Message = {
        id: aiResponse.id,
        meeting_id: currentMeetingId,
        speaker_type: 'stakeholder',
        speaker_id: aiResponse.speaker,
        content: aiResponse.content,
        sequence_number: updatedMessages.length + 1,
        created_at: aiResponse.timestamp
      }

      setMessages(prev => [...prev, aiMessage])

      // Save AI response to database
      await DatabaseService.saveMessage(
        currentMeetingId,
        'stakeholder',
        aiResponse.content,
        aiResponse.speaker
      )

      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAudioControl = (action: 'play' | 'pause' | 'stop' | 'skip') => {
    switch (action) {
      case 'play':
        if (audioState.isPaused) {
          audioOrchestrator.resume()
        } else {
          messageQueue.resumeProcessing(selectedStakeholders)
        }
        break
      case 'pause':
        audioOrchestrator.pause()
        messageQueue.pauseProcessing()
        break
      case 'stop':
        audioOrchestrator.stop()
        messageQueue.stopProcessing()
        break
      case 'skip':
        audioOrchestrator.skipToNext()
        break
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Active</h3>
          <p className="text-gray-600 mb-4">Select a project and stakeholders to start a meeting.</p>
          <button
            onClick={() => setCurrentView('stakeholders')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Stakeholder Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting: {selectedProject.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Participants: {selectedStakeholders.map(s => s.name).join(', ')}
            </p>
          </div>
          
          {/* Question Helper Toggle */}
          <button
            onClick={() => setShowQuestionHelper(!showQuestionHelper)}
            className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Question Helper</span>
            {showQuestionHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Question Helper Panel */}
        {showQuestionHelper && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
            {/* Header with Category Tabs */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-900">
                Question Bank for {selectedStakeholders[0]?.role || 'Stakeholder'}
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                  <button
                    onClick={() => setSelectedQuestionCategory('as-is')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedQuestionCategory === 'as-is'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    As-Is Process ({getSuggestedQuestions('as-is').length})
                  </button>
                  <button
                    onClick={() => setSelectedQuestionCategory('to-be')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedQuestionCategory === 'to-be'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    To-Be Vision ({getSuggestedQuestions('to-be').length})
                  </button>
                </div>
                <button
                  onClick={() => setShowCustomQuestionForm(!showCustomQuestionForm)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom</span>
                </button>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear
                </button>
              </div>

              {/* Tag Filter */}
              <div className="flex items-center space-x-2 flex-wrap">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Filter by topic:</span>
                {availableTags.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Custom Question Form */}
            {showCustomQuestionForm && (
              <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Add Custom Question</h4>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Enter your custom question..."
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleAddCustomQuestion}
                    disabled={!customQuestion.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomQuestionForm(false)
                      setCustomQuestion('')
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Questions Grid */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getSuggestedQuestions(selectedQuestionCategory).map((questionTemplate, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(questionTemplate)}
                  className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 group-hover:text-blue-900 font-medium">
                        {questionTemplate.question}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          questionTemplate.priority === 'high' ? 'bg-red-100 text-red-800' :
                          questionTemplate.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {questionTemplate.priority === 'high' && <Star className="w-3 h-3 mr-1" />}
                          {questionTemplate.priority}
                        </span>
                        <div className="flex items-center space-x-1">
                          {questionTemplate.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                          {questionTemplate.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{questionTemplate.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {getSuggestedQuestions(selectedQuestionCategory).length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchTerm || selectedTags.length > 0 
                      ? 'No questions match your search criteria'
                      : `No ${selectedQuestionCategory} questions available for this stakeholder role`
                    }
                  </p>
                  {(searchTerm || selectedTags.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedTags([])
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Question Bank Stats */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-700">
                <span>
                  Showing {getSuggestedQuestions(selectedQuestionCategory).length} questions
                  {selectedStakeholders[0] && ` for ${selectedStakeholders[0].role}`}
                </span>
                <span>
                  {searchTerm && `Search: "${searchTerm}"`}
                  {selectedTags.length > 0 && ` • ${selectedTags.length} filter${selectedTags.length !== 1 ? 's' : ''} active`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Controls */}
      {(audioState.isPlaying || audioState.isPaused || audioState.queueLength > 0) && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {audioState.isPlaying ? (
                  <button
                    onClick={() => handleAudioControl('pause')}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Pause size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAudioControl('play')}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Play size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => handleAudioControl('stop')}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Square size={16} />
                </button>
                
                <button
                  onClick={() => handleAudioControl('skip')}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {audioState.isPlaying && (
                  <span>
                    {formatTime(audioState.currentPosition)} / {formatTime(audioState.duration)}
                  </span>
                )}
                {audioState.queueLength > 0 && (
                  <span className="ml-4">
                    Queue: {audioState.queueLength} message{audioState.queueLength !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {audioState.isPlaying ? (
                <Volume2 size={16} className="text-green-600" />
              ) : (
                <VolumeX size={16} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {audioState.duration > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(audioState.currentPosition / audioState.duration) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.speaker_type === 'ba' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.speaker_type === 'ba'
                  ? 'bg-blue-600 text-white'
                  : message.speaker_type === 'system'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.speaker_type === 'stakeholder' && (
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {selectedStakeholders.find(s => s.id === message.speaker_id)?.name || 'Stakeholder'}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Show currently processing messages */}
        {processedMessages.map((message) => (
          <div key={`processed-${message.id}`} className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-yellow-100 text-gray-900 border-l-4 border-yellow-500">
              <div className="text-xs font-semibold mb-1 text-yellow-700">
                🔊 {message.stakeholderName} (Speaking...)
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Stakeholders are thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to the stakeholders..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        
        {/* Action Buttons */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveNotes}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
              <button
                onClick={handleAnalyzeAnswers}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyze Answers</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingView