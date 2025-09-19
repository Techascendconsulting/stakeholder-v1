import React from 'react';
import { FileText, BookOpen, Users, Target, ArrowRight } from 'lucide-react';

const DocumentationView: React.FC = () => {
  const documentationTopics = [
    {
      id: 'business-requirements-document',
      title: 'Business Requirements Document (BRD)',
      description: 'Learn how to create comprehensive business requirements documents that clearly define what the business needs to achieve.',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      topics: [
        'Business objectives and goals',
        'Stakeholder requirements',
        'Business rules and constraints',
        'Success criteria and metrics'
      ]
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      description: 'Master the art of documenting what the system must do, including user interactions and system behaviors.',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      topics: [
        'User stories and use cases',
        'System functions and features',
        'Input/output specifications',
        'User interface requirements'
      ]
    },
    {
      id: 'non-functional-requirements',
      title: 'Non-Functional Requirements',
      description: 'Document quality attributes and constraints that define how the system should perform.',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-purple-900/20',
      topics: [
        'Performance requirements',
        'Security and compliance',
        'Usability and accessibility',
        'Scalability and availability'
      ]
    },
    {
      id: 'requirements-traceability',
      title: 'Requirements Traceability',
      description: 'Learn to maintain clear links between business needs, requirements, and system components.',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      topics: [
        'Traceability matrices',
        'Requirements relationships',
        'Change impact analysis',
        'Coverage tracking'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Requirements Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Master the essential documentation skills for Business Analysts. Learn to create clear, 
            comprehensive, and actionable requirements documents that guide successful project delivery.
          </p>
        </div>

        {/* Documentation Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {documentationTopics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <div
                key={topic.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${topic.bgColor} border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 group`}
              >
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${topic.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {topic.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {topic.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {topic.topics.map((item, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${topic.color} mr-3 flex-shrink-0`}></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <button className={`inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r ${topic.color} text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 group-hover:shadow-xl`}>
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
                
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topic.color} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`}></div>
              </div>
            );
          })}
        </div>

        {/* Key Principles Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Documentation Best Practices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Clarity',
                description: 'Use clear, unambiguous language that stakeholders can easily understand.',
                icon: '📝'
              },
              {
                title: 'Completeness',
                description: 'Ensure all requirements are captured without gaps or missing information.',
                icon: '✅'
              },
              {
                title: 'Consistency',
                description: 'Maintain consistent terminology and formatting throughout all documents.',
                icon: '🔄'
              },
              {
                title: 'Traceability',
                description: 'Link requirements to their sources and track changes throughout the project.',
                icon: '🔗'
              }
            ].map((principle, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                <div className="text-4xl mb-4">{principle.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {principle.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Master Requirements Documentation?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Start creating professional requirements documents that drive successful project outcomes. 
              Your documentation skills are essential for effective Business Analysis.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
              Start Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationView;
