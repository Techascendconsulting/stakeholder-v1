import React, { useRef, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useBAInActionProject } from "../../contexts/BAInActionProjectContext";
import { PAGE_2_DATA } from "../../ba-in-action/page2-data";
import type { AppView } from "../../types";
import { NavigationButtons } from "../../ba-in-action/common";
import { getBaInActionNavigation, baInActionViewToPath } from "../../ba-in-action/config";
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
  UserCircle2
} from "lucide-react";

/**
 * BA In Action – Day 2: Understand the Problem
 * Turn scattered meeting notes into a clear, defensible problem statement
 */

function useNotes(initialNotes: string = "") {
  const [notes, setNotes] = useState<{[k: string]: string}>({
    meeting_notes: initialNotes,
    problem_statement: "",
    engagement_plan: "",
  });
  const saveNote = (key: string, value: string) => {
    setNotes((n) => ({ ...n, [key]: value }));
  };
  return { notes, saveNote };
}

// Coaching hint component
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

// Section wrapper
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  step?: number;
}> = ({ title, icon, children, step }) => (
  <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
      {step && (
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
          {step}
        </div>
      )}
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        {icon}
      </div>
      <div className="text-base font-semibold text-slate-900">{title}</div>
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
  </div>
);

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

// Hero visual component (illustrated meeting scene)
const MeetingSceneVisual: React.FC<{ data: typeof PAGE_2_DATA.cif }> = ({ data }) => (
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
        <span>BA WorkXP • Teams</span>
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

// Analysis work visual (person at desk with documents)
const AnalysisSceneVisual: React.FC = () => (
  <div className="relative w-full h-56 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg">
    {/* Desk setup */}
    <div className="absolute inset-0 flex items-end justify-center pb-8">
      {/* Desk surface */}
      <div className="relative w-4/5 h-32 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-2xl shadow-2xl">
        
        {/* Documents spread on desk */}
        <div className="absolute -top-4 left-[5%] w-24 h-32 bg-white rounded shadow-lg transform -rotate-6 border border-slate-200 p-2">
          <div className="text-[8px] font-mono text-slate-600 space-y-1">
            <div className="font-bold">Meeting Notes</div>
            <div className="h-1 bg-slate-200"></div>
            <div className="h-1 bg-slate-200 w-4/5"></div>
            <div className="h-1 bg-slate-200 w-3/5"></div>
          </div>
        </div>
        
        <div className="absolute -top-4 left-[25%] w-24 h-32 bg-white rounded shadow-lg transform rotate-3 border border-slate-200 p-2">
          <div className="text-[8px] font-mono text-slate-600 space-y-1">
            <div className="font-bold text-red-600">Problem Stmt</div>
            <div className="h-1 bg-slate-200"></div>
            <div className="h-1 bg-red-200 w-full"></div>
            <div className="h-1 bg-red-200 w-4/5"></div>
          </div>
        </div>
        
        {/* Laptop in center */}
        <div className="absolute -top-8 right-[25%] w-32 h-24 bg-gradient-to-b from-slate-300 to-slate-700 rounded-t-lg shadow-2xl">
          <div className="w-full h-4/5 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-t-lg p-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="h-2 bg-indigo-400 rounded"></div>
              <div className="h-2 bg-purple-400 rounded"></div>
              <div className="h-2 bg-cyan-400 rounded col-span-2"></div>
              <div className="h-2 bg-pink-400 rounded"></div>
              <div className="h-2 bg-blue-400 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Coffee cup */}
        <div className="absolute -top-2 right-[5%] w-8 h-10 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-2xl shadow-lg border-2 border-amber-300">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-800 to-amber-900"></div>
        </div>
        
        {/* Sticky notes */}
        <div className="absolute top-2 left-[50%] w-16 h-16 bg-yellow-200 shadow-md transform rotate-12 border-b-4 border-yellow-400 p-1">
          <div className="text-[8px] font-handwriting text-slate-700 space-y-0.5">
            <div>✓ Fraud ↑ 17%</div>
            <div>✓ SLA breach</div>
            <div className="text-red-600 font-bold">? Baseline?</div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Thought bubble above */}
    <div className="absolute top-8 right-8 bg-white rounded-2xl px-4 py-3 shadow-xl border-2 border-indigo-300">
      <div className="text-sm font-semibold text-indigo-900">Connecting the dots...</div>
      <div className="text-xs text-slate-600 mt-1">Evidence → Clarity → Plan</div>
    </div>
  </div>
);

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
          className="mt-4 text-sm font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1"
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
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
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
                <Target size={14} className="text-purple-600" />
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
  const [showExpert, setShowExpert] = useState(false);
  const expertRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-300 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                BA In Action
              </div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded">
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
        <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-400 rounded-lg p-4 flex items-start gap-3 shadow-lg">
          <AlertCircle size={20} className="text-white mt-0.5 flex-shrink-0" />
          <div className="text-sm text-white leading-relaxed">
            <strong className="font-bold">You've just come out of your intro call.</strong> You now have signals — but not clarity yet. 
            <span className="block mt-1 text-white/90">
              This page helps you turn scattered notes into a clear, defensible problem statement that you can share with stakeholders without embarrassing yourself or making assumptions.
            </span>
          </div>
        </div>

        {/* Visual: Meeting Scene */}
        <MeetingSceneVisual data={data} />

        {/* Meeting Transcript - Full Width */}
        <div className="mb-6">
          <MeetingTranscript data={data} />
        </div>
        
        {/* Visual: Analysis Work Scene */}
        <AnalysisSceneVisual />

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left column - main workflow */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Meeting notes */}
            <Section title="Your Meeting Notes (from the intro call)" icon={<MessageSquare size={18} className="text-indigo-600" />}>
              <p className="text-sm text-slate-600 italic">What you heard, not what you think.</p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            </Section>

            {/* Step 1 - Evidence */}
            <Section 
              title="Evidence Before Opinion" 
              icon={<BarChart3 size={18} className="text-indigo-600" />}
              step={1}
            >
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
            </Section>

            {/* Step 2 - Problem statement */}
            <Section 
              title="One-Sentence Problem Statement" 
              icon={<Target size={18} className="text-indigo-600" />}
              step={2}
            >
              <div className="text-sm text-white mb-3 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-400 rounded-lg shadow-md">
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
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">in</span>
                    <input 
                      type="text"
                      placeholder="flow/area..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">currently</span>
                    <input 
                      type="text"
                      placeholder="baseline metric..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">causing</span>
                    <input 
                      type="text"
                      placeholder="impact..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">We need to</span>
                    <input 
                      type="text"
                      placeholder="direction of change..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 whitespace-nowrap mt-2">without</span>
                    <input 
                      type="text"
                      placeholder="guardrail..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                <strong>This is the sentence you will say in meetings.</strong> When you say this sentence confidently, you sound like a BA who knows what they're doing.
              </div>
            </Section>

            {/* Step 3 - Success metrics */}
            <Section 
              title="What Success Looks Like (Measurable)" 
              icon={<TrendingUp size={18} className="text-indigo-600" />}
              step={3}
            >
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

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 shadow">
                <div className="text-sm font-semibold text-white">Want to compare against a full BA example?</div>
                <button
                  onClick={handleOpenExpert}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
                >
                  Open example walkthrough
                  <ArrowRight size={14} />
                </button>
              </div>
            </Section>

            {/* Step 4 - Scope */}
            <Section 
              title="Scope & Non-Goals (So You Don't Boil the Ocean)" 
              icon={<Target size={18} className="text-indigo-600" />}
              step={4}
            >
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
            </Section>

            {/* Step 5 - Constraints */}
            <Section 
              title="Constraints & Assumptions" 
              icon={<Shield size={18} className="text-indigo-600" />}
              step={5}
            >
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
            </Section>

            {/* Step 6 - Engagement plan */}
            <Section 
              title="The 48-Hour Engagement Plan" 
              icon={<Calendar size={18} className="text-indigo-600" />}
              step={6}
            >
              <div className="text-sm text-white mb-4 p-3 bg-gradient-to-r from-rose-600 to-pink-600 border-2 border-rose-400 rounded-lg shadow-md">
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
                  className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={8}
                  placeholder="Today:&#10;- Meet PO (align on wording + metrics)&#10;- Request Ops queue sample cases&#10;- Ask Data for last 12-week fraud loss + KYC funnel report&#10;&#10;Tomorrow:&#10;- Compliance review (confirm audit requirements)&#10;- Engineering feasibility check on risk-tiering logic"
                  value={notes.engagement_plan}
                  onChange={(e) => saveNote("engagement_plan", e.target.value)}
                />
              </div>

              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                This is what you are measured on this week, not "requirements."
              </div>
            </Section>

            {/* Step 7 - Stakeholder update */}
            <Section 
              title="Stakeholder Update Message (Copy + Paste)" 
              icon={<Send size={18} className="text-indigo-600" />}
              step={7}
            >
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
            </Section>

          </div>

          {/* Right sidebar - context & guidance */}
          <div className="space-y-6">
            
            {/* Progress indicator */}
            <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900 mb-3">Your Progress Today</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span>Meeting notes captured</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300"></div>
                  <span>Problem statement drafted</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300"></div>
                  <span>Baselines identified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300"></div>
                  <span>Engagement plan written</span>
                </div>
              </div>
            </div>

            {/* Key insight card */}
            <div className="bg-gradient-to-br from-rose-600 to-pink-600 border-2 border-rose-400 rounded-lg p-4 shadow-lg">
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
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-purple-100 text-purple-700 font-semibold text-xs flex-shrink-0">2</div>
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

