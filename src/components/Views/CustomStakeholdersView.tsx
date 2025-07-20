import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, Users, Sparkles, ArrowRight, RefreshCw, Plus, Edit3, Trash2, Save, X } from 'lucide-react'

const CustomStakeholdersView: React.FC = () => {
  const { customProject, setCurrentView, setSelectedStakeholders } = useApp()
  const [generatedStakeholders, setGeneratedStakeholders] = useState<any[]>([])
  const [manualStakeholders, setManualStakeholders] = useState<any[]>([])
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStakeholder, setEditingStakeholder] = useState<any>(null)
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    role: '',
    department: '',
    bio: '',
    personality: '',
    priorities: ['', '', '']
  })

  const generateStakeholders = () => {
    setIsGenerating(true)
    
    // Generate stakeholders based on project context
    setTimeout(() => {
      // Use project context to generate relevant stakeholders
      const relevantRoles = getRelevantStakeholderRoles(customProject)
      const stakeholders = relevantRoles.map((roleData, index) => ({
        id: `custom-stakeholder-${index}`,
        name: generateName(roleData.role),
        role: roleData.role,
        department: roleData.department,
        bio: roleData.bio,
        photo: `https://images.pexels.com/photos/${getPhotoId(index)}/pexels-photo-${getPhotoId(index)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
        personality: roleData.personality,
        priorities: roleData.priorities,
        voice: getVoiceId(index),
        isCustom: true
      }))

      setGeneratedStakeholders(stakeholders)
      setHasGeneratedAI(true)
      setIsGenerating(false)
    }, 2000)
  }

  const getRelevantStakeholderRoles = (project: any) => {
    if (!project) return []

    // Base stakeholders that apply to most projects
    const baseStakeholders = [
      {
        role: 'Project Sponsor',
        department: 'Executive Leadership',
        bio: `Senior executive sponsor for the ${project.name} initiative with 15+ years of leadership experience in ${project.industry || 'the industry'}. Responsible for strategic oversight, budget approval, and ensuring project alignment with organizational goals.`,
        personality: 'Strategic, results-focused, interested in ROI and business impact',
        priorities: ['Strategic alignment', 'Budget management', 'Business value delivery']
      },
      {
        role: 'Operations Manager',
        department: 'Operations',
        bio: `Operations manager with 12 years of experience in process optimization and operational excellence. Deep understanding of current ${project.projectType || 'business'} processes and day-to-day operational challenges.`,
        personality: 'Process-oriented, practical, focused on efficiency and quality',
        priorities: ['Process efficiency', 'Operational stability', 'Resource optimization']
      }
    ]

    // Add industry-specific stakeholders
    const industryStakeholders = getIndustrySpecificStakeholders(project.industry, project)
    
    // Add project-type specific stakeholders
    const projectTypeStakeholders = getProjectTypeSpecificStakeholders(project.projectType, project)

    // Combine and limit to 5 stakeholders
    const allStakeholders = [...baseStakeholders, ...industryStakeholders, ...projectTypeStakeholders]
    return allStakeholders.slice(0, 5)
  }

  const getIndustrySpecificStakeholders = (industry: string, project: any) => {
    const industryMap: Record<string, any[]> = {
      'Financial Services': [
        {
          role: 'Compliance Officer',
          department: 'Risk & Compliance',
          bio: `Compliance specialist with 10 years in financial services regulation. Ensures all ${project.name} changes meet regulatory requirements including SOX, PCI-DSS, and industry-specific compliance standards.`,
          personality: 'Detail-oriented, risk-aware, regulatory-focused',
          priorities: ['Regulatory compliance', 'Risk mitigation', 'Audit readiness']
        },
        {
          role: 'Customer Experience Manager',
          department: 'Customer Experience',
          bio: `Customer experience leader with expertise in financial services customer journey optimization. Focuses on improving customer satisfaction and reducing friction in financial processes.`,
          personality: 'Customer-centric, analytical, service-focused',
          priorities: ['Customer satisfaction', 'User experience', 'Service quality']
        }
      ],
      'Healthcare': [
        {
          role: 'Clinical Operations Director',
          department: 'Clinical Operations',
          bio: `Healthcare operations leader with 14 years in clinical process improvement. Specializes in patient care workflows, clinical efficiency, and healthcare quality standards.`,
          personality: 'Patient-focused, quality-driven, collaborative',
          priorities: ['Patient care quality', 'Clinical efficiency', 'Safety standards']
        },
        {
          role: 'Health Information Manager',
          department: 'Health Information',
          bio: `Health information specialist ensuring HIPAA compliance and data security in healthcare systems. Expert in medical records management and healthcare data privacy.`,
          personality: 'Security-conscious, detail-oriented, privacy-focused',
          priorities: ['Data privacy', 'HIPAA compliance', 'Information security']
        }
      ],
      'Technology': [
        {
          role: 'Technical Architect',
          department: 'Engineering',
          bio: `Senior technical architect with 12 years in enterprise software development. Responsible for technical feasibility, system architecture, and integration planning for ${project.name}.`,
          personality: 'Technical, analytical, solution-oriented',
          priorities: ['Technical feasibility', 'System scalability', 'Integration capabilities']
        },
        {
          role: 'Product Manager',
          department: 'Product Management',
          bio: `Product management leader with expertise in technology product development and user experience. Focuses on feature prioritization and product-market fit.`,
          personality: 'User-focused, strategic, data-driven',
          priorities: ['User needs', 'Product vision', 'Market requirements']
        }
      ],
      'Manufacturing': [
        {
          role: 'Production Manager',
          department: 'Manufacturing',
          bio: `Manufacturing operations manager with 15 years in production optimization and lean manufacturing. Expert in production workflows, quality control, and operational efficiency.`,
          personality: 'Efficiency-focused, quality-driven, practical',
          priorities: ['Production efficiency', 'Quality control', 'Cost optimization']
        },
        {
          role: 'Supply Chain Manager',
          department: 'Supply Chain',
          bio: `Supply chain specialist with expertise in vendor management, inventory optimization, and logistics coordination. Focuses on supply chain efficiency and cost management.`,
          personality: 'Analytical, cost-conscious, relationship-focused',
          priorities: ['Supply chain efficiency', 'Cost management', 'Vendor relationships']
        }
      ],
      'Retail': [
        {
          role: 'Store Operations Manager',
          department: 'Retail Operations',
          bio: `Retail operations manager with 11 years in multi-location retail management. Expert in customer service, inventory management, and store operational efficiency.`,
          personality: 'Customer-focused, operationally-minded, results-driven',
          priorities: ['Customer experience', 'Store efficiency', 'Sales performance']
        },
        {
          role: 'Merchandising Manager',
          department: 'Merchandising',
          bio: `Merchandising specialist with expertise in product placement, inventory planning, and sales optimization. Focuses on product performance and customer buying patterns.`,
          personality: 'Data-driven, customer-focused, commercially-minded',
          priorities: ['Product performance', 'Inventory optimization', 'Sales growth']
        }
      ]
    }

    return industryMap[industry] || [
      {
        role: 'Business Analyst',
        department: 'Business Analysis',
        bio: `Senior business analyst with expertise in ${industry || 'cross-industry'} process improvement and requirements gathering. Specializes in stakeholder management and solution design.`,
        personality: 'Analytical, collaborative, process-focused',
        priorities: ['Requirements clarity', 'Stakeholder alignment', 'Solution effectiveness']
      }
    ]
  }

  const getProjectTypeSpecificStakeholders = (projectType: string, project: any) => {
    const projectTypeMap: Record<string, any[]> = {
      'Process Improvement': [
        {
          role: 'Process Excellence Manager',
          department: 'Process Excellence',
          bio: `Process improvement specialist with 10 years in lean methodology and process optimization. Expert in identifying inefficiencies and designing streamlined workflows.`,
          personality: 'Analytical, improvement-focused, methodical',
          priorities: ['Process efficiency', 'Waste reduction', 'Continuous improvement']
        }
      ],
      'System Implementation': [
        {
          role: 'IT Project Manager',
          department: 'Information Technology',
          bio: `IT project manager with 12 years in enterprise system implementations. Specializes in technology rollouts, user training, and change management for system deployments.`,
          personality: 'Organized, technical, change-focused',
          priorities: ['Implementation success', 'User adoption', 'Technical stability']
        }
      ],
      'Digital Transformation': [
        {
          role: 'Digital Strategy Manager',
          department: 'Digital Strategy',
          bio: `Digital transformation leader with expertise in organizational change and technology adoption. Focuses on digital capability building and cultural transformation.`,
          personality: 'Visionary, change-oriented, strategic',
          priorities: ['Digital adoption', 'Cultural change', 'Innovation']
        }
      ],
      'Customer Experience': [
        {
          role: 'Customer Success Manager',
          department: 'Customer Success',
          bio: `Customer success specialist with 9 years in customer journey optimization and satisfaction improvement. Expert in customer feedback analysis and experience design.`,
          personality: 'Customer-centric, empathetic, data-driven',
          priorities: ['Customer satisfaction', 'User experience', 'Customer retention']
        }
      ]
    }

    return projectTypeMap[projectType] || []
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

  const handleAddStakeholder = () => {
    if (!newStakeholder.name.trim() || !newStakeholder.role.trim()) {
      alert('Please fill in at least the name and role fields.')
      return
    }

    const stakeholder = {
      id: `manual-stakeholder-${Date.now()}`,
      name: newStakeholder.name,
      role: newStakeholder.role,
      department: newStakeholder.department || 'Business Operations',
      bio: newStakeholder.bio || `Experienced ${newStakeholder.role.toLowerCase()} with expertise in ${customProject?.industry || 'the industry'}.`,
      photo: `https://images.pexels.com/photos/${getPhotoId(manualStakeholders.length)}/pexels-photo-${getPhotoId(manualStakeholders.length)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
      personality: newStakeholder.personality || 'Professional and collaborative, focused on achieving business objectives',
      priorities: newStakeholder.priorities.filter(p => p.trim()),
      voice: getVoiceId(manualStakeholders.length),
      isCustom: true,
      isManual: true
    }

    setManualStakeholders(prev => [...prev, stakeholder])
    setNewStakeholder({
      name: '',
      role: '',
      department: '',
      bio: '',
      personality: '',
      priorities: ['', '', '']
    })
    setShowAddForm(false)
    
    // Clear AI-generated stakeholders when user adds their own
    if (generatedStakeholders.length > 0) {
      setGeneratedStakeholders([])
      setSelectedStakeholderIds(prev => prev.filter(id => !id.startsWith('custom-stakeholder-')))
    }
  }

  const handleEditStakeholder = (stakeholder: any) => {
    setEditingStakeholder(stakeholder)
    setNewStakeholder({
      name: stakeholder.name,
      role: stakeholder.role,
      department: stakeholder.department,
      bio: stakeholder.bio,
      personality: stakeholder.personality,
      priorities: [...stakeholder.priorities, '', '', ''].slice(0, 3)
    })
    setShowAddForm(true)
  }

  const handleUpdateStakeholder = () => {
    if (!editingStakeholder || !newStakeholder.name.trim() || !newStakeholder.role.trim()) {
      alert('Please fill in at least the name and role fields.')
      return
    }

    const updatedStakeholder = {
      ...editingStakeholder,
      name: newStakeholder.name,
      role: newStakeholder.role,
      department: newStakeholder.department || 'Business Operations',
      bio: newStakeholder.bio || `Experienced ${newStakeholder.role.toLowerCase()} with expertise in ${customProject?.industry || 'the industry'}.`,
      personality: newStakeholder.personality || 'Professional and collaborative, focused on achieving business objectives',
      priorities: newStakeholder.priorities.filter(p => p.trim())
    }

    setManualStakeholders(prev => 
      prev.map(s => s.id === editingStakeholder.id ? updatedStakeholder : s)
    )
    setGeneratedStakeholders(prev => 
      prev.map(s => s.id === editingStakeholder.id ? updatedStakeholder : s)
    )
    
    setEditingStakeholder(null)
    setNewStakeholder({
      name: '',
      role: '',
      department: '',
      bio: '',
      personality: '',
      priorities: ['', '', '']
    })
    setShowAddForm(false)
  }

  const handleUseAIStakeholders = () => {
    if (manualStakeholders.length > 0) {
      if (confirm('This will replace your custom stakeholders with AI-generated ones. Are you sure?')) {
        setManualStakeholders([])
        setSelectedStakeholderIds([])
        setHasGeneratedAI(false)
        generateStakeholders()
      }
    } else {
      generateStakeholders()
    }
  }

  const handleDeleteStakeholder = (stakeholderId: string) => {
    if (confirm('Are you sure you want to delete this stakeholder?')) {
      setManualStakeholders(prev => prev.filter(s => s.id !== stakeholderId))
      setGeneratedStakeholders(prev => prev.filter(s => s.id !== stakeholderId))
      setSelectedStakeholderIds(prev => prev.filter(id => id !== stakeholderId))
    }
  }

  const updatePriority = (index: number, value: string) => {
    setNewStakeholder(prev => ({
      ...prev,
      priorities: prev.priorities.map((p, i) => i === index ? value : p)
    }))
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingStakeholder(null)
    setNewStakeholder({
      name: '',
      role: '',
      department: '',
      bio: '',
      personality: '',
      priorities: ['', '', '']
    })
  }

  const handleStakeholderToggle = (stakeholderId: string) => {
    setSelectedStakeholderIds(prev => 
      prev.includes(stakeholderId)
        ? prev.filter(id => id !== stakeholderId)
        : [...prev, stakeholderId]
    )
  }

  const handleStartMeeting = () => {
    const allStakeholders = [...generatedStakeholders, ...manualStakeholders]
    const selectedStakeholders = allStakeholders.filter(s => 
      selectedStakeholderIds.includes(s.id)
    )
    setSelectedStakeholders(selectedStakeholders)
          setCurrentView('meeting-mode-selection')
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Our Stakeholders</h2>
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
            For your project "<span className="font-semibold text-gray-900">{customProject.name}</span>", 
            you can use AI-generated stakeholders or create your own custom stakeholders who will adapt to your specific context during interviews.
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

        {/* Add Stakeholder Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {manualStakeholders.length > 0 ? 'Your Project Stakeholders' : 'Choose Your Stakeholders'}
              </h3>
              <p className="text-sm text-gray-600">
                {manualStakeholders.length > 0 
                  ? 'Your custom stakeholders based on your actual project team'
                  : 'Add your actual project stakeholders or use our pre-built stakeholders that match your project'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {manualStakeholders.length === 0 && generatedStakeholders.length === 0 && (
                <button
                  onClick={handleUseAIStakeholders}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Stakeholders</span>
                </button>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your Stakeholder</span>
              </button>
            </div>
          </div>

          {/* Add/Edit Stakeholder Form */}
          {showAddForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {editingStakeholder ? 'Edit Stakeholder' : 'Add New Stakeholder'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newStakeholder.name}
                    onChange={(e) => setNewStakeholder(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sarah Johnson"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <input
                    type="text"
                    value={newStakeholder.role}
                    onChange={(e) => setNewStakeholder(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Operations Manager"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={newStakeholder.department}
                  onChange={(e) => setNewStakeholder(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Operations, IT, Customer Service"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Background & Bio</label>
                <textarea
                  value={newStakeholder.bio}
                  onChange={(e) => setNewStakeholder(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description of their experience and expertise..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-20 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
                <input
                  type="text"
                  value={newStakeholder.personality}
                  onChange={(e) => setNewStakeholder(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="e.g., Analytical and detail-oriented, prefers data-driven decisions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Priorities (up to 3)</label>
                <div className="space-y-2">
                  {newStakeholder.priorities.map((priority, index) => (
                    <input
                      key={index}
                      type="text"
                      value={priority}
                      onChange={(e) => updatePriority(index, e.target.value)}
                      placeholder={`Priority ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={editingStakeholder ? handleUpdateStakeholder : handleAddStakeholder}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingStakeholder ? 'Update' : 'Add'} Stakeholder</span>
                </button>
                <button
                  onClick={cancelForm}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Manual Stakeholders List */}
          {manualStakeholders.length > 0 && (
            <div className="space-y-4">
              {manualStakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{stakeholder.name}</h4>
                        <span className="text-sm font-medium text-emerald-600">{stakeholder.role}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Custom</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stakeholder.department}</p>
                      <p className="text-sm text-gray-700">{stakeholder.bio}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditStakeholder(stakeholder)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStakeholder(stakeholder.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {manualStakeholders.length === 0 && generatedStakeholders.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No stakeholders added yet</p>
              <p className="text-sm text-gray-400">Add your project stakeholders or generate ones for your project</p>
            </div>
          )}
        </div>

        {/* AI Generation Option for existing manual stakeholders */}
        {manualStakeholders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Want to use our pre-built stakeholders instead?</h3>
                <p className="text-blue-700">You can replace your custom stakeholders with our professionally designed stakeholders that match your project context.</p>
              </div>
              <button
                onClick={handleUseAIStakeholders}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Use Our Stakeholders</span>
              </button>
            </div>
          </div>
        )}

        {/* All Stakeholders Display */}
        {(manualStakeholders.length > 0 || generatedStakeholders.length > 0) && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {manualStakeholders.length > 0 ? 'Your Project Stakeholders' : 'Our Pre-Built Stakeholders'}
            </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...manualStakeholders, ...generatedStakeholders].map((stakeholder) => {
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
                    {stakeholder.isManual && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditStakeholder(stakeholder)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteStakeholder(stakeholder.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
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
        </div>
        )}

        {/* Regenerate Option - only show for AI stakeholders */}
        {generatedStakeholders.length > 0 && manualStakeholders.length === 0 && (
          <div className="text-center mb-8">
            <button
              onClick={generateStakeholders}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Generate Different Stakeholders</span>
            </button>
          </div>
        )}

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