import React, { useRef, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useBAInActionProject } from "../../contexts/BAInActionProjectContext";
import { PAGE_2_DATA } from "../../ba-in-action/page2-data";
import type { AppView } from "../../types";
import { NavigationButtons } from "../../ba-in-action/common";
import { getBaInActionNavigation, baInActionViewToPath } from "../../ba-in-action/config";
import { getGlossaryTerms } from "../../ba-in-action/glossary-data";
import { 
  Clock,
  AlertCircle,
  Lightbulb,
  Eye,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Code,
  Send,
  ArrowRight,
  Play,
  Volume2,
  UserCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  CheckSquare
} from "lucide-react";

/**
 * BA In Action – Day 2: Understand the Problem
 * Turn scattered meeting notes into a clear, defensible problem statement
 */

function useNotes(initialNotes: string = "") {
  const [notes, setNotes] = useState<{[k: string]: string}>(() => {
    const saved = localStorage.getItem('ba-action-problem-notes');
    return saved ? JSON.parse(saved) : {
      meeting_notes: initialNotes,
      problem_statement: "",
      engagement_plan: "",
    };
  });
  const saveNote = (key: string, value: string) => {
    setNotes((n) => {
      const updated = { ...n, [key]: value };
      localStorage.setItem('ba-action-problem-notes', JSON.stringify(updated));
      return updated;
    });
  };
  return { notes, saveNote };
}

// Progress tracking hook
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-problem-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-problem-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-problem-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const getProgress = () => {
    const steps = ['notes_captured', 'evidence_mapped', 'problem_stated', 'baselines_set', 'scope_defined', 'engagement_planned', 'update_sent'];
    const completed = steps.filter(s => progress[s]).length;
    return { completed, total: steps.length, percentage: (completed / steps.length) * 100 };
  };

  return { progress, markComplete, markIncomplete, getProgress };
}

// Coaching hint component
const CoachingHint: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 text-left text-sm font-semibold text-white hover:text-blue-50 flex items-center justify-between transition-all duration-200"
      >
        <span className="flex items-center gap-2">
          <Lightbulb size={16} className="animate-pulse" />
          {title}
        </span>
        <span className="text-xs text-white/80">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-2 text-sm text-white/95 leading-relaxed bg-blue-700/30">
          {children}
        </div>
      )}
    </div>
  );
};

// What to look for callout
const LookFor: React.FC<{items: string[]}> = ({ items }) => (
  <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 border-2 border-blue-400 shadow-md">
    <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
      <Eye size={14} />
      What to look for
    </div>
    <ul className="space-y-1 text-sm text-white/95">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="text-cyan-200 mt-0.5 font-bold">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// --- Progress Tracker Component ---
const ProgressTracker: React.FC<{
  progress: {[k: string]: boolean};
  activeSection: string | null;
  onStepClick: (stepId: string) => void;
  onToggle: (step: string, completed: boolean) => void;
}> = ({ progress, activeSection, onStepClick, onToggle }) => {
  const steps = [
    { id: 'notes_captured', label: 'Capture Meeting Notes', icon: MessageSquare, sectionId: 'notes_section' },
    { id: 'evidence_mapped', label: 'Map Evidence', icon: BarChart3, sectionId: 'evidence_section' },
    { id: 'problem_stated', label: 'Draft Problem Statement', icon: Target, sectionId: 'problem_section' },
    { id: 'baselines_set', label: 'Set Baselines & Targets', icon: TrendingUp, sectionId: 'baselines_section' },
    { id: 'scope_defined', label: 'Define Scope', icon: CheckSquare, sectionId: 'scope_section' },
    { id: 'engagement_planned', label: 'Plan Engagement', icon: Calendar, sectionId: 'engagement_section' },
    { id: 'update_sent', label: 'Send Update', icon: Send, sectionId: 'update_section' },
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
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div className={`bg-white border rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      completed ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white' : 'border-blue-200 bg-gradient-to-br from-white to-blue-50/20'
    }`}>
      <button
        onClick={handleToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/30 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {completed ? (
            <CheckCircle2 size={18} className="text-emerald-600" />
          ) : (
            <Circle size={18} className="text-slate-400" />
          )}
          <Icon size={20} className={`transition-all duration-300 ${completed ? 'text-emerald-600' : isOpen ? 'text-blue-600' : 'text-slate-500'}`} />
          <span className={`text-lg font-bold ${completed ? 'text-emerald-900 line-through' : isOpen ? 'text-blue-900' : 'text-slate-900'}`}>
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
          {isOpen ? (
            <ChevronDown size={18} className="text-slate-400" />
          ) : (
            <ChevronRight size={18} className="text-slate-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-blue-200/50 animate-in slide-in-from-top-2 fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

// Evidence table row
const EvidenceRow: React.FC<{
  signal: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
}> = ({ signal, source, confidence, notes }) => {
  const confidenceColor = {
    High: 'text-green-700 bg-green-100',
    Medium: 'text-amber-700 bg-amber-100',
    Low: 'text-red-700 bg-red-100',
  };
  
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-3 text-sm font-medium text-slate-900">{signal}</td>
      <td className="px-3 py-3 text-sm text-slate-700">{source}</td>
      <td className="px-3 py-3">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${confidenceColor[confidence]}`}>
          {confidence}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">{notes}</td>
    </tr>
  );
};

// KPI Target row
const KPIRow: React.FC<{
  kpi: string;
  baseline: string;
  target: string;
  guardrail: string;
}> = ({ kpi, baseline, target, guardrail }) => (
  <tr className="hover:bg-slate-50">
    <td className="px-3 py-3 text-sm font-medium text-slate-900">{kpi}</td>
    <td className="px-3 py-3 text-sm text-slate-700">
      <input 
        type="text" 
        placeholder="Enter baseline..." 
        defaultValue={baseline}
        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    </td>
    <td className="px-3 py-3 text-sm text-slate-700">{target}</td>
    <td className="px-3 py-3 text-sm text-slate-700">{guardrail}</td>
  </tr>
);

// Stakeholder engagement card
const EngagementCard: React.FC<{
  person: string;
  why: string;
  whatYouNeed: string;
  icon: React.ReactNode;
}> = ({ person, why, whatYouNeed, icon }) => (
  <div className="border border-slate-300 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-900 mb-1">{person}</div>
        <div className="text-sm text-slate-600 mb-2">
          <span className="font-medium">Why:</span> {why}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-medium">Need:</span> {whatYouNeed}
        </div>
      </div>
    </div>
  </div>
);

// Scope item with checkbox
const ScopeItem: React.FC<{label: string; checked?: boolean}> = ({ label, checked = false }) => {
  const [isChecked, setIsChecked] = useState(checked);
  return (
    <label className="flex items-start gap-2 text-sm text-slate-800 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
      <input 
        type="checkbox" 
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
        className="mt-0.5" 
      />
      <span>{label}</span>
    </label>
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
    <div className="bg-white border-2 border-blue-300 rounded-2xl shadow-lg overflow-hidden">
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
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-2xl p-6 shadow-xl relative overflow-hidden">
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
          <div className="text-base font-bold text-white">A BA's Approach After the Meeting</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Capture raw notes</div>
                <div className="text-white/80 text-xs mt-0.5">What was said, not what you think it means</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Separate evidence from assumptions</div>
                <div className="text-white/80 text-xs mt-0.5">What do you know vs. what you're guessing?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Draft problem statement</div>
                <div className="text-white/80 text-xs mt-0.5">One sentence that captures the core issue</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Identify what's missing</div>
                <div className="text-white/80 text-xs mt-0.5">What data, baselines, or clarity do you need?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Plan your next 48 hours</div>
                <div className="text-white/80 text-xs mt-0.5">Who to talk to, what to request, when</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You're not solving yet. You're <strong>establishing clarity</strong> so stakeholders agree on the problem before anyone builds solutions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified meeting visual - just a subtle background with icon
const MeetingSceneVisual: React.FC<{ data: typeof PAGE_2_DATA.cif }> = ({ data }) => (
  <div className="mb-6 rounded-2xl border border-blue-200 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 relative">
    {/* Subtle background image */}
    <div className="absolute inset-0 opacity-10">
      <img 
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60" 
        alt="Meeting" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="relative z-10 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <MessageSquare size={24} className="text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-slate-900">{data.meetingTitle}</div>
          <div className="text-sm text-slate-600">Yesterday, 11:00 AM • 28 minutes</div>
        </div>
      </div>
      <div className="text-sm text-slate-700 leading-relaxed bg-white/80 rounded-lg p-4 border border-blue-200">
        {data.meetingContext}
      </div>
    </div>
  </div>
);

// Removed AnalysisSceneVisual - too complex, replaced with simple icon-based visual if needed

// Hero visual component (illustrated meeting scene) - REMOVED, replaced with simplified version above
const MeetingSceneVisualOld: React.FC<{ data: typeof PAGE_2_DATA.cif }> = ({ data }) => (
  <div className="mb-6 rounded-2xl border border-slate-300 shadow-xl overflow-hidden bg-white">
    {/* Teams-style top bar */}
    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="font-semibold">{data.meetingTitle}</span>
        <span className="text-white/60">• 11:00 – 11:30</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-white/70">
        <span>Recording • On</span>
        <span>|</span>
        <span>BA WorkXP™ • Teams</span>
      </div>
    </div>

    <div className="grid md:grid-cols-[2fr,1fr]">
      {/* Main video area */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60')] bg-cover bg-center opacity-15" />
        <div className="relative z-10 w-5/6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="text-xl font-semibold text-white mb-2">{data.meetingTitle}</div>
          <div className="text-sm text-white/80 leading-relaxed">
            {data.meetingContext}
          </div>
        </div>

        {/* Participant bubbles */}
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          {data.attendees.map((person) => (
            <div key={person.name} className="relative">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${person.color} border-4 ${
                  person.name.includes('You') ? 'border-green-300 shadow-[0_0_30px_-10px_rgba(34,197,94,0.9)]' : 'border-white/40'
                } flex items-center justify-center text-white`}
              >
                <UserCircle2 size={20} />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white whitespace-nowrap">
                {person.name}
              </div>
              {person.speaking && (
                <span className="absolute -top-2 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Participant & chat column */}
      <div className="bg-slate-50 h-64 border-l border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Participants (4)</span>
          <span className="text-xs text-slate-500">Live captions on</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-xs text-slate-700">
          {data.stakeholderQuotes.map((stakeholder, idx) => {
            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
            return (
              <div key={idx} className="flex items-start gap-2">
                <div className={`mt-0.5 w-2 h-2 rounded-full ${colors[idx] || 'bg-slate-500'}`} />
                <div>
                  <div className="font-semibold text-slate-900">{stakeholder.name} • {stakeholder.role}</div>
                  <div className="text-slate-600">"{stakeholder.quote}"</div>
                </div>
              </div>
            );
          })}
          <div className="flex items-start gap-2">
            <div className="mt-0.5 w-2 h-2 rounded-full bg-green-500" />
            <div>
              <div className="font-semibold text-slate-900">You • Business Analyst</div>
              <div className="text-slate-600">"Clarifying baselines and guardrails before shaping recommendations."</div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-white text-xs text-slate-500 italic">
          Tip: Listen for tensions, deadlines, and missing data — then close the gaps.
        </div>
      </div>
    </div>
  </div>
);

// AnalysisSceneVisual removed - too complex, replaced with simpler approach

// Meeting transcript component
const MeetingTranscript: React.FC<{ data: typeof PAGE_2_DATA.cif }> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
            <Volume2 size={18} className="text-white" />
          </div>
          <div>
            <div className="text-base font-semibold text-white">Meeting Recording: Intro Call</div>
            <div className="text-xs text-white/70">Yesterday, 11:00 AM • 28 minutes</div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded transition-colors">
          <Play size={14} />
          <span>Play</span>
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-slate-600 mb-4 italic">
          This is what was said. Your job: listen for signals, not solutions.
        </p>
        
        <div className={`space-y-4 ${!expanded ? 'max-h-[400px] overflow-hidden relative' : ''}`}>
          {data.transcript.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${item.avatar} text-white text-xs font-bold flex-shrink-0`}>
                <UserCircle2 size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900 mb-1">{item.speaker}</div>
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3">
                  "{item.quote}"
                </div>
              </div>
            </div>
          ))}
          
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          )}
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Read full transcript'}
          <ArrowRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <LookFor items={[
        "Conflicting priorities (fraud vs conversion vs compliance vs ops capacity)",
        "What's urgent vs what's important (board meeting = deadline pressure)",
        "Where data is missing (need fraud breakdown by channel, exact SLA metrics)",
        "Who owns what (Marie = compliance gatekeeper, James = operational reality)"
      ]} />
    </div>
  );
};

// "What a BA Would Do" comparison
const ExpertComparison: React.FC<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => {
  return (
    <div className="relative z-40 max-w-5xl mx-auto bg-white border-2 border-indigo-300 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-yellow-300" />
          <div className="text-base font-bold text-white">Example: How a BA Could Frame It</div>
        </div>
        <button 
          onClick={onToggle}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded transition-colors"
        >
          {open ? 'Hide' : 'Show Example'}
        </button>
      </div>
      
      {open && (
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Problem Statement */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Target size={14} className="text-blue-600" />
                Problem Statement
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                "We are seeing <strong>fraud losses up +17% QoQ (£125k per week)</strong> and <strong>audit exposure on account-change verification</strong> in <strong>checkout and account flows</strong>, 
                currently with <strong>manual review queues breaching 24h SLA (40% late) and KYC drop-off spiking from 3% → 9%</strong>, 
                causing <strong>chargeback cost and customer attrition</strong>. 
                We need to <strong>introduce risk-based verification + better audit trail</strong> without <strong>degrading conversion below 95% baseline or overloading operations</strong>."
              </div>
            </div>

            {/* Key Insights */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Eye size={14} className="text-blue-600" />
                Key Insights Captured
              </div>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>Fraud spikes during promo periods; weekly loss now £125k</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>Compliance blocker: missing audit trail on account change approvals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>Manual review SLA = 24h; current performance only 60% on time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>Conversion baseline 95% → now 91% (drop-off at KYC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>Board deadline fixed (4 weeks) — sets engagement cadence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>Baselines validated with Finance & Analytics (weekly loss, drop-off, SLA data)</span>
                </li>
              </ul>
            </div>

            {/* Questions to Ask Next */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MessageSquare size={14} className="text-green-600" />
                Follow-Up Questions
              </div>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">→</span>
                  <span>Finance: Get fraud loss £/week trend (last 12 weeks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">→</span>
                  <span>Analytics: Baseline conversion rate pre-KYC changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">→</span>
                  <span>Ops: Sample of aged reviews (what causes delays?)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">→</span>
                  <span>Compliance: Exact audit requirement wording</span>
                </li>
              </ul>
            </div>

            {/* Engagement Priorities */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-orange-600" />
                Next 48 Hours
              </div>
              <div className="text-sm text-slate-700 space-y-2">
                <div><strong>Today:</strong> Request data from Finance (fraud trend) & Analytics (funnel)</div>
                <div><strong>Tomorrow AM:</strong> 30-min deep dive with Ops (review sample cases)</div>
                <div><strong>Tomorrow PM:</strong> Compliance alignment (audit language)</div>
                <div><strong>By tomorrow:</strong> Document confirmed baselines (fraud £, drop-off %, SLA %) in shared workspace</div>
                <div><strong>EOD Tomorrow:</strong> Share draft problem statement for feedback</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="text-sm font-bold text-amber-900 mb-2">Why This Works</div>
            <div className="text-sm text-amber-800 leading-relaxed">
              A BA doesn't guess. They <strong>extract evidence from the meeting</strong>, 
              <strong>identify what's missing</strong>, and <strong>create a 48-hour plan to fill the gaps</strong>. 
              Notice: no solutions yet, no requirements, no wireframes — just clarity on the problem and what success looks like.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
export default function UnderstandProblemPage() {
  const { selectedProject } = useBAInActionProject();
  const data = PAGE_2_DATA[selectedProject];
  const { notes, saveNote } = useNotes(data.initialMeetingNotes);
  const { progress, markComplete, markIncomplete, getProgress } = useProgress();
  const [showExpert, setShowExpert] = useState(false);
  const expertRef = useRef<HTMLDivElement | null>(null);

  // Accordion state - only one main section open at a time
  const [activeSection, setActiveSection] = useState<string | null>('notes_section'); // Start with first section open

  // Navigation setup
  const VIEW_ID: AppView = 'ba_in_action_understand_problem';
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  // Debug logging
  console.log('🔍 UnderstandProblemPage navigation:', { VIEW_ID, previous, next, backLink, nextLink });

  const handleOpenExpert = () => {
    setShowExpert(true);
    requestAnimationFrame(() => {
      expertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleProgressToggle = (step: string, completed: boolean) => {
    if (completed) {
      markComplete(step);
      // Close the section when marked complete
      const sectionMap: {[key: string]: string} = {
        'notes_captured': 'notes_section',
        'evidence_mapped': 'evidence_section',
        'problem_stated': 'problem_section',
        'baselines_set': 'baselines_section',
        'scope_defined': 'scope_section',
        'engagement_planned': 'engagement_section',
        'update_sent': 'update_section',
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

  const handleSectionToggle = (sectionId: string) => {
    // If clicking the same section, toggle it closed
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      // Open the clicked section (closes others automatically)
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-300 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BA In Action
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold rounded-full border border-blue-300">
                {selectedProject === 'cif' ? 'CI&F' : 'Voids'}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900">Day 2: Understand the Problem</div>
            <div className="text-sm text-slate-600 mt-1">{data.meetingTitle}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={16} />
            <span>Today, 09:45</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Context banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-2xl p-6 flex items-start gap-4 shadow-xl relative overflow-hidden">
          {/* Subtle background image */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/images/email.jpg" 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 flex items-start gap-4 w-full">
            <AlertCircle size={24} className="text-white mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="text-base text-white leading-relaxed">
              <strong className="font-bold text-lg">You've just come out of your intro call.</strong> You now have signals — but not clarity yet. 
              <span className="block mt-2 text-white/95">
                This page helps you turn scattered notes into a clear, defensible problem statement that you can share with stakeholders without embarrassing yourself or making assumptions.
              </span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker 
          progress={progress}
          activeSection={activeSection}
          onStepClick={handleStepClick}
          onToggle={handleProgressToggle}
        />

        {/* Simplified Meeting Visual */}
        <MeetingSceneVisual data={data} />

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left column - main workflow */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Meeting Transcript - Collapsible */}
            <CollapsibleSection
              title="Meeting Transcript"
              icon={Volume2}
              completed={progress.notes_captured}
              isOpen={activeSection === 'transcript_section'}
              onToggle={() => handleSectionToggle('transcript_section')}
              sectionId="transcript_section"
            >
              <div className="p-4">
                <MeetingTranscript data={data} />
              </div>
            </CollapsibleSection>

            {/* Meeting notes */}
            <CollapsibleSection
              title="Your Meeting Notes (from the intro call)"
              icon={MessageSquare}
              completed={progress.notes_captured}
              isOpen={activeSection === 'notes_section'}
              onToggle={() => handleSectionToggle('notes_section')}
              onToggleComplete={(completed) => handleProgressToggle('notes_captured', completed)}
              sectionId="notes_section"
            >
              <div className="p-4">
                <p className="text-sm text-slate-600 italic mb-4">What you heard, not what you think.</p>
                <textarea
                  className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  value={notes.meeting_notes}
                  onChange={(e) => saveNote("meeting_notes", e.target.value)}
                />
                
                <LookFor items={[
                  "Where outcomes conflict",
                  "Who is pushing urgency",
                  "What success means to each stakeholder",
                  "What nobody could answer confidently yet (important)"
                ]} />
              </div>
            </CollapsibleSection>

            {/* Step 1 - Evidence */}
            <CollapsibleSection
              title="Evidence Before Opinion"
              icon={BarChart3}
              completed={progress.evidence_mapped}
              isOpen={activeSection === 'evidence_section'}
              onToggle={() => handleSectionToggle('evidence_section')}
              onToggleComplete={(completed) => handleProgressToggle('evidence_mapped', completed)}
              sectionId="evidence_section"
            >
              <div className="p-4">
              <p className="text-sm text-slate-700">Look at what you <strong>know</strong> vs what you <strong>assume</strong>.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Signal</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Source</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Confidence</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <EvidenceRow
                      signal="Fraud loss +17% QoQ"
                      source="Finance weekly report"
                      confidence="High"
                      notes="Spike aligns with promo campaign"
                    />
                    <EvidenceRow
                      signal="9% drop-off at KYC step"
                      source="Analytics funnel"
                      confidence="High"
                      notes="Baseline was ~3%"
                    />
                    <EvidenceRow
                      signal="Manual reviews aging >48h"
                      source="Ops dashboard"
                      confidence="Medium"
                      notes="Need exact SLA definitions"
                    />
                    <EvidenceRow
                      signal="Audit flagged account-change flow"
                      source="Compliance memo"
                      confidence="High"
                      notes="Needs tracing: where is the weak control?"
                    />
                  </tbody>
                </table>
              </div>

                <CoachingHint title="Why this matters">
                  If you define the problem from assumption, you lose credibility. 
                  If you define it from signal, you become trusted.
                </CoachingHint>
              </div>
            </CollapsibleSection>

            {/* Step 2 - Problem statement */}
            <CollapsibleSection
              title="One-Sentence Problem Statement"
              icon={Target}
              completed={progress.problem_stated}
              isOpen={activeSection === 'problem_section'}
              onToggle={() => handleSectionToggle('problem_section')}
              onToggleComplete={(completed) => handleProgressToggle('problem_stated', completed)}
              sectionId="problem_section"
            >
              <div className="p-4">
              <div className="text-sm text-white mb-3 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-lg shadow-md">
                <strong className="font-bold">Template:</strong> We are seeing [unwanted outcome] in [flow/area], currently [baseline metric], causing [impact]. We need to [direction of change] without [guardrail].
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-900 mb-2">Compose yours:</div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">We are seeing</span>
                    <input 
                      type="text"
                      placeholder="unwanted outcome..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">in</span>
                    <input 
                      type="text"
                      placeholder="flow/area..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">currently</span>
                    <input 
                      type="text"
                      placeholder="baseline metric..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">causing</span>
                    <input 
                      type="text"
                      placeholder="impact..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">We need to</span>
                    <input 
                      type="text"
                      placeholder="direction of change..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">without</span>
                    <input 
                      type="text"
                      placeholder="guardrail..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                  <strong>This is the sentence you will say in meetings.</strong> When you say this sentence confidently, you sound like a BA who knows what they're doing.
                </div>
              </div>
            </CollapsibleSection>

            {/* Step 3 - Success metrics */}
            <CollapsibleSection
              title="What Success Looks Like (Measurable)"
              icon={TrendingUp}
              completed={progress.baselines_set}
              isOpen={activeSection === 'baselines_section'}
              onToggle={() => handleSectionToggle('baselines_section')}
              onToggleComplete={(completed) => handleProgressToggle('baselines_set', completed)}
              sectionId="baselines_section"
            >
              <div className="p-4">
              <p className="text-sm text-slate-700">Targets (not final — provisional until validated):</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">KPI</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Baseline</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Target</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Guardrail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <KPIRow
                      kpi="Fraud loss (£/week)"
                      baseline="£125k (last 4-week avg)"
                      target="Reduce by 30%"
                      guardrail="Do not degrade conversion"
                    />
                    <KPIRow
                      kpi="Checkout drop-off (KYC step)"
                      baseline="3% (pre-change) → 9% (current)"
                      target="≤ +5% above baseline"
                      guardrail="Maintain customer experience"
                    />
                    <KPIRow
                      kpi="Manual review queue aging"
                      baseline="40% >24h (current)"
                      target="90% < 24h"
                      guardrail="Ops cannot absorb infinite change"
                    />
                    <KPIRow
                      kpi="False positive rate"
                      baseline="4.5% (needs confirmation)"
                      target="≤ 3%"
                      guardrail="Avoid blocking good customers"
                    />
                  </tbody>
                </table>
              </div>

              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-900 space-y-2">
                <div>
                  <strong>Baseline = the current measured value</strong> before any changes. Confirm these figures with Finance/Analytics so everyone agrees on the starting point. Without a baseline, targets are guesses.
                </div>
                <ul className="text-xs text-indigo-800 list-disc list-inside space-y-1">
                  <li>Pull the last 8–12 weeks of data (Finance + Analytics).</li>
                  <li>Calculate the average and note any seasonal spikes.</li>
                  <li>Document the source (dashboard/report link) so others can verify.</li>
                  <li>Highlight any data gaps you still need to close.</li>
                </ul>
                <div className="text-xs text-indigo-700/80 italic">
                  Expectation for tomorrow: arrive with baselines validated and referenced in your shared notes.
                </div>
              </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 shadow">
                  <div className="text-sm font-semibold text-white">Want to compare against a full BA example?</div>
                  <button
                    onClick={handleOpenExpert}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors shadow"
                  >
                    Open example walkthrough
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </CollapsibleSection>

            {/* Step 4 - Scope */}
            <CollapsibleSection
              title="Scope & Non-Goals (So You Don't Boil the Ocean)"
              icon={Target}
              completed={progress.scope_defined}
              isOpen={activeSection === 'scope_section'}
              onToggle={() => handleSectionToggle('scope_section')}
              onToggleComplete={(completed) => handleProgressToggle('scope_defined', completed)}
              sectionId="scope_section"
            >
              <div className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <div className="font-semibold text-sm text-slate-900">In scope (first slice)</div>
                  </div>
                  <div className="space-y-1">
                    <ScopeItem label="Signup → Verification" checked />
                    <ScopeItem label="High-value orders" checked />
                    <ScopeItem label="Account detail change flows" checked />
                    <ScopeItem label="Risk-tiering rules" checked />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} className="text-red-600" />
                    <div className="font-semibold text-sm text-slate-900">Not in scope (for now)</div>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-start gap-2 p-2">
                      <span className="text-red-500">✗</span>
                      <span>Full identity provider replacement</span>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <span className="text-red-500">✗</span>
                      <span>Payment platform reform</span>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <span className="text-red-500">✗</span>
                      <span>Global identity policy rewrite</span>
                    </div>
                  </div>
                </div>
              </div>

                <CoachingHint title="Why non-goals matter">
                  If you don't state non-goals, someone will expand your scope for you.
                </CoachingHint>
              </div>
            </CollapsibleSection>

            {/* Step 5 - Constraints */}
            <CollapsibleSection
              title="Constraints & Assumptions"
              icon={Shield}
              completed={false}
              isOpen={activeSection === 'constraints_section'}
              onToggle={() => handleSectionToggle('constraints_section')}
              sectionId="constraints_section"
            >
              <div className="p-4">
              <div className="space-y-3">
                <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <div className="font-semibold text-sm text-red-900 mb-2">Constraints (must honor)</div>
                  <ul className="space-y-1 text-sm text-red-800">
                    <li className="flex items-start gap-2">
                      <Shield size={14} className="mt-0.5 flex-shrink-0" />
                      <span>Must meet AML/KYC regulatory standards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield size={14} className="mt-0.5 flex-shrink-0" />
                      <span>No &gt;5% drop in conversion (commercial pressure)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                  <div className="font-semibold text-sm text-blue-900 mb-2">Assumptions (test in next 48h)</div>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>Ops can adopt rule changes with light training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>Risk signals are sufficiently predictive</span>
                    </li>
                  </ul>
                </div>
              </div>
              </div>
            </CollapsibleSection>

            {/* Step 6 - Engagement plan */}
            <CollapsibleSection
              title="The 48-Hour Engagement Plan"
              icon={Calendar}
              completed={progress.engagement_planned}
              isOpen={activeSection === 'engagement_section'}
              onToggle={() => handleSectionToggle('engagement_section')}
              onToggleComplete={(completed) => handleProgressToggle('engagement_planned', completed)}
              sectionId="engagement_section"
            >
              <div className="p-4">
              <div className="text-sm text-white mb-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-lg shadow-md">
                <strong className="font-bold">Your goal is not to solve.</strong> Your goal is to get clarity that lets you scope the work.
              </div>

              <div className="grid gap-3">
                <EngagementCard
                  person="Product Owner"
                  why="Outcome definition, decision rights"
                  whatYouNeed="Confirm KPIs + guardrails"
                  icon={<Target size={18} className="text-blue-600" />}
                />
                <EngagementCard
                  person="Compliance Lead"
                  why="Red lines, audit language"
                  whatYouNeed='Clarify "acceptable risk"'
                  icon={<Shield size={18} className="text-blue-600" />}
                />
                <EngagementCard
                  person="Ops Lead"
                  why="Real process, queue pain"
                  whatYouNeed="Workflow screenshots + common exceptions"
                  icon={<Users size={18} className="text-blue-600" />}
                />
                <EngagementCard
                  person="Data/Analytics"
                  why="Baselines, dashboards"
                  whatYouNeed="Fraud loss trends + funnel breakdown"
                  icon={<BarChart3 size={18} className="text-blue-600" />}
                />
                <EngagementCard
                  person="Engineering Lead"
                  why="Feasibility"
                  whatYouNeed="Where checks currently fire + latency concerns"
                  icon={<Code size={18} className="text-blue-600" />}
                />
              </div>

              <div className="mt-4">
                <div className="font-semibold text-sm text-slate-900 mb-2">Write your actual plan:</div>
                <textarea
                  className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Today:&#10;- Meet PO (align on wording + metrics)&#10;- Request Ops queue sample cases&#10;- Ask Data for last 12-week fraud loss + KYC funnel report&#10;&#10;Tomorrow:&#10;- Compliance review (confirm audit requirements)&#10;- Engineering feasibility check on risk-tiering logic"
                  value={notes.engagement_plan}
                  onChange={(e) => saveNote("engagement_plan", e.target.value)}
                />
              </div>

                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                  This is what you are measured on this week, not "requirements."
                </div>
              </div>
            </CollapsibleSection>

            {/* Step 7 - Stakeholder update */}
            <CollapsibleSection
              title="Stakeholder Update Message (Copy + Paste)"
              icon={Send}
              completed={progress.update_sent}
              isOpen={activeSection === 'update_section'}
              onToggle={() => handleSectionToggle('update_section')}
              onToggleComplete={(completed) => handleProgressToggle('update_sent', completed)}
              sectionId="update_section"
            >
              <div className="p-4">
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
                <div className="text-sm text-slate-800 leading-relaxed space-y-2 font-mono">
                  <p>Drafting problem statement from initial context.</p>
                  <p>Need to confirm baselines for:</p>
                  <p className="pl-3">• Fraud loss (last 12-week trend)</p>
                  <p className="pl-3">• Checkout KYC drop-off vs historical baseline</p>
                  <p className="pl-3">• Manual review aging + exception paths</p>
                  <p className="pt-2">Will share draft targets + scope/non-goals EOD tomorrow for alignment.</p>
                </div>
              </div>

                <CoachingHint title="This is how a real BA communicates">
                  Calm. Structured. No panic. No overpromising. You're demonstrating control and professionalism.
                </CoachingHint>
              </div>
            </CollapsibleSection>

          </div>

          {/* Right sidebar - context & guidance */}
          <div className="space-y-6">
            
            {/* Glossary */}
            <GlossarySidebar project={selectedProject} pageKey="understand-problem" />
            
            {/* BA Journey Guide */}
            <BAJourneySidebar />

            {/* Key insight card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-lg p-4 shadow-lg">
              <div className="text-sm font-bold text-white mb-3">What you're building</div>
              <div className="text-sm text-white/95 leading-relaxed space-y-2">
                <p>You're not writing a document.</p>
                <p>You're establishing <strong className="text-white">shared understanding</strong> across stakeholders with different agendas.</p>
                <p className="pt-2 border-t border-white/30">This is the shift from reactive note-taker to strategic analyst.</p>
              </div>
            </div>

            {/* Visual: Analysis framework */}
            <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900 mb-3">BA Analysis Framework</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-100 text-blue-700 font-semibold text-xs flex-shrink-0">1</div>
                  <div className="text-xs text-slate-700">
                    <div className="font-semibold">Observe</div>
                    <div className="text-slate-600">Collect signals without bias</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-100 text-indigo-700 font-semibold text-xs flex-shrink-0">2</div>
                  <div className="text-xs text-slate-700">
                    <div className="font-semibold">Clarify</div>
                    <div className="text-slate-600">Define problem + success</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-green-100 text-green-700 font-semibold text-xs flex-shrink-0">3</div>
                  <div className="text-xs text-slate-700">
                    <div className="font-semibold">Validate</div>
                    <div className="text-slate-600">Test assumptions with data</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-100 text-amber-700 font-semibold text-xs flex-shrink-0">4</div>
                  <div className="text-xs text-slate-700">
                    <div className="font-semibold">Scope</div>
                    <div className="text-slate-600">Bound the work realistically</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Expert Comparison - Full Width at Bottom */}
        <div ref={expertRef} className="mt-8">
          <ExpertComparison
            open={showExpert}
            onToggle={() => setShowExpert((prev) => !prev)}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 w-full">
          <NavigationButtons backLink={backLink} nextLink={nextLink} />
        </div>

      </div>
    </div>
  );
}

