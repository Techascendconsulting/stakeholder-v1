import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { FileText, Download, Search, Calendar, Clock, User } from 'lucide-react'

const NotesView: React.FC = () => {
  const { meetings, stakeholders, projects } = useApp()

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Notes & Transcripts</h1>
        <p className="text-gray-600">Review your stakeholder interviews and extract key insights</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search meeting notes..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {completedMeetings.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Notes Yet</h3>
          <p className="text-gray-600 mb-6">Complete stakeholder meetings to see your notes and transcripts here</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh
          </button>
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
      )}

      {/* Tips for Note Taking */}
      {completedMeetings.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Analysis Tips</h3>
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