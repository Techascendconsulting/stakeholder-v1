import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { FileText, Plus, Edit3, Save, X, ArrowLeft } from 'lucide-react'
import { Deliverable } from '../../types'

const DeliverablesView: React.FC = () => {
  const { selectedProject, deliverables, addDeliverable, updateDeliverable, setCurrentView } = useApp()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const deliverableTypes = [
    { id: 'goals', title: 'Business Goals & Objectives', description: 'High-level goals and success criteria' },
    { id: 'user-stories', title: 'User Stories', description: 'User-focused requirements and scenarios' },
    { id: 'acceptance-criteria', title: 'Acceptance Criteria', description: 'Detailed acceptance criteria for features' },
    { id: 'brd', title: 'Business Requirements Document', description: 'Comprehensive BRD draft' }
  ]

  const projectDeliverables = selectedProject 
    ? deliverables.filter(d => d.projectId === selectedProject.id)
    : []

  const createDeliverable = (type: string) => {
    if (!selectedProject) return

    const typeInfo = deliverableTypes.find(t => t.id === type)
    const newDeliverable: Deliverable = {
      id: `deliverable-${Date.now()}`,
      projectId: selectedProject.id,
      type: type as any,
      title: typeInfo?.title || 'New Deliverable',
      content: getTemplateContent(type),
      lastModified: new Date().toISOString()
    }

    addDeliverable(newDeliverable)
    setEditingId(newDeliverable.id)
    setEditContent(newDeliverable.content)
  }

  const startEditing = (deliverable: Deliverable) => {
    setEditingId(deliverable.id)
    setEditContent(deliverable.content)
  }

  const saveEdit = () => {
    if (editingId) {
      updateDeliverable(editingId, {
        content: editContent,
        lastModified: new Date().toISOString()
      })
      setEditingId(null)
      setEditContent('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const getDeliverablesByType = (type: string) => {
    return projectDeliverables.filter(d => d.type === type)
  }

  if (!selectedProject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-600">Select a project to create and manage deliverables</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header with Back Navigation */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => setCurrentView('meeting')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Meeting</span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deliverables Workspace</h1>
        <p className="text-gray-600">Create and manage your Business Analysis deliverables for {selectedProject.name}</p>
      </div>

      <div className="space-y-8">
        {deliverableTypes.map((type) => {
          const typeDeliverables = getDeliverablesByType(type.id)
          
          return (
            <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  <button
                    onClick={() => createDeliverable(type.id)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {typeDeliverables.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {type.title.toLowerCase()} created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {typeDeliverables.map((deliverable) => (
                      <div key={deliverable.id} className="border border-gray-200 rounded-lg">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{deliverable.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                Last modified: {new Date(deliverable.lastModified).toLocaleDateString()}
                              </span>
                              {editingId === deliverable.id ? (
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
                                  onClick={() => startEditing(deliverable)}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          {editingId === deliverable.id ? (
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              placeholder="Enter your content here..."
                            />
                          ) : (
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                {deliverable.content}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Deliverable Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Base your deliverables on insights gathered from stakeholder interviews</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Use clear, concise language that stakeholders can easily understand</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Include acceptance criteria that are testable and measurable</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Regularly update deliverables as you gather more information</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const getTemplateContent = (type: string): string => {
  switch (type) {
    case 'goals':
      return `# Business Goals & Objectives

## Primary Goals
1. [Goal 1 - describe the main business objective]
2. [Goal 2 - describe secondary objective]
3. [Goal 3 - describe additional objective]

## Success Criteria
- [Measurable outcome 1]
- [Measurable outcome 2]
- [Measurable outcome 3]

## Key Performance Indicators (KPIs)
- [KPI 1]: [Target value]
- [KPI 2]: [Target value]
- [KPI 3]: [Target value]

## Timeline
- [Milestone 1]: [Date]
- [Milestone 2]: [Date]
- [Final delivery]: [Date]`

    case 'user-stories':
      return `# User Stories

## Epic: [Epic Name]

### Story 1
**As a** [type of user]
**I want** [some goal]
**So that** [some reason/benefit]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Story 2
**As a** [type of user]
**I want** [some goal]
**So that** [some reason/benefit]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Notes
- [Additional context or constraints]
- [Dependencies or assumptions]`

    case 'acceptance-criteria':
      return `# Acceptance Criteria

## Feature: [Feature Name]

### Scenario 1: [Scenario Description]
**Given** [initial context]
**When** [event occurs]
**Then** [expected outcome]

### Scenario 2: [Scenario Description]
**Given** [initial context]
**When** [event occurs]
**Then** [expected outcome]

## Functional Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

## Non-Functional Requirements
- [ ] Performance: [specific requirement]
- [ ] Security: [specific requirement]
- [ ] Usability: [specific requirement]

## Edge Cases
- [Edge case 1 and expected behavior]
- [Edge case 2 and expected behavior]`

    case 'brd':
      return `# Business Requirements Document

## 1. Executive Summary
[Brief overview of the project and its objectives]

## 2. Business Objectives
[Detailed description of business goals and expected outcomes]

## 3. Scope
### In Scope
- [Item 1]
- [Item 2]
- [Item 3]

### Out of Scope
- [Item 1]
- [Item 2]

## 4. Stakeholders
| Name | Role | Responsibilities |
|------|------|------------------|
| [Name] | [Role] | [Responsibilities] |

## 5. Current State Analysis
[Description of current processes and pain points]

## 6. Requirements
### Functional Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

### Non-Functional Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

## 7. Assumptions and Constraints
### Assumptions
- [Assumption 1]
- [Assumption 2]

### Constraints
- [Constraint 1]
- [Constraint 2]

## 8. Success Criteria
[How success will be measured]

## 9. Timeline and Milestones
[Key dates and deliverables]`

    default:
      return 'Start writing your deliverable content here...'
  }
}

export default DeliverablesView