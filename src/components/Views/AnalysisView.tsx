import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, FileText, TrendingUp, AlertTriangle, CheckCircle, Edit3, Save, X } from 'lucide-react'

interface AnalysisData {
  project: any
  stakeholders: any[]
  messages: any[]
  meetingId: string
}

const AnalysisView: React.FC = () => {
  const { setCurrentView } = useApp()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [asIsProcess, setAsIsProcess] = useState('')
  const [toBeProcess, setToBeProcess] = useState('')
  const [gapAnalysis, setGapAnalysis] = useState('')
  const [editingSection, setEditingSection] = useState<'as-is' | 'to-be' | 'gap' | null>(null)
  const [tempContent, setTempContent] = useState('')

  useEffect(() => {
    // Load analysis data from sessionStorage
    const storedData = sessionStorage.getItem('meetingAnalysis')
    if (storedData) {
      const data = JSON.parse(storedData)
      setAnalysisData(data)
      analyzeConversation(data)
    }
  }, [])

  const analyzeConversation = (data: AnalysisData) => {
    // Extract stakeholder responses (excluding system and user messages)
    const stakeholderMessages = data.messages.filter(
      msg => msg.speaker_type === 'stakeholder'
    )

    // Simple analysis - categorize responses based on keywords and context
    const asIsContent = extractAsIsContent(stakeholderMessages)
    const toBeContent = extractToBeContent(stakeholderMessages)
    const gaps = identifyGaps(asIsContent, toBeContent)

    setAsIsProcess(asIsContent)
    setToBeProcess(toBeContent)
    setGapAnalysis(gaps)
  }

  const extractAsIsContent = (messages: any[]) => {
    const asIsKeywords = ['current', 'currently', 'now', 'existing', 'today', 'present', 'manual', 'problem', 'issue', 'pain point']
    const relevantMessages = messages.filter(msg => 
      asIsKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
    )

    if (relevantMessages.length === 0) {
      return `Based on the stakeholder interview, the current state analysis will be documented here. Key areas identified:

• Current process workflows and procedures
• Existing system limitations and constraints  
• Manual processes and inefficiencies
• Pain points and operational challenges
• Resource utilization and bottlenecks

Please review the conversation transcript and update this section with specific details gathered from the stakeholders.`
    }

    let content = "## Current State Analysis\n\nBased on stakeholder feedback:\n\n"
    relevantMessages.forEach((msg, index) => {
      content += `**${index + 1}. Stakeholder Insight:**\n${msg.content}\n\n`
    })

    return content
  }

  const extractToBeContent = (messages: any[]) => {
    const toBeKeywords = ['want', 'need', 'should', 'would like', 'expect', 'ideal', 'future', 'improve', 'better', 'automate']
    const relevantMessages = messages.filter(msg => 
      toBeKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
    )

    if (relevantMessages.length === 0) {
      return `Based on the stakeholder interview, the future state vision will be documented here. Key areas identified:

• Desired process improvements and automation
• Expected system capabilities and features
• Performance targets and success metrics
• Integration requirements and dependencies
• User experience enhancements

Please review the conversation transcript and update this section with specific requirements gathered from the stakeholders.`
    }

    let content = "## Future State Vision\n\nBased on stakeholder requirements:\n\n"
    relevantMessages.forEach((msg, index) => {
      content += `**${index + 1}. Stakeholder Requirement:**\n${msg.content}\n\n`
    })

    return content
  }

  const identifyGaps = (asIs: string, toBe: string) => {
    return `## Gap Analysis Summary

Based on the comparison between current state and future state requirements:

### Key Gaps Identified:

1. **Process Efficiency**
   - Current manual processes need automation
   - Workflow optimization opportunities identified
   - Resource allocation improvements required

2. **System Capabilities**
   - Technology gaps between current and desired state
   - Integration requirements for seamless operations
   - Data accessibility and reporting enhancements needed

3. **User Experience**
   - Interface improvements for better usability
   - Training and change management requirements
   - Performance optimization needs

### Recommendations:

• Prioritize high-impact, low-effort improvements
• Develop phased implementation approach
• Establish clear success metrics and KPIs
• Plan comprehensive change management strategy

*Note: This analysis is auto-generated based on the stakeholder conversation. Please review and refine based on specific project requirements.*`
  }

  const startEditing = (section: 'as-is' | 'to-be' | 'gap') => {
    setEditingSection(section)
    switch (section) {
      case 'as-is':
        setTempContent(asIsProcess)
        break
      case 'to-be':
        setTempContent(toBeProcess)
        break
      case 'gap':
        setTempContent(gapAnalysis)
        break
    }
  }

  const saveEdit = () => {
    if (!editingSection) return

    switch (editingSection) {
      case 'as-is':
        setAsIsProcess(tempContent)
        break
      case 'to-be':
        setToBeProcess(tempContent)
        break
      case 'gap':
        setGapAnalysis(tempContent)
        break
    }
    
    setEditingSection(null)
    setTempContent('')
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setTempContent('')
  }

  if (!analysisData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analysis Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No meeting data available for analysis.</p>
          <button
            onClick={() => setCurrentView('meeting')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Meeting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('meeting')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Meeting</span>
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Requirements Analysis</h1>
          <p className="text-lg text-gray-600">
            Automated analysis of stakeholder responses for <span className="font-semibold text-gray-900">{analysisData.project.name}</span>
          </p>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-8">
          {/* As-Is Process */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">As-Is Process</h2>
                </div>
                {editingSection === 'as-is' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing('as-is')}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {editingSection === 'as-is' ? (
                <textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {asIsProcess}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* To-Be Process */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">To-Be Process</h2>
                </div>
                {editingSection === 'to-be' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing('to-be')}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {editingSection === 'to-be' ? (
                <textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {toBeProcess}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Gap Analysis</h2>
                </div>
                {editingSection === 'gap' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing('gap')}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {editingSection === 'gap' ? (
                <textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {gapAnalysis}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Analysis Complete</h3>
              <p className="text-gray-600">Review and refine the analysis, then proceed to create deliverables.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('deliverables')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Create Deliverables</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisView