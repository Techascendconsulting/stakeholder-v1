import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  FileText, 
  CheckSquare,
  ChevronRight,
  Send
} from 'lucide-react';
import { CoachingSession, getCurrentState, canTransitionToNext, generateSummary } from '../services/coachingStateReducer';
import { coachingStateMachine } from '../data/coachingStates';

interface CoachingPanelProps {
  session: CoachingSession;
  onNext: () => void;
  onSendSummary: (summary: string) => void;
  onAddPainPoint: (painPoint: { text: string; who: string; example?: string }) => void;
  onAddSessionNote: (category: string, note: string) => void;
}

const CoachingPanel: React.FC<CoachingPanelProps> = ({
  session,
  onNext,
  onSendSummary,
  onAddPainPoint,
  onAddSessionNote
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'dig-deeper' | 'interpret' | 'notes' | 'checklist'>('guide');
  const [summaryText, setSummaryText] = useState('');

  const currentState = getCurrentState(session);
  if (!currentState) return null;

  const tabs = [
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'dig-deeper', label: 'Dig Deeper', icon: Search },
    { id: 'interpret', label: 'Interpret', icon: Lightbulb },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare }
  ] as const;

  const renderGuideTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {currentState.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {currentState.goal}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Primary Question</h4>
          <p className="text-blue-800 dark:text-blue-200 text-sm">{currentState.cards.guide.prompt}</p>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Why this matters</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{currentState.cards.guide.why}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">How to ask</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{currentState.cards.guide.how}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Next step</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{currentState.cards.guide.next_transition_hint}</p>
          </div>
        </div>
      </div>

      {/* Summarize So Far Feature */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Summarize So Far</h4>
        <textarea
          value={summaryText || generateSummary(session)}
          onChange={(e) => setSummaryText(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          rows={4}
          placeholder="Summarize what you've learned so far..."
        />
        <button
          onClick={() => onSendSummary(summaryText || generateSummary(session))}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Send size={16} />
          <span>Confirm & Send</span>
        </button>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canTransitionToNext(session)}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );

  const renderDigDeeperTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Follow-up Questions</h3>
        <div className="space-y-3">
          {currentState.cards.dig_deeper.map((question, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-900 dark:text-white mb-2">{question.prompt}</p>
              {question.when.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  When: {question.when.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInterpretTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What to Look For</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-300 text-sm mb-2">Good Signs</h4>
            <ul className="space-y-1">
              {currentState.cards.interpret.good_signs.map((sign, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 dark:text-red-300 text-sm mb-2">Warning Signs</h4>
            <ul className="space-y-1">
              {currentState.cards.interpret.warning_signs.map((sign, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-2">Listen For</h4>
            <ul className="space-y-1">
              {currentState.cards.interpret.what_to_listen_for.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 mr-2">👂</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Notes</h3>
        
        <div className="space-y-4">
          {currentState.cards.notes_template.map((template, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {template}
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={2}
                placeholder={`Add ${template.toLowerCase()}...`}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    onAddSessionNote('session_notes', `${template} ${e.target.value}`);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChecklistTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Phase Checklist</h3>
        
        <div className="space-y-3">
          {Object.entries(coachingStateMachine.states).map(([stateId, state]) => (
            <div key={stateId} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                session.completedStates.includes(stateId)
                  ? 'bg-green-500 border-green-500'
                  : session.state === stateId
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {session.completedStates.includes(stateId) && (
                  <span className="text-white text-xs">✓</span>
                )}
                {session.state === stateId && !session.completedStates.includes(stateId) && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${
                session.completedStates.includes(stateId)
                  ? 'text-green-700 dark:text-green-300 line-through'
                  : session.state === stateId
                  ? 'text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {(state as any).title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points Board */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pain Points Board</h3>
        
        {session.data.pain_points.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No pain points captured yet.</p>
        ) : (
          <div className="space-y-3">
            {session.data.pain_points.map((painPoint, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">{painPoint.text}</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Affects: {painPoint.who}</p>
                {painPoint.example && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Example: {painPoint.example}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'guide':
        return renderGuideTab();
      case 'dig-deeper':
        return renderDigDeeperTab();
      case 'interpret':
        return renderInterpretTab();
      case 'notes':
        return renderNotesTab();
      case 'checklist':
        return renderChecklistTab();
      default:
        return renderGuideTab();
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Coaching Panel</h2>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{session.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CoachingPanel;
