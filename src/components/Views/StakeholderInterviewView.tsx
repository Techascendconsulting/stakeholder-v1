import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Download } from 'lucide-react';
import StakeholderInterviewPanel from '../StakeholderInterviewPanel';
import { 
  createInitialSession, 
  transitionToNext, 
  addPainPoint, 
  addSessionNote,
  StakeholderInterviewSession 
} from '../../services/stakeholderInterviewReducer';

const StakeholderInterviewView: React.FC = () => {
  const [session, setSession] = useState<StakeholderInterviewSession>(createInitialSession());
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleNext = () => {
    setSession(prevSession => transitionToNext(prevSession));
  };

  const handleSendSummary = (summary: string) => {
    console.log('Summary sent:', summary);
    // In a real implementation, this would send the summary to the chat
  };

  const handleAddPainPoint = (painPoint: { text: string; who: string; example?: string }) => {
    setSession(prevSession => addPainPoint(prevSession, painPoint));
  };

  const handleAddSessionNote = (category: string, note: string) => {
    setSession(prevSession => addSessionNote(prevSession, category, note));
  };

  const resetSession = () => {
    setSession(createInitialSession());
  };

  const exportSession = () => {
    const sessionData = {
      ...session,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stakeholder-interview-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Stakeholder Interview Practice
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Guided interview framework for business analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={resetSession}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Reset Session"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={exportSession}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Export Session"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  isDemoMode 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isDemoMode ? <Pause size={14} /> : <Play size={14} />}
                <span className="ml-1">{isDemoMode ? 'Demo Active' : 'Demo Mode'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Chat/Interview Area */}
          <div className="flex-1 flex flex-col">
            {/* Demo Instructions */}
            {isDemoMode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700 p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <Play size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Demo Mode Active
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      This is a demonstration of the stakeholder interview framework. 
                      Use the coaching panel on the right to guide your interview process.
                      The framework includes 8 structured phases from warm-up to wrap-up.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interview Content */}
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Stakeholder Interview Session
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Use the coaching panel on the right to guide your interview through 8 structured phases:
                    </p>
                    
                    {/* Phase Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {Object.entries({
                        'warm_up': 'Warm-up',
                        'problem_exploration': 'Problem Exploration', 
                        'impact': 'Impact',
                        'prioritisation': 'Prioritisation',
                        'root_cause': 'Root Cause',
                        'success_criteria': 'Success Criteria',
                        'constraints': 'Constraints',
                        'wrap_up': 'Wrap-up'
                      }).map(([key, label]) => (
                        <div 
                          key={key}
                          className={`p-3 rounded-lg border-2 text-sm font-medium ${
                            session.state === key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : session.completedStates.includes(key)
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Current Phase Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Current Phase: {session.state.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Progress: {session.progress}% complete
                      </p>
                    </div>

                    {/* Session Data Preview */}
                    {session.data.pain_points.length > 0 && (
                      <div className="mt-6 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Captured Information
                        </h3>
                        <div className="space-y-3">
                          {session.data.pain_points.map((pain, index) => (
                            <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                Pain Point {index + 1}: {pain.text}
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                Affects: {pain.who}
                              </p>
                              {pain.example && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  Example: {pain.example}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {session.data.priority_choice && (
                      <div className="mt-4 text-left">
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            Priority Focus: {session.data.priority_choice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coaching Panel */}
          <StakeholderInterviewPanel
            session={session}
            onNext={handleNext}
            onSendSummary={handleSendSummary}
            onAddPainPoint={handleAddPainPoint}
            onAddSessionNote={handleAddSessionNote}
          />
        </div>
      </div>
    </div>
  );
};

export default StakeholderInterviewView;
