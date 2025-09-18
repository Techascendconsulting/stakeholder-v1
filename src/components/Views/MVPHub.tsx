import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Rocket, Target, Zap, CheckCircle, ArrowRight, BookOpen, Lightbulb, TrendingUp, Users, ArrowLeft } from 'lucide-react';

const MVPHub: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);

  const lessons = [
    {
      id: 'what-is-mvp',
      title: 'What is an MVP?',
      icon: <Rocket className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700'
    },
    {
      id: 'why-mvp-matters',
      title: 'Why MVP Matters',
      icon: <Target className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      id: 'mvp-vs-non-mvp',
      title: 'MVP vs Non-MVP',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700'
    },
    {
      id: 'prioritisation-moscow',
      title: 'Prioritisation & MoSCoW',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700'
    },
    {
      id: 'ba-thinks-mvp',
      title: 'How a BA Thinks About MVP',
      icon: <Users className="w-6 h-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-700'
    },
    {
      id: 'mvp-to-iterations',
      title: 'From MVP to Iterations',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-700'
    }
  ];

  const renderLessonContent = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    const getLessonContent = (id: string) => {
      if (id === 'what-is-mvp') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When a project starts, you will quickly notice that stakeholders usually bring a long list of requirements. Some are improvements to an existing system, while others may be part of building a completely new solution. At first glance, everything might feel urgent, and many stakeholders will argue that every requirement is equally important. But as a Business Analyst, you need to help the team see that delivering everything at once is not realistic and, more importantly, not the right way to deliver value.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This is where the concept of Minimum Viable Product (MVP) comes in.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What is an MVP?</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                An MVP is the smallest possible version of a product that delivers actual value to the user and allows the business to learn something important. It is not a draft, and it is not half-complete functionality. It is not just a demo or a prototype. Instead, it is a product that truly works, but with only the essential features needed to solve the problem at hand.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Think of MVP as a thin vertical slice of functionality that goes all the way through the system, from the user's action to the business outcome. This slice is small, but it is complete. A customer can use it, the system can process it, and the business can see results.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Example 1: Customer Identity Verification</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                Imagine you are working on an Epic called Verify Customer Identity. Stakeholders say:
              </p>
              <ul className="text-blue-800 dark:text-blue-300 mb-4 space-y-2">
                <li>• Customers should be able to upload their ID.</li>
                <li>• The system should validate that ID.</li>
                <li>• A confirmation should be shown to the customer.</li>
                <li>• Customers should be able to re-send the confirmation email.</li>
                <li>• The system should support multiple languages.</li>
              </ul>
              <p className="text-blue-800 dark:text-blue-300 mb-4 font-semibold">Now, which of these is MVP?</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-blue-900 dark:text-blue-200 font-semibold mb-2">The MVP flow is:</p>
                <ul className="text-blue-800 dark:text-blue-300 space-y-1">
                  <li>1. Upload ID.</li>
                  <li>2. Validate ID.</li>
                  <li>3. Show confirmation.</li>
                </ul>
                <p className="text-blue-800 dark:text-blue-300 mt-3">
                  That's it. With those three pieces, the product works. Customers can prove their identity, the system validates it, and the customer gets a result.
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-4">Example 2: Repair Appointment Booking</h3>
              <p className="text-green-800 dark:text-green-300 mb-4">
                Now imagine a requirement in the housing sector: Tenants should be able to book repairs.
              </p>
              <p className="text-green-800 dark:text-green-300 mb-4">Stakeholders request:</p>
              <ul className="text-green-800 dark:text-green-300 mb-4 space-y-2">
                <li>• Tenants should choose their preferred appointment slot.</li>
                <li>• The system should confirm the chosen slot.</li>
                <li>• Engineers should see the confirmed schedule.</li>
                <li>• Tenants should receive SMS reminders.</li>
                <li>• Tenants should be able to reschedule appointments.</li>
                <li>• Tenants should be able to upload photos of the issue.</li>
              </ul>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-green-900 dark:text-green-200 font-semibold mb-2">Again, the MVP flow is clear:</p>
                <ul className="text-green-800 dark:text-green-300 space-y-1">
                  <li>1. Tenant books a slot.</li>
                  <li>2. System confirms the slot.</li>
                  <li>3. Engineer receives the schedule.</li>
                </ul>
                <p className="text-green-800 dark:text-green-300 mt-3">
                  That solves the core problem: engineers showing up randomly and missing tenants.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to Recognise MVP as a BA</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The easiest way to think about MVP is to ask yourself this question:
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700 mb-4">
                <p className="text-yellow-800 dark:text-yellow-300 font-semibold">
                  "If we only built this part, could the customer actually complete the process from start to finish and get value from it?"
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If the answer is yes, then you have identified the MVP. If the answer is no, then it's just part of the puzzle and needs more pieces to make a complete flow.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Why MVP is not a Prototype</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A common mistake is confusing MVP with a prototype. A prototype might look like the product, but it isn't fully functional. It's often used to test ideas or gather feedback. An MVP, on the other hand, works. It might be small, and it might lack polish, but it is usable in the real world. Customers can rely on it, and the business can learn from it.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                An MVP is the smallest set of features that create a complete, working flow and solve a real problem. It is not half-baked. It is not everything at once. It is the right minimum that delivers value end-to-end.
              </p>
            </div>
          </div>
        );
      }
      
      // Placeholder for other lessons
      return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lesson content will be available soon
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-300">
                This lesson is currently under development. The content will be available soon.
              </p>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${lesson.bgColor} ${lesson.borderColor} border rounded-xl flex items-center justify-center`}>
                <span className={lesson.color}>{lesson.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">Lesson Content</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentLesson(null)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lessons</span>
            </button>
          </div>

          {getLessonContent(lessonId)}
        </div>
      </div>
    );
  };

  if (currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-cyan-900/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {renderLessonContent(currentLesson)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-cyan-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-cyan-600/5 dark:from-emerald-400/10 dark:to-cyan-400/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Minimum Viable Product (MVP)</h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Learn how to take your complete design and slice it into the smallest, most valuable release that delivers real business value.
            </p>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLesson(lesson.id)}
              className={`${lesson.bgColor} ${lesson.borderColor} border rounded-xl p-6 text-left hover:shadow-lg transition-all duration-200 group`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 ${lesson.bgColor} ${lesson.borderColor} border rounded-xl flex items-center justify-center`}>
                  <span className={lesson.color}>{lesson.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lesson {index + 1}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Click to start</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* Try MVP Engine Button */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Practice?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Put your MVP knowledge into practice with our interactive MVP Engine tool.
              </p>
              <button
                onClick={() => setCurrentView('mvp-engine')}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Rocket className="w-5 h-5" />
                <span>Try the MVP Engine</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MVPHub;


