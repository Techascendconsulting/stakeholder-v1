import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { CAREER_JOURNEY_PHASES, type JourneyPhase, type JourneyTopic } from '../../data/careerJourneyData';
import { 
  CheckCircle, 
  Lock, 
  Play, 
  ArrowLeft, 
  Sparkles,
  MapPin,
  X,
  Users as UsersIcon
} from 'lucide-react';

interface PhaseProgress {
  phase_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_topics: string[];
  started_at?: string;
  completed_at?: string;
}

const CareerJourneyView: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [progress, setProgress] = useState<PhaseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);

    // Load user type
    try {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();
      
      if (userData) {
        setUserType(userData.user_type || 'existing');
      }
    } catch (error) {
      console.error('Failed to load user type:', error);
    }

    // Load career journey progress
    try {
      const { data: progressData, error } = await supabase
        .from('career_journey_progress')
        .select('*')
        .eq('user_id', user.id);

      if (!error && progressData) {
        setProgress(progressData);
      }
    } catch (error) {
      console.log('Career journey progress table not found, using defaults');
    }
    
    setLoading(false);
  };

  const getPhaseStatus = (phase: JourneyPhase): 'completed' | 'in_progress' | 'not_started' | 'locked' => {
    const phaseProgress = progress.find(p => p.phase_id === phase.id);
    
    if (phaseProgress?.status === 'completed') {
      return 'completed';
    }
    
    if (phaseProgress?.status === 'in_progress') {
      return 'in_progress';
    }

    // For existing users: all unlocked
    if (userType === 'existing') {
      return 'not_started';
    }

    // For new users: check if locked
    if (phase.order === 1) {
      return 'not_started'; // First phase always unlocked
    }

    // Check if previous phase is completed
    const previousPhase = CAREER_JOURNEY_PHASES.find(p => p.order === phase.order - 1);
    if (previousPhase) {
      const prevProgress = progress.find(p => p.phase_id === previousPhase.id);
      if (prevProgress?.status === 'completed') {
        return 'not_started'; // Unlocked
      }
    }

    return 'locked';
  };

  const handlePhaseClick = (phaseIndex: number) => {
    const phase = CAREER_JOURNEY_PHASES[phaseIndex];
    const status = getPhaseStatus(phase);
    if (status === 'locked' && userType === 'new') return;

    // Show modal with phase details
    setSelectedPhaseIndex(phaseIndex);
  };

  const handleGoToLearning = (phase: JourneyPhase) => {
    // Navigate directly to the specific learning module page
    if (phase.learningModuleId) {
      setCurrentView(phase.learningModuleId as any);
    }
  };

  const handleTopicClick = (topic: JourneyTopic) => {
    // Navigate to the topic's view if it has one
    if (topic.viewId) {
      setCurrentView(topic.viewId as any);
      setSelectedPhaseIndex(null); // Close modal
    }
  };

  const getCurrentPhaseIndex = (): number => {
    // Find the first in-progress or not-started phase
    const inProgressPhase = CAREER_JOURNEY_PHASES.findIndex(p => getPhaseStatus(p) === 'in_progress');
    if (inProgressPhase !== -1) return inProgressPhase;

    const notStartedPhase = CAREER_JOURNEY_PHASES.findIndex(p => getPhaseStatus(p) === 'not_started');
    if (notStartedPhase !== -1) return notStartedPhase;

    return CAREER_JOURNEY_PHASES.length - 1; // All completed, show last
  };

  const getPhaseProgress = (phase: JourneyPhase): number => {
    const phaseProgress = progress.find(p => p.phase_id === phase.id);
    if (!phaseProgress) return 0;
    
    const completedTopics = phaseProgress.completed_topics?.length || 0;
    const totalTopics = phase.topics.length;
    
    return Math.round((completedTopics / totalTopics) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentPhaseIndex = getCurrentPhaseIndex();
  const selectedPhaseData = selectedPhaseIndex !== null ? CAREER_JOURNEY_PHASES[selectedPhaseIndex] : null;

  // Color mapping for your app's purple/indigo theme
  const colorClasses: Record<string, string> = {
    'purple': 'from-purple-500 to-indigo-600',
    'blue': 'from-blue-500 to-cyan-600',
    'emerald': 'from-emerald-500 to-teal-600',
    'amber': 'from-amber-500 to-orange-600',
    'pink': 'from-pink-500 to-rose-600',
    'indigo': 'from-indigo-500 to-purple-600',
    'cyan': 'from-cyan-500 to-blue-600',
    'green': 'from-green-500 to-emerald-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-purple-600 dark:bg-purple-900 backdrop-blur-sm border-b border-purple-500 dark:border-purple-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center space-x-2 text-purple-100 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-200" />
              Business Analyst Journey
            </h1>
            <p className="text-sm text-purple-100 mt-2 max-w-3xl mx-auto">
              From onboarding to agile delivery: A comprehensive map of the BA lifecycle, bridging gaps between stakeholders and solution teams.
            </p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-white">
                {progress.filter(p => p.status === 'completed').length} / {CAREER_JOURNEY_PHASES.length}
              </span>
              <span className="text-xs text-purple-200 ml-2">Phases Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Timeline - Beautiful Curved Path */}
      <div className="py-12">
        <div className="overflow-x-auto pb-8 pt-4">
          <div className="relative min-w-max px-8">
            {/* Curved Path SVG - Purple/Indigo Gradient */}
            <svg className="absolute top-[260px] left-0 w-full h-2" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="careerPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.4 }} />
                  <stop offset="25%" style={{ stopColor: '#6366f1', stopOpacity: 0.4 }} />
                  <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.4 }} />
                  <stop offset="75%" style={{ stopColor: '#a855f7', stopOpacity: 0.4 }} />
                  <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0.4 }} />
                </linearGradient>
              </defs>
              <path
                d={`M 0 4 Q ${CAREER_JOURNEY_PHASES.length * 60} -10, ${CAREER_JOURNEY_PHASES.length * 280} 4`}
                stroke="url(#careerPathGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <div className="flex gap-4 relative" style={{ zIndex: 1 }}>
              {CAREER_JOURNEY_PHASES.map((phase, index) => {
                const status = getPhaseStatus(phase);
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';
                const isInProgress = status === 'in_progress';
                const isClickable = !isLocked || userType === 'existing';
                const isSelected = selectedPhaseIndex === index;
                const isCurrent = currentPhaseIndex === index;
                const isEven = index % 2 === 0;
                const gradientClass = colorClasses[phase.color] || colorClasses['purple'];

                return (
                  <div key={phase.id} className="relative flex flex-col items-center" style={{ width: '280px' }}>
                    {/* Phase Card - Alternates top/bottom */}
                    <div className={`transition-all duration-500 ${isEven ? 'mb-32' : 'mt-32 order-2'}`}>
                      {/* Phase Badge - Outside card at top */}
                      <div className={`flex justify-center mb-3`}>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r ${gradientClass} text-white px-3 py-1.5 rounded-full shadow-md`}>
                          <MapPin className="w-3 h-3" />
                          Phase {phase.order}
                        </div>
                      </div>

                      <button
                        onClick={() => handlePhaseClick(index)}
                        disabled={isLocked && userType === 'new'}
                        className={`group relative transition-all duration-500 ${
                          isSelected ? 'scale-105' : 'hover:scale-102'
                        } ${isLocked && userType === 'new' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 transition-all duration-500 overflow-hidden ${
                          isSelected ? 'ring-4 ring-purple-200 dark:ring-purple-600 shadow-2xl border-purple-400 dark:border-purple-600' : 
                          isCompleted ? 'border-green-400 dark:border-green-600' :
                          isInProgress ? 'border-orange-400 dark:border-orange-600' :
                          isLocked ? 'border-gray-300 dark:border-gray-600 opacity-60' :
                          'border-slate-200 dark:border-gray-700 hover:shadow-2xl'
                        }`}>
                          {/* Subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{
                            backgroundImage: `linear-gradient(135deg, ${phase.color === 'purple' ? '#a855f7' : phase.color === 'blue' ? '#3b82f6' : phase.color === 'emerald' ? '#10b981' : phase.color === 'amber' ? '#f59e0b' : phase.color === 'pink' ? '#ec4899' : phase.color === 'indigo' ? '#6366f1' : phase.color === 'cyan' ? '#06b6d4' : '#22c55e'} 0%, transparent 100%)`
                          }} />

                          <div className="relative p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg flex items-center justify-center transform transition-transform duration-300 ${
                                isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                              }`}>
                                {isCompleted ? <CheckCircle className="w-7 h-7 text-white" /> : isLocked ? <Lock className="w-7 h-7 text-white" /> : <phase.icon className="w-7 h-7 text-white" />}
                              </div>

                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1">
                                  {phase.shortTitle}
                                </h3>
                              </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                              {phase.description}
                            </p>

                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-gray-700">
                              <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">{phase.topics.length} topics</span>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Key Topics
                              </div>
                              {phase.topics.slice(0, 3).map((topic, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientClass}`} />
                                  <span className="text-xs text-slate-700 dark:text-gray-300 font-medium leading-tight">
                                    {topic.title}
                                  </span>
                                </div>
                              ))}
                              {phase.topics.length > 3 && (
                                <div className="text-xs text-slate-500 dark:text-gray-400 font-medium pl-3.5">
                                  +{phase.topics.length - 3} more topics
                                </div>
                              )}
                            </div>
                          </div>

                          <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`} />
                        </div>
                      </button>
                    </div>

                    {/* Phase Dot on Path */}
                    <div className={`absolute ${isEven ? 'bottom-[80px]' : 'top-[80px]'} left-1/2 transform -translate-x-1/2`}>
                      <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg border-4 border-white dark:border-gray-900 transition-all duration-300 ${
                        isSelected ? 'scale-150 ring-4 ring-offset-2 ring-purple-200 dark:ring-purple-600' : isCurrent ? 'scale-125 ring-4 ring-offset-2 ring-orange-200 dark:ring-orange-600' : 'hover:scale-125'
                      }`}>
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-600 animate-ping opacity-75" />
                        )}
                        {isLocked && (
                          <Lock className="absolute inset-0 w-3 h-3 m-auto text-white" />
                        )}
                      </div>

                      {/* "You are here" indicator */}
                      {isCurrent && (
                        <div className={`absolute ${isEven ? 'bottom-full mb-4' : 'top-full mt-4'} left-1/2 transform -translate-x-1/2 whitespace-nowrap`}>
                          <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                            ⚡ You are here
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Phase Detail Modal */}
      {selectedPhaseData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhaseIndex(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const phase = selectedPhaseData;
              const status = getPhaseStatus(phase);
              const phaseProgress = progress.find(p => p.phase_id === phase.id);
              const gradientClass = colorClasses[phase.color] || colorClasses['purple'];

              return (
                <>
                  {/* Modal Header */}
                  <div className={`bg-gradient-to-r ${gradientClass} p-8 text-white relative`}>
                    <button
                      onClick={() => setSelectedPhaseIndex(null)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 mb-3">
                      <phase.icon className="w-12 h-12" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block mb-2">
                          Phase {phase.order}
                        </div>
                        <h2 className="text-3xl font-bold">{phase.title}</h2>
                      </div>
                      {phase.learningModuleId && (
                        <button
                          onClick={() => handleGoToLearning(phase)}
                          className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-2 shadow-lg"
                        >
                          <Play className="w-5 h-5" />
                          Go to Learning
                        </button>
                      )}
                    </div>
                    <p className="text-purple-50 text-lg">{phase.realWorldContext}</p>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <phase.icon className="w-5 h-5" />
                        Topics & Activities
                      </h3>
                      <div className="space-y-4">
                        {phase.topics.map((topic, topicIndex) => {
                          const isTopicCompleted = phaseProgress?.completed_topics?.includes(topic.id);
                          const isPhaseClickable = status !== 'locked' || userType === 'existing';
                          const isClickable = topic.viewId && isPhaseClickable;

                          return (
                            <div 
                              key={topic.id} 
                              onClick={() => isClickable && handleTopicClick(topic)}
                              className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                                isTopicCompleted ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20' :
                                'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                              } ${isClickable ? 'hover:shadow-md cursor-pointer hover:border-purple-400 dark:hover:border-purple-500' : ''}`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
                                  {isTopicCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : topic.viewId ? <Play className="w-5 h-5 text-white" /> : <span className="text-white font-bold text-sm">{topicIndex + 1}</span>}
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">{topic.title}</h4>
                                  <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">{topic.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deliverables & Stakeholders */}
                    {((phase as any).deliverables || (phase as any).stakeholders) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        {/* Key Deliverables */}
                        {(phase as any).deliverables && (phase as any).deliverables.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              Key Deliverables
                            </h3>
                            <ul className="space-y-2">
                              {(phase as any).deliverables.map((deliverable: string, index: number) => (
                                <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-gray-300">
                                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key Stakeholders */}
                        {(phase as any).stakeholders && (phase as any).stakeholders.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                              <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              Key Stakeholders
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {(phase as any).stakeholders.map((stakeholder: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium border-2 border-blue-200 dark:border-blue-800"
                                >
                                  {stakeholder}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Journey Guide */}
      {!selectedPhaseData && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Your BA Career Simulation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              This journey simulates your first major BA project from start to finish. Each phase represents a real stage
              in the BA workflow, with topics that teach you exactly what BAs do at each point.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Click any phase to explore topics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">See what you'll learn and do in each stage</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Play className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Topics with play icons are interactive</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to start practice sessions or view content</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {userType === 'new' ? 'Complete phases in order to unlock next' : 'All phases unlocked for you'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userType === 'new' 
                      ? 'Build your skills progressively through the complete BA workflow'
                      : 'We recommend following the sequence for the best learning experience'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerJourneyView;
