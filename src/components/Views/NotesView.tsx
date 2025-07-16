import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { FileText, Download, Search, Calendar, Clock, User, BookOpen, Users, Target, AlertTriangle } from 'lucide-react'

interface MeetingNote {
  id: string
  title: string
  content: string
  projectId: string
  meetingType: string
  participants: string
  date: string
  duration: string
  createdBy: string
}

const NotesView: React.FC = () => {
  const { meetings, stakeholders, projects } = useApp()
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'notes' | 'transcripts'>('notes')

  // Load meeting notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('meetingNotes')
    if (savedNotes) {
      try {
        const notes = JSON.parse(savedNotes)
        setMeetingNotes(notes.sort((a: MeetingNote, b: MeetingNote) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ))
      } catch (error) {
        console.error('Error loading meeting notes:', error)
      }
    }
  }, [])

  const getStakeholderNames = (stakeholderIds: string[]) => {
    const names = stakeholderIds.map(id => {
      const stakeholder = stakeholders.find(s => s.id === id)
      return stakeholder?.name || 'Unknown'
    })
    return names.length > 1 ? names.join(', ') : names[0] || 'Unknown'
  }

  const getStakeholderById = (id: string) => {
    return stakeholders.find(s => s.id === id)
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const completedMeetings = meetings.filter(m => m.status === 'completed')

  // Filter notes based on search term
  const filteredNotes = meetingNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.participants.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format the AI-generated content for better display
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        line = line.trim()
        if (!line) return null
        
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6">{line.substring(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-5">{line.substring(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium text-gray-700 mb-2 mt-4">{line.substring(4)}</h3>
        }
        
        // Bold text
        if (line.includes('**')) {
          const parts = line.split('**')
          return (
            <p key={index} className="mb-2 text-gray-700">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
              )}
            </p>
          )
        }
        
        // Bullet points
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 mb-1 text-gray-700">{line.substring(2)}</li>
        }
        
        // Separator
        if (line.startsWith('---')) {
          return <hr key={index} className="my-4 border-gray-300" />
        }
        
        // Regular paragraph
        if (line.length > 0) {
          return <p key={index} className="mb-2 text-gray-700 leading-relaxed">{line}</p>
        }
        
        return null
      })
      .filter(Boolean)
  }

  const exportNotes = (note: MeetingNote) => {
    const blob = new Blob([note.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Notes & Analysis</h1>
        <p className="text-gray-600">Review comprehensive interview notes and conversation transcripts</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('notes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Interview Notes ({meetingNotes.length})
            </button>
            <button
              onClick={() => setSelectedTab('transcripts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'transcripts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Raw Transcripts ({completedMeetings.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${selectedTab === 'notes' ? 'interview notes' : 'transcripts'}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {selectedTab === 'notes' ? (
        /* AI-Generated Interview Notes */
        filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Notes Yet</h3>
            <p className="text-gray-600 mb-6">End a stakeholder meeting to generate comprehensive interview notes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Note Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{note.participants}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(note.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{note.duration}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => exportNotes(note)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Formatted Content */}
                <div className="p-6">
                  <div className="prose max-w-none">
                    {formatContent(note.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Raw Transcripts */
        completedMeetings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcripts Yet</h3>
            <p className="text-gray-600 mb-6">Complete stakeholder meetings to see conversation transcripts here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {completedMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Meeting Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {meeting.meetingType === 'group' ? 'Group Meeting' : 'Individual Interview'} 
                        {meeting.meetingType === 'group' ? ` (${meeting.stakeholderIds.length} participants)` : ` with ${getStakeholderNames(meeting.stakeholderIds)}`}
                      </h3>
                      <p className="text-sm text-gray-600">{getProjectName(meeting.projectId)}</p>
                      {meeting.meetingType === 'group' && (
                        <p className="text-sm text-gray-500 mt-1">
                          Participants: {getStakeholderNames(meeting.stakeholderIds)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.duration} min</span>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Conversation Transcript</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {meeting.transcript.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        {message.speaker === 'user' ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        ) : (
                          <img
                            src={getStakeholderById(message.speaker)?.photo}
                            alt={message.stakeholderName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {message.speaker === 'user' ? 'You' : message.stakeholderName}
                            </span>
                            {message.speaker !== 'user' && message.stakeholderRole && (
                              <span className="text-xs text-blue-600 font-medium">
                                {message.stakeholderRole}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Analysis Tips */}
      {(selectedTab === 'notes' ? filteredNotes.length : completedMeetings.length) > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Analysis Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Look for common themes across different stakeholder interviews</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Identify conflicting requirements that need resolution</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Extract specific functional and non-functional requirements</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Note any assumptions or constraints mentioned by stakeholders</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesView