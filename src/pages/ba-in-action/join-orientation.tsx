import React, { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBAInActionProject } from "../../contexts/BAInActionProjectContext";
import { PAGE_1_DATA } from "../../ba-in-action/page1-data";
import type { AppView } from "../../types";
import { NavigationButtons } from "../../ba-in-action/common";
import { baInActionViewToPath, getBaInActionNavigation } from "../../ba-in-action/config";
import { getGlossaryTerms } from "../../ba-in-action/glossary-data";
import { 
  Mail, 
  Calendar,
  Users, 
  FileText, 
  Link2,
  Paperclip,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  MessageSquare,
  Lightbulb,
  Eye,
  Target,
  X,
  Download,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle
} from "lucide-react";

/**
 * BA In Action – Day 1: Join & Orientation
 * Balance: Immersive work environment + coaching guidance
 */

function useNotes() {
  const [notes, setNotes] = useState<{[k: string]: string}>({});
  const saveNote = (key: string, value: string) => {
    setNotes((n) => ({ ...n, [key]: value }));
  };
  return { notes, saveNote };
}

// Progress tracking hook
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const getProgress = () => {
    const steps = ['email_read', 'brief_reviewed', 'stakeholders_mapped', 'questions_prepared', 'access_checked'];
    const completed = steps.filter(s => progress[s]).length;
    return { completed, total: steps.length, percentage: (completed / steps.length) * 100 };
  };

  return { progress, markComplete, markIncomplete, getProgress };
}

// Coaching hint component - subtle, expandable
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
        <span className="text-xs text-white/90 font-medium transition-transform duration-200">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 text-sm text-white/95 leading-relaxed bg-blue-700/40 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

