import React, { useState, useEffect } from 'react';
import { Plus, FileText, Brain, BarChart3, Calendar, Filter, Search, Eye, Play, CheckCircle, Clock, AlertTriangle, Zap, Users, Target, TrendingUp, X, Workflow, BookOpen, Square, Bug, Lightbulb, ChevronDown, Edit3, Trash2, MoreHorizontal, Paperclip, MessageCircle, Upload, Download, Send, GripVertical, Check, ArrowUp, ArrowDown, RotateCcw, Monitor, ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

// Training-specific types
interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  section: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
  objectives: string[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number; // 0-100
}

interface TrainingTicket {
  id: string;
  ticketNumber: string;
  scenarioId: string;
  type: 'Story' | 'Task' | 'Bug' | 'Spike';
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Ready for Refinement' | 'Refined' | 'In Sprint' | 'To Do' | 'In Progress' | 'In Test' | 'Done';
  storyPoints?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isTraining: boolean;
  trainingNotes?: string;
}

interface TrainingMeeting {
  id: string;
  ticketId: string;
  scenarioId: string;
  type: 'Refinement' | 'Sprint Planning' | 'Daily Scrum' | 'Sprint Review' | 'Retrospective';
  participants: string[];
  duration: number;
  transcript: Array<{ speaker: string; message: string; timestamp: string }>;
  summary: string;
  learningObjectives: string[];
  feedback: string[];
  completedAt: string;
}

// Training scenarios based on actual Scrum Essentials content
const trainingScenarios: TrainingScenario[] = [
  {
    id: 'scrum-roles-practice',
    title: 'Customer ID Upload: Working with Scrum Roles',
    description: 'Practice the BA role in a customer onboarding scenario where ID checks are too slow. Work with Product Owner, Scrum Master, and Developers to solve this business problem.',
    section: 'Section 2: Scrum Roles',
    difficulty: 'Beginner',
    duration: '15-20 min',
    skills: ['Role Understanding', 'Stakeholder Translation', 'Team Collaboration'],
    objectives: [
      'Practice translating PO priorities into clear requirements',
      'Work with Scrum Master on process blockers',
      'Answer detailed developer questions about business needs',
      'Experience being the "translator" between business and technical teams'
    ],
    status: 'Not Started',
    progress: 0
  },
  {
    id: 'scrum-events-practice',
    title: 'ID Upload Feature: Scrum Events in Action',
    description: 'Take the ID upload story through all Scrum events: Refinement, Sprint Planning, Daily Scrum, Review, and Retrospective. Experience the complete sprint cycle.',
    section: 'Section 3: Scrum Events',
    difficulty: 'Intermediate',
    duration: '25-30 min',
    skills: ['Event Facilitation', 'Story Refinement', 'Sprint Planning'],
    objectives: [
      'Lead refinement sessions with developer questions about file formats and error handling',
      'Present stories in Sprint Planning with Definition of Ready',
      'Handle requirements blockers in Daily Scrum',
      'Validate increments against acceptance criteria in Sprint Review',
      'Reflect on requirements process in Retrospective'
    ],
    status: 'Not Started',
    progress: 0
  },
  {
    id: 'scrum-artefacts-practice',
    title: 'Managing ID Upload: Product Backlog to Increment',
    description: 'Practice managing the complete lifecycle of the ID upload story through Product Backlog, Sprint Backlog, and validating the final Increment.',
    section: 'Section 4: Scrum Artefacts',
    difficulty: 'Beginner',
    duration: '15-20 min',
    skills: ['Backlog Management', 'Definition of Ready', 'Definition of Done'],
    objectives: [
      'Place user stories in Product Backlog with proper prioritization',
      'Ensure stories meet Definition of Ready before Sprint Planning',
      'Track stories through Sprint Backlog during development',
      'Validate completed Increment against acceptance criteria',
      'Apply Definition of Done to ensure quality'
    ],
    status: 'Not Started',
    progress: 0
  },
  {
    id: 'backlog-refinement-practice',
    title: 'Refining the ID Upload Story: The BA\'s Playground',
    description: 'Practice the BA\'s key role in backlog refinement. Take a basic user story and work with developers to make it sprint-ready through questions and collaboration.',
    section: 'Section 5: Backlog Refinement',
    difficulty: 'Intermediate',
    duration: '20-25 min',
    skills: ['Story Writing', 'Question Handling', 'Acceptance Criteria'],
    objectives: [
      'Present initial user story: "As a customer, I want to upload a valid ID so I can complete my account verification"',
      'Handle developer questions about file formats, blurry photos, fraud detection',
      'Update acceptance criteria based on team discussion',
      'Split large stories into smaller, deliverable chunks',
      'Ensure story is clear, complete, and ready for sprint'
    ],
    status: 'Not Started',
    progress: 0
  },
  {
    id: 'requirements-docs-practice',
    title: 'Just-Enough Documentation: ID Upload Requirements',
    description: 'Practice writing lean, living documentation for the ID upload feature. Balance detail with agility while ensuring developers have what they need.',
    section: 'Section 6: Requirements Documentation',
    difficulty: 'Beginner',
    duration: '15-20 min',
    skills: ['User Stories', 'Acceptance Criteria', 'Edge Cases'],
    objectives: [
      'Write clear user story: "As a new customer, I want to upload my ID online so that I can complete onboarding quickly"',
      'Define testable acceptance criteria with Given-When-Then format',
      'Document edge cases: file too large, wrong format, blurry photos',
      'Create process maps for before-and-after scenarios',
      'Practice progressive documentation that evolves with development'
    ],
    status: 'Not Started',
    progress: 0
  },
  {
    id: 'delivery-flow-practice',
    title: 'Complete BA Journey: From Problem to Working Software',
    description: 'Experience the full BA delivery flow using the customer onboarding problem. Go from problem exploration through process mapping to working ID upload feature.',
    section: 'Section 7: Delivery Flow',
    difficulty: 'Advanced',
    duration: '30-35 min',
    skills: ['Problem Exploration', 'Process Mapping', 'Solution Design'],
    objectives: [
      'Explore the problem: "Manual ID verification delays customer onboarding and increases fraud risk"',
      'Map As-Is process: email → scan → send → manual check → confirmation',
      'Design To-Be process: online portal → auto-validate → success/failure message',
      'Create solution design with UX/UI considerations',
      'Follow requirement through complete delivery cycle: Elicitation → Draft → Refinement → Planning → Build → Review → Feedback'
    ],
    status: 'Not Started',
    progress: 0
  }
];

// AI Team Members for training
const aiTeamMembers = {
  productOwner: {
    name: 'Sarah Chen',
    role: 'Product Owner',
    avatar: '👩‍💼',
    personality: 'Focused on value and priorities, asks tough questions about business impact'
  },
  scrumMaster: {
    name: 'Marcus Johnson',
    role: 'Scrum Master',
    avatar: '👨‍💻',
    personality: 'Process-focused, helps remove blockers and improve team dynamics'
  },
  developer1: {
    name: 'Alex Rivera',
    role: 'Senior Developer',
    avatar: '👨‍🔬',
    personality: 'Technical expert, asks detailed implementation questions'
  },
  developer2: {
    name: 'Jordan Kim',
    role: 'Developer',
    avatar: '👩‍💻',
    personality: 'Detail-oriented, focuses on testability and edge cases'
  }
};

export const ScrumPracticeView: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);
  const [scenarios, setScenarios] = useState<TrainingScenario[]>(trainingScenarios);
  const [tickets, setTickets] = useState<TrainingTicket[]>([]);
  const [meetings, setMeetings] = useState<TrainingMeeting[]>([]);
  const [activeView, setActiveView] = useState<'scenarios' | 'tickets' | 'meetings' | 'progress'>('scenarios');
  const [selectedTicket, setSelectedTicket] = useState<TrainingTicket | null>(null);

  // Load training data from localStorage
  useEffect(() => {
    if (user) {
      const savedScenarios = localStorage.getItem(`scrum_practice_scenarios_${user.id}`);
      const savedTickets = localStorage.getItem(`scrum_practice_tickets_${user.id}`);
      const savedMeetings = localStorage.getItem(`scrum_practice_meetings_${user.id}`);

      if (savedScenarios) {
        setScenarios(JSON.parse(savedScenarios));
      }
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }
      if (savedMeetings) {
        setMeetings(JSON.parse(savedMeetings));
      }
    }
  }, [user]);

  // Save training data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`scrum_practice_scenarios_${user.id}`, JSON.stringify(scenarios));
    }
  }, [scenarios, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`scrum_practice_tickets_${user.id}`, JSON.stringify(tickets));
    }
  }, [tickets, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`scrum_practice_meetings_${user.id}`, JSON.stringify(meetings));
    }
  }, [meetings, user]);

  const startScenario = (scenario: TrainingScenario) => {
    setSelectedScenario(scenario);
    // Initialize training tickets for this scenario
    const scenarioTickets = generateTrainingTickets(scenario);
    setTickets(prev => [...prev, ...scenarioTickets]);
    setActiveView('tickets');
  };

  const generateTrainingTickets = (scenario: TrainingScenario): TrainingTicket[] => {
    const baseTickets = {
      'scrum-roles-practice': [
        {
          id: `role-${scenario.id}-1`,
          ticketNumber: 'ONBOARD-001',
          scenarioId: scenario.id,
          type: 'Story' as const,
          title: 'Enable Online ID Upload for Customer Onboarding',
          description: 'As a BA, work with the Product Owner who has prioritized reducing customer drop-offs. The PO says "ID upload is priority number one" - your job is to make sure the team understands what this means.',
          acceptanceCriteria: 'Given the PO\'s priority decision, when you meet with stakeholders, then you should shape the request into clear stories and acceptance criteria that developers can build.',
          priority: 'High' as const,
          status: 'Draft' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || '',
          isTraining: true,
          trainingNotes: 'Practice being the translator between PO priorities and developer needs. The PO focuses on value, you focus on clarity.'
        }
      ],
      'backlog-refinement-practice': [
        {
          id: `refinement-${scenario.id}-1`,
          ticketNumber: 'REF-001',
          scenarioId: scenario.id,
          type: 'Story' as const,
          title: 'Refine: As a customer, I want to upload a valid ID so I can complete my account verification',
          description: 'You\'ve written this initial story. Now work with developers who will ask: "What formats are allowed - PDF, JPG, PNG? What happens if the photo is blurry? Do we need to detect fraud automatically? What message do we show on error?"',
          acceptanceCriteria: 'Given the initial user story, when developers ask detailed questions, then you should update the story with clear acceptance criteria and handle edge cases.',
          priority: 'High' as const,
          status: 'Ready for Refinement' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || '',
          isTraining: true,
          trainingNotes: 'This is the BA\'s playground - where your writing gets tested. Answer questions, capture unknowns, split big stories, update acceptance criteria.'
        }
      ],
      'scrum-events-practice': [
        {
          id: `events-${scenario.id}-1`,
          ticketNumber: 'SPRINT-001',
          scenarioId: scenario.id,
          type: 'Story' as const,
          title: 'Sprint Planning: ID Upload Feature',
          description: 'Present the refined ID upload story in Sprint Planning. The team will ask: "What happens if the file is too large?" You need to either answer immediately or commit to confirming it quickly.',
          acceptanceCriteria: 'Given a refined user story, when you present it in Sprint Planning, then the team should commit with confidence because requirements are truly ready.',
          priority: 'High' as const,
          status: 'Refined' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || '',
          isTraining: true,
          trainingNotes: 'Your role is to ensure requirements meet Definition of Ready. No major unknowns, clear acceptance criteria, small enough for one sprint.'
        }
      ],
      'requirements-docs-practice': [
        {
          id: `docs-${scenario.id}-1`,
          ticketNumber: 'DOC-001',
          scenarioId: scenario.id,
          type: 'Story' as const,
          title: 'Write Just-Enough Documentation: ID Upload',
          description: 'Write lean, living documentation for the ID upload feature. Start with: "As a new customer, I want to upload my ID online so that I can complete onboarding quickly." Then add acceptance criteria and edge cases.',
          acceptanceCriteria: 'Given the need for just-enough documentation, when you write user stories and acceptance criteria, then developers should have what they need without unnecessary detail.',
          priority: 'Medium' as const,
          status: 'Draft' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || '',
          isTraining: true,
          trainingNotes: 'Balance detail with agility. Document edge cases: file too large, wrong format, blurry photos. Create process maps for before-and-after scenarios.'
        }
      ],
      'delivery-flow-practice': [
        {
          id: `flow-${scenario.id}-1`,
          ticketNumber: 'FLOW-001',
          scenarioId: scenario.id,
          type: 'Story' as const,
          title: 'Complete BA Journey: Customer Onboarding Problem',
          description: 'Start with the problem: "Manual ID verification delays customer onboarding and increases fraud risk." Map the As-Is process, design the To-Be process, then follow the requirement through the complete delivery cycle.',
          acceptanceCriteria: 'Given a business problem, when you follow the complete BA delivery flow, then you should have a working solution that solves the original problem.',
          priority: 'High' as const,
          status: 'Draft' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || '',
          isTraining: true,
          trainingNotes: 'Experience the full journey: Problem Exploration → As-Is Mapping → To-Be Design → Solution Design → Refinement → Planning → Build → Review → Feedback.'
        }
      ]
    };

    return baseTickets[scenario.id as keyof typeof baseTickets] || [];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    const completed = scenarios.filter(s => s.status === 'Completed').length;
    return Math.round((completed / scenarios.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('practice')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Scrum Practice</h1>
                <p className="text-sm text-gray-600">Practice Scrum skills with AI team members</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Review Scrum Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'scenarios', label: 'Training Scenarios', icon: Target },
              { id: 'tickets', label: 'Training Tickets', icon: FileText },
              { id: 'meetings', label: 'Practice Meetings', icon: Users },
              { id: 'progress', label: 'Progress', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'scenarios' && (
          <div>
            {/* Progress Overview */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                    <h2 className="text-2xl font-bold text-purple-900">Training Progress</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{getProgressPercentage()}%</div>
                    <div className="text-sm text-purple-700">Complete</div>
                  </div>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-purple-800 mt-4">
                  Complete training scenarios to build your Scrum skills. Each scenario is based on the Scrum Essentials you've learned.
                </p>
              </div>
            </div>

            {/* Training Scenarios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      <div className="text-xs text-purple-600 font-medium mb-3">{scenario.section}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scenario.status)}`}>
                      {scenario.status}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
                    <div className={`px-2 py-1 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{scenario.duration}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scenario.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {scenario.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => startScenario(scenario)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Training</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'tickets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Training Tickets</h2>
              <div className="text-sm text-gray-600">
                {tickets.length} tickets • {tickets.filter(t => t.status === 'Done').length} completed
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Tickets Yet</h3>
                <p className="text-gray-600 mb-4">Start a training scenario to generate practice tickets.</p>
                <button
                  onClick={() => setActiveView('scenarios')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Scenarios
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ticket.ticketNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate">{ticket.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {ticket.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'meetings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Practice Meetings</h2>
              <div className="text-sm text-gray-600">
                {meetings.length} meetings • Practice with AI team members
              </div>
            </div>

            {meetings.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Meetings Yet</h3>
                <p className="text-gray-600 mb-4">Start working on training tickets to generate practice meetings.</p>
                <button
                  onClick={() => setActiveView('tickets')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Tickets
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.type}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{meeting.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{meeting.duration} min</span>
                      <span>{meeting.participants.length} participants</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'progress' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Training Progress</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{scenario.title}</div>
                        <div className="text-xs text-gray-500">{scenario.section}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${scenario.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{scenario.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Progress */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Development</h3>
                <div className="space-y-4">
                  {['Story Writing', 'Team Collaboration', 'Event Facilitation', 'Backlog Management', 'Requirements Documentation'].map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{skill}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">75%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrumPracticeView;
