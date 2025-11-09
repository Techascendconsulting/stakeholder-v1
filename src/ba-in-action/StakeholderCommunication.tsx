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
  Target,
  MessageSquare,
  ClipboardCheck,
  Quote,
  PenLine,
  NotebookPen,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_stakeholder_communication';

const StakeholderCommunication: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const [stance, setStance] = useState('');
  const [showExample, setShowExample] = useState(false);
  const exampleRef = useRef<HTMLDivElement | null>(null);

  const framework = [
    {
      stage: 'Set the frame',
      action: 'State the purpose',
      script: '“Our goal today is to confirm success criteria and agree guardrails.”',
    },
    {
      stage: 'Reflect the known',
      action: 'Summarise factual shared understanding',
      script: '“Fraud has increased ~17% and review queues are breaching SLA.”',
    },
    {
      stage: 'Surface differences',
      action: 'Ask where people disagree',
      script: '“Does anyone see this differently before we continue?”',
    },
    {
      stage: 'Clarify constraints',
      action: 'Identify non-negotiables',
      script: '“Which parts of verification cannot change due to controls?”',
    },
    {
      stage: 'Define next step',
      action: 'Assign a real action',
      script: '“We’ll reconvene after Analytics shares baselines. I’ll post a summary in the channel.”',
    },
  ];

  const scripts = [
    {
      title: 'Product Owner',
      goal: 'Align on outcomes and decision rights',
      script:
        '“Before we define the solution, I want to confirm the success targets and the guardrails. Here’s what I’m working with — tell me where it’s wrong.”',
      why: 'You show respect for ownership without giving up leadership.',
    },
    {
      title: 'Compliance',
      goal: 'Identify non-negotiable controls',
      script:
        '“Help me understand the points in the journey where verification cannot weaken under any circumstance. I want to design around these anchor points.”',
      why: 'Compliance now sees you as a protector, not a risk.',
    },
    {
      title: 'Operations',
      goal: 'Understand real-world pain (not dashboards)',
      script:
        '“Show me a real case. Don’t clean it up. Walk me through what happens step by step when an exception comes in.”',
      why: 'Ops finally feels heard, which makes them your ally.',
    },
    {
      title: 'Engineering',
      goal: 'Understand feasibility early',
      script:
        '“Before we even talk solutions, can you walk me through where identity verification is currently invoked in the code path and what events trigger review?”',
      why: 'You speak in their language, not yours.',
    },
    {
      title: 'Finance',
      goal: 'Ground the ROI story',
      script:
        '“If we reduced manual reviews by 40%, what is the rough cost-per-case or time-per-case benefit? Directional is fine — I need it for framing.”',
      why: 'Finance gets numbers they can champion upwards.',
    },
  ];

  const notesComparison = [
    {
      title: 'Bad BA notes',
      items: ['Ops: long queues.', 'Compliance: worried.', 'PO: needs quick wins.'],
      tone: 'text-rose-700',
      border: 'border-rose-200 bg-rose-50',
    },
    {
      title: 'Strong BA notes',
      items: [
        'Ops pain = aging >48h → SLA breach → reputational risk.',
        'Compliance pain = audit flagged address change flow → must maintain chain-of-proof.',
        'PO pressure = quarterly outcomes → needs visible momentum, not long discovery.',
      ],
      tone: 'text-emerald-700',
      border: 'border-emerald-200 bg-emerald-50',
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

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-600">
        <Clock size={16} className="text-indigo-600" />
        <span>Today, 11:40 · You understand the context. Now you guide the conversation.</span>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=70"
            alt="Team meeting with whiteboard"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="text-xs uppercase tracking-wider text-white/70">This is not training</div>
            <h2 className="mt-2 text-2xl font-bold">This page teaches you how a BA takes control of a room.</h2>
            <p className="mt-3 text-sm text-white/80">
              You’re not asking questions. You’re directing attention, creating clarity, and aligning people under pressure.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="relative h-32 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70"
              alt="BA leading a discussion"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 to-indigo-600/40" />
            <div className="absolute left-5 top-5 right-5 text-white text-sm font-semibold">
              Calm. Measured. Precise. Low emotion. High clarity. You are the tempo setter.
            </div>
          </div>
          <div className="relative h-32 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=70"
              alt="Hands taking notes"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-900/70 to-rose-500/40" />
            <div className="absolute left-5 top-5 right-5 text-white text-sm font-semibold">
              Your notes capture meaning, not transcription. That’s how trust is earned.
            </div>
          </div>
        </div>
      </div>

      <Section title="1) Your Communication Posture">
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            A BA speaks like this: <strong>calm</strong>, <strong>measured</strong>, <strong>precise</strong>. Low emotion. High clarity.
            You are the one person in the room who does not get flustered.
          </p>
          <p>
            If you become anxious, the room loses direction. You are the tempo setter. When you stay composed, everyone else can think.
          </p>
        </div>
      </Section>

      <Section title="2) How to Open a Conversation Like a BA">
        <div className="space-y-4 text-sm text-slate-700">
          <p>Never start with “So… where should we start?” That signals you need to be led.</p>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900">
            “To make the best use of our time, I’ll summarise where we are and what we need to confirm today. Stop me if anything sounds incorrect.”
          </div>
          <p>This does three things:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Establishes direction.</li>
            <li>Signals you are prepared.</li>
            <li>Invites correction, not confrontation.</li>
          </ul>
        </div>
      </Section>

      <Section title="3) The BA Meeting Framework (Simple. Robust. Real.)">
        <p className="text-sm text-slate-700">
          This is the flow BAs use daily — because it works under pressure.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">What You Do</th>
                <th className="px-4 py-3">Example Script</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {framework.map((row) => (
                <tr key={row.stage} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.stage}</td>
                  <td className="px-4 py-3 text-slate-700">{row.action}</td>
                  <td className="px-4 py-3 text-slate-700 italic">“{row.script}”</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Not special. Just effective. Set frame → reflect → surface → constrain → assign.
        </div>
      </Section>

      <Section title="4) Conversation Scripts for Real Scenarios">
        <div className="grid gap-4 md:grid-cols-2">
          {scripts.map((entry) => (
            <div key={entry.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Quote size={14} className="text-indigo-500" />
                Talking with {entry.title}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">Goal: {entry.goal}</div>
              <p className="mt-2 text-sm text-slate-700">“{entry.script}”</p>
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                Why this works: {entry.why}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="5) The Power of How You Take Notes">
        <p className="text-sm text-slate-700">You don’t write everything. You write meaning.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {notesComparison.map((card) => (
            <div key={card.title} className={`rounded-2xl border ${card.border} p-4 shadow-sm`}>
              <div className={`text-sm font-semibold ${card.tone}`}>{card.title}</div>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          Analysis beats transcription. Your notes become the decision trail.
        </div>
      </Section>

      <Section title="6) How to Close a Meeting (Correctly)">
        <p className="text-sm text-slate-700">Wrong: “Okay, thanks everyone!”</p>
        <p className="mt-2 text-sm text-slate-700">Correct:</p>
        <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
          <p className="font-semibold text-slate-900">“To confirm:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>We’re aligned that our core outcome is reducing fraud loss without increasing KYC friction.</li>
            <li>Compliance will share control anchor points.</li>
            <li>Analytics will confirm baselines.</li>
            <li>I’ll document the problem statement and share it in the channel for review.”</li>
          </ul>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          People leave knowing what was decided, what happens next, and who is doing what. That is leadership.
        </p>
      </Section>

      <Section title="7) Your Task Today: Define Your Communication Stance">
        <p className="text-sm text-slate-700">
          Complete these sentences in your own words. This is how you engineer authority without volume.
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
          <li>When I speak to ______, my primary goal is ______.</li>
          <li>The language I must avoid is ______.</li>
          <li>The emotional tone I want to create is ______.</li>
          <li>They will trust me when they see ______.</li>
        </ul>
        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={6}
          placeholder="Write your communication stance here..."
          value={stance}
          onChange={(event) => setStance(event.target.value)}
        />
        <div className="mt-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow">
          <div className="font-semibold">Want to see how another BA does it?</div>
          <button
            onClick={handleOpenExample}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
          >
            View example stance & follow-up
            <ArrowRight size={14} />
          </button>
        </div>
      </Section>

      <Section title="8) Slack / Teams Follow-Up Message (Copy + Paste)">
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-sm text-white shadow">
          <p>Good session — summarising decisions here to ensure shared clarity:</p>
          <p>• Outcome: Reduce fraud loss while protecting conversion baseline.</p>
          <p>• Constraints: KYC control points at signup + address change remain non-negotiable.</p>
          <p>• Next steps: Analytics confirming baselines; Ops providing queue examples; Compliance sharing audit notes.</p>
          <p>I’ll post the updated problem statement EOD for review.</p>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          This message tells everyone: you are calm, structured, reliable, and leading.
        </p>
      </Section>

      {showExample && (
        <div
          ref={exampleRef}
          className="mt-10 rounded-3xl border-2 border-indigo-300 bg-white p-6 shadow-xl space-y-4 text-sm text-slate-700"
        >
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles size={18} />
            <h3 className="text-lg font-semibold">Example: BA Communication Stance + Follow-Up</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p><strong>PO conversation stance:</strong> “When I speak with Ben, my primary goal is aligning success metrics and decision rights. I avoid speculative language. I keep tone calm-confidence. He trusts me when he sees I’ve summarised pressure and trade-offs accurately.”</p>
            <p><strong>Compliance stance:</strong> “With Marie, my goal is to protect audit defensibility. I avoid phrases like ‘quick change’. Tone = composed diligence. Trust is earned when she sees me designing around immovable controls.”</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p><strong>Meeting close script:</strong> “To confirm: we’re aligned on outcome, compliance is sharing control anchors, analytics is confirming baselines, I’m drafting the statement.”</p>
            <p><strong>Follow-up message:</strong> Same Slack/Teams copy above — posted within 30 minutes while details are fresh.</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            This is how a BA becomes respected — not by volume, but by intent, clarity, and reliable follow-through.
          </div>
        </div>
      )}

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default StakeholderCommunication;

