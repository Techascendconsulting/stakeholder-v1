import React, { useRef, useState } from 'react';
import type { AppView } from '../../types';
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
  MessageCircle,
  Quote,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_whos_involved';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=70',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70',
];

const PEOPLE = [
  {
    name: 'Ben Carter',
    role: 'Product Owner',
    care: 'Deliver value quickly, keep roadmap credible, hit quarterly outcomes.',
    fear: 'Scope creep, analysis paralysis, unclear framing.',
    cue: 'Be structured. Be concise. Bring clarity, not chaos.',
  },
  {
    name: 'Marie Dupont',
    role: 'Compliance Lead',
    care: 'Regulatory safety, audit trails, zero breach exposure.',
    fear: 'Controls weakened in the name of “speed” or “conversion.”',
    cue: 'Speak in control points, traceability, evidence. No talk of shortcuts.',
  },
  {
    name: 'James Walker',
    role: 'Operations Manager',
    care: 'Queue time, workload balance, SLA performance.',
    fear: 'More manual work dumped on Ops without tooling or support.',
    cue: 'Show the future state removes friction. Co-design with Ops.',
  },
  {
    name: 'Alicia Chen',
    role: 'Senior Software Engineer',
    care: 'Feasible changes, predictable delivery, clear specs.',
    fear: 'Vague problem statements, requirement churn.',
    cue: 'Bring decisions and rationale. Explain the “why”.',
  },
  {
    name: 'Finance Business Partner',
    role: 'Finance Partner',
    care: 'Cost control, measurable savings, ROI narrative.',
    fear: 'Three months of effort with no movement in £.',
    cue: 'Anchor fraud reduction in pounds. Directional maths beats adjectives.',
  },
];

const PRESSURE_SIGNALS = [
  { name: 'Product Owner', signal: 'Needs visible momentum for board updates — even if operational mess underneath.' },
  { name: 'Compliance', signal: 'Protects licence to operate. Audit exposure = personal accountability.' },
  { name: 'Operations', signal: 'Living the queue pain daily. Stress rarely seen by leadership.' },
  { name: 'Engineering', signal: 'Roadmap already full. They need trade-offs, not surprises.' },
  { name: 'Finance', signal: 'Must justify spend to leadership. Needs conversion of effort → £ saved.' },
];

const INFLUENCE_MAP = [
  {
    quadrant: 'High Influence • High Interest',
    tagline: 'They drive the outcome',
    examples: 'Product Owner, Compliance Lead',
    approach: 'Facilitate decisions. Align on wording. Bring trade-offs.',
  },
  {
    quadrant: 'High Influence • Low Interest',
    tagline: 'They sign off but aren’t in the weeds',
    examples: 'Head of Risk, CFO, CTO',
    approach: 'Short updates. Use metrics. Never waste their time.',
  },
  {
    quadrant: 'Low Influence • High Interest',
    tagline: 'They feel the pain daily',
    examples: 'Ops Supervisors, Fraud Analysts',
    approach: 'Listen deeply. They surface hidden blockers.',
  },
  {
    quadrant: 'Low Influence • Low Interest',
    tagline: 'Keep them informed only',
    examples: 'Customer Support, Marketing',
    approach: 'Plain-language updates. Pull them in only when relevant.',
  },
];

const SCRIPTS = [
  {
    label: 'Product Owner',
    quote:
      '“I want to confirm how we’re defining success before we go deeper. Here are the working targets and guardrails — tell me what’s off.”',
  },
  {
    label: 'Compliance',
    quote:
      '“To stay audit-safe, I need to know which control points are non-negotiable. Walk me through the ones we can’t compromise.”',
  },
  {
    label: 'Operations',
    quote: '“Show me a real case. Don’t tidy it. I need to see exactly where it slows down.”',
  },
  {
    label: 'Engineering',
    quote:
      '“Before solutioning, can you walk me through where risk checks fire in code today and which events trigger review?”',
  },
  {
    label: 'Finance',
    quote:
      '“If manual reviews dropped 40%, what’s the time or cost benefit? Directional numbers help me frame value.”',
  },
];

const HUMAN_REALITY = [
  'They don’t want to waste time.',
  'They don’t want to be embarrassed in front of leadership.',
  'They don’t want to absorb extra blame when things go wrong.',
];

const EXAMPLE_NARRATIVE = [
  'Urgency: Ben and Finance need fraud losses down in £ before the board review. They set the tempo.',
  'Pain: Ops is breaching the 24h SLA 40% of the time. If we ignore their load, they will quietly stall the change.',
  'Risk: Marie owns audit exposure. If we don’t prove traceability on account changes, she will veto the rollout.',
  'Priority: Decisions sit with Ben + Compliance, but Alicia (Engineering) influences sequencing via feasibility.',
  'Quiet block: Ops could resist if “automation” means more manual checks. Protect them by co-designing improvements.',
  'Protection: Finance needs directional ROI before approving time. Translate every option into £ impact.',
];

const StakeholderLandscape: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  const [narrative, setNarrative] = useState('');
  const [showExample, setShowExample] = useState(false);
  const exampleRef = useRef<HTMLDivElement | null>(null);

  const handleOpenExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageShell>
      <PageTitle title="Day 3 — Who’s Involved & Why It Matters" />

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-600">
        <Clock size={16} className="text-indigo-600" />
        <span>Today, 10:20 · You already understand the problem. Now map the humans shaping it.</span>
      </div>

      {/* Hero visuals */}
      <div className="mb-8 grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
          <img src={HERO_IMAGES[0]} alt="Cross-functional meeting" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="text-xs uppercase tracking-wider text-white/70">Inside the room</div>
            <h2 className="mt-2 text-2xl font-bold">A BA navigates influence — not just requirements gathering.</h2>
            <p className="mt-3 text-sm text-white/80">
              You are mapping incentives, fears, and veto power before a single solution is proposed.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="relative h-32 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
            <img src={HERO_IMAGES[1]} alt="Stakeholder conversation" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 to-indigo-600/40" />
            <div className="absolute left-5 top-5 right-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/60">Your focus</div>
              <p className="mt-1 text-sm font-semibold">
                Who drives urgency, who feels pain daily, who owns risk, who can block you without warning.
              </p>
            </div>
          </div>
          <div className="relative h-32 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
            <img src={HERO_IMAGES[2]} alt="Strategy alignment" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-900/70 to-rose-500/40" />
            <div className="absolute left-5 top-5 right-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/60">This isn’t training</div>
              <p className="mt-1 text-sm font-semibold">
                We’re showing how the work is done. Narrative, perception, awareness. No templates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Section title="1) The People Landscape" icon={<Users size={18} className="text-indigo-600" />}>
        <p className="text-sm text-slate-700">
          These are not “stakeholders.” These are humans with incentives, fears, KPIs, reputations, and turf to defend.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">What They Care About</th>
                <th className="px-4 py-3">What They Fear</th>
                <th className="px-4 py-3">What This Means for You</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {PEOPLE.map((person) => (
                <tr key={person.name} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{person.name}</td>
                  <td className="px-4 py-3 text-slate-700">{person.role}</td>
                  <td className="px-4 py-3 text-slate-700">{person.care}</td>
                  <td className="px-4 py-3 text-slate-700">{person.fear}</td>
                  <td className="px-4 py-3 text-indigo-700 font-medium">{person.cue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <strong>If you don’t understand who holds risk, veto power, and emotional investment, you will:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Propose solutions that get politely rejected.</li>
            <li>Hear “not now” with no explanation.</li>
            <li>Be blocked by invisible politics.</li>
            <li>Get ignored in the rooms that matter.</li>
          </ul>
        </div>
      </Section>

      <Section title="2) Stakeholder Intent & Pressure Signals" icon={<Target size={18} className="text-indigo-600" />}>
        <p className="text-sm text-slate-700">Look for what is unsaid. Pressure explains behaviour.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PRESSURE_SIGNALS.map((signal) => (
            <div key={signal.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{signal.name}</div>
              <p className="mt-2 text-sm text-slate-700">{signal.signal}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-4 text-sm text-white">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert size={16} className="text-amber-300" />
            This isn’t politics. It’s reality. Understanding it keeps you safe.
          </div>
        </div>
      </Section>

      <Section
        title="3) Influence vs Interest Map"
        subtitle="We make it felt — not diagrammed."
        icon={<Users size={18} className="text-indigo-600" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INFLUENCE_MAP.map((item) => (
            <div key={item.quadrant} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-indigo-600">{item.quadrant}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{item.tagline}</div>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Examples:</span> {item.examples}
              </p>
              <p className="mt-2 text-sm text-slate-700">{item.approach}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          This is how a BA decides where to invest time, how often to update, and how to tailor language.
        </p>
      </Section>

      <Section
        title="4) Relationship Scripts — Real Language"
        subtitle="No “BA school” tone. Actual sentences you’ll say."
        icon={<MessageCircle size={18} className="text-indigo-600" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {SCRIPTS.map((script) => (
            <div key={script.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Quote size={14} className="text-indigo-500" />
                Talking to {script.label}
              </div>
              <p className="mt-2 text-sm text-slate-700">“{script.quote}”</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          This is where your learner learns to speak like they belong in these rooms.
        </p>
      </Section>

      <Section title="5) The Human Reality" icon={<Sparkles size={18} className="text-indigo-600" />}>
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
      </Section>

      <Section
        title="6) Your Task for Today: Write the Stakeholder Narrative"
        subtitle="This is not a table. It’s a story you will use."
        icon={<BookOpen size={18} className="text-indigo-600" />}
      >
        <p className="text-sm text-slate-700">
          Answer these questions in narrative form:
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
          <li>Who is driving urgency?</li>
          <li>Who feels the pain daily?</li>
          <li>Who controls audit or reputational risk?</li>
          <li>Who decides priority?</li>
          <li>Who can block this quietly?</li>
          <li>Who must be protected from extra workload?</li>
        </ul>
        <p className="mt-2 text-sm text-slate-700">
          This is the story you use when you speak to your PO, defend scope, and prevent derailment.
        </p>

        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      </Section>

      <Section title="7) Slack / Teams Update (Copy + Paste)" icon={<MessageCircle size={18} className="text-indigo-600" />}>
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-sm text-white shadow">
          <p>Working map of key people drafted.</p>
          <p>Validating pressure points with Ops + Compliance tomorrow.</p>
          <p>Aligning on decision owner + guardrails before defining the first slice.</p>
          <p>Will publish narrative summary once validated.</p>
        </div>
        <p className="mt-3 text-sm text-slate-700">This message alone makes you look composed and in control.</p>
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
            {EXAMPLE_NARRATIVE.map((line, index) => (
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

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default StakeholderLandscape;

