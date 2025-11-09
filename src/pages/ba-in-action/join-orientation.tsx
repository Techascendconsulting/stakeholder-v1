import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useBAInActionProject } from "../../contexts/BAInActionProjectContext";
import { PAGE_1_DATA } from "../../ba-in-action/page1-data";
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
const WelcomeEmail: React.FC = () => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="border-b border-slate-300 bg-slate-50 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Mail size={16} className="text-indigo-600" />
        <span className="font-semibold">Inbox</span>
        <span className="text-slate-400">›</span>
        <span className="text-slate-600">Welcome to the Customer Identity & Fraud Programme</span>
      </div>
    </div>
    
    <div className="px-4 py-3 border-b border-slate-200 bg-white space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-base text-slate-900">Ben Carter</div>
          <div className="text-sm text-slate-600">ben.carter@company.co.uk</div>
        </div>
        <div className="text-sm text-slate-500">Today, 09:12</div>
      </div>
      <div className="text-sm text-slate-600">
        <span className="font-medium">To:</span> You
      </div>
      <div className="text-sm text-slate-600">
        <span className="font-medium">Subject:</span> Welcome to the Customer Identity & Fraud Programme
      </div>
    </div>

    <div className="px-4 py-4 text-base text-slate-800 leading-relaxed space-y-3">
      <p>Hi —</p>
      
      <p>
        Welcome aboard. You'll be our Business Analyst on the <span className="font-semibold text-slate-900">"Customer Identity Verification & Fraud Reduction"</span> initiative.
      </p>
      
      <p>
        I've set up a short intro call for <span className="font-semibold text-slate-900">11:00 this morning</span> (link below). 
        Before we meet, please skim through the attached one-pager so we can hit the ground running.
      </p>
      
      <p>
        We'll align on the problem, key stakeholders, and what we need from you in the first 48 hours.
      </p>
      
      <p>Cheers,<br/>Ben</p>

      <div className="pt-3 mt-4 border-t border-slate-200">
        <div className="text-sm font-medium text-slate-700 mb-2">Attachments (2)</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-700 hover:underline cursor-pointer">
            <Paperclip size={14} />
            <span>CI&F Programme – One Pager (v3).pdf</span>
            <span className="text-slate-400 text-sm">124 KB</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700 hover:underline cursor-pointer">
            <Link2 size={14} />
            <span>Teams: #proj-cifraud</span>
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
const TeamsMeeting: React.FC = () => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-[#464775] to-[#5b5d8f] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white">
        <Calendar size={16} />
        <span className="font-semibold text-base">Teams Meeting</span>
      </div>
      <div className="text-sm text-white/90">11:00 – 11:30 (30 min)</div>
    </div>

    <div className="p-4 space-y-3">
      <div>
        <div className="text-base font-semibold text-slate-900">Intro: CI&F Programme</div>
        <div className="text-sm text-slate-600 mt-1">Today, 11:00 AM</div>
      </div>

      <div className="text-sm text-slate-700">
        <div className="font-semibold mb-2">Attendees</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>Ben Carter (Product Owner)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>Marie Dupont (Compliance)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>James Walker (Operations)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>You (Business Analyst)</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Purpose:</span> Get you context on the fraud problem, success metrics, and immediate priorities.
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
const AccessChecklist: React.FC = () => {
  const [checked, setChecked] = useState<{[k: string]: boolean}>({});
  
  const items = [
    { id: "vpn", task: "VPN & network access", owner: "IT", status: "Pending" },
    { id: "jira", task: "Jira & Confluence access", owner: "IT", status: "Pending" },
    { id: "teams", task: "Join #proj-cifraud channel", owner: "You", status: "Ready" },
    { id: "drive", task: "Shared drive permissions", owner: "IT", status: "Pending" },
    { id: "training", task: "Data protection & AML training", owner: "HR", status: "Scheduled" },
  ];

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="text-base font-semibold text-slate-900">Day 1 Checklist</div>
      </div>
      <div className="p-4">
        <div className="space-y-2.5">
          {items.map(item => (
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
const ProjectBrief: React.FC = () => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
      <div className="text-base font-semibold text-slate-900">CI&F Programme – One Pager (extract)</div>
      <FileText size={16} className="text-indigo-600" />
    </div>
    <div className="p-4 text-base text-slate-800 space-y-4 leading-relaxed">
      <div>
        <div className="font-semibold text-slate-900 mb-2">The Problem</div>
        <div>
          Fraudulent orders and account takeovers have increased <span className="font-semibold text-red-700">17% QoQ</span>. 
          Current KYC checkpoints are creating friction — <span className="font-semibold text-red-700">9% checkout drop-off</span>. 
          Leadership wants stronger verification <em>without</em> harming conversion.
        </div>
      </div>

      <div>
        <div className="font-semibold text-slate-900 mb-2">Hypothesis</div>
        <div>
          Introduce risk-based verification at high-risk touchpoints (signup, high-value orders, address changes) 
          while smoothing low-risk flows.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
        <div>
          <div className="font-semibold text-slate-900 mb-2">Targets</div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <Target size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>Reduce fraud loss 30% (2 quarters)</span>
            </li>
            <li className="flex items-start gap-2">
              <Target size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>Maintain conversion ≥ 95%</span>
            </li>
            <li className="flex items-start gap-2">
              <Target size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>Cut manual reviews 40%</span>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-900 mb-2">KPIs</div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>Fraud loss £/week</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>Manual review rate %</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>Checkout drop-off at KYC %</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <LookFor items={[
      "What's driving this? (17% fraud increase = urgency, leadership attention)",
      "What's the trade-off? (fraud vs. conversion — you'll hear both sides)",
      "What does success look like? (targets tell you how they'll measure you)",
      "What metrics will you track? (KPIs = your ongoing evidence base)"
    ]} />

    <CoachingHint title="How to read a brief as a BA">
      Don't just absorb it. Look for <strong>tension</strong> (fraud vs. conversion), 
      <strong>constraints</strong> (compliance, customer experience), and <strong>assumptions</strong> (e.g., "risk-based checks will work"). 
      Your job isn't to agree or disagree yet — it's to understand what's been decided and what's still open.
    </CoachingHint>
  </div>
);

// --- Stakeholder Table ---
const StakeholderTable: React.FC = () => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
      <div className="text-base font-semibold text-slate-900">Key Stakeholders</div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Name</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Role</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Cares About</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Concerned About</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr className="hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold text-slate-900">Ben Carter</td>
            <td className="px-4 py-3 text-slate-700">Product Owner</td>
            <td className="px-4 py-3 text-slate-700">Time-to-value, clear scope</td>
            <td className="px-4 py-3 text-slate-700">Scope creep, unclear reqs</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold text-slate-900">Marie Dupont</td>
            <td className="px-4 py-3 text-slate-700">Compliance</td>
            <td className="px-4 py-3 text-slate-700">KYC/AML alignment</td>
            <td className="px-4 py-3 text-slate-700">Regulatory breach</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold text-slate-900">James Walker</td>
            <td className="px-4 py-3 text-slate-700">Operations</td>
            <td className="px-4 py-3 text-slate-700">Manual workload, SLAs</td>
            <td className="px-4 py-3 text-slate-700">Queue backlogs</td>
          </tr>
        </tbody>
      </table>
    </div>

    <LookFor items={[
      "Who owns delivery? (Ben = Product Owner = your main point of contact)",
      "Who protects compliance? (Marie = regulatory gatekeeper)",
      "Who feels the operational pain? (James = will tell you what really happens)",
      "What are their fears? (concerns column = what keeps them up at night)"
    ]} />

    <CoachingHint title="Why stakeholders matter from day one">
      Each person has a different lens. Ben wants speed. Marie wants safety. James wants less manual work. 
      <strong>Your questions to each will be different.</strong> A good BA maps this early so they don't waste time asking the wrong person the wrong thing.
    </CoachingHint>
  </div>
);

// --- Discovery Questions ---
const DiscoveryStarter: React.FC = () => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
      <div className="text-base font-semibold text-slate-900">Discovery Questions (select 6–8 to ask today)</div>
    </div>
    <div className="p-4">
      <div className="text-sm text-white mb-4 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-400 rounded-lg shadow-md">
        <strong className="text-white font-bold">Tip:</strong> Keep each question single-threaded. Go for outcomes, constraints, or definitions — not solutions yet.
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-semibold text-sm text-slate-900 mb-2.5">Context & Outcomes</div>
          <div className="space-y-2 text-sm text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>What changed recently that made this a priority?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>If we do nothing, what happens in 3–6 months?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>What would "this worked" look like to you?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>Who else is affected by this decision?</span>
            </label>
          </div>
        </div>
        <div>
          <div className="font-semibold text-sm text-slate-900 mb-2.5">Process & Data</div>
          <div className="space-y-2 text-sm text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>Where in the journey do we verify identity today?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>What data drives the review decision? Who owns it?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>Where do exceptions go and how long do they sit?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input type="checkbox" className="mt-0.5" />
              <span>What's the manual review process today?</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <CoachingHint title="What makes a good discovery question">
      A good question <strong>narrows uncertainty</strong>. It's testable (you can verify the answer with data or policy). 
      It's single-threaded (one thing at a time). And it doesn't bundle a solution inside the question. 
      You're not asking <em>"Should we use biometric verification?"</em> — you're asking <em>"Where do exceptions go today?"</em>
    </CoachingHint>
  </div>
);

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
            
            <WelcomeEmail />
            
            <ProjectBrief />
            
            <WorkingNotes
              label="Your notes: What you've spotted so far"
              noteKey="initial_notes"
              save={saveNote}
              value={notes["initial_notes"]}
              placeholder="Assumptions, unknowns, early signals of risk or constraint..."
            />

            <StakeholderTable />

            <DiscoveryStarter />

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
            
            <TeamsMeeting />
            
            <AccessChecklist />

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

      </div>
    </div>
  );
}