// What to look for callout
const LookFor: React.FC<{items: string[]}> = ({ items }) => (
  <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-300 shadow-md">
    <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
      <Eye size={16} className="animate-pulse" />
      What to look for
    </div>
    <ul className="space-y-2 text-sm text-white/95">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
          <span className="text-blue-100 mt-0.5 font-bold text-base">→</span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// --- PDF Attachment Modal ---
const PDFModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  fileName: string;
  data: typeof PAGE_1_DATA.cif;
}> = ({ isOpen, onClose, fileName, data }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Create a simple text representation of the document for download
    const content = `${fileName.replace('.pdf', '')}

The Problem
${data.onePager.problem}

Impact Statistics
${data.onePager.impactStats.map(s => `${s.label}: ${s.value}`).join('\n')}

The Goal
${data.onePager.goal}

Key Constraints
${data.onePager.constraints.map(c => `• ${c}`).join('\n')}

Success Metrics
${data.onePager.successMetrics.map(m => `${m.metric}: ${m.baseline} → ${m.target}`).join('\n')}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{fileName}</h2>
              <p className="text-sm text-slate-500 dark:text-gray-400">124 KB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-gray-700 rounded-md hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-base text-slate-800 dark:text-gray-300 space-y-4 leading-relaxed">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">The Problem</div>
              <div>{data.onePager.problem}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3">
              {data.onePager.impactStats.map((stat, idx) => (
                <div key={idx} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{stat.value}</div>
                  <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
              <div className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">The Goal</div>
              <div>{data.onePager.goal}</div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
              <div className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Key Constraints</div>
              <ul className="space-y-1.5 text-sm">
                {data.onePager.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-gray-300">
                    <AlertCircle size={14} className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-200 dark:border-gray-700">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Success Metrics</div>
                <div className="space-y-2">
                  {data.onePager.successMetrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">{metric.metric}</div>
                      <div className="text-slate-700 dark:text-gray-300">
                        <span className="text-slate-500 dark:text-gray-400">{metric.baseline}</span>
                        <span className="mx-2 text-emerald-600 dark:text-emerald-400 font-bold">→</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{metric.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Teams Channel Modal ---
const TeamsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  channelName: string;
}> = ({ isOpen, onClose, channelName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Link2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Teams Channel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Channel Name</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{channelName}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
              <p className="font-medium mb-2">About this channel:</p>
              <p>This is the main communication channel for the {channelName.includes('voids') ? 'Housing Voids Reduction Programme' : 'Customer Identity & Fraud Programme'}.</p>
              <p className="mt-2">Use this channel to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 dark:text-gray-400">
                <li>Share updates and ask questions</li>
                <li>Coordinate with team members</li>
                <li>Access shared resources and documents</li>
                <li>Get real-time project updates</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Progress Tracker Component ---
const ProgressTracker: React.FC<{
  progress: {[k: string]: boolean};
  activeSection: string | null;
  onStepClick: (stepId: string) => void;
  onToggle: (step: string, completed: boolean) => void;
}> = ({ progress, activeSection, onStepClick, onToggle }) => {
  const steps = [
    { id: 'email_read', label: 'Read Welcome Email', icon: Mail, sectionId: 'email_section' },
    { id: 'brief_reviewed', label: 'Review Project Brief', icon: FileText, sectionId: 'brief_section' },
    { id: 'stakeholders_mapped', label: 'Review Stakeholders', icon: Users, sectionId: 'stakeholders_section' },
    { id: 'questions_prepared', label: 'Prepare Questions', icon: MessageSquare, sectionId: 'questions_section' },
    { id: 'access_checked', label: 'Check Access', icon: CheckSquare, sectionId: 'access_section' },
  ];

  const { completed, total, percentage } = (() => {
    const completed = steps.filter(s => progress[s.id]).length;
    return { completed, total: steps.length, percentage: (completed / steps.length) * 100 };
  })();

  return (
    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-2xl shadow-lg p-6 mb-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-900/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-white mb-1">Your BA Journey</div>
          <div className="text-xs text-slate-600 dark:text-gray-400">{completed} of {total} steps completed</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-3 bg-blue-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400 min-w-[3rem]">{Math.round(percentage)}%</span>
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
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-400 dark:border-blue-600 shadow-md hover:shadow-lg' 
                    : completed 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-md' 
                      : 'bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm'
                }`}
              >
                <Icon size={18} className={`transition-all duration-300 ${completed ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-400 dark:text-gray-500'}`} />
                <span className={`text-sm flex-1 font-medium ${completed ? 'text-emerald-900 dark:text-emerald-300 line-through' : isActive ? 'text-blue-900 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-gray-300'}`}>
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
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      completed ? 'border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/20 dark:to-gray-800' : 'border-blue-200 dark:border-blue-700 bg-gradient-to-br from-white to-blue-50/20 dark:from-gray-800 dark:to-gray-900/50'
    }`}>
      <button
        onClick={handleToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {completed ? (
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Circle size={18} className="text-slate-400 dark:text-gray-500" />
          )}
          <Icon size={20} className={`transition-all duration-300 ${completed ? 'text-emerald-600 dark:text-emerald-400' : isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400'}`} />
          <span className={`text-lg font-bold ${completed ? 'text-emerald-900 dark:text-emerald-300 line-through' : isOpen ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
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
          {isOpen ? (
            <ChevronDown size={18} className="text-slate-400 dark:text-gray-500" />
          ) : (
            <ChevronRight size={18} className="text-slate-400 dark:text-gray-500" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-blue-200/50 dark:border-gray-700 animate-in slide-in-from-top-2 fade-in duration-300">
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
    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-2xl shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">Key Terms</span>
          <span className="text-xs text-slate-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
            {terms.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-slate-400 dark:text-gray-500" />
        ) : (
          <ChevronRight size={18} className="text-slate-400 dark:text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-blue-200/50 dark:border-gray-700 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {terms.map((item, idx) => (
              <div key={idx} className="border-b border-slate-100 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
                <div className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{item.term}</div>
                <div className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">{item.definition}</div>
                {item.context && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">{item.context}</div>
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
const BAJourneySidebar: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => {
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
          <div className="text-base font-bold text-white">A BA's First Hour</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Read the email</div>
                <div className="text-white/80 text-xs mt-0.5">Who sent it? What's urgent? What attachments?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Open the brief</div>
                <div className="text-white/80 text-xs mt-0.5">Problem, goal, constraints, metrics</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Map stakeholders</div>
                <div className="text-white/80 text-xs mt-0.5">Who cares? Who fears? How to engage?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Prepare questions</div>
                <div className="text-white/80 text-xs mt-0.5">What don't you know? What needs clarifying?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Check access</div>
                <div className="text-white/80 text-xs mt-0.5">Systems, data, tools you'll need</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You're not memorizing facts. You're identifying <strong>what you don't know</strong>, 
              <strong> who you need to talk to</strong>, and <strong>what's urgent</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Email Component ---
const WelcomeEmail: React.FC<{ 
  data: typeof PAGE_1_DATA.cif;
  onPDFOpen?: () => void;
}> = ({ data, onPDFOpen }) => {
  const { user } = useAuth();
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  
  // Get user's first name from name or email
  const userName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  
  const handlePDFClick = () => {
    setShowPDFModal(true);
    onPDFOpen?.();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl shadow-md overflow-hidden relative">
      {/* Subtle background image */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <img 
          src="/images/email.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10">
      <div className="border-b border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
          <Mail size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">Inbox</span>
          <span className="text-slate-400 dark:text-gray-500">›</span>
          <span className="text-slate-600 dark:text-gray-400">{data.emailSubject}</span>
        </div>
      </div>
      
      <div className="px-4 py-3 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-base text-slate-900 dark:text-white">{data.emailFrom}</div>
            <div className="text-sm text-slate-600 dark:text-gray-400">{data.emailFromEmail}</div>
          </div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Today, 09:12</div>
        </div>
        <div className="text-sm text-slate-600 dark:text-gray-400">
          <span className="font-medium">To:</span> You
        </div>
        <div className="text-sm text-slate-600 dark:text-gray-400">
          <span className="font-medium">Subject:</span> {data.emailSubject}
        </div>
      </div>

      <div className="px-4 py-4 text-base text-slate-800 dark:text-gray-300 leading-relaxed space-y-3">
        <p>Hi {userName},</p>
      
        <p>
          Welcome aboard. You'll be our Business Analyst on the <span className="font-semibold text-slate-900 dark:text-white">"{data.initiativeName}"</span> initiative.
        </p>
        
        <p>
          I've set up a short intro call for <span className="font-semibold text-slate-900 dark:text-white">{data.meetingTime} this morning</span> (link below). 
          Before we meet, please <strong>click the attached PDF</strong> to review the one-pager so we can hit the ground running.
        </p>
        
        <p>
          We'll align on the problem, key stakeholders, and what we need from you in the first 48 hours.
        </p>
        
        <p>Cheers,<br/>{data.emailFrom.split(' ')[0]}</p>

        <div className="pt-3 mt-4 border-t border-slate-200 dark:border-gray-700">
          <div className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Attachments (2)</div>
          <div className="space-y-2">
            <button
              onClick={handlePDFClick}
              className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer w-full text-left transition-colors"
            >
              <Paperclip size={14} />
              <span>{data.attachmentName}</span>
              <span className="text-slate-400 dark:text-gray-500 text-sm">124 KB</span>
            </button>
            <button
              onClick={() => setShowTeamsModal(true)}
              className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer w-full text-left transition-colors"
            >
              <Link2 size={14} />
              <span>Teams: {data.teamsChannel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PDFModal 
        isOpen={showPDFModal} 
        onClose={() => setShowPDFModal(false)}
        fileName={data.attachmentName}
        data={data}
      />
      <TeamsModal 
        isOpen={showTeamsModal} 
        onClose={() => setShowTeamsModal(false)}
        channelName={data.teamsChannel}
      />

      <LookFor items={[
        "What's the initiative called? Write it down — you'll use it constantly.",
        "Who sent this? They're likely your first point of contact.",
        "When's the first meeting? What prep do they expect?",
        "What attachments exist? Those are your context documents."
      ]} />

      <CoachingHint title="Why this communication matters to a BA">
        Real projects don't start with requirements docs. They start with communications like this — whether it's an email, 
        a Teams message from your Project Manager, a handoff from your Line Manager, or a brief from a Product Manager. 
        A BA reads these to understand <strong>who's involved, what's urgent, and where the pressure is coming from</strong>. 
        Your job isn't to memorize it — it's to spot what you don't yet know and prepare questions.
      </CoachingHint>
      </div>
    </div>
  );
};

// --- Teams Meeting Component ---
const TeamsMeeting: React.FC<{ 
  data: typeof PAGE_1_DATA.cif;
  onJoin?: () => void;
}> = ({ data, onJoin }) => (
  <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-[#464775] to-[#5b5d8f] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white">
        <Calendar size={16} />
        <span className="font-semibold text-base">Teams Meeting</span>
      </div>
      <div className="text-sm text-white/90">{data.meetingTime} – {data.meetingTime.replace(/\d+/, (m) => String(Number(m) + 0))}:30 (30 min)</div>
    </div>

    <div className="p-4 space-y-3">
      <div>
        <div className="text-base font-semibold text-slate-900 dark:text-white">{data.meetingTitle}</div>
        <div className="text-sm text-slate-600 dark:text-gray-400 mt-1">Today, {data.meetingTime} AM</div>
      </div>

      <div className="text-sm text-slate-700 dark:text-gray-300">
        <div className="font-semibold mb-2">Attendees</div>
        <div className="space-y-1">
          {data.meetingAttendees.map((attendee, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Users size={14} className="text-slate-400 dark:text-gray-500" />
              <span>{attendee.name} {attendee.role !== attendee.name && `(${attendee.role})`}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
        <div className="text-sm text-slate-700 dark:text-gray-300">
          <span className="font-semibold">Purpose:</span> {data.meetingPurpose}
        </div>
      </div>

      <button 
        onClick={onJoin}
        className="w-full py-2.5 bg-[#464775] hover:bg-[#3d3f63] text-white text-sm font-medium rounded transition-colors"
      >
        Join Meeting
      </button>
    </div>

    <LookFor items={[
      "Who's attending? Note their roles — each role has different concerns.",
      "What's the purpose? This tells you what they expect you to contribute.",
      "How much time do you have? 30 minutes means you need focused questions."
    ]} />
  </div>
);

// --- Checklist Component ---
const AccessChecklist: React.FC<{ 
  data: typeof PAGE_1_DATA.cif;
  onAllChecked?: () => void;
}> = ({ data, onAllChecked }) => {
  const [checked, setChecked] = useState<{[k: string]: boolean}>({});
  
  const handleToggle = (id: string) => {
    setChecked(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      // Check if all items are checked
      const allChecked = data.checklistItems.every(item => updated[item.id]);
      if (allChecked && onAllChecked) {
        onAllChecked();
      }
      return updated;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50">
        <div className="text-base font-semibold text-slate-900 dark:text-white">Day 1 Checklist</div>
      </div>
      <div className="p-4">
        <div className="space-y-2.5">
          {data.checklistItems.map(item => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              <button 
                onClick={() => handleToggle(item.id)}
                className="mt-0.5"
              >
                {checked[item.id] ? (
                  <CheckSquare size={18} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Square size={18} className="text-slate-400 dark:text-gray-500" />
                )}
              </button>
              <div className="flex-1">
                <div className={`text-slate-800 dark:text-gray-300 ${checked[item.id] ? 'line-through text-slate-500 dark:text-gray-500' : ''}`}>
                  {item.task}
                </div>
                <div className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">
                  {item.owner} • {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CoachingHint title="Why this checklist exists">
        BAs can't analyze without access to systems and data. On day one, you're flagging blockers early. 
        If you can't access Jira or the data warehouse, you can't do your job — and that needs to be escalated, not ignored.
      </CoachingHint>
    </div>
  );
};

// --- Project Brief Component ---
const ProjectBrief: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 flex items-center justify-between">
      <div className="text-base font-semibold text-slate-900 dark:text-white">{data.attachmentName}</div>
      <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <div className="p-4 text-base text-slate-800 dark:text-gray-300 space-y-4 leading-relaxed">
      <div>
        <div className="font-semibold text-slate-900 dark:text-white mb-2">The Problem</div>
        <div>{data.onePager.problem}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3">
        {data.onePager.impactStats.map((stat, idx) => (
          <div key={idx} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{stat.value}</div>
            <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
        <div className="font-semibold text-slate-900 dark:text-white mb-2">The Goal</div>
        <div>{data.onePager.goal}</div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
        <div className="font-semibold text-slate-900 dark:text-white mb-2">Key Constraints</div>
        <ul className="space-y-1.5 text-sm">
          {data.onePager.constraints.map((constraint, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-gray-300">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{constraint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-200 dark:border-gray-700">
        <div>
          <div className="font-semibold text-slate-900 dark:text-white mb-2">Success Metrics</div>
          <div className="space-y-2">
            {data.onePager.successMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{metric.metric}</div>
                <div className="text-slate-700 dark:text-gray-300">
                  <span className="text-slate-500 dark:text-gray-400">{metric.baseline}</span>
                  <span className="mx-2 text-emerald-600 dark:text-emerald-400 font-bold">→</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{metric.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <LookFor items={[
      "What's driving this? Look for urgency and leadership attention",
      "What's the trade-off? Identify competing priorities",
      "What does success look like? Targets tell you how they'll measure you",
      "What metrics will you track? KPIs = your ongoing evidence base"
    ]} />

    <CoachingHint title="How to read a brief as a BA">
      Don't just absorb it. Look for <strong>tension</strong> between competing goals, 
      <strong>constraints</strong> that limit solutions, and <strong>assumptions</strong> that need validating. 
      Your job isn't to agree or disagree yet — it's to understand what's been decided and what's still open.
    </CoachingHint>
  </div>
);

// --- Stakeholder Table ---
const StakeholderTable: React.FC<{ 
  data: typeof PAGE_1_DATA.cif;
  completed?: boolean;
  onToggleComplete?: (completed: boolean) => void;
}> = ({ data, completed, onToggleComplete }) => (
  <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50">
      <div className="text-base font-semibold text-slate-900 dark:text-white">Key Stakeholders</div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-gray-300">Name & Role</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-gray-300">Cares About</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-gray-300">Fears</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-gray-300">How to Engage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
          {data.stakeholders.map((sh, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900 dark:text-white">{sh.name}</div>
                <div className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">{sh.role}</div>
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-gray-300">{sh.care}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-gray-300">{sh.fear}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-gray-300">{sh.cue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <LookFor items={[
      "Who owns delivery? Note your main point of contact",
      "Who has veto power? Identify gatekeepers and constraints",
      "Who feels operational pain? They'll tell you what really happens",
      "What are their fears? This drives their questions and pushback"
    ]} />

    <CoachingHint title="Why stakeholders matter from day one">
      Each person has a different lens and different priorities. 
      <strong>Your questions to each will be different.</strong> A good BA maps this early so they don't waste time asking the wrong person the wrong thing.
    </CoachingHint>
  </div>
);

// --- Discovery Questions ---
const DiscoveryStarter: React.FC<{ 
  data: typeof PAGE_1_DATA.cif;
  completed?: boolean;
  onToggleComplete?: (completed: boolean) => void;
}> = ({ data, completed, onToggleComplete }) => {
  const { notes, saveNote } = useNotes();
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50">
        <div className="text-base font-semibold text-slate-900 dark:text-white">Your Discovery Prep</div>
        <div className="text-xs text-slate-600 dark:text-gray-400 mt-1">What you need to clarify before Day 2</div>
      </div>
      <div className="p-4 space-y-5">
        {data.tasks.map((task, idx) => (
          <div key={idx}>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{task.title}</div>
            <textarea
              className="w-full min-h-[100px] text-base text-slate-800 dark:text-gray-300 leading-relaxed focus:outline-none resize-none bg-slate-50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder={task.placeholder}
              value={notes[`task_${idx}`] || ''}
              onChange={(e) => saveNote(`task_${idx}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      <CoachingHint title="Why BAs prepare questions first">
        You don&apos;t walk into meetings unprepared. <strong>Stakeholders respect BAs who come with structure.</strong> 
        These questions show you&apos;ve read the brief, understood the context, and you&apos;re focused on reducing uncertainty — not just taking notes.
      </CoachingHint>
    </div>
  );
};

