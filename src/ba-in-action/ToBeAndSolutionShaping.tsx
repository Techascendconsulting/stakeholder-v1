import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_6_DATA } from './page6-data';
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
  ClipboardCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Users,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_requirements';

const HERO_IMAGE = '/images/collaborate1.jpg';

const QUESTIONS_TO_ASK = [
  {
    category: 'Before Writing Requirements',
    questions: [
      '"What decision are we trying to enable? What ambiguity needs to be removed?"',
      '"What happens if we build this wrong? What\'s non-negotiable?"',
      '"Who needs to sign off on this? What do they care about?"',
      '"What constraints must we respect? (regulatory, technical, capacity)"',
    ],
    whatToDo: 'Clarify intent first. Identify decision boundaries. Map stakeholder concerns and non-negotiables before writing a single requirement.',
    why: 'Requirements without context become documentation theatre. Understanding the "why" prevents building the wrong thing correctly.',
  },
  {
    category: 'Writing Acceptance Criteria',
    questions: [
      '"How will we know this is working correctly?"',
      '"What are the edge cases? What breaks the happy path?"',
      '"What data do we need? Where does it come from?"',
      '"How do we test this without breaking production?"',
    ],
    whatToDo: 'Write testable conditions. Use "Given/When/Then" or numbered AC format. Be specific about data, states, and expected outcomes.',
    why: 'Vague AC = rework. Clear AC = confident build. Engineering needs precision to estimate and implement correctly.',
  },
  {
    category: 'Validation & Traceability',
    questions: [
      '"Does this requirement trace back to a business outcome?"',
      '"Can we measure whether this solves the problem?"',
      '"Is this a constraint or a preference? Can we challenge it?"',
      '"What happens if we descope this? What\'s the minimum viable version?"',
    ],
    whatToDo: 'Build a traceability matrix linking requirements to outcomes. Define success metrics. Separate must-haves from nice-to-haves.',
    why: 'Traceability defends your work in steering meetings. It shows you\'re solving problems, not just collecting wishes.',
  },
];

const AGILE_CONTEXT = {
  when: 'Requirements are refined during Backlog Grooming/Refinement sessions before Sprint Planning.',
  deliverables: [
    'User stories with clear acceptance criteria',
    'Definition of Done for each story',
    'Dependencies and constraints documented',
    'Success metrics defined and agreed',
    'Traceability to business outcomes',
  ],
  ceremonies: 'Present refined requirements in Sprint Planning. Use AC as basis for task breakdown and estimation. Reference traceability in Sprint Reviews.',
};

const ToBeAndSolutionShaping: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page6Data = PAGE_6_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const [requirementsDraft, setRequirementsDraft] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const exampleRef = useRef<HTMLDivElement | null>(null);

  const toggleScript = (section: string) => {
    setExpandedScript(expandedScript === section ? null : section);
  };

  const openExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="Requirements & Documentation (The Right Way)" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">You convert understanding into decisions engineering can build.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Business professionals collaborating on requirements"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <FileText size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Requirements: Decisions Made Explicit, Ambiguity Removed
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            You&apos;re translating truth into buildable statements that engineering trusts and leadership signs off. Requirements aren&apos;t documents—they&apos;re decisions.
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section title="Why Requirements Matter (Especially in Agile & Interviews)">
        <div className="space-y-3 text-base text-slate-800">
          <p className="leading-relaxed">
            Interviewers ask: <strong className="text-slate-900">&quot;How do you write requirements?&quot;</strong> or <strong className="text-slate-900">&quot;Tell me about a time when you had to translate business needs into technical specifications.&quot;</strong>
          </p>
          <p className="leading-relaxed">
            In Agile, requirements are refined continuously during Backlog Grooming and finalized before Sprint Planning.
          </p>
        </div>
        <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-bold mb-2">
            <Target size={16} />
            Agile Context
          </div>
          <p className="mb-2"><strong>When:</strong> {AGILE_CONTEXT.when}</p>
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
          BAs don&apos;t write requirements in isolation. They ask questions to clarify intent, identify constraints, and ensure traceability.
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
                    {section.category === 'Before Writing Requirements' ? 'B' : section.category === 'Writing Acceptance Criteria' ? 'W' : 'V'}
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
            Pro tip: Write requirements in plain language first. Then add structure. Clarity before formatting.
          </div>
        </div>
      </Section>

      <Section title="2) What Requirements Actually Are">
        <p className="text-sm text-slate-700">
          Requirements are the minimum statements needed to make decisions, remove ambiguity, allow engineering to implement, and let stakeholders sign off confidently.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="text-sm font-semibold text-emerald-900">Good requirements:</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-emerald-800">
              <li>Rooted in facts.</li>
              <li>Traceable to pain or value.</li>
              <li>Testable in the real world.</li>
              <li>Written in neutral, calm language.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <div className="text-sm font-semibold text-rose-900">Bad requirements:</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-rose-800">
              <li>Opinions or wishes.</li>
              <li>“Nice to haves.”</li>
              <li>Written to impress.</li>
              <li>Full of hype.</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">Your job: reduce uncertainty. Not impress anyone.</p>
      </Section>

      <Section title="2) Frame the Intent Before Writing Anything">
        <p className="text-sm text-slate-700">
          Always begin with the Intent Statement — the single, calm explanation of what we’re trying to achieve.
        </p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-800">
          {page6Data.intentExample}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          This is the anchor. People will drift; intent pulls them back.
        </p>
      </Section>

      <Section title="3) From Intent → Functional Truth">
        <p className="text-sm text-slate-700">Identify the functional truths that must be respected. They prevent naive solutions.</p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {page6Data.functionalTruths.map((truth, index) => (
              <li key={index}>{truth}</li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          You’re protecting reality. These truths explain why “Verify everyone” is not a real solution.
        </p>
      </Section>

      <Section title="4) Express the Requirements (Calm. Precise. Unemotional.)">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 space-y-3">
          {page6Data.requirements.map((req, index) => (
            <p key={index}>
              <span className="font-semibold text-slate-900">{index + 1}.</span> {req}
            </p>
          ))}
        </div>
      </Section>

      <Section title="5) Write the User Story (Only After the Above)">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-800 whitespace-pre-line font-medium">
          {page6Data.userStory}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          User stories are just containers. Thinking happens before this.
        </p>
      </Section>

      <Section title="6) Acceptance Criteria — Structured, Verifiable, Complete">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 space-y-2">
          {page6Data.acceptanceCriteria.map((ac, index) => (
            <p key={index}>{ac}</p>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-700">
          Note the absence of “should”. Just conditions and expected outcomes.
        </p>
      </Section>

      <Section title="7) Traceability Matrix (Simple, Clean, Real)">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          Link every requirement to a business outcome. This defends your work in steering meetings.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Outcome Goal</th>
                <th className="px-5 py-3 border-b border-slate-200">Requirement</th>
                <th className="px-5 py-3 border-b border-slate-200">Measure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {page6Data.traceability.map((row) => (
                <tr key={row.outcome} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.outcome}</td>
                  <td className="px-5 py-4 text-slate-700">{row.requirement}</td>
                  <td className="px-5 py-4 text-slate-700">{row.measure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Target size={16} />
            Traceability shows you&apos;re solving problems, not just collecting wishes. This is how you defend scope in leadership reviews.
          </div>
        </div>
      </Section>

      <Section title="8) BA Documents in Confluence & Gets Dev Feedback">
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          This is what the BA creates in Confluence after defining requirements. Watch how the BA shares it with the dev team and incorporates their feedback.
        </p>

        {/* Confluence Page Mockup */}
        <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <FileText size={16} />
              <span className="font-semibold text-sm">Confluence</span>
              <span className="text-white/60">›</span>
              <span className="text-white/90 text-sm">{projectData.initiativeName}</span>
              <span className="text-white/60">›</span>
              <span className="text-white/90 text-sm">Requirements</span>
            </div>
            <span className="text-white/80 text-xs">Last edited: Today, 3:42 PM by You (BA)</span>
          </div>

          <div className="p-6 space-y-4 text-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{page6Data.confluencePage.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">{page6Data.confluencePage.sprint}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">Draft</span>
                <span>Author: You (BA)</span>
                <span>|</span>
                <span>Reviewed by: {selectedProject === 'cif' ? 'Alicia Chen (Dev Lead)' : 'Tom Richards (Repairs Lead)'}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Intent</h3>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                {page6Data.confluencePage.intent}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Functional Truths</h3>
              <ul className="list-disc ml-5 space-y-1 text-slate-800 bg-slate-50 p-3 rounded border border-slate-200">
                {page6Data.confluencePage.functionalTruths.map((truth, index) => (
                  <li key={index}>{truth}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Decision States</h3>
              <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                {page6Data.confluencePage.decisionStates.map((state, index) => (
                  <p key={index}><strong className="text-slate-900">{state.state}:</strong> {state.description}</p>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Acceptance Criteria</h3>
              <div className="space-y-3">
                {page6Data.confluencePage.acceptanceCriteria.map((ac, index) => {
                  const colors = [
                    { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', textSm: 'text-green-800' },
                    { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900', textSm: 'text-red-800' },
                    { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-900', textSm: 'text-amber-800' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div key={index} className={`${color.bg} border-l-4 ${color.border} p-3 rounded`}>
                      <p className={`font-semibold ${color.text} mb-2`}>{ac.id}: {ac.title}</p>
                      <ul className={`space-y-1 text-sm ${color.textSm}`}>
                        {ac.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className={`${color.textSm} mt-0.5`}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 bg-blue-50 rounded p-3">
              <div className="flex items-start gap-2">
                <Users size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Comments (3)</h4>
                  
                  {page6Data.confluencePage.comments.map((comment, index) => (
                    <div key={index} className={`bg-white border border-blue-200 rounded p-3 ${index < page6Data.confluencePage.comments.length - 1 ? 'mb-2' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-xs ${comment.author.includes('You') ? 'text-purple-700' : 'text-slate-900'}`}>{comment.author}</span>
                        <span className="text-xs text-slate-500">{comment.time}</span>
                      </div>
                      <p className="text-xs text-slate-800">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 border-2 border-blue-400 shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <Lightbulb size={14} />
            What to look for
          </div>
          <ul className="space-y-1 text-sm text-white/95">
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA documents requirements in shared tool (not Word doc on desktop)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>Dev asks clarifying question (AC was slightly ambiguous)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA updates document immediately (doesn&apos;t wait for next meeting)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>Dev confirms it&apos;s now clear (collaboration, not handoff)</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={16} />
            Pro tip: Great BAs don&apos;t write requirements in isolation. They share drafts early, invite feedback in Confluence comments, and iterate before sprint planning.
          </div>
        </div>
      </Section>

      <Section title="10) How to Present Requirements in Meetings">
        <p className="text-sm text-slate-700">
          Never read documents aloud. Never defend everything. Never overload.
        </p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
          “Here are the decision boundaries and how we’ll measure whether we’re solving the problem. If these are right, the details follow naturally. Let’s confirm alignment here first.”
        </div>
        <p className="mt-3 text-sm text-slate-700">You control the room by controlling sequence, not volume.</p>
      </Section>

      <Section title="11) Your Task Today">
        <p className="text-sm text-slate-700">
          Fill these in thoughtfully — like someone who understands both business reality and engineering constraints.
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
          <li>Intent (1 sentence)</li>
          <li>Functional truths (3–5)</li>
          <li>Decision states needed</li>
          <li>Acceptance criteria (at least 4, written cleanly)</li>
        </ul>
        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={8}
          placeholder={page6Data.taskPlaceholder}
          value={requirementsDraft}
          onChange={(event) => setRequirementsDraft(event.target.value)}
        />
        <div className="mt-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow">
          <div className="font-semibold">Want to compare against an example blueprint?</div>
          <button
            onClick={openExample}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors shadow"
          >
            View example requirements package
            <ArrowRight size={14} />
          </button>
        </div>
      </Section>

      <Section title="12) Slack / Teams Update (Copy & Adapt)">
        <p className="text-base text-slate-800 mb-3 leading-relaxed">
          After finalizing requirements, post an update. This shows structured thinking and stakeholder management.
        </p>
        <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
          <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
            {page6Data.slackUpdate.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
          <strong>Why this works:</strong> This is how you look structured, senior, and calm. Clear deliverables. Clear next steps.
        </div>
      </Section>

      {showExample && (
        <div
          ref={exampleRef}
          className="mt-10 rounded-3xl border-2 border-indigo-300 bg-white p-6 shadow-xl space-y-4 text-sm text-slate-700"
        >
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles size={18} />
            <h3 className="text-lg font-semibold">Example: How a BA Builds a Complete Requirement</h3>
          </div>
          
          <div className="space-y-4">
            {/* Step 1: Intent */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Step 1: Frame the Intent</div>
              <p className="font-medium text-slate-900">{page6Data.exampleContent.intent}</p>
              <p className="mt-2 text-xs text-slate-600 italic">This is the anchor. When stakeholders drift into wishlist mode, you point back to this.</p>
            </div>

            {/* Step 2: Functional Truths */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Step 2: Identify Functional Truths (What Must Be Respected)</div>
              <ul className="space-y-1 text-slate-800">
                {page6Data.exampleContent.functionalTruths.map((truth, index) => (
                  <li key={index}>• {truth}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-600 italic">These prevent naive solutions like &quot;{selectedProject === 'cif' ? 'verify everyone manually' : 'inspect every property manually'}.&quot;</p>
            </div>

            {/* Step 3: Decision States */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Step 3: Define Decision States</div>
              <div className="space-y-2 text-slate-800">
                {page6Data.exampleContent.decisionStates.map((state, index) => (
                  <p key={index}><strong>{state.state}:</strong> {state.description}</p>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-600 italic">Clear boundaries remove ambiguity. Engineering knows exactly what to build.</p>
            </div>

            {/* Step 4: User Story */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Step 4: Write the User Story (Container for AC)</div>
              <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs">
                <p className="font-semibold">{page6Data.exampleContent.userStory.id}: {page6Data.exampleContent.userStory.title}</p>
                <p className="mt-2">{page6Data.exampleContent.userStory.as}</p>
                <p>{page6Data.exampleContent.userStory.want}</p>
                <p>{page6Data.exampleContent.userStory.so}</p>
              </div>
              <p className="mt-2 text-xs text-slate-600 italic">Story provides context. Real work happens in acceptance criteria.</p>
            </div>

            {/* Step 5: Acceptance Criteria */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Step 5: Write Testable Acceptance Criteria</div>
              <div className="space-y-2 text-sm">
                {page6Data.exampleContent.acceptanceCriteria.map((ac, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-2">{ac.id}: {ac.title}</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {ac.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className="text-slate-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-600 italic">Notice: No &quot;should.&quot; No ambiguity. Engineering can estimate accurately and QA can test precisely.</p>
            </div>

            {/* Step 6: Traceability */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Step 6: Link to Business Outcomes (Traceability)</div>
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-xs bg-white">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="px-3 py-2 border-b border-slate-200">Outcome</th>
                      <th className="px-3 py-2 border-b border-slate-200">AC</th>
                      <th className="px-3 py-2 border-b border-slate-200">Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {page6Data.exampleContent.traceability.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 font-medium">{row.outcome}</td>
                        <td className="px-3 py-2">{row.requirement}</td>
                        <td className="px-3 py-2">{row.measure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-600 italic">This is how you defend scope in steering meetings: &quot;{selectedProject === 'cif' ? 'AC04 directly reduces fraud loss by 30%' : 'AC04 directly reduces void days by 30%'}.&quot;</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>This is how a real BA works:</strong> Intent → Truths → Decisions → Story → AC → Traceability. Not documents. Clarity.
          </div>
        </div>
      )}

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default ToBeAndSolutionShaping;

