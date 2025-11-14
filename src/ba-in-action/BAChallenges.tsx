import React, { useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_10_DATA } from './page10-data';
import {
  PageShell,
  PageTitle,
  Section,
  NavigationButtons,
} from './common';
import { baInActionViewToPath, getBaInActionNavigation } from './config';
import {
  AlertTriangle,
  Target,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Users,
  Clock,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_challenges';

const HERO_IMAGE = '/images/collaborate1.jpg';

// --- Progress Tracking Hook ---
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-challenges-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-challenges-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-challenges-progress', JSON.stringify(updated));
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
    { id: 'scope_creep', label: 'Scope Creep', icon: AlertTriangle, sectionId: 'scope_creep_section' },
    { id: 'difficult_stakeholder', label: 'Difficult Stakeholder', icon: Users, sectionId: 'difficult_stakeholder_section' },
    { id: 'conflicting_priorities', label: 'Conflicting Priorities', icon: Target, sectionId: 'conflicting_priorities_section' },
    { id: 'missing_information', label: 'Missing Information', icon: FileText, sectionId: 'missing_information_section' },
    { id: 'changing_requirements', label: 'Changing Requirements Mid-Sprint', icon: Clock, sectionId: 'changing_requirements_section' },
    { id: 'technical_constraints', label: 'Technical Constraints Discovered Late', icon: AlertTriangle, sectionId: 'technical_constraints_section' },
    { id: 'stakeholder_disagreements', label: 'Stakeholder Disagreements', icon: Users, sectionId: 'stakeholder_disagreements_section' },
  ];

  const total = steps.length;
  const completed = steps.filter(s => progress[s.id]).length;
  const percentage = (completed / total) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 border border-blue-600/20 dark:border-blue-600/30 rounded-2xl shadow-lg p-6 mb-8 bg-gradient-to-br from-white to-blue-600/5 dark:from-gray-800 dark:to-gray-900/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-white mb-1">Your BA Journey</div>
          <div className="text-xs text-slate-600 dark:text-gray-400">{completed} of {total} steps completed</div>
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
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle size={18} className="text-slate-400 dark:text-gray-500" />
                )}
              </button>
              <button
                onClick={() => onStepClick(step.sectionId)}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-600 dark:border-blue-500 shadow-md hover:shadow-lg' 
                    : completed 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-md' 
                      : 'bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 hover:bg-blue-600/5 dark:hover:bg-blue-900/20 hover:border-blue-600/30 dark:hover:border-blue-700 hover:shadow-sm'
                }`}
              >
                <Icon size={18} className={`transition-all duration-300 ${completed ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-400 dark:text-gray-500'}`} />
                <span className={`text-sm flex-1 font-medium ${completed ? 'text-emerald-900 dark:text-emerald-300 line-through' : isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-gray-300'}`}>
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <ChevronDown size={14} className="text-slate-400 dark:text-gray-500" />
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
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-600/20 dark:border-blue-600/30 rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-600/5 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={`${completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
          <span className={`text-base font-bold ${completed ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
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
              className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300"
            >
              {completed ? 'Mark incomplete' : 'Mark complete'}
            </button>
          )}
          {controlledIsOpen ? (
            <ChevronDown size={18} className="text-slate-400 dark:text-gray-500" />
          ) : (
            <ChevronRight size={18} className="text-slate-400 dark:text-gray-500" />
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
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-600/30 dark:border-blue-600/40 rounded-2xl shadow-lg overflow-hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-600/5 transition-all duration-200 bg-blue-600/5"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-600" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">Key Terms</span>
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
                <div className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{item.term}</div>
                <div className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">{item.definition}</div>
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
          <div className="text-base font-bold text-white">A BA's Approach to Challenges</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Stay calm and systematic</div>
                <div className="text-white/80 text-xs mt-0.5">Don't panic. Use a structured approach to handle each challenge</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Understand the root cause</div>
                <div className="text-white/80 text-xs mt-0.5">Why is this happening? What's the real issue?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Find solutions, not blame</div>
                <div className="text-white/80 text-xs mt-0.5">Focus on how to resolve it, not who's at fault</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Document everything</div>
                <div className="text-white/80 text-xs mt-0.5">Keep records of challenges, solutions, and outcomes</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Learn and improve</div>
                <div className="text-white/80 text-xs mt-0.5">Use challenges as learning opportunities for future projects</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              Challenges are <strong>normal</strong>. Good BAs don't avoid them - they handle them systematically. Every challenge is a chance to demonstrate your problem-solving skills.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BAChallenges: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page10Data = PAGE_10_DATA[selectedProject];
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
        'scope_creep': 'scope_creep_section',
        'difficult_stakeholder': 'difficult_stakeholder_section',
        'conflicting_priorities': 'conflicting_priorities_section',
        'missing_information': 'missing_information_section',
        'changing_requirements': 'changing_requirements_section',
        'technical_constraints': 'technical_constraints_section',
        'stakeholder_disagreements': 'stakeholder_disagreements_section',
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

  // Map challenge names to step IDs
  const challengeToStepId: {[key: string]: string} = {
    'Scope Creep': 'scope_creep',
    'Difficult Stakeholder': 'difficult_stakeholder',
    'Conflicting Priorities': 'conflicting_priorities',
    'Missing Information': 'missing_information',
    'Changing Requirements Mid-Sprint': 'changing_requirements',
    'Technical Constraints Discovered Late': 'technical_constraints',
    'Stakeholder Disagreements': 'stakeholder_disagreements',
  };

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="BA Challenges & How to Handle Them" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
        <AlertTriangle size={16} className="text-indigo-600" />
        <span className="font-medium">Common challenges BAs face and how to handle them with real examples from this project.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="BA handling challenges"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <AlertTriangle size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Common BA Challenges & How to Handle Them
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            Scope creep, difficult stakeholders, conflicting priorities - these challenges are normal. Good BAs handle them systematically. Here's how.
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
              <div className="space-y-3 text-base text-slate-800 dark:text-gray-300">
                <p className="leading-relaxed">
                  Interviewers ask: <strong className="text-slate-900 dark:text-white">&quot;Tell me about a time you dealt with scope creep&quot;</strong> or <strong className="text-slate-900 dark:text-white">&quot;How do you handle difficult stakeholders?&quot;</strong>
                </p>
                <p className="leading-relaxed">
                  Challenges are normal in BA work. Good BAs don't avoid them - they handle them systematically. This page shows you how, with real examples from this project.
                </p>
                <div className="mt-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-900 dark:text-blue-200">
                  <strong>Key Point:</strong> Every challenge is an opportunity to demonstrate your problem-solving skills. Use the STAR method (Situation, Task, Action, Result) when discussing challenges in interviews.
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Challenges */}
          {page10Data.challenges.map((challenge, index) => {
            const stepId = challengeToStepId[challenge.challenge];
            const sectionId = stepId ? `${stepId}_section` : `challenge_${index}_section`;
            return (
              <CollapsibleSection
                key={index}
                title={challenge.challenge}
                icon={AlertTriangle}
                completed={stepId ? progress[stepId] : false}
                isOpen={activeSection === sectionId}
                onToggle={() => handleStepClick(sectionId)}
                onToggleComplete={stepId ? (completed) => handleProgressToggle(stepId, completed) : undefined}
                sectionId={sectionId}
              >
                <div className="p-5">
                  <div className="mb-4 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="font-semibold text-blue-900 dark:text-blue-200 mb-2">What It Is:</div>
                      <div className="text-sm text-slate-800 dark:text-gray-300">{challenge.whatItIs}</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-gray-800/50 rounded-lg p-4 border border-slate-200 dark:border-gray-700">
                      <div className="font-semibold text-slate-900 dark:text-white mb-2">Example from This Project:</div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="font-semibold text-slate-700 dark:text-gray-400 mb-1">Situation:</div>
                          <div className="text-slate-800 dark:text-gray-300">{challenge.example.situation}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 dark:text-gray-400 mb-1">What Happened:</div>
                          <div className="text-slate-800 dark:text-gray-300">{challenge.example.whatHappened}</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-3 border border-amber-200 dark:border-amber-800">
                          <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Your BA Response:</div>
                          <div className="text-slate-800 dark:text-gray-300">{challenge.example.baResponse}</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3 border border-emerald-200 dark:border-emerald-800">
                          <div className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Outcome:</div>
                          <div className="text-slate-800 dark:text-gray-300">{challenge.example.outcome}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                      <div className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">How to Handle:</div>
                      <ul className="space-y-2 text-sm text-slate-800 dark:text-gray-300">
                        {challenge.howToHandle.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-600 mt-0.5 font-bold">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <div className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Interview Tip:</div>
                      <div className="text-sm text-slate-800 dark:text-gray-300 italic">&quot;{challenge.interviewTip}&quot;</div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            );
          })}

        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <GlossarySidebar project={selectedProject} pageKey="ba-challenges" />
          <BAJourneySidebar />
        </div>
      </div>

      {/* Slack Update */}
      <div className="mt-8 bg-white dark:bg-gray-800 border-2 border-slate-300 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Slack / Teams Update (Copy & Adapt)</h2>
        <div className="rounded-lg border-2 border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-sm text-slate-800 dark:text-gray-300 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-700">
            {page10Data.slackUpdate.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default BAChallenges;
