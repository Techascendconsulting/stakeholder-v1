import React, { useRef, useState } from 'react';
import type { AppView } from '../../types';
import { useBAInActionProject } from '../../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from '../../ba-in-action/page1-data';
import { PAGE_3_DATA } from '../../ba-in-action/page3-data';
import {
  PageShell,
  PageTitle,
  Section,
  NavigationButtons,
} from '../../ba-in-action/common';
import { baInActionViewToPath, getBaInActionNavigation } from '../../ba-in-action/config';
import {
  Clock,
  Users,
  Target,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Grid3x3,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  MessageSquare,
  Send,
  Eye,
  Search,
  ClipboardList,
} from 'lucide-react';
import { getGlossaryTerms } from '../../ba-in-action/glossary-data';

const VIEW_ID: AppView = 'ba_in_action_whos_involved';

const HERO_IMAGE = '/images/collaborate1.jpg';

const HUMAN_REALITY = [
  `They don't want to waste time.`,
  `They don't want to be embarrassed in front of leadership.`,
  `They don't want to absorb extra blame when things go wrong.`,
];

// --- Progress Tracking Hook ---
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-stakeholder-landscape-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-stakeholder-landscape-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-stakeholder-landscape-progress', JSON.stringify(updated));
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
    { id: 'why_matters', label: 'Understand Why It Matters', icon: Target, sectionId: 'why_section' },
    { id: 'review_stakeholders', label: 'Review Stakeholder Table', icon: Users, sectionId: 'stakeholders_section' },
    { id: 'map_power_interest', label: 'Map Power & Interest', icon: Grid3x3, sectionId: 'power_interest_section' },
    { id: 'identify_pressure', label: 'Identify Pressure Signals', icon: ShieldAlert, sectionId: 'pressure_section' },
    { id: 'write_narrative', label: 'Write Stakeholder Narrative', icon: FileText, sectionId: 'narrative_section' },
    { id: 'complete_task', label: 'Complete Mapping Task', icon: ClipboardList, sectionId: 'task_section' },
    { id: 'send_update', label: 'Send Update', icon: Send, sectionId: 'update_section' },
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

// --- BA Journey Sidebar ---
const BAJourneySidebar: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-8">
      {/* Subtle background image */}
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
          <div className="text-base font-bold text-white">A BA's Approach to Stakeholder Analysis</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Review the stakeholder table</div>
                <div className="text-white/80 text-xs mt-0.5">Who are they? What do they care about? What do they fear?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Map power and interest</div>
                <div className="text-white/80 text-xs mt-0.5">Who can approve/block? Who cares most about outcomes?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Identify pressure signals</div>
                <div className="text-white/80 text-xs mt-0.5">What motivates them? What are they protecting?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Write the stakeholder narrative</div>
                <div className="text-white/80 text-xs mt-0.5">Who drives urgency? Who controls risk? Who can block quietly?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Document your map</div>
                <div className="text-white/80 text-xs mt-0.5">Create a table with power/interest, engagement approach, and concerns</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You're not just listing names. You're <strong>understanding influence, risk, and motivation</strong> so you can engage strategically and prevent political blockers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StakeholderLandscape: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const data = PAGE_1_DATA[selectedProject];
  const page3Data = PAGE_3_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  const [narrative, setNarrative] = useState('');
  const [stakeholderMap, setStakeholderMap] = useState('');
  const [showExample, setShowExample] = useState(false);
  const exampleRef = useRef<HTMLDivElement | null>(null);
  const { progress, markComplete, markIncomplete } = useProgress();
  const [activeSection, setActiveSection] = useState<string | null>('why_section');

  const handleProgressToggle = (step: string, completed: boolean) => {
    if (completed) {
      markComplete(step);
      // Close the section when marked complete
      const sectionMap: {[key: string]: string} = {
        'why_matters': 'why_section',
        'review_stakeholders': 'stakeholders_section',
        'map_power_interest': 'power_interest_section',
        'identify_pressure': 'pressure_section',
        'write_narrative': 'narrative_section',
        'complete_task': 'task_section',
        'send_update': 'update_section',
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

  const handleOpenExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageShell>
      <PageTitle title="Who's Involved & Why It Matters" />

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">Today, 10:20 · You already understand the problem. Now map the humans shaping it.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Business professionals collaborating in meeting"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <Users size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Who&apos;s Involved & Why It Matters
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            A BA navigates influence — not just requirements gathering. You map incentives, fears, veto power, and communication channels before proposing solutions. This page shows you how.
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

      {/* Why This Matters for Interviews */}
      <CollapsibleSection
        title="Why This Matters (Especially for Interviews)"
        icon={Target}
        completed={progress.why_matters}
        isOpen={activeSection === 'why_section'}
        onToggle={() => handleStepClick('why_section')}
        onToggleComplete={(completed) => handleProgressToggle('why_matters', completed)}
        sectionId="why_section"
      >
        <div className="p-5">
          <div className="space-y-3 text-sm text-slate-800">
            <p className="leading-relaxed">
              Interviewers ask: <strong className="text-slate-900">&quot;Tell me about a time when you had to manage conflicting stakeholder priorities&quot;</strong> or <strong className="text-slate-900">&quot;How do you identify who has decision-making authority?&quot;</strong>
            </p>
            <p className="leading-relaxed">
              You need structured frameworks. This page gives you the Power-Interest Grid and stakeholder mapping techniques that BAs use daily.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <strong>Real BA work:</strong> Understanding who holds risk, veto power, and emotional investment prevents solutions from being politely rejected, hearing &quot;not now&quot; with no explanation, or being blocked by invisible politics.
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="1) The People Landscape"
        icon={Users}
        completed={progress.review_stakeholders}
        isOpen={activeSection === 'stakeholders_section'}
        onToggle={() => handleStepClick('stakeholders_section')}
        onToggleComplete={(completed) => handleProgressToggle('review_stakeholders', completed)}
        sectionId="stakeholders_section"
      >
        <div className="p-5">
          <p className="text-sm text-slate-800 mb-4 leading-relaxed">
            These are not &quot;stakeholders.&quot; These are humans with incentives, fears, KPIs, reputations, and turf to defend.
          </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Name</th>
                <th className="px-5 py-3 border-b border-slate-200">Role</th>
                <th className="px-5 py-3 border-b border-slate-200">What They Care About</th>
                <th className="px-5 py-3 border-b border-slate-200">What They Fear</th>
                <th className="px-5 py-3 border-b border-slate-200">What This Means for You</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.stakeholders.map((person) => (
                <tr key={person.name} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{person.name}</td>
                  <td className="px-5 py-4 text-slate-700">{person.role}</td>
                  <td className="px-5 py-4 text-slate-700">{person.care}</td>
                  <td className="px-5 py-4 text-slate-700">{person.fear}</td>
                  <td className="px-5 py-4 text-indigo-700 font-medium">{person.cue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>If you don&apos;t understand who holds risk, veto power, and emotional investment, you will:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Propose solutions that get politely rejected.</li>
            <li>Hear &quot;not now&quot; with no explanation.</li>
            <li>Be blocked by invisible politics.</li>
            <li>Get ignored in the rooms that matter.</li>
          </ul>
        </div>
        </div>
      </CollapsibleSection>

      {/* Power-Interest Grid */}
      <CollapsibleSection
        title="2) The Power-Interest Grid (Your Most Important Stakeholder Tool)"
        icon={Grid3x3}
        completed={progress.map_power_interest}
        isOpen={activeSection === 'power_interest_section'}
        onToggle={() => handleStepClick('power_interest_section')}
        onToggleComplete={(completed) => handleProgressToggle('map_power_interest', completed)}
        sectionId="power_interest_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          This grid tells you <strong>who to engage, how often, and with what depth.</strong> In interviews, you can say: &quot;I used a Power-Interest Grid to prioritize stakeholder engagement.&quot;
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {page3Data.powerInterestGrid.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-300 overflow-hidden shadow-sm"
            >
              <div className={`${item.color} ${item.textColor} px-4 py-3`}>
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">{item.quadrant}</div>
                <div className="text-lg font-bold mt-1">{item.label}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Examples</div>
                <ul className="space-y-1 mb-3">
                  {item.stakeholders.map((s) => (
                    <li key={s} className="text-sm text-slate-800">• {s}</li>
                  ))}
                </ul>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">How to Engage</div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{item.approach}</p>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                  <strong>In interviews:</strong> {item.interviewTip}
                </div>
              </div>
            </div>
          ))}
        </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <Grid3x3 size={16} className="inline mr-2" />
            <strong>Pro tip:</strong> High-power stakeholders shape decisions. High-interest stakeholders surface risks. Map both axes before your first meeting.
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="3) Stakeholder Intent & Pressure Signals"
        icon={ShieldAlert}
        completed={progress.identify_pressure}
        isOpen={activeSection === 'pressure_section'}
        onToggle={() => handleStepClick('pressure_section')}
        onToggleComplete={(completed) => handleProgressToggle('identify_pressure', completed)}
        sectionId="pressure_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">Look for what is unsaid. Pressure explains behaviour.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {page3Data.pressureSignals.map((signal) => (
            <div key={signal.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900 mb-2">{signal.name}</div>
              <p className="text-sm text-slate-700 leading-relaxed">{signal.signal}</p>
            </div>
          ))}
        </div>
          <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert size={16} />
              This isn&apos;t politics. It&apos;s reality. Understanding it keeps you safe.
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="4) The Human Reality"
        icon={Sparkles}
        completed={progress.identify_pressure}
        isOpen={activeSection === 'pressure_section'}
        onToggle={() => handleStepClick('pressure_section')}
        sectionId="pressure_section"
      >
        <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Stakeholders do <span className="font-semibold text-slate-700">not</span> want
            </div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>To be dazzled.</li>
              <li>To be impressed by frameworks.</li>
              <li>To be convinced that you’re competent.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">They want</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>To not waste time.</li>
              <li>To avoid embarrassment.</li>
              <li>To avoid being blamed when things go wrong.</li>
            </ul>
          </div>
        </div>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            A BA who understands this calms the room.
          </div>
        </div>
      </CollapsibleSection>

      {/* Task 1: Stakeholder Mapping */}
      <CollapsibleSection
        title={`5) Your Task: ${page3Data.taskTitle}`}
        icon={ClipboardList}
        completed={progress.complete_task}
        isOpen={activeSection === 'task_section'}
        onToggle={() => handleStepClick('task_section')}
        onToggleComplete={(completed) => handleProgressToggle('complete_task', completed)}
        sectionId="task_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          For each stakeholder, write:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-4">
          <li>Name & role</li>
          <li>Quadrant (High Power/High Interest, etc.)</li>
          <li>Engagement approach (how often, what depth)</li>
          <li>Communication channel preference</li>
          <li>Potential concerns or blockers</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={10}
          placeholder={page3Data.taskPlaceholder}
          value={stakeholderMap}
          onChange={(e) => setStakeholderMap(e.target.value)}
        />
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>How a BA would do this:</strong> They&apos;d create a simple table in Confluence or Excel with columns for Name, Role, Power/Interest, Engagement Frequency, Preferred Channel, and Key Concerns. Update it after each conversation.
          </div>
        </div>
      </CollapsibleSection>

      {/* Task 2: Narrative */}
      <CollapsibleSection
        title="6) Your Task: Write the Stakeholder Narrative"
        icon={FileText}
        completed={progress.write_narrative}
        isOpen={activeSection === 'narrative_section'}
        onToggle={() => handleStepClick('narrative_section')}
        onToggleComplete={(completed) => handleProgressToggle('write_narrative', completed)}
        sectionId="narrative_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          This isn&apos;t a table. It&apos;s a story you use when you speak to your PO, defend scope, and prevent derailment.
        </p>
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          Answer these questions in narrative form:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-700 mb-4">
          <li>Who is driving urgency?</li>
          <li>Who feels the pain daily?</li>
          <li>Who controls audit or reputational risk?</li>
          <li>Who decides priority?</li>
          <li>Who can block this quietly?</li>
          <li>Who must be protected from extra workload?</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={8}
          placeholder="Write your stakeholder narrative. Include urgency, pain, risk, decision rights, silent blockers, protection moves..."
          value={narrative}
          onChange={(event) => setNarrative(event.target.value)}
        />
        <div className="mt-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow">
          <div className="font-semibold">Want to compare with a working BA example?</div>
          <button
            onClick={handleOpenExample}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
          >
            Open example narrative walkthrough
            <ArrowRight size={14} />
          </button>
        </div>
        </div>
      </CollapsibleSection>

      <Section title="7) Slack / Teams Update (Copy & Adapt)">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          After mapping stakeholders, post an update. This shows you&apos;re structured and in control.
        </p>
        <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
            {page3Data.slackUpdate.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
          <strong>Why this works:</strong> This message tells everyone you&apos;re calm, methodical, and leading.
        </div>
      </Section>

      {showExample && (
        <div ref={exampleRef} className="mt-10 rounded-3xl border-2 border-indigo-300 bg-white p-6 shadow-xl">
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles size={18} />
            <h3 className="text-lg font-semibold">Example Narrative — How a BA Frames the Landscape</h3>
          </div>
          <p className="mt-3 text-sm text-slate-700">
            Use this to sense-check your own narrative. Notice how it blends urgency, risk, influence, and protection.
          </p>
          <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            {page3Data.exampleNarrative.map((line, index) => (
              <p key={index} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Notice how everything ties back to real pressures, baselines, and decision rights. That’s what creates trust.
          </div>
        </div>
      )}

          </div>

          {/* Right sidebar - context & guidance */}
          <div className="space-y-6">
            
            {/* Glossary */}
            <GlossarySidebar project={selectedProject} pageKey="whos-involved" />

            {/* BA Journey Sidebar */}
            <BAJourneySidebar />

          </div>
        </div>

        <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default StakeholderLandscape;

