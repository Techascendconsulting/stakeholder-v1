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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">🚀 Minimum Viable Product (MVP)</h1>
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


