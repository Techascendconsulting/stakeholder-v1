import React, { useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_9_DATA } from './page9-data';
import {
  PageShell,
  PageTitle,
  Section,
  NavigationButtons,
} from './common';
import { baInActionViewToPath, getBaInActionNavigation } from './config';
import {
  Clock,
  Target,
  RefreshCw,
  MessageSquare,
  Calendar,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Users,
  Lightbulb,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_continuous_development';

const HERO_IMAGE = '/images/collaborate1.jpg';

// --- Progress Tracking Hook ---
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-continuous-dev-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-continuous-dev-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-continuous-dev-progress', JSON.stringify(updated));
      return updated;
    });
  };

  return { progress, markComplete, markIncomplete };
}

// --- Progress Tracker Component ---
const ProgressTracker: React.FC<{
  progress: {[k: string]: boolean};
  activeSection: string | null;
  onStepClick: (stepId: string) => void;
  onToggle: (step: string, completed: boolean) => void;
}> = ({ progress, activeSection, onStepClick, onToggle }) => {
  const steps = [
    { id: 'why_matters', label: 'Why This Matters', icon: Target, sectionId: 'why_section' },
    { id: 'sprint_scenarios', label: 'Sprint Scenarios: Going Back to Stakeholders', icon: RefreshCw, sectionId: 'scenarios_section' },
    { id: 'scrum_meetings', label: 'Scrum Meetings: What BAs Do', icon: Calendar, sectionId: 'scrum_section' },
    { id: 'edge_cases', label: 'Edge Cases & Requirements Evolution', icon: AlertTriangle, sectionId: 'edge_cases_section' },
  ];

  const total = steps.length;
  const completed = steps.filter(s => progress[s.id]).length;
  const percentage = (completed / total) * 100;

  return (
    <div className="bg-white border border-blue-600/20 rounded-2xl shadow-lg p-6 mb-8 bg-gradient-to-br from-white to-blue-600/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-base font-bold text-slate-900 mb-1">Your BA Journey</div>
          <div className="text-xs text-slate-600">{completed} of {total} steps completed</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-3 bg-blue-600/10 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-blue-600 min-w-[3rem]">{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const completed = progress[step.id];
          const isActive = activeSection === step.sectionId;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(step.id, !completed);
                }}
                className="flex-shrink-0"
              >
                {completed ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <Circle size={18} className="text-slate-400" />
                )}
              </button>
              <button
                onClick={() => onStepClick(step.sectionId)}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-2 border-blue-600 shadow-md hover:shadow-lg' 
                    : completed 
                      ? 'bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 hover:shadow-md' 
                      : 'bg-slate-50 border border-slate-200 hover:bg-blue-600/5 hover:border-blue-600/30 hover:shadow-sm'
                }`}
              >
                <Icon size={18} className={`transition-all duration-300 ${completed ? 'text-emerald-600' : isActive ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                <span className={`text-sm flex-1 font-medium ${completed ? 'text-emerald-900 line-through' : isActive ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <ChevronDown size={14} className="text-slate-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Collapsible Section Wrapper ---
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ElementType;
  completed?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  onToggleComplete?: (completed: boolean) => void;
  sectionId?: string;
}> = ({ title, icon: Icon, completed = false, isOpen: controlledIsOpen, onToggle, children, onToggleComplete, sectionId }) => {
  return (
    <div className="bg-white border-2 border-blue-600/20 rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-600/5 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={`${completed ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span className={`text-base font-bold ${completed ? 'text-emerald-900' : 'text-slate-900'}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onToggleComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(!completed);
              }}
              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              {completed ? 'Mark incomplete' : 'Mark complete'}
            </button>
          )}
          {controlledIsOpen ? (
            <ChevronDown size={18} className="text-slate-400" />
          ) : (
            <ChevronRight size={18} className="text-slate-400" />
          )}
        </div>
      </button>
      {controlledIsOpen && (
        <div className="border-t border-blue-600/20 animate-in slide-in-from-top-2 fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Glossary Sidebar Component ---
const GlossarySidebar: React.FC<{ project: 'cif' | 'voids'; pageKey: string }> = ({ project, pageKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const terms = getGlossaryTerms(project, pageKey);

  if (terms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-blue-600/30 rounded-2xl shadow-lg overflow-hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-600/5 transition-all duration-200 bg-blue-600/5"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-600" />
          <span className="text-lg font-bold text-slate-900">Key Terms</span>
          <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-full">
            {terms.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-blue-600" />
        ) : (
          <ChevronRight size={18} className="text-blue-600" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-blue-600/20 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {terms.map((item, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="font-semibold text-sm text-slate-900 mb-1">{item.term}</div>
                <div className="text-xs text-slate-700 leading-relaxed">{item.definition}</div>
                {item.context && (
                  <div className="text-xs text-blue-600 mt-1 italic">{item.context}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- BA Journey Sidebar ---
const BAJourneySidebar: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 border-2 border-blue-600 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-8">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/images/collaborate1.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-white" />
          <div className="text-base font-bold text-white">A BA's Approach During Sprints</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-white/90 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Attend all Scrum meetings</div>
                <div className="text-white/80 text-xs mt-0.5">Backlog Refinement, Sprint Planning, Daily Standup, Sprint Review</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white/90 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Answer developer questions</div>
                <div className="text-white/80 text-xs mt-0.5">When you know the answer, provide it. When you don't, commit to getting it</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white/90 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Go back to stakeholders</div>
                <div className="text-white/80 text-xs mt-0.5">Edge cases appear, questions arise - you reach out for answers</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white/90 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Update requirements</div>
                <div className="text-white/80 text-xs mt-0.5">Document what you learn, update ACs, create new stories if needed</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white/90 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Capture stakeholder feedback</div>
                <div className="text-white/80 text-xs mt-0.5">In Sprint Review, translate feedback into requirements for next sprint</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You <strong>don't know everything upfront</strong>. Questions will arise. Edge cases will appear. Your job is to <strong>go back to stakeholders, get answers, and update requirements</strong>. This is how Agile works.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContinuousDevelopment: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page9Data = PAGE_9_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const { progress, markComplete, markIncomplete } = useProgress();
  const [activeSection, setActiveSection] = useState<string | null>('why_section');

  const handleProgressToggle = (step: string, completed: boolean) => {
    if (completed) {
      markComplete(step);
      const sectionMap: {[key: string]: string} = {
        'why_matters': 'why_section',
        'sprint_scenarios': 'scenarios_section',
        'scrum_meetings': 'scrum_section',
        'edge_cases': 'edge_cases_section',
      };
      if (activeSection === sectionMap[step]) {
        setActiveSection(null);
      }
    } else {
      markIncomplete(step);
    }
  };

  const handleStepClick = (sectionId: string) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="Continuous Development & Scrum Loop" />
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-600' : 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-600'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-blue-600" />
        <span className="font-medium">{page9Data.sprintContext.currentSprint}. {page9Data.sprintContext.whatWasBuilt} {page9Data.sprintContext.whatQuestionsArose}</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Team working during sprint"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <RefreshCw size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Continuous Development: The Iterative Loop
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            During sprints, developers ask questions. Edge cases appear. You don't know everything upfront. This is how BAs work: go back to stakeholders, get answers, update requirements, and keep the team unblocked.
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker 
        progress={progress}
        activeSection={activeSection}
        onStepClick={handleStepClick}
        onToggle={handleProgressToggle}
      />

      {/* Main grid layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Why This Matters */}
          <CollapsibleSection
            title="Why This Matters (Especially in Interviews)"
            icon={Target}
            completed={progress.why_matters}
            isOpen={activeSection === 'why_section'}
            onToggle={() => handleStepClick('why_section')}
            onToggleComplete={(completed) => handleProgressToggle('why_matters', completed)}
            sectionId="why_section"
          >
            <div className="p-5">
              <div className="space-y-3 text-base text-slate-800">
                <p className="leading-relaxed">
                  Interviewers ask: <strong className="text-slate-900">&quot;How do you handle questions from developers during sprints?&quot;</strong> or <strong className="text-slate-900">&quot;What happens when you discover edge cases mid-development?&quot;</strong>
                </p>
                <p className="leading-relaxed">
                  In Agile, you <strong>don't collect all requirements upfront</strong>. Questions arise during development. Edge cases appear. Your job is to go back to stakeholders, get answers, and update requirements. This is the iterative loop.
                </p>
                <div className="mt-4 rounded-lg border-2 border-blue-600/30 bg-blue-600/10 p-4 text-sm text-blue-600">
                  <strong>Key Point:</strong> Good BAs expect questions and are ready to go back to stakeholders. You're not expected to think of everything upfront - that's the whole point of Agile.
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Sprint Scenarios */}
          <CollapsibleSection
            title="Sprint Scenarios: Going Back to Stakeholders"
            icon={RefreshCw}
            completed={progress.sprint_scenarios}
            isOpen={activeSection === 'scenarios_section'}
            onToggle={() => handleStepClick('scenarios_section')}
            onToggleComplete={(completed) => handleProgressToggle('sprint_scenarios', completed)}
            sectionId="scenarios_section"
          >
            <div className="p-5">
              <div className="mb-4 space-y-6">
                <p className="text-base text-slate-800 leading-relaxed">
                  During development, developers ask questions. You don't always know the answer. Here are real scenarios showing how BAs handle this:
                </p>

                {page9Data.sprintScenarios.map((scenario, index) => (
                  <div key={index} className="border-2 border-blue-600/20 rounded-xl p-5 bg-gradient-to-br from-blue-600/5 to-indigo-600/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{scenario.sprint}</div>
                        <div className="text-sm text-slate-600">{scenario.scenario}</div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="bg-white rounded-lg p-3 border border-blue-600/20">
                        <div className="font-semibold text-blue-600 mb-1">Developer Question:</div>
                        <div className="text-slate-800 italic">&quot;{scenario.developerQuestion}&quot;</div>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="font-semibold text-amber-900 mb-1">BA Action:</div>
                        <div className="text-slate-800">{scenario.baAction}</div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="font-semibold text-green-900 mb-1">Stakeholder Response:</div>
                        <div className="text-slate-800">{scenario.stakeholderResponse}</div>
                      </div>

                      <div className="bg-indigo-600/5 rounded-lg p-3 border border-indigo-600/20">
                        <div className="font-semibold text-indigo-600 mb-1">Requirement Update:</div>
                        <div className="text-slate-800">{scenario.requirementUpdate}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <strong>Pattern:</strong> Developer asks → BA doesn't know → BA goes to stakeholder → BA gets answer → BA updates requirements → Developer continues. This is the iterative loop.
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Scrum Meetings */}
          <CollapsibleSection
            title="Scrum Meetings: What BAs Do"
            icon={Calendar}
            completed={progress.scrum_meetings}
            isOpen={activeSection === 'scrum_section'}
            onToggle={() => handleStepClick('scrum_section')}
            onToggleComplete={(completed) => handleProgressToggle('scrum_meetings', completed)}
            sectionId="scrum_section"
          >
            <div className="p-5">
              <div className="mb-4 space-y-6">
                <p className="text-base text-slate-800 leading-relaxed">
                  BAs attend all Scrum meetings. Here's what you do in each:
                </p>

                {page9Data.scrumMeetings.map((meeting, index) => (
                  <div key={index} className="border-2 border-indigo-600/20 rounded-xl p-5 bg-gradient-to-br from-indigo-600/5 to-blue-600/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-slate-900">{meeting.meeting}</div>
                        <div className="text-sm text-slate-600">{meeting.when}</div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm mb-4">
                      <div className="bg-white rounded-lg p-3 border border-indigo-600/20">
                        <div className="font-semibold text-indigo-600 mb-1">What Happens:</div>
                        <div className="text-slate-800">{meeting.whatHappens}</div>
                      </div>

                      <div className="bg-blue-600/5 rounded-lg p-3 border border-blue-600/20">
                        <div className="font-semibold text-blue-600 mb-1">Your Role (BA):</div>
                        <div className="text-slate-800">{meeting.baRole}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="font-semibold text-slate-900 mb-2">Example:</div>
                      <div className="text-sm text-slate-700 mb-2">
                        <strong>Context:</strong> {meeting.example.context}
                      </div>
                      <div className="space-y-2 mb-3">
                        {meeting.example.conversation.map((line, idx) => (
                          <div key={idx} className="text-sm text-slate-800 pl-3 border-l-2 border-blue-600">
                            {line}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm font-semibold text-emerald-700">
                        Outcome: {meeting.example.outcome}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Edge Cases & Requirements Evolution */}
          <CollapsibleSection
            title="Edge Cases & Requirements Evolution"
            icon={AlertTriangle}
            completed={progress.edge_cases}
            isOpen={activeSection === 'edge_cases_section'}
            onToggle={() => handleStepClick('edge_cases_section')}
            onToggleComplete={(completed) => handleProgressToggle('edge_cases', completed)}
            sectionId="edge_cases_section"
          >
            <div className="p-5">
              <div className="mb-4 space-y-6">
                <p className="text-base text-slate-800 leading-relaxed">
                  Edge cases appear during development. Requirements evolve. Here's how BAs handle this:
                </p>

                <div className="border-2 border-blue-600/20 rounded-xl p-5 bg-blue-600/5">
                  <div className="font-bold text-blue-600 mb-3">Edge Cases Discovered:</div>
                  <div className="space-y-4">
                    {page9Data.edgeCases.map((edgeCase, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-blue-600/20">
                        <div className="font-semibold text-slate-900 mb-1">{edgeCase.edgeCase}</div>
                        <div className="text-sm text-slate-700 space-y-1">
                          <p><strong>How discovered:</strong> {edgeCase.howDiscovered}</p>
                          <p><strong>BA action:</strong> {edgeCase.baAction}</p>
                          <p><strong>Resolution:</strong> {edgeCase.resolution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-indigo-600/20 rounded-xl p-5 bg-indigo-600/5">
                  <div className="font-bold text-indigo-600 mb-3">Requirements Evolution:</div>
                  <div className="space-y-4">
                    {page9Data.requirementsEvolution.map((evolution, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-indigo-600/20">
                        <div className="text-sm text-slate-700 space-y-1">
                          <p><strong>Original:</strong> {evolution.original}</p>
                          <p><strong>What changed:</strong> {evolution.whatChanged}</p>
                          <p><strong>Why:</strong> {evolution.why}</p>
                          <p><strong>When:</strong> {evolution.when}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border-2 border-indigo-600/30 bg-indigo-600/10 p-4 text-sm text-indigo-600">
                  <strong>Key Learning:</strong> Requirements are not static. They evolve as you learn. Good BAs document this evolution and explain why changes were made.
                </div>
              </div>
            </div>
          </CollapsibleSection>

        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <GlossarySidebar project={selectedProject} pageKey="continuous-development" />
          <BAJourneySidebar />
        </div>
      </div>

      {/* Slack Update */}
      <div className="mt-8 bg-white border-2 border-slate-300 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Slack / Teams Update (Copy & Adapt)</h2>
        <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
            {page9Data.slackUpdate.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default ContinuousDevelopment;
