import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft, CheckCircle, Clock, Target, FileText, Brain, Star, BookOpen } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  topic: string;
  instructions: string;
  questions: AssignmentQuestion[];
  learningObjectives: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface AssignmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'matching';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface AssignmentViewProps {
  assignmentId: string;
  onBack: () => void;
}

const AssignmentView: React.FC<AssignmentViewProps> = ({ assignmentId, onBack }) => {
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState<'read' | 'complete' | 'feedback'>('read');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  // Mock assignment data - in real implementation, this would come from the lecture service
  const assignment: Assignment = {
    id: assignmentId,
    title: 'Core Concepts Application',
    topic: 'Business Analysis Core Concepts',
    instructions: `This assignment will test your understanding of Business Analysis core concepts. You will analyze scenarios and apply BA principles to demonstrate your knowledge.

**Instructions:**
- Read each question carefully
- Apply the BA concepts you've learned
- Provide clear, concise answers
- Show your understanding of current state vs future state analysis`,
    questions: [
      {
        id: 'q1',
        question: 'What is the difference between a business need and a business requirement?',
        type: 'essay',
        points: 20
      },
      {
        id: 'q2',
        question: 'In a current state vs future state analysis, what should you focus on first?',
        type: 'multiple-choice',
        options: [
          'The future state solution',
          'The current state problems',
          'The technology requirements',
          'The budget constraints'
        ],
        correctAnswer: 'The current state problems',
        points: 15
      },
      {
        id: 'q3',
        question: 'What are the key components of a value proposition in business analysis?',
        type: 'essay',
        points: 25
      },
      {
        id: 'q4',
        question: 'Which of the following best describes a stakeholder?',
        type: 'multiple-choice',
        options: [
          'Anyone affected by the project',
          'Only the project sponsor',
          'Only the end users',
          'Only the development team'
        ],
        correctAnswer: 'Anyone affected by the project',
        points: 15
      },
      {
        id: 'q5',
        question: 'Explain how you would identify assumptions and constraints in a business analysis project.',
        type: 'essay',
        points: 25
      }
    ],
    learningObjectives: [
      'Apply BA core concepts to real scenarios',
      'Distinguish between business needs and requirements',
      'Conduct current state vs future state analysis',
      'Identify value propositions and benefits'
    ],
    estimatedTime: '20-30 minutes',
    difficulty: 'beginner'
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartAssignment = () => {
    setCurrentStep('complete');
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAssignment = async () => {
    const unansweredQuestions = assignment.questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. You have ${unansweredQuestions.length} unanswered question(s).`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In real implementation, this would call the lecture service for grading
      // For now, simulate grading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate score for multiple choice questions
      let score = 0;
      const totalPoints = assignment.questions.reduce((sum, q) => sum + q.points, 0);
      
      assignment.questions.forEach(question => {
        if (question.type === 'multiple-choice' && question.correctAnswer) {
          if (answers[question.id] === question.correctAnswer) {
            score += question.points;
          }
        } else {
          // For essay questions, simulate partial credit
          const answer = answers[question.id];
          if (answer && answer.length > 50) {
            score += question.points * 0.8; // 80% for good essay answers
          } else if (answer && answer.length > 20) {
            score += question.points * 0.5; // 50% for basic answers
          }
        }
      });

      const percentage = Math.round((score / totalPoints) * 100);
      
      const mockFeedback = {
        score: percentage,
        totalPoints,
        earnedPoints: Math.round(score),
        strengths: [
          'Good understanding of BA core concepts',
          'Clear distinction between needs and requirements',
          'Systematic approach to analysis'
        ],
        areasForImprovement: [
          'Could provide more specific examples',
          'Consider adding more detail to essay responses',
          'Include practical application scenarios'
        ],
        questionFeedback: assignment.questions.map(q => ({
          id: q.id,
          question: q.question,
          userAnswer: answers[q.id],
          correctAnswer: q.correctAnswer,
          points: q.points,
          earnedPoints: q.type === 'multiple-choice' && q.correctAnswer && answers[q.id] === q.correctAnswer 
            ? q.points 
            : q.type === 'essay' && answers[q.id] && answers[q.id].length > 50 
              ? q.points * 0.8 
              : q.type === 'essay' && answers[q.id] && answers[q.id].length > 20 
                ? q.points * 0.5 
                : 0
        })),
        overallFeedback: `You scored ${percentage}% on this assignment. ${percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good effort!' : 'Keep practicing!'} You demonstrate a solid understanding of Business Analysis core concepts.`
      };
      
      setFeedback(mockFeedback);
      setCurrentStep('feedback');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAssignment = () => {
    // Mark assignment as completed
    // In real implementation, this would update progress tracking
    setCurrentView('advanced-topics'); // Return to assessments
  };

  const renderQuestion = (question: AssignmentQuestion) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'essay':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Write your answer here..."
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        );
    }
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                {assignment.difficulty}
              </span>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{assignment.estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {assignment.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Topic: {assignment.topic}
          </p>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span className="text-sm">Learning Objectives</span>
            </div>
          </div>
          
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {assignment.learningObjectives.map((objective, index) => (
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
              <span className="text-sm font-medium">Read Instructions</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-purple-600' : currentStep === 'feedback' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-purple-600 text-white' : currentStep === 'feedback' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'feedback' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'feedback' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'read' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment Instructions
            </h3>
            
            <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: assignment.instructions.replace(/\n/g, '<br/>') }} />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Assignment Overview</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• {assignment.questions.length} questions</li>
                <li>• Total points: {assignment.questions.reduce((sum, q) => sum + q.points, 0)}</li>
                <li>• Estimated time: {assignment.estimatedTime}</li>
                <li>• You must answer all questions to submit</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStartAssignment}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Assignment
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Assignment Questions
            </h3>
            
            <div className="space-y-8">
              {assignment.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {question.points} points
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {question.question}
                  </p>
                  
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentStep('read')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Back to Instructions
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
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
                  Your Results
                </h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {feedback.score}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Points Earned</span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feedback.earnedPoints}/{feedback.totalPoints}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Performance</span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feedback.score >= 80 ? 'Excellent' : feedback.score >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
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

            {/* Question-by-Question Feedback */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-md font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Question Details
              </h4>
              <div className="space-y-4">
                {feedback.questionFeedback.map((qf, index) => (
                  <div key={qf.id} className="border-l-4 border-gray-200 dark:border-gray-600 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {qf.earnedPoints}/{qf.points} points
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {qf.question}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your answer: {qf.userAnswer}
                    </p>
                    {qf.correctAnswer && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Correct answer: {qf.correctAnswer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
                className="px-4 py-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                {showCorrectAnswers ? 'Hide' : 'Show'} Correct Answers
              </button>
              <button
                onClick={handleCompleteAssignment}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentView;














