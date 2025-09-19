import React from 'react';
import { Target, Search, LineChart, Lightbulb, CheckSquare } from 'lucide-react';

interface StageSelectorProps {
  data: {
    selectedStage: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({ data, onUpdate, onNext }) => {
  const stages = [
    {
      id: 'kickoff',
      number: 1,
      title: 'Kickoff',
      description: 'Introduce project, align expectations, clarify scope',
      subtext: 'Start here to set context and rapport',
      preview: 'Introduce project, align expectations, clarify scope.',
      icon: Target
    },
    {
      id: 'problem',
      number: 2,
      title: 'Problem Exploration',
      description: 'Understand pain points, inefficiencies, blockers',
      subtext: 'Probe for problems and constraints',
      preview: 'Uncover pain points, inefficiencies, and blockers.',
      icon: Search
    },
    {
      id: 'as_is',
      number: 3,
      title: 'As-Is Process',
      description: 'Document current state: steps, systems, actors, timelines',
      subtext: 'Map current processes and responsibilities',
      preview: 'Map the current process, actors, tools, and timing.',
      icon: LineChart
    },
    {
      id: 'to_be',
      number: 4,
      title: 'To-Be Discussion',
      description: 'Capture improvement ideas, future goals (before solutioning)',
      subtext: 'Discuss outcomes and future state goals',
      preview: 'Capture ideas for future improvements before solutioning.',
      icon: Lightbulb
    },
    {
      id: 'solution',
      number: 5,
      title: 'Solution Design',
      description: 'Facilitate options, validate feasibility, discuss constraints',
      subtext: 'Explore feasible options and trade-offs',
      preview: 'Facilitate options, validate feasibility, discuss constraints.',
      icon: CheckSquare
    }
  ];

  // Color tokens to match the screenshot while keeping current layout/structure
  const STAGE_STYLES: Record<string, {
    gradientFrom: string;
    iconBg: string;
    badgeBorder: string;
    badgeText: string;
    badgeBg: string;
  }> = {
    kickoff:  { gradientFrom: 'from-violet-50',  iconBg: 'bg-violet-600',  badgeBorder: 'border-violet-200',  badgeText: 'text-violet-700',  badgeBg: 'bg-violet-50' },
    problem:  { gradientFrom: 'from-blue-50',    iconBg: 'bg-blue-600',    badgeBorder: 'border-blue-200',    badgeText: 'text-blue-700',    badgeBg: 'bg-blue-50' },
    as_is:    { gradientFrom: 'from-amber-50',   iconBg: 'bg-amber-500',   badgeBorder: 'border-amber-200',   badgeText: 'text-amber-700',   badgeBg: 'bg-amber-50' },
    to_be:    { gradientFrom: 'from-cyan-50',    iconBg: 'bg-cyan-600',    badgeBorder: 'border-cyan-200',    badgeText: 'text-cyan-700',    badgeBg: 'bg-cyan-50' },
    solution: { gradientFrom: 'from-emerald-50', iconBg: 'bg-emerald-600', badgeBorder: 'border-emerald-200', badgeText: 'text-emerald-700', badgeBg: 'bg-emerald-50' }
  };

  const handleSelect = (stageId: string) => {
    onUpdate({ selectedStage: stageId });
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-3">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Meeting Stage</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose which stage of the stakeholder interview you want to practice
        </p>
      </div>

      {/* Stage Cards - retain card design, use 2-column layout with screenshot colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stages.map((stage) => {
          const isActive = data.selectedStage === stage.id;
          const styles = STAGE_STYLES[stage.id] || STAGE_STYLES.kickoff;
          const isDisabled = stage.id === 'kickoff';
          return (
            <StageCard
              key={stage.id}
              stage={stage}
              styles={styles}
              isActive={isActive}
              disabled={isDisabled}
              onSelect={() => handleSelect(stage.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Lightweight tooltip/preview per card (hover/tap) using existing tokens
const StageCard: React.FC<{
  stage: any;
  styles: any;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
}> = ({ stage, styles, isActive, onSelect, disabled = false }) => {
  const [hovered, setHovered] = React.useState(false);
  const showPreview = hovered;

  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      className={`relative w-full text-left p-6 rounded-lg border-2 transition-all bg-gradient-to-br ${styles.gradientFrom} to-white dark:from-gray-800 dark:to-gray-700 shadow-sm ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-600'
          : 'hover:shadow-md'
      } ${
        isActive && !disabled
          ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500'
          : !disabled
          ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
          : ''
      }`}
      aria-pressed={isActive}
    >
      {disabled && (
        <div className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
          Coming soon
        </div>
      )}
      {isActive && (
        <div className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white shadow">
          Selected
        </div>
      )}

      {/* Preview tooltip */}
      {showPreview && (
        <div className="absolute -top-2 right-4 translate-y-[-100%] z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm shadow-md max-w-xs pointer-events-none">
          <div className="font-semibold text-gray-900 dark:text-white mb-0.5">{stage.title}</div>
          <div className="text-gray-600 dark:text-gray-300">{stage.preview}</div>
        </div>
      )}

      <div className="flex items-start">
        <div className={`flex-shrink-0 w-8 h-8 ${styles.iconBg} text-white rounded-lg flex items-center justify-center mr-4`}>
          <span className="font-medium">{stage.number}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <stage.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{stage.title}</h3>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{stage.description}</p>
          <span className={`mt-3 inline-flex items-center text-xs px-2 py-1 rounded-full border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>{stage.subtext}</span>
        </div>
      </div>
    </button>
  );
};

export default StageSelector;