// --- Working Notes ---
const WorkingNotes: React.FC<{
  label: string;
  noteKey: string;
  save: (k: string, v: string) => void;
  value?: string;
  placeholder?: string;
}> = ({ label, noteKey, save, value, placeholder }) => (
  <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 flex items-center justify-between">
      <div className="text-base font-semibold text-slate-900 dark:text-white">{label}</div>
      <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <div className="p-4">
      <textarea
        className="w-full text-base text-slate-800 dark:text-gray-300 leading-relaxed focus:outline-none resize-none bg-slate-50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        rows={6}
        placeholder={placeholder || "Your notes..."}
        value={value || ""}
        onChange={(e) => save(noteKey, e.target.value)}
      />
      <div className="text-sm text-slate-500 dark:text-gray-400 mt-2">Auto-saved locally</div>
    </div>
  </div>
);

export default function BAInActionPage1() {
  const { notes, saveNote } = useNotes();
  const { progress, markComplete, markIncomplete, getProgress } = useProgress();
  const { selectedProject } = useBAInActionProject();
  const data = PAGE_1_DATA[selectedProject];
  const VIEW_ID: AppView = 'ba_in_action_join_orientation';
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  // Accordion state - only one main section open at a time
  const [activeSection, setActiveSection] = useState<string | null>('email_section'); // Start with first section open

  const handleProgressToggle = (step: string, completed: boolean) => {
    if (completed) {
      markComplete(step);
      // Close the section when marked complete
      const sectionMap: {[key: string]: string} = {
        'email_read': 'email_section',
        'brief_reviewed': 'brief_section',
        'stakeholders_mapped': 'stakeholders_section',
        'questions_prepared': 'questions_section',
        'access_checked': 'access_section',
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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/blue.jpg" 
          alt="" 
          className="w-full h-full object-cover opacity-10 dark:opacity-5"
        />
      </div>
      <div className="relative z-10">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-300 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">BA In Action</div>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-300 dark:border-blue-700">
                {selectedProject === 'cif' ? 'CI&F' : 'Voids'}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">Day 1: Join & Orientation</div>
            <div className="text-sm text-slate-600 dark:text-gray-400 mt-1">{data.initiativeName}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Clock size={16} />
            <span>Today, 09:15</span>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Progress Tracker */}
        <ProgressTracker 
          progress={progress}
          activeSection={activeSection}
          onStepClick={handleStepClick}
          onToggle={handleProgressToggle}
        />

        {/* Context banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-2xl p-6 flex items-start gap-4 shadow-xl relative overflow-hidden">
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
              <strong className="font-bold text-lg">You just started.</strong> You have an intro call at {data.meetingTime}. 
              Before then, read the email, review the brief, and prepare your first questions. 
              <span className="block mt-2 text-white/95">This is how real BA work begins — with context before analysis.</span>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Email */}
            <CollapsibleSection
              title="Welcome Email"
              icon={Mail}
              completed={progress.email_read}
              isOpen={activeSection === 'email_section'}
              onToggle={() => handleSectionToggle('email_section')}
              onToggleComplete={(completed) => handleProgressToggle('email_read', completed)}
              sectionId="email_section"
            >
              <div className="p-4">
                <WelcomeEmail 
                  data={data} 
                  onPDFOpen={() => {
                    handleProgressToggle('brief_reviewed', true);
                    // Auto-open brief section when PDF is opened
                    setActiveSection('brief_section');
                  }}
                />
              </div>
            </CollapsibleSection>

            {/* Step 2: Brief Review */}
            <CollapsibleSection
              title="Review Project Brief"
              icon={FileText}
              completed={progress.brief_reviewed}
              isOpen={activeSection === 'brief_section'}
              onToggle={() => handleSectionToggle('brief_section')}
              onToggleComplete={(completed) => handleProgressToggle('brief_reviewed', completed)}
              sectionId="brief_section"
            >
              <div className="p-6">
                <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-slate-800 dark:text-gray-300 leading-relaxed">
                    <strong className="text-blue-900 dark:text-blue-200">Note:</strong> You can also view this brief as a PDF by clicking the attachment in the email above, 
                    or download it for reference.
                  </div>
                </div>
                <ProjectBrief data={data} />
              </div>
            </CollapsibleSection>

            {/* Initial Notes */}
            <WorkingNotes
              label="Your notes: What you've spotted so far"
              noteKey="initial_notes"
              save={saveNote}
              value={notes["initial_notes"]}
              placeholder="Assumptions, unknowns, early signals of risk or constraint..."
            />

            {/* Step 3: Stakeholders */}
            <CollapsibleSection
              title="Review Stakeholders"
              icon={Users}
              completed={progress.stakeholders_mapped}
              isOpen={activeSection === 'stakeholders_section'}
              onToggle={() => handleSectionToggle('stakeholders_section')}
              onToggleComplete={(completed) => handleProgressToggle('stakeholders_mapped', completed)}
              sectionId="stakeholders_section"
            >
              <div className="p-4">
                <StakeholderTable 
                  data={data}
                  completed={progress.stakeholders_mapped}
                  onToggleComplete={(completed) => handleProgressToggle('stakeholders_mapped', completed)}
                />
              </div>
            </CollapsibleSection>

            {/* Step 4: Questions */}
            <CollapsibleSection
              title="Prepare Your Questions"
              icon={MessageSquare}
              completed={progress.questions_prepared}
              isOpen={activeSection === 'questions_section'}
              onToggle={() => handleSectionToggle('questions_section')}
              onToggleComplete={(completed) => handleProgressToggle('questions_prepared', completed)}
              sectionId="questions_section"
            >
              <div className="p-4">
                <DiscoveryStarter 
                  data={data}
                  completed={progress.questions_prepared}
                  onToggleComplete={(completed) => handleProgressToggle('questions_prepared', completed)}
                />
              </div>
            </CollapsibleSection>

            {/* Final Questions Notes */}
            <WorkingNotes
              label="Questions for the call"
              noteKey="call_questions"
              save={saveNote}
              value={notes["call_questions"]}
              placeholder="6-8 single-threaded questions you'll ask today..."
            />

          </div>

          {/* Right: sidebar context */}
          <div className="space-y-8">
            
            {/* Glossary */}
            <GlossarySidebar project={selectedProject} pageKey="join-orientation" />
            
            {/* BA Journey Guide */}
            <BAJourneySidebar data={data} />
            
            {/* Meeting */}
            <TeamsMeeting 
              data={data}
              onJoin={() => handleProgressToggle('questions_prepared', true)}
            />
            
            {/* Step 5: Access Checklist */}
            <CollapsibleSection
              title="Check Your Access"
              icon={CheckSquare}
              completed={progress.access_checked}
              isOpen={activeSection === 'access_section'}
              onToggle={() => handleSectionToggle('access_section')}
              onToggleComplete={(completed) => handleProgressToggle('access_checked', completed)}
              sectionId="access_section"
            >
              <div className="p-4">
                <AccessChecklist 
                  data={data}
                  onAllChecked={() => handleProgressToggle('access_checked', true)}
                />
              </div>
            </CollapsibleSection>

          </div>

        </div>

        <NavigationButtons backLink={backLink} nextLink={nextLink} />

      </div>
      </div>
    </div>
  );
}
