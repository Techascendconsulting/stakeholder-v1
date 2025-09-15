import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TrainingService } from '../../services/trainingService';
import { TrainingStage } from '../../types/training';
import { Project } from '../../types';
import { 
  GraduationCap, 
  Target, 
  FolderOpen, 
  ArrowRight, 
  Play,
  Pause,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  BookOpen,
  Zap,
  ArrowLeft,
  ChevronRight,
  Clock,
  Award,
  Search,
  Map,
  FileText,
  Users2,
  BarChart3
} from 'lucide-react';
import { mockProjects, mockStakeholders } from '../../data/mockData';
import ProjectCard from '../ProjectCard';

const TrainingHubView: React.FC<{ startingStep?: 'intro' | 'project-selection' | 'training-hub' }> = ({ startingStep = 'intro' }) => {
  const { setCurrentView, selectedProject: appSelectedProject, setSelectedProject: setAppSelectedProject } = useApp();
  const { onboardingData } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<'intro' | 'project-selection' | 'project-brief' | 'training-hub'>(startingStep);
  const [selectedStage, setSelectedStage] = useState<TrainingStage | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'meeting-prep' | 'practice' | 'feedback' | 'deliverables'>('learn');
  const [showLearnContent, setShowLearnContent] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const trainingService = TrainingService.getInstance();
  const [credits, setCredits] = useState<any>(null);

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const userCredits = await trainingService.getUserCredits('user-1');
        setCredits(userCredits);
      } catch (error) {
        console.error('Error loading credits:', error);
        setCredits({ practiceCredits: 10, assessCredits: 5 });
      }
    };
    loadCredits();
  }, []);

  // Restore state on page refresh
  useEffect(() => {
    const savedState = sessionStorage.getItem('trainingHubState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentStep(state.currentStep || 'intro');
        setSelectedStage(state.selectedStage || null);
        
        // Restore selected project properly
        if (state.selectedProject) {
          const project = mockProjects.find(p => p.id === state.selectedProject.id);
          setSelectedProject(project || null);
        }
        
        setActiveTab(state.activeTab || 'learn');
        setShowLearnContent(state.showLearnContent || false);
      } catch (error) {
        console.error('Error restoring training hub state:', error);
      }
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    const state = {
      currentStep,
      selectedStage,
      selectedProject,
      activeTab,
      showLearnContent
    };
    sessionStorage.setItem('trainingHubState', JSON.stringify(state));
  }, [currentStep, selectedStage, selectedProject, activeTab, showLearnContent]);

  // Sync with AppContext's selectedProject
  useEffect(() => {
    if (appSelectedProject && !selectedProject) {
      setSelectedProject(appSelectedProject);
    }
  }, [appSelectedProject, selectedProject]);

  // Cleanup sessionStorage when component unmounts (if not in active training)
  useEffect(() => {
    return () => {
      // Only clear if we're not in an active training session
      const trainingConfig = sessionStorage.getItem('trainingConfig');
      if (!trainingConfig) {
        sessionStorage.removeItem('trainingConfig');
        sessionStorage.removeItem('trainingStakeholders');
        sessionStorage.removeItem('trainingCurrentStep');
        sessionStorage.removeItem('trainingMessages');
        sessionStorage.removeItem('trainingMeetingTime');
        sessionStorage.removeItem('trainingMeetingActive');
      }
    };
  }, []);

  const stages: { id: TrainingStage; name: string; description: string; icon: any }[] = [
    {
      id: 'problem_exploration',
      name: 'Problem Exploration',
      description: 'Uncover pain points and root causes',
      icon: Target
    },
    {
      id: 'as_is',
      name: 'As-Is Process/Analysis',
      description: 'Understand current processes and systems',
      icon: BookOpen
    },
    {
      id: 'as_is_mapping',
      name: 'As-Is Process Map',
      description: 'Document current end-to-end flow to feed the backlog',
      icon: Map
    },
    {
      id: 'to_be',
      name: 'To-Be Process',
      description: 'Design future state solutions',
      icon: TrendingUp
    },
    {
      id: 'solution_design',
      name: 'Solution Design',
      description: 'Define technical requirements and implementation',
      icon: Zap
    }
  ];

  const handleStartLearning = () => {
    // Removed navigation to practice-hub-cards
    console.log('Start learning clicked');
  };

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    setAppSelectedProject(project); // Also update AppContext
    
    // Navigate to project brief
    setCurrentStep('project-brief');
  };

  const handleStartPractice = async () => {
    // Use AppContext's selectedProject as the source of truth
    const projectToUse = appSelectedProject || selectedProject;
    console.log('handleStartPractice called', { selectedStage, projectToUse });
    
    if (!selectedStage) {
      console.error('No stage selected');
      alert('Please select a training stage first');
      return;
    }
    
    if (!projectToUse) {
      console.error('No project selected');
      alert('Please select a project first');
      return;
    }
    
    // Special handling for as_is_mapping stage - redirect to deliverables
    if (selectedStage === 'as_is_mapping') {
      setCurrentView('training-deliverables');
      return;
    }
    
    try {
      console.log('Starting practice session...');
      const session = await trainingService.startSession(selectedStage, projectToUse.id, 'practice', []);
      console.log('Session created:', session);
      
      sessionStorage.setItem('trainingConfig', JSON.stringify({
        sessionId: session.id,
        stage: selectedStage,
        projectId: projectToUse.id
      }));
      
      console.log('Navigating to training-practice');
      setCurrentView('training-practice');
    } catch (error) {
      console.error('Error starting practice session:', error);
      alert('Failed to start practice session. Please try again.');
    }
  };

  const handleStartAssess = async () => {
    const projectToUse = appSelectedProject || selectedProject;
    if (selectedStage && projectToUse) {
      // Special handling for as_is_mapping stage - redirect to deliverables
      if (selectedStage === 'as_is_mapping') {
        setCurrentView('training-deliverables');
        return;
      }
      
      try {
        const session = await trainingService.startSession(selectedStage, projectToUse.id, 'assess', []);
        sessionStorage.setItem('trainingConfig', JSON.stringify({
          sessionId: session.id,
          stage: selectedStage,
          projectId: projectToUse.id
        }));
        setCurrentView('training-assess');
      } catch (error) {
        console.error('Error starting assess session:', error);
      }
    }
  };

  // Get meeting prep content based on selected stage
  const getMeetingPrepContent = (stageId: string) => {
    const content = {
      problem_exploration: {
        objective: "In this meeting, you're acting as a Business Analyst who wants to understand what's broken in the current process.",
        description: "Your stakeholder may describe frustrations, delays, inefficiencies, or unclear handoffs. Your job is to help them open up, dig deeper, and clarify what's really going wrong — without jumping to solutions.",
        successCriteria: [
          "What problems exist in the current process",
          "Where those problems show up (which stages, teams, systems)",
          "Who is impacted — and how",
          "What's already been tried (and whether it worked)",
          "What success might look like to this stakeholder"
        ],
        mustCoverAreas: [
          { area: "Pain Points", description: "\"What's frustrating or inefficient?\"" },
          { area: "Blockers", description: "\"What slows things down or causes delays?\"" },
          { area: "Handoffs", description: "\"Where do things fall apart between teams?\"" },
          { area: "Constraints", description: "\"What's limiting your ability to improve this?\"" },
          { area: "Customer Impact", description: "\"How do these problems affect customer experience?\"" }
        ],
        exampleQuestions: [
          "\"What would you say are the biggest pain points in the current process?\"",
          "\"Where do handoffs between teams usually go wrong?\"",
          "\"What have you or the team tried to fix this already?\"",
          "\"Is there anything outside your control that makes this harder?\"",
          "\"How do these issues affect the customer — or your team?\""
        ]
      },
      as_is: {
        objective: "In this meeting, you're acting as a Business Analyst who wants to understand the current processes and systems in detail.",
        description: "Your stakeholder will describe their current workflows, tools, and systems. Your job is to map out the existing landscape and identify gaps, inefficiencies, and opportunities for improvement.",
        successCriteria: [
          "What the current process looks like step by step",
          "Which systems and tools are currently being used",
          "Where inefficiencies and bottlenecks exist",
          "Who is involved in each step of the process",
          "What data and information flows through the system"
        ],
        mustCoverAreas: [
          { area: "Current Process", description: "\"Can you walk me through the current process?\"" },
          { area: "Pain Points", description: "\"What's frustrating or inefficient?\"" },
          { area: "Inefficiencies", description: "\"Where do things slow down or get stuck?\"" },
          { area: "Stakeholder Roles", description: "\"Who else is involved in this process?\"" },
          { area: "System Gaps", description: "\"What systems do you currently use?\"" }
        ],
        exampleQuestions: [
          "\"Can you walk me through the current process step by step?\"",
          "\"What systems do you currently use?\"",
          "\"Where do things typically break down?\"",
          "\"Who else is involved in this process?\"",
          "\"What data do you track or wish you could track?\""
        ]
      },
      as_is_mapping: {
        objective: "You've gathered stakeholder insights. Now it's time to map the current process visually to expose bottlenecks and feed your backlog.",
        description: "Your job is to create a clear, visual representation of the current process flow that stakeholders can validate and that will inform your improvement recommendations.",
        successCriteria: [
          "Start and finish triggers clearly defined",
          "All actors and systems mapped with swimlanes",
          "Normal path and key variations documented",
          "Inputs/outputs and business rules captured",
          "Pain points and current metrics annotated"
        ],
        mustCoverAreas: [
          { area: "Process Boundaries", description: "\"What triggers this process to start? What proves it's done?\"" },
          { area: "Actors & Systems", description: "\"Who does what, using which tools?\"" },
          { area: "Flow & Handoffs", description: "\"What's the normal path? Where do variations occur?\"" },
          { area: "Data & Rules", description: "\"What documents/data flow through? What rules apply?\"" },
          { area: "Pain Points", description: "\"Where does it slow down or fail? What are the current metrics?\"" }
        ],
        exampleQuestions: [
          "\"Can you walk me through one recent example from start to finish?\"",
          "\"What happens when this step can't be completed normally?\"",
          "\"Who else touches this before it moves to the next step?\"",
          "\"What information do you need to complete this step?\"",
          "\"How do you know when this step is done correctly?\""
        ]
      },
      to_be: {
        objective: "In this meeting, you're acting as a Business Analyst who wants to design future state solutions.",
        description: "Your stakeholder will share their vision for improvements. Your job is to help them articulate clear requirements, define success criteria, and plan the implementation approach.",
        successCriteria: [
          "What the ideal future state should look like",
          "What specific improvements would make the biggest difference",
          "How success will be measured and tracked",
          "What constraints and limitations need to be considered",
          "What the implementation plan and timeline should be"
        ],
        mustCoverAreas: [
          { area: "Future State", description: "\"What would an ideal process look like to you?\"" },
          { area: "Improvements", description: "\"What specific improvements would make the biggest difference?\"" },
          { area: "Requirements", description: "\"What capabilities do you need?\"" },
          { area: "Success Criteria", description: "\"How would you measure success for this improvement?\"" },
          { area: "Implementation Plan", description: "\"What would be the best way to implement these changes?\"" }
        ],
        exampleQuestions: [
          "\"What would an ideal process look like to you?\"",
          "\"What specific improvements would make the biggest difference?\"",
          "\"How would you measure success for this improvement?\"",
          "\"What limitations should we keep in mind?\"",
          "\"What would be the best way to implement these changes?\""
        ]
      },
      solution_design: {
        objective: "In this meeting, you're acting as a Business Analyst who wants to define technical requirements and implementation details.",
        description: "Your stakeholder will describe their technical needs and constraints. Your job is to gather detailed technical requirements, understand integration needs, and plan the implementation approach.",
        successCriteria: [
          "What technical capabilities and features are needed",
          "How the solution should integrate with existing systems",
          "What data models and architecture are required",
          "What integration points and APIs are needed",
          "What the deployment and rollout strategy should be"
        ],
        mustCoverAreas: [
          { area: "Technical Requirements", description: "\"What technical capabilities do you need?\"" },
          { area: "Architecture", description: "\"How should this be designed and structured?\"" },
          { area: "Data Models", description: "\"What data will this solution need to handle?\"" },
          { area: "Integration Points", description: "\"How should this integrate with your existing systems?\"" },
          { area: "Deployment Plan", description: "\"How should we roll this out to minimize disruption?\"" }
        ],
        exampleQuestions: [
          "\"What technical capabilities do you need?\"",
          "\"How should this integrate with your existing systems?\"",
          "\"What data will this solution need to handle?\"",
          "\"How should users interact with this solution?\"",
          "\"How should we roll this out to minimize disruption?\""
        ]
      }
    };
    
    return content[stageId as keyof typeof content] || content.problem_exploration;
  };

  const handleBack = () => {
    if (currentStep === 'project-selection') {
      // Removed navigation to project-workspace
      setCurrentStep('intro');
    } else if (currentStep === 'training-hub') {
      setCurrentStep('project-selection');
    } else {
      // Clear training session data when going back to dashboard
      sessionStorage.removeItem('trainingConfig');
      sessionStorage.removeItem('trainingStakeholders');
      sessionStorage.removeItem('trainingCurrentStep');
      sessionStorage.removeItem('trainingMessages');
      sessionStorage.removeItem('trainingMeetingTime');
      sessionStorage.removeItem('trainingMeetingActive');
      // Removed navigation to practice
      console.log('Back to practice');
    }
  };

  // Introduction Page
  const renderIntroduction = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                // Removed navigation to practice
                console.log('Back to practice clicked');
              }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Practice Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step Into Practice - Where theory becomes lived experience
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Target className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Step Into Practice
          </h2>
          <div className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed space-y-4">
            <p>
              You've spent time learning the theory. Now it's time to bring it all together and experience what it feels like to work as a Business Analyst on a real project.
            </p>
            <p>
              At the heart of this role is one skill above all others: <strong>asking the right questions</strong>. The ability to lead conversations, uncover problems, and guide stakeholders toward clarity is what separates an average BA from a great one.
            </p>
            <p>
              That's exactly what you'll practice here. You'll engage with realistic AI stakeholders who think and respond like real business people — sometimes clear, sometimes vague, sometimes challenging. Just like in real life.
            </p>
            <p>
              But you won't be thrown in without support. You'll follow a guided journey: first, choose a project to work on. Then learn proven questioning patterns. Next, practice those conversations live with coaching along the way. Finally, assess your progress with feedback that shows you exactly where you're growing and what to improve next.
            </p>
            <p>
              Every step builds your confidence. Every conversation sharpens your skills. And over time, you'll see measurable progress — from your first hesitant questions to confident dialogue that feels natural and effective.
            </p>
            <p className="text-purple-600 dark:text-purple-400 font-semibold">
              This is where theory turns into lived experience. This is where you practice being the BA you want to become.
            </p>
            
            {/* Start Your Learning Journey Button */}
            <div className="mt-8">
              <button
                onClick={() => {
                  // Removed navigation to practice-hub-cards
                  console.log('Start learning button clicked');
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Your Learning Journey
              </button>
            </div>
          </div>
        </div>

        {/* Practice Hub Cards */}
        <div className="space-y-6 mb-16">
          {/* Card 1: Stakeholder Conversations */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Scenarios</span>
                </div>
                <div className="relative z-10">
                  <Users className="w-12 h-12 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Real Stakeholder Conversations
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  Practice with realistic AI stakeholders who respond like real business people. Learn to navigate complex organizational dynamics and build confidence in your questioning skills.
                </p>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Interactive • 15-30 min sessions • Real-time feedback
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Guided Learning Journey */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Scenarios</span>
                </div>
                <div className="relative z-10">
                  <Lightbulb className="w-12 h-12 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Guided Learning Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  Follow a structured approach: Learn proven questioning patterns, practice with live coaching, and assess your skills. Build confidence step by step with expert guidance.
                </p>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Step-by-step • Expert coaching • Skill assessments
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Progress Tracking */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Scenarios</span>
                </div>
                <div className="relative z-10">
                  <TrendingUp className="w-12 h-12 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <Award className="w-3 h-3 text-purple-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Measurable Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  Track your improvement with detailed feedback and progress metrics. See exactly where you're growing and what to focus on next with comprehensive analytics.
                </p>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Analytics • Detailed feedback • Progress tracking
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-8 shadow-lg mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Learning Path</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Project</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a realistic business scenario to practice with
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Learn Patterns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Study proven question frameworks and conversation techniques
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Practice Live</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conduct meetings with real-time coaching and feedback
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Assess Skills</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test your abilities and receive detailed performance analysis
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform Your BA Skills?</h3>
            <p className="text-green-100 mb-8">
              Join hundreds of Business Analysts who have improved their stakeholder 
              conversation skills through our proven training methodology.
            </p>
            <button
              onClick={handleStartLearning}
              className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3 mx-auto"
            >
              <span>Start Your Learning Journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Project Selection Page
  const renderProjectSelection = () => {
    // Define project variants, acronyms, and character images
    const projectVariants = [
      { variant: "purple" as const, acronym: "COP", characterImage: "/onboarding-character.png" },
      { variant: "green" as const, acronym: "DEM", characterImage: "/expense-character.png" },
      { variant: "orange" as const, acronym: "MIM", characterImage: "/inventory-character.png" },
      { variant: "blue" as const, acronym: "CSM", characterImage: "/images/support-character.png" },
      { variant: "red" as const, acronym: "EPM", characterImage: "/images/performance-character.png" }
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={() => setCurrentView('practice-2')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm mr-4"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Select Your Project
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose a project to begin optimizing your business processes and drive meaningful results.
            </p>
          </header>

          {/* Project Grid */}
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProjects.map((project, index) => {
              const projectConfig = projectVariants[index] || { variant: "purple" as const, acronym: "PRO", characterImage: "/onboarding-character.png" };
              
              return (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.name}
                  description={project.description}
                  characterImage={projectConfig.characterImage}
                  variant={projectConfig.variant}
                  acronym={projectConfig.acronym}
                  onClick={() => handleProjectSelect(project)}
                />
              );
            })}
          </main>
        </div>
      </div>
    );
  };

  // Project Brief Page
  const renderProjectBrief = () => {
    if (!selectedProject) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No project selected. Please go back to select a project.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
        {/* Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentStep('project-selection')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Project Brief
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedProject.name} • Understanding the context
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setCurrentStep('training-hub');
                  sessionStorage.setItem('fromProjectBrief', 'true');
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
              >
                <Target className="w-4 h-4 mr-2" />
                Select Elicitation Stage
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Context</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {(selectedProject as any).businessContext || selectedProject.description}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Problem Statement</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {(selectedProject as any).problemStatement || "The current process has inefficiencies that need to be addressed through stakeholder engagement and process improvement."}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current As-Is Process</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {(selectedProject as any).asIsProcess || "Current process involves multiple handoffs and lacks clear documentation, leading to delays and confusion."}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Goals</h2>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {(selectedProject as any).businessGoals?.map((goal: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{goal}</span>
                    </li>
                  )) || (
                    <>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Streamline the process and reduce handoff times</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Improve stakeholder satisfaction</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Key Stakeholders
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {selectedProject.relevantStakeholders?.map(stakeholderId => {
                    const stakeholder = mockStakeholders.find(s => s.id === stakeholderId);
                    return (
                      <li key={stakeholderId} className="flex items-start space-x-3">
                        <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {stakeholder?.name || `Stakeholder ${stakeholderId}`}
                          </span>
                          {stakeholder?.role && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {stakeholder.role}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Ready to Start?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Now that you understand the project context, you can begin your elicitation practice using the button above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Training Hub (Single Page Layout)
  const renderTrainingHub = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Practice
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedProject?.name} • Apply your knowledge in real scenarios
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('training-deliverables')}
              className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-200"
            >
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Practice Deliverables
              </span>
            </button>
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Credits: {credits?.practiceCredits} Practice • {credits?.assessCredits} Assess
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stage Selection Cards */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Practice Focus
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Select which aspect of stakeholder conversations you'd like to practice. Each stage focuses on different skills and scenarios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stages.map((stage, index) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`p-8 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  selectedStage === stage.id
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl transform scale-105'
                    : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`p-3 rounded-xl ${
                    selectedStage === stage.id
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <stage.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-bold mb-2 ${
                      selectedStage === stage.id ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {stage.name}
                    </div>
                    <div className={`text-sm font-medium mb-3 ${
                      selectedStage === stage.id ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      Step {index + 1} of {stages.length}
                    </div>
                  </div>
                </div>
                <p className={`text-base leading-relaxed ${
                  selectedStage === stage.id ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stage.description}
                </p>
                {selectedStage === stage.id && (
                  <div className="mt-4 flex items-center space-x-2 text-blue-100">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Selected - Ready to practice!</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {selectedStage && (
            <div className="mt-8 text-center">
              <button
                onClick={handleStartPractice}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3 mx-auto"
              >
                <span>Start Practicing {stages.find(s => s.id === selectedStage)?.name}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Training Content */}
        {selectedStage && (
          <div className="space-y-8">
            {/* Stage Header */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stages.find(s => s.id === selectedStage)?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stages.find(s => s.id === selectedStage)?.description}
                  </p>
                </div>
                                 <button
                   onClick={() => setSelectedStage(null)}
                   className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                 >
                   <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
              </div>

              {/* Simple Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setActiveTab('learn')}
                  className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <BookOpen className="w-5 h-5" />
                    <span>Learn About This Stage</span>
                  </div>
                </button>
                <button
                  onClick={handleStartPractice}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Play className="w-5 h-5" />
                    <span>Start Practicing Now</span>
                  </div>
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => {
                    if (activeTab === 'meeting-prep') setActiveTab('learn');
                    else if (activeTab === 'practice') setActiveTab('meeting-prep');
                    else if (activeTab === 'feedback') setActiveTab('practice');
                    else if (activeTab === 'deliverables') setActiveTab('feedback');
                  }}
                  disabled={activeTab === 'learn'}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'learn'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    if (activeTab === 'learn') setActiveTab('meeting-prep');
                    else if (activeTab === 'meeting-prep') setActiveTab('practice');
                    else if (activeTab === 'practice') setActiveTab('feedback');
                    else if (activeTab === 'feedback') setActiveTab('deliverables');
                  }}
                  disabled={activeTab === 'deliverables'}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'feedback'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              {activeTab === 'learn' && (
                <div className="space-y-6">
                  {!showLearnContent ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Ready to Learn?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Study the patterns and techniques for this stage before practicing with stakeholders.
                      </p>
                      <button 
                        onClick={() => setShowLearnContent(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>View Learning Materials</span>
                      </button>
                    </div>
                  ) : (
                    <LearnContentDisplay stage={selectedStage} onBack={() => setShowLearnContent(false)} />
                  )}
                </div>
              )}

              {activeTab === 'meeting-prep' && (
                <div className="max-w-4xl mx-auto py-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Meeting Prep: {stages.find(s => s.id === selectedStage)?.name || 'Training Stage'}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                      "{stages.find(s => s.id === selectedStage)?.description || 'Your goal is to conduct an effective meeting.'}"
                    </p>
                  </div>

                  {/* Objective Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200/30 dark:border-orange-700/30 mb-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      <span>Objective of This Meeting</span>
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {selectedStage === 'problem_exploration' && "In this meeting, you're acting as a Business Analyst who wants to understand what's broken in the current process."}
                      {selectedStage === 'as_is' && "In this meeting, you're acting as a Business Analyst who wants to understand the current processes and systems in detail."}
                      {selectedStage === 'to_be' && "In this meeting, you're acting as a Business Analyst who wants to design future state solutions."}
                      {selectedStage === 'solution_design' && "In this meeting, you're acting as a Business Analyst who wants to define technical requirements and implementation details."}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedStage === 'problem_exploration' && "Your stakeholder may describe frustrations, delays, inefficiencies, or unclear handoffs. Your job is to help them open up, dig deeper, and clarify what's really going wrong — without jumping to solutions."}
                      {selectedStage === 'as_is' && "Your stakeholder will describe their current workflows, tools, and systems. Your job is to map out the existing landscape and identify gaps, inefficiencies, and opportunities for improvement."}
                      {selectedStage === 'to_be' && "Your stakeholder will share their vision for improvements. Your job is to help them articulate clear requirements, define success criteria, and plan the implementation approach."}
                      {selectedStage === 'solution_design' && "Your stakeholder will describe their technical needs and constraints. Your job is to gather detailed technical requirements, understand integration needs, and plan the implementation approach."}
                    </p>
                  </div>

                  {/* Success Criteria */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/30 dark:border-green-700/30 mb-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>By the End of This Meeting, You Should Know:</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-semibold text-xs">1</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">What problems exist in the current onboarding process</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-semibold text-xs">2</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Where those problems show up (which stages, teams, systems)</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-semibold text-xs">3</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Who is impacted — and how</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-semibold text-xs">4</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">What's already been tried (and whether it worked)</p>
                      </div>
                      <div className="flex items-start space-x-3 md:col-span-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-semibold text-xs">5</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">What success might look like to this stakeholder</p>
                      </div>
                    </div>
                  </div>

                  {/* Must-Cover Areas */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/30 dark:border-blue-700/30 mb-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Search className="w-5 h-5 text-blue-600" />
                      <span>Must-Cover Areas</span>
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      To pass this stage, try to ask questions that explore these 5 critical topics:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Area</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">What to Explore</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Pain Points</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">"What's frustrating or inefficient?"</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Blockers</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">"What slows things down or causes delays?"</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Handoffs</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">"Where do things fall apart between teams?"</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Constraints</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">"What's limiting your ability to improve this?"</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Customer Impact</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">"How do these problems affect customer experience?"</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 italic">
                      You don't need to ask in this exact order — but these are key ingredients to a successful meeting.
                    </p>
                  </div>

                  {/* Example Questions */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/30 dark:border-purple-700/30 mb-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <span>Example Questions You Might Ask</span>
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Here are some good starting points. Use your own words if you like — but stay curious, and ask follow-ups.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">"What would you say are the biggest pain points in the current onboarding journey?"</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">"Where do handoffs between teams usually go wrong?"</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">"What have you or the team tried to fix this already?"</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">"Is there anything outside your control that makes this harder?"</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">"How do these issues affect the customer — or your team?"</p>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/30 dark:border-yellow-700/30 mb-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span>Tips Before You Begin</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Ask open-ended questions — avoid yes/no questions</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Don't suggest solutions — your job is to understand, not fix</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Dig deeper — use phrases like "Tell me more about that" or "What happened next?"</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Avoid assumptions — let the stakeholder explain in their own words</p>
                      </div>
                    </div>
                  </div>

                  {/* Time & Credit Reminder */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30 mb-8">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <span>Time & Credit Reminder</span>
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p>• You'll have up to 20 turns in this meeting</p>
                      <p>• You can use nudges or hints if stuck</p>
                      <p>• You'll get detailed feedback after the meeting — including what you missed</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>8-12 minutes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>With coaching</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="w-4 h-4" />
                        <span>{credits?.practiceCredits || 0} credits left</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        You'll be scored on how well you explore the problem — not how quickly you get to the solution.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleStartPractice}
                      disabled={!credits || credits.practiceCredits <= 0}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Meeting</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Practice Session
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Conduct a practice meeting with coaching and real-time feedback to improve your skills.
                  </p>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>8-12 minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>With coaching</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>{credits?.practiceCredits || 0} credits left</span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartPractice}
                    disabled={!credits || credits.practiceCredits <= 0 || !selectedStage || !selectedProject}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Practice Session</span>
                  </button>
                  {(!selectedStage || !selectedProject) && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Please select a stage and project first
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Performance Feedback
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Review your meeting performance and get detailed feedback for improvement.
                  </p>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>8-12 minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4" />
                      <span>Pass/Fail scoring</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>{credits?.assessCredits || 0} credits left</span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartAssess}
                    disabled={!credits || credits.assessCredits <= 0}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Target className="w-4 h-4" />
                    <span>Start Assessment</span>
                  </button>
                </div>
              )}

              {activeTab === 'deliverables' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Training Deliverables
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Create and manage your portfolio of BA work from training sessions.
                  </p>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Map className="w-4 h-4" />
                      <span>Process Maps</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>Meeting Notes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>User Stories</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setCurrentView('training-deliverables')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Training Deliverables</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('project-deliverables')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Map className="w-4 h-4" />
                      <span>Project Deliverables</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render based on current step
  if (currentStep === 'intro') {
    return renderIntroduction();
  } else if (currentStep === 'project-selection') {
    return renderProjectSelection();
  } else if (currentStep === 'project-brief') {
    return renderProjectBrief();
  } else {
    return renderTrainingHub();
  }
};

// Learn Content Display Component
const LearnContentDisplay: React.FC<{ stage: TrainingStage | null; onBack: () => void }> = ({ stage, onBack }) => {
  const trainingService = TrainingService.getInstance();
  const content = stage ? trainingService.getLearnContent(stage) : null;

  if (!content) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No learning content available for this stage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {content.objective}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Master the essential skills for conducting effective {content.stageId.replace('_', ' ')} meetings.
          </p>
        </div>
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Must-Cover Areas */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
          <Target className="w-5 h-5 text-blue-600" />
          <span>5 Must-Cover Areas</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.mustCovers?.map((area, index) => (
            <div key={`${area.area}-${index}`} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <h5 className="font-semibold text-gray-900 dark:text-white">{area.area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Focus on: {area.keywords.join(', ')}</p>
            </div>
          )) || []}
        </div>
      </div>

      {/* Model Q&A Examples */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <span>Model Q&A Examples</span>
        </h4>
        <div className="space-y-4">
          {content.modelQAs?.map((qa, index) => (
            <div key={`qa-${index}`} className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 border border-gray-200/50 dark:border-gray-600/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    Example
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Q:</span> {qa.question}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200/50 dark:border-green-700/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-600 dark:text-green-400 font-semibold">A:</span> {qa.answer}
                  </p>
                </div>
              </div>
            </div>
          )) || []}
        </div>
      </div>

      {/* Micro-Drills */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
          <Target className="w-5 h-5 text-green-600" />
          <span>Interactive Micro-Drills</span>
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Practice these quick exercises to improve your questioning skills. Click on your answer to see the explanation.
        </p>
        <div className="space-y-6">
          {content.microDrills?.map((drill, drillIndex) => (
            <MicroDrillCard key={`drill-${drillIndex}`} drill={drill} drillIndex={drillIndex} />
          )) || []}
        </div>
      </div>

      {/* Cheat Cards */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-purple-600" />
          <span>Cheat Cards</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.cheatCards?.map((card, index) => (
            <div key={`card-${index}`} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    Tip
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-900 dark:text-white italic">"{card.content}"</p>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  );
};

// Interactive Micro-Drill Card Component
const MicroDrillCard: React.FC<{ drill: any; drillIndex: number }> = ({ drill, drillIndex }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Safety check for drill data
  if (!drill || !drill.prompt) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-700/50 rounded-lg p-6">
        <p className="text-sm text-red-600 dark:text-red-400">Drill data unavailable</p>
      </div>
    );
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
  };

  const resetDrill = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
            {drill.type?.replace('_', ' ') || 'Drill'}
          </span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Drill #{drillIndex + 1}</span>
      </div>
      
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">{drill.prompt || 'No prompt available'}</p>
      
      {drill.choices && drill.choices.length > 0 && !showAnswer && (
        <div className="space-y-3 mb-4">
          {drill.choices.map((choice: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(choice)}
              className="w-full p-3 text-left bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{choice}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showAnswer && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${selectedAnswer === drill.answer ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedAnswer === drill.answer ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
              Answer: {drill.answer || 'No answer available'}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">{drill.explanation || 'No explanation available'}</p>
          </div>
          
          <button
            onClick={resetDrill}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainingHubView;
