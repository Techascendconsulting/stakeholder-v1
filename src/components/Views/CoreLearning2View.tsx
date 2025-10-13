import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Lock, GraduationCap, Target, Lightbulb, Users, Briefcase, TrendingUp, FileText, MessageSquare, Award, Zap, Rocket, ShieldCheck, BarChart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { LEARNING_MODULES } from '../../views/LearningFlow/learningData';

const CoreLearning2View: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  // Get Core Learning module (Module 1)
  const coreModule = LEARNING_MODULES.find(m => m.id === 'module-1-core-learning');
  const topics = coreModule?.lessons || [];

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

  // Get topic color (cycling through colors)
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

  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const selectedIndex = topics.findIndex(t => t.id === selectedTopicId);

  // If viewing a specific topic
  if (selectedTopic) {
    const topicColor = getTopicColor(selectedIndex);
    const TopicIcon = getTopicIcon(selectedIndex);
    const isCompleted = completedTopics.includes(selectedTopic.id);
    const nextTopic = topics[selectedIndex + 1];
    const prevTopic = topics[selectedIndex - 1];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
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
                <div className={`w-12 h-12 ${topicColor.icon} rounded-xl flex items-center justify-center`}>
                  <TopicIcon className={`w-6 h-6 ${topicColor.text}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Topic {selectedIndex + 1} of {topics.length}
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTopic.title}
                  </h1>
                </div>
              </div>
              
              {selectedTopic.duration && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTopic.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Content Body */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-6
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-gray-200 dark:prose-h2:border-gray-700
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                prose-ul:my-6 prose-ul:space-y-2
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-li:marker:text-blue-600 dark:prose-li:marker:text-blue-400
                [&>*:first-child]:mt-0">
                <ReactMarkdown>{selectedTopic.content}</ReactMarkdown>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-gray-50 dark:bg-gray-900 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  {prevTopic && (
                    <button
                      onClick={() => setSelectedTopicId(prevTopic.id)}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm">Previous Topic</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        setCompletedTopics(prev => [...prev, selectedTopic.id]);
                      }}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Complete</span>
                    </button>
                  )}

                  {nextTopic && (
                    <button
                      onClick={() => setSelectedTopicId(nextTopic.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg ${
                        isCompleted 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isCompleted}
                    >
                      <span>Next Topic</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  )}

                  {!nextTopic && isCompleted && (
                    <button
                      onClick={() => setSelectedTopicId(null)}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Core Learning</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            {topics.map((topic, idx) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`w-2 h-2 rounded-full transition-all ${
                  topic.id === selectedTopicId
                    ? 'w-8 bg-purple-600'
                    : completedTopics.includes(topic.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                title={topic.title}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Overview page (topic cards)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
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

            {/* Progress */}
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {completedTopics.length}/{topics.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Topics Completed
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
              style={{ width: `${(completedTopics.length / topics.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const TopicIcon = getTopicIcon(index);
            const topicColor = getTopicColor(index);
            const isCompleted = completedTopics.includes(topic.id);

            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`group ${topicColor.bg} rounded-2xl border-2 ${topicColor.border} p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 relative overflow-hidden`}
              >
                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                {/* Topic Number */}
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
                  {topic.content.substring(0, 120)}...
                </p>

                {/* Action */}
                <div className={`text-sm font-semibold ${topicColor.text} flex items-center space-x-2 group-hover:translate-x-2 transition-transform`}>
                  <span>{isCompleted ? 'Review Topic' : 'Start Learning'}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>

                {/* Gradient Accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${topicColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoreLearning2View;

