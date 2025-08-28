import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, TrendingUp, AlertCircle, Target, MessageSquare, Lightbulb, ArrowLeft, RefreshCw, BarChart3, PieChart, Activity, BookOpen } from 'lucide-react';
import { trainingService, DebriefResult } from '../../services/trainingService';

interface TrainingFeedbackViewProps {
  sessionId: string;
  stageId: string;
  mode: 'practice' | 'assess';
  onBack: () => void;
  onRetake?: () => void;
}

// Progress Bar Component
const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string; showPercentage?: boolean }> = ({ 
  value, 
  max, 
  color, 
  label, 
  showPercentage = true 
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <span>{title}</span>
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {Math.round(item.value)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ease-out ${item.color}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Score Card Component
const ScoreCard: React.FC<{ title: string; score: number; icon: React.ReactNode; color: string }> = ({ 
  title, 
  score, 
  icon, 
  color 
}) => {
  const percentage = Math.round(score * 100);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="flex items-end space-x-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{percentage}</span>
        <span className="text-lg text-gray-500 dark:text-gray-400 mb-1">%</span>
      </div>
      
      <div className="mt-3">
        <ProgressBar 
          value={score} 
          max={1} 
          color={color} 
          label="" 
          showPercentage={false}
        />
      </div>
    </div>
  );
};

export default function TrainingFeedbackView({ 
  sessionId, 
  stageId, 
  mode, 
  onBack, 
  onRetake 
}: TrainingFeedbackViewProps) {
  const [feedback, setFeedback] = useState<DebriefResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [sessionId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get existing debrief first
      let result: DebriefResult;
      try {
        result = await trainingService.getDebrief(sessionId);
      } catch {
        // If no debrief exists, generate one
        result = await trainingService.generateDebrief(sessionId, mode);
      }
      
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Generating your detailed feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Feedback Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadFeedback}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  const { 
    coverageScores, 
    technique, 
    independence, 
    overall, 
    passed, 
    coveredAreas, 
    missedAreas, 
    nextTimeScripts 
  } = feedback;

  console.log('📊 Feedback data for charts:', {
    coverageScores,
    technique,
    independence,
    overall,
    passed
  });

  const avgCoverage = Object.values(coverageScores || {}).reduce((a, b) => a + (b || 0), 0) / Math.max(Object.keys(coverageScores || {}).length, 1);
  const avgIndependence = Object.values(independence || {}).reduce((a, b) => a + (b || 0), 0) / Math.max(Object.keys(independence || {}).length, 1);
  const techniqueComposite = 0.4 * (technique?.openRatio || 0) + 0.3 * (technique?.followUp || 0) + 0.3 * (technique?.talkBalance || 0);

  // Prepare data for charts
  const coverageData = Object.entries(coverageScores || {}).map(([key, value]) => ({
    label: (key || 'unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: Math.round((value || 0) * 100),
    color: (value || 0) >= 0.8 ? 'bg-green-500' : (value || 0) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
  }));

  const techniqueData = [
    { label: 'Open Questions', value: Math.round((technique?.openRatio || 0) * 100), color: 'bg-blue-500' },
    { label: 'Follow-ups', value: Math.round((technique?.followUp || 0) * 100), color: 'bg-purple-500' },
    { label: 'Talk Balance', value: Math.round((technique?.talkBalance || 0) * 100), color: 'bg-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Training Hub</span>
          </button>
          
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
              passed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-pink-500'
            }`}>
              {passed ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {passed ? 'Excellent Work!' : 'Keep Improving!'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {passed 
                ? 'You\'ve demonstrated strong Business Analyst skills in this session.' 
                : 'You\'re on the right track! Review the detailed feedback below to enhance your performance.'
              }
            </p>
          </div>
        </div>

        {/* Main Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            title="Overall Score"
            score={overall}
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            color="#3B82F6"
          />
          <ScoreCard
            title="Coverage"
            score={avgCoverage}
            icon={<Target className="w-6 h-6 text-green-600" />}
            color="#10B981"
          />
          <ScoreCard
            title="Technique"
            score={techniqueComposite}
            icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
            color="#8B5CF6"
          />
          <ScoreCard
            title="Independence"
            score={avgIndependence}
            icon={<Activity className="w-6 h-6 text-orange-600" />}
            color="#F59E0B"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <BarChart 
            data={coverageData} 
            title="Coverage by Area" 
          />
          <BarChart 
            data={techniqueData} 
            title="Technique Breakdown" 
          />
        </div>

        {/* Coverage Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Covered Areas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Areas Covered Well</span>
            </h3>
            <div className="space-y-3">
              {(coveredAreas || []).length > 0 ? (
                (coveredAreas || []).map((area, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {(area || 'unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No areas were covered well in this session.</p>
              )}
            </div>
          </div>

          {/* Missed Areas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Areas to Improve</span>
            </h3>
            <div className="space-y-3">
              {(missedAreas || []).length > 0 ? (
                (missedAreas || []).map((area, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {(area || 'unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Great job! All areas were covered well.</p>
              )}
            </div>
          </div>
        </div>

        {/* Coaching Section - Closed Questions */}
        {feedback?.coaching?.closedExamples && feedback.coaching.closedExamples.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span>Question Improvement Tips</span>
            </h3>
            <div className="space-y-4">
              {feedback.coaching.closedExamples.slice(0, 3).map((example: any, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">You asked:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 italic">"{example.original}"</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Try asking:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">"{example.rewrite}"</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaching Section - Mini Lessons */}
        {feedback?.coaching?.miniLessons && feedback.coaching.miniLessons.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Why These Areas Matter</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.coaching.miniLessons.map((lesson: any, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {(lesson.key || 'unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{lesson.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Next Time Scripts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span>Next Time Scripts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(feedback?.coaching?.nextTimeScripts || nextTimeScripts || []).map((script, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{script || 'No script available'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Back to Training Hub
          </button>
          {onRetake && (
            <button
              onClick={onRetake}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Try Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
