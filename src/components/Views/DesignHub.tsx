import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PenTool, ArrowRight, Palette, Layers, Eye, Code, Zap, Sparkles } from 'lucide-react';

const DesignHub: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentPage, setCurrentPage] = useState<'overview' | 'lessons'>('overview');
  const [activeTab, setActiveTab] = useState(0);

  const lessons = [
    {
      id: 'lesson-1',
      title: 'What Happens in Design?',
      content: `After a preferred solution has been chosen, the next step is to shape it into something tangible. Design is where processes, systems, and user experiences are mapped so delivery teams know exactly what to build.

On this page, you'll see both the **training narrative** explaining the BA's role in design, and a **visual example** of how that design might look in practice.

**Narrative Highlights**

- To-Be process mapping: showing how the future state should work.

- Wireframes and prototypes: early sketches that help stakeholders visualise changes.

- System and data design: how integrations and data structures will support the solution.

- Business rules and exceptions: ensuring rules are captured and edge cases are handled.

**Your Role as a BA**

- Carry forward the context of why the solution was chosen.

- Facilitate workshops where design is validated against requirements.

- Document rules, exceptions, and scope boundaries.

- Prepare the team for MVP discussions.

👉 The image alongside this text shows a sample design concept. In future lessons, you will see different examples for projects like Expense Management and Customer Identity Verification.`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-2',
      title: 'Process Mapping & User Journeys',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-3',
      title: 'Wireframes & Prototypes',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-4',
      title: 'Business Rules & Edge Cases',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-5',
      title: 'System Integration Design',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-6',
      title: 'Preparing for MVP',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    }
  ];

  // Skip the overview page entirely - go straight to lessons
  if (currentPage === 'overview') {
    setCurrentPage('lessons');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-fuchsia-900/20">
      {/* Creative Studio Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <Palette className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
              Design Studio
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Visual examples of how solutions take shape in practice
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Design Portfolio Grid - Completely Different Approach */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => setActiveTab(index)}
              className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                activeTab === index ? 'scale-105' : ''
              }`}
            >
              {/* Design Project Card */}
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                {/* Background Gradient */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  index === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                  index === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                  index === 2 ? 'bg-gradient-to-br from-pink-500 to-red-600' :
                  index === 3 ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                  index === 4 ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                  'bg-gradient-to-br from-yellow-500 to-green-600'
                }`}></div>
                
                {/* Overlay Pattern */}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full blur-lg"></div>
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6 text-white">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        {index === 0 && <PenTool className="w-6 h-6" />}
                        {index === 1 && <Layers className="w-6 h-6" />}
                        {index === 2 && <Eye className="w-6 h-6" />}
                        {index === 3 && <Code className="w-6 h-6" />}
                        {index === 4 && <Zap className="w-6 h-6" />}
                        {index === 5 && <Sparkles className="w-6 h-6" />}
                      </div>
                      <div className="text-2xl font-black opacity-60">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 leading-tight">
                      {lesson.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-80">
                      {index === 0 && 'Foundation'}
                      {index === 1 && 'Process'}
                      {index === 2 && 'Visual'}
                      {index === 3 && 'Logic'}
                      {index === 4 && 'Integration'}
                      {index === 5 && 'Delivery'}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeTab === index ? 'bg-white text-gray-900' : 'bg-white/20'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Lesson Content - Side Panel Style */}
        {activeTab !== null && (
          <div className="mt-12">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2 min-h-[600px]">
                {/* Left Side - Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-lg ${
                      activeTab === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                      activeTab === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                      activeTab === 2 ? 'bg-gradient-to-br from-pink-500 to-red-600' :
                      activeTab === 3 ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                      activeTab === 4 ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                      'bg-gradient-to-br from-yellow-500 to-green-600'
                    }`}>
                      {activeTab === 0 && <PenTool className="w-8 h-8 text-white" />}
                      {activeTab === 1 && <Layers className="w-8 h-8 text-white" />}
                      {activeTab === 2 && <Eye className="w-8 h-8 text-white" />}
                      {activeTab === 3 && <Code className="w-8 h-8 text-white" />}
                      {activeTab === 4 && <Zap className="w-8 h-8 text-white" />}
                      {activeTab === 5 && <Sparkles className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                        {lessons[activeTab].title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Lesson {activeTab + 1} of {lessons.length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {lessons[activeTab].content.split('\n').map((line, index) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <div key={index} className="font-bold text-purple-600 dark:text-purple-400 mt-6 mb-3 text-lg">
                              {line.replace(/\*\*/g, '')}
                            </div>
                          );
                        } else if (line.startsWith('- ')) {
                          return (
                            <div key={index} className="ml-6 mb-2 flex items-start">
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span>{line.substring(2)}</span>
                            </div>
                          );
                        } else if (line.trim() === '') {
                          return <br key={index} />;
                        } else {
                          return (
                            <div key={index} className="mb-3">
                              {line}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side - Design Canvas */}
                <div className={`p-8 md:p-12 flex items-center justify-center ${
                  activeTab === 0 ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' :
                  activeTab === 1 ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' :
                  activeTab === 2 ? 'bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20' :
                  activeTab === 3 ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' :
                  activeTab === 4 ? 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20' :
                  'bg-gradient-to-br from-yellow-50 to-green-50 dark:from-yellow-900/20 dark:to-green-900/20'
                }`}>
                  <div className="text-center">
                    <div className={`w-32 h-32 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl ${
                      activeTab === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                      activeTab === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                      activeTab === 2 ? 'bg-gradient-to-br from-pink-500 to-red-600' :
                      activeTab === 3 ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                      activeTab === 4 ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                      'bg-gradient-to-br from-yellow-500 to-green-600'
                    }`}>
                      <Palette className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Design Canvas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Ready for Luvables designs
                    </p>
                    <div className="inline-flex items-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignHub;