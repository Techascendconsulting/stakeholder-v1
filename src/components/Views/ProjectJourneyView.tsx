import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

type StageId =
  | 'choose-project'
  | 'project-brief'
  | 'initiation-stakeholders'
  | 'process-mapping'
  | 'solution-options'
  | 'requirement-spec'
  | 'delivery-loop';

type Stage = {
  id: StageId;
  title: string;
  description: string;
  view?: string; // existing view to open
  // optional deep-links rendered as buttons inside the stage detail
  links?: { label: string; view: string }[];
};

const STORAGE_KEY = 'projectJourneyProgress';

const stages: Stage[] = [
  {
    id: 'choose-project',
    title: 'Choose Project',
    description: 'Pick a hands-on project to work on (not practice projects).',
    view: 'projects',
  },
  {
    id: 'project-brief',
    title: 'Project Brief',
    description: 'Review objectives, scope and constraints for your selected project.',
    view: 'project-brief',
  },
  {
    id: 'initiation-stakeholders',
    title: 'Initiation & Stakeholders',
    description: 'Confirm context and select the stakeholders for elicitation and kickoff.',
    // We keep initiation lightweight and hand-off to stakeholder selection
    links: [
      { label: 'Project Initiation', view: 'project-initiation' },
      { label: 'Select Stakeholders', view: 'stakeholders' },
      { label: 'Start Voice Meeting', view: 'meeting-mode-selection' },
    ],
  },
  {
    id: 'process-mapping',
    title: 'Process Mapping',
    description: 'Map the current process to reveal blockers and handoffs.',
    view: 'process-mapper',
  },
  {
    id: 'solution-options',
    title: 'Solution Options',
    description: 'Compare options using evidence from elicitation and process analysis.',
    view: 'solution-options',
  },
  {
    id: 'requirement-spec',
    title: 'Requirement Specification',
    description: 'Write user stories and acceptance criteria; manage them in Agile Hub.',
    links: [
      { label: 'Open Agile Hub', view: 'agile-scrum' },
      { label: 'Requirement Specification Practice', view: 'documentation-practice' },
    ],
  },
  {
    id: 'delivery-loop',
    title: 'Delivery Loop',
    description: 'Backlog Refinement and Continuous Delivery in Scrum Practice.',
    links: [
      { label: 'Scrum Practice', view: 'scrum-practice' },
      { label: 'Backlog Refinement', view: 'scrum-practice' },
    ],
  },
];

type Persisted = {
  currentIndex: number;
  completed: StageId[];
};

const readProgress = (): Persisted => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentIndex: 0, completed: [] };
    const parsed = JSON.parse(raw);
    return {
      currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    };
  } catch {
    return { currentIndex: 0, completed: [] };
  }
};

const writeProgress = (progress: Persisted) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
};

const ProjectJourneyView: React.FC = () => {
  const { setCurrentView, selectedProject } = useApp();
  const [progress, setProgress] = useState<Persisted>(() => readProgress());

  useEffect(() => {
    writeProgress(progress);
  }, [progress]);

  const currentStage = useMemo(() => stages[Math.min(progress.currentIndex, stages.length - 1)], [progress.currentIndex]);

  const jumpTo = (index: number) => setProgress(p => ({ ...p, currentIndex: index }));
  const markCompleteAndNext = (index: number) => {
    const stage = stages[index];
    setProgress(p => {
      const completed = Array.from(new Set([...(p.completed || []), stage.id]));
      const nextIndex = Math.min(index + 1, stages.length - 1);
      return { currentIndex: nextIndex, completed };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Journey</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProject?.name || 'No project selected'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left rail */}
        <aside className="lg:col-span-1 space-y-2">
          {stages.map((s, i) => {
            const isActive = i === progress.currentIndex;
            const isDone = progress.completed.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => jumpTo(i)}
                className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="font-medium">{i + 1}. {s.title}</span>
                {isDone ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </aside>

        {/* Stage content */}
        <section className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentStage.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{currentStage.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = stages.findIndex(s => s.id === currentStage.id);
                    markCompleteAndNext(idx);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </button>
                {currentStage.view && (
                  <button
                    onClick={() => setCurrentView(currentStage.view!)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Play className="w-4 h-4" />
                    Open Stage
                  </button>
                )}
              </div>
            </div>

            {/* Deep links */}
            {currentStage.links && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentStage.links.map(link => (
                  <button
                    key={link.label}
                    onClick={() => setCurrentView(link.view)}
                    className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{link.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Opens {link.view}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectJourneyView;


