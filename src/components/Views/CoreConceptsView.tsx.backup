import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, BarChart3, Play, CheckCircle2, Circle } from 'lucide-react';
import { CoreConcept } from '../../types';

const CoreConceptsView: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<CoreConcept | null>(null);
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());

  // Load completion status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completed-core-concepts');
    if (saved) {
      setCompletedConcepts(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save completion status to localStorage
  const toggleCompletion = (conceptId: string) => {
    const newCompleted = new Set(completedConcepts);
    if (newCompleted.has(conceptId)) {
      newCompleted.delete(conceptId);
    } else {
      newCompleted.add(conceptId);
    }
    setCompletedConcepts(newCompleted);
    localStorage.setItem('completed-core-concepts', JSON.stringify([...newCompleted]));
  };

  const coreConcepts: CoreConcept[] = [
    {
      id: 'business-analysis-fundamentals',
      title: 'Business Analysis Fundamentals',
      summary: 'Core principles and methodologies that form the foundation of business analysis practice.',
      description: 'Business analysis is the practice of enabling change in an enterprise by defining needs and recommending solutions that deliver value to stakeholders. This fundamental concept covers the essential principles, methodologies, and frameworks that every business analyst should master.',
      keyPoints: [
        'Understanding the role and responsibilities of a business analyst',
        'Key business analysis techniques and methodologies',
        'The business analysis lifecycle and process',
        'Stakeholder identification and management principles',
        'Requirements elicitation fundamentals'
      ],
      estimatedTime: '45 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'requirements-gathering',
      title: 'Requirements Gathering Techniques',
      summary: 'Comprehensive methods for eliciting, documenting, and validating business requirements.',
      description: 'Requirements gathering is the cornerstone of successful business analysis. This concept explores various techniques for discovering, documenting, and validating requirements from different stakeholder groups.',
      keyPoints: [
        'Interview techniques and best practices',
        'Workshop facilitation methods',
        'Observation and job shadowing approaches',
        'Survey and questionnaire design',
        'Document analysis and review processes'
      ],
      estimatedTime: '60 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'stakeholder-management',
      title: 'Stakeholder Analysis & Management',
      summary: 'Strategies for identifying, analyzing, and effectively managing project stakeholders.',
      description: 'Effective stakeholder management is critical to project success. Learn how to identify key stakeholders, analyze their influence and interest, and develop strategies for effective engagement and communication.',
      keyPoints: [
        'Stakeholder identification techniques',
        'Power-interest grid analysis',
        'Communication planning and execution',
        'Managing conflicting stakeholder interests',
        'Building and maintaining stakeholder relationships'
      ],
      estimatedTime: '50 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'process-modeling',
      title: 'Business Process Modeling',
      summary: 'Visual techniques for documenting and analyzing business processes and workflows.',
      description: 'Process modeling helps visualize how work flows through an organization. Master various modeling techniques to document current state processes, identify improvement opportunities, and design future state solutions.',
      keyPoints: [
        'Process mapping fundamentals',
        'BPMN (Business Process Model and Notation)',
        'Swimlane diagrams and flowcharts',
        'Value stream mapping',
        'Process improvement identification'
      ],
      estimatedTime: '75 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis for Business Insights',
      summary: 'Methods for collecting, analyzing, and interpreting data to support business decisions.',
      description: 'Data-driven decision making is essential in modern business analysis. Learn how to collect, analyze, and interpret data to generate actionable insights that support business objectives.',
      keyPoints: [
        'Data collection methods and sources',
        'Statistical analysis fundamentals',
        'Data visualization techniques',
        'Trend analysis and forecasting',
        'Presenting data insights effectively'
      ],
      estimatedTime: '65 minutes',
      difficulty: 'Advanced'
    },
    {
      id: 'solution-design',
      title: 'Solution Design & Evaluation',
      summary: 'Approaches for designing and evaluating potential solutions to business problems.',
      description: 'Moving from problem identification to solution design requires structured thinking and evaluation. Learn methodologies for generating, analyzing, and selecting the best solutions for business challenges.',
      keyPoints: [
        'Solution ideation and brainstorming',
        'Cost-benefit analysis techniques',
        'Risk assessment and mitigation',
        'Solution comparison matrices',
        'Implementation planning considerations'
      ],
      estimatedTime: '55 minutes',
      difficulty: 'Advanced'
    },
    {
      id: 'change-management',
      title: 'Change Management Principles',
      summary: 'Understanding how to facilitate organizational change and user adoption.',
      description: 'Business analysts often drive change initiatives. Understanding change management principles helps ensure that recommended solutions are successfully adopted and deliver expected value.',
      keyPoints: [
        'Change management models and frameworks',
        'Resistance identification and management',
        'Communication strategies for change',
        'Training and support planning',
        'Measuring change success'
      ],
      estimatedTime: '40 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'agile-ba',
      title: 'Agile Business Analysis',
      summary: 'Adapting business analysis practices for agile and iterative development environments.',
      description: 'Agile methodologies require different approaches to business analysis. Learn how to adapt traditional BA practices for agile environments while maintaining quality and stakeholder value.',
      keyPoints: [
        'Agile principles and BA role adaptation',
        'User story writing and acceptance criteria',
        'Sprint planning and backlog management',
        'Continuous stakeholder collaboration',
        'Iterative requirements refinement'
      ],
      estimatedTime: '50 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'communication-skills',
      title: 'Business Communication Excellence',
      summary: 'Essential communication skills for effective business analysis practice.',
      description: 'Communication is at the heart of business analysis. Develop skills in written, verbal, and visual communication to effectively convey complex information to diverse stakeholder groups.',
      keyPoints: [
        'Audience analysis and message tailoring',
        'Written communication best practices',
        'Presentation skills and techniques',
        'Visual communication and diagramming',
        'Facilitation and meeting management'
      ],
      estimatedTime: '45 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'project-lifecycle',
      title: 'Project Lifecycle & BA Role',
      summary: 'Understanding the business analyst\'s role throughout different project phases.',
      description: 'The business analyst\'s role evolves throughout the project lifecycle. Learn how BA activities and deliverables change from project initiation through closure.',
      keyPoints: [
        'Project phases and BA involvement',
        'Key deliverables by project phase',
        'Collaboration with project managers',
        'Quality assurance and testing support',
        'Post-implementation review and lessons learned'
      ],
      estimatedTime: '35 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'technology-understanding',
      title: 'Technology for Business Analysts',
      summary: 'Essential technology concepts and tools for modern business analysis.',
      description: 'While not required to be technical experts, business analysts benefit from understanding key technology concepts to better bridge business and technical teams.',
      keyPoints: [
        'System architecture fundamentals',
        'Database and data management concepts',
        'Integration and API basics',
        'Cloud computing overview',
        'Emerging technology trends'
      ],
      estimatedTime: '60 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'metrics-kpis',
      title: 'Metrics & KPI Development',
      summary: 'Creating meaningful measurements to track business performance and solution success.',
      description: 'Effective measurement is crucial for demonstrating value and driving continuous improvement. Learn how to identify, define, and implement meaningful metrics and KPIs.',
      keyPoints: [
        'KPI identification and selection',
        'SMART criteria for metrics',
        'Baseline establishment and target setting',
        'Dashboard and reporting design',
        'Performance monitoring and adjustment'
      ],
      estimatedTime: '45 minutes',
      difficulty: 'Advanced'
    },
    {
      id: 'vendor-management',
      title: 'Vendor & Contract Management',
      summary: 'Managing relationships and requirements with external vendors and service providers.',
      description: 'Many solutions involve external vendors or service providers. Learn how to effectively manage vendor relationships, contracts, and deliverables from a business analysis perspective.',
      keyPoints: [
        'Vendor selection criteria and evaluation',
        'Contract requirements definition',
        'Service level agreement (SLA) development',
        'Vendor performance monitoring',
        'Relationship management best practices'
      ],
      estimatedTime: '40 minutes',
      difficulty: 'Advanced'
    },
    {
      id: 'ethics-professionalism',
      title: 'Ethics & Professional Standards',
      summary: 'Ethical considerations and professional standards in business analysis practice.',
      description: 'Business analysts often handle sensitive information and make recommendations that impact people and organizations. Understanding ethical principles and professional standards is essential.',
      keyPoints: [
        'Professional codes of conduct',
        'Confidentiality and information security',
        'Conflict of interest management',
        'Objectivity and bias recognition',
        'Continuous professional development'
      ],
      estimatedTime: '30 minutes',
      difficulty: 'Beginner'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'Advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const completedCount = completedConcepts.size;
  const totalCount = coreConcepts.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  if (selectedConcept) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedConcept(null)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Core Concepts
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Title Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {selectedConcept.title}
                </h1>
                <p className="text-slate-300 text-lg">
                  {selectedConcept.summary}
                </p>
              </div>
              <button
                onClick={() => toggleCompletion(selectedConcept.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors group"
              >
                {completedConcepts.has(selectedConcept.id) ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    <span className="text-slate-400 group-hover:text-white">Mark Complete</span>
                  </>
                )}
              </button>
            </div>

            {/* Meta Information */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedConcept.estimatedTime}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedConcept.difficulty)}`}>
                {selectedConcept.difficulty}
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="mb-8">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Video Content</h3>
              <p className="text-slate-400">
                Video content for this concept will be available soon. 
                For now, review the key points and description below.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <p className="text-slate-300 leading-relaxed">
                {selectedConcept.description}
              </p>
            </div>
          </div>

          {/* Key Points */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Key Learning Points</h2>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <ul className="space-y-3">
                {selectedConcept.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Core Concepts</h1>
              <p className="text-slate-300">
                Master the fundamental principles of business analysis
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Progress</span>
              <span className="text-sm text-slate-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreConcepts.map((concept) => {
            const isCompleted = completedConcepts.has(concept.id);
            
            return (
              <div
                key={concept.id}
                className="group relative bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:bg-slate-700/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                onClick={() => setSelectedConcept(concept)}
              >
                {/* Completion Status */}
                <div className="absolute top-4 right-4">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 pr-8 group-hover:text-blue-300 transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {concept.summary}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3 h-3" />
                    {concept.estimatedTime}
                  </div>
                  <div className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(concept.difficulty)}`}>
                    {concept.difficulty}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoreConceptsView;