import React, { useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
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
  ArrowRight,
  Lightbulb,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_implementation';

const HERO_IMAGE = '/images/collaborate1.jpg';

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
          <div className="text-base font-bold text-white">A BA's Approach to Implementation</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Start with high-level requirements</div>
                <div className="text-white/80 text-xs mt-0.5">From stakeholders: what problem to solve, what success looks like</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Decompose into detailed requirements</div>
                <div className="text-white/80 text-xs mt-0.5">Break down high-level into specific, testable statements</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Refine in team meetings</div>
                <div className="text-white/80 text-xs mt-0.5">Developers ask questions, you clarify, update requirements</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">During implementation, go back to stakeholders</div>
                <div className="text-white/80 text-xs mt-0.5">Edge cases appear, questions come up - you reach out for answers</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Iterate and refine</div>
                <div className="text-white/80 text-xs mt-0.5">Update requirements based on what you learn, keep stakeholders informed</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              In agile, you <strong>don't collect all requirements upfront</strong>. You start high-level, decompose as you go, and iterate based on what you learn during implementation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Implementation: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="Implementation & Agile Approach" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">You have requirements. Now understand how they flow into implementation and how BAs work in agile teams.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Team collaborating on implementation"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <RefreshCw size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            From Problem Understanding to Implementation
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            You don't collect all requirements upfront. You start high-level, decompose as you go, and iterate based on what you learn. This is how requirements flow into implementation.
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section title="Why This Matters (Especially in Interviews)">
        <div className="space-y-3 text-base text-slate-800">
          <p className="leading-relaxed">
            Interviewers ask: <strong className="text-slate-900">&quot;How do you work in an Agile environment?&quot;</strong> or <strong className="text-slate-900">&quot;What's the difference between waterfall and agile?&quot;</strong>
          </p>
          <p className="leading-relaxed">
            Understanding how requirements flow from problem understanding (Page 2) through to implementation is critical. This page shows you how.
          </p>
        </div>
      </Section>

      {/* Main grid layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* How We Got Here: From Page 2 to SDLC */}
          <Section title="1) How We Got Here: From Problem Understanding to SDLC">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            Let's trace the journey from when you first understood the problem (Page 2) to where we are now - ready to implement.
          </p>
          
          <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
            <div className="text-base font-bold text-indigo-900 mb-3">The Journey So Far</div>
            <div className="space-y-3 text-sm text-indigo-800">
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">Page 2:</span>
                <div>
                  <strong>Understand the Problem</strong> - You captured the problem statement, baselines, scope, and constraints. You identified what success looks like.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">Page 3-4:</span>
                <div>
                  <strong>Stakeholder Analysis & Communication</strong> - You mapped who's involved and how to engage them.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">Page 5:</span>
                <div>
                  <strong>As-Is → Gap → To-Be</strong> - You mapped current state, identified gaps, and defined the solution (To-Be) with high-level requirements.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">Page 6:</span>
                <div>
                  <strong>Requirements & Documentation</strong> - You wrote detailed requirements from the To-Be solution, turning it into specific, testable statements.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">Now (Page 7):</span>
                <div>
                  <strong>Implementation</strong> - Requirements flow into the Software Development Life Cycle (SDLC). This is where developers build, and you continue to refine requirements as questions arise.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Target size={16} />
              Key Point: Everything Connects
            </div>
            <p className="leading-relaxed">
              The problem statement from Page 2 becomes the foundation. The To-Be solution from Page 5 becomes the requirements on Page 6. Those requirements flow into implementation here. <strong>It's all connected.</strong>
            </p>
          </div>
        </div>
      </Section>

      {/* Waterfall vs Agile */}
      <Section title="2) Waterfall vs Agile: Two Different Approaches">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            There are two main ways teams deliver software. Understanding the difference helps you know when to collect all requirements upfront vs. when to iterate.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5">
              <div className="text-base font-bold text-rose-900 mb-3">Waterfall Approach</div>
              <div className="space-y-2 text-sm text-rose-800">
                <p><strong>How it works:</strong> Collect ALL requirements upfront. Design everything. Build everything. Test everything. Then launch.</p>
                <p><strong>Requirements:</strong> You gather detailed requirements from all stakeholders before any building starts.</p>
                <p><strong>When to use:</strong> When requirements are unlikely to change, when you have clear specifications, or in regulated industries where you need full documentation first.</p>
                <p><strong>BA's role:</strong> Extensive upfront requirements gathering. Less iteration during build.</p>
              </div>
            </div>
            
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
              <div className="text-base font-bold text-emerald-900 mb-3">Agile Approach</div>
              <div className="space-y-2 text-sm text-emerald-800">
                <p><strong>How it works:</strong> Start with high-level requirements. Build in small chunks (2-week sprints). Get feedback. Refine. Build more.</p>
                <p><strong>Requirements:</strong> You start with high-level requirements from stakeholders, then decompose and refine as you go.</p>
                <p><strong>When to use:</strong> When requirements might change, when you're learning as you go, or when you want to deliver value quickly and iterate.</p>
                <p><strong>BA's role:</strong> Start high-level, decompose during implementation, go back to stakeholders when questions arise.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Lightbulb size={16} />
              Most Teams Use Agile
            </div>
            <p className="leading-relaxed">
              Most modern teams use Agile (specifically Scrum). This means you <strong>don't collect all requirements upfront</strong>. You start with high-level requirements, decompose them as you go, and iterate based on what you learn during implementation.
            </p>
          </div>
        </div>
      </Section>

      {/* High-Level to Detailed Requirements */}
      <Section title="3) High-Level Requirements First, Then Decompose in Tools">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            In Agile, you start with high-level requirements from stakeholders (like you wrote on Page 6). Then, when you get to the tools stage (Jira/Excel), you break them down into detailed requirements with stakeholder sign-off.
          </p>
          
          <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-5">
            <div className="text-base font-bold text-purple-900 mb-3">The Flow:</div>
            <div className="space-y-4 text-sm text-purple-800">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="font-semibold text-purple-900 mb-2">Step 1: High-Level Requirements (Page 6 - What You Just Did)</div>
                <p className="text-slate-700">"The system must evaluate identity risk at account creation and output one of three decision states: approve automatically, block automatically, send to manual review."</p>
              </div>
              
              <div className="text-center text-purple-600 font-bold">↓ Next: Tools Stage (Jira/Excel)</div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="font-semibold text-purple-900 mb-2">Step 2: Breakdown in Tools (Page 8 - Next Page)</div>
                <p className="text-slate-700 mb-2">In Jira or Excel, you break down the high-level requirement into:</p>
                <ul className="list-disc ml-5 space-y-1 text-slate-700">
                  <li>Epics (large features)</li>
                  <li>User stories (specific functionality)</li>
                  <li>Detailed acceptance criteria</li>
                  <li>Get stakeholder sign-off</li>
                </ul>
              </div>
              
              <div className="text-center text-purple-600 font-bold">↓ During Implementation</div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="font-semibold text-purple-900 mb-2">Step 3: Further Refinement (As Questions Arise)</div>
                <p className="text-slate-700 mb-2">Developer asks: "What if the risk score is exactly 85?"</p>
                <p className="text-slate-700">You go back to stakeholder, get answer, update the requirement in Jira/Excel, get sign-off again.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>Key Point:</strong> High-level requirements (Page 6) → Breakdown in tools with sign-off (Page 8) → Refinement during implementation. You don't need to think of every detail upfront.
          </div>
        </div>
      </Section>

      {/* What Are Scrum Ceremonies? */}
      <Section title="4) What Are Scrum Ceremonies? (Simple Explanation)">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            Most teams use <strong>Scrum</strong> - a way of working in 2-week cycles called "sprints." There are regular meetings (called "ceremonies") where BAs play a key role.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-blue-600" />
                <div className="text-sm font-bold text-blue-900">Backlog Refinement</div>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed mb-2">
                <strong>When:</strong> Once or twice per sprint (before planning)
              </p>
              <p className="text-sm text-blue-800 leading-relaxed mb-2">
                <strong>What happens:</strong> BA presents requirements, developers ask questions, BA clarifies. Requirements get updated based on questions.
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>BA's role:</strong> Answer questions, clarify edge cases, update requirements if needed.
              </p>
            </div>
            
            <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-purple-600" />
                <div className="text-sm font-bold text-purple-900">Sprint Planning</div>
              </div>
              <p className="text-sm text-purple-800 leading-relaxed mb-2">
                <strong>When:</strong> Start of each 2-week sprint
              </p>
              <p className="text-sm text-purple-800 leading-relaxed mb-2">
                <strong>What happens:</strong> Team decides what to build this sprint. BA presents requirements, team estimates effort, decides what fits.
              </p>
              <p className="text-sm text-purple-800 leading-relaxed">
                <strong>BA's role:</strong> Present requirements clearly, answer questions, help team understand business context.
              </p>
            </div>
            
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-emerald-600" />
                <div className="text-sm font-bold text-emerald-900">Daily Standup</div>
              </div>
              <p className="text-sm text-emerald-800 leading-relaxed mb-2">
                <strong>When:</strong> Every day, 15 minutes
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed mb-2">
                <strong>What happens:</strong> Team shares: what I did yesterday, what I'm doing today, any blockers.
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed">
                <strong>BA's role:</strong> If developers have questions about requirements, you answer them. If you need stakeholder input, you say "I'll reach out to [stakeholder] to clarify."
              </p>
            </div>
            
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-amber-600" />
                <div className="text-sm font-bold text-amber-900">Sprint Review</div>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed mb-2">
                <strong>When:</strong> End of each 2-week sprint
              </p>
              <p className="text-sm text-amber-800 leading-relaxed mb-2">
                <strong>What happens:</strong> Team shows stakeholders what was built. Stakeholders give feedback.
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>BA's role:</strong> Present what was built, explain how it solves the problem, capture stakeholder feedback for next sprint.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* The Iterative Loop */}
      <Section title="5) The Iterative Loop: Going Back to Stakeholders During Implementation">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            <strong>Critical Point:</strong> In Agile, you don't collect all requirements upfront. During implementation, developers will have questions. Edge cases will appear. <strong>You go back to stakeholders to get answers.</strong> This is normal and expected.
          </p>
          
          <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
            <div className="text-base font-bold text-indigo-900 mb-3">What Happens During Implementation:</div>
            <div className="space-y-3 text-sm text-indigo-800">
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">1.</span>
                <div>
                  <strong>Developer asks a question:</strong> "What happens if the user's account is locked but they try to verify?"
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">2.</span>
                <div>
                  <strong>You don't know the answer</strong> - this is an edge case you didn't think of upfront
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">3.</span>
                <div>
                  <strong>You go back to the stakeholder:</strong> "Hi [Stakeholder], quick question - if a user's account is locked, should they still be able to verify their identity, or should we block them?"
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">4.</span>
                <div>
                  <strong>You get the answer and update requirements:</strong> Add this to the acceptance criteria or create a new requirement
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">5.</span>
                <div>
                  <strong>Developer continues building</strong> with the clarified requirement
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>This is not failure.</strong> This is how Agile works. Good BAs expect questions and are ready to go back to stakeholders. You're not expected to think of everything upfront - that's the whole point of Agile.
          </div>
        </div>
      </Section>

      {/* How Requirements Flow */}
      <Section title="6) How Requirements Flow: The Complete Picture">
        <div className="mb-4 space-y-4">
          <p className="text-base text-slate-800 leading-relaxed">
            Here's how requirements flow from problem understanding to implementation:
          </p>
          
          <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
            <div className="space-y-4 text-sm text-indigo-800">
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">1.</span>
                <div>
                  <strong>Page 2: Problem Understanding</strong><br/>
                  You understand the problem, baselines, scope. You know what success looks like.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">2.</span>
                <div>
                  <strong>Page 5: To-Be Solution</strong><br/>
                  You define the solution (how things will work) with high-level requirements.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">3.</span>
                <div>
                  <strong>Page 6: Detailed Requirements</strong><br/>
                  You write specific, testable requirements from the To-Be solution.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">4.</span>
                <div>
                  <strong>Backlog Refinement (This Page)</strong><br/>
                  Developers ask questions. You clarify. Requirements get updated.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">5.</span>
                <div>
                  <strong>Sprint Planning (This Page)</strong><br/>
                  Team decides what to build this sprint. Requirements are presented and estimated.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">6.</span>
                <div>
                  <strong>During Implementation (This Page)</strong><br/>
                  Developers build. Questions arise. You go back to stakeholders. Requirements get refined.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-indigo-700 mt-0.5">7.</span>
                <div>
                  <strong>Sprint Review (This Page)</strong><br/>
                  Stakeholders see what was built. Feedback is captured. Requirements for next sprint are refined.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-bold mb-2">
              <RefreshCw size={16} />
              It's Iterative, Not Linear
            </div>
            <p className="leading-relaxed">
              This isn't a straight line. You iterate. You go back. You refine. Requirements evolve as you learn more during implementation. <strong>This is the Agile way.</strong>
            </p>
          </div>
        </div>
      </Section>

        </div>

        {/* Right sidebar - context & guidance */}
        <div className="space-y-6">
          
          {/* Glossary */}
          <GlossarySidebar project={selectedProject} pageKey="implementation" />
          
          {/* BA Journey Sidebar */}
          <BAJourneySidebar />
          
        </div>
      </div>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default Implementation;

