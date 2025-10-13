import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Lock, GraduationCap, Target, Lightbulb, Users, Briefcase, TrendingUp, FileText, MessageSquare, Award, Zap, Rocket, ShieldCheck, BarChart, AlertCircle, Send } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { LEARNING_MODULES } from '../../views/LearningFlow/learningData';
import AssignmentPlaceholder from '../../views/LearningFlow/AssignmentPlaceholder';
import MarkCompleteButton from '../MarkCompleteButton';
import { submitAssignment, getLatestAssignment } from '../../utils/assignments';

const CoreLearning2View: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [showMidAssignment, setShowMidAssignment] = useState(false);
  const [midAssignmentCompleted, setMidAssignmentCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get Core Learning module (Module 1)
  const coreModule = LEARNING_MODULES.find(m => m.id === 'module-1-core-learning');
  const topics = coreModule?.lessons || [];
  
  // Split topics: First 7 and Last 7
  const firstHalf = topics.slice(0, 7);
  const secondHalf = topics.slice(7, 14);

  // Load user type and progress
  useEffect(() => {
    const loadUserData = async () => {
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

        // Load progress from localStorage for now
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

  // Save progress to localStorage
  const saveProgress = () => {
    if (!user?.id) return;
    const progress = {
      completedTopics,
      midAssignmentCompleted
    };
    localStorage.setItem(`core_learning_progress_${user.id}`, JSON.stringify(progress));
  };

  useEffect(() => {
    saveProgress();
  }, [completedTopics, midAssignmentCompleted]);

  // Map topic index to icon
  const getTopicIcon = (index: number) => {
    const icons = [
      Users, // Who is a BA
      Briefcase, // How organizations work
      Target, // Departments
      Lightbulb, // Why projects happen
      TrendingUp, // Why BAs are hired
      ShieldCheck, // What BA does
      MessageSquare, // Business problems
      Zap, // Skills needed
      Rocket, // BA in action
      Users, // Stakeholder management
      FileText, // Requirements gathering
      BookOpen, // Documentation
      Award, // Agile & Scrum
      GraduationCap // Next steps
    ];
    return icons[index] || BookOpen;
  };

  // Get topic color
  const getTopicColor = (index: number) => {
    const colors = [
      { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-indigo-500', icon: 'bg-blue-100 dark:bg-blue-900/40' },
      { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-pink-500', icon: 'bg-purple-100 dark:bg-purple-900/40' },
      { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400', gradient: 'from-green-500 to-emerald-500', icon: 'bg-green-100 dark:bg-green-900/40' },
      { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-red-500', icon: 'bg-orange-100 dark:bg-orange-900/40' },
      { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-600 dark:text-cyan-400', gradient: 'from-cyan-500 to-blue-500', icon: 'bg-cyan-100 dark:bg-cyan-900/40' },
      { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-600 dark:text-pink-400', gradient: 'from-pink-500 to-rose-500', icon: 'bg-pink-100 dark:bg-pink-900/40' },
      { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-400', gradient: 'from-indigo-500 to-purple-500', icon: 'bg-indigo-100 dark:bg-indigo-900/40' },
    ];
    return colors[index % colors.length];
  };

  // Check if topic is accessible (for new users)
  const isTopicAccessible = (topicIndex: number) => {
    if (userType === 'existing') return true; // Existing users can access all
    
    // New users must complete topics in order
    if (topicIndex === 0) return true; // First topic always accessible
    
    // Topics 8-14 require mid-assignment completion
    if (topicIndex >= 7 && !midAssignmentCompleted) return false;
    
    // Must complete previous topic
    return completedTopics.includes(topics[topicIndex - 1].id);
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const selectedIndex = topics.findIndex(t => t.id === selectedTopicId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // MID-POINT ASSIGNMENT VIEW (After Topic 7)
  if (showMidAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button
              onClick={() => setShowMidAssignment(false)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Core Learning</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Part 1 Complete
                    </p>
                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                      <span>Required Assessment</span>
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mid-Point Assessment
                  </h1>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Pass Required
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  70%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span>Part 1: Complete ✓</span>
                <span>Part 2: Locked until assessment passed</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-purple-600 to-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Instructions Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-3">📝 Assessment Instructions</h2>
              <div className="space-y-2 text-purple-100">
                <p>• Answer all 6 questions covering Topics 1-7</p>
                <p>• 3 multiple choice questions (test your knowledge)</p>
                <p>• 3 written response questions (demonstrate understanding)</p>
                <p>• You need <strong className="text-white">70% or higher</strong> to unlock Topics 8-14</p>
                <p>• Your written responses will be reviewed by AI for depth and accuracy</p>
              </div>
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-sm font-semibold">💡 Tip: Use specific examples from the topics you've learned!</p>
              </div>
            </div>
          </div>

          {/* Assessment using AssignmentPlaceholder (has all submission + AI review logic) */}
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
c) The CEO's friend suggested a cool new feature  ✓
d) Customer complaints about poor user experience

**Question 3:** What is the main challenge of working across departments?
a) Departments speak different languages and have conflicting priorities  ✓
b) Different departments use different email systems
c) Departments are located in different buildings
d) Departments have different lunch schedules

---

**PART B: Written Response** *(Answer in detail with examples)*

**Question 4:** Explain why companies hire Business Analysts. Provide at least 3 specific reasons with examples from what you learned in Topics 1-5.

**Question 5:** Describe a real business problem from an app you use (Netflix, Uber, Instagram, Amazon, etc.). Explain step-by-step what a BA would do to solve it, based on what you learned in Topics 4-7.

**Question 6:** How do organizations work? Explain the difference between product, service, and hybrid companies. Give one real example of each from Topic 2.

---

**Instructions:** 
- For Part A: State your answers (e.g., "1-b, 2-c, 3-a")
- For Part B: Write detailed paragraphs with specific examples
- Be thorough! AI will review depth and accuracy.`}
            isCompleted={midAssignmentCompleted}
            canAccess={true}
            onComplete={() => {
              setMidAssignmentCompleted(true);
              setShowMidAssignment(false);
            }}
          />
        </div>
      </div>
    );
  }

  // INDIVIDUAL TOPIC VIEW
  if (selectedTopic) {
    const topicColor = getTopicColor(selectedIndex);
    const TopicIcon = getTopicIcon(selectedIndex);
    const isCompleted = completedTopics.includes(selectedTopic.id);
    const nextTopic = topics[selectedIndex + 1];
    const prevTopic = topics[selectedIndex - 1];
    const isLastTopic = selectedIndex === topics.length - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedTopicId(null)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Core Learning</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 ${topicColor.icon} rounded-xl flex items-center justify-center shadow-md`}>
                  <TopicIcon className={`w-7 h-7 ${topicColor.text}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Topic {selectedIndex + 1} of {topics.length}
                    </p>
                    {isCompleted && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTopic.title}
                  </h1>
                </div>
              </div>
              
              {selectedTopic.duration && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTopic.duration}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span>Overall Progress</span>
                <span className="font-semibold">{completedTopics.length}/{topics.length} topics</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                  style={{ width: `${(completedTopics.length / topics.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Topic Header Banner */}
            <div className={`bg-gradient-to-r ${topicColor.gradient} p-8 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
                  {selectedIndex < 7 ? 'Part 1: Foundation' : 'Part 2: Application'}
                </div>
                <h2 className="text-3xl font-bold mb-2">{selectedTopic.title}</h2>
                <p className="text-white/90 text-sm">Master this concept to build your BA foundation</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mt-0 prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-4 prose-h1:border-purple-300 dark:prose-h1:border-purple-700
                prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-gray-200 dark:prose-h2:border-gray-700
                prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:font-bold
                prose-h4:text-lg prose-h4:mt-10 prose-h4:mb-5 prose-h4:font-semibold
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-6 prose-p:leading-relaxed prose-p:text-base
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold prose-strong:text-lg
                prose-ul:my-8 prose-ul:space-y-3
                prose-ol:my-8 prose-ol:space-y-3
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:my-2
                prose-li:marker:text-purple-600 dark:prose-li:marker:text-purple-400 prose-li:marker:font-bold
                prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/30 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/20 prose-blockquote:p-4 prose-blockquote:my-8 prose-blockquote:italic
                prose-hr:my-12 prose-hr:border-gray-300 dark:prose-hr:border-gray-700
                [&>*:first-child]:mt-0
                [&_p:has(strong:only-child)]:text-xl [&_p:has(strong:only-child)]:font-bold [&_p:has(strong:only-child)]:mt-12 [&_p:has(strong:only-child)]:mb-6 [&_p:has(strong:only-child)]:text-gray-900 [&_p:has(strong:only-child)]:dark:text-white
                [&_p:first-of-type]:text-lg [&_p:first-of-type]:leading-relaxed [&_p:first-of-type]:text-gray-800 [&_p:first-of-type]:dark:text-gray-200
                [&_ul_li_strong]:text-base [&_ul_li_strong]:text-purple-700 [&_ul_li_strong]:dark:text-purple-300
                [&_h3+p]:mt-4
                [&_h2+p]:mt-4
                ">
                <ReactMarkdown>{selectedTopic.content}</ReactMarkdown>
              </div>

              {/* Final Assignment (After Topic 14 Only) */}
              {isLastTopic && (
                <div className="mt-12 pt-8 border-t-4 border-purple-200 dark:border-purple-800">
                  {userType === 'new' ? (
                    // Mandatory assignment for new users
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
                    // Optional assignment + Mark Complete for existing users
                    <div className="space-y-6">
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">📝 Optional: Test Your Knowledge</h3>
                          <p className="text-gray-600 dark:text-gray-400">Want to validate your learning? Submit an assignment for feedback!</p>
                        </div>
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
                      </div>
                      <MarkCompleteButton
                        moduleId="module-1-core-learning"
                        moduleTitle="Core Learning"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-8 py-6 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  {prevTopic && (
                    <button
                      onClick={() => setSelectedTopicId(prevTopic.id)}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <div className="text-left">
                        <div className="text-xs text-gray-500 dark:text-gray-500">Previous</div>
                        <div className="text-sm font-medium">{prevTopic.title}</div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        setCompletedTopics(prev => [...prev, selectedTopic.id]);
                      }}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark as Complete</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Topic Completed</span>
                      </div>
                      
                      {!isLastTopic && (
                        <button
                          onClick={() => {
                            // Check if this is topic 7 and user is new
                            if (selectedIndex === 6 && userType === 'new' && !midAssignmentCompleted) {
                              setShowMidAssignment(true);
                              setSelectedTopicId(null);
                            } else if (nextTopic) {
                              setSelectedTopicId(nextTopic.id);
                            }
                          }}
                          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span>{selectedIndex === 6 && userType === 'new' && !midAssignmentCompleted ? 'Take Mid-Point Assessment' : 'Next Topic'}</span>
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                      )}
                    </div>
                  )}

                  {isCompleted && isLastTopic && (
                    <button
                      onClick={() => setSelectedTopicId(null)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Award className="w-5 h-5" />
                      <span>Complete Core Learning</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Helpful tip for new users */}
              {userType === 'new' && !isCompleted && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Learning Tip:</strong> Take your time to understand each concept. Click "Mark as Complete" when you're ready to move on.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            {topics.map((topic, idx) => (
              <button
                key={topic.id}
                onClick={() => {
                  if (isTopicAccessible(idx)) {
                    setSelectedTopicId(topic.id);
                  }
                }}
                disabled={!isTopicAccessible(idx)}
                className={`rounded-full transition-all ${
                  topic.id === selectedTopicId
                    ? 'w-10 h-3 bg-purple-600'
                    : completedTopics.includes(topic.id)
                    ? 'w-3 h-3 bg-green-500'
                    : isTopicAccessible(idx)
                    ? 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    : 'w-3 h-3 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                }`}
                title={topic.title}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // OVERVIEW PAGE (Topic Cards)
  const firstHalfCompleted = firstHalf.every(t => completedTopics.includes(t.id));
  const canAccessSecondHalf = userType === 'existing' || (firstHalfCompleted && midAssignmentCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => setCurrentView('learning-flow')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Learning Journey</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Core Learning
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Foundation concepts every Business Analyst must know
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {completedTopics.length}/{topics.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Topics Completed
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Your Progress</span>
              <span className="font-semibold">{Math.round((completedTopics.length / topics.length) * 100)}%</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 transition-all duration-700 ease-out"
                style={{ width: `${(completedTopics.length / topics.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Part 1: Topics 1-7 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Part 1: Foundation (Topics 1-7)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Build your understanding of the BA role and business context
              </p>
            </div>
            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {firstHalf.filter(t => completedTopics.includes(t.id)).length}/{firstHalf.length} Complete
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstHalf.map((topic, index) => {
              const TopicIcon = getTopicIcon(index);
              const topicColor = getTopicColor(index);
              const isCompleted = completedTopics.includes(topic.id);
              const isAccessible = isTopicAccessible(index);
              const isLocked = !isAccessible;

              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    if (isAccessible) {
                      setSelectedTopicId(topic.id);
                    }
                  }}
                  className={`group ${topicColor.bg} rounded-2xl border-2 ${topicColor.border} p-6 transition-all duration-300 relative overflow-hidden ${
                    isAccessible ? 'hover:shadow-2xl cursor-pointer transform hover:scale-105' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Completed Badge */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Topic Content */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-14 h-14 ${topicColor.icon} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <TopicIcon className={`w-7 h-7 ${topicColor.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${topicColor.text} uppercase tracking-wider mb-1`}>
                        Topic {index + 1}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  {/* Duration */}
                  {topic.duration && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{topic.duration}</span>
                    </div>
                  )}

                  {/* Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {topic.content.substring(topic.content.indexOf('\n') + 1, 150)}...
                  </p>

                  {/* Action */}
                  <div className={`text-sm font-semibold ${topicColor.text} flex items-center space-x-2 ${isAccessible && 'group-hover:translate-x-2'} transition-transform`}>
                    <span>{isCompleted ? 'Review Topic' : isLocked ? 'Locked' : 'Start Learning'}</span>
                    {!isLocked && <ArrowLeft className="w-4 h-4 rotate-180" />}
                  </div>

                  {/* Gradient Accent */}
                  {isAccessible && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${topicColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mid-Point Assignment Card (for new users) */}
        {userType === 'new' && (
          <div className="mb-12">
            <div
              onClick={() => {
                if (firstHalfCompleted) {
                  setShowMidAssignment(true);
                }
              }}
              className={`bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden ${
                firstHalfCompleted ? 'cursor-pointer hover:shadow-2xl transform hover:scale-105' : 'opacity-75'
              } transition-all duration-300`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Mid-Point Assessment</h3>
                      <p className="text-purple-100">Complete Topics 1-7 to unlock</p>
                    </div>
                  </div>
                  
                  {midAssignmentCompleted ? (
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                  ) : !firstHalfCompleted ? (
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                  ) : null}
                </div>
                
                <p className="text-white/90 mb-4">
                  Test your understanding of the foundation concepts before moving to Part 2.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {midAssignmentCompleted ? '✅ Completed' : firstHalfCompleted ? '🎯 Ready to start' : `${firstHalf.filter(t => completedTopics.includes(t.id)).length}/${firstHalf.length} topics completed`}
                  </div>
                  {firstHalfCompleted && !midAssignmentCompleted && (
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold text-sm">
                      Start Assessment →
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Part 2: Topics 8-14 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Part 2: Application (Topics 8-14)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Learn practical BA skills and real-world application
                {userType === 'new' && !canAccessSecondHalf && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400 font-semibold">
                    • Complete Part 1 assignment to unlock
                  </span>
                )}
              </p>
            </div>
            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {secondHalf.filter(t => completedTopics.includes(t.id)).length}/{secondHalf.length} Complete
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondHalf.map((topic, idx) => {
              const index = idx + 7; // Actual index in full array
              const TopicIcon = getTopicIcon(index);
              const topicColor = getTopicColor(index);
              const isCompleted = completedTopics.includes(topic.id);
              const isAccessible = isTopicAccessible(index);
              const isLocked = !isAccessible;

              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    if (isAccessible) {
                      setSelectedTopicId(topic.id);
                    }
                  }}
                  className={`group ${topicColor.bg} rounded-2xl border-2 ${topicColor.border} p-6 transition-all duration-300 relative overflow-hidden ${
                    isAccessible ? 'hover:shadow-2xl cursor-pointer transform hover:scale-105' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Completed Badge */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Topic Content */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-14 h-14 ${topicColor.icon} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <TopicIcon className={`w-7 h-7 ${topicColor.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${topicColor.text} uppercase tracking-wider mb-1`}>
                        Topic {index + 1}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  {/* Duration */}
                  {topic.duration && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{topic.duration}</span>
                    </div>
                  )}

                  {/* Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {topic.content.substring(topic.content.indexOf('\n') + 1, 150)}...
                  </p>

                  {/* Action */}
                  <div className={`text-sm font-semibold ${topicColor.text} flex items-center space-x-2 ${isAccessible && 'group-hover:translate-x-2'} transition-transform`}>
                    <span>{isCompleted ? 'Review Topic' : isLocked ? 'Locked' : 'Start Learning'}</span>
                    {!isLocked && <ArrowLeft className="w-4 h-4 rotate-180" />}
                  </div>

                  {/* Gradient Accent */}
                  {isAccessible && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${topicColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreLearning2View;
