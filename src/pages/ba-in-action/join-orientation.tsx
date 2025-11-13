import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useBAInActionProject } from "../../contexts/BAInActionProjectContext";
import { PAGE_1_DATA } from "../../ba-in-action/page1-data";
import type { AppView } from "../../types";
import { NavigationButtons } from "../../ba-in-action/common";
import { baInActionViewToPath, getBaInActionNavigation } from "../../ba-in-action/config";
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
const WelcomeEmail: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => (
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
const TeamsMeeting: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-[#464775] to-[#5b5d8f] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white">
        <Calendar size={16} />
        <span className="font-semibold text-base">Teams Meeting</span>
      </div>
      <div className="text-sm text-white/90">{data.meetingTime} – {data.meetingTime.replace(/\d+/, (m) => String(Number(m) + 0))}:30 (30 min)</div>
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
const AccessChecklist: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => {
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

      <CoachingHint title="Why this checklist exists">
        BAs can't analyze without access to systems and data. On day one, you're flagging blockers early. 
        If you can't access Jira or the data warehouse, you can't do your job — and that needs to be escalated, not ignored.
      </CoachingHint>
    </div>
  );
};

// --- Project Brief Component ---
const ProjectBrief: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
      <div className="text-base font-semibold text-slate-900">{data.attachmentName} (extract)</div>
      <FileText size={16} className="text-indigo-600" />
    </div>
    <div className="p-4 text-base text-slate-800 space-y-4 leading-relaxed">
      <div>
        <div className="font-semibold text-slate-900 mb-2">The Problem</div>
        <div>{data.onePager.problem}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3">
        {data.onePager.impactStats.map((stat, idx) => (
          <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-rose-700">{stat.value}</div>
            <div className="text-xs text-rose-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200">
        <div className="font-semibold text-slate-900 mb-2">The Goal</div>
        <div>{data.onePager.goal}</div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <div className="font-semibold text-slate-900 mb-2">Key Constraints</div>
        <ul className="space-y-1.5 text-sm">
          {data.onePager.constraints.map((constraint, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{constraint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-200">
        <div>
          <div className="font-semibold text-slate-900 mb-2">Success Metrics</div>
          <div className="space-y-2">
            {data.onePager.successMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-sm">
                <div className="font-medium text-slate-900">{metric.metric}</div>
                <div className="text-slate-700">
                  <span className="text-slate-500">{metric.baseline}</span>
                  <span className="mx-2 text-emerald-600 font-bold">→</span>
                  <span className="font-semibold text-emerald-700">{metric.target}</span>
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
const StakeholderTable: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
      <div className="text-base font-semibold text-slate-900">Key Stakeholders</div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Name & Role</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Cares About</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Fears</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">How to Engage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.stakeholders.map((sh, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900">{sh.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{sh.role}</div>
              </td>
              <td className="px-4 py-3 text-slate-700">{sh.care}</td>
              <td className="px-4 py-3 text-slate-700">{sh.fear}</td>
              <td className="px-4 py-3 text-slate-700">{sh.cue}</td>
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
const DiscoveryStarter: React.FC<{ data: typeof PAGE_1_DATA.cif }> = ({ data }) => {
  const { notes, saveNote } = useNotes();
  
  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="text-base font-semibold text-slate-900">Your Discovery Prep</div>
        <div className="text-xs text-slate-600 mt-1">What you need to clarify before Day 2</div>
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
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
      <div className="text-base font-semibold text-slate-900">{label}</div>
      <MessageSquare size={16} className="text-indigo-600" />
    </div>
    <div className="p-4">
      <textarea
        className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        rows={6}
        placeholder={placeholder || "Your notes..."}
        value={value || ""}
        onChange={(e) => save(noteKey, e.target.value)}
      />
      <div className="text-sm text-slate-500 mt-2">Auto-saved locally</div>
    </div>
  </div>
);

export default function BAInActionPage1() {
  const { notes, saveNote } = useNotes();
  const { selectedProject } = useBAInActionProject();
  const data = PAGE_1_DATA[selectedProject];
  const VIEW_ID: AppView = 'ba_in_action_join_orientation';
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-300 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">BA In Action</div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded">
                {selectedProject === 'cif' ? 'CI&F' : 'Voids'}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900">Day 1: Join & Orientation</div>
            <div className="text-sm text-slate-600 mt-1">{data.initiativeName}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={16} />
            <span>Today, 09:15</span>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Context banner */}
        <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-400 rounded-lg p-4 flex items-start gap-3 shadow-lg">
          <AlertCircle size={20} className="text-white mt-0.5 flex-shrink-0" />
          <div className="text-sm text-white leading-relaxed">
            <strong className="font-bold">You just started.</strong> You have an intro call at 11:00. 
            Before then, read the email, skim the brief, and prepare your first questions. 
            <span className="block mt-1 text-white/90">This is how real BA work begins — with context before analysis.</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            
            <WelcomeEmail data={data} />
            
            <ProjectBrief data={data} />
            
            <WorkingNotes
              label="Your notes: What you've spotted so far"
              noteKey="initial_notes"
              save={saveNote}
              value={notes["initial_notes"]}
              placeholder="Assumptions, unknowns, early signals of risk or constraint..."
            />

            <StakeholderTable data={data} />

            <DiscoveryStarter data={data} />

            <WorkingNotes
              label="Questions for the 11:00 call"
              noteKey="call_questions"
              save={saveNote}
              value={notes["call_questions"]}
              placeholder="6-8 single-threaded questions you'll ask today..."
            />

          </div>

          {/* Right: sidebar context */}
          <div className="space-y-6">
            
            <TeamsMeeting data={data} />
            
            <AccessChecklist data={data} />

            {/* Guidance card */}
            <div className="bg-gradient-to-br from-rose-600 to-pink-600 border-2 border-rose-400 rounded-lg p-4 shadow-lg">
              <div className="text-sm font-bold text-white mb-3">What you're building here</div>
              <div className="text-sm text-white/95 leading-relaxed space-y-2">
                <p>You're not learning definitions.</p>
                <p>You're establishing <strong className="text-white">context before analysis</strong> — the same way it happens in real organisations.</p>
                <p className="pt-2 border-t border-white/30">BAs don't start with requirements. They start with emails, briefings, people, and early signals of a problem.</p>
              </div>
            </div>

          </div>

        </div>

        <NavigationButtons backLink={backLink} nextLink={nextLink} />

      </div>
    </div>
  );
}
