import React, { useState, useEffect } from 'react';
import { Plus, FileText, Brain, BarChart3, Calendar, Filter, Search, Eye, Play, CheckCircle, Clock, AlertTriangle, Zap, Users, Target, TrendingUp, X, Workflow, BookOpen, Square, Bug, Lightbulb, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Project } from '../../lib/types';

// Types
interface AgileTicket {
  id: string;
  type: 'Story' | 'Task' | 'Bug' | 'Spike';
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Ready for Refinement' | 'Refined';
  createdAt: string;
  updatedAt: string;
  userId: string;
  refinementScore?: {
    clarity: number;
    completeness: number;
    testability: number;
    overall: number;
    feedback: string[];
    aiSummary: string;
  };
}

interface RefinementMeeting {
  id: string;
  ticketId: string;
  participants: string[];
  duration: number;
  transcript: Array<{ speaker: string; message: string; timestamp: string }>;
  summary: string;
  scores: {
    clarity: number;
    completeness: number;
    testability: number;
    overall: number;
  };
  feedback: string[];
  completedAt: string;
}

export const AgileHubView: React.FC = () => {
  const { user } = useAuth();
  const { selectedProject, projects } = useApp();
  const [currentProject, setCurrentProject] = useState<Project | null>(selectedProject);
  const [activeTab, setActiveTab] = useState<'backlog' | 'refinement' | 'feedback' | 'ceremonies'>('backlog');
  const [tickets, setTickets] = useState<AgileTicket[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRefinementModal, setShowRefinementModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<AgileTicket | null>(null);
  const [refinementMeetings, setRefinementMeetings] = useState<RefinementMeeting[]>([]);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  useEffect(() => {
    setCurrentProject(selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    loadTickets();
    loadRefinementMeetings();
  }, [user?.id, currentProject?.id]);

  const getStorageKey = (type: 'tickets' | 'meetings') => {
    const projectId = currentProject?.id || 'default';
    return `agile_${type}_${user?.id}_${projectId}`;
  };

  const loadTickets = () => {
    if (!user?.id) return;
    
    const storageKey = getStorageKey('tickets');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setTickets(JSON.parse(saved));
    }
  };

  const loadRefinementMeetings = () => {
    if (!user?.id) return;
    
    const storageKey = getStorageKey('meetings');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setRefinementMeetings(JSON.parse(saved));
    }
  };

  const saveTickets = (updatedTickets: AgileTicket[]) => {
    if (!user?.id) return;
    
    const storageKey = getStorageKey('tickets');
    localStorage.setItem(storageKey, JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
  };

  const createTicket = (ticketData: Omit<AgileTicket, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user?.id) return;

    const newTicket: AgileTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id
    };

    const updatedTickets = [...tickets, newTicket];
    saveTickets(updatedTickets);
    setShowCreateModal(false);
  };

  const updateTicketStatus = (ticketId: string, status: AgileTicket['status'], refinementScore?: AgileTicket['refinementScore']) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status, 
            updatedAt: new Date().toISOString(),
            ...(refinementScore && { refinementScore })
          }
        : ticket
    );
    saveTickets(updatedTickets);
  };

  const startRefinementMeeting = (ticket: AgileTicket) => {
    setSelectedTicket(ticket);
    setShowRefinementModal(true);
  };

  const getTypeIcon = (type: AgileTicket['type']) => {
    switch (type) {
      case 'Story': return <BookOpen className="w-4 h-4" />;
      case 'Task': return <Square className="w-4 h-4" />;
      case 'Bug': return <Bug className="w-4 h-4" />;
      case 'Spike': return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AgileTicket['type']) => {
    switch (type) {
      case 'Story': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Task': return 'bg-green-100 text-green-700 border-green-200';
      case 'Bug': return 'bg-red-100 text-red-700 border-red-200';
      case 'Spike': return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getPriorityColor = (priority: AgileTicket['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: AgileTicket['status']) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Ready for Refinement': return 'bg-orange-100 text-orange-700';
      case 'Refined': return 'bg-green-100 text-green-700';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const storiesReadyForRefinement = tickets.filter(
    ticket => ticket.type === 'Story' && ticket.status === 'Ready for Refinement'
  );

  const refinedStories = tickets.filter(
    ticket => ticket.type === 'Story' && ticket.status === 'Refined'
  );

  // Show project selection if no current project but projects exist
  if (!currentProject) {
    if (projects && projects.length > 0) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Project</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a project to manage its backlog and refinement meetings.
            </p>
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{project.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // No projects at all
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Agile Hub</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a training project to start creating stories and practicing Agile delivery workflows.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Go to <strong>Training Projects</strong> to select a project and begin your Agile journey!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agile Hub</h1>
                {projects && projects.length > 1 ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className="flex items-center space-x-2 pl-3 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                      <span>{currentProject?.name}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {showProjectDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                        {projects.map(project => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setCurrentProject(project);
                              setShowProjectDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                              currentProject?.id === project.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            <span>{project.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {currentProject.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your delivery backlog and refinement meetings</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{tickets.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{storiesReadyForRefinement.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Ready for Refinement</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{refinedStories.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Refined Stories</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{refinementMeetings.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Meetings Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('backlog')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'backlog'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span>My Backlog</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('refinement')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'refinement'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Brain size={16} />
                  <span>Ready for Refinement</span>
                  {storiesReadyForRefinement.length > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                      {storiesReadyForRefinement.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 size={16} />
                  <span>Feedback & Scoring</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ceremonies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ceremonies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Agile Ceremonies</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Backlog Tab */}
            {activeTab === 'backlog' && (
              <div>
                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Ready for Refinement">Ready for Refinement</option>
                    <option value="Refined">Refined</option>
                  </select>
                </div>

                {/* Tickets Table */}
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tickets found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first ticket</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create New Ticket
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Ticket
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {ticket.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                                  {ticket.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(ticket.type)}`}>
                                {getTypeIcon(ticket.type)}
                                <span className="ml-1">{ticket.type}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {ticket.type === 'Story' && ticket.status === 'Ready for Refinement' && (
                                  <button
                                    onClick={() => startRefinementMeeting(ticket)}
                                    className="bg-orange-600 text-white px-3 py-1 rounded-md text-xs hover:bg-orange-700 transition-colors flex items-center space-x-1"
                                  >
                                    <Play size={12} />
                                    <span>Join Refinement</span>
                                  </button>
                                )}
                                {ticket.status === 'Draft' && (
                                  <button
                                    onClick={() => updateTicketStatus(ticket.id, 'Ready for Refinement')}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors"
                                  >
                                    Mark Ready
                                  </button>
                                )}
                                <button className="text-gray-400 hover:text-gray-600 p-1">
                                  <Eye size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Ready for Refinement Tab */}
            {activeTab === 'refinement' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Stories Ready for Refinement</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Join AI-powered refinement meetings to improve story clarity and completeness
                  </p>
                </div>

                {storiesReadyForRefinement.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stories ready for refinement</h3>
                    <p className="text-gray-500 dark:text-gray-400">Create stories and mark them as ready to start refinement meetings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storiesReadyForRefinement.map((story) => (
                      <div key={story.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                                 <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center space-x-2">
                             <BookOpen className="w-5 h-5 text-blue-600" />
                             <span className="text-sm font-medium text-blue-600">Story</span>
                           </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}>
                            {story.priority}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{story.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{story.description}</p>
                        
                        {story.acceptanceCriteria && (
                          <div className="mb-4">
                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Acceptance Criteria
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{story.acceptanceCriteria}</p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => startRefinementMeeting(story)}
                          className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Users size={16} />
                          <span>Join Refinement Meeting</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Refinement Feedback & Scoring</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review AI feedback from your refinement meetings to improve your story writing skills
                  </p>
                </div>

                {refinementMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No refinement meetings yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Complete refinement meetings to see your scoring and feedback</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Average Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['clarity', 'completeness', 'testability', 'overall'].map((metric) => {
                        const avg = refinementMeetings.reduce((sum, meeting) => sum + meeting.scores[metric as keyof typeof meeting.scores], 0) / refinementMeetings.length;
                        return (
                          <div key={metric} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{avg.toFixed(1)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{metric}</div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${avg >= 80 ? 'bg-green-500' : avg >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${avg}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Recent Meetings */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Refinement Meetings</h4>
                      <div className="space-y-4">
                        {refinementMeetings.slice(-5).reverse().map((meeting) => {
                          const ticket = tickets.find(t => t.id === meeting.ticketId);
                          return (
                            <div key={meeting.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">{ticket?.title}</h5>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(meeting.completedAt).toLocaleDateString()} • {meeting.duration} min
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.scores.overall}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.scores.clarity}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Clarity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.scores.completeness}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Completeness</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.scores.testability}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Testability</div>
                                </div>
                              </div>

                              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-2">AI Feedback</h6>
                                <ul className="space-y-1">
                                  {meeting.feedback.slice(0, 3).map((feedback, index) => (
                                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                                      <Target className="w-3 h-3 mt-1 text-blue-500 flex-shrink-0" />
                                      <span>{feedback}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ceremonies Tab */}
            {activeTab === 'ceremonies' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Agile Ceremonies</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Sprint Planning, Daily Standups, and Retrospectives coming soon!
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-md mx-auto">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What's Coming</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Sprint Planning Simulations</li>
                    <li>• Daily Standup Practice</li>
                    <li>• Retrospective Facilitation</li>
                    <li>• Sprint Review Presentations</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onCreateTicket={createTicket}
        />
      )}

      {/* Refinement Meeting Modal */}
      {showRefinementModal && selectedTicket && (
        <RefinementMeetingModal
          ticket={selectedTicket}
          onClose={() => {
            setShowRefinementModal(false);
            setSelectedTicket(null);
          }}
          onComplete={(meetingData, scores) => {
            // Save meeting data
            const newMeeting: RefinementMeeting = {
              id: `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
              ticketId: selectedTicket.id,
              participants: ['You', 'Dev 1', 'Dev 2', 'Tester', 'Scrum Master'],
              duration: meetingData.duration,
              transcript: meetingData.transcript,
              summary: meetingData.summary,
              scores,
              feedback: meetingData.feedback,
              completedAt: new Date().toISOString()
            };
            
            const updatedMeetings = [...refinementMeetings, newMeeting];
            const storageKey = getStorageKey('meetings');
            localStorage.setItem(storageKey, JSON.stringify(updatedMeetings));
            setRefinementMeetings(updatedMeetings);
            
            // Update ticket status and scores
            updateTicketStatus(selectedTicket.id, 'Refined', {
              clarity: scores.clarity,
              completeness: scores.completeness,
              testability: scores.testability,
              overall: scores.overall,
              feedback: meetingData.feedback,
              aiSummary: meetingData.summary
            });
            
            setShowRefinementModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

// Create Ticket Modal Component
const CreateTicketModal: React.FC<{
  onClose: () => void;
  onCreateTicket: (ticket: Omit<AgileTicket, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
}> = ({ onClose, onCreateTicket }) => {
  const [formData, setFormData] = useState({
    type: 'Story' as AgileTicket['type'],
    title: '',
    description: '',
    acceptanceCriteria: '',
    priority: 'Medium' as AgileTicket['priority'],
    status: 'Draft' as AgileTicket['status']
  });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const getTypeIcon = (type: AgileTicket['type']) => {
    switch (type) {
      case 'Story': return <BookOpen className="w-4 h-4" />;
      case 'Task': return <Square className="w-4 h-4" />;
      case 'Bug': return <Bug className="w-4 h-4" />;
      case 'Spike': return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AgileTicket['type']) => {
    switch (type) {
      case 'Story': return 'text-blue-600';
      case 'Task': return 'text-green-600';
      case 'Bug': return 'text-red-600';
      case 'Spike': return 'text-purple-600';
    }
  };

  const ticketTypes: AgileTicket['type'][] = ['Story', 'Task', 'Bug', 'Spike'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onCreateTicket(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Create New Ticket</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center space-x-2">
                  <span className={getTypeColor(formData.type)}>
                    {getTypeIcon(formData.type)}
                  </span>
                  <span>{formData.type}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showTypeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  {ticketTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, type });
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                        formData.type === type ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className={getTypeColor(type)}>
                        {getTypeIcon(type)}
                      </span>
                      <span className="text-gray-900 dark:text-white">{type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of the work"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={formData.type === 'Story' ? 'As a [user], I want [goal] so that [benefit]' : 'Detailed description of the work'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Acceptance Criteria (Stories only) */}
          {formData.type === 'Story' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Acceptance Criteria
              </label>
              <textarea
                value={formData.acceptanceCriteria}
                onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                placeholder="Given [context], when [action], then [outcome]"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as AgileTicket['priority'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Refinement Meeting Modal Component (placeholder for now)
const RefinementMeetingModal: React.FC<{
  ticket: AgileTicket;
  onClose: () => void;
  onComplete: (meetingData: any, scores: any) => void;
}> = ({ ticket, onClose, onComplete }) => {
  const [isInProgress, setIsInProgress] = useState(false);
  const [meetingPhase, setMeetingPhase] = useState<'intro' | 'discussion' | 'estimation' | 'summary'>('intro');

  const startMeeting = () => {
    setIsInProgress(true);
    setMeetingPhase('discussion');
    
    // Simulate meeting progression
    setTimeout(() => setMeetingPhase('estimation'), 15000);
    setTimeout(() => setMeetingPhase('summary'), 30000);
    setTimeout(() => {
      // Generate mock scores and complete
      const scores = {
        clarity: Math.floor(Math.random() * 30) + 70,
        completeness: Math.floor(Math.random() * 30) + 70,
        testability: Math.floor(Math.random() * 30) + 70,
        overall: Math.floor(Math.random() * 30) + 70
      };
      
      const meetingData = {
        duration: 25,
        transcript: [
          { speaker: 'Scrum Master', message: 'Let\'s review this story together', timestamp: new Date().toISOString() },
          { speaker: 'Dev 1', message: 'The acceptance criteria could be more specific', timestamp: new Date().toISOString() },
          { speaker: 'Tester', message: 'I\'d like to see more edge cases covered', timestamp: new Date().toISOString() }
        ],
        summary: 'Story was refined with team input. Added more specific acceptance criteria and edge cases.',
        feedback: [
          'Consider breaking down large stories into smaller, more manageable pieces',
          'Include more technical details in acceptance criteria',
          'Add examples of edge cases to improve testability'
        ]
      };
      
      onComplete(meetingData, scores);
    }, 45000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Refinement Meeting: {ticket.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        {!isInProgress ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Ready to Start Refinement?</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join your AI team members to refine this story through collaborative discussion
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
              <h5 className="font-medium mb-2">Meeting Participants:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div>• You (Business Analyst)</div>
                <div>• Sarah (Scrum Master)</div>
                <div>• Mike (Senior Developer)</div>
                <div>• Lisa (Developer)</div>
                <div>• Tom (QA Tester)</div>
              </div>
            </div>
            
            <button
              onClick={startMeeting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Meeting
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Meeting in Progress</span>
                <span className="text-sm text-gray-500">Phase: {meetingPhase}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {meetingPhase === 'intro' && 'Starting the meeting...'}
                  {meetingPhase === 'discussion' && 'Team is discussing the story requirements and acceptance criteria...'}
                  {meetingPhase === 'estimation' && 'Estimating complexity and identifying dependencies...'}
                  {meetingPhase === 'summary' && 'Wrapping up and generating AI feedback...'}
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                AI team members are analyzing your story and providing feedback...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};