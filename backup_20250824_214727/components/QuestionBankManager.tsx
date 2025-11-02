import React, { useState } from 'react'
import { Plus, Edit3, Trash2, Search, Filter, Tag, Star, Save, X } from 'lucide-react'
import { QuestionBankService, QuestionTemplate } from '../lib/questionBank'

interface QuestionBankManagerProps {
  isOpen: boolean
  onClose: () => void
}

const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<QuestionTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'as-is' | 'to-be'>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [editingQuestion, setEditingQuestion] = useState<QuestionTemplate | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    category: 'as-is' as 'as-is' | 'to-be',
    stakeholderRoles: [] as string[],
    tags: [] as string[],
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  const stakeholderRoles = [
    'Head of Operations',
    'Customer Service Manager', 
    'IT Systems Lead',
    'HR Business Partner',
    'Compliance and Risk Manager',
    'Operations Manager',
    'Technical Lead',
    'IT Manager',
    'HR Manager',
    'Compliance Officer'
  ]

  const availableTags = QuestionBankService.getQuestionTags()

  React.useEffect(() => {
    if (isOpen) {
      loadQuestions()
    }
  }, [isOpen, searchTerm, selectedCategory, selectedRole])

  const loadQuestions = () => {
    let filteredQuestions = QuestionBankService.searchQuestions(
      searchTerm,
      selectedRole === 'all' ? undefined : selectedRole,
      selectedCategory === 'all' ? undefined : selectedCategory
    )
    setQuestions(filteredQuestions)
  }

  const handleSaveQuestion = () => {
    if (!newQuestion.question.trim()) return

    QuestionBankService.addCustomQuestion({
      category: newQuestion.category,
      stakeholderRoles: newQuestion.stakeholderRoles,
      projectTypes: [],
      question: newQuestion.question,
      tags: newQuestion.tags,
      priority: newQuestion.priority
    })

    setNewQuestion({
      question: '',
      category: 'as-is',
      stakeholderRoles: [],
      tags: [],
      priority: 'medium'
    })
    setShowAddForm(false)
    loadQuestions()
  }

  const toggleRole = (role: string) => {
    setNewQuestion(prev => ({
      ...prev,
      stakeholderRoles: prev.stakeholderRoles.includes(role)
        ? prev.stakeholderRoles.filter(r => r !== role)
        : [...prev.stakeholderRoles, role]
    }))
  }

  const toggleTag = (tag: string) => {
    setNewQuestion(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Question Bank Manager</h2>
              <p className="text-blue-100 mt-1">Manage and customize interview questions</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Controls */}
          <div className="space-y-4 mb-6">
            {/* Search and Add */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                <option value="as-is">As-Is Process</option>
                <option value="to-be">To-Be Vision</option>
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Roles</option>
                {stakeholderRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <span className="text-sm text-gray-500">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Add Question Form */}
          {showAddForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Question</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter your question here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="as-is">As-Is Process</option>
                      <option value="to-be">To-Be Vision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newQuestion.priority}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stakeholder Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {stakeholderRoles.map(role => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          newQuestion.stakeholderRoles.includes(role)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all roles</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          newQuestion.tags.includes(tag)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveQuestion}
                    disabled={!newQuestion.question.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Question</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewQuestion({
                        question: '',
                        category: 'as-is',
                        stakeholderRoles: [],
                        tags: [],
                        priority: 'medium'
                      })
                    }}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-2">{question.question}</p>
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        question.category === 'as-is' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {question.category === 'as-is' ? 'As-Is' : 'To-Be'}
                      </span>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        question.priority === 'high' ? 'bg-red-100 text-red-800' :
                        question.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {question.priority === 'high' && <Star className="w-3 h-3 mr-1" />}
                        {question.priority}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Roles:</span> {
                          question.stakeholderRoles.length === 0 
                            ? 'All roles' 
                            : question.stakeholderRoles.join(', ')
                        }
                      </div>
                      <div>
                        <span className="font-medium">Tags:</span> {question.tags.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or add a new question.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBankManager