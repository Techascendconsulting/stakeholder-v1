import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useBAInActionProject } from "../../contexts/BAInActionProjectContext";
import { PAGE_1_DATA, Page1Data } from "../../ba-in-action/page1-data";
import type { AppView } from "../../types";
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
  Target
} from "lucide-react";

/**
 * BA In Action – Day 1: Join & Orientation
 * Balance: Immersive work environment + coaching guidance
 * Now supports both CI&F and Voids projects
 */

function useNotes() {
  const [notes, setNotes] = useState<{[k: string]: string}>({});
  const saveNote = (key: string, value: string) => {
    setNotes((n) => ({ ...n, [key]: value }));
  };
  return { notes, saveNote };
}

// Coaching hint component - subtle, expandable
const CoachingHint: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-left text-sm font-semibold text-white hover:text-purple-100 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-2">
          <Lightbulb size={14} />
          {title}
        </span>
        <span className="text-xs text-white/80">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-2 text-sm text-white/95 leading-relaxed bg-purple-700/30">
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

// --- Email Component ---
const WelcomeEmail: React.FC<{data: Page1Data}> = ({data}) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="border-b border-slate-300 bg-slate-50 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Mail size={16} className="text-indigo-600" />
        <span className="font-semibold">Inbox</span>
        <span className="text-slate-400">›</span>
        <span className="text-slate-600">{data.emailSubject}</span>
      </div>
    </div>
    
    <div className="px-4 py-3 border-b border-slate-200 bg-white space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-base text-slate-900">{data.emailFrom}</div>
          <div className="text-sm text-slate-600">{data.emailFromEmail}</div>
        </div>
        <div className="text-sm text-slate-500">Today, 09:12</div>
      </div>
      <div className="text-sm text-slate-600">
        <span className="font-medium">To:</span> You
      </div>
      <div className="text-sm text-slate-600">
        <span className="font-medium">Subject:</span> {data.emailSubject}
      </div>
    </div>

    <div className="px-4 py-4 text-base text-slate-800 leading-relaxed space-y-3">
      <p>Hi —</p>
      
      <p>
        Welcome aboard. You'll be our Business Analyst on the <span className="font-semibold text-slate-900">"{data.initiativeName}"</span> initiative.
      </p>
      
      <p>
        I've set up a short intro call for <span className="font-semibold text-slate-900">{data.meetingTime} this morning</span> (link below). 
        Before we meet, please skim through the attached one-pager so we can hit the ground running.
      </p>
      
      <p>
        We'll align on the problem, key stakeholders, and what we need from you in the first 48 hours.
      </p>
      
      <p>Cheers,<br/>{data.emailFrom.split(' ')[0]}</p>

      <div className="pt-3 mt-4 border-t border-slate-200">
        <div className="text-sm font-medium text-slate-700 mb-2">Attachments (2)</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-700 hover:underline cursor-pointer">
            <Paperclip size={14} />
            <span>{data.attachmentName}</span>
            <span className="text-slate-400 text-sm">124 KB</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700 hover:underline cursor-pointer">
            <Link2 size={14} />
            <span>Teams: {data.teamsChannel}</span>
          </div>
        </div>
      </div>
    </div>

    <LookFor items={[
      "What's the initiative called? Write it down — you'll use it constantly.",
      "Who sent this? They're likely your first point of contact.",
      "When's the first meeting? What prep do they expect?",
      "What attachments exist? Those are your context documents."
    ]} />

    <CoachingHint title="Why emails matter to a BA">
      Real projects don't start with requirements docs. They start with communications like this. 
      A BA reads these to understand <strong>who's involved, what's urgent, and where the pressure is coming from</strong>. 
      Your job isn't to memorize it — it's to spot what you don't yet know and prepare questions.
    </CoachingHint>
  </div>
);

