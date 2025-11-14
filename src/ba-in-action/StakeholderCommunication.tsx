import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_4_DATA } from './page4-data';
import {
  PageShell,
  PageTitle,
  Section,
  NavigationButtons,
} from './common';
import { baInActionViewToPath, getBaInActionNavigation } from './config';
import {
  Clock,
  Quote,
  Sparkles,
  ArrowRight,
  Users,
  AlertCircle,
  Mail,
  Video,
  MessageCircleMore,
  Phone,
  MessageCircle,
  Target,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  MessageSquare,
  Send,
  ClipboardList,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_stakeholder_communication';

// --- Progress Tracking Hook ---
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-communication-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-communication-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-communication-progress', JSON.stringify(updated));
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
    { id: 'why_matters', label: 'Understand Why It Matters', icon: AlertCircle, sectionId: 'why_section' },
    { id: 'choose_channel', label: 'Choose Communication Channel', icon: MessageCircleMore, sectionId: 'channels_section' },
    { id: 'conversation_scripts', label: 'Prepare Conversation Scripts', icon: Quote, sectionId: 'scripts_section' },
    { id: 'meeting_framework', label: 'Use 5-Step Meeting Framework', icon: ClipboardList, sectionId: 'framework_section' },
    { id: 'take_notes', label: 'Take Analytical Notes', icon: FileText, sectionId: 'notes_section' },
    { id: 'draft_message', label: 'Draft First Message', icon: MessageSquare, sectionId: 'draft_section' },
    { id: 'follow_up', label: 'Post Follow-Up', icon: Send, sectionId: 'followup_section' },
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
          <div className="text-base font-bold text-white">A BA's Approach to Stakeholder Communication</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Choose the right channel</div>
                <div className="text-white/80 text-xs mt-0.5">Email for formal, Teams for quick, video for complex</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Draft your first message</div>
                <div className="text-white/80 text-xs mt-0.5">Context, specific ask, suggested next step</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Run the meeting with structure</div>
                <div className="text-white/80 text-xs mt-0.5">Set frame, reflect, surface differences, clarify, define next steps</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Take analytical notes</div>
                <div className="text-white/80 text-xs mt-0.5">Capture meaning and decisions, not just words</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Follow up immediately</div>
                <div className="text-white/80 text-xs mt-0.5">Post summary in channel with decisions, owners, and next steps</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You're not just talking. You're <strong>building trust, creating decision trails, and managing expectations</strong> so stakeholders feel heard and projects stay on track.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StakeholderCommunication: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page4Data = PAGE_4_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const [firstMessage, setFirstMessage] = useState('');
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
        'choose_channel': 'channels_section',
        'conversation_scripts': 'scripts_section',
        'meeting_framework': 'framework_section',
        'take_notes': 'notes_section',
        'draft_message': 'draft_section',
        'follow_up': 'followup_section',
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

  // Map communication tool icons
  const communicationChannelsWithIcons = page4Data.communicationChannels.map((channel) => {
    let icon: React.ReactNode;
    if (channel.tool.includes('Teams') || channel.tool.includes('Slack') || channel.tool.includes('Channel')) {
      icon = <MessageCircleMore size={18} />;
    } else if (channel.tool === 'Email') {
      icon = <Mail size={18} />;
    } else if (channel.tool.includes('Video') || channel.tool.includes('Calls')) {
      icon = <Video size={18} />;
    } else if (channel.tool.includes('Walkthroughs') || channel.tool.includes('Phone') || channel.tool.includes('In-Person')) {
      icon = <Phone size={18} />;
    } else {
      icon = <MessageCircle size={18} />;
    }
    return { ...channel, icon };
  });

  const handleOpenExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="Stakeholder Communication" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">You understand the problem. Now you need to navigate the people.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src="/images/collaborate1.jpg"
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
            How a BA Navigates People, Politics & Influence
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            Stakeholder management isn&apos;t soft skills. It&apos;s structured influence. You identify power, map interest, choose channels, and communicate with intent. This page shows you how.
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
        title="1) Why Stakeholder Communication Matters (Especially for Interviews)"
        icon={AlertCircle}
        completed={progress.why_matters}
        isOpen={activeSection === 'why_section'}
        onToggle={() => handleStepClick('why_section')}
        onToggleComplete={(completed) => handleProgressToggle('why_matters', completed)}
        sectionId="why_section"
      >
        <div className="p-5">
          <div className="space-y-4 text-sm text-slate-800">
            <p className="leading-relaxed">
              Interviewers don&apos;t ask &quot;Do you know how to talk to people?&quot; They ask:{' '}
              <strong className="text-slate-900">"Tell me about a time when you had to manage conflicting stakeholder priorities."</strong>
            </p>
            <p className="leading-relaxed">
              Or: <strong className="text-slate-900">"How do you handle a stakeholder who is resistant to change?"</strong>
            </p>
            <p className="leading-relaxed">
              You need structured examples. This page gives you the frameworks, scripts, and tools that BAs use daily — so you can reference them confidently in interviews.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <AlertCircle size={16} className="inline mr-2" />
            <strong>Real BA work:</strong> You don&apos;t just &quot;communicate well.&quot; You choose channels strategically, lead conversations with intent, and document decisions clearly.
          </div>
        </div>
      </CollapsibleSection>

      {/* Communication Channels */}
      <CollapsibleSection
        title="2) Tools of Communication (When to Use Teams, Slack, Email, or Face-to-Face)"
        icon={MessageCircleMore}
        completed={progress.choose_channel}
        isOpen={activeSection === 'channels_section'}
        onToggle={() => handleStepClick('channels_section')}
        onToggleComplete={(completed) => handleProgressToggle('choose_channel', completed)}
        sectionId="channels_section"
      >
        <div className="p-5">
          <p className="text-sm text-slate-800 mb-4 leading-relaxed">
            BAs don&apos;t just &quot;send a message.&quot; They choose the right channel for the right purpose. Here&apos;s how:
          </p>
        <div className="space-y-4">
          {communicationChannelsWithIcons.map((channel) => (
            <div key={channel.tool} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600">
                  {channel.icon}
                </div>
                <div className="font-semibold text-slate-900 text-base">{channel.tool}</div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">When to use</div>
                  <p className="text-slate-700 leading-relaxed">{channel.when}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Tone</div>
                  <p className="text-slate-700 leading-relaxed">{channel.tone}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Example</div>
                  <p className="text-slate-700 italic leading-relaxed">{channel.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Pro tip:</strong> High-power stakeholders prefer structured, agenda-led meetings. Low-power, high-interest stakeholders prefer async updates (Slack/Teams) so they stay informed without meetings.
          </div>
        </div>
      </CollapsibleSection>

      {/* Conversation Scripts */}
      <CollapsibleSection
        title="3) Conversation Scripts for Each Stakeholder Type"
        icon={Quote}
        completed={progress.conversation_scripts}
        isOpen={activeSection === 'scripts_section'}
        onToggle={() => handleStepClick('scripts_section')}
        onToggleComplete={(completed) => handleProgressToggle('conversation_scripts', completed)}
        sectionId="scripts_section"
      >
        <div className="p-5">
          <p className="text-sm text-slate-800 mb-4 leading-relaxed">
            Copy these scripts. Adapt them. Use them in your BA WorkXP™ scenarios and reference them in interviews.
          </p>
        <div className="grid gap-4 md:grid-cols-2">
          {page4Data.conversationScripts.map((entry) => (
            <div key={entry.stakeholder} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-1">
                <Quote size={16} className="text-indigo-600" />
                {entry.stakeholder}
              </div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">Goal: {entry.goal}</div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-slate-800 italic mb-3">
                {entry.script}
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <strong>Why this works:</strong> {entry.why}
              </div>
            </div>
          ))}
        </div>
        </div>
      </CollapsibleSection>

      {/* Meeting Framework */}
      <CollapsibleSection
        title="4) The 5-Step BA Meeting Framework"
        icon={ClipboardList}
        completed={progress.meeting_framework}
        isOpen={activeSection === 'framework_section'}
        onToggle={() => handleStepClick('framework_section')}
        onToggleComplete={(completed) => handleProgressToggle('meeting_framework', completed)}
        sectionId="framework_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          This is the flow BAs use to lead meetings under pressure. Memorise it. Use it. Reference it in interviews.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Stage</th>
                <th className="px-5 py-3 border-b border-slate-200">What You Do</th>
                <th className="px-5 py-3 border-b border-slate-200">Example Script</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {page4Data.meetingFramework.map((row) => (
                <tr key={row.stage} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.stage}</td>
                  <td className="px-5 py-4 text-slate-700">{row.action}</td>
                  <td className="px-5 py-4 text-slate-700 italic">{row.script}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>In interviews:</strong> "I always open meetings by setting the frame — stating the purpose clearly — then reflecting what we know, surfacing differences, clarifying constraints, and defining next steps with owners. This keeps meetings productive and focused."
          </div>
        </div>
      </CollapsibleSection>

      {/* How You Take Notes */}
      <CollapsibleSection
        title="5) How You Take Notes (Analysis vs. Transcription)"
        icon={FileText}
        completed={progress.take_notes}
        isOpen={activeSection === 'notes_section'}
        onToggle={() => handleStepClick('notes_section')}
        onToggleComplete={(completed) => handleProgressToggle('take_notes', completed)}
        sectionId="notes_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Weak BAs transcribe. Strong BAs analyse. Your notes should capture meaning, not words.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {page4Data.notesComparison.map((comparison) => (
            <div key={comparison.type} className={`rounded-2xl border ${comparison.color} p-5 shadow-sm`}>
              <div className={`text-base font-semibold ${comparison.textColor} mb-3`}>{comparison.type}</div>
              <ul className="space-y-2">
                {comparison.notes.map((note) => (
                  <li key={note} className="text-sm text-slate-700 leading-relaxed">• {note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <strong>Your notes become the decision trail.</strong> They&apos;re referenced in requirements docs, user stories, and design sessions. Write them like you&apos;re building a case.
          </div>
        </div>
      </CollapsibleSection>

      {/* Task 1: Draft First Message */}
      <CollapsibleSection
        title="6) Your Task: Draft Your First Stakeholder Message"
        icon={MessageSquare}
        completed={progress.draft_message}
        isOpen={activeSection === 'draft_section'}
        onToggle={() => handleStepClick('draft_section')}
        onToggleComplete={(completed) => handleProgressToggle('draft_message', completed)}
        sectionId="draft_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Choose one stakeholder. Draft your first message to them in Teams/Slack. Include:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-4">
          <li>Context (why you&apos;re reaching out)</li>
          <li>What you need from them (specific, actionable)</li>
          <li>Suggested next step (meeting, async response, etc.)</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          rows={6}
          placeholder={page4Data.firstMessagePlaceholder}
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
        />
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <strong>Notice:</strong> Clear purpose. Specific ask. Suggested action. No fluff. That&apos;s how BAs communicate.
        </div>
        <div className="mt-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow">
          <div className="font-semibold">Want to see a worked example?</div>
          <button
            onClick={handleOpenExample}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
          >
            View example stakeholder map & message templates
            <ArrowRight size={14} />
          </button>
        </div>
        </div>
      </CollapsibleSection>

      {/* Follow-Up Message */}
      <CollapsibleSection
        title="7) Post-Meeting Follow-Up (Copy & Adapt for Slack/Teams)"
        icon={Send}
        completed={progress.follow_up}
        isOpen={activeSection === 'followup_section'}
        onToggle={() => handleStepClick('followup_section')}
        onToggleComplete={(completed) => handleProgressToggle('follow_up', completed)}
        sectionId="followup_section"
      >
        <div className="p-5">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          After every meeting, post a summary in the project channel. This builds trust and creates a decision trail.
        </p>
        <div className="rounded-2xl border border-slate-300 bg-slate-900 p-5 text-sm text-white shadow-lg font-mono leading-relaxed">
          {page4Data.followUpMessage.map((line, index) => (
            <p key={index} className={line.startsWith('  ') ? 'ml-4' : line.startsWith('•') ? '' : 'mb-2'}>
              {line}
            </p>
          ))}
        </div>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            This message tells everyone: <strong>you are calm, structured, reliable, and leading.</strong> That&apos;s how trust is earned.
          </p>
        </div>
      </CollapsibleSection>

            </div>

            {/* Right sidebar - context & guidance */}
            <div className="space-y-6">
              
              {/* Glossary */}
              <GlossarySidebar project={selectedProject} pageKey="stakeholder-communication" />

              {/* BA Journey Sidebar */}
              <BAJourneySidebar />
              
            </div>
          </div>

      {showExample && (
        <div
          ref={exampleRef}
          className="mt-10 rounded-3xl border-2 border-indigo-300 bg-white p-6 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles size={20} />
            <h3 className="text-xl font-bold">Example: Stakeholder Map & Message Templates</h3>
          </div>
          
          {/* Example Stakeholder Map */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-3">Example: {projectData.initiativeName} Stakeholder Mapping</h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-sm text-slate-800">
              {page4Data.exampleStakeholderMap.map((stakeholder, index) => (
                <div key={index} className={index < page4Data.exampleStakeholderMap.length - 1 ? 'pb-3 border-b border-slate-200' : ''}>
                  <p className="font-semibold text-slate-900">{stakeholder.name} ({stakeholder.role})</p>
                  <p className="text-xs text-slate-600 mt-1">Quadrant: {stakeholder.quadrant}</p>
                  <p className="mt-2 leading-relaxed">Engagement: {stakeholder.engagement}</p>
                  <p className="mt-1 leading-relaxed"><strong>{stakeholder.risk.includes('Ground truth') ? 'Value' : 'Risk'}:</strong> {stakeholder.risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example Message Templates */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-3">Example: First Message Templates</h4>
            <div className="space-y-4">
              {page4Data.exampleMessages.map((message, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">To: {message.to}</p>
                  <div className="font-mono text-sm text-slate-800 leading-relaxed space-y-2">
                    {message.content.map((line, lineIndex) => (
                      <p key={lineIndex} className={line.includes('[Your name]') ? 'text-slate-600' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                    <strong>Why this works:</strong> {message.why}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>This is how BAs build trust:</strong> They map stakeholders before engaging them. They adapt tone and channel. They follow through with documentation. It&apos;s not personality — it&apos;s process.
          </div>
        </div>
      )}

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default StakeholderCommunication;

