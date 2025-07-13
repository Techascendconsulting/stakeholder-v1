import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, Users, Sparkles, ArrowRight, RefreshCw } from 'lucide-react'

const CustomStakeholdersView: React.FC = () => {
  const { customProject, setCurrentView, setSelectedStakeholders } = useApp()
  const [generatedStakeholders, setGeneratedStakeholders] = useState<any[]>([])
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    if (customProject) {
      generateStakeholders()
    }
  }, [customProject])

  const generateStakeholders = () => {
    setIsGenerating(true)
    
    // Simulate AI generation based on project context
    setTimeout(() => {
      const stakeholders = customProject?.stakeholderRoles.map((role, index) => ({
        id: `custom-stakeholder-${index}`,
        name: generateName(role),
        role: role,
        department: getDepartment(role),
        bio: generateBio(role, customProject?.industry),
        photo: `https://images.pexels.com/photos/${getPhotoId(index)}/pexels-photo-${getPhotoId(index)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
        personality: generatePersonality(role),
        priorities: generatePriorities(role, customProject?.projectType),
        voice: getVoiceId(index),
        isCustom: true
      })) || []

      setGeneratedStakeholders(stakeholders)
      setIsGenerating(false)
    }, 2000)
  }

  const generateName = (role: string): string => {
    const firstNames = ['Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Rachel', 'Tom', 'Anna', 'Chris']
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas']
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${firstName} ${lastName}`
  }

  const getDepartment = (role: string): string => {
    const departmentMap: Record<string, string> = {
      'Operations Manager': 'Operations',
      'IT Director': 'Information Technology',
      'Customer Service Lead': 'Customer Service',
      'Finance Manager': 'Finance',
      'HR Director': 'Human Resources',
      'Marketing Manager': 'Marketing',
      'Sales Director': 'Sales',
      'Compliance Officer': 'Compliance',
      'Project Manager': 'Project Management Office'
    }
    
    return departmentMap[role] || 'Business Operations'
  }

  const generateBio = (role: string, industry?: string): string => {
    const experiences = [8, 10, 12, 15, 18]
    const experience = experiences[Math.floor(Math.random() * experiences.length)]
    
    return `Experienced ${role.toLowerCase()} with ${experience} years in ${industry || 'the industry'}. Specializes in process optimization, stakeholder management, and strategic planning. Known for analytical thinking and collaborative approach to problem-solving.`
  }

  const generatePersonality = (role: string): string => {
    const personalities = [
      'Analytical and detail-oriented, prefers data-driven decisions',
      'Collaborative and people-focused, values team input',
      'Strategic thinker with focus on long-term outcomes',
      'Practical and results-oriented, emphasizes efficiency',
      'Innovative and forward-thinking, embraces change'
    ]
    
    return personalities[Math.floor(Math.random() * personalities.length)]
  }

  const generatePriorities = (role: string, projectType?: string): string[] => {
    const basePriorities: Record<string, string[]> = {
      'Operations Manager': ['Process efficiency', 'Cost reduction', 'Quality improvement'],
      'IT Director': ['System integration', 'Security', 'Technical feasibility'],
      'Customer Service Lead': ['Customer satisfaction', 'Response times', 'Service quality'],
      'Finance Manager': ['Budget control', 'ROI measurement', 'Cost analysis'],
      'HR Director': ['Change management', 'Training needs', 'Employee engagement']
    }
    
    return basePriorities[role] || ['Process improvement', 'Stakeholder satisfaction', 'Project success']
  }

  const getPhotoId = (index: number): number => {
    const photoIds = [1043471, 774909, 1222271, 1181686, 1181424, 3778876, 3760263, 2566581, 15543115, 7688339]
    return photoIds[index % photoIds.length]
  }

  const getVoiceId = (index: number): string => {
    const voices = ['en-GB-RyanNeural', 'en-GB-LibbyNeural', 'en-GB-ThomasNeural', 'en-GB-SoniaNeural', 'en-GB-AbbiNeural']
    return voices[index % voices.length]
  }

  const handleStakeholderToggle = (stakeholderId: string) => {
    setSelectedStakeholderIds(prev => 
      prev.includes(stakeholderId)
        ? prev.filter(id => id !== stakeholderId)
        : [...prev, stakeholderId]
    )
  }

  const handleStartMeeting = () => {
    const selectedStakeholders = generatedStakeholders.filter(s => 
      selectedStakeholderIds.includes(s.id)
    )
    setSelectedStakeholders(selectedStakeholders)
    setCurrentView('meeting')
  }

  if (!customProject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">No custom project found</p>
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

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating AI Stakeholders</h2>
          <p className="text-gray-600 mb-6">Creating realistic stakeholders based on your project context...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('custom-project')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Project Setup</span>
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI-Generated Stakeholders</h1>
          <p className="text-lg text-gray-600 max-w-4xl">
            Based on your project "<span className="font-semibold text-gray-900">{customProject.name}</span>", 
            we've generated realistic stakeholders who will adapt to your specific context during interviews.
          </p>
        </div>

        {/* Project Context Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Project Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Industry:</span>
              <span className="ml-2 text-gray-600">{customProject.industry}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600">{customProject.projectType}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Complexity:</span>
              <span className="ml-2 text-gray-600">{customProject.complexity}</span>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedStakeholderIds.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedStakeholderIds.length} Stakeholder{selectedStakeholderIds.length !== 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ready to practice {selectedStakeholderIds.length === 1 ? 'individual interview' : 'group meeting'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartMeeting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3 shadow-sm hover:shadow-md"
              >
                <span>Start Practice Session</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Generated Stakeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {generatedStakeholders.map((stakeholder) => {
            const isSelected = selectedStakeholderIds.includes(stakeholder.id)
            
            return (
              <div 
                key={stakeholder.id} 
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-100' 
                    : 'border-gray-200 hover:shadow-lg hover:border-gray-300'
                }`}
                onClick={() => handleStakeholderToggle(stakeholder.id)}
              >
                {/* Selection Indicator */}
                <div className={`h-2 ${isSelected ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-100'}`}></div>
                
                <div className="p-8">
                  {/* Selection Status */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-600 border-purple-600' 
                        : 'border-gray-300 hover:border-purple-400'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isSelected 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isSelected ? 'Selected' : 'Available'}
                    </div>
                  </div>

                  {/* Stakeholder Info */}
                  <div className="flex items-start space-x-4 mb-6">
                    <img
                      src={stakeholder.photo}
                      alt={stakeholder.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{stakeholder.name}</h3>
                      <p className="text-base font-semibold text-purple-600 mb-1">{stakeholder.role}</p>
                      <p className="text-sm text-gray-600">{stakeholder.department}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Background</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{stakeholder.bio}</p>
                  </div>

                  {/* Priorities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Key Priorities</h4>
                    <div className="space-y-2">
                      {stakeholder.priorities.map((priority: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-700 font-medium">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personality */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Communication Style</h4>
                    <p className="text-sm text-gray-700 italic">{stakeholder.personality}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Regenerate Option */}
        <div className="text-center mb-8">
          <button
            onClick={generateStakeholders}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Regenerate Stakeholders</span>
          </button>
        </div>

        {/* Practice Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Practice Session Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-semibold text-purple-900 mb-3">Before You Start</h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Review each stakeholder's background and priorities</li>
                <li>• Prepare both As-Is and To-Be questions</li>
                <li>• Consider the stakeholder's perspective and concerns</li>
                <li>• Plan your interview structure and objectives</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold text-blue-900 mb-3">During the Session</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Use the Question Helper for guided questions</li>
                <li>• Listen actively and ask follow-up questions</li>
                <li>• Take notes on key insights and requirements</li>
                <li>• Practice your facilitation and communication skills</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomStakeholdersView