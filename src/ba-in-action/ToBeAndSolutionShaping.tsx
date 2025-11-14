import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_6_DATA } from './page6-data';
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
  ClipboardCheck,
  CheckCircle,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FileText,
  AlertTriangle,
  Users,
  MessageSquare,
  HelpCircle,
  ListChecks,
  FileCheck,
  Link2,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_requirements';

const HERO_IMAGE = '/images/collaborate1.jpg';

const QUESTIONS_TO_ASK = [
  {
    category: 'Before Writing Requirements',
    questions: [
      '"What decision are we trying to enable? What ambiguity needs to be removed?"',
      '"What happens if we build this wrong? What\'s non-negotiable?"',
      '"Who needs to sign off on this? What do they care about?"',
      '"What constraints must we respect? (regulatory, technical, capacity)"',
    ],
    whatToDo: 'Clarify intent first. Identify decision boundaries. Map stakeholder concerns and non-negotiables before writing a single requirement.',
    why: 'Requirements without context become documentation theatre. Understanding the "why" prevents building the wrong thing correctly.',
  },
  {
    category: 'Writing Acceptance Criteria',
    questions: [
      '"How will we know this is working correctly?"',
      '"What are the edge cases? What breaks the happy path?"',
      '"What data do we need? Where does it come from?"',
      '"How do we test this without breaking production?"',
    ],
    whatToDo: 'Write testable conditions. Use "Given/When/Then" or numbered AC format. Be specific about data, states, and expected outcomes.',
    why: 'Vague AC = rework. Clear AC = confident build. Engineering needs precision to estimate and implement correctly.',
  },
  {
    category: 'Validation & Traceability',
    questions: [
      '"Does this requirement trace back to a business outcome?"',
      '"Can we measure whether this solves the problem?"',
      '"Is this a constraint or a preference? Can we challenge it?"',
      '"What happens if we descope this? What\'s the minimum viable version?"',
    ],
    whatToDo: 'Build a traceability matrix linking requirements to outcomes. Define success metrics. Separate must-haves from nice-to-haves.',
    why: 'Traceability defends your work in steering meetings. It shows you\'re solving problems, not just collecting wishes.',
  },
];

// Progress tracking hook
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-requirements-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-requirements-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-requirements-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const getProgress = () => {
    const steps = ['questions_asked', 'intent_framed', 'truths_identified', 'requirements_written', 'user_story_written', 'acceptance_criteria_written', 'traceability_done'];
    const completed = steps.filter(s => progress[s]).length;
    return { completed, total: steps.length, percentage: (completed / steps.length) * 100 };
  };

  return { progress, markComplete, markIncomplete, getProgress };
}

