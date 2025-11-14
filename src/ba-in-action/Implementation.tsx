import React, { useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
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
  ArrowRight,
  Lightbulb,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Circle,
  RefreshCw,
  HelpCircle,
  ArrowRightCircle,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_implementation';

const HERO_IMAGE = '/images/collaborate1.jpg';

// --- Glossary Sidebar Component ---
const GlossarySidebar: React.FC<{ project: 'cif' | 'voids'; pageKey: string }> = ({ project, pageKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const terms = getGlossaryTerms(project, pageKey);

  if (terms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-2xl shadow-lg overflow-hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-all duration-200 bg-blue-50/30"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-600" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">Key Terms</span>
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

// --- Progress Tracking Hook ---
function useProgress() {
  const [progress, setProgress] = useState<{[k: string]: boolean}>(() => {
    const saved = localStorage.getItem('ba-action-implementation-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const markComplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: true };
      localStorage.setItem('ba-action-implementation-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markIncomplete = (step: string) => {
    setProgress((prev) => {
      const updated = { ...prev, [step]: false };
      localStorage.setItem('ba-action-implementation-progress', JSON.stringify(updated));
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
    { id: 'tools', label: 'Tools for Documentation', icon: FileText, sectionId: 'tools_section' },
    { id: 'excel_review', label: 'High-Level Requirements in Excel', icon: FileText, sectionId: 'excel_section' },
    { id: 'team', label: 'The Team: Developers & BAs', icon: Users, sectionId: 'team_section' },
    { id: 'waterfall_agile', label: 'Agile vs Waterfall with Developers', icon: HelpCircle, sectionId: 'waterfall_agile_section' },
    { id: 'scrum_ceremonies', label: 'Scrum Ceremonies (What BAs Do)', icon: Calendar, sectionId: 'scrum_section' },
    { id: 'decompose', label: 'Decomposing Requirements', icon: FileText, sectionId: 'decompose_section' },
    { id: 'story_mapping', label: 'Story Mapping (When Used)', icon: Target, sectionId: 'story_mapping_section' },
    { id: 'iterative_loop', label: 'The Iterative Loop', icon: RefreshCw, sectionId: 'iterative_section' },
  ];

  const total = steps.length;
  const completed = steps.filter(s => progress[s.id]).length;
  const percentage = (completed / total) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-2xl shadow-lg p-6 mb-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-900/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-white mb-1">Your BA Journey</div>
          <div className="text-xs text-slate-600 dark:text-gray-400">{completed} of {total} steps completed</div>
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
                <span className={`text-sm flex-1 font-medium ${completed ? 'text-emerald-900 dark:text-emerald-300 line-through' : isActive ? 'text-blue-900 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-gray-300'}`}>
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
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={`${completed ? 'text-emerald-600' : 'text-blue-600'}`} />
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
          <div className="text-base font-bold text-white">A BA's Approach to Implementation</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Start with high-level requirements</div>
                <div className="text-white/80 text-xs mt-0.5">From stakeholders: what problem to solve, what success looks like</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Decompose into detailed requirements</div>
                <div className="text-white/80 text-xs mt-0.5">Break down high-level into specific, testable statements</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Refine in team meetings</div>
                <div className="text-white/80 text-xs mt-0.5">Developers ask questions, you clarify, update requirements</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">During implementation, go back to stakeholders</div>
                <div className="text-white/80 text-xs mt-0.5">Edge cases appear, questions come up - you reach out for answers</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Iterate and refine</div>
                <div className="text-white/80 text-xs mt-0.5">Update requirements based on what you learn, keep stakeholders informed</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              In agile, you <strong>don't collect all requirements upfront</strong>. You start high-level, decompose as you go, and iterate based on what you learn during implementation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Implementation: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const { progress, markComplete, markIncomplete } = useProgress();
  const [activeSection, setActiveSection] = useState<string | null>('why_section');

  const handleProgressToggle = (step: string, completed: boolean) => {
    if (completed) {
      markComplete(step);
      // Close the section when marked complete
      const sectionMap: {[key: string]: string} = {
        'why_matters': 'why_section',
        'tools': 'tools_section',
        'excel_review': 'excel_section',
        'team': 'team_section',
        'waterfall_agile': 'waterfall_agile_section',
        'scrum_ceremonies': 'scrum_section',
        'decompose': 'decompose_section',
        'story_mapping': 'story_mapping_section',
        'iterative_loop': 'iterative_section',
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
        <PageTitle title="Implementation & Agile Approach" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">You have requirements. Now understand how they flow into implementation and how BAs work in agile teams.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Team collaborating on implementation"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <RefreshCw size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            From Problem Understanding to Implementation
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            You don't collect all requirements upfront. You start high-level, decompose as you go, and iterate based on what you learn. This is how requirements flow into implementation.
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
              Interviewers ask: <strong className="text-slate-900 dark:text-white">&quot;How do you work in an Agile environment?&quot;</strong> or <strong className="text-slate-900 dark:text-white">&quot;What's the difference between waterfall and agile?&quot;</strong>
            </p>
            <p className="leading-relaxed">
              Understanding how requirements flow from problem understanding (Page 2) through to implementation is critical. This page shows you how.
            </p>
          </div>
        </div>
      </CollapsibleSection>

          {/* Tools for Documentation */}
          <CollapsibleSection
            title="1) Tools for Documentation"
            icon={FileText}
            completed={progress.tools}
            isOpen={activeSection === 'tools_section'}
            onToggle={() => handleStepClick('tools_section')}
            onToggleComplete={(completed) => handleProgressToggle('tools', completed)}
            sectionId="tools_section"
          >
            <div className="p-5">
              <div className="mb-4 space-y-4">
                <p className="text-base text-slate-800 dark:text-gray-300 leading-relaxed">
                  BAs use different tools to document requirements. The most popular ones are:
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
                    <div className="text-base font-bold text-blue-900 dark:text-blue-200 mb-2">Jira</div>
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                      The most popular tool for Agile teams. BAs create epics, user stories, and acceptance criteria. Developers track work, QA tests against ACs. Everything is linked and traceable.
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-4">
                    <div className="text-base font-bold text-indigo-900 dark:text-indigo-200 mb-2">Azure DevOps (ADO)</div>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                      Microsoft's tool for Agile teams. Similar to Jira - BAs create work items (epics, features, user stories), link requirements, track progress. Popular in enterprise environments.
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-4">
                    <div className="text-base font-bold text-purple-900 dark:text-purple-200 mb-2">Trello</div>
                    <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
                      Simpler tool using boards and cards. BAs create cards for user stories, move them through columns (To Do, In Progress, Done). Good for smaller teams or simpler projects.
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                    <div className="text-base font-bold text-emerald-900 dark:text-emerald-200 mb-2">Excel</div>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      Many BAs start with Excel for high-level requirements. Easy to share with stakeholders for review and sign-off. Often moved to Jira/ADO later for development tracking.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-900 dark:text-blue-200">
                  <strong>Key Point:</strong> The tool doesn't matter as much as the process. BAs document requirements, get stakeholder sign-off, and work with developers to break them down. The tool is just where you write it down.
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* High-Level Requirements in Excel */}
          <CollapsibleSection
            title="2) High-Level Requirements in Excel (Reviewed with Stakeholders)"
            icon={FileText}
            completed={progress.excel_review}
            isOpen={activeSection === 'excel_section'}
            onToggle={() => handleStepClick('excel_section')}
            onToggleComplete={(completed) => handleProgressToggle('excel_review', completed)}
            sectionId="excel_section"
          >
            <div className="p-5">
              <div className="mb-4 space-y-4">
                <p className="text-base text-slate-800 dark:text-gray-300 leading-relaxed">
                  Many BAs start by documenting high-level requirements in Excel. This is shared with stakeholders for review and sign-off before moving to development tools.
                </p>
                
                <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-5">
                  <div className="text-base font-bold text-emerald-900 dark:text-emerald-200 mb-3">Why Excel First?</div>
                  <div className="space-y-2 text-sm text-emerald-800 dark:text-emerald-300">
                    <p><strong>Stakeholders are familiar with Excel</strong> - They can review, comment, and sign off easily.</p>
                    <p><strong>Easy to share</strong> - Send via email, get feedback, update, resend.</p>
                    <p><strong>Good for high-level</strong> - Before breaking down into detailed user stories, you get alignment on the big picture.</p>
                    <p><strong>Sign-off happens here</strong> - Once stakeholders approve the Excel document, you move requirements to Jira/ADO for development.</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Example Excel Structure:</div>
                  <div className="text-xs text-slate-700 dark:text-gray-300 space-y-1">
                    <p><strong>Column A:</strong> Requirement ID (REQ-001, REQ-002...)</p>
                    <p><strong>Column B:</strong> High-Level Requirement (e.g., "Evaluate identity risk at account creation")</p>
                    <p><strong>Column C:</strong> Business Outcome (e.g., "Reduce fraud losses by 30%")</p>
                    <p><strong>Column D:</strong> Stakeholder Sign-Off (Name, Date, Status: Approved/Rejected)</p>
                    <p><strong>Column E:</strong> Notes/Comments</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-4 text-sm text-purple-900 dark:text-purple-200">
                  <strong>After Sign-Off:</strong> Once stakeholders approve the Excel document, you break down the high-level requirements into detailed user stories and acceptance criteria in Jira/ADO. The Excel document becomes your source of truth for what was agreed.
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* The Team: Developers & BAs */}
          <CollapsibleSection
            title="3) The Team: Developers & BAs"
            icon={Users}
            completed={progress.team}
            isOpen={activeSection === 'team_section'}
            onToggle={() => handleStepClick('team_section')}
            onToggleComplete={(completed) => handleProgressToggle('team', completed)}
            sectionId="team_section"
          >
            <div className="p-5">
              <div className="mb-4 space-y-4">
                <p className="text-base text-slate-800 dark:text-gray-300 leading-relaxed">
                  As a BA, you work closely with developers (also called engineers or the engineering team). Understanding how you work together is critical.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
                    <div className="text-base font-bold text-blue-900 dark:text-blue-200 mb-2">Your Role (BA)</div>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed space-y-1">
                      <li>• Write requirements and acceptance criteria</li>
                      <li>• Clarify what needs to be built</li>
                      <li>• Answer questions during development</li>
                      <li>• Go back to stakeholders when needed</li>
                      <li>• Verify the solution meets requirements</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-4">
                    <div className="text-base font-bold text-indigo-900 dark:text-indigo-200 mb-2">Developer Role</div>
                    <ul className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed space-y-1">
                      <li>• Read your requirements</li>
                      <li>• Ask questions to clarify</li>
                      <li>• Build the solution</li>
                      <li>• Discover edge cases during coding</li>
                      <li>• Request clarification when stuck</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm text-emerald-900 dark:text-emerald-200">
                  <strong>Key Point:</strong> You're partners, not adversaries. Developers will ask questions - that's normal. Your job is to answer them, go back to stakeholders if needed, and keep requirements clear and up-to-date.
                </div>
              </div>
            </div>
          </CollapsibleSection>

      {/* Agile vs Waterfall with Developers */}
      <CollapsibleSection
        title="4) Agile vs Waterfall: How BAs Work with Developers"
        icon={HelpCircle}
        completed={progress.waterfall_agile}
        isOpen={activeSection === 'waterfall_agile_section'}
        onToggle={() => handleStepClick('waterfall_agile_section')}
        onToggleComplete={(completed) => handleProgressToggle('waterfall_agile', completed)}
        sectionId="waterfall_agile_section"
      >
        <div className="p-5">
          <div className="mb-4 space-y-4">
            <p className="text-base text-slate-800 dark:text-gray-300 leading-relaxed">
              There are two main ways teams deliver software. How you work with developers differs in each approach.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 p-5">
                <div className="text-base font-bold text-rose-900 dark:text-rose-200 mb-3">Waterfall Approach</div>
                <div className="space-y-2 text-sm text-rose-800 dark:text-rose-300">
                  <p><strong>How it works:</strong> Collect ALL requirements upfront. Design everything. Build everything. Test everything. Then launch.</p>
                  <p><strong>BA's work with developers:</strong> You write complete, detailed requirements before developers start coding. Developers read your requirements and build. Less back-and-forth during development.</p>
                  <p><strong>When to use:</strong> When requirements are unlikely to change, when you have clear specifications, or in regulated industries where you need full documentation first.</p>
                  <p><strong>BA's role:</strong> Extensive upfront requirements gathering. Hand off complete requirements to developers. Less iteration during build.</p>
                </div>
              </div>
              
              <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-5">
                <div className="text-base font-bold text-emerald-900 dark:text-emerald-200 mb-3">Agile Approach</div>
                <div className="space-y-2 text-sm text-emerald-800 dark:text-emerald-300">
                  <p><strong>How it works:</strong> Start with high-level requirements. Build in small chunks (2-week sprints). Get feedback. Refine. Build more.</p>
                  <p><strong>BA's work with developers:</strong> You start with high-level requirements. Developers ask questions during refinement and sprint planning. You clarify, update requirements, go back to stakeholders if needed. Continuous collaboration.</p>
                  <p><strong>When to use:</strong> When requirements might change, when you're learning as you go, or when you want to deliver value quickly and iterate.</p>
                  <p><strong>BA's role:</strong> Start high-level, decompose during implementation, answer developer questions, go back to stakeholders when needed. Iterative collaboration.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
              <div className="flex items-center gap-2 font-bold mb-2">
                <Lightbulb size={16} />
                Most Teams Use Agile
              </div>
              <p className="leading-relaxed">
                Most modern teams use Agile (specifically Scrum). This means you <strong>work closely with developers</strong> throughout the process. You don't hand off requirements and disappear - you collaborate, answer questions, and refine requirements as you learn.
              </p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Decomposing Requirements */}
      <CollapsibleSection
        title="6) Decomposing Requirements"
        icon={FileText}
        completed={progress.decompose}
        isOpen={activeSection === 'decompose_section'}
        onToggle={() => handleStepClick('decompose_section')}
        onToggleComplete={(completed) => handleProgressToggle('decompose', completed)}
        sectionId="decompose_section"
      >
        <div className="p-5">
          <div className="mb-4 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              <strong>Decomposition</strong> means breaking down high-level requirements into specific, detailed, testable statements. This happens during Backlog Refinement and Sprint Planning, often with developers asking questions.
            </p>
            
            <div className="rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-5">
              <div className="text-base font-bold text-purple-900 dark:text-purple-200 mb-3">How Decomposition Works:</div>
              <div className="space-y-3 text-sm text-purple-800 dark:text-purple-300">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-purple-900 dark:text-purple-200 mb-2">High-Level Requirement (From Page 6):</div>
                  <p className="text-slate-700 dark:text-gray-300">"Evaluate identity risk at account creation and output one of three decision states: approve automatically, block automatically, send to manual review."</p>
                </div>
                
                <div className="text-center text-purple-600 font-bold">↓ Decompose into User Stories</div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-purple-900 dark:text-purple-200 mb-2">User Story 1:</div>
                  <p className="text-slate-700 dark:text-gray-300 mb-1">As a Risk Engine, I want to auto-approve low-risk accounts, so that legitimate users sign up smoothly.</p>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-2"><strong>AC:</strong> Risk score ≥85 → Account approved automatically</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-purple-900 dark:text-purple-200 mb-2">User Story 2:</div>
                  <p className="text-slate-700 dark:text-gray-300 mb-1">As a Risk Engine, I want to route medium-risk accounts to manual review, so that we catch fraud without blocking legitimate users.</p>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-2"><strong>AC:</strong> Risk score 31-84 → Case routes to Ops queue</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-purple-900 dark:text-purple-200 mb-2">User Story 3:</div>
                  <p className="text-slate-700 dark:text-gray-300 mb-1">As a Risk Engine, I want to block high-risk accounts automatically, so that we prevent fraud immediately.</p>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-2"><strong>AC:</strong> Risk score ≤30 → Account blocked automatically</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
              <strong>Key Point:</strong> You don't decompose alone. Developers ask questions during refinement: "What if the score is exactly 85?" You answer, update the AC, get stakeholder sign-off if needed. This is collaborative decomposition.
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Story Mapping */}
      <CollapsibleSection
        title="7) Story Mapping (When Used)"
        icon={Target}
        completed={progress.story_mapping}
        isOpen={activeSection === 'story_mapping_section'}
        onToggle={() => handleStepClick('story_mapping_section')}
        onToggleComplete={(completed) => handleProgressToggle('story_mapping', completed)}
        sectionId="story_mapping_section"
      >
        <div className="p-5">
          <div className="mb-4 space-y-4">
            <p className="text-base text-slate-800 dark:text-gray-300 leading-relaxed">
              <strong>Story Mapping</strong> is a technique some BAs use to visualize the user journey and break down requirements. It's especially useful for complex features or when you need to see the big picture.
            </p>
            
            <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-5">
              <div className="text-base font-bold text-indigo-900 dark:text-indigo-200 mb-3">How Story Mapping Works:</div>
              <div className="space-y-3 text-sm text-indigo-800 dark:text-indigo-300">
                <p><strong>1. Map the user journey (left to right):</strong> You list the main steps a user takes to complete a task.</p>
                <p><strong>2. Break down each step (top to bottom):</strong> Under each step, you list user stories - from basic (must have) to nice-to-have.</p>
                <p><strong>3. Prioritize:</strong> The top row is your MVP (Minimum Viable Product). Everything below can come later.</p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Example: Account Creation Flow</div>
              <div className="text-xs text-slate-700 dark:text-gray-300 space-y-2">
                <div className="border-l-2 border-indigo-400 pl-2">
                  <p className="font-semibold">Step 1: User enters email</p>
                  <p className="text-slate-600 dark:text-gray-400 ml-2">• Basic: Validate email format (MVP)</p>
                  <p className="text-slate-600 dark:text-gray-400 ml-2">• Enhanced: Check if email already exists</p>
                </div>
                <div className="border-l-2 border-indigo-400 dark:border-indigo-600 pl-2">
                  <p className="font-semibold">Step 2: User enters password</p>
                  <p className="text-slate-600 dark:text-gray-400 ml-2">• Basic: Validate password strength (MVP)</p>
                  <p className="text-slate-600 dark:text-gray-400 ml-2">• Enhanced: Show password strength meter</p>
                </div>
                <div className="border-l-2 border-indigo-400 dark:border-indigo-600 pl-2">
                  <p className="font-semibold">Step 3: Risk evaluation</p>
                  <p className="text-slate-600 dark:text-gray-400 ml-2">• Basic: Calculate risk score (MVP)</p>
                  <p className="text-slate-600 dark:text-gray-400 ml-2">• Enhanced: Show risk score to user</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border-2 border-purple-300 bg-purple-50 p-4 text-sm text-purple-900">
              <strong>When to use:</strong> Story mapping is useful for complex features, when you need to see dependencies, or when stakeholders need to understand the full journey. Not all teams use it - it's a tool, not a requirement.
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* The Iterative Loop */}
      <CollapsibleSection
        title="8) The Iterative Loop: Going Back to Stakeholders During Implementation"
        icon={RefreshCw}
        completed={progress.iterative_loop}
        isOpen={activeSection === 'iterative_section'}
        onToggle={() => handleStepClick('iterative_section')}
        onToggleComplete={(completed) => handleProgressToggle('iterative_loop', completed)}
        sectionId="iterative_section"
      >
        <div className="p-5">
        <div className="mb-4 space-y-4">
            <p className="text-base text-slate-800 dark:text-gray-300 leading-relaxed">
              <strong>Critical Point:</strong> In Agile, you don't collect all requirements upfront. During implementation, developers will have questions. Edge cases will appear. <strong>You go back to stakeholders to get answers.</strong> This is normal and expected.
            </p>
            
          <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-5">
            <div className="text-base font-bold text-indigo-900 dark:text-indigo-200 mb-3">What Happens During Implementation:</div>
            <div className="space-y-3 text-sm text-indigo-800 dark:text-indigo-300">
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">1.</span>
                <div>
                  <strong>Developer asks a question:</strong> "What happens if the user's account is locked but they try to verify?"
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">2.</span>
                <div>
                  <strong>You don't know the answer</strong> - this is an edge case you didn't think of upfront
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">3.</span>
                <div>
                  <strong>You go back to the stakeholder:</strong> "Hi [Stakeholder], quick question - if a user's account is locked, should they still be able to verify their identity, or should we block them?"
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">4.</span>
                <div>
                  <strong>You get the answer and update requirements:</strong> Add this to the acceptance criteria or create a new requirement
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">5.</span>
                <div>
                  <strong>Developer continues building</strong> with the clarified requirement
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>This is not failure.</strong> This is how Agile works. Good BAs expect questions and are ready to go back to stakeholders. You're not expected to think of everything upfront - that's the whole point of Agile.
          </div>
        </div>
        </div>
      </CollapsibleSection>

        </div>

        {/* Right sidebar - context & guidance */}
        <div className="space-y-6">
          
          {/* Glossary */}
          <GlossarySidebar project={selectedProject} pageKey="implementation" />
          
          {/* BA Journey Sidebar */}
          <BAJourneySidebar />
          
        </div>
      </div>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default Implementation;

