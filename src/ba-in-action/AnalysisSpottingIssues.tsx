import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import {
  PageShell,
  PageTitle,
  Section,
  NavigationButtons,
} from './common';
import { baInActionViewToPath, getBaInActionNavigation } from './config';
import {
  Clock,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_as_is_to_be';

const HERO_IMAGE = '/images/collaborate1.jpg';

const QUESTIONS_TO_ASK = [
  {
    category: 'As-Is Discovery',
    questions: [
      '"Walk me through what happens when [trigger event] occurs — show me the real version, not the documented one."',
      '"Where do you get stuck? What takes longer than it should?"',
      '"What workarounds have you built? Why did you need them?"',
      '"If I shadowed you for a day, what would surprise me?"',
    ],
    whatToDo: 'Listen for hesitation, sighs, "we usually just..." — these reveal pain. Map the actual sequence, not the ideal.',
    why: 'The documented process rarely matches reality. Real As-Is emerges from watching behavior under pressure.',
  },
  {
    category: 'Gap Analysis',
    questions: [
      '"Why does this process exist in this form? What was it originally built for?"',
      '"What changed since then? (volume, regulations, customer expectations)"',
      '"Where does the system assume something that\'s no longer true?"',
      '"What breaks when volume spikes or exceptions arrive?"',
    ],
    whatToDo: 'Compare original intent vs current reality. Document assumptions that no longer hold. Identify constraint vs preference.',
    why: 'Gaps exist where design assumptions diverged from reality. Understanding "why" prevents repeating the same mistake in To-Be.',
  },
  {
    category: 'To-Be Direction',
    questions: [
      '"If this worked perfectly, what would your day look like?"',
      '"What would you stop doing? What would you start seeing?"',
      '"What must stay the same? (non-negotiables, regulatory anchors)"',
      '"What does success look like in 6 months? How would we measure it?"',
    ],
    whatToDo: 'Capture desired outcomes, not features. Identify constraints early. Define success metrics with stakeholders.',
    why: 'To-Be is direction, not prescription. You need shared vision of success before designing solutions.',
  },
];

const AGILE_CONTEXT = {
  sprint: 'As-Is/Gap/To-Be analysis typically happens during Discovery or Sprint 0.',
  timing: 'Before writing user stories. This shapes what gets built.',
  deliverables: [
    'As-Is process map (visual or narrative)',
    'Gap analysis table (gap → reason → impact)',
    'To-Be direction statement (outcomes, not features)',
    'Success metrics agreed with PO',
  ],
  ceremonies: 'Present findings in Sprint Planning or Refinement. Use it to prioritize backlog based on pain points.',
};

const SIGNALS = [
  {
    signal: 'Workarounds',
    example: 'Ops exports CSV and filters “suspected fraud” manually.',
    meaning: 'The system is not solving the problem under load.',
  },
  {
    signal: 'Slack pings of “can someone check this?”',
    example: 'No defined path when exceptions arrive at pace.',
    meaning: 'Process is fragile; ownership unclear in reality.',
  },
  {
    signal: 'Multiple spreadsheets tracking the same metric',
    example: 'Finance, Ops, and PO each track separate fraud views.',
    meaning: 'Coordination gap, not a tooling gap. Decision latency.',
  },
  {
    signal: '“We just do it like that”',
    example: 'Legacy rule exists but no one remembers why.',
    meaning: 'Constraint may be artificial; challenge it with evidence.',
  },
];

const GAPS = [
  {
    gap: 'Verification thresholds are static',
    reason: 'System assumed stable behaviour; fraud patterns evolved.',
    impact: 'Spike in false results and Ops backlog.',
  },
  {
    gap: 'No feedback loop from manual decisions',
    reason: 'Model architecture not built for adaptive learning.',
    impact: 'Fraud patterns repeat; Ops re-fights same battles.',
  },
  {
    gap: 'Ops workflow unsupported by tooling',
    reason: 'Process evolved, UI did not. Reviews live in spreadsheets.',
    impact: 'Ops time wasted → SLA breach → customer frustration.',
  },
];

const TO_BE_POINTS = [
  'Risk-based verification with adaptive scoring.',
  'Fewer reviews; faster decisions with confidence.',
  'Feedback loop where outcomes retrain the model.',
  'Ops supported with clear prompts and workload visibility.',
  'Conversion protected while fraud is reduced.',
];

const NARRATIVE_NOW = [
  'Identity checks are static. Fraud behaviour shifts faster than control logic.',
  'Model does not learn from outcomes. Manual effort is a dead-end.',
  'Ops is overwhelmed — 40% of reviews breach the 24h SLA.',
  'Customer experience suffers: drop-offs, escalations, reputational noise.',
];

const NARRATIVE_FUTURE = [
  'Risk tiered dynamically; high-risk gets scrutiny, low-risk flows.',
  'System learns from outcomes — every decision feeds back.',
  'Ops sees what matters, not everything; workload fits capacity.',
  'Fraud reduction and conversion protection coexist.',
];

const AnalysisSpottingIssues: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  const [narrative, setNarrative] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const exampleRef = useRef<HTMLDivElement | null>(null);

  const openExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const toggleScript = (section: string) => {
    setExpandedScript(expandedScript === section ? null : section);
  };

  return (
    <PageShell>
      <PageTitle title="As-Is → Gaps → To-Be" />

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">You&apos;re moving from understanding the situation to explaining why it exists.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Business professionals collaborating on analysis"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <Layers size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            As-Is → Gap → To-Be: Map Reality, Explain Why, Show Direction
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            You&apos;re not documenting the ideal process. You&apos;re mapping what actually happens under pressure, identifying why gaps exist, and defining the direction that solves the real problem.
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section title="Why As-Is/Gap/To-Be Matters (Especially in Agile & Interviews)">
        <div className="space-y-3 text-base text-slate-800">
          <p className="leading-relaxed">
            Interviewers ask: <strong className="text-slate-900">&quot;How do you analyze existing processes?&quot;</strong> or <strong className="text-slate-900">&quot;Tell me about a time when you identified a gap between current state and desired outcome.&quot;</strong>
          </p>
          <p className="leading-relaxed">
            In Agile, this analysis happens during Discovery or Sprint 0. It shapes what gets built and why.
          </p>
        </div>
        <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-bold mb-2">
            <Target size={16} />
            Agile Context
          </div>
          <p className="mb-2"><strong>When:</strong> {AGILE_CONTEXT.sprint} {AGILE_CONTEXT.timing}</p>
          <p className="mb-2"><strong>Deliverables:</strong></p>
          <ul className="ml-4 space-y-1">
            {AGILE_CONTEXT.deliverables.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
          <p className="mt-2"><strong>Use in ceremonies:</strong> {AGILE_CONTEXT.ceremonies}</p>
        </div>
      </Section>

      {/* Questions to Ask Section */}
      <Section title="1) Questions to Ask & What to Do with the Answers">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          BAs don&apos;t guess at As-Is or Gaps. They ask specific questions and use the answers to build evidence-based analysis.
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
                    {section.category === 'As-Is Discovery' ? 'A' : section.category === 'Gap Analysis' ? 'G' : 'T'}
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
            Pro tip: Record permission, then ask &quot;Can you show me on your screen?&quot; Watching behavior reveals more than listening to descriptions.
          </div>
        </div>
      </Section>

      <Section title="2) What As-Is Actually Means">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          As-Is is not a diagram. It&apos;s what actually happens when people, systems, and pressure collide.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Signal</th>
                <th className="px-5 py-3 border-b border-slate-200">Example</th>
                <th className="px-5 py-3 border-b border-slate-200">What It Means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SIGNALS.map((row) => (
                <tr key={row.signal} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.signal}</td>
                  <td className="px-5 py-4 text-slate-700">{row.example}</td>
                  <td className="px-5 py-4 text-slate-700">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <AlertTriangle size={16} className="inline mr-2" />
          <strong>Critical:</strong> If you map the fictional As-Is (the one in documentation), your To-Be will fail.
        </div>
      </Section>

      <Section title="2) How to Capture the Real As-Is (Fast + With Respect)">
        <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-700">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">You ask</div>
            <p className="mt-2">“Walk me through what happens when a case comes in — show me the messy version.”</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">You watch</div>
            <p className="mt-2">Screen shares, cursor movements, hesitation points, the order of opened tools.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">You listen for</div>
            <p className="mt-2">Sighs. “This part is annoying…” “We usually just…” “Ideally…” These reveal truth.</p>
          </div>
        </div>
      </Section>

      <Section title="3) Your First High-Level As-Is Draft">
        <p className="text-sm text-slate-700">
          No diagrams yet. Capture the sequence and the pain.
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 space-y-2">
          <p>Customer signs up → system triggers verification check → if match score &lt; threshold → manual review queue → Ops decision → account approved or rejected → decision outcome not fed back into scoring model.</p>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Observed pain:
          <ul className="mt-2 list-disc list-inside space-y-1 text-emerald-800">
            <li>Review queue aging &gt; 48h (SLA breach).</li>
            <li>False positives → customer drop-off + support escalations.</li>
            <li>No feedback loop → model does not learn → fraud patterns repeat.</li>
          </ul>
        </div>
      </Section>

      <Section title="5) Identify the Gaps (Mismatch Between Design & Reality)">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          Gaps exist where original design assumptions diverged from current reality. Document why, not just what.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Gap</th>
                <th className="px-5 py-3 border-b border-slate-200">Why It Exists</th>
                <th className="px-5 py-3 border-b border-slate-200">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {GAPS.map((item) => (
                <tr key={item.gap} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.gap}</td>
                  <td className="px-5 py-4 text-slate-700">{item.reason}</td>
                  <td className="px-5 py-4 text-slate-700">{item.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Lightbulb size={16} />
            These are explanations, not opinions. Evidence-based gap analysis prevents repeating the same mistakes in To-Be.
          </div>
        </div>
      </Section>

      <Section title="5) Define the To-Be (Direction, Not Detail)">
        <p className="text-sm text-slate-700">
          To-Be is the shape of success — the direction you steer towards.
        </p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {TO_BE_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          If To-Be is right, people feel relief, pain reduces, and the room calms down.
        </div>
      </Section>

      <Section title="6) Translate Into a One-Slide Narrative">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-rose-500 font-semibold">Now (As-Is)</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              {NARRATIVE_NOW.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-emerald-500 font-semibold">Future (To-Be)</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              {NARRATIVE_FUTURE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          Senior stakeholders understand this instantly. No diagrams needed yet.
        </p>
      </Section>

      <Section title="7) Your Task Today">
        <p className="text-sm text-slate-700">
          Fill these in — thoughtfully, like someone who understands the system truthfully.
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
          <li>The real As-Is is...</li>
          <li>The core gap between intention and reality is...</li>
          <li>This gap matters because...</li>
          <li>The direction of the To-Be is...</li>
        </ul>
        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={8}
          placeholder="Capture your As-Is narrative, gap explanation, why it matters, and the direction of the To-Be..."
          value={narrative}
          onChange={(event) => setNarrative(event.target.value)}
        />
        <div className="mt-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow">
          <div className="font-semibold">Need to compare with a narrative example?</div>
          <button
            onClick={openExample}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
          >
            View example As-Is → Gap → To-Be narrative
            <ArrowRight size={14} />
          </button>
        </div>
      </Section>

      <Section title="9) Slack / Teams Update (Copy & Adapt)">
        <p className="text-base text-slate-800 mb-3 leading-relaxed">
          After completing As-Is/Gap/To-Be analysis, post an update. This shows analytical rigor.
        </p>
        <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
            <p>Completed first pass of the As-Is and identified key gaps:</p>
            <p>• Static verification thresholds not aligned with current fraud behaviour.</p>
            <p>• Manual review loop has no model feedback path.</p>
            <p>• Ops workload increases as volume scales.</p>
            <p>Drafting To-Be direction focused on risk-tiering + feedback loop + Ops clarity.</p>
            <p>Will validate with Ops + Compliance tomorrow.</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
          <strong>Why this works:</strong> This message makes you look senior — calm, analytical, directional.
        </div>
      </Section>

      {showExample && (
        <div
          ref={exampleRef}
          className="mt-10 rounded-3xl border-2 border-indigo-300 bg-white p-6 shadow-xl space-y-4 text-sm text-slate-700"
        >
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles size={18} />
            <h3 className="text-lg font-semibold">Example Narrative — As-Is → Gap → To-Be</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p><strong>Real As-Is:</strong> “Fraud detection runs on static thresholds; manual reviews happen in spreadsheets; Ops escalates via Slack; conversion drops when manual queue spikes.”</p>
            <p><strong>Gap between intention and reality:</strong> “Design assumed consistent behaviour, but fraud patterns evolved. Controls stayed rigid, Ops invented workarounds, feedback never retrained the model.”</p>
            <p><strong>Why it matters:</strong> “Without adaptive learning, we pay twice — fraud loss and lost customers. Ops morale erodes; compliance risk grows.”</p>
            <p><strong>To-Be direction:</strong> “Risk-tiering that adapts, embedded feedback loops, Ops interface that guides decisions, conversion guardrails built into scoring.”</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            This is what you say when someone asks, “What are you seeing so far?” Clarity without slides.
          </div>
        </div>
      )}

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default AnalysisSpottingIssues;

