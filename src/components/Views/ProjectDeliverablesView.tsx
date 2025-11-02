import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ProjectDeliverablesService } from '../../services/projectDeliverablesService';
import { 
  ProjectDeliverable,
  ProjectTrainingSession,
  Project,
  MeetingTranscript,
  AIFeedback
} from '../../types/projectDeliverables';
import { 
  ArrowLeft, 
  FileText, 
  Map, 
  Users, 
  Target, 
  TrendingUp, 
  Zap,
  Download,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Calendar,
  Award,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  FileImage,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clipboard,
  Layers
} from 'lucide-react';

const ProjectDeliverablesView: React.FC = () => {
  const { setCurrentView, selectedProject } = useApp();
  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([]);
  const [selectedDeliverable, setSelectedDeliverable] = useState<ProjectDeliverable | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'problem_statement' | 'process_map' | 'stakeholder_notes' | null>(null);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcripts' | 'tips' | 'examples'>('transcripts');
  const [trainingSession, setTrainingSession] = useState<ProjectTrainingSession | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  const projectDeliverablesService = ProjectDeliverablesService.getInstance();

  // Load real data from database
  useEffect(() => {
    const loadProjectData = async () => {
      if (!selectedProject?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load project details
        const projectResponse = await projectDeliverablesService.getProject(selectedProject.id);
        if (projectResponse.error) {
          throw new Error(projectResponse.error);
        }
        setProject(projectResponse.data);

        // Load training session
        const sessionResponse = await projectDeliverablesService.getProjectTrainingSession(selectedProject.id);
        if (sessionResponse.error && sessionResponse.error !== 'No training session found') {
          throw new Error(sessionResponse.error);
        }
        setTrainingSession(sessionResponse.data);

        // Load deliverables
        const deliverablesResponse = await projectDeliverablesService.getProjectDeliverables(selectedProject.id);
        if (deliverablesResponse.error) {
          throw new Error(deliverablesResponse.error);
        }
        setDeliverables(deliverablesResponse.data);

      } catch (err) {
        console.error('Error loading project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project data');
        
        // Fallback to mock data if database fails
        const mockDeliverables = projectDeliverablesService.getMockProjectDeliverables(selectedProject.id);
        setDeliverables(mockDeliverables);
        setTrainingSession(projectDeliverablesService.getMockProjectTrainingSession(selectedProject.id));
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [selectedProject?.id]);

  // Get transcripts from training session or use mock data
  const getTranscripts = (): MeetingTranscript[] => {
    if (trainingSession?.meeting_transcripts) {
      return trainingSession.meeting_transcripts.map((transcript, index) => ({
        id: index.toString(),
        date: new Date(transcript.date),
        participants: transcript.participants,
        summary: transcript.summary,
        keyInsights: transcript.keyInsights
      }));
    }
    
    // Fallback mock data
    return [
      {
        id: '1',
        date: new Date('2024-01-15'),
        participants: ['Operations Manager', 'Compliance Officer', 'Customer Success Lead'],
        summary: 'Discussion about current ID verification bottlenecks and manual processes',
        keyInsights: ['Manual handoffs between 3 systems', 'No automated fraud detection', 'Audit trail gaps in current process']
      },
      {
        id: '2',
        date: new Date('2024-01-14'),
        participants: ['Head of Operations', 'IT Director'],
        summary: 'Technical assessment of current systems and integration possibilities',
        keyInsights: ['Legacy system limitations', 'API integration challenges', 'Data quality issues']
      }
    ];
  };

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case 'problem_statement': return <AlertCircle className="w-5 h-5" />;
      case 'process_map': return <Map className="w-5 h-5" />;
      case 'stakeholder_notes': return <MessageSquare className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'submitted': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'submitted': return 'Submitted';
      default: return 'Not Started';
    }
  };

  const openDeliverableModal = (type: 'problem_statement' | 'process_map' | 'stakeholder_notes') => {
    setModalType(type);
    const deliverable = deliverables.find(d => d.type === type);
    setSelectedDeliverable(deliverable || null);
    setShowModal(true);
  };

  const saveDeliverable = async (content: string, tags: string[] = []) => {
    if (!selectedDeliverable || !selectedProject?.id) return;

    try {
      if (selectedDeliverable.id.startsWith('mock-')) {
        // Create new deliverable in database
        const createResponse = await projectDeliverablesService.createProjectDeliverable({
          project_id: selectedProject.id,
          type: selectedDeliverable.type,
          title: selectedDeliverable.title,
          content,
          stage: selectedDeliverable.stage,
          tags
        });

        if (createResponse.error) {
          throw new Error(createResponse.error);
        }

        // Update local state with new deliverable
        const newDeliverable = createResponse.data[0];
        setDeliverables(prev => prev.map(d => 
          d.id === selectedDeliverable.id ? newDeliverable : d
        ));
        setSelectedDeliverable(newDeliverable);
      } else {
        // Update existing deliverable
        const updateResponse = await projectDeliverablesService.updateProjectDeliverable({
          id: selectedDeliverable.id,
          content,
          tags,
          status: content.trim() ? 'in_progress' : 'draft'
        });

        if (updateResponse.error) {
          throw new Error(updateResponse.error);
        }

        // Update local state
        const updatedDeliverable = updateResponse.data[0];
        setDeliverables(prev => 
          prev.map(d => d.id === selectedDeliverable.id ? updatedDeliverable : d
        ));
        setSelectedDeliverable(updatedDeliverable);
      }
    } catch (err) {
      console.error('Error saving deliverable:', err);
      setError(err instanceof Error ? err.message : 'Failed to save deliverable');
    }
  };

  const getStageTips = () => {
    return [
      "Look out for bottlenecks, handoffs, manual interventions in the As-Is process.",
      "Focus on what actually happens today, not what should happen.",
      "Use swimlanes to separate roles like Customer, Ops, Compliance.",
      "Document exceptions and workarounds - they often reveal the real process."
    ];
  };

  const getExamples = () => {
    return [
      {
        title: "Problem Statement Example",
        content: "The current ID verification process lacks automation, resulting in delays and higher fraud risk. Teams rely on manual review, causing inefficiencies.",
        type: "problem_statement"
      },
      {
        title: "Process Map Best Practice",
        content: "Only map what happens today — don't design the future yet. Use swimlanes to separate roles and show handoffs clearly.",
        type: "process_map"
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setCurrentView('project-flow')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Back to Project Journey"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProject?.name || 'Project 1: Identity Verification'}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full text-sm font-medium">
                  As-Is Mapping Stage
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl">
            Capture your key Business Analysis deliverables as you progress through this project. These will help you speak confidently in interviews and real BA roles.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Project Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching your deliverables and training progress...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Layout - Two Column Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          {/* Left Column: Deliverable Cards (70%) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Problem Statement Card */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Problem Statement</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Summarize the core problem</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverables.find(d => d.type === 'problem_statement')?.status || 'not_started')}`}>
                    {getStatusText(deliverables.find(d => d.type === 'problem_statement')?.status || 'not_started')}
                  </span>
                  <button
                    onClick={() => openDeliverableModal('problem_statement')}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {deliverables.find(d => d.type === 'problem_statement')?.content ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {deliverables.find(d => d.type === 'problem_statement')?.content}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    Click edit to write your problem statement
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Last updated: {deliverables.find(d => d.type === 'problem_statement')?.lastUpdated.toLocaleDateString() || 'Never'}</span>
                <button
                  onClick={() => openDeliverableModal('problem_statement')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {deliverables.find(d => d.type === 'problem_statement')?.content ? 'Edit' : 'Create'} Problem Statement
                </button>
              </div>
            </div>

            {/* As-Is Process Map Card */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">As-Is Process Map</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Map current process flow</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverables.find(d => d.type === 'process_map')?.status || 'not_started')}`}>
                    {getStatusText(deliverables.find(d => d.type === 'process_map')?.status || 'not_started')}
                  </span>
                  <button
                    onClick={() => openDeliverableModal('process_map')}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                    {deliverables.find(d => d.type === 'process_map')?.content ? 'Process map in progress' : 'Start mapping your current process flow'}
                  </p>
                  <button
                    onClick={() => openDeliverableModal('process_map')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {deliverables.find(d => d.type === 'process_map')?.content ? 'Continue Mapping' : 'Start Process Mapping'}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Last updated: {deliverables.find(d => d.type === 'process_map')?.lastUpdated.toLocaleDateString() || 'Never'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Best Practice:</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Only map what happens today — don't design the future yet</span>
                </div>
              </div>
            </div>

            {/* Stakeholder Notes Card */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Notes from Stakeholder Conversations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Capture insights and observations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverables.find(d => d.type === 'stakeholder_notes')?.status || 'not_started')}`}>
                    {getStatusText(deliverables.find(d => d.type === 'stakeholder_notes')?.status || 'not_started')}
                  </span>
                  <button
                    onClick={() => openDeliverableModal('stakeholder_notes')}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {deliverables.find(d => d.type === 'stakeholder_notes')?.content ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                    {deliverables.find(d => d.type === 'stakeholder_notes')?.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {deliverables.find(d => d.type === 'stakeholder_notes')?.tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    Start capturing insights from your stakeholder meetings
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Last updated: {deliverables.find(d => d.type === 'stakeholder_notes')?.lastUpdated.toLocaleDateString() || 'Never'}</span>
                <button
                  onClick={() => openDeliverableModal('stakeholder_notes')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {deliverables.find(d => d.type === 'stakeholder_notes')?.content ? 'Edit Notes' : 'Start Taking Notes'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Reference Tools (30%) */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg sticky top-6">
              {/* Header */}
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Reference Tools</h3>
                  <button
                    onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                    className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {isRightPanelCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isRightPanelCollapsed && (
                <div className="p-4">
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('transcripts')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'transcripts'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Transcripts
                    </button>
                    <button
                      onClick={() => setActiveTab('tips')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'tips'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Tips
                    </button>
                    <button
                      onClick={() => setActiveTab('examples')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'examples'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Examples
                    </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'transcripts' && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Meeting Transcripts</h4>
                                             {getTranscripts().map((transcript) => (
                        <div key={transcript.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {transcript.date.toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {transcript.participants.length} participants
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {transcript.summary}
                          </p>
                          <div className="space-y-1">
                            {transcript.keyInsights.slice(0, 2).map((insight, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'tips' && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Stage-Specific Tips</h4>
                      <div className="space-y-3">
                        {getStageTips().map((tip, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'examples' && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">What Good Looks Like</h4>
                      <div className="space-y-3">
                        {getExamples().map((example, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                              {example.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {example.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link to Learning */}
                  <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 text-sm">
                      📚 What Good Looks Like
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Modal for Editing Deliverables */}
      {showModal && modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {getDeliverableIcon(modalType)}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalType === 'problem_statement' && 'Problem Statement'}
                  {modalType === 'process_map' && 'As-Is Process Map'}
                  {modalType === 'stakeholder_notes' && 'Stakeholder Notes'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-140px)]">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {modalType === 'problem_statement' && (
                  <ProblemStatementEditor
                    content={selectedDeliverable?.content || ''}
                    onSave={saveDeliverable}
                  />
                )}
                {modalType === 'process_map' && (
                  <ProcessMapEditor
                    content={selectedDeliverable?.content || ''}
                    onSave={saveDeliverable}
                  />
                )}
                {modalType === 'stakeholder_notes' && (
                  <StakeholderNotesEditor
                    content={selectedDeliverable?.content || ''}
                    tags={selectedDeliverable?.tags || []}
                    onSave={saveDeliverable}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="w-80 bg-gray-50 dark:bg-gray-700/50 p-6 border-l border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Tips & Guidance</h4>
                {modalType === 'problem_statement' && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        A strong problem statement captures the pain, not a proposed fix.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Example:</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "The current ID verification process lacks automation, resulting in delays and higher fraud risk. Teams rely on manual review, causing inefficiencies."
                      </p>
                    </div>
                  </div>
                )}
                {modalType === 'process_map' && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Only map what happens today — don't design the future yet.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Map className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use swimlanes to separate roles like Customer, Ops, Compliance.
                      </p>
                    </div>
                  </div>
                )}
                {modalType === 'stakeholder_notes' && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Capture insights, pain points, and system mentions from conversations.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add tags like "risk", "system", "manual step", "conflict" for easy reference.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for the modal editors
const ProblemStatementEditor: React.FC<{ content: string; onSave: (content: string) => void }> = ({ content, onSave }) => {
  const [text, setText] = useState(content);
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSave = () => {
    onSave(text);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Problem Summary
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Summarize the problem your stakeholders are facing. Focus on pain points, not the solution."
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Attachments (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
          <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Drop files here or click to upload
          </p>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
            Choose Files
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Draft</span>
        </button>
      </div>
    </div>
  );
};

const ProcessMapEditor: React.FC<{ content: string; onSave: (content: string) => void }> = ({ content, onSave }) => {
  const [text, setText] = useState(content);

  const handleSave = () => {
    onSave(text);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Process Steps (Text Format)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the current process step by step. Include roles, systems, and handoffs."
          className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Map className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Visual Process Mapper</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
          For visual process mapping, use the interactive tool in the Learning section.
        </p>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          Open Process Mapper
        </button>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Draft</span>
        </button>
      </div>
    </div>
  );
};

const StakeholderNotesEditor: React.FC<{ content: string; tags: string[]; onSave: (content: string, tags: string[]) => void }> = ({ content, tags, onSave }) => {
  const [text, setText] = useState(content);
  const [currentTags, setCurrentTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    onSave(text, currentTags);
  };

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags([...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes & Insights
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Capture insights, observations, and key points from stakeholder conversations..."
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {currentTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Draft</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectDeliverablesView;
