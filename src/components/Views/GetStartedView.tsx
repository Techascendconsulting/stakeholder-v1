import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Target, 
  BookOpen, 
  Workflow,
  Zap,
  Building2,
  Users,
  GraduationCap,
  Play,
  FileText,
  Settings
} from 'lucide-react';
import { useOnboarding, OnboardingExperienceLevel, OnboardingIntent } from '../../contexts/OnboardingContext';
import { useApp } from '../../contexts/AppContext';

const GetStartedView: React.FC = () => {
  const {
    currentStep,
    experienceLevel,
    setExperienceLevel,
    intent,
    setIntent,
    isLoading,
    isSaving,
    onboardingData,
    nextStep,
    previousStep,
    canProceedToNext,
    saveOnboardingData,
    completeOnboarding,
    resetOnboarding
  } = useOnboarding();

  const { setCurrentView } = useApp();

  // Force light theme for onboarding
  useEffect(() => {
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains('dark');
    root.classList.remove('dark');
    
    return () => {
      if (hadDarkClass) {
        root.classList.add('dark');
      }
    };
  }, []);

  // Check if onboarding is already completed and show reset option
  useEffect(() => {
    if (!isLoading && onboardingData?.onboarding_stage === 'completed') {
      console.log('🎯 Onboarding: Already completed, showing reset option');
      // Don't auto-redirect, let user choose to reset
    }
  }, [isLoading, onboardingData]);

  // Show loading while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your onboarding status...</p>
        </div>
      </div>
    );
  }

  // If onboarding is completed, show reset option
  if (onboardingData?.onboarding_stage && onboardingData.onboarding_stage === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Onboarding Already Completed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've already completed the onboarding process. Would you like to reset and start over?
            </p>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  await resetOnboarding();
                  setCurrentView('dashboard');
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Reset Onboarding
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleContinue = async () => {
    if (currentStep < 4) {
      await saveOnboardingData();
      nextStep();
    } else {
      // Final step - complete onboarding and redirect
      console.log('🎯 Onboarding: Completing onboarding with experience level:', experienceLevel, 'intent:', intent);
      await completeOnboarding();
      redirectToDestination();
    }
  };

  const redirectToDestination = () => {
    if (!experienceLevel || !intent) return;

    // Determine destination based on user choices
    let destination: string;
    
    switch (experienceLevel) {
      case 'new':
        destination = 'core-concepts';
        break;
      case 'trained_but_no_job':
        destination = 'training-hub';
        break;
      case 'trained_want_practice':
        destination = 'training-hub';
        break;
      case 'starting_project':
        destination = 'project-workspace';
        break;
      case 'working_ba':
        destination = 'create-project';
        break;
      default:
        destination = 'dashboard';
    }

    console.log('🎯 Onboarding: Redirecting to', destination, 'for experience level:', experienceLevel);
    setCurrentView(destination as any);
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <ExperienceStep />;
      case 3:
        return <IntentStep />;
      case 4:
        return <SummaryStep />;
      default:
        return <WelcomeStep />;
    }
  };

  const WelcomeStep: React.FC = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to BA WorkXP™ 👋
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Let's get you started based on your current experience and goals.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What to expect:</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">Quick consultation to understand your journey</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">Personalized recommendations for your next steps</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">Direct path to the most relevant content</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ExperienceStep: React.FC = () => {
    const options = [
      {
        value: 'new' as OnboardingExperienceLevel,
        title: "I'm completely new and want to learn from scratch.",
        description: "You're starting your BA journey and need foundational knowledge.",
        icon: <GraduationCap className="w-6 h-6" />,
        color: "from-blue-500 to-cyan-600"
      },
      {
        value: 'trained_but_no_job' as OnboardingExperienceLevel,
        title: "I've trained before but need help practicing with real tasks.",
        description: "You have the theory but need hands-on experience to build confidence.",
        icon: <Target className="w-6 h-6" />,
        color: "from-emerald-500 to-teal-600"
      },
      {
        value: 'trained_want_practice' as OnboardingExperienceLevel,
        title: "I've trained before and want structured practice scenarios.",
        description: "You want guided practice through structured learning modules and exercises.",
        icon: <Users className="w-6 h-6" />,
        color: "from-indigo-500 to-blue-600"
      },
      {
        value: 'starting_project' as OnboardingExperienceLevel,
        title: "I want to work on a project and apply what I've learned.",
        description: "You're ready to dive into real project work and build deliverables.",
        icon: <Workflow className="w-6 h-6" />,
        color: "from-orange-500 to-red-600"
      },
      {
        value: 'working_ba' as OnboardingExperienceLevel,
        title: "I'm already a BA, but I need help with my own project.",
        description: "You're experienced and need support for a specific project or challenge.",
        icon: <Building2 className="w-6 h-6" />,
        color: "from-blue-500 to-indigo-600"
      }
    ];

    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Where are you right now in your journey?
          </h2>
          <p className="text-lg text-gray-600">
            This helps us guide you to the most relevant starting point.
          </p>
        </div>

        <div className="space-y-4">
          {options.map((option) => (
            <div
              key={option.value}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                experienceLevel === option.value
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setExperienceLevel(option.value)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} text-white flex-shrink-0`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600">
                    {option.description}
                  </p>
                </div>
                {experienceLevel === option.value && (
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const IntentStep: React.FC = () => {
    const getIntentOptions = () => {
      switch (experienceLevel) {
        case 'new':
          return [
            {
              value: 'learn_basics' as OnboardingIntent,
              title: "Start with training modules",
              description: "Begin with structured learning modules covering BA fundamentals.",
              icon: <BookOpen className="w-6 h-6" />,
              color: "from-blue-500 to-cyan-600"
            },
            {
              value: 'learn_basics' as OnboardingIntent,
              title: "Watch a beginner orientation video",
              description: "Get an overview of the platform and BA role before diving in.",
              icon: <Play className="w-6 h-6" />,
              color: "from-green-500 to-emerald-600"
            },
            {
              value: 'learn_basics' as OnboardingIntent,
              title: "Understand how projects work",
              description: "Learn about the project structure and what you'll be building.",
              icon: <Workflow className="w-6 h-6" />,
              color: "from-blue-500 to-indigo-600"
            }
          ];
        case 'trained_but_no_job':
          return [
            {
              value: 'practice_skills' as OnboardingIntent,
              title: "Practice a real project from scratch",
              description: "Work through a complete project to build your portfolio.",
              icon: <Target className="w-6 h-6" />,
              color: "from-orange-500 to-red-600"
            },
            {
              value: 'practice_skills' as OnboardingIntent,
              title: "Chat with stakeholders and build requirements",
              description: "Practice stakeholder interviews and requirements gathering.",
              icon: <Users className="w-6 h-6" />,
              color: "from-blue-500 to-cyan-600"
            },
            {
              value: 'practice_skills' as OnboardingIntent,
              title: "Learn Agile ceremonies by doing them",
              description: "Participate in simulated Agile ceremonies and meetings.",
              icon: <Zap className="w-6 h-6" />,
              color: "from-green-500 to-emerald-600"
            }
          ];
        case 'trained_want_practice':
          return [
            {
              value: 'practice_skills' as OnboardingIntent,
              title: "Practice asking stakeholders the right questions",
              description: "Work through structured question frameworks for each project stage.",
              icon: <GraduationCap className="w-6 h-6" />,
              color: "from-indigo-500 to-blue-600"
            },
            {
              value: 'practice_skills' as OnboardingIntent,
              title: "Participate in simulated workshops",
              description: "Join guided workshops and interactive learning sessions.",
              icon: <Users className="w-6 h-6" />,
              color: "from-blue-500 to-cyan-600"
            },
            {
              value: 'practice_skills' as OnboardingIntent,
              title: "Complete training exercises and assessments",
              description: "Practice with structured exercises and knowledge checks.",
              icon: <FileText className="w-6 h-6" />,
              color: "from-green-500 to-emerald-600"
            }
          ];
        case 'starting_project':
          return [
            {
              value: 'start_real_project' as OnboardingIntent,
              title: "Create a new project from my idea",
              description: "Start building a project based on your own concept or idea.",
              icon: <Workflow className="w-6 h-6" />,
              color: "from-blue-500 to-indigo-600"
            },
            {
              value: 'start_real_project' as OnboardingIntent,
              title: "Generate requirements from my notes",
              description: "Transform your existing notes into structured requirements.",
              icon: <FileText className="w-6 h-6" />,
              color: "from-blue-500 to-cyan-600"
            },
            {
              value: 'start_real_project' as OnboardingIntent,
              title: "Get help understanding what's needed",
              description: "Get guidance on what deliverables and steps are required.",
              icon: <Target className="w-6 h-6" />,
              color: "from-orange-500 to-red-600"
            }
          ];
        case 'working_ba':
          return [
            {
              value: 'get_project_help' as OnboardingIntent,
              title: "Create a new project from my idea",
              description: "Start a new project to solve a specific business problem.",
              icon: <Workflow className="w-6 h-6" />,
              color: "from-blue-500 to-indigo-600"
            },
            {
              value: 'get_project_help' as OnboardingIntent,
              title: "Generate requirements from my notes",
              description: "Convert your existing project notes into structured requirements.",
              icon: <FileText className="w-6 h-6" />,
              color: "from-blue-500 to-cyan-600"
            },
            {
              value: 'get_project_help' as OnboardingIntent,
              title: "Get help understanding what's needed",
              description: "Get expert guidance on project scope and deliverables.",
              icon: <Target className="w-6 h-6" />,
              color: "from-orange-500 to-red-600"
            }
          ];
        default:
          return [];
      }
    };

    const options = getIntentOptions();

    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What do you want to start with today?
          </h2>
          <p className="text-lg text-gray-600">
            Based on your experience level, here are the best options for you.
          </p>
        </div>

        <div className="space-y-4">
          {options.map((option, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                intent === option.value
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setIntent(option.value)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} text-white flex-shrink-0`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600">
                    {option.description}
                  </p>
                </div>
                {intent === option.value && (
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SummaryStep: React.FC = () => {
    const getJourneyData = () => {
      if (!experienceLevel) return null;
      
      switch (experienceLevel) {
        case 'new':
          return {
            title: "Your Learning Foundation",
            subtitle: "Let's build your BA knowledge from the ground up",
            icon: <GraduationCap className="w-8 h-8" />,
            color: "from-blue-500 to-cyan-600",
            gradient: "from-blue-50 to-cyan-50",
            destination: "BA Essentials",
            destinationDescription: "Start with core concepts and mindset",
            nextSteps: [
              "Learn what it means to be a Business Analyst",
              "Understand organizational structures and stakeholders",
              "Master fundamental BA techniques and approaches",
              "Build confidence in your analytical thinking"
            ],
            estimatedTime: "2-3 hours",
            confidence: "You'll feel ready to tackle your first BA concepts"
          };
        case 'trained_but_no_job':
          return {
            title: "Your Practice Journey",
            subtitle: "Time to apply your knowledge in real scenarios",
            icon: <Target className="w-8 h-8" />,
            color: "from-emerald-500 to-teal-600",
            gradient: "from-emerald-50 to-teal-50",
            destination: "Practice Lab",
            destinationDescription: "Hands-on projects and stakeholder interactions",
            nextSteps: [
              "Practice with realistic stakeholder scenarios",
              "Build requirements through guided exercises",
              "Participate in simulated Agile ceremonies",
              "Create portfolio-worthy deliverables"
            ],
            estimatedTime: "4-6 hours",
            confidence: "You'll feel confident applying BA skills in interviews"
          };
        case 'trained_want_practice':
          return {
            title: "Your Structured Practice",
            subtitle: "Reinforce your knowledge with guided exercises",
            icon: <Users className="w-8 h-8" />,
            color: "from-indigo-500 to-blue-600",
            gradient: "from-indigo-50 to-blue-50",
            destination: "Practice Lab",
            destinationDescription: "Structured questioning and guided learning",
            nextSteps: [
              "Master stakeholder questioning frameworks",
              "Practice structured interview techniques",
              "Complete guided assessment exercises",
              "Build confidence in your communication skills"
            ],
            estimatedTime: "3-5 hours",
            confidence: "You'll feel confident in stakeholder interactions"
          };
        case 'starting_project':
          return {
            title: "Your Project Launch",
            subtitle: "Ready to dive into real project work",
            icon: <Workflow className="w-8 h-8" />,
            color: "from-orange-500 to-red-600",
            gradient: "from-orange-50 to-red-50",
            destination: "Project Workspace",
            destinationDescription: "Complete project lifecycle and deliverables",
            nextSteps: [
              "Set up your project workspace and team",
              "Conduct stakeholder interviews and analysis",
              "Create comprehensive requirements documents",
              "Build process flows and user stories"
            ],
            estimatedTime: "8-12 hours",
            confidence: "You'll have a complete project for your portfolio"
          };
        case 'working_ba':
          return {
            title: "Your Expert Support",
            subtitle: "Let's enhance your current project",
            icon: <Building2 className="w-8 h-8" />,
            color: "from-blue-500 to-indigo-600",
            gradient: "from-blue-50 to-indigo-50",
            destination: "Create Your Own Project",
            destinationDescription: "Custom project support and guidance",
            nextSteps: [
              "Define your project scope and objectives",
              "Generate requirements from your existing notes",
              "Get expert guidance on deliverables",
              "Build professional documentation"
            ],
            estimatedTime: "6-10 hours",
            confidence: "You'll have enhanced project outcomes and documentation"
          };
        default:
          return null;
      }
    };

    const journeyData = getJourneyData();
    if (!journeyData) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 bg-gradient-to-r ${journeyData.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {journeyData.icon}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {journeyData.title}
          </h2>
          <p className="text-xl text-gray-600">
            {journeyData.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Your Path */}
          <div className={`bg-gradient-to-r ${journeyData.gradient} rounded-2xl p-8`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Path</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${journeyData.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Start Here</p>
                  <p className="text-gray-700">{journeyData.destination}</p>
                  <p className="text-sm text-gray-600">{journeyData.destinationDescription}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${journeyData.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Time Investment</p>
                  <p className="text-gray-700">{journeyData.estimatedTime}</p>
                  <p className="text-sm text-gray-600">to complete this phase</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${journeyData.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Outcome</p>
                  <p className="text-gray-700">{journeyData.confidence}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Accomplish</h3>
            <div className="space-y-3">
              {journeyData.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Ready to begin your journey?
          </h3>
          <p className="text-gray-600 mb-4">
            You're about to start with <span className="font-semibold text-gray-900">{journeyData.destination}</span>. 
            This is the perfect starting point for your experience level.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Settings className="w-4 h-4" />
            <span>You can always adjust your path later from Settings</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
               <button
                 onClick={() => {
                   // If onboarding is completed, go to dashboard instead of welcome
                   if (onboardingData?.onboarding_stage === 'completed') {
                     setCurrentView('dashboard');
                   } else {
                     setCurrentView('welcome');
                   }
                 }}
                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
               >
                 <ArrowLeft className="w-5 h-5" />
                 {onboardingData?.onboarding_stage === 'completed' ? 'Back to Dashboard' : 'Back to Welcome'}
                 {/* Debug info */}
                 {process.env.NODE_ENV === 'development' && (
                   <span className="text-xs text-gray-400 ml-2">
                     Stage: {onboardingData?.onboarding_stage || 'undefined'}
                   </span>
                 )}
               </button>
             </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {getStepContent()}
      </div>

      {/* Footer with navigation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={handleContinue}
              disabled={!canProceedToNext || isSaving}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                canProceedToNext && !isSaving
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : currentStep === 4 ? (
                <>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedView;
