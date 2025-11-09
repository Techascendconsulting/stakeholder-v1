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
  Mail,
  Video,
  MessageCircleMore,
  Phone,
  Grid3x3,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_whos_involved';

const HERO_IMAGE = '/images/collaborate1.jpg';

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

const COMMUNICATION_TOOLS = [
  {
    tool: 'Microsoft Teams / Slack',
    icon: <MessageCircleMore size={18} />,
    when: 'Day-to-day updates, quick alignment, async decisions',
    how: 'Use threads. Tag specific people. Keep it structured but conversational.',
    example: '"Quick alignment: Marie, can you confirm if address-change verification requires manual approval, or just high-risk flags?"',
  },
  {
    tool: 'Email',
    icon: <Mail size={18} />,
    when: 'Formal updates, decision logs, external stakeholders, approvals',
    how: 'Clear subject line (action/decision). Bullet points. Attachments linked, not embedded.',
    example: 'Subject: "CI&F – Scope Baseline Confirmation Required by Friday 5pm"',
  },
  {
    tool: 'Video Calls (Teams/Zoom)',
    icon: <Video size={18} />,
    when: 'Complex alignment, contentious topics, kickoffs, workshops',
    how: 'Lead with agenda. Summarize decisions at close. Assign actions with owners.',
    example: 'Open: "Our goal today is to align on verification touchpoints and confirm non-negotiables."',
  },
  {
    tool: 'In-Person / Walk-Ups',
    icon: <Phone size={18} />,
    when: 'Sensitive topics, relationship building, urgent blockers',
    how: 'Human first. Listen more. No laptop. Build trust before asking for commitments.',
    example: '"Can I grab 10 minutes? I want to understand your concern about compliance flow before documenting it."',
  },
];

const POWER_INTEREST_GRID = [
  {
    quadrant: 'High Power, High Interest',
    label: 'Key Players',
    color: 'bg-rose-600',
    textColor: 'text-white',
    stakeholders: ['Ben (Product Owner)', 'Marie (Compliance Lead)'],
    approach: 'Engage closely. Weekly 1:1s. They shape direction.',
    interviewTip: '"I prioritized weekly alignment with the Product Owner and Compliance Lead as they held decision rights and audit accountability."',
  },
  {
    quadrant: 'High Power, Low Interest',
    label: 'Keep Satisfied',
    color: 'bg-amber-600',
    textColor: 'text-white',
    stakeholders: ['CFO', 'CTO', 'Head of Risk'],
    approach: 'Milestone updates only. Use metrics. Never waste their time.',
    interviewTip: '"I kept senior leadership informed at key milestones with concise, metric-driven summaries."',
  },
  {
    quadrant: 'Low Power, High Interest',
    label: 'Keep Informed',
    color: 'bg-sky-600',
    textColor: 'text-white',
    stakeholders: ['James (Operations)', 'Fraud Analysts', 'CS Lead'],
    approach: 'Regular async updates. They provide ground truth and surface hidden blockers.',
    interviewTip: '"Operations had low decision power but high interest — they felt the pain daily and surfaced critical edge cases."',
  },
  {
    quadrant: 'Low Power, Low Interest',
    label: 'Monitor',
    color: 'bg-slate-400',
    textColor: 'text-white',
    stakeholders: ['IT Support', 'Marketing', 'External Auditor'],
    approach: 'Inform only when relevant. No regular cadence.',
    interviewTip: '"I monitored low-power, low-interest stakeholders and informed them only when their input was needed."',
  },
];

const EXAMPLE_NARRATIVE = [
  'Urgency: Ben and Finance need fraud losses down in £ before the board review. They set the tempo.',
  'Pain: Ops is breaching the 24h SLA 40% of the time. If we ignore their load, they will quietly stall the change.',
  "Risk: Marie owns audit exposure. If we don't prove traceability on account changes, she will veto the rollout.",
  'Priority: Decisions sit with Ben + Compliance, but Alicia (Engineering) influences sequencing via feasibility.',
  'Quiet block: Ops could resist if "automation" means more manual checks. Protect them by co-designing improvements.',
  'Protection: Finance needs directional ROI before approving time. Translate every option into £ impact.',
];

