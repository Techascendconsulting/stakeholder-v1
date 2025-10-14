import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  Briefcase, 
  HelpCircle,
  Compass,
  MousePointerClick,
  Lock,
  Unlock,
  BarChart3,
  MessageCircle,
  FileText,
  Award,
  Map as MapIcon
} from 'lucide-react';

const NavigationGuideView: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [learningCompleted, setLearningCompleted] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, [user?.id]);

  const loadUserProgress = async () => {
    if (!user?.id) return;

    try {
      // Get user type
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setUserType(profileData.user_type || 'existing');
      }

      // Get learning progress
      const { data: learningData } = await supabase
        .from('learning_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setLearningCompleted((learningData?.length || 0) >= 10);

      // Get practice progress
      const { data: practiceData } = await supabase
        .from('practice_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setPracticeCompleted((practiceData?.length || 0) >= 4);

      setLoading(false);
    } catch (error) {
      console.error('Error loading user progress:', error);
      setLoading(false);
    }
  };

  const isPracticeAccessible = userType === 'existing' || learningCompleted;
  const isProjectsAccessible = userType === 'existing' || practiceCompleted;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading navigation guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How to Navigate the Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your complete guide to finding everything on BA Training
            </p>
          </div>
        </div>

        {/* Main Navigation Guide */}
        <div className="space-y-8">
          
          {/* The Sidebar - Your Main Menu */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  The Left Sidebar - Your Main Menu
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Everything you need is in the sidebar on the left side of your screen.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dashboard */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Dashboard</span>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Your home base. Always shows your next step and current progress.
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  💡 <strong>Tip:</strong> Not sure where to go? Check the Dashboard's "Next Step" banner.
                </div>
              </div>

              {/* My Learning */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>My Learning</span>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Start here! This is where you learn BA fundamentals.
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <div>
                      <strong>Learning Journey:</strong> 10 modules covering all BA concepts. Complete them in order.
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  💡 <strong>Tip:</strong> Each module has lessons and an assignment. You must score 70%+ to unlock the next module.
                </div>
              </div>

              {/* My Practice */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border-l-4 border-purple-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>My Practice</span>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Apply what you learned. Practice with AI stakeholders and tools.
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">→</span>
                    <div>
                      <strong>Practice Journey:</strong> 4 practice modules (Elicitation, Documentation, MVP, Scrum).
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mt-3 text-xs text-purple-900 dark:text-purple-200">
                  <Lock className="w-4 h-4 inline mr-1" />
                  <strong>How to unlock:</strong> Complete all 10 Learning modules first.
                  {isPracticeAccessible && (
                    <span className="ml-2 text-green-700 dark:text-green-300 font-bold">✓ Unlocked for you!</span>
                  )}
                </div>
              </div>

              {/* Hands-on Project */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border-l-4 border-orange-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <span>Hands-on Project</span>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Real-world application. Work on full BA projects and build your portfolio.
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-600 font-bold">→</span>
                    <div>
                      <strong>Project Journey:</strong> Select a project, conduct meetings, create deliverables, build portfolio.
                    </div>
                  </div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 mt-3 text-xs text-orange-900 dark:text-orange-200">
                  <Lock className="w-4 h-4 inline mr-1" />
                  <strong>How to unlock:</strong> Complete all 4 Practice modules first.
                  {isProjectsAccessible && (
                    <span className="ml-2 text-green-700 dark:text-green-300 font-bold">✓ Unlocked for you!</span>
                  )}
                </div>
              </div>

              {/* My Resources */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-l-4 border-green-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>My Resources</span>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Reference materials, BA Handbook, templates, and guides.
                </p>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-xs text-green-900 dark:text-green-200">
                  <Unlock className="w-4 h-4 inline mr-1" />
                  <strong>Always accessible!</strong> Use anytime you need help or reference.
                </div>
              </div>
            </div>
          </div>

          {/* Your Learning Path */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Your Learning Path (Step-by-Step)
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Follow this sequence to become a skilled BA.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Start with Learning Journey
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Click <strong>My Learning → Learning Journey</strong> in the sidebar. Complete all 10 modules.
                  </p>
                  <button
                    onClick={() => setCurrentView('learning-flow')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Go to Learning Journey →
                  </button>
                </div>
              </div>

              {/* Step 2: Practice */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Move to Practice Journey
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    After Learning unlocks Practice. Click <strong>My Practice → Practice Journey</strong>. Complete 4 practice modules.
                  </p>
                  {isPracticeAccessible ? (
                    <button
                      onClick={() => setCurrentView('practice-flow')}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    >
                      Go to Practice Journey →
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Unlocks after completing all 10 Learning modules
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Projects */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Work on Real Projects
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    After Practice unlocks Projects. Click <strong>Hands-on Project → Project Journey</strong>. Build your portfolio.
                  </p>
                  {isProjectsAccessible ? (
                    <button
                      onClick={() => setCurrentView('project-flow')}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
                    >
                      Go to Project Journey →
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Unlocks after completing all 4 Practice modules
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verity - Your AI Assistant */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verity - Your AI Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Stuck? Need help? Verity is always available.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong>Where to find Verity:</strong> Look for the purple chat button in the bottom-right corner of any page.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong>What Verity can do:</strong> Answer questions about BA concepts, help with exercises, explain assignments, or guide you through the platform.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <div>
                  <strong>Daily limit:</strong> You get 20 questions per day. Use them wisely!
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-indigo-900 dark:text-indigo-200">
                💡 <strong>Pro Tip:</strong> If Verity can't help or you have technical issues, use the "Report Issue" tab to contact support directly.
              </p>
            </div>
          </div>

          {/* Common Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Common Questions
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Why can't I access Practice or Projects?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  These sections are locked until you complete the previous phase. Complete all Learning modules to unlock Practice, then complete all Practice modules to unlock Projects.
                </p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  How do I know what to do next?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Go to your Dashboard. The "Your Next Step" banner always shows exactly what to do next and where to click.
                </p>
              </div>

              <div className="border-l-4 border-orange-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Where can I see my progress?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your Dashboard shows progress bars for Learning, Practice, and Projects. You can also see completion status on each Journey page (module cards turn green when complete).
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Can I skip modules or learn out of order?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  No. The platform enforces sequential learning to build a strong foundation. Each module unlocks only after you pass the previous one with 70%+.
                </p>
              </div>

              <div className="border-l-4 border-indigo-600 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  How long does the full program take?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Estimated 4-6 weeks total: Learning (2-3 weeks), Practice (1-2 weeks), Projects (ongoing). You can move at your own pace!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
            <p className="mb-6 text-purple-100">
              Your BA journey begins with the Learning Journey. Click below to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentView('learning-flow')}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-bold"
              >
                Go to Learning Journey
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors font-bold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationGuideView;

