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
  Search
} from 'lucide-react';
import { mockProjects } from '../../data/mockData';

const TrainingHubView: React.FC = () => {
  const { setCurrentView, selectedProject: appSelectedProject, setSelectedProject: setAppSelectedProject } = useApp();
  const { onboardingData } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<'intro' | 'project-selection' | 'training-hub'>('intro');
  const [selectedStage, setSelectedStage] = useState<TrainingStage | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'meeting-prep' | 'practice' | 'feedback'>('learn');
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
    setCurrentStep('project-selection');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setAppSelectedProject(project); // Also update AppContext
    setCurrentStep('training-hub');
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
      setCurrentView('dashboard');
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
              onClick={() => setCurrentView('dashboard')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Training Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Master stakeholder conversations through guided practice
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {onboardingData?.experience_level === 'new' 
              ? 'Practice Stakeholder Conversations' 
              : 'Asking the Right Questions as a Business Analyst'
            }
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {onboardingData?.experience_level === 'new' 
              ? 'Ready to put your BA knowledge into action? Practice the most critical skill: conducting meaningful conversations with business stakeholders to drive real change.'
              : 'Now that you understand the theory, it\'s time to practice the most critical skill: conducting meaningful conversations with business stakeholders to drive real change.'
            }
          </p>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Real Stakeholder Conversations</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {onboardingData?.experience_level === 'new' 
                ? 'Practice with realistic AI stakeholders who respond like real business people. Apply what you\'ve learned in a safe environment.'
                : 'Practice with realistic AI stakeholders who respond like real business people, not robots. Learn to navigate complex organizational dynamics.'
              }
            </p>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Guided Learning Journey</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {onboardingData?.experience_level === 'new' 
                ? 'Follow a structured approach: Learn the patterns, Practice with coaching, and Assess your skills. Perfect for applying your BA fundamentals.'
                : 'Follow a structured approach: Learn the patterns, Practice with coaching, and Assess your skills. Build confidence step by step.'
              }
            </p>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Measurable Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your improvement with detailed feedback, scoring, and personalized 
              recommendations. Know exactly what to focus on next.
            </p>
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
  const renderProjectSelection = () => (
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
                Choose Your Project
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select a realistic business scenario to practice with
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Which Business Challenge Would You Like to Tackle?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Each project represents a real-world scenario you'll encounter as a Business Analyst. 
            Choose the one that interests you most or aligns with your career goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockProjects.map((project, index) => {
            const gradients = [
              'from-blue-500 via-purple-500 to-pink-500',
              'from-green-500 via-emerald-500 to-teal-500',
              'from-orange-500 via-red-500 to-pink-500',
              'from-purple-500 via-indigo-500 to-blue-500',
              'from-yellow-500 via-orange-500 to-red-500'
            ];
            const currentGradient = gradients[index % gradients.length];
            
            return (
              <div
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group overflow-hidden"
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Number Badge */}
                <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${currentGradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${currentGradient} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-4`}>
                      {project.name.split(' ').map(word => word[0]).join('').slice(0, 3)}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 mb-3">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-xl border border-gray-100 dark:border-gray-600/30">
                      <div className={`w-8 h-8 bg-gradient-to-r ${currentGradient} rounded-lg flex items-center justify-center`}>
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {project.relevantStakeholders?.length || 0} stakeholders
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Available for meetings</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700/50 dark:to-purple-900/20 rounded-xl border border-gray-100 dark:border-gray-600/30">
                      <div className={`w-8 h-8 bg-gradient-to-r ${currentGradient} rounded-lg flex items-center justify-center`}>
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">4 training stages</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Complete learning path</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-xl border border-gray-100 dark:border-gray-600/30 group-hover:from-blue-50 group-hover:to-purple-50 dark:group-hover:from-blue-900/30 dark:group-hover:to-purple-900/30 transition-all duration-300">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Select Project
                    </span>
                    <div className={`w-8 h-8 bg-gradient-to-r ${currentGradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${currentGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

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
                Training Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedProject?.name} • Master stakeholder conversations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <span>Select Training Stage</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`p-6 rounded-xl text-left transition-all duration-200 hover:shadow-lg ${
                  selectedStage === stage.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                    : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedStage === stage.id
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <div className={`font-semibold ${
                    selectedStage === stage.id ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {stage.name}
                  </div>
                </div>
                <p className={`text-sm ${
                  selectedStage === stage.id ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stage.description}
                </p>
              </button>
            ))}
          </div>
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

              {/* Progress Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Step {activeTab === 'learn' ? 1 : activeTab === 'meeting-prep' ? 2 : activeTab === 'practice' ? 3 : 4} of 4
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {activeTab === 'learn' ? 'LEARN' : activeTab === 'meeting-prep' ? 'MEETING PREP' : activeTab === 'practice' ? 'PRACTICE' : 'FEEDBACK'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(activeTab === 'learn' ? 1 : activeTab === 'meeting-prep' ? 2 : activeTab === 'practice' ? 3 : 4) / 4 * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('learn')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === 'learn'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>LEARN</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('meeting-prep')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === 'meeting-prep'
                      ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>MEETING PREP</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === 'practice'
                      ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>PRACTICE</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                    activeTab === 'feedback'
                      ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>FEEDBACK</span>
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
                  }}
                  disabled={activeTab === 'feedback'}
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
                      <p>• You'll have up to 15 turns in this meeting</p>
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
