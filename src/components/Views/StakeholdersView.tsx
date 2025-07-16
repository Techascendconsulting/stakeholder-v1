import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, MessageCircle, ArrowRight, Building, Users, Check } from 'lucide-react'

const StakeholdersView: React.FC = () => {
  const { selectedProject, stakeholders, setSelectedStakeholders, setCurrentView } = useApp()
  const [localSelectedStakeholders, setLocalSelectedStakeholders] = useState<string[]>([])

  if (!selectedProject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">No project selected</p>
          <button 
            onClick={() => setCurrentView('projects')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Projects
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
    const selectedStakeholderObjects = stakeholders.filter(s => 
      localSelectedStakeholders.includes(s.id)
    )
    console.log('🎯 DEBUG: Starting meeting with stakeholders:', selectedStakeholderObjects.map(s => s.name))
    setSelectedStakeholders(selectedStakeholderObjects)
    console.log('🎯 DEBUG: Setting current view to meeting')
    setCurrentView('meeting')
  }

  const isStakeholderSelected = (stakeholderId: string) => {
    return localSelectedStakeholders.includes(stakeholderId)
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('project-brief')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Project Brief</span>
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Stakeholder Selection</h1>
          <p className="text-lg text-gray-600 max-w-4xl">
            Select stakeholders to include in your requirements gathering session for the <span className="font-semibold text-gray-900">{selectedProject.name}</span> project. 
            You can choose to meet with individual stakeholders or conduct group meetings with multiple participants.
          </p>
        </div>

        {/* Selection Summary */}
        {localSelectedStakeholders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {localSelectedStakeholders.length} Stakeholder{localSelectedStakeholders.length !== 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-sm text-gray-600">
                    {localSelectedStakeholders.length === 1 ? 'Individual interview' : 'Group meeting'} ready to begin
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartGroupMeeting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 shadow-sm hover:shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start {localSelectedStakeholders.length === 1 ? 'Interview' : 'Group Meeting'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stakeholders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {stakeholders.map((stakeholder) => {
            const isSelected = isStakeholderSelected(stakeholder.id)
            
            return (
              <div 
                key={stakeholder.id} 
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' 
                    : 'border-gray-200 hover:shadow-lg hover:border-gray-300'
                }`}
                onClick={() => handleStakeholderToggle(stakeholder.id)}
              >
                {/* Selection Indicator */}
                <div className={`h-2 ${isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-100'}`}></div>
                
                <div className="p-8">
                  {/* Selection Checkbox */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isSelected ? 'Selected' : 'Available'}
                    </div>
                  </div>

                  {/* Photo and Basic Info */}
                  <div className="flex items-start space-x-4 mb-6">
                    <img
                      src={stakeholder.photo}
                      alt={stakeholder.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{stakeholder.name}</h3>
                      <p className="text-base font-semibold text-blue-600 mb-1">{stakeholder.role}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{stakeholder.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Background */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Professional Background</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{stakeholder.bio}</p>
                  </div>

                  {/* Key Priorities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Key Priorities</h4>
                    <div className="space-y-2">
                      {stakeholder.priorities.slice(0, 2).map((priority, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-700 font-medium">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Communication Style */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Communication Style</h4>
                    <p className="text-sm text-gray-700 italic">{stakeholder.personality}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Meeting Format Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Meeting Format Options</h3>
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
              <ul className="text-sm text-gray-600 space-y-2">
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
              <ul className="text-sm text-gray-600 space-y-2">
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
          <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Meeting Guidelines</h3>
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