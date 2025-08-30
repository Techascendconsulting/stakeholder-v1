import React, { useState } from 'react';
import { CoachingCard, PainPoint, SessionState } from '../types/training';
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  FileText, 
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Target,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

interface CoachingPanelProps {
  currentCard: CoachingCard | null;
  sessionState: SessionState | null;
  painPoints: PainPoint[];
  onCardChange: (cardId: string) => void;
  onPainPointUpdate: (painPoint: PainPoint) => void;
  onAddPainPoint: (painPoint: Omit<PainPoint, 'id'>) => void;
}

const CoachingPanel: React.FC<CoachingPanelProps> = ({
  currentCard,
  sessionState,
  painPoints,
  onCardChange,
  onPainPointUpdate,
  onAddPainPoint
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'dig-deeper' | 'interpret' | 'notes' | 'checklist'>('guide');

  const tabs = [
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'dig-deeper', label: 'Dig Deeper', icon: Search },
    { id: 'interpret', label: 'Interpret', icon: Lightbulb },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare }
  ];

  const renderGuideTab = () => (
    <div className="space-y-4">
      {currentCard && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentCard.skill}
              </span>
            </div>
            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
              {sessionState?.phaseProgress || 0}/{sessionState?.totalPhases || 1}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {currentCard.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {currentCard.description}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Why This Matters
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {currentCard.whyItMatters}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              How to Ask
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              {currentCard.howToAsk}
            </p>
            <div className="space-y-1">
              {currentCard.examplePhrases.map((phrase, index) => (
                <div key={index} className="text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  "{phrase}"
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Listen For
            </h4>
            <div className="flex flex-wrap gap-1">
              {currentCard.whatToListenFor.map((item, index) => (
                <span key={index} className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {sessionState && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Session Progress
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Current Phase:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {sessionState.currentPhase.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {sessionState.phaseProgress} / {sessionState.totalPhases}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(sessionState.phaseProgress / sessionState.totalPhases) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDigDeeperTab = () => (
    <div className="space-y-4">
      {currentCard && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Dig Deeper Options
          </h3>
          <div className="space-y-2">
            {currentCard.digDeeperOptions.map((option, index) => (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  "{option}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInterpretTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          What Their Answers Mean
        </h3>
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              🎯 Good Signs
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Specific examples and details</li>
              <li>• Emotional responses (shows engagement)</li>
              <li>• Quantified impact (time, frequency)</li>
              <li>• Multiple stakeholders affected</li>
            </ul>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              ⚠️ Warning Signs
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Vague or general responses</li>
              <li>• No specific examples</li>
              <li>• Defensive or dismissive tone</li>
              <li>• Unwilling to elaborate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Session Notes
        </h3>
        <div className="space-y-2">
          {sessionState?.sessionNotes.map((note, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">{note}</p>
            </div>
          ))}
          {(!sessionState?.sessionNotes || sessionState.sessionNotes.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No notes yet. Add notes as you discover important information.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderChecklistTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Phase Checklist
        </h3>
        <div className="space-y-3">
          {sessionState?.currentPhase === 'problem_exploration' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Greeting and context established</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">2-3 pain points identified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Impact quantified (time/frequency)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Priority pain point selected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Pain Points Board
        </h3>
        <div className="space-y-3">
          {painPoints.map((painPoint) => (
            <div key={painPoint.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {painPoint.description}
                </h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  painPoint.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  painPoint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {painPoint.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div>Affected: {painPoint.whoIsAffected}</div>
                <div>Frequency: {painPoint.frequency}</div>
                <div>Impact: {painPoint.impact}</div>
                <div>Status: {painPoint.confirmed ? 'Confirmed' : 'Draft'}</div>
              </div>
            </div>
          ))}
          {painPoints.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No pain points identified yet. Add them as you discover issues.
            </p>
          )}
        </div>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Coaching Panel
          </h2>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {sessionState?.currentPhase.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        {sessionState && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(sessionState.phaseProgress / sessionState.totalPhases) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
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
