import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, Lock, GraduationCap, Target, Lightbulb, Users, Briefcase, TrendingUp, FileText, MessageSquare, Award, Zap, Rocket, ShieldCheck, BarChart, AlertCircle, Send, ArrowLeft, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { LEARNING_MODULES } from '../../views/LearningFlow/learningData';
import AssignmentPlaceholder from '../../views/LearningFlow/AssignmentPlaceholder';
import MarkCompleteButton from '../MarkCompleteButton';
import { submitAssignment, getLatestAssignment } from '../../utils/assignments';
import { saveResumeState, loadResumeState } from '../../services/resumeStore';
import { getPageTitle } from '../../services/resumeStore';
import type { PageType } from '../../types/resume';

// Modern 2025 Preview Component - Only for baworkxp@gmail.com
const CoreLearning2025Preview: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [showMidAssignment, setShowMidAssignment] = useState(false);
  const [midAssignmentCompleted, setMidAssignmentCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get Core Learning module (Module 1)
  const coreModule = LEARNING_MODULES.find(m => m.id === 'module-1-core-learning');
  const topics = coreModule?.lessons || [];

  // Scroll to top on topic change
  useEffect(() => {
    if (selectedTopicId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTopicId]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setUserType(profileData.user_type || 'existing');
        }

        const savedProgress = localStorage.getItem(`core_learning_progress_${user.id}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setCompletedTopics(progress.completedTopics || []);
          setMidAssignmentCompleted(progress.midAssignmentCompleted || false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const saveProgress = () => {
    if (!user?.id) return;
    const progress = { completedTopics, midAssignmentCompleted };
    localStorage.setItem(`core_learning_progress_${user.id}`, JSON.stringify(progress));
  };

  useEffect(() => {
    saveProgress();
  }, [completedTopics, midAssignmentCompleted]);

  const getTopicIcon = (index: number) => {
    const icons = [Users, Briefcase, Target, Lightbulb, TrendingUp, ShieldCheck, MessageSquare, Zap, Rocket, Users, FileText, BookOpen, Award, GraduationCap];
    return icons[index] || BookOpen;
  };

  const getTopicColor = (index: number) => {
    const colors = [
      { bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: 'bg-blue-100 dark:bg-blue-900/50' },
      { bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: 'bg-purple-100 dark:bg-purple-900/50' },
      { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: 'bg-emerald-100 dark:bg-emerald-900/50' },
      { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: 'bg-amber-100 dark:bg-amber-900/50' },
      { bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', icon: 'bg-cyan-100 dark:bg-cyan-900/50' },
      { bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', icon: 'bg-rose-100 dark:bg-rose-900/50' },
      { bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', icon: 'bg-indigo-100 dark:bg-indigo-900/50' },
    ];
    return colors[index % colors.length];
  };

  const isTopicAccessible = (topicIndex: number) => {
    if (userType === 'existing') return true;
    if (topicIndex === 0) return true;
    if (topicIndex >= 7 && !midAssignmentCompleted) return false;
    return completedTopics.includes(topics[topicIndex - 1].id);
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const selectedIndex = topics.findIndex(t => t.id === selectedTopicId);
  const prevTopic = selectedIndex > 0 ? topics[selectedIndex - 1] : null;
  const nextTopic = selectedIndex < topics.length - 1 ? topics[selectedIndex + 1] : null;
  const isCompleted = selectedTopic && completedTopics.includes(selectedTopic.id);
  const isLastTopic = selectedIndex === topics.length - 1;
  const topicColor = selectedTopic ? getTopicColor(selectedIndex) : getTopicColor(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  // MID-POINT ASSIGNMENT (same as before, but with modern styling)
  if (showMidAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button onClick={() => setShowMidAssignment(false)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mid-Point Assessment</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AssignmentPlaceholder
            moduleId="module-1-core-learning-mid"
            moduleTitle="Core Learning (Part 1)"
            title="Mid-Point Assessment: Topics 1-7"
            description={`Answer ALL questions below. You need **70% or higher** to unlock Topics 8-14.

**PART A: Multiple Choice** *(Choose the best answer)*

**Question 1:** What is the PRIMARY role of a Business Analyst?
a) Write code and build software applications
b) Define what needs to be built and why, ensuring the right problem is solved  ✓
c) Manage project timelines and budgets
d) Design user interfaces and create mockups

**Question 2:** Which of these is NOT a common trigger for projects?
a) A problem that's costing the business money
b) New government regulations or compliance requirements
c) A competitor launching a new feature
d) A BA deciding they want to build something new  ✓

**Question 3:** What is the main difference between departments and teams?
a) Departments are larger, teams are smaller
b) Departments are permanent organizational structures, teams are temporary project groups  ✓
c) Departments have managers, teams don't
d) There's no difference

**PART B: Written Responses** *(Show your understanding)*

**Question 4:** Explain why a BA needs to understand how organizations work. Give a specific example from Topics 1-7.

**Question 5:** Describe one way a BA can help prevent wasted projects. Use concepts from Topics 1-7.

**Question 6:** A stakeholder says "We need a mobile app." Using what you learned, what questions would you ask to understand the real problem?`}
            isCompleted={false}
            canAccess={true}
            onComplete={() => {
              setMidAssignmentCompleted(true);
              saveProgress();
              setShowMidAssignment(false);
            }}
          />
        </div>
      </div>
    );
  }

  // TOPIC DETAIL VIEW
  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Modern Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedTopicId(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Topic {selectedIndex + 1} of {topics.length}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTopic.title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {completedTopics.length}/{topics.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Sidebar + Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sticky Sidebar - Topics List */}
            <aside className={`lg:col-span-3 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Topics</h2>
                  <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {topics.map((topic, idx) => {
                    const accessible = isTopicAccessible(idx);
                    const completed = completedTopics.includes(topic.id);
                    const isSelected = topic.id === selectedTopicId;
                    const Icon = getTopicIcon(idx);
                    const color = getTopicColor(idx);

                    return (
                      <button
                        key={topic.id}
                        onClick={() => accessible && setSelectedTopicId(topic.id)}
                        disabled={!accessible}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold'
                            : completed
                            ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : accessible
                            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          completed ? 'bg-green-100 dark:bg-green-900/30' : isSelected ? 'bg-purple-200 dark:bg-purple-800' : color.icon
                        }`}>
                          {completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : !accessible ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-600 dark:text-purple-400' : color.text}`} />
                          )}
                        </div>
                        <span className="flex-1 text-left truncate">{topic.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Topic Hero */}
                <div className={`bg-gradient-to-br ${topicColor.bg} ${topicColor.border} border-b-2 p-8`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
                        <Clock className="w-3 h-3" />
                        {selectedTopic.duration || '10 min'}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{selectedTopic.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400">Foundation concept for Business Analysts</p>
                    </div>
                    <div className={`w-16 h-16 rounded-xl ${topicColor.icon} flex items-center justify-center`}>
                      {React.createElement(getTopicIcon(selectedIndex), { className: `w-8 h-8 ${topicColor.text}` })}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12">
                  <div className="prose prose-lg max-w-none dark:prose-invert
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-3xl prose-h1:mb-6
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-3
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed
                    prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                    prose-ul:my-6 prose-ul:space-y-2
                    prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/20 prose-blockquote:p-4 prose-blockquote:my-6
                  ">
                    <ReactMarkdown>{selectedTopic.content}</ReactMarkdown>
                  </div>

                  {/* Final Assignment (After Topic 14) */}
                  {isLastTopic && (
                    <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
                      {userType === 'new' ? (
                        <AssignmentPlaceholder
                          moduleId="module-1-core-learning"
                          moduleTitle="Core Learning"
                          title="Final Assessment: Complete BA Fundamentals"
                          description={`Demonstrate your mastery of all 14 topics.

**Question 1:** You're hired as a BA for a food delivery app. Customers complain: "My food always arrives cold." Using the 5 Whys technique from Topic 9, investigate the root cause. Then, using what you learned in Topics 8-14, explain:
- What stakeholders would you talk to? (Topic 10)
- How would you work with developers to solve it? (Topic 11)
- What process improvements would you recommend? (Topics 12-13)
- Which SDLC approach (Agile or Waterfall) would you use and why? (Topic 8)

**Question 2:** Compare how a BA works in Agile vs Waterfall (Topic 8). Give a real example from Topics 1-7 showing when each approach would be better.

**Question 3:** A stakeholder says "We need a mobile app." Using what you learned in Topics 1-7, explain:
- What questions would you ask to understand the real problem? (Topic 9)
- What might be the actual root cause?
- How would you prevent this from becoming a wasted project? (Topic 5)

**Question 4:** Describe the BA's role in the full Software Development Life Cycle (Topic 8). For each phase (Planning, Requirements, Design, Development, Testing, Deployment, Maintenance), explain what a BA does with specific examples from Topics 1-14.

---

**Be thorough!** Use specific examples from the topics. Show you understand the BA role comprehensively.`}
                          isCompleted={false}
                          canAccess={true}
                          onComplete={() => {}}
                        />
                      ) : (
                        <div className="space-y-6">
                          <AssignmentPlaceholder
                            moduleId="module-1-core-learning"
                            moduleTitle="Core Learning"
                            title="Final Assessment: Complete BA Fundamentals"
                            description={`Demonstrate your mastery of all 14 topics.`}
                            isCompleted={false}
                            canAccess={true}
                            onComplete={() => {}}
                          />
                          <MarkCompleteButton moduleId="module-1-core-learning" moduleTitle="Core Learning" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      {prevTopic && (
                        <button
                          onClick={() => setSelectedTopicId(prevTopic.id)}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous: {prevTopic.title}</span>
                          <span className="sm:hidden">Previous</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!isCompleted && (
                        <button
                          onClick={() => setCompletedTopics(prev => [...prev, selectedTopic.id])}
                          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      )}

                      {isCompleted && !isLastTopic && (
                        <button
                          onClick={() => {
                            if (selectedIndex === 6 && userType === 'new' && !midAssignmentCompleted) {
                              setShowMidAssignment(true);
                              setSelectedTopicId(null);
                            } else if (nextTopic) {
                              setSelectedTopicId(nextTopic.id);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          {selectedIndex === 6 && userType === 'new' && !midAssignmentCompleted ? 'Take Assessment' : 'Next Topic'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {isCompleted && isLastTopic && (
                        <button
                          onClick={() => setSelectedTopicId(null)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          Complete Module
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // OVERVIEW PAGE - Modern Card Grid
  const firstHalfCompleted = topics.slice(0, 7).every(t => completedTopics.includes(t.id));
  const canAccessSecondHalf = userType === 'existing' || (firstHalfCompleted && midAssignmentCompleted);
  const progressPercent = Math.round((completedTopics.length / topics.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Modern Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setCurrentView('learning-flow')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Core Learning</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Foundation concepts every BA must know</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{progressPercent}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Topic Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, idx) => {
            const accessible = isTopicAccessible(idx);
            const completed = completedTopics.includes(topic.id);
            const Icon = getTopicIcon(idx);
            const color = getTopicColor(idx);

            return (
              <button
                key={topic.id}
                onClick={() => accessible && setSelectedTopicId(topic.id)}
                disabled={!accessible}
                className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                  completed
                    ? 'bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-800'
                    : accessible
                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${completed ? 'bg-green-100 dark:bg-green-900/50' : color.icon}`}>
                    {completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : !accessible ? (
                      <Lock className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                    ) : (
                      <Icon className={`w-6 h-6 ${color.text}`} />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Topic {idx + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{topic.duration || '10 min'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoreLearning2025Preview;