const StakeholderLandscape: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  const [narrative, setNarrative] = useState('');
  const [stakeholderMap, setStakeholderMap] = useState('');
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

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">Today, 10:20 · You already understand the problem. Now map the humans shaping it.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
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
            Who&apos;s Involved & Why It Matters
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            A BA navigates influence — not just requirements gathering. You map incentives, fears, veto power, and communication channels before proposing solutions. This page shows you how.
          </p>
        </div>
      </div>

      {/* Why This Matters for Interviews */}
      <Section title="Why This Matters (Especially for Interviews)">
        <div className="space-y-3 text-sm text-slate-800">
          <p className="leading-relaxed">
            Interviewers ask: <strong className="text-slate-900">&quot;Tell me about a time when you had to manage conflicting stakeholder priorities&quot;</strong> or <strong className="text-slate-900">&quot;How do you identify who has decision-making authority?&quot;</strong>
          </p>
          <p className="leading-relaxed">
            You need structured frameworks. This page gives you the Power-Interest Grid, communication tools, and stakeholder mapping techniques that BAs use daily.
          </p>
        </div>
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <strong>Real BA work:</strong> Understanding who holds risk, veto power, and emotional investment prevents solutions from being politely rejected, hearing &quot;not now&quot; with no explanation, or being blocked by invisible politics.
        </div>
      </Section>

      <Section title="1) The People Landscape">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          These are not &quot;stakeholders.&quot; These are humans with incentives, fears, KPIs, reputations, and turf to defend.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Name</th>
                <th className="px-5 py-3 border-b border-slate-200">Role</th>
                <th className="px-5 py-3 border-b border-slate-200">What They Care About</th>
                <th className="px-5 py-3 border-b border-slate-200">What They Fear</th>
                <th className="px-5 py-3 border-b border-slate-200">What This Means for You</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PEOPLE.map((person) => (
                <tr key={person.name} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{person.name}</td>
                  <td className="px-5 py-4 text-slate-700">{person.role}</td>
                  <td className="px-5 py-4 text-slate-700">{person.care}</td>
                  <td className="px-5 py-4 text-slate-700">{person.fear}</td>
                  <td className="px-5 py-4 text-indigo-700 font-medium">{person.cue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <strong>If you don&apos;t understand who holds risk, veto power, and emotional investment, you will:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Propose solutions that get politely rejected.</li>
            <li>Hear &quot;not now&quot; with no explanation.</li>
            <li>Be blocked by invisible politics.</li>
            <li>Get ignored in the rooms that matter.</li>
          </ul>
        </div>
      </Section>

      {/* Power-Interest Grid */}
      <Section title="2) The Power-Interest Grid (Your Most Important Stakeholder Tool)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          This grid tells you <strong>who to engage, how often, and with what depth.</strong> In interviews, you can say: &quot;I used a Power-Interest Grid to prioritize stakeholder engagement.&quot;
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {POWER_INTEREST_GRID.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-300 overflow-hidden shadow-sm"
            >
              <div className={`${item.color} ${item.textColor} px-4 py-3`}>
                <div className="text-xs font-semibold uppercase tracking-wide opacity-90">{item.quadrant}</div>
                <div className="text-lg font-bold mt-1">{item.label}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Examples</div>
                <ul className="space-y-1 mb-3">
                  {item.stakeholders.map((s) => (
                    <li key={s} className="text-sm text-slate-800">• {s}</li>
                  ))}
                </ul>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">How to Engage</div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{item.approach}</p>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                  <strong>In interviews:</strong> {item.interviewTip}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <Grid3x3 size={16} className="inline mr-2" />
          <strong>Pro tip:</strong> High-power stakeholders shape decisions. High-interest stakeholders surface risks. Map both axes before your first meeting.
        </div>
      </Section>

      {/* Communication Tools */}
      <Section title="3) Tools of Communication (When to Use Teams, Slack, Email, or Face-to-Face)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          BAs don&apos;t just &quot;send a message.&quot; They choose the right channel for the right purpose. Here&apos;s how:
        </p>
        <div className="space-y-4">
          {COMMUNICATION_TOOLS.map((channel) => (
            <div key={channel.tool} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
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
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">How</div>
                  <p className="text-slate-700 leading-relaxed">{channel.how}</p>
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
      </Section>

      <Section title="4) Stakeholder Intent & Pressure Signals">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">Look for what is unsaid. Pressure explains behaviour.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {PRESSURE_SIGNALS.map((signal) => (
            <div key={signal.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900 mb-2">{signal.name}</div>
              <p className="text-sm text-slate-700 leading-relaxed">{signal.signal}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert size={16} />
            This isn&apos;t politics. It&apos;s reality. Understanding it keeps you safe.
          </div>
        </div>
      </Section>

      <Section title="5) Relationship Scripts — Real Language">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          No &quot;BA school&quot; tone. Actual sentences you&apos;ll say. Copy these, adapt them, use them in interviews.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {SCRIPTS.map((script) => (
            <div key={script.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-2">
                <Quote size={16} className="text-indigo-600" />
                Talking to {script.label}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">&quot;{script.quote}&quot;</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>In interviews:</strong> &quot;I tailored my communication style to each stakeholder. With Compliance, I led with control points and traceability. With Operations, I asked to see real exception cases, not sanitized dashboards.&quot;
        </div>
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

      {/* Task 1: Stakeholder Mapping */}
      <Section title="6) Your Task: Map the CI&F Stakeholders Using the Power-Interest Grid">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          For each stakeholder, write:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-4">
          <li>Name & role</li>
          <li>Quadrant (High Power/High Interest, etc.)</li>
          <li>Engagement approach (how often, what depth)</li>
          <li>Communication channel preference</li>
          <li>Potential concerns or blockers</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={10}
          placeholder="Example:&#10;Ben Carter (Product Owner) → High Power, High Interest → Weekly 1:1s via Teams → Prefers structured agendas with clear outcomes → Risk: scope creep under quarterly pressure.&#10;&#10;Marie Dupont (Compliance) → High Power, High Interest → ..."
          value={stakeholderMap}
          onChange={(e) => setStakeholderMap(e.target.value)}
        />
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>How a BA would do this:</strong> They&apos;d create a simple table in Confluence or Excel with columns for Name, Role, Power/Interest, Engagement Frequency, Preferred Channel, and Key Concerns. Update it after each conversation.
        </div>
      </Section>

      {/* Task 2: Narrative */}
      <Section title="7) Your Task: Write the Stakeholder Narrative">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          This isn&apos;t a table. It&apos;s a story you use when you speak to your PO, defend scope, and prevent derailment.
        </p>
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          Answer these questions in narrative form:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-700 mb-4">
          <li>Who is driving urgency?</li>
          <li>Who feels the pain daily?</li>
          <li>Who controls audit or reputational risk?</li>
          <li>Who decides priority?</li>
          <li>Who can block this quietly?</li>
          <li>Who must be protected from extra workload?</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      <Section title="8) Slack / Teams Update (Copy & Adapt)">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          After mapping stakeholders, post an update. This shows you&apos;re structured and in control.
        </p>
        <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
            <p>Working map of key people drafted.</p>
            <p>Validating pressure points with Ops + Compliance tomorrow.</p>
            <p>Aligning on decision owner + guardrails before defining the first slice.</p>
            <p>Will publish narrative summary once validated.</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
          <strong>Why this works:</strong> This message tells everyone you&apos;re calm, methodical, and leading.
        </div>
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

