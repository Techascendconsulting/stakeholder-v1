import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Cluster1QuizStepProps {
  onComplete: (score: number) => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questions: QuizQuestion[] = [
  {
    id: '1',
    question: 'Which department is most likely to care about compliance and regulatory requirements?',
    options: [
      'Sales & Marketing',
      'Finance',
      'Operations',
      'IT/Technology'
    ],
    correct: 1,
    explanation: 'Finance departments typically handle compliance, regulatory reporting, and ensuring the business meets legal requirements.'
  },
  {
    id: '2',
    question: 'What is the primary reason businesses need Business Analysts?',
    options: [
      'To write code faster',
      'To bridge the communication gap between business and technology',
      'To manage project budgets',
      'To design user interfaces'
    ],
    correct: 1,
    explanation: 'BAs exist primarily to bridge the communication gap between business stakeholders and technical teams, ensuring solutions actually solve business problems.'
  },
  {
    id: '3',
    question: 'In which project phase do BAs typically spend the most time gathering requirements?',
    options: [
      'Initiation',
      'Planning',
      'Execution',
      'Closure'
    ],
    correct: 1,
    explanation: 'The Planning phase is where BAs conduct detailed requirements gathering, stakeholder interviews, and process analysis.'
  },
  {
    id: '4',
    question: 'What is the most common cause of project failure?',
    options: [
      'Technical complexity',
      'Unclear or changing requirements',
      'Budget constraints',
      'Team conflicts'
    ],
    correct: 1,
    explanation: 'Unclear or changing requirements are the leading cause of project failure, which is exactly what BAs help prevent through proper requirements gathering and management.'
  },
  {
    id: '5',
    question: 'Which of the following is NOT a typical responsibility of a Business Analyst?',
    options: [
      'Writing detailed requirements',
      'Facilitating stakeholder communication',
      'Writing production code',
      'Testing solutions against requirements'
    ],
    correct: 2,
    explanation: 'BAs don\'t typically write production code - they focus on requirements, communication, and ensuring solutions meet business needs.'
  }
];

export const Cluster1QuizStep: React.FC<Cluster1QuizStepProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleComplete = () => {
    const score = calculateScore();
    setQuizCompleted(true);
    onComplete(score);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const score = calculateScore();
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
          <div className="text-6xl font-bold text-green-600 mb-2">{score}%</div>
          <p className="text-lg text-gray-600">
            {score >= 80 ? 'Excellent! You have a solid understanding of business fundamentals.' :
             score >= 60 ? 'Good job! You understand the basics well.' :
             'Keep learning! Review the content and try again.'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Results</h3>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correct;
              return (
                <div key={question.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{question.question}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {selectedAnswers[index] >= 0 ? question.options[selectedAnswers[index]] : 'Not answered'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600 mb-2">
                          Correct answer: <span className="text-green-700">{question.options[question.correct]}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-700">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={resetQuiz}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors mr-4"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retake Quiz
          </button>
          <button
            onClick={handleComplete}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Cluster 2
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h2>
          <div className="text-6xl font-bold text-blue-600 mb-2">{score}%</div>
          <p className="text-lg text-gray-600">
            You got {questions.filter((q, i) => selectedAnswers[i] === q.correct).length} out of {questions.length} questions correct.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Review</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correct;
              return (
                <div key={question.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {question.options[selectedAnswers[index]]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600 mb-1">
                          Correct answer: <span className="text-green-700">{question.options[question.correct]}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-700">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={resetQuiz}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors mr-4"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retake Quiz
          </button>
          <button
            onClick={handleComplete}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Cluster 2
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Fundamentals Quiz</h2>
        <p className="text-lg text-gray-600">
          Test your understanding of business context, BA role, and project lifecycle.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQ.question}</h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === -1}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedAnswers[currentQuestion] === -1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
        </button>
      </div>
    </div>
  );
};
