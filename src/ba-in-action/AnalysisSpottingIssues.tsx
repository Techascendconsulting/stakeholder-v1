import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_5_DATA } from './page5-data';
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
  FileText,
  ChevronRight,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

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
    whatToDo: 'Compare what exists (As-Is) vs what you need (To-Be). The difference is the gap. Document why the gap exists and what impact it has.',
    why: 'Gaps are what\'s missing or broken. Understanding why gaps exist helps you design a To-Be solution that actually fixes the problem.',
  },
  {
    category: 'To-Be Solution',
    questions: [
      '"If this worked perfectly, what would your day look like?"',
      '"What would you stop doing? What would you start seeing?"',
      '"What must the system do? (requirements)"',
      '"What must stay the same? (non-negotiables, regulatory anchors)"',
      '"What does success look like in 6 months? How would we measure it?"',
    ],
    whatToDo: 'Define the solution (how things will work) and the requirements (what the system must do). Identify constraints and success metrics.',
    why: 'To-Be is your solution with requirements. It describes what will exist and what it must do to solve the gaps you identified.',
  },
];

// --- Glossary Sidebar Component ---
const GlossarySidebar: React.FC<{ project: 'cif' | 'voids'; pageKey: string }> = ({ project, pageKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const terms = getGlossaryTerms(project, pageKey);

  if (terms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-blue-300 rounded-2xl shadow-lg overflow-hidden mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-all duration-200 bg-blue-50/30"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-600" />
          <span className="text-lg font-bold text-slate-900">Key Terms</span>
          <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">
            {terms.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-blue-600" />
        ) : (
          <ChevronRight size={18} className="text-blue-600" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-blue-200/50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {terms.map((item, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="font-semibold text-sm text-slate-900 mb-1">{item.term}</div>
                <div className="text-xs text-slate-700 leading-relaxed">{item.definition}</div>
                {item.context && (
                  <div className="text-xs text-blue-600 mt-1 italic">{item.context}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- BA Journey Sidebar ---
const BAJourneySidebar: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-blue-400 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-8">
      {/* Subtle background image */}
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/images/collaborate1.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-white" />
          <div className="text-base font-bold text-white">A BA's Approach to As-Is → Gap → To-Be</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Ask to shadow</div>
                <div className="text-white/80 text-xs mt-0.5">"Can I watch you work? Show me the messy version."</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Capture real As-Is</div>
                <div className="text-white/80 text-xs mt-0.5">Observe behavior, note timestamps, listen for sighs and workarounds</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Identify gaps</div>
                <div className="text-white/80 text-xs mt-0.5">Compare original intent vs current reality. Why do gaps exist?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Define To-Be solution</div>
                <div className="text-white/80 text-xs mt-0.5">The solution (how things will work) and requirements (what it must do). What must stay? What can change?</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Document and validate</div>
                <div className="text-white/80 text-xs mt-0.5">Share As-Is map, gap analysis, and To-Be direction with stakeholders for confirmation</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You're not documenting the ideal. You're <strong>mapping reality, explaining why gaps exist, and defining direction</strong> so solutions solve real problems, not fictional ones.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisSpottingIssues: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page5Data = PAGE_5_DATA[selectedProject];
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
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="As-Is → Gaps → To-Be" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

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
      <Section title="Why As-Is/Gap/To-Be Matters (Especially in Interviews)">
        <div className="space-y-3 text-base text-slate-800">
          <p className="leading-relaxed">
            Interviewers ask: <strong className="text-slate-900">&quot;How do you analyze existing processes?&quot;</strong> or <strong className="text-slate-900">&quot;Tell me about a time when you identified a gap between current state and desired outcome.&quot;</strong>
          </p>
          <p className="leading-relaxed">
            This analysis happens <strong>before you start building anything</strong>. It helps you understand what's broken and what needs to change.
          </p>
        </div>
        <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-bold mb-3">
            <Target size={16} />
            When You Do This Work
          </div>
          <p className="mb-3 leading-relaxed">
            <strong>Timing:</strong> Do this analysis at the start of a project, before anyone starts building features. This is when you figure out what the real problem is and what direction you want to move in.
          </p>
          <p className="mb-3 leading-relaxed">
            <strong>What You Create:</strong>
          </p>
          <ul className="ml-4 space-y-2 mb-3">
            <li>• <strong>As-Is map:</strong> A simple document showing how things work right now (the real version, not the ideal one)</li>
            <li>• <strong>Gap analysis:</strong> A list showing what's broken, why it's broken, and what impact it has</li>
            <li>• <strong>To-Be solution:</strong> The solution (how things will work) and the requirements (what the system must do)</li>
            <li>• <strong>Success metrics:</strong> How you'll measure if the changes worked (agreed with your project lead)</li>
          </ul>
          <p className="leading-relaxed">
            <strong>How You Use It:</strong> Share your findings with the team and project lead. Use the pain points you identified to decide what to work on first.
          </p>
        </div>
      </Section>

      {/* Glossary */}
      <GlossarySidebar project={selectedProject} pageKey="as-is-to-be" />

      {/* BA Journey Sidebar */}
      <BAJourneySidebar />

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
              {page5Data.signals.map((row) => (
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
          <p>{page5Data.asIsDraft}</p>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Observed pain:
          <ul className="mt-2 list-disc list-inside space-y-1 text-emerald-800">
            {page5Data.observedPain.map((pain, index) => (
              <li key={index}>{pain}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title={`4) BA Observation Notes: Shadowing ${selectedProject === 'cif' ? 'James (Ops)' : 'Tom (Repairs)'} for 2 Hours`}>
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          This is what the BA observes when shadowing for 2 hours. Watch what the BA writes down.
        </p>

        {/* Observation Notes Document */}
        <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
            <div className="text-white font-bold">BA Observation Notes</div>
            <div className="text-white/80 text-xs mt-1">Date: Week 1, Day 4 | Observer: You (BA) | Shadowing: {selectedProject === 'cif' ? 'James Walker (Ops)' : 'Tom Richards (Repairs)'}</div>
          </div>

          <div className="p-5 space-y-4 text-sm">
            <div className="border-b border-slate-200 pb-3">
              <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">Context</div>
              <p className="text-slate-800">{page5Data.observationNotes.context}</p>
            </div>

            <div className="space-y-3">
              {page5Data.observationNotes.notes.map((note, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-purple-700">{note.time}</span>
                    <span className="text-xs text-slate-600">{note.event}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{note.observation}</p>
                  <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-400 rounded text-xs text-amber-900">
                    <strong>BA NOTE:</strong> {note.baNote}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 mt-4">
              <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-2">Summary of Pain Points Observed</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-800">
                {page5Data.observationNotes.summary.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 border-2 border-blue-400 shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <Lightbulb size={14} />
            What to look for when shadowing
          </div>
          <ul className="space-y-1 text-sm text-white/95">
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA notes timestamps and exact sequences (not summaries)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA captures direct quotes (&quot;I usually just...&quot;)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA observes workarounds and system-switching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-200 mt-0.5 font-bold">→</span>
              <span>BA writes insights immediately (amber boxes)</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={16} />
            Pro tip: Always ask &quot;Can I shadow you?&quot; instead of &quot;Can you explain your process?&quot; Watching reveals truth that talking hides.
          </div>
        </div>
      </Section>

      <Section title="5) What Is a Gap? (Simple Explanation with Example)">
        <div className="mb-4 space-y-4">
          <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-5">
            <div className="text-base font-bold text-blue-900 mb-3">What Is a Gap?</div>
            <p className="text-sm text-blue-800 leading-relaxed mb-3">
              A <strong>gap</strong> is the difference between what you have (As-Is) and what you need (To-Be). It's what's missing or broken that prevents you from reaching your goal.
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm font-semibold text-slate-900 mb-2">Example:</div>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>As-Is (What you have):</strong> Manual review process takes 3 days. Staff copy-paste data between 4 different systems.</p>
                <p><strong>What you need:</strong> Reviews completed in 24 hours with all data in one place.</p>
                <p className="font-semibold text-blue-700 mt-2">→ <strong>The Gap:</strong> No single system connects all the data. Manual work causes delays.</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          Now let's identify the specific gaps in this project:
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
          <table className="min-w-full border-collapse text-sm bg-white">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Gap (What's Missing)</th>
                <th className="px-5 py-3 border-b border-slate-200">Why It Exists</th>
                <th className="px-5 py-3 border-b border-slate-200">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {page5Data.gaps.map((item) => (
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

      <Section title="6) What Is To-Be? (The Solution with Requirements)">
        <div className="mb-4 space-y-4">
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
            <div className="text-base font-bold text-emerald-900 mb-3">What Is To-Be?</div>
            <p className="text-sm text-emerald-800 leading-relaxed mb-3">
              <strong>To-Be</strong> is your solution. It describes how things will work in the future and includes the requirements (what the system must do) to make it happen.
            </p>
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="text-sm font-semibold text-slate-900 mb-2">Example:</div>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>To-Be Solution:</strong> Automated review system that processes cases in 24 hours</p>
                <p className="font-semibold text-emerald-700 mt-2">Requirements (what it must do):</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>System must pull data from all 4 sources automatically</li>
                  <li>System must flag high-risk cases for manual review within 1 hour</li>
                  <li>System must send notifications to reviewers when cases are assigned</li>
                  <li>System must track review status and completion time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-base text-slate-800 mb-4 leading-relaxed">
          Here's the To-Be for this project:
        </p>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {page5Data.toBePoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong>Remember:</strong> To-Be is your solution with requirements. It describes what will exist and what it must do to solve the gaps you identified.
        </div>
      </Section>

      <Section title="7) Translate Into a One-Slide Narrative">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-rose-500 font-semibold">Now (As-Is)</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              {page5Data.narrativeNow.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-emerald-500 font-semibold">Future (To-Be)</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              {page5Data.narrativeFuture.map((item, index) => (
                <li key={index}>{item}</li>
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
          placeholder={page5Data.taskPlaceholder}
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
            {page5Data.slackUpdate.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
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
            <p><strong>Real As-Is:</strong> {page5Data.exampleNarrative.asIs}</p>
            <p><strong>Gap between intention and reality:</strong> {page5Data.exampleNarrative.gap}</p>
            <p><strong>Why it matters:</strong> {page5Data.exampleNarrative.whyMatters}</p>
            <p><strong>To-Be solution:</strong> {page5Data.exampleNarrative.toBe}</p>
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

