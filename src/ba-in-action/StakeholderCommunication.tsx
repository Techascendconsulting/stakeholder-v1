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
  Quote,
  Sparkles,
  ArrowRight,
  Users,
  AlertCircle,
  Mail,
  Video,
  MessageCircleMore,
  Phone,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_stakeholder_communication';

const StakeholderCommunication: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const [stakeholderMap, setStakeholderMap] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [showExample, setShowExample] = useState(false);
  const exampleRef = useRef<HTMLDivElement | null>(null);

  const powerInterestGrid = [
    {
      quadrant: 'High Power, High Interest',
      label: 'Key Players',
      color: 'bg-rose-600',
      textColor: 'text-white',
      stakeholders: ['Ben (Product Owner)', 'Marie (Compliance Lead)'],
      approach: 'Engage closely. Weekly updates. They shape direction.',
    },
    {
      quadrant: 'High Power, Low Interest',
      label: 'Keep Satisfied',
      color: 'bg-amber-600',
      textColor: 'text-white',
      stakeholders: ['CFO', 'CTO'],
      approach: "Keep informed at milestones. Don't over-communicate.",
    },
    {
      quadrant: 'Low Power, High Interest',
      label: 'Keep Informed',
      color: 'bg-sky-600',
      textColor: 'text-white',
      stakeholders: ['James (Operations)', 'Customer Service Lead'],
      approach: 'Regular updates. They provide ground truth.',
    },
    {
      quadrant: 'Low Power, Low Interest',
      label: 'Monitor',
      color: 'bg-slate-400',
      textColor: 'text-white',
      stakeholders: ['IT Support', 'External auditor'],
      approach: 'Inform as needed. No regular cadence.',
    },
  ];

  const communicationChannels = [
    {
      tool: 'Microsoft Teams / Slack',
      icon: <MessageCircleMore size={18} />,
      when: 'Day-to-day updates, quick questions, async alignment',
      tone: 'Professional but conversational. Use threads. Tag appropriately.',
      example: '"Quick check: does the address-change flow require manual approval at KYC, or only for high-risk flags?"',
    },
    {
      tool: 'Email',
      icon: <Mail size={18} />,
      when: 'Formal summaries, decision logs, external stakeholders',
      tone: 'Structured. Subject line = decision/action. Use bullet points.',
      example: 'Subject: "CI&F – Scope Confirmation Required by EOD Friday"',
    },
    {
      tool: 'Video Calls (Teams/Zoom)',
      icon: <Video size={18} />,
      when: 'Complex topics, alignment on contentious issues, kickoffs',
      tone: 'Calm, measured. Lead with agenda. Close with actions.',
      example: 'Start: "Our goal today is to align on verification touchpoints and confirm non-negotiables."',
    },
    {
      tool: 'In-Person / Walk-Ups',
      icon: <Phone size={18} />,
      when: 'Sensitive topics, building trust, urgent blockers',
      tone: 'Human. Listen more than you speak. No laptop.',
      example: '"Can I grab 10 minutes? I want to understand your concern about the compliance flow before I document it."',
    },
  ];

  const conversationScripts = [
    {
      stakeholder: 'Product Owner',
      goal: 'Align on outcomes without stepping on authority',
      script: '"Before we define how, I want to confirm the success targets and guardrails. Here\'s what I\'m working with — tell me where it\'s wrong."',
      why: 'Shows respect for ownership. Invites correction, not confrontation.',
    },
    {
      stakeholder: 'Compliance',
      goal: 'Understand immovable constraints',
      script: '"Help me understand where verification cannot weaken under any circumstance. I want to design around those anchor points."',
      why: 'You become a protector, not a risk. Compliance becomes your ally.',
    },
    {
      stakeholder: 'Operations',
      goal: 'Get real-world pain, not sanitised dashboards',
      script: '"Show me a real case. Don\'t clean it up. Walk me through what happens step by step when an exception lands."',
      why: 'Ops finally feels heard. You\'ll get the truth, not the story.',
    },
    {
      stakeholder: 'Engineering',
      goal: 'Understand feasibility early',
      script: '"Before we talk solutions, can you walk me through where identity verification is invoked today and what triggers a manual review?"',
      why: 'You speak their language. They\'ll trust your requirements.',
    },
    {
      stakeholder: 'Finance',
      goal: 'Ground the ROI story',
      script: '"If we cut manual reviews by 40%, what\'s the rough cost-per-case or time-per-case impact? Directional is fine."',
      why: 'Finance gets a number they can champion upwards.',
    },
  ];

  const meetingFramework = [
    {
      stage: '1. Set the Frame',
      action: 'State the purpose clearly',
      script: '"Our goal today is to confirm success criteria and align on constraints."',
    },
    {
      stage: '2. Reflect the Known',
      action: 'Summarise shared understanding',
      script: '"Fraud increased ~17%, review queues breach SLA, conversion drops at KYC."',
    },
    {
      stage: '3. Surface Differences',
      action: 'Ask where people disagree',
      script: '"Does anyone see this differently before we continue?"',
    },
    {
      stage: '4. Clarify Constraints',
      action: 'Identify non-negotiables',
      script: '"Which verification points cannot change due to regulatory controls?"',
    },
    {
      stage: '5. Define Next Step',
      action: 'Assign real actions with owners',
      script: '"Analytics confirms baselines. Compliance shares audit notes. I\'ll draft the problem statement and post it EOD."',
    },
  ];

  const notesComparison = [
    {
      type: 'Weak BA Notes',
      color: 'border-rose-200 bg-rose-50',
      textColor: 'text-rose-800',
      notes: [
        'Ops: queues are long',
        'Compliance: worried about audit',
        'PO: needs quick wins',
      ],
    },
    {
      type: 'Strong BA Notes',
      color: 'border-emerald-200 bg-emerald-50',
      textColor: 'text-emerald-800',
      notes: [
        'Ops pain = reviews >48h → SLA breach → reputational risk',
        'Compliance pain = audit flagged address-change flow → must maintain chain-of-proof',
        'PO pressure = quarterly outcomes → needs visible momentum, not long discovery',
      ],
    },
  ];

  const handleOpenExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageShell>
      <PageTitle title="Stakeholder Communication" />

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

      {/* Why This Matters */}
      <Section title="1) Why Stakeholder Communication Matters (Especially for Interviews)">
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
          <strong>Real BA work:</strong> You don&apos;t just &quot;communicate well.&quot; You map power, assess interest, choose channels strategically, and lead conversations with intent.
        </div>
      </Section>

      {/* Power-Interest Grid */}
      <Section title="2) The Power-Interest Grid (How BAs Map Stakeholders)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          This is the single most important stakeholder tool. It tells you <strong>who to engage, how often, and with what depth.</strong>
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {powerInterestGrid.map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border border-slate-300 overflow-hidden shadow-sm`}
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
                <p className="text-sm text-slate-700 leading-relaxed">{item.approach}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>In interviews:</strong> "I used a power-interest grid to prioritise stakeholder engagement. High-power, high-interest stakeholders received weekly updates, while low-power, low-interest were informed at key milestones only."
        </div>
      </Section>

      {/* Communication Channels */}
      <Section title="3) Tools of Communication (When to Use Teams, Slack, Email, or Face-to-Face)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          BAs don&apos;t just &quot;send a message.&quot; They choose the right channel for the right purpose. Here&apos;s how:
        </p>
        <div className="space-y-4">
          {communicationChannels.map((channel) => (
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
      </Section>

      {/* Conversation Scripts */}
      <Section title="4) Conversation Scripts for Each Stakeholder Type">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Copy these scripts. Adapt them. Use them in your BA WorkXP scenarios and reference them in interviews.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {conversationScripts.map((entry) => (
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
      </Section>

      {/* Meeting Framework */}
      <Section title="5) The 5-Step BA Meeting Framework">
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
              {meetingFramework.map((row) => (
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
      </Section>

      {/* How You Take Notes */}
      <Section title="6) How You Take Notes (Analysis vs. Transcription)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Weak BAs transcribe. Strong BAs analyse. Your notes should capture meaning, not words.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {notesComparison.map((comparison) => (
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
      </Section>

      {/* Task 1: Stakeholder Mapping */}
      <Section title="7) Your Task: Map the CI&F Stakeholders">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Using the Power-Interest Grid, map the CI&F stakeholders. For each, write:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-4">
          <li>Name & role</li>
          <li>Quadrant (High Power/High Interest, etc.)</li>
          <li>Engagement approach (how often, what depth)</li>
          <li>Potential concerns or risks</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={8}
          placeholder="Example:&#10;Ben Carter (Product Owner) → High Power, High Interest → Weekly updates, close collaboration → Risk: scope creep under quarterly pressure.&#10;&#10;Marie Dupont (Compliance) → High Power, High Interest → ..."
          value={stakeholderMap}
          onChange={(e) => setStakeholderMap(e.target.value)}
        />
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>How a BA would do this:</strong> They&apos;d create a simple table in Confluence or Excel, update it after each conversation, and reference it before every stakeholder interaction to adjust tone and depth.
        </div>
      </Section>

      {/* Task 2: Draft First Message */}
      <Section title="8) Your Task: Draft Your First Stakeholder Message">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Choose one stakeholder (Ben, Marie, or James). Draft your first message to them in Teams/Slack. Include:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-4">
          <li>Context (why you&apos;re reaching out)</li>
          <li>What you need from them (specific, actionable)</li>
          <li>Suggested next step (meeting, async response, etc.)</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          rows={6}
          placeholder="Example:&#10;Hi Marie — following our intro yesterday, I want to understand the regulatory anchor points for identity verification (particularly at signup and address change).&#10;&#10;Could we grab 20 minutes this week to walk through the controls that cannot weaken? I'll take notes and share them back for review.&#10;&#10;Thanks,&#10;[Your name]"
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
      </Section>

      {/* Follow-Up Message */}
      <Section title="9) Post-Meeting Follow-Up (Copy & Adapt for Slack/Teams)">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          After every meeting, post a summary in the project channel. This builds trust and creates a decision trail.
        </p>
        <div className="rounded-2xl border border-slate-300 bg-slate-900 p-5 text-sm text-white shadow-lg font-mono leading-relaxed">
          <p className="mb-2">Good session — summarising decisions to ensure shared clarity:</p>
          <p>• <strong>Outcome:</strong> Reduce fraud loss while protecting conversion baseline.</p>
          <p>• <strong>Constraints:</strong> KYC control points at signup + address change remain non-negotiable (regulatory).</p>
          <p>• <strong>Next steps:</strong></p>
          <p className="ml-4">– Analytics confirming fraud loss baselines by EOD Wednesday</p>
          <p className="ml-4">– Ops providing 3 real exception cases for review flow analysis</p>
          <p className="ml-4">– Compliance sharing audit notes on address-change flow</p>
          <p>• <strong>BA action:</strong> I&apos;ll draft the problem statement and post it EOD tomorrow for review.</p>
        </div>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
          This message tells everyone: <strong>you are calm, structured, reliable, and leading.</strong> That&apos;s how trust is earned.
        </p>
      </Section>

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
            <h4 className="text-base font-semibold text-slate-900 mb-3">Example: CI&F Stakeholder Mapping</h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-sm text-slate-800">
              <div className="pb-3 border-b border-slate-200">
                <p className="font-semibold text-slate-900">Ben Carter (Product Owner)</p>
                <p className="text-xs text-slate-600 mt-1">Quadrant: High Power, High Interest (Key Player)</p>
                <p className="mt-2 leading-relaxed">Engagement: Weekly 1:1s + ad-hoc alignment. Share drafts early for feedback.</p>
                <p className="mt-1 leading-relaxed"><strong>Risk:</strong> Quarterly pressure → scope creep. Keep him grounded in success criteria.</p>
              </div>
              <div className="pb-3 border-b border-slate-200">
                <p className="font-semibold text-slate-900">Marie Dupont (Compliance Lead)</p>
                <p className="text-xs text-slate-600 mt-1">Quadrant: High Power, High Interest (Key Player)</p>
                <p className="mt-2 leading-relaxed">Engagement: Bi-weekly check-ins. Always frame changes through a regulatory lens.</p>
                <p className="mt-1 leading-relaxed"><strong>Risk:</strong> Audit defensibility. If she's not comfortable, nothing moves.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">James Walker (Operations Manager)</p>
                <p className="text-xs text-slate-600 mt-1">Quadrant: Low Power, High Interest (Keep Informed)</p>
                <p className="mt-2 leading-relaxed">Engagement: Async updates in Slack + monthly walkthrough of queue changes.</p>
                <p className="mt-1 leading-relaxed"><strong>Value:</strong> Ground truth. He knows where the process breaks.</p>
              </div>
            </div>
          </div>

          {/* Example Message Templates */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-3">Example: First Message Templates</h4>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">To: Marie (Compliance)</p>
                <div className="font-mono text-sm text-slate-800 leading-relaxed space-y-2">
                  <p>Hi Marie — following our intro yesterday, I want to understand the regulatory anchor points for identity verification (particularly at signup and address change).</p>
                  <p>Could we grab 20 minutes this week to walk through the controls that cannot weaken under any circumstance? I&apos;ll take notes and share them back for your review.</p>
                  <p className="text-slate-600">Thanks,<br/>[Your name]</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                  <strong>Why this works:</strong> Clear purpose. Specific ask. Respectful of her expertise. Offers to document.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">To: James (Operations)</p>
                <div className="font-mono text-sm text-slate-800 leading-relaxed space-y-2">
                  <p>Hi James — I&apos;m mapping the manual review process to understand where delays occur.</p>
                  <p>Could you show me 2-3 real exception cases (don&apos;t clean them up)? I want to see what actually happens step-by-step when they land in the queue.</p>
                  <p>15 minutes over Teams works — or I can swing by your desk.</p>
                  <p className="text-slate-600">Cheers,<br/>[Your name]</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                  <strong>Why this works:</strong> Shows you want the real story, not dashboards. Low-friction ask. Flexible format.
                </div>
              </div>
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