// --- Teams Meeting Component ---
const TeamsMeeting: React.FC<{data: Page1Data}> = ({data}) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-[#464775] to-[#5b5d8f] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white">
        <Calendar size={16} />
        <span className="font-semibold text-base">Teams Meeting</span>
      </div>
      <div className="text-sm text-white/90">{data.meetingTime} – {parseInt(data.meetingTime.split(':')[0]) + 0}:30 (30 min)</div>
    </div>

    <div className="p-4 space-y-3">
      <div>
        <div className="text-base font-semibold text-slate-900">{data.meetingTitle}</div>
        <div className="text-sm text-slate-600 mt-1">Today, {data.meetingTime} AM</div>
      </div>

      <div className="text-sm text-slate-700">
        <div className="font-semibold mb-2">Attendees</div>
        <div className="space-y-1">
          {data.meetingAttendees.map((attendee, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Users size={14} className="text-slate-400" />
              <span>{attendee.name} {attendee.role !== attendee.name && `(${attendee.role})`}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Purpose:</span> {data.meetingPurpose}
        </div>
      </div>

      <button className="w-full py-2.5 bg-[#464775] hover:bg-[#3d3f63] text-white text-sm font-medium rounded transition-colors">
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
const AccessChecklist: React.FC<{data: Page1Data}> = ({data}) => {
  const [checked, setChecked] = useState<{[k: string]: boolean}>({});

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="text-base font-semibold text-slate-900">Day 1 Checklist</div>
      </div>
      <div className="p-4">
        <div className="space-y-2.5">
          {data.checklistItems.map(item => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              <button 
                onClick={() => setChecked(prev => ({...prev, [item.id]: !prev[item.id]}))}
                className="mt-0.5"
              >
                {checked[item.id] ? (
                  <CheckSquare size={18} className="text-green-600" />
                ) : (
                  <Square size={18} className="text-slate-400" />
                )}
              </button>
              <div className="flex-1">
                <div className={`text-slate-800 ${checked[item.id] ? 'line-through text-slate-500' : ''}`}>
                  {item.task}
                </div>
                <div className="text-slate-500 text-sm mt-0.5">
                  {item.owner} • {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CoachingHint title="Why checklists matter">
        BAs don't wait for access to be granted. They track what's blocking them and chase it down. 
        Interviewers ask: "Tell me about a time when you had to navigate organizational barriers." 
        This is it — <strong>proactively clearing your own path</strong>.
      </CoachingHint>
    </div>
  );
};

// --- Project Brief (One-Pager) Component ---
const ProjectBrief: React.FC<{data: Page1Data}> = ({data}) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
      <div className="flex items-center gap-2 text-white">
        <FileText size={16} />
        <span className="font-semibold text-base">{data.attachmentName}</span>
      </div>
    </div>

    <div className="p-5 space-y-5 text-sm">
      {/* Problem */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">The Problem</div>
        <p className="text-base text-slate-800 leading-relaxed">{data.onePager.problem}</p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-3 gap-3">
        {data.onePager.impactStats.map((stat, idx) => (
          <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-rose-700">{stat.value}</div>
            <div className="text-xs text-rose-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Goal */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">The Goal</div>
        <p className="text-base text-slate-800 leading-relaxed">{data.onePager.goal}</p>
      </div>

      {/* Constraints */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">Key Constraints</div>
        <ul className="space-y-1.5">
          {data.onePager.constraints.map((constraint, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{constraint}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Stakeholders */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">Key Stakeholders</div>
        <div className="space-y-2">
          {data.onePager.keyStakeholders.map((sh, idx) => (
            <div key={idx} className="flex gap-3 text-sm">
              <div className="font-semibold text-slate-900 w-32 flex-shrink-0">{sh.name}</div>
              <div className="flex-1">
                <div className="text-slate-600 text-sm">{sh.role}</div>
                <div className="text-slate-700 text-sm mt-0.5">{sh.care}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">Expected Deliverables</div>
        <ul className="space-y-1.5">
          {data.onePager.deliverables.map((del, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700">
              <Target size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <span>{del}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Success Metrics */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">Success Metrics</div>
        <div className="space-y-2">
          {data.onePager.successMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <div className="font-medium text-slate-900 text-sm">{metric.metric}</div>
              <div className="text-sm text-slate-700">
                <span className="text-slate-500">{metric.baseline}</span>
                <span className="mx-2 text-emerald-600 font-bold">→</span>
                <span className="font-semibold text-emerald-700">{metric.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <LookFor items={[
      "What's the measurable problem? Not just the complaint.",
      "What constraints limit the solution? These define what's feasible.",
      "What does success look like? Numbers, not feelings.",
      "Who cares about what? Each stakeholder has different goals."
    ]} />

    <CoachingHint title="How BAs read one-pagers">
      You're not memorizing this. You're looking for: <strong>What's broken? Why does it matter? What's non-negotiable?</strong> 
      These answers shape every question you ask, every requirement you write, every trade-off you navigate.
    </CoachingHint>
  </div>
);

// --- Stakeholder Table Component ---
const StakeholderTable: React.FC<{data: Page1Data}> = ({data}) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
      <div className="text-base font-semibold text-slate-900">Stakeholder Analysis Grid</div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3 border-b border-slate-200">Name & Role</th>
            <th className="px-4 py-3 border-b border-slate-200">What They Care About</th>
            <th className="px-4 py-3 border-b border-slate-200">What They Fear</th>
            <th className="px-4 py-3 border-b border-slate-200">How to Engage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.stakeholders.map((sh, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900">{sh.name}</div>
                <div className="text-slate-600 text-xs mt-0.5">{sh.role}</div>
              </td>
              <td className="px-4 py-3 text-slate-700">{sh.care}</td>
              <td className="px-4 py-3 text-slate-700">{sh.fear}</td>
              <td className="px-4 py-3 text-slate-700">{sh.cue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <CoachingHint title="Why this grid matters in interviews">
      Interviewers ask: "How do you manage stakeholder expectations?" or "Tell me about navigating conflicting priorities." 
      <strong>This grid is your answer.</strong> You show that you understand people have different goals, fears, and communication styles — 
      and you adapt your approach accordingly.
    </CoachingHint>
  </div>
);

// --- Discovery Starter Component ---
const DiscoveryStarter: React.FC<{data: Page1Data}> = ({data}) => {
  const { notes, saveNote } = useNotes();

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="text-base font-semibold text-slate-900">Your Discovery Prep</div>
        <div className="text-xs text-slate-600 mt-1">What you need to figure out before Day 2</div>
      </div>

      <div className="p-4 space-y-5">
        {data.tasks.map((task, idx) => (
          <div key={idx}>
            <div className="text-sm font-semibold text-slate-900 mb-2">{task.title}</div>
            <textarea
              className="w-full min-h-[100px] text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder={task.placeholder}
              value={notes[`task_${idx}`] || ''}
              onChange={(e) => saveNote(`task_${idx}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      <CoachingHint title="Why BAs prepare questions first">
        You don't walk into meetings unprepared. <strong>Stakeholders respect BAs who come with structure.</strong> 
        These questions show you've read the brief, understood the context, and you're focused on reducing uncertainty — not just taking notes.
      </CoachingHint>
    </div>
  );
};

// --- Working Notes Component ---
const WorkingNotes: React.FC<{
  title: string;
  placeholder: string;
  hint: string;
}> = ({ title, placeholder, hint }) => {
  const [text, setText] = useState("");
  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="text-base font-semibold text-slate-900">{title}</div>
      </div>
      <div className="p-4">
        <textarea
          className="w-full min-h-[150px] text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <strong>Hint:</strong> {hint}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function BAInActionPage1() {
  const { setCurrentView } = useApp();
  const { selectedProject } = useBAInActionProject();
  const data = PAGE_1_DATA[selectedProject];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Day 1: Join & Orientation</h1>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-bold rounded-full">
              {selectedProject === 'cif' ? 'CI&F' : 'Voids'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your first day as BA on the {data.initiativeName} project
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <Clock size={32} className="flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome to Your First Day</h2>
              <p className="text-white/90 leading-relaxed">
                Today isn't about delivering anything. It's about <strong>absorbing context, mapping people, and preparing intelligent questions</strong>. 
                By the end of today, you should know: <em>What's the problem? Who cares? What's non-negotiable?</em>
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Email */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              1
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Email</h2>
          </div>
          <WelcomeEmail data={data} />
        </div>

        {/* Teams Meeting */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              2
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kickoff Meeting Invite</h2>
          </div>
          <TeamsMeeting data={data} />
        </div>

        {/* Access Checklist */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              3
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Day 1 Setup</h2>
          </div>
          <AccessChecklist data={data} />
        </div>

        {/* Project Brief */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              4
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Brief (One-Pager)</h2>
          </div>
          <ProjectBrief data={data} />
        </div>

        {/* Stakeholder Grid */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              5
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Know Your Stakeholders</h2>
          </div>
          <StakeholderTable data={data} />
        </div>

        {/* Discovery Prep */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              6
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Prepare Your Questions</h2>
          </div>
          <DiscoveryStarter data={data} />
        </div>

        {/* Working Notes */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-lg font-bold shadow-md">
              7
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Working Notes</h2>
          </div>
          <WorkingNotes
            title="Day 1 Observations & Questions"
            placeholder="Capture anything that stood out, questions that arose, or things you need to clarify tomorrow..."
            hint="BAs take notes constantly. You're building a mental model of the project, the people, and the problem."
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mb-20">
          <button
            onClick={() => setCurrentView('ba-in-action-index' as AppView)}
            className="px-5 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Back to Overview
          </button>
          <button
            onClick={() => setCurrentView('ba_in_action_understand_problem' as AppView)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
          >
            Next: Day 2 →
          </button>
        </div>
      </div>
    </div>
  );
}

