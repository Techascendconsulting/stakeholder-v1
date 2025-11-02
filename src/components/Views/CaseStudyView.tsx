import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft, Send, CheckCircle, Clock, Target, Users, Brain, Star } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  topic: string;
  scenario: string;
  learningObjectives: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface CaseStudyViewProps {
  caseStudyId: string;
  onBack: () => void;
}

const CaseStudyView: React.FC<CaseStudyViewProps> = ({ caseStudyId, onBack }) => {
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState<'read' | 'analyze' | 'feedback'>('read');
  const [userAnalysis, setUserAnalysis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Mock case study data - in real implementation, this would come from the lecture service
  const caseStudy: CaseStudy = {
    id: caseStudyId,
    title: 'TechCorp Software Development Process Improvement',
    topic: 'Business Analysis Definition',
    scenario: `**Company Background:**
TechCorp is a mid-sized software company with 200 employees developing enterprise SaaS solutions. They've been in business for 8 years and serve 500+ clients across healthcare, finance, and retail sectors.

**The Challenge:**
TechCorp is experiencing significant delays in their product development process. Projects that used to take 3 months are now taking 6-8 months, causing customer dissatisfaction, lost revenue ($2M annually), and declining market share. The CEO has hired you as a Business Analyst to "fix the development process."

**Current State Analysis:**
- Development Teams: Complain about unclear, changing requirements and lack of business context
- Product Managers: Say developers don't understand business needs and focus too much on technical solutions
- Customers: Frustrated with delayed releases and features that don't meet their needs
- Sales Team: Losing deals due to missed deadlines and inability to commit to delivery dates
- Process Issues: No formal requirements gathering process, ad-hoc communication, no traceability

**Your Task:**
As a Business Analyst, analyze this situation and provide your approach to addressing TechCorp's challenges. Consider:
1. What is the real business problem here?
2. What questions would you ask to understand the situation better?
3. How would you approach this as a BA?
4. What deliverables would you create?`,
    learningObjectives: [
      'Understand the role of a Business Analyst in problem identification',
      'Practice distinguishing between stated needs and real business needs',
      'Apply systematic analysis approach to complex organizational problems',
      'Develop stakeholder engagement strategies'
    ],
    estimatedTime: '30-45 minutes',
    difficulty: 'intermediate'
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartAnalysis = () => {
    setCurrentStep('analyze');
  };

  const handleSubmitAnalysis = async () => {
    if (!userAnalysis.trim()) {
      alert('Please provide your analysis before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In real implementation, this would call the lecture service for AI assessment
      // For now, simulate AI assessment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockFeedback = {
        score: 85,
        strengths: [
          'Good identification of the core business problem',
          'Clear understanding of stakeholder perspectives',
          'Systematic approach to analysis'
        ],
        areasForImprovement: [
          'Could provide more specific questions for stakeholder interviews',
          'Consider adding timeline and resource constraints',
          'Include risk assessment in your approach'
        ],
        keyPoints: [
          'Business need vs stated requirement distinction',
          'Stakeholder engagement strategy',
          'Requirements traceability framework'
        ],
        overallFeedback: 'Excellent analysis! You demonstrate a strong understanding of Business Analysis principles and show good critical thinking skills. Your approach is systematic and considers multiple stakeholder perspectives.'
      };
      
      setFeedback(mockFeedback);
      setCurrentStep('feedback');
    } catch (error) {
      console.error('Error submitting analysis:', error);
      alert('Error submitting analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteCaseStudy = () => {
    // Mark case study as completed
    // In real implementation, this would update progress tracking
    setCurrentView('advanced-topics'); // Return to assessments
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Assessments</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(caseStudy.difficulty)}`}>
                {caseStudy.difficulty}
              </span>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{caseStudy.estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Study Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {caseStudy.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Topic: {caseStudy.topic}
          </p>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span className="text-sm">Learning Objectives</span>
            </div>
          </div>
          
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {caseStudy.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'read' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'read' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Read Scenario</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'analyze' ? 'text-purple-600' : currentStep === 'feedback' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analyze' ? 'bg-purple-600 text-white' : currentStep === 'feedback' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Analyze</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'feedback' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'feedback' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Feedback</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'read' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: caseStudy.scenario.replace(/\n/g, '<br/>') }} />
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartAnalysis}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Case Study
              </button>
            </div>
          </div>
        )}

        {currentStep === 'analyze' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Analysis
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provide your analysis of the case study:
              </label>
              <textarea
                value={userAnalysis}
                onChange={(e) => setUserAnalysis(e.target.value)}
                placeholder="Write your analysis here. Consider the business problem, your approach, questions you would ask, and deliverables you would create..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep('read')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Back to Scenario
              </button>
              <button
                onClick={handleSubmitAnalysis}
                disabled={isSubmitting || !userAnalysis.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Analysis'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'feedback' && feedback && (
          <div className="space-y-6">
            {/* Score and Overall Feedback */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Assessment
                </h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {feedback.score}/100
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feedback.overallFeedback}
              </p>
            </div>

            {/* Strengths */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-md font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-md font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Areas for Improvement
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>

            {/* Key Points */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-md font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Key Learning Points
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {feedback.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                className="px-4 py-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                {showSampleAnswer ? 'Hide' : 'Show'} Sample Answer
              </button>
              <button
                onClick={handleCompleteCaseStudy}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Case Study
              </button>
            </div>

            {/* Sample Answer */}
            {showSampleAnswer && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Sample Comprehensive Analysis
                </h4>
                <div className="prose prose-gray dark:prose-invert max-w-none text-sm space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">1. Business Problem Identification</h5>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">The CEO's request to "fix the development process" is a symptom, not the root cause. The real business problems are:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                      <li><strong>Revenue Impact:</strong> $2M annual loss due to delayed projects and missed opportunities</li>
                      <li><strong>Customer Satisfaction:</strong> Declining market share due to poor delivery performance</li>
                      <li><strong>Operational Efficiency:</strong> 100% increase in project duration (3 to 6-8 months)</li>
                      <li><strong>Stakeholder Alignment:</strong> Misaligned expectations between business and technical teams</li>
                      <li><strong>Process Maturity:</strong> Lack of formal requirements management framework</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">2. Stakeholder Analysis & Key Questions</h5>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">I would conduct structured interviews with each stakeholder group:</p>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500 mb-3">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Development Teams:</p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 ml-4">
                        <li>• What specific requirements are unclear or changing?</li>
                        <li>• How do you currently receive business context?</li>
                        <li>• What would help you better understand business needs?</li>
                        <li>• What tools do you need for better requirements management?</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-green-500 mb-3">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Product Managers:</p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 ml-4">
                        <li>• How do you currently gather and document requirements?</li>
                        <li>• What challenges do you face in communicating with development?</li>
                        <li>• How do you prioritize features and requirements?</li>
                        <li>• What metrics do you use to measure success?</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-500 mb-3">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Customers & Sales:</p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 ml-4">
                        <li>• What specific features or capabilities are missing?</li>
                        <li>• How do delays impact your business operations?</li>
                        <li>• What would you prioritize if you had to choose?</li>
                        <li>• How do you currently provide feedback on requirements?</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">3. Business Analysis Approach</h5>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">I would follow a systematic BA approach:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">Phase 1: Discovery</p>
                        <ul className="text-xs text-gray-700 dark:text-gray-300">
                          <li>• Stakeholder interviews and workshops</li>
                          <li>• Current process documentation review</li>
                          <li>• Customer feedback analysis</li>
                          <li>• Metrics and KPIs assessment</li>
                        </ul>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">Phase 2: Analysis</p>
                        <ul className="text-xs text-gray-700 dark:text-gray-300">
                          <li>• Root cause analysis</li>
                          <li>• Gap analysis (current vs. desired state)</li>
                          <li>• Impact assessment</li>
                          <li>• Risk identification</li>
                        </ul>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">Phase 3: Solution Design</p>
                        <ul className="text-xs text-gray-700 dark:text-gray-300">
                          <li>• Requirements management framework</li>
                          <li>• Communication protocols</li>
                          <li>• Tools and templates design</li>
                          <li>• Training and change management</li>
                        </ul>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">Phase 4: Implementation</p>
                        <ul className="text-xs text-gray-700 dark:text-gray-300">
                          <li>• Pilot program design</li>
                          <li>• Success metrics definition</li>
                          <li>• Rollout plan</li>
                          <li>• Continuous improvement process</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">4. Key Deliverables</h5>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-orange-500">
                        <p className="font-medium text-gray-900 dark:text-white">Current State Assessment Report</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Detailed analysis of existing processes, pain points, and stakeholder perspectives</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                        <p className="font-medium text-gray-900 dark:text-white">Requirements Management Framework</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Structured approach for gathering, documenting, and managing requirements</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-green-500">
                        <p className="font-medium text-gray-900 dark:text-white">Stakeholder Communication Plan</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Protocols for effective communication between business and technical teams</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-500">
                        <p className="font-medium text-gray-900 dark:text-white">Process Improvement Roadmap</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Phased implementation plan with success metrics and timeline</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">5. Success Metrics</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Project Duration</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Target: Return to 3-month average</p>
                      </div>
                      <div className="text-center bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Customer Satisfaction</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Target: 90% satisfaction score</p>
                      </div>
                      <div className="text-center bg-white dark:bg-gray-800 p-3 rounded">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Revenue Recovery</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">Target: $2M annual recovery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseStudyView;