// --- Progress Tracker Component ---
const ProgressTracker: React.FC<{
  progress: {[k: string]: boolean};
  activeSection: string | null;
  onStepClick: (stepId: string) => void;
  onToggle: (step: string, completed: boolean) => void;
}> = ({ progress, activeSection, onStepClick, onToggle }) => {
  const steps = [
    { id: 'questions_asked', label: 'Ask Questions', icon: HelpCircle, sectionId: 'questions_section' },
    { id: 'intent_framed', label: 'Frame Intent', icon: Target, sectionId: 'intent_section' },
    { id: 'truths_identified', label: 'Identify Functional Truths', icon: Lightbulb, sectionId: 'truths_section' },
    { id: 'requirements_written', label: 'Write High-Level Requirements', icon: FileText, sectionId: 'requirements_section' },
    { id: 'user_story_written', label: 'Write User Story', icon: MessageSquare, sectionId: 'user_story_section' },
    { id: 'acceptance_criteria_written', label: 'Write Acceptance Criteria', icon: ListChecks, sectionId: 'acceptance_criteria_section' },
    { id: 'traceability_done', label: 'Create Traceability Matrix', icon: Link2, sectionId: 'traceability_section' },
  ];

  const total = steps.length;
  const completed = steps.filter(s => progress[s.id]).length;
  const percentage = (completed / total) * 100;

  return (
    <div className="bg-white border border-blue-200 rounded-2xl shadow-lg p-6 mb-8 bg-gradient-to-br from-white to-blue-50/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-base font-bold text-slate-900 mb-1">Your BA Journey</div>
          <div className="text-xs text-slate-600">{completed} of {total} steps completed</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-3 bg-blue-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-blue-700 min-w-[3rem]">{Math.round(percentage)}%</span>
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
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 shadow-md hover:shadow-lg' 
                    : completed 
                      ? 'bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 hover:shadow-md' 
                      : 'bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                <Icon size={18} className={`transition-all duration-300 ${completed ? 'text-emerald-600' : isActive ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                <span className={`text-sm flex-1 font-medium ${completed ? 'text-emerald-900 line-through' : isActive ? 'text-blue-900 font-bold' : 'text-slate-700'}`}>
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
    <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-all duration-200"
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
        <div className="border-t border-blue-200/50 animate-in slide-in-from-top-2 fade-in duration-300">
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
    <div className="bg-white border-2 border-blue-300 rounded-2xl shadow-lg overflow-hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-all duration-200 bg-blue-50/30"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-600" />
          <span className="text-lg font-bold text-slate-900">Key Terms</span>
          <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">
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
        <div className="border-t border-blue-200/50 animate-in slide-in-from-top-2 fade-in duration-300">
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

const ToBeAndSolutionShaping: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page6Data = PAGE_6_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const [requirementsDraft, setRequirementsDraft] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const exampleRef = useRef<HTMLDivElement | null>(null);
  const { progress, markComplete, markIncomplete } = useProgress();
  const [activeSection, setActiveSection] = useState<string | null>('questions_section');

  const toggleScript = (section: string) => {
    setExpandedScript(expandedScript === section ? null : section);
  };

  const openExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleProgressToggle = (step: string, completed: boolean) => {
    if (completed) {
      markComplete(step);
      // Close the section when marked complete
      const sectionMap: {[key: string]: string} = {
        'questions_asked': 'questions_section',
        'intent_framed': 'intent_section',
        'truths_identified': 'truths_section',
        'requirements_written': 'requirements_section',
        'user_story_written': 'user_story_section',
        'acceptance_criteria_written': 'acceptance_criteria_section',
        'traceability_done': 'traceability_section',
      };
      if (activeSection === sectionMap[step]) {
        setActiveSection(null);
      }
    } else {
      markIncomplete(step);
    }
  };

  const handleStepClick = (sectionId: string) => {
    // If clicking the same section, toggle it closed
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      // Open the clicked section (closes others automatically)
      setActiveSection(sectionId);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="Requirements & Documentation (The Right Way)" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">You convert understanding into decisions engineering can build.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Business professionals collaborating on requirements"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <FileText size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Requirements: Decisions Made Explicit, Ambiguity Removed
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            You&apos;re translating truth into buildable statements that engineering trusts and leadership signs off. Requirements aren&apos;t documents—they&apos;re decisions.
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section title="Why Requirements Matter (Especially in Interviews)">
        <div className="space-y-3 text-base text-slate-800">
          <p className="leading-relaxed">
            Interviewers ask: <strong className="text-slate-900">&quot;How do you write requirements?&quot;</strong> or <strong className="text-slate-900">&quot;Tell me about a time when you had to translate business needs into technical specifications.&quot;</strong>
          </p>
          <p className="leading-relaxed">
            Requirements turn your To-Be solution into something developers can build. <strong>At this stage, you write HIGH-LEVEL requirements</strong> - the big picture of what needs to be built. Detailed breakdown happens later in tools (Jira/Excel) with stakeholder sign-off.
          </p>
        </div>
      </Section>

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

      {/* Questions to Ask Section */}
      <CollapsibleSection
        title="1) Questions to Ask & What to Do with the Answers"
        icon={HelpCircle}
        completed={progress.questions_asked}
        isOpen={activeSection === 'questions_section'}
        onToggle={() => handleStepClick('questions_section')}
        onToggleComplete={(completed) => handleProgressToggle('questions_asked', completed)}
        sectionId="questions_section"
      >
        <div className="p-5">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          BAs don&apos;t write requirements in isolation. They ask questions to clarify intent, identify constraints, and ensure traceability.
        </p>
        <div className="space-y-4">
          {QUESTIONS_TO_ASK.map((section) => (
            <div key={section.category} className="border border-slate-300 rounded-lg bg-white shadow-sm">
              <button
                onClick={() => toggleScript(section.category)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                    {section.category === 'Before Writing Requirements' ? 'B' : section.category === 'Writing Acceptance Criteria' ? 'W' : 'V'}
                  </div>
                  <span className="font-semibold text-slate-900">{section.category}</span>
                </div>
                {expandedScript === section.category ? (
                  <ChevronUp className="text-slate-400" size={20} />
                ) : (
                  <ChevronDown className="text-slate-400" size={20} />
                )}
              </button>
              {expandedScript === section.category && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-200">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mt-4 mb-2">Questions to Ask</div>
                    <ul className="space-y-2">
                      {section.questions.map((q, idx) => (
                        <li key={idx} className="text-sm text-slate-700 italic flex items-start gap-2">
                          <span className="text-purple-600 mt-1 font-bold">→</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">What to Do with the Answers</div>
                    <p className="text-sm text-emerald-800">{section.whatToDo}</p>
                  </div>
                  <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-amber-700 font-semibold mb-1">Why This Matters</div>
                    <p className="text-sm text-amber-800">{section.why}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Lightbulb size={16} />
            Pro tip: Write requirements in plain language first. Then add structure. Clarity before formatting.
          </div>
        </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="2) What Requirements Actually Are"
        icon={FileText}
        isOpen={activeSection === 'what_requirements_section'}
        onToggle={() => handleStepClick('what_requirements_section')}
        sectionId="what_requirements_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-700">
          Requirements are the minimum statements needed to make decisions, remove ambiguity, allow engineering to implement, and let stakeholders sign off confidently.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="text-sm font-semibold text-emerald-900">Good requirements:</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-emerald-800">
              <li>Rooted in facts.</li>
              <li>Traceable to pain or value.</li>
              <li>Testable in the real world.</li>
              <li>Written in neutral, calm language.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <div className="text-sm font-semibold text-rose-900">Bad requirements:</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-rose-800">
              <li>Opinions or wishes.</li>
              <li>“Nice to haves.”</li>
              <li>Written to impress.</li>
              <li>Full of hype.</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">Your job: reduce uncertainty. Not impress anyone.</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="3) Frame the Intent Before Writing Anything"
        icon={Target}
        completed={progress.intent_framed}
        isOpen={activeSection === 'intent_section'}
        onToggle={() => handleStepClick('intent_section')}
        onToggleComplete={(completed) => handleProgressToggle('intent_framed', completed)}
        sectionId="intent_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-700">
          Always begin with the Intent Statement — the single, calm explanation of what we’re trying to achieve.
        </p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-800">
          {page6Data.intentExample}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          This is the anchor. People will drift; intent pulls them back.
        </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="4) From Intent → Functional Truth"
        icon={Lightbulb}
        completed={progress.truths_identified}
        isOpen={activeSection === 'truths_section'}
        onToggle={() => handleStepClick('truths_section')}
        onToggleComplete={(completed) => handleProgressToggle('truths_identified', completed)}
        sectionId="truths_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-700">Identify the functional truths that must be respected. They prevent naive solutions.</p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {page6Data.functionalTruths.map((truth, index) => (
              <li key={index}>{truth}</li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          You're protecting reality. These truths explain why "Verify everyone" is not a real solution.
        </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="5) Express the Requirements (High-Level. Calm. Precise. Unemotional.)"
        icon={FileText}
        completed={progress.requirements_written}
        isOpen={activeSection === 'requirements_section'}
        onToggle={() => handleStepClick('requirements_section')}
        onToggleComplete={(completed) => handleProgressToggle('requirements_written', completed)}
        sectionId="requirements_section"
      >
        <div className="p-5">
        <div className="mb-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="flex items-center gap-2 font-bold mb-2">
            <Lightbulb size={16} />
            Important: These Are HIGH-LEVEL Requirements
          </div>
          <p className="leading-relaxed">
            At this stage, you write <strong>high-level requirements</strong> - the big picture of what needs to be built. You don't need to think of every detail or edge case. Detailed breakdown (into epics, user stories, acceptance criteria) happens later in tools (Jira/Excel) when you work with developers and get stakeholder sign-off.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 space-y-3">
          {page6Data.requirements.map((req, index) => (
            <p key={index}>
              <span className="font-semibold text-slate-900">{index + 1}.</span> {req}
            </p>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          These are high-level. They describe <strong>what</strong> needs to be built, not <strong>how</strong> it will be built in detail. The "how" comes later when you break these down in tools.
        </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="6) What Are Epics and User Stories? (Simple Explanation)"
        icon={MessageSquare}
        completed={progress.user_story_written}
        isOpen={activeSection === 'user_story_section'}
        onToggle={() => handleStepClick('user_story_section')}
        onToggleComplete={(completed) => handleProgressToggle('user_story_written', completed)}
        sectionId="user_story_section"
      >
        <div className="p-5">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            You might hear terms like "epic" and "user story" in Agile teams. Here's what they mean:
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4">
              <div className="text-sm font-bold text-indigo-900 mb-2">Epic</div>
              <p className="text-sm text-indigo-800 leading-relaxed">
                A <strong>large feature or capability</strong> that's too big to build in one sprint. Example: "Risk-Based Identity Verification" is an epic. It contains multiple user stories.
              </p>
            </div>
            
            <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4">
              <div className="text-sm font-bold text-purple-900 mb-2">User Story</div>
              <p className="text-sm text-purple-800 leading-relaxed">
                A <strong>small, specific piece of functionality</strong> written from the user's perspective. Format: "As a [user], I want [goal], so that [benefit]." Example: "As a Risk Engine, I want to classify identity verification outcomes, so that we reduce fraud."
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
            <strong>At This Stage:</strong> You write high-level requirements (like the ones above). You might also write a high-level user story to capture the intent. But detailed breakdown into multiple user stories and acceptance criteria happens later in tools (Jira/Excel) when you work with developers.
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-800 whitespace-pre-line font-medium">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Example High-Level User Story:</div>
            {page6Data.userStory}
          </div>
          <p className="mt-3 text-sm text-slate-700">
            This is a high-level user story that captures the intent. Later, in tools, you'll break this down into multiple detailed user stories with specific acceptance criteria.
          </p>
        </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="7) Acceptance Criteria — High-Level (Detailed Breakdown Happens in Tools)"
        icon={ListChecks}
        completed={progress.acceptance_criteria_written}
        isOpen={activeSection === 'acceptance_criteria_section'}
        onToggle={() => handleStepClick('acceptance_criteria_section')}
        onToggleComplete={(completed) => handleProgressToggle('acceptance_criteria_written', completed)}
        sectionId="acceptance_criteria_section"
      >
        <div className="p-5">
        <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-bold mb-2">
            <Lightbulb size={16} />
            Important: High-Level Acceptance Criteria
          </div>
          <p className="leading-relaxed">
            At this stage, you write <strong>high-level acceptance criteria</strong> - the main conditions that must be met. Detailed, testable acceptance criteria are written later in tools (Jira/Excel) when you break down requirements with developers and get stakeholder sign-off.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 space-y-2">
          {page6Data.acceptanceCriteria.map((ac, index) => (
            <p key={index}>{ac}</p>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          These are high-level. They describe the main conditions. Detailed, step-by-step acceptance criteria (like "User completes sign-up form → Risk score is calculated → If score ≥85, account is approved") are written later in tools when you work with developers.
        </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="8) Traceability Matrix (Simple, Clean, Real)"
        icon={Link2}
        completed={progress.traceability_done}
        isOpen={activeSection === 'traceability_section'}
        onToggle={() => handleStepClick('traceability_section')}
        onToggleComplete={(completed) => handleProgressToggle('traceability_done', completed)}
        sectionId="traceability_section"
      >
        <div className="p-5">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          Link every requirement to a business outcome. This defends your work in steering meetings.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Outcome Goal</th>
                <th className="px-5 py-3 border-b border-slate-200">Requirement</th>
                <th className="px-5 py-3 border-b border-slate-200">Measure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {page6Data.traceability.map((row) => (
                <tr key={row.outcome} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.outcome}</td>
                  <td className="px-5 py-4 text-slate-700">{row.requirement}</td>
                  <td className="px-5 py-4 text-slate-700">{row.measure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Target size={16} />
            Traceability shows you&apos;re solving problems, not just collecting wishes. This is how you defend scope in leadership reviews.
          </div>
        </div>
        </div>
      </CollapsibleSection>

      <Section title="9) BA Documents in Confluence & Gets Dev Feedback">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          This is what the BA creates in Confluence after defining requirements. Watch how the BA shares it with the dev team and incorporates their feedback.
        </p>

        {/* Confluence Page Mockup */}
        <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <FileText size={16} />
              <span className="font-semibold text-sm">Confluence</span>
              <span className="text-white/60">›</span>
              <span className="text-white/90 text-sm">{projectData.initiativeName}</span>
              <span className="text-white/60">›</span>
              <span className="text-white/90 text-sm">Requirements</span>
            </div>
            <span className="text-white/80 text-xs">Last edited: Today, 3:42 PM by You (BA)</span>
          </div>

          <div className="p-6 space-y-4 text-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{page6Data.confluencePage.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">{page6Data.confluencePage.sprint}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">Draft</span>
                <span>Author: You (BA)</span>
                <span>|</span>
                <span>Reviewed by: {selectedProject === 'cif' ? 'Alicia Chen (Dev Lead)' : 'Tom Richards (Repairs Lead)'}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Intent</h3>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                {page6Data.confluencePage.intent}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Functional Truths</h3>
              <ul className="list-disc ml-5 space-y-1 text-slate-800 bg-slate-50 p-3 rounded border border-slate-200">
                {page6Data.confluencePage.functionalTruths.map((truth, index) => (
                  <li key={index}>{truth}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Decision States</h3>
              <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                {page6Data.confluencePage.decisionStates.map((state, index) => (
                  <p key={index}><strong className="text-slate-900">{state.state}:</strong> {state.description}</p>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                {page6Data.confluencePage.acceptanceCriteria.map((ac, index) => {
                  const colors = [
                    { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', textSm: 'text-green-800' },
                    { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900', textSm: 'text-red-800' },
                    { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-900', textSm: 'text-amber-800' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div key={index} className={`${color.bg} border-l-4 ${color.border} p-3 rounded`}>
                      <p className={`font-semibold ${color.text} mb-2`}>{ac.id}: {ac.title}</p>
                      <ul className={`space-y-1 text-sm ${color.textSm}`}>
                        {ac.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className={`${color.textSm} mt-0.5`}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 bg-blue-50 rounded p-3">
              <div className="flex items-start gap-2">
                <Users size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Comments (3)</h4>
                  
                  {page6Data.confluencePage.comments.map((comment, index) => (
                    <div key={index} className={`bg-white border border-blue-200 rounded p-3 ${index < page6Data.confluencePage.comments.length - 1 ? 'mb-2' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-xs ${comment.author.includes('You') ? 'text-purple-700' : 'text-slate-900'}`}>{comment.author}</span>
                        <span className="text-xs text-slate-500">{comment.time}</span>
                      </div>
                      <p className="text-xs text-slate-800">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 border-2 border-blue-400 shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <Lightbulb size={14} />
            What to look for
          </div>
          <ul className="space-y-1 text-sm text-white/95">
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA documents requirements in shared tool (not Word doc on desktop)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>Dev asks clarifying question (AC was slightly ambiguous)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA updates document immediately (doesn&apos;t wait for next meeting)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>Dev confirms it&apos;s now clear (collaboration, not handoff)</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={16} />
            Pro tip: Great BAs don&apos;t write requirements in isolation. They share drafts early, invite feedback in Confluence comments, and iterate before sprint planning.
          </div>
        </div>
      </Section>

      <Section title="11) How to Present Requirements in Meetings">
        <p className="text-sm text-slate-700">
          Never read documents aloud. Never defend everything. Never overload.
        </p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
          “Here are the decision boundaries and how we’ll measure whether we’re solving the problem. If these are right, the details follow naturally. Let’s confirm alignment here first.”
        </div>
        <p className="mt-3 text-sm text-slate-700">You control the room by controlling sequence, not volume.</p>
      </Section>

      <Section title="12) Your Task Today">
        <p className="text-sm text-slate-700">
          Fill these in thoughtfully — like someone who understands both business reality and engineering constraints.
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
          <li>Intent (1 sentence)</li>
          <li>Functional truths (3–5)</li>
          <li>Decision states needed</li>
          <li>Acceptance criteria (at least 4, written cleanly)</li>
        </ul>
        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={8}
          placeholder={page6Data.taskPlaceholder}
          value={requirementsDraft}
          onChange={(event) => setRequirementsDraft(event.target.value)}
        />
        <div className="mt-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow">
          <div className="font-semibold">Want to compare against an example blueprint?</div>
          <button
            onClick={openExample}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
          >
            View example requirements package
            <ArrowRight size={14} />
          </button>
        </div>
      </Section>

      <Section title="13) Slack / Teams Update (Copy & Adapt)">
        <p className="text-base text-slate-800 mb-3 leading-relaxed">
          After finalizing requirements, post an update. This shows structured thinking and stakeholder management.
        </p>
        <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
            {page6Data.slackUpdate.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
          <strong>Why this works:</strong> This is how you look structured, senior, and calm. Clear deliverables. Clear next steps.
        </div>
      </Section>

      {showExample && (
        <div
          ref={exampleRef}
          className="mt-10 rounded-3xl border-2 border-indigo-300 bg-white p-6 shadow-xl space-y-6 text-sm text-slate-700"
        >
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles size={18} />
            <h3 className="text-lg font-semibold">Example: How a BA Works Through All Steps</h3>
          </div>
          
          <div className="mb-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Lightbulb size={16} />
              Why This Order Matters
            </div>
            <p className="leading-relaxed">
              A BA doesn't jump straight to writing user stories. They work through steps in order because each step builds on the previous one. This example shows the complete workflow and why each step matters.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Step 1: Intent */}
            <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                <div className="text-sm font-bold text-indigo-900">Step 1: Frame the Intent</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-indigo-200 mb-3">
                <p className="font-medium text-slate-900">{page6Data.exampleContent.intent}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg border border-indigo-200">
                <div className="text-xs font-semibold text-indigo-900 mb-1">Why the BA does this first:</div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  The BA starts here because intent is the anchor. When stakeholders drift into wishlist mode or scope creeps, the BA points back to this. Without clear intent, requirements become a collection of features instead of a solution to a problem.
                </p>
              </div>
            </div>

            {/* Step 2: Functional Truths */}
            <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                <div className="text-sm font-bold text-purple-900">Step 2: Identify Functional Truths</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200 mb-3">
                <ul className="space-y-1.5 text-slate-800">
                  {page6Data.exampleContent.functionalTruths.map((truth, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5 font-bold">•</span>
                      <span>{truth}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
                <div className="text-xs font-semibold text-purple-900 mb-1">Why the BA does this second:</div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  The BA identifies functional truths to prevent naive solutions. Without this step, someone might suggest &quot;{selectedProject === 'cif' ? 'verify everyone manually' : 'inspect every property manually'}&quot; - which ignores reality. These truths protect the BA from building solutions that can't work.
                </p>
              </div>
            </div>

            {/* Step 3: Decision States */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                <div className="text-sm font-bold text-emerald-900">Step 3: Define Decision States</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-emerald-200 mb-3">
                <div className="space-y-2 text-slate-800">
                  {page6Data.exampleContent.decisionStates.map((state, index) => (
                    <div key={index} className="border-l-2 border-emerald-400 pl-3">
                      <p className="font-semibold text-slate-900">{state.state}</p>
                      <p className="text-sm text-slate-700">{state.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-900 mb-1">Why the BA does this third:</div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  The BA defines decision states to remove ambiguity. Engineering needs to know exactly what outcomes are possible. Without clear decision boundaries, developers will ask "what if" questions that delay development. This step answers those questions upfront.
                </p>
              </div>
            </div>

            {/* Step 4: High-Level Requirements */}
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                <div className="text-sm font-bold text-blue-900">Step 4: Write High-Level Requirements</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3">
                <p className="text-sm text-slate-700 mb-2">Based on the intent, truths, and decision states, the BA writes high-level requirements:</p>
                <ul className="space-y-1.5 text-sm text-slate-700 ml-4">
                  {page6Data.requirements.slice(0, 4).map((req, index) => (
                    <li key={index} className="list-disc">{req}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-900 mb-1">Why the BA does this fourth:</div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Now that the BA knows the intent, truths, and decision states, they can write high-level requirements. These describe <strong>what</strong> needs to be built, not <strong>how</strong>. The BA writes these at a high level because detailed breakdown happens later in tools (Jira/Excel) with stakeholder sign-off.
                </p>
              </div>
            </div>

            {/* Step 5: User Story */}
            <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">5</div>
                <div className="text-sm font-bold text-indigo-900">Step 5: Write User Story</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-indigo-200 mb-3">
                <p className="font-semibold text-slate-900 mb-3">{page6Data.exampleContent.userStory.id}: {page6Data.exampleContent.userStory.title}</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><strong className="text-indigo-700">As a</strong> {page6Data.exampleContent.userStory.as.replace('As a ', '')}</p>
                  <p><strong className="text-indigo-700">I want to</strong> {page6Data.exampleContent.userStory.want.replace('I want to ', '')}</p>
                  <p><strong className="text-indigo-700">So that</strong> {page6Data.exampleContent.userStory.so.replace('So that ', '')}</p>
                </div>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg border border-indigo-200">
                <div className="text-xs font-semibold text-indigo-900 mb-1">Why the BA does this fifth:</div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  The BA writes the user story to capture the intent from the user's perspective. It provides context for why we're building this. The user story is a container that will hold the acceptance criteria. The BA writes this after understanding the requirements because the story needs to reflect what was decided in the previous steps.
                </p>
              </div>
            </div>

            {/* Step 6: Acceptance Criteria */}
            <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">6</div>
                <div className="text-sm font-bold text-purple-900">Step 6: Write Acceptance Criteria</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200 mb-3">
                <p className="text-xs text-purple-800 mb-3">These are the specific, testable conditions that must be met for the user story to be considered complete.</p>
                <div className="space-y-3">
                  {page6Data.exampleContent.acceptanceCriteria.map((ac, index) => (
                    <div key={index} className="border-l-2 border-purple-400 pl-3">
                      <p className="font-semibold text-slate-900 mb-1">{ac.id}: {ac.title}</p>
                      <ul className="space-y-1 text-sm text-slate-700">
                        {ac.items.slice(0, 2).map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {ac.items.length > 2 && (
                          <li className="text-xs text-slate-500 italic">... and {ac.items.length - 2} more conditions</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
                <div className="text-xs font-semibold text-purple-900 mb-1">Why the BA does this sixth:</div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  The BA writes acceptance criteria to make requirements testable. Developers use these to know exactly what to build and how to test it. QA uses them to verify the feature works. The BA writes these after the user story because the AC must align with the story's intent and the decision states defined earlier.
                </p>
              </div>
            </div>

            {/* Step 7: Traceability */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">7</div>
                <div className="text-sm font-bold text-amber-900">Step 7: Create Traceability Matrix</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200 mb-3">
                <div className="overflow-hidden rounded-lg border border-slate-300">
                  <table className="w-full text-xs bg-white">
                    <thead className="bg-slate-100 text-left">
                      <tr>
                        <th className="px-3 py-2 border-b border-slate-200">Outcome</th>
                        <th className="px-3 py-2 border-b border-slate-200">AC</th>
                        <th className="px-3 py-2 border-b border-slate-200">Metric</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {page6Data.exampleContent.traceability.map((row, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 font-medium">{row.outcome}</td>
                          <td className="px-3 py-2">{row.requirement}</td>
                          <td className="px-3 py-2">{row.measure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                <div className="text-xs font-semibold text-amber-900 mb-1">Why the BA does this last:</div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The BA creates traceability to link every requirement to a business outcome. This is how the BA defends scope in steering meetings. When someone asks "why are we building this?", the BA can point to the traceability matrix and say &quot;{selectedProject === 'cif' ? 'AC04 directly reduces fraud loss by 30%' : 'AC04 directly reduces void days by 30%'}.&quot; This shows the BA is solving problems, not just collecting wishes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm">
            <div className="font-bold mb-2">How a BA Actually Works:</div>
            <p className="leading-relaxed">
              A BA doesn't jump to user stories. They work through steps in order: <strong>Intent → Truths → Decision States → Requirements → User Story → Acceptance Criteria → Traceability</strong>. Each step builds on the previous one. This is how requirements become decisions, not documents.
            </p>
          </div>
        </div>
      )}

        </div>

        {/* Right sidebar - context & guidance */}
        <div className="space-y-6">
          
          {/* Glossary */}
          <GlossarySidebar project={selectedProject} pageKey="requirements-documentation" />
          
        </div>
      </div>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default ToBeAndSolutionShaping;

