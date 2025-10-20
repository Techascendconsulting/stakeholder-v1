import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { DatabaseService } from '../../lib/database'
import { ArrowLeft, MessageCircle, ArrowRight, Building, Users, Check } from 'lucide-react'

const StakeholdersView: React.FC = () => {
  const { selectedProject, stakeholders, selectedStakeholders, setSelectedStakeholders, setCurrentView, user } = useApp()
  const [localSelectedStakeholders, setLocalSelectedStakeholders] = useState<string[]>([])
  const [hasActiveMeeting, setHasActiveMeeting] = useState<boolean>(false)
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null)

  // Scroll to top when component mounts
  useEffect(() => {
    // The main content area is the scrolling container, not the window
    const scrollToTop = () => {
      // Find the main scrolling container
      const mainContainer = document.querySelector('main')
      if (mainContainer) {
        mainContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        })
        // Fallback
        mainContainer.scrollTop = 0
        console.log('🔝 Scrolled main container to top - scrollTop:', mainContainer.scrollTop)
      }
      
      // Also scroll window just in case
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
      
      console.log('🔝 Scroll attempt completed')
    }
    
    // Execute immediately and after short delays to ensure it works
    scrollToTop()
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 50)
    setTimeout(scrollToTop, 100)
  }, [])

  // Check for existing meetings for the current project
  useEffect(() => {
    const checkForActiveMeeting = async () => {
      if (!selectedProject || !user?.id) return

      try {
        // Check database for in-progress meetings for this project
        const meetings = await DatabaseService.getUserMeetings(user.id)
        const projectMeetings = meetings.filter(
          meeting => meeting.project_name === selectedProject.name && meeting.status === 'in_progress'
        )

        // Also check localStorage for temporary meetings
        const localMeetings: any[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('stored_meeting_') || key.startsWith('backup_meeting_') || key.startsWith('temp-meeting-'))) {
            try {
              const meetingData = JSON.parse(localStorage.getItem(key) || '{}')
              if (meetingData.user_id === user.id && 
                  meetingData.project_name === selectedProject.name && 
                  meetingData.status !== 'completed') {
                localMeetings.push(meetingData)
              }
            } catch (error) {
              console.warn('Error parsing localStorage meeting:', key, error)
            }
          }
        }

        const activeMeetings = [...projectMeetings, ...localMeetings]
        
        if (activeMeetings.length > 0) {
          console.log('🔄 Found active meeting for project:', selectedProject.name, activeMeetings[0])
          setHasActiveMeeting(true)
          setActiveMeetingId(activeMeetings[0].id)
        } else {
          console.log('✨ No active meetings found for project:', selectedProject.name)
          setHasActiveMeeting(false)
          setActiveMeetingId(null)
        }
      } catch (error) {
        console.error('Error checking for active meetings:', error)
        setHasActiveMeeting(false)
        setActiveMeetingId(null)
      }
    }

    checkForActiveMeeting()
  }, [selectedProject, user?.id])

  if (!selectedProject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No project selected</p>
          <button 
            onClick={() => setCurrentView('projects')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  const handleStakeholderToggle = (stakeholderId: string) => {
    setLocalSelectedStakeholders(prev => {
      if (prev.includes(stakeholderId)) {
        return prev.filter(id => id !== stakeholderId)
      } else {
        return [...prev, stakeholderId]
      }
    })
  }

  const handleStartGroupMeeting = () => {
    // Always let users choose meeting mode, even for continuing meetings
    const relevantStakeholders = stakeholders.filter(stakeholder => {
      if (!selectedProject?.relevantStakeholders) {
        return true;
      }
      return selectedProject.relevantStakeholders.includes(stakeholder.id);
    });
    
    const selectedStakeholderObjects = relevantStakeholders.filter(s => 
      localSelectedStakeholders.includes(s.id)
    )
    console.log('🎯 DEBUG: Starting meeting with stakeholders:', selectedStakeholderObjects.map(s => s.name))
    
    // Save to AppContext
    setSelectedStakeholders(selectedStakeholderObjects)
    
    // IMPORTANT: Save to localStorage to persist selection across navigation
    localStorage.setItem('selectedStakeholders', JSON.stringify(selectedStakeholderObjects))
    console.log('💾 SAVED: Selected stakeholders to localStorage:', selectedStakeholderObjects.map(s => s.name))
    
    if (hasActiveMeeting && activeMeetingId) {
      console.log('🔄 Continuing existing meeting:', activeMeetingId, '- but allowing mode selection')
    }
    
    console.log('🎯 DEBUG: Setting current view to meeting mode selection')
    setCurrentView('meeting-mode-selection')
  }

  const isStakeholderSelected = (stakeholderId: string) => {
    return localSelectedStakeholders.includes(stakeholderId)
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('stage-selection')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-gray-100 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Stage Selection</span>
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Stakeholder Selection</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl">
            Select one or more stakeholders for your requirements elicitation session. You can conduct individual interviews or group meetings with multiple participants.
          </p>
        </div>

        {/* Selection Summary */}
        {(localSelectedStakeholders.length > 0 || hasActiveMeeting) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {hasActiveMeeting 
                      ? 'Meeting In Progress' 
                      : `${localSelectedStakeholders.length} Stakeholder${localSelectedStakeholders.length !== 1 ? 's' : ''} Selected`
                    }
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {hasActiveMeeting 
                      ? 'Resume your in-progress meeting'
                      : `${localSelectedStakeholders.length === 1 ? 'Individual interview' : 'Group meeting'} ready to begin`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartGroupMeeting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 shadow-sm hover:shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>
                  {hasActiveMeeting 
                    ? 'Continue Meeting' 
                    : `Start ${localSelectedStakeholders.length === 1 ? 'Interview' : 'Group Meeting'}`
                  }
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stakeholders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {stakeholders
            .filter(stakeholder => {
              // Show only relevant stakeholders for the selected project
              if (!selectedProject?.relevantStakeholders) {
                return true; // If no relevantStakeholders defined, show all (backward compatibility)
              }
              return selectedProject.relevantStakeholders.includes(stakeholder.id);
            })
            .map((stakeholder) => {
            const isSelected = isStakeholderSelected(stakeholder.id)
            
            return (
              <div
                key={stakeholder.id}
                onClick={() => handleStakeholderToggle(stakeholder.id)}
                className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Profile Image with Checkmark */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={stakeholder.photo}
                      alt={stakeholder.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Stakeholder Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stakeholder.name}
                    </h3>
                    <div className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {stakeholder.role}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {stakeholder.department}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {stakeholder.bio}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Meeting Format Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Meeting Format Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Individual Interviews</h4>
              </div>
              <p className="text-gray-700 mb-4">
                One-on-one sessions allow for deeper, more focused conversations and help build stronger stakeholder relationships.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• More detailed responses and personal insights</li>
                <li>• Reduced influence from group dynamics</li>
                <li>• Easier to manage and control conversation flow</li>
                <li>• Better for sensitive or confidential topics</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Group Meetings</h4>
              </div>
              <p className="text-gray-700 mb-4">
                Multi-stakeholder sessions enable cross-functional discussion and help identify conflicting requirements early.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Efficient way to gather multiple perspectives</li>
                <li>• Reveals conflicts and dependencies between roles</li>
                <li>• Encourages collaborative problem-solving</li>
                <li>• Builds consensus and shared understanding</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Guidelines */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Professional Meeting Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-base font-semibold text-blue-900 mb-3">Preparation</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Review each stakeholder's background and priorities</li>
                <li>• Prepare role-specific questions for each participant</li>
                <li>• Plan meeting structure and time allocation</li>
                <li>• Set clear objectives and expected outcomes</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold text-purple-900 mb-3">Facilitation</h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Ensure all voices are heard equally</li>
                <li>• Manage group dynamics and conflicts</li>
                <li>• Keep discussions focused and on-topic</li>
                <li>• Document key insights and decisions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold text-emerald-900 mb-3">Follow-up</h4>
              <ul className="text-sm text-emerald-800 space-y-2">
                <li>• Summarize key findings and next steps</li>
                <li>• Validate understanding with participants</li>
                <li>• Identify areas needing further clarification</li>
                <li>• Plan additional sessions if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeholdersView
