import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, Lock, GraduationCap, Target, Lightbulb, Users, Briefcase, TrendingUp, FileText, MessageSquare, Award, Zap, Rocket, ShieldCheck, BarChart, AlertCircle, Send, ArrowLeft, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { LEARNING_MODULES } from '../../views/LearningFlow/learningData';
import { normalizeCurrency } from '../../utils/text';
import AssignmentPlaceholder from '../../views/LearningFlow/AssignmentPlaceholder';
import MarkCompleteButton from '../MarkCompleteButton';
import { submitAssignment, getLatestAssignment } from '../../utils/assignments';
import { saveResumeState, loadResumeState } from '../../services/resumeStore';
import { getPageTitle } from '../../services/resumeStore';
import type { PageType } from '../../types/resume';
import { getModuleProgress, markLessonCompleted, type LearningProgressRow } from '../../utils/learningProgress';

const MODULE_ID = 'module-1-core-learning';

// Helper to extract module number from stable_key like "lesson-1-2" => 1
const moduleFromStableKey = (stableKey?: string) => {
  if (!stableKey) return null;
  // stableKey pattern like "lesson-1-2" => module 1
  const m = stableKey.match(/^lesson-(\d+)-/);
  return m ? Number(m[1]) : null;
};

// Modern 2025 Preview Component - Only for baworkxp@gmail.com
const CoreLearning2025Preview: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get Core Learning module (Module 1)
  const coreModule = LEARNING_MODULES.find(m => m.id === 'module-1-core-learning');
  const topics = coreModule?.lessons || [];
  
  // Debug: Log topic titles to console
  useEffect(() => {
    console.log('📚 Core Learning Topics:', topics.map((t, i) => `${i + 1}. ${t.title}`));
  }, [topics.length]);

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
        // Load user type
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setUserType(profileData.user_type || 'existing');
        }

        // Load or initialize module progress
        console.log('📖 Loading module progress for user:', user.id);
        let progress = await getModuleProgress(user.id, MODULE_ID);

        if (!progress) {
          console.log('ℹ️ No module progress found. Creating initial record.');
          const { error: insertError } = await supabase
            .from('learning_progress')
            .insert({
              user_id: user.id,
              module_id: MODULE_ID,
              status: 'unlocked',
              completed_lessons: [],
              assignment_completed: false
            });

          if (insertError) {
            console.error('❌ Failed to create module progress record:', insertError);
          } else {
            progress = await getModuleProgress(user.id, MODULE_ID);
          }
        }

        if (progress) {
          setModuleProgress(progress);
          const completedKeys = progress.completed_lessons || [];
          console.log('✅ Loaded', completedKeys.length, 'completed topics from learning_progress:', completedKeys);
          setCompletedTopics(completedKeys);
        } else {
          console.log('ℹ️ Module progress still missing after initialization');
          setCompletedTopics([]);
        }

        // Also check localStorage for last selected topic
        const savedProgress = localStorage.getItem(`core_learning_progress_${user.id}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          // Restore the last selected topic on page refresh
          if (progress.selectedTopicId) {
            setSelectedTopicId(progress.selectedTopicId);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Persist current topic locally (for convenience)
  useEffect(() => {
    if (!user?.id) return;

    const progress = {
      selectedTopicId
    };
    localStorage.setItem(`core_learning_progress_${user.id}`, JSON.stringify(progress));
  }, [selectedTopicId, user?.id]);

  const getTopicIcon = (index: number) => {
    const icons = [Users, Briefcase, Target, Lightbulb, TrendingUp, ShieldCheck, MessageSquare, Zap, Rocket, Users, FileText, BookOpen, Award, GraduationCap];
    return icons[index] || BookOpen;
  };

  const getTopicColor = (index: number) => {
    const colors = [
      { bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', icon: 'bg-blue-600 dark:bg-blue-500', accent: 'bg-blue-100 dark:bg-blue-900' },
      { bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300', icon: 'bg-purple-600 dark:bg-purple-500', accent: 'bg-purple-100 dark:bg-purple-900' },
      { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', icon: 'bg-emerald-600 dark:bg-emerald-500', accent: 'bg-emerald-100 dark:bg-emerald-900' },
      { bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300', icon: 'bg-amber-600 dark:bg-amber-500', accent: 'bg-amber-100 dark:bg-amber-900' },
      { bg: 'bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40', border: 'border-cyan-300 dark:border-cyan-700', text: 'text-cyan-700 dark:text-cyan-300', icon: 'bg-cyan-600 dark:bg-cyan-500', accent: 'bg-cyan-100 dark:bg-cyan-900' },
      { bg: 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-700 dark:text-rose-300', icon: 'bg-rose-600 dark:bg-rose-500', accent: 'bg-rose-100 dark:bg-rose-900' },
      { bg: 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-300', icon: 'bg-indigo-600 dark:bg-indigo-500', accent: 'bg-indigo-100 dark:bg-indigo-900' },
      { bg: 'bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/40 dark:to-purple-950/40', border: 'border-fuchsia-300 dark:border-fuchsia-700', text: 'text-fuchsia-700 dark:text-fuchsia-300', icon: 'bg-fuchsia-600 dark:bg-fuchsia-500', accent: 'bg-fuchsia-100 dark:bg-fuchsia-900' },
      { bg: 'bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/40 dark:to-green-950/40', border: 'border-lime-300 dark:border-lime-700', text: 'text-lime-700 dark:text-lime-300', icon: 'bg-lime-600 dark:bg-lime-500', accent: 'bg-lime-100 dark:bg-lime-900' },
      { bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300', icon: 'bg-orange-600 dark:bg-orange-500', accent: 'bg-orange-100 dark:bg-orange-900' },
      { bg: 'bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40', border: 'border-violet-300 dark:border-violet-700', text: 'text-violet-700 dark:text-violet-300', icon: 'bg-violet-600 dark:bg-violet-500', accent: 'bg-violet-100 dark:bg-violet-900' },
      { bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-700 dark:text-teal-300', icon: 'bg-teal-600 dark:bg-teal-500', accent: 'bg-teal-100 dark:bg-teal-900' },
      { bg: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-300', icon: 'bg-pink-600 dark:bg-pink-500', accent: 'bg-pink-100 dark:bg-pink-900' },
      { bg: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-700 dark:text-sky-300', icon: 'bg-sky-600 dark:bg-sky-500', accent: 'bg-sky-100 dark:bg-sky-900' },
    ];
    return colors[index % colors.length];
  };

  const isTopicAccessible = (topicIndex: number) => {
    // Existing users can access all topics
    if (userType === 'existing') return true;
    
    // New users: Topic 1 is always accessible
    if (topicIndex === 0) return true;
    
    // New users: Next topic unlocks when previous topic is completed (via assignment)
    return completedTopics.includes(topics[topicIndex - 1].id);
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const selectedIndex = topics.findIndex(t => t.id === selectedTopicId);
  const prevTopic = selectedIndex > 0 ? topics[selectedIndex - 1] : null;
  const nextTopic = selectedIndex < topics.length - 1 ? topics[selectedIndex + 1] : null;
  const isCompleted = selectedTopic && completedTopics.includes(selectedTopic.id);
  const isLastTopic = selectedIndex === topics.length - 1;
  const topicColor = selectedTopic ? getTopicColor(selectedIndex) : getTopicColor(0);

  // Debug: Log which topic is selected AND its unique content
  useEffect(() => {
    if (selectedTopic) {
      console.log('═══════════════════════════════════════');
      console.log(`📖 TOPIC ${selectedIndex + 1}/14: "${selectedTopic.title}"`);
      console.log(`🔑 Topic ID: ${selectedTopic.id}`);
      console.log(`📝 Content length: ${selectedTopic.content.length} characters`);
      console.log(`📄 First 200 chars:`, selectedTopic.content.substring(0, 200));
      console.log('═══════════════════════════════════════');
    }
  }, [selectedTopicId, selectedTopic, selectedIndex]);

  // Create readable sections if content has no markdown structure
  /**
   * Format content - Let markdown handle most formatting, just ensure paragraph breaks exist
   */
  const formatContent = (raw: string) => {
    if (!raw) return raw;
    
    // The content already has proper markdown structure from learningData.ts
    // Just clean up any excessive blank lines
    return raw.replace(/\n{3,}/g, '\n\n').trim();
  };

  /**
   * Get topic-specific assignment for each of the 14 topics
   */
  const getTopicAssignment = (topicIndex: number, topicTitle: string) => {
    const assignments = [
      // Topic 1: Who Is a Business Analyst?
      {
        title: `Topic 1 Quiz: ${topicTitle}`,
        description: `Test your understanding of the BA role.

**Question 1:** What is the PRIMARY role of a Business Analyst?
a) Write code and build software
b) Bridge the gap between business problems and technical solutions ✓
c) Manage project timelines
d) Design user interfaces

**Question 2:** Give a real-world example of when a BA would prevent wasted effort on a project.

**Question 3:** True or False: A BA's main job is to decide HOW a solution will be built.`
      },
      // Topic 2: How Organisations Work
      {
        title: `Topic 2 Quiz: ${topicTitle}`,
        description: `Test your understanding of organizational structure.

**Question 1:** Why do BAs need to understand how organizations work?

**Question 2:** Explain the difference between organizational structure and organizational culture.

**Question 3:** Name 2 ways a BA can navigate organizational politics effectively.`
      },
      // Topic 3: Departments in an Organisation
      {
        title: `Topic 3 Quiz: ${topicTitle}`,
        description: `Test your understanding of departments and teams.

**Question 1:** What's the main difference between a department and a project team?

**Question 2:** List 3 common departments a BA might work with and explain what each does.

**Question 3:** Why do cross-functional teams often need a BA?`
      },
      // Topic 4: Why Projects Happen
      {
        title: `Topic 4 Quiz: ${topicTitle}`,
        description: `Test your understanding of project triggers.

**Question 1:** List 4 common reasons why organizations start projects.

**Question 2:** Give an example of a regulatory change that might trigger a project.

**Question 3:** Why is it important for a BA to understand the TRUE reason behind a project?`
      },
      // Topic 5: Why BAs Are Hired
      {
        title: `Topic 5 Quiz: ${topicTitle}`,
        description: `Test your understanding of the BA's value.

**Question 1:** What are 3 problems that happen when organizations DON'T have a BA?

**Question 2:** Explain how a BA saves time and money.

**Question 3:** A company wants to "improve customer satisfaction." How would a BA approach this vague request?`
      },
      // Topic 6: What a BA Does (and Doesn't Do)
      {
        title: `Topic 6 Quiz: ${topicTitle}`,
        description: `Test your understanding of BA responsibilities.

**Question 1:** List 4 things a BA DOES do.

**Question 2:** List 3 things a BA DOESN'T do (and who does them instead).

**Question 3:** Why is it important for a BA to understand what they DON'T do?`
      },
      // Topic 7: Business Problems BAs Solve
      {
        title: `Topic 7 Quiz: ${topicTitle}`,
        description: `Test your understanding of business problems.

**Question 1:** Give 3 examples of business problems a BA might solve.

**Question 2:** What's the difference between a symptom and a root cause?

**Question 3:** A business says "we need faster delivery." What questions would a BA ask?`
      },
      // Topic 8: SDLC, Agile, and Waterfall
      {
        title: `Topic 8 Quiz: ${topicTitle}`,
        description: `Test your understanding of SDLC and methodologies.

**Question 1:** What is the Software Development Life Cycle (SDLC)?

**Question 2:** Compare Agile vs Waterfall - when would you use each?

**Question 3:** What does a BA do in the Requirements phase?`
      },
      // Topic 9: Understanding the Problem
      {
        title: `Topic 9 Quiz: ${topicTitle}`,
        description: `Test your understanding of problem analysis.

**Question 1:** What is the "5 Whys" technique?

**Question 2:** A manager says "Our app crashes too much." Use 5 Whys to find a potential root cause.

**Question 3:** Why is it dangerous to jump straight to solutions?`
      },
      // Topic 10: Working With Stakeholders
      {
        title: `Topic 10 Quiz: ${topicTitle}`,
        description: `Test your understanding of stakeholder management.

**Question 1:** Who are stakeholders? Give 4 examples.

**Question 2:** Why might different stakeholders have conflicting needs?

**Question 3:** You're a BA on a hospital project. Who would you interview and why?`
      },
      // Topic 11: Working With Developers
      {
        title: `Topic 11 Quiz: ${topicTitle}`,
        description: `Test your understanding of BA-developer collaboration.

**Question 1:** Why do BAs and developers sometimes misunderstand each other?

**Question 2:** What information should a BA provide to developers?

**Question 3:** Give an example of a good requirement vs a vague requirement.`
      },
      // Topic 12: Understanding Systems and Processes
      {
        title: `Topic 12 Quiz: ${topicTitle}`,
        description: `Test your understanding of systems and processes.

**Question 1:** What's the difference between a system and a process?

**Question 2:** Why do BAs need to understand current processes before suggesting changes?

**Question 3:** Give an example of a business process (step-by-step).`
      },
      // Topic 13: Spotting Inefficiencies
      {
        title: `Topic 13 Quiz: ${topicTitle}`,
        description: `Test your understanding of inefficiency identification.

**Question 1:** List 3 signs of an inefficient process.

**Question 2:** How would a BA document inefficiencies they discover?

**Question 3:** A team manually enters data from emails into a spreadsheet daily. What's the inefficiency and potential solution?`
      },
      // Topic 14: BA Tools and Next Steps
      {
        title: `Topic 14 Quiz: ${topicTitle}`,
        description: `Test your understanding of BA tools and career growth.

**Question 1:** Name 4 tools BAs commonly use and what each is for.

**Question 2:** What skills should a BA continue developing?

**Question 3:** How has your understanding of the BA role changed since Topic 1?`
      }
    ];

    return assignments[topicIndex] || {
      title: `Topic ${topicIndex + 1} Quiz`,
      description: 'Complete this quiz to test your understanding.'
    };
  };

  // Remove any leading markdown heading that repeats the topic title (e.g., "# Who is a BA?")
  const removeLeadingHeading = (raw: string, title?: string) => {
    if (!raw) return raw;
    let text = raw.trimStart();
    // If the very first line is a markdown heading (one or more #) remove it
    text = text.replace(/^\s*#{1,6}\s+.*\n+/, '');
    // Also remove plain first-line title duplicates
    if (title) {
      const firstLine = text.split('\n')[0]?.trim();
      if (firstLine && firstLine.toLowerCase() === title.trim().toLowerCase()) {
        text = text.substring(text.indexOf('\n') + 1);
      }
    }
    return text.trimStart();
  };

  // Keyboard navigation for selected topic
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedTopicId) return;
      if (e.key === 'ArrowLeft') {
        if (prevTopic) setSelectedTopicId(prevTopic.id);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = topics.findIndex(t => t.id === selectedTopicId) + 1;
        if (nextIndex < topics.length && isTopicAccessible(nextIndex)) {
          setSelectedTopicId(topics[nextIndex].id);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedTopicId, prevTopic, topics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  // TOPIC DETAIL VIEW - Different layout for each topic!
  if (selectedTopic) {
    // Helper to render common header
    const renderHeader = (showTopicList = false) => (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedTopicId(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Back to all topics"
              >
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
              {!showTopicList && (
                <button
                  onClick={() => setSelectedTopicId(null)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View All Topics</span>
                </button>
              )}
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
    );

    // LAYOUT: All Topics - With Sidebar for easy navigation
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          {renderHeader(true)}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sticky Sidebar - Topics List (ONLY FOR TOPIC 1) */}
              <aside className={`lg:col-span-3 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Topics</h2>
                  <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-1 pb-4">
                  {topics.map((topic, idx) => {
                    const accessible = isTopicAccessible(idx);
                    const completed = completedTopics.includes(topic.id);
                    const isSelected = topic.id === selectedTopicId;
                    const Icon = getTopicIcon(idx);
                    const color = getTopicColor(idx);

                    return (
                      <button
                        key={topic.id}
                        data-topic-id={topic.id}
                        onClick={() => accessible && setSelectedTopicId(topic.id)}
                        disabled={!accessible}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold'
                            : completed
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100/70 dark:hover:bg-green-900/30'
                            : accessible
                            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                          completed ? 'bg-green-700 dark:bg-green-900' : isSelected ? color.icon : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : !accessible ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                          )}
                        </div>
                        <span className="flex-1 text-left truncate">
                          {topic.title}
                          {moduleFromStableKey(topic.id) ? ` (Module ${moduleFromStableKey(topic.id)})` : ''}
                        </span>
                        {completed && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-800 text-white dark:bg-green-950 dark:text-green-100 border border-green-900 dark:border-green-900">Done</span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Topic Hero - Unique gradient for each topic */}
                <div className={`${topicColor.bg} ${topicColor.border} border-b-2 p-8`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 ${topicColor.accent} backdrop-blur-sm rounded-full text-xs font-semibold mb-3 ${topicColor.text}`}>
                        <Clock className="w-3 h-3" />
                        {selectedTopic.duration || '10 min'}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{selectedTopic.title}</h2>
                      <p className={`${topicColor.text} font-medium`}>Topic {selectedIndex + 1} of 14 - BA Fundamentals</p>
                    </div>
                    <div className={`w-16 h-16 rounded-xl ${topicColor.icon} flex items-center justify-center shadow-lg`}>
                      {React.createElement(getTopicIcon(selectedIndex), { className: `w-8 h-8 text-white` })}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12">
                  <div className="core-learning-content prose prose-lg max-w-none dark:prose-invert
                    /* Headings - clean, prominent, well-spaced */
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 md:prose-h1:text-4xl
                    prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-3
                    prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-purple-700 dark:prose-h3:text-purple-400
                    prose-h4:text-lg md:prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
                    
                    /* Paragraphs - generous spacing, readable line height */
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 
                    prose-p:text-base md:prose-p:text-lg 
                    prose-p:leading-relaxed md:prose-p:leading-loose
                    prose-p:my-6
                    prose-p:max-w-4xl
                    
                    /* Strong/Bold - inline emphasis, not block-level */
                    prose-strong:text-gray-900 dark:prose-strong:text-white 
                    prose-strong:font-bold 
                    prose-strong:inline
                    
                    /* Lists - clear hierarchy, proper spacing */
                    prose-ul:my-8 prose-ul:space-y-3 prose-ul:pl-6
                    prose-ol:my-8 prose-ol:space-y-3 prose-ol:pl-6
                    prose-li:text-gray-700 dark:prose-li:text-gray-300 
                    prose-li:text-base md:prose-li:text-lg
                    prose-li:leading-relaxed
                    prose-li:my-2
                    marker:text-purple-600 dark:marker:text-purple-400
                    
                    /* Code - subtle highlight */
                    prose-code:text-purple-600 dark:prose-code:text-purple-400 
                    prose-code:bg-purple-50 dark:prose-code:bg-purple-900/30 
                    prose-code:px-2 prose-code:py-0.5 prose-code:rounded 
                    prose-code:text-sm prose-code:font-medium
                    prose-code:before:content-none prose-code:after:content-none
                    
                    /* Blockquotes - callout boxes */
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 
                    prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/20 
                    prose-blockquote:px-6 prose-blockquote:py-4 
                    prose-blockquote:my-8 prose-blockquote:rounded-r-lg
                    prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                    prose-blockquote:italic
                    
                    /* Links */
                    prose-a:text-purple-600 dark:prose-a:text-purple-400 
                    prose-a:no-underline prose-a:font-medium
                    hover:prose-a:underline
                  ">
                    {(() => {
                      const source = removeLeadingHeading(normalizeCurrency(selectedTopic.content), selectedTopic.title);
                      // eslint-disable-next-line no-console
                      console.debug('[md-normalize] CoreLearning source counts', {
                        hashes: (source.match(/^\s*#+\s/m) || []).length,
                        bold: (source.match(/\*\*[\s\S]+?\*\*/g) || []).length,
                        dashes: (source.match(/^\s*\-\s/m) || []).length,
                      });
                      const normalized = formatContent(source);
                      return <ReactMarkdown>{normalized}</ReactMarkdown>;
                    })()}
                  </div>

                  {/* Module Assignment - Only appears after LAST topic (topic 14) */}
                  {selectedTopic && selectedIndex === topics.length - 1 && (
                    <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
                      <div className="space-y-6">
                        <AssignmentPlaceholder
                          moduleId="module-1-core-learning"
                          moduleTitle="Core Learning"
                          title={coreModule?.assignmentTitle || 'BA Fundamentals Assessment'}
                          description={coreModule?.assignmentDescription || 'Complete the module assessment to demonstrate your understanding of BA fundamentals.'}
                          isCompleted={false}
                          canAccess={true}
                          onComplete={() => {
                            // Mark module complete after assignment submission
                            if (!completedTopics.includes(selectedTopic.id)) {
                              setCompletedTopics([...completedTopics, selectedTopic.id]);
                            }
                          }}
                        />
                        {/* Existing users can also manually mark complete */}
                        {userType === 'existing' && (
                          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Assignment is optional for existing users</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-8 py-6 pr-28 md:pr-96">
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
                          onClick={async () => {
                            if (!user?.id || !selectedTopic) return;
                            try {
                              await markLessonCompleted(user.id, MODULE_ID, selectedTopic.id);
                              const updated = await getModuleProgress(user.id, MODULE_ID);
                              if (updated) {
                                setModuleProgress(updated);
                                setCompletedTopics(updated.completed_lessons || []);
                              }
                            } catch (error) {
                              console.error('❌ Failed to mark topic complete:', error);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      )}

                      {isCompleted && !isLastTopic && nextTopic && (
                        <button
                          onClick={() => {
                            if (nextTopic) {
                              setSelectedTopicId(nextTopic.id);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          Next Topic
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, idx) => {
            const accessible = isTopicAccessible(idx);
            const completed = completedTopics.includes(topic.id);
            const Icon = getTopicIcon(idx);
            const color = getTopicColor(idx);

            return (
              <button
                key={topic.id}
                data-topic-id={topic.id}
                onClick={() => accessible && setSelectedTopicId(topic.id)}
                disabled={!accessible}
                className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                  completed
                    ? 'bg-green-800 dark:bg-green-950 border-green-900 dark:border-green-950'
                    : accessible
                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                    completed 
                      ? 'bg-green-700 dark:bg-green-900' 
                      : accessible 
                      ? color.icon 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}>
                    {completed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : !accessible ? (
                      <Lock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${completed ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Topic {idx + 1}</span>
                </div>
                <h3 className={`font-bold mb-2 transition-colors ${completed ? 'text-white' : 'text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}>
                  {topic.title}
                  {moduleFromStableKey(topic.id) ? ` (Module ${moduleFromStableKey(topic.id)})` : ''}
                </h3>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs ${completed ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Clock className="w-3 h-3" />
                    <span>{topic.duration || '10 min'}</span>
                  </div>
                  {completed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-900 text-white dark:bg-green-900 border border-green-950 dark:border-green-950">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation when a topic is open */}
      {selectedTopicId && (
        <div className="sticky bottom-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur pr-24 md:pr-96">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => prevTopic && setSelectedTopicId(prevTopic.id)}
              disabled={!prevTopic}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous topic"
            >
              Previous
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Tip: Use ← and → to navigate
            </div>
            <button
              onClick={() => nextTopic && isTopicAccessible(selectedIndex + 1) && setSelectedTopicId(nextTopic.id)}
              disabled={!nextTopic || !isTopicAccessible(selectedIndex + 1)}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next topic"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreLearning2025Preview;

