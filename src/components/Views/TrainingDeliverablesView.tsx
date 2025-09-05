import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  ArrowLeft, 
  FileText, 
  Map, 
  Users, 
  Target, 
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  Plus,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Play,
  Eye,
  Download,
  Trash2,
  Star,
  Save,
  X
} from 'lucide-react';

interface TrainingDeliverable {
  id: string;
  type: 'process_map' | 'meeting_transcript' | 'user_story' | 'stakeholder_analysis' | 'training_summary';
  title: string;
  description: string;
  stage: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'completed'; // Simplified to just draft/completed
  content?: string;
  metadata?: Record<string, any>;
}

const TrainingDeliverablesView: React.FC = () => {
  const { setCurrentView, selectedProject } = useApp();
  const [deliverables, setDeliverables] = useState<TrainingDeliverable[]>([]);
  const [filteredDeliverables, setFilteredDeliverables] = useState<TrainingDeliverable[]>([]);
  const [activeTab, setActiveTab] = useState<string>('process_map');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Mock data for demonstration - structured like the existing deliverables
  useEffect(() => {
    const mockDeliverables: TrainingDeliverable[] = [
      {
        id: '1',
        type: 'process_map',
        title: 'Customer Onboarding As-Is Process Map',
        description: 'Current state process flow for customer onboarding optimization',
        stage: 'as_is_mapping',
        projectName: 'Customer Onboarding Process Optimization',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        status: 'draft',
        content: 'Process mapping content showing the current customer onboarding workflow...',
        metadata: { stakeholders: 3, steps: 12, painPoints: 5 }
      },
      {
        id: '2',
        type: 'meeting_transcript',
        title: 'Stakeholder Discovery Session - Operations Team',
        description: 'Transcript from meeting with Head of Operations',
        stage: 'as_is',
        projectName: 'Customer Onboarding Process Optimization',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        status: 'draft',
        content: 'Meeting transcript content with key insights from operations team...',
        metadata: { duration: 45, participants: 4, keyInsights: 8 }
      },
      {
        id: '3',
        type: 'user_story',
        title: 'Automated Handoff User Stories',
        description: 'User stories for automated team handoffs',
        stage: 'to_be',
        projectName: 'Customer Onboarding Process Optimization',
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
        status: 'draft',
        content: 'User story content for automated handoffs...',
        metadata: { storyPoints: 8, priority: 'high', acceptanceCriteria: 5 }
      },
      {
        id: '4',
        type: 'stakeholder_analysis',
        title: 'Stakeholder Impact Assessment',
        description: 'Analysis of how process changes will impact different stakeholder groups',
        stage: 'solution_design',
        projectName: 'Customer Onboarding Process Optimization',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        status: 'draft',
        content: 'Initial stakeholder impact assessment...',
        metadata: { stakeholderGroups: 4, impactLevel: 'high', changeReadiness: 'medium' }
      }
    ];
    setDeliverables(mockDeliverables);
    setFilteredDeliverables(mockDeliverables);
  }, []);

  const deliverableTypes = [
    { 
      id: 'process_map', 
      title: 'Process Maps', 
      description: 'Visual process flows and workflow diagrams',
      icon: Map,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    { 
      id: 'meeting_transcript', 
      title: 'Meeting Transcripts', 
      description: 'Stakeholder interview transcripts and summaries',
      icon: FileText,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    { 
      id: 'user_story', 
      title: 'User Stories', 
      description: 'User-focused requirements and scenarios',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    { 
      id: 'stakeholder_analysis', 
      title: 'Stakeholder Analysis', 
      description: 'Stakeholder insights and impact assessments',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    { 
      id: 'training_summary', 
      title: 'Training Summaries', 
      description: 'Key learnings and training session summaries',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    }
  ];

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case 'process_map': return <Map className="w-5 h-5" />;
      case 'meeting_transcript': return <FileText className="w-5 h-5" />;
      case 'user_story': return <Target className="w-5 h-5" />;
      case 'stakeholder_analysis': return <Users className="w-5 h-5" />;
      case 'training_summary': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = deliverables.filter(d => 
      d.title.toLowerCase().includes(term.toLowerCase()) ||
      d.description.toLowerCase().includes(term.toLowerCase()) ||
      d.projectName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDeliverables(filtered);
  };

  const startEditing = (deliverable: TrainingDeliverable) => {
    setEditingId(deliverable.id);
    setEditContent(deliverable.content || '');
  };

  const saveEdit = () => {
    if (editingId) {
      const updatedDeliverables = deliverables.map(d => 
        d.id === editingId 
          ? { ...d, content: editContent, updatedAt: new Date() }
          : d
      );
      
      setDeliverables(updatedDeliverables);
      setFilteredDeliverables(updatedDeliverables);
      setEditingId(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const createDeliverable = (type: string) => {
    const typeInfo = deliverableTypes.find(t => t.id === type);
    if (!typeInfo) return;

    const newDeliverable: TrainingDeliverable = {
      id: `deliverable-${Date.now()}`,
      type: type as any,
      title: `New ${typeInfo.title}`,
      description: `Create a new ${typeInfo.title.toLowerCase()}`,
      stage: 'problem_exploration',
      projectName: selectedProject?.name || 'Training Project',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      content: '',
      metadata: {}
    };

    setDeliverables(prev => [...prev, newDeliverable]);
    setFilteredDeliverables(prev => [...prev, newDeliverable]);
    setEditingId(newDeliverable.id);
    setEditContent('');
  };

  const deleteDeliverable = (id: string) => {
    if (!confirm('Are you sure you want to delete this deliverable?')) return;
    
    const updatedDeliverables = deliverables.filter(d => d.id !== id);
    setDeliverables(updatedDeliverables);
    setFilteredDeliverables(updatedDeliverables);
  };

  const toggleStatus = (id: string) => {
    const updatedDeliverables = deliverables.map(d => 
      d.id === id 
        ? { ...d, status: (d.status === 'draft' ? 'completed' : 'draft') as 'draft' | 'completed', updatedAt: new Date() }
        : d
    );
    setDeliverables(updatedDeliverables);
    setFilteredDeliverables(updatedDeliverables);
  };

  const openProcessMapper = () => {
    // Store return context for navigation back
    sessionStorage.setItem('returnToView', 'training-deliverables');
    sessionStorage.setItem('returnToTab', activeTab);
    setCurrentView('process-mapper-editor');
  };

  const getDeliverablesByType = (type: string) => {
    return deliverables.filter(d => d.type === type);
  };

  const currentTypeDeliverables = getDeliverablesByType(activeTab);
  const currentTypeInfo = deliverableTypes.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Simple and focused */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('training-hub')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Training Deliverables</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your portfolio of BA work from training sessions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={openProcessMapper}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Map className="w-4 h-4" />
                <span>Process Mapper</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search deliverables..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

                 {/* Tabs Navigation */}
         <div className="mb-6">
           <div className="flex space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             {deliverableTypes.map((type) => {
               const IconComponent = type.icon;
               const isActive = activeTab === type.id;
               const typeCount = getDeliverablesByType(type.id).length;
               
               return (
                 <button
                   key={type.id}
                   onClick={() => setActiveTab(type.id)}
                   className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                     isActive 
                       ? `bg-gradient-to-r ${type.color} text-white shadow-lg ring-2 ring-white/20` 
                       : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md'
                   }`}
                 >
                   <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                   <span className="font-semibold text-sm">{type.title}</span>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                     isActive 
                       ? 'bg-white/20 text-white border border-white/30' 
                       : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                   }`}>
                     {typeCount}
                   </span>
                 </button>
               );
             })}
           </div>
         </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Tab Header */}
          <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${currentTypeInfo?.bgColor} ${currentTypeInfo?.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${currentTypeInfo?.color} rounded-xl flex items-center justify-center`}>
                  {currentTypeInfo && <currentTypeInfo.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentTypeInfo?.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentTypeInfo?.description}</p>
                </div>
              </div>
                             <button
                 onClick={() => {
                   if (activeTab === 'process_map') {
                     openProcessMapper();
                   } else {
                     createDeliverable(activeTab);
                   }
                 }}
                 className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
               >
                 <Plus className="w-4 h-4" />
                 <span>Create {currentTypeInfo?.title}</span>
               </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {currentTypeDeliverables.length === 0 ? (
              <div className="text-center py-12">
                {currentTypeInfo && <currentTypeInfo.icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No {currentTypeInfo?.title.toLowerCase()} yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first {currentTypeInfo?.title.toLowerCase()} to get started</p>
                <button
                  onClick={() => createDeliverable(activeTab)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create {currentTypeInfo?.title}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTypeDeliverables.map((deliverable) => (
                  <div key={deliverable.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{deliverable.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{deliverable.description}</p>
                          
                          {/* Deliverable Meta */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Target className="w-3 h-3" />
                              <span>{deliverable.stage.replace('_', ' ').toUpperCase()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>{deliverable.projectName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Updated: {deliverable.updatedAt.toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4">
                          <button
                            onClick={() => toggleStatus(deliverable.id)}
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(deliverable.status)}`}
                            title={`Click to mark as ${deliverable.status === 'draft' ? 'completed' : 'draft'}`}
                          >
                            {getStatusText(deliverable.status)}
                          </button>
                          
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
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditing(deliverable)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => deleteDeliverable(deliverable.id)}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                                         <div className="p-4">
                       {editingId === deliverable.id ? (
                         <div>
                           {deliverable.type === 'process_map' ? (
                             <div className="space-y-4">
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                   Process Notes & Documentation
                                 </label>
                                 <textarea
                                   value={editContent}
                                   onChange={(e) => setEditContent(e.target.value)}
                                   className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                   placeholder="Add notes about this process, key insights, pain points, or reminders..."
                                 />
                               </div>
                               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                 <div className="flex items-center space-x-2 mb-2">
                                   <Map className="w-4 h-4 text-blue-600" />
                                   <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Process Map</span>
                                 </div>
                                 <p className="text-sm text-blue-700 dark:text-blue-300">
                                   The visual process map is stored separately. Use this area for notes, insights, and documentation about the process.
                                 </p>
                               </div>
                             </div>
                           ) : (
                             <textarea
                               value={editContent}
                               onChange={(e) => setEditContent(e.target.value)}
                               className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                               placeholder="Enter your content here..."
                             />
                           )}
                         </div>
                       ) : (
                         <div className="prose max-w-none">
                           {deliverable.type === 'process_map' ? (
                            <div className="space-y-4">
                              {deliverable.content ? (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Process Notes:</h5>
                                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                      {deliverable.content.length > 200 
                                        ? `${deliverable.content.substring(0, 200)}...` 
                                        : deliverable.content
                                      }
                                    </p>
                                    {deliverable.content.length > 200 && (
                                      <button 
                                        onClick={() => startEditing(deliverable)}
                                        className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                                      >
                                        Read more...
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                  <Map className="w-8 h-8 mx-auto mb-2" />
                                  <p>No process notes yet. Click Edit to add notes and documentation.</p>
                                </div>
                              )}
                              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Map className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Process Map Available</span>
                                </div>
                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                  The visual process map is stored in the Process Mapper. Use the Process Mapper button above to view and edit the diagram.
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                  <button
                                    onClick={openProcessMapper}
                                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                                  >
                                    <Map className="w-4 h-4" />
                                    Open Process Mapper
                                  </button>
                                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Process Mapping 101
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                              {deliverable.content || 'No content yet. Click Edit to add content.'}
                            </pre>
                          )}
                         </div>
                       )}
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Deliverable Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Base your deliverables on insights gathered from stakeholder interviews</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Use clear, concise language that stakeholders can easily understand</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Include specific examples and data to support your analysis</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Review and refine deliverables based on feedback and new insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDeliverablesView;
