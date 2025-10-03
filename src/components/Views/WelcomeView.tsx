import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  ArrowRight, 
  Target,
  FileText,
  Users,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

const WelcomeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  // Ensure copy/paste is enabled
  React.useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // Allow copy
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      // Allow paste
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const steps = [
    {
      title: "Welcome to Your BA Work Experience Lab",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to Your BA Work Experience Lab
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              You've trained as a Business Analyst, now it's time to practise.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mt-4">
              Here you'll:
            </p>
          </div>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Refresh knowledge in Learn Hub */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Refresh your knowledge in the Learn Hub</h3>
                <p className="text-gray-600 dark:text-gray-300">Explore practical BA concepts most training programs miss, the ones that make a real difference at work.</p>
              </div>
            </div>

            {/* See how the job is done */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">See how the job is done in real life</h3>
                <p className="text-gray-600 dark:text-gray-300">Move beyond theory and experience how Business Analysts actually work on projects.</p>
              </div>
            </div>

            {/* Speak to stakeholders */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Speak to stakeholders in realistic conversations</h3>
                <p className="text-gray-600 dark:text-gray-300">Practise the kinds of interactions you’ll face on the job.</p>
              </div>
            </div>

            {/* Build deliverables */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Build deliverables used in real projects</h3>
                <p className="text-gray-600 dark:text-gray-300">Create the same documents and artefacts that real BAs deliver.</p>
              </div>
            </div>

            {/* Create a portfolio */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create a portfolio you can use in interviews</h3>
                <p className="text-gray-600 dark:text-gray-300">Everything you produce here becomes evidence of your experience.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How This Works",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How This Works
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Learn Phase</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Short, focused lessons on practical BA concepts most courses miss.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Practice Phase</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Guided conversations with AI stakeholders. You'll get hints and feedback to build confidence.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Project Phase</h3>
              <p className="text-gray-600 dark:text-gray-300">
                A full BA project with stakeholders. No hints, but you'll reflect and get coaching after each stage.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Portfolio</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Everything you produce is saved as evidence of your work.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Start",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Where would you like to begin?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your starting point. You can return later and switch between Practice and Project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <button 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-yellow-200 dark:border-yellow-700 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all group text-left"
              onClick={() => setCurrentView('learn')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Open Learn Hub
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start with practical BA concepts and lessons
                </p>
                <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-medium">
                  <span>Open Learn Hub</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </button>
            
            <button 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all group text-left"
              onClick={() => setCurrentView('practice-2')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Start Practice
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Guided conversations with AI stakeholders + hints
                </p>
                <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                  <span>Start Practice</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </button>
            
            <button 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 transition-all group text-left"
              onClick={() => setCurrentView('project-brief')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Start Project
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Real project, no hints → may stay locked until Practice is done
                </p>
                <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-medium">
                  <span>Start Project</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
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
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10"
      style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}
    >
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6">
              <h2 className="text-3xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
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
                  <span>Previous</span>
                </button>

                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;