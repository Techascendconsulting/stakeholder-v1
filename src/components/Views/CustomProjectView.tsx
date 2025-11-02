import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, Building, Users, Target, FileText, Lightbulb, ArrowRight, Plus, X } from 'lucide-react'

const CustomProjectView: React.FC = () => {
  const { setCurrentView, setCustomProject } = useApp()
  const [formData, setFormData] = useState({
    projectName: '',
    businessContext: '',
    problemStatement: '',
    currentProcess: '',
    desiredOutcomes: '',
    stakeholderRoles: [''],
    projectType: '',
    industry: '',
    complexity: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced'
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addStakeholderRole = () => {
    setFormData(prev => ({
      ...prev,
      stakeholderRoles: [...prev.stakeholderRoles, '']
    }))
  }

  const updateStakeholderRole = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholderRoles: prev.stakeholderRoles.map((role, i) => i === index ? value : role)
    }))
  }

  const removeStakeholderRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stakeholderRoles: prev.stakeholderRoles.filter((_, i) => i !== index)
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleCreateProject()
    }
  }

  const handleCreateProject = async () => {
    setIsGenerating(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const customProject = {
        id: `custom-${Date.now()}`,
        name: formData.projectName,
        description: `Custom project: ${formData.problemStatement}`,
        businessContext: formData.businessContext,
        problemStatement: formData.problemStatement,
        asIsProcess: formData.currentProcess,
        businessGoals: formData.desiredOutcomes.split('\n').filter(goal => goal.trim()),
        duration: '4-6 weeks',
        complexity: formData.complexity,
        isCustom: true,
        stakeholderRoles: formData.stakeholderRoles.filter(role => role.trim()),
        industry: formData.industry,
        projectType: formData.projectType
      }

      setCustomProject(customProject)
      setIsGenerating(false)
      setCurrentView('custom-stakeholders')
    }, 2000)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.projectName && formData.businessContext && formData.problemStatement
      case 2:
        return formData.currentProcess && formData.desiredOutcomes
      case 3:
        return formData.stakeholderRoles.some(role => role.trim()) && formData.industry
      default:
        return false
    }
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Creating Your Custom Project</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">AI is analyzing your project context and generating stakeholders...</p>
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
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('projects')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-gray-100 dark:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Custom Project</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Step 1: Project Overview */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Overview</h2>
                <p className="text-gray-600 dark:text-gray-400">Tell us about your project context and objectives</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="e.g., Process Improvement Project"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Business Context *</label>
                  <textarea
                    value={formData.businessContext}
                    onChange={(e) => handleInputChange('businessContext', e.target.value)}
                    placeholder="Describe the business environment, company size, industry, and why this project is needed..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Problem Statement *</label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    placeholder="What specific problem or opportunity is this project addressing? What are the pain points?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Process Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Process & Outcomes</h2>
                <p className="text-gray-600 dark:text-gray-400">Describe current state and desired future state</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Process (As-Is) *</label>
                  <textarea
                    value={formData.currentProcess}
                    onChange={(e) => handleInputChange('currentProcess', e.target.value)}
                    placeholder="Describe how things work currently. What are the steps, systems, and pain points?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-40 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Desired Outcomes (To-Be) *</label>
                  <textarea
                    value={formData.desiredOutcomes}
                    onChange={(e) => handleInputChange('desiredOutcomes', e.target.value)}
                    placeholder="What should the improved process look like? What are your goals and success criteria? (One per line)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-40 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter each goal on a separate line</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Project Complexity</label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => handleInputChange('complexity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner - Simple process improvements</option>
                    <option value="Intermediate">Intermediate - Cross-functional changes</option>
                    <option value="Advanced">Advanced - Complex organizational transformation</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Stakeholders & Context */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stakeholders & Context</h2>
                <p className="text-gray-600 dark:text-gray-400">Define who will be involved and project context</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Key Stakeholder Roles *</label>
                  <div className="space-y-3">
                    {formData.stakeholderRoles.map((role, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => updateStakeholderRole(index, e.target.value)}
                          placeholder="e.g., Operations Manager, IT Director, Customer Service Lead"
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {formData.stakeholderRoles.length > 1 && (
                          <button
                            onClick={() => removeStakeholderRole(index)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addStakeholderRole}
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Role</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Industry *</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Industry</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Technology">Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Government">Government</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Project Type</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => handleInputChange('projectType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Process Improvement">Process Improvement</option>
                      <option value="System Implementation">System Implementation</option>
                      <option value="Digital Transformation">Digital Transformation</option>
                      <option value="Compliance Initiative">Compliance Initiative</option>
                      <option value="Cost Reduction">Cost Reduction</option>
                      <option value="Customer Experience">Customer Experience</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= currentStep ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span>{currentStep === 3 ? 'Create Project' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomProjectView