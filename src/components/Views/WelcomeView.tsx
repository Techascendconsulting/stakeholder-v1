import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Target, 
  ArrowRight, 
  Play, 
  BookOpen, 
  FolderOpen, 
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Briefcase,
  Lightbulb,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const WelcomeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to BA WorkXP Platform",
      subtitle: "Your journey to becoming a professional Business Analyst starts here",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              BA WorkXP Platform
            </h1>
                          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Whether you're just starting or already trained, this platform helps you gain real BA experience, build a professional portfolio, and learn the practical skills employers actually care about.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real Work Experience</h3>
              <p className="text-gray-600 dark:text-gray-400">Work on actual BA projects and create professional deliverables you can show employers.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Portfolio Building</h3>
              <p className="text-gray-600 dark:text-gray-400">Build a comprehensive portfolio of BA artifacts and project documentation.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Career Ready</h3>
              <p className="text-gray-600 dark:text-gray-400">Gain the practical skills and confidence needed to excel in real BA roles.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Learning Journey",
      subtitle: "From fundamentals to real project work",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Phase 1: Foundation</h3>
               
               <div className="flex items-start space-x-4">
                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                   <span className="text-white font-semibold text-sm">1</span>
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">BA Fundamentals</h4>
                   <p className="text-gray-600 dark:text-gray-400 text-sm">Learn core BA concepts, methodologies, and best practices through interactive lessons.</p>
                 </div>
               </div>
               
               <div className="flex items-start space-x-4">
                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                   <span className="text-white font-semibold text-sm">2</span>
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Core Concepts</h4>
                   <p className="text-gray-600 dark:text-gray-400 text-sm">Master requirements gathering, process modeling, and stakeholder management techniques.</p>
                 </div>
               </div>
               
               <div className="flex items-start space-x-4">
                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                   <span className="text-white font-semibold text-sm">3</span>
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Agile Scrum</h4>
                   <p className="text-gray-600 dark:text-gray-400 text-sm">Learn Agile methodologies, Scrum frameworks, and iterative development practices.</p>
                 </div>
               </div>
             </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Phase 2: Stakeholder Skills</h3>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Meeting Skills</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Learn how to discuss with stakeholders to understand projects, issues, and requirements.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-sm">5</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Question Techniques</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Master open vs. closed questions, follow-up strategies, and professional etiquette.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-sm">6</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements Discovery</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Practice uncovering pain points, root causes, and business needs through conversations.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Phase 3: Work Experience</h3>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-sm">7</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Project Selection</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Choose from realistic BA projects and apply all your learned skills.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-sm">8</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real Deliverables</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Create professional BA documents and deliverables for your portfolio.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-semibold text-sm">9</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Portfolio Building</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Compile your work into a professional portfolio to showcase to employers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How to Use the Platform",
      subtitle: "Navigate your way to success",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Learn</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Start with BA fundamentals and core concepts to build your knowledge foundation.</p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                <span>Go to Learn</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Training Hub</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Practice meeting skills with AI coaching and real-time feedback.</p>
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                <span>Go to Training</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Work on real projects and create professional deliverables for your portfolio.</p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                <span>Go to Practice</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/30 dark:border-blue-700/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pro Tips for Success</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Complete Fundamentals First</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Build a strong foundation before moving to practice sessions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Practice Regularly</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Consistent practice builds confidence and improves skills.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Document Everything</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Keep detailed notes and create professional deliverables.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Build Your Portfolio</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Compile your best work to showcase to potential employers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start Your Journey?",
      subtitle: "Begin building your BA career today",
      content: (
        <div className="text-center space-y-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your BA Career Starts Here
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of aspiring Business Analysts who are building real work experience and launching successful careers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Start Learning</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Begin with our guided Foundation journey and build your knowledge step by step.</p>
              <button
                onClick={() => setCurrentView('foundation-wizard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Foundation Journey
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Practice Meetings</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Hone your meeting skills with AI-powered coaching.</p>
              <button
                onClick={() => setCurrentView('training-hub')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Training
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Work on Projects</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Create real deliverables and build your professional portfolio.</p>
              <button
                onClick={() => setCurrentView('guided-practice-hub')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Projects
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Or explore the dashboard</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Get an overview of all available features and track your progress.</p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-6">
              <h2 className="text-3xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
              <p className="text-purple-100 text-lg">{steps[currentStep].subtitle}</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {steps[currentStep].content}
            </div>

            {/* Navigation */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === steps.length - 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
