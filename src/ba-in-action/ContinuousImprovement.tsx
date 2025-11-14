import React, { useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_9_IMPROVEMENT_DATA } from './page9-improvement-data';
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
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Repeat,
  ArrowRight,
  MessageSquare,
  FileText,
  Eye,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_improvement';

const HERO_IMAGE = '/images/collaborate1.jpg';

function useNotes() {
  const [notes, setNotes] = useState<{[k: string]: string}>({
    retrospective: "",
    improvement_story: "",
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

const ContinuousImprovement: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page9Data = PAGE_9_IMPROVEMENT_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  
  const { notes, saveNote } = useNotes();

  return (
    <PageShell>
      <div className="space-y-2 mb-6">
        <p className="uppercase tracking-wider text-xs font-semibold text-purple-500">BA In Action</p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Continuous Improvement: Post-Launch Learning</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
            {projectData.initiativeName}
          </span>
        </div>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">{page9Data.ticketId} has been live for {page9Data.weeksSinceLaunch} weeks. You run a retrospective to capture lessons learned and identify improvements.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Team reflecting on project outcomes"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <Repeat size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Continuous Improvement: Learn, Document, Iterate
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            Senior BAs don&apos;t just ship and walk away. They run retrospectives, log lessons learned, prioritize improvements, and ensure the system evolves.
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Why Continuous Improvement Matters (Especially in Interviews)</h2>
          <div className="space-y-3 text-base text-slate-800">
            <p className="leading-relaxed">
              Interviewers ask: <strong className="text-slate-900">&quot;How do you ensure a solution continues to deliver value after launch?&quot;</strong> or <strong className="text-slate-900">&quot;Tell me about a time you learned from a project and applied those lessons.&quot;</strong>
            </p>
            <p className="leading-relaxed">
              Continuous improvement = post-launch retrospectives, monitoring KPIs, capturing feedback, and prioritizing enhancements.
            </p>
          </div>
          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Target size={16} />
              {page9Data.postLaunchContext.title}
            </div>
            <p className="mb-2"><strong>What&apos;s live:</strong> {page9Data.postLaunchContext.whatsLive}</p>
            <p className="mb-2"><strong>KPIs:</strong> {page9Data.postLaunchContext.kpis}</p>
            <p><strong>Today&apos;s focus:</strong> {page9Data.postLaunchContext.focus}</p>
          </div>
        </div>
      </Section>

      {/* Sprint Retrospective */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Post-Launch Retrospective: What Went Well / What Didn&apos;t</h2>
            </div>
            <MessageSquare size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              6 weeks post-launch. The BA facilitates a retrospective with the delivery team and key stakeholders.
            </p>

            {/* Retrospective Board */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* What Went Well */}
              <div className="border-2 border-green-300 rounded-lg bg-green-50/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-green-700" />
                  <h3 className="font-bold text-green-900">What Went Well</h3>
                </div>
                <ul className="space-y-2 text-sm text-green-900">
                  {page9Data.retrospective.wentWell.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 font-bold">✓</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What Didn't Go Well */}
              <div className="border-2 border-red-300 rounded-lg bg-red-50/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={18} className="text-red-700" />
                  <h3 className="font-bold text-red-900">What Didn&apos;t Go Well</h3>
                </div>
                <ul className="space-y-2 text-sm text-red-900">
                  {page9Data.retrospective.didntGoWell.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5 font-bold">✗</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions / Improvements */}
              <div className="border-2 border-amber-300 rounded-lg bg-amber-50/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-amber-700" />
                  <h3 className="font-bold text-amber-900">Actions to Take</h3>
                </div>
                <ul className="space-y-2 text-sm text-amber-900">
                  {page9Data.retrospective.actions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5 font-bold">→</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <LookFor items={[
              "BA captures both successes AND failures (not defensive)",
              "Actions are specific (e.g., 'Add edge case checklist') not vague (e.g., 'Do better')",
              "Team feels safe to speak openly (psychological safety)",
              "Lessons are documented for future projects"
            ]} />

            <CoachingHint title="How BAs Run Effective Retrospectives">
              <p>Retrospectives are NOT blame sessions. They&apos;re structured learning.</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Set the stage: &quot;This is about learning, not blaming&quot;</li>
                <li>• Use a simple format: What went well? What didn&apos;t? What actions?</li>
                <li>• Capture EVERYTHING (use Miro/Confluence, not just chat)</li>
                <li>• Turn actions into Jira stories (don&apos;t let them disappear)</li>
                <li>• Follow up in next retrospective (&quot;Did we do the actions?&quot;)</li>
              </ul>
              <p className="mt-2">In interviews: &quot;After launch, I facilitated a retrospective. We identified 3 process improvements and created actionable stories for the next sprint.&quot;</p>
            </CoachingHint>

            {/* Task 1 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Write Your Own Retrospective Notes
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Imagine you just finished a project. Write 2 things that went well, 2 that didn&apos;t, and 2 actions to improve.
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={6}
                placeholder="Went Well:&#10;1. ...&#10;2. ...&#10;&#10;Didn't Go Well:&#10;1. ...&#10;2. ...&#10;&#10;Actions:&#10;1. ...&#10;2. ..."
                value={notes.retrospective}
                onChange={(e) => saveNote('retrospective', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Improvement Backlog */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Improvement Backlog: Prioritizing What&apos;s Next</h2>
            </div>
            <FileText size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              The BA converts retrospective actions into prioritized user stories for the product backlog.
            </p>

            {/* Improvement Stories Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
              <table className="min-w-full border-collapse text-sm bg-white">
                <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-200">Story ID</th>
                    <th className="px-5 py-3 border-b border-slate-200">Title</th>
                    <th className="px-5 py-3 border-b border-slate-200">Value</th>
                    <th className="px-5 py-3 border-b border-slate-200">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {page9Data.improvementStories.map((story, index) => (
                    <tr key={index} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">{story.id}</td>
                      <td className="px-5 py-4 text-slate-700">{story.title}</td>
                      <td className="px-5 py-4 text-slate-700">{story.value}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 ${story.priorityBg} ${story.priorityColor} text-xs font-bold rounded-full`}>{story.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <CoachingHint title="How BAs Prioritize Improvements">
              <p>Not all improvements are equal. BAs prioritize using:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Value:</strong> Regulatory/compliance = always high</li>
                <li>• <strong>Impact:</strong> Does it reduce pain for users/ops/dev?</li>
                <li>• <strong>Effort:</strong> Quick wins go first if value is equal</li>
                <li>• <strong>Risk:</strong> Does delaying it create technical debt or audit issues?</li>
              </ul>
              <p className="mt-2">In interviews: &quot;I prioritized the audit log UI as high because Compliance had a hard deadline. Bulk actions were medium — valuable but not blocking.&quot;</p>
            </CoachingHint>

            {/* Task 2 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Write an Improvement User Story
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Write a user story for <strong>{page9Data.taskStory.id}: {page9Data.taskStory.title}</strong>.
                <br />Include: As a [role], I want [goal], so that [benefit]. Add 2-3 acceptance criteria.
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={7}
                placeholder={`${page9Data.taskStory.id}: ${page9Data.taskStory.title}&#10;&#10;As a...&#10;I want...&#10;So that...&#10;&#10;Acceptance Criteria:&#10;AC01: ...&#10;AC02: ...`}
                value={notes.improvement_story}
                onChange={(e) => saveNote('improvement_story', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Monitoring & Early Warning */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Ongoing Monitoring: Early Warning Signals
          </h2>
          <p className="text-base text-slate-800 mb-4 leading-relaxed">
            BAs don&apos;t just ship and forget. They monitor KPIs and watch for early warning signals that indicate the solution is degrading.
          </p>

          {/* Warning Signals Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
            <table className="min-w-full border-collapse text-sm bg-white">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-3 border-b border-slate-200">Early Warning Signal</th>
                  <th className="px-5 py-3 border-b border-slate-200">What It Means</th>
                  <th className="px-5 py-3 border-b border-slate-200">BA Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {page9Data.warningSignals.map((signal, index) => (
                  <tr key={index} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{signal.signal}</td>
                    <td className="px-5 py-4 text-slate-700">{signal.meaning}</td>
                    <td className="px-5 py-4 text-slate-700">{signal.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-semibold">
              <Lightbulb size={16} />
              Pro tip: Set up automated KPI alerts (e.g., Slack alert if {selectedProject === 'cif' ? 'queue > 24h' : 'queue > 7 days'}). Don&apos;t rely on manual checks.
            </div>
          </div>
        </div>
      </Section>

      {/* Lessons Learned Document */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Lessons Learned Document (Copy & Adapt)</h2>
          <p className="text-base text-slate-800 mb-3 leading-relaxed">
            After the retrospective, the BA creates a &quot;Lessons Learned&quot; document for future projects.
          </p>
          <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
            <div className="font-mono text-sm leading-relaxed space-y-3 p-3 rounded bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900">Project: {page9Data.lessonsLearned.project}</p>
              <p className="font-bold text-slate-900 mt-3">What Went Well:</p>
              <ul className="ml-4 space-y-1">
                {page9Data.lessonsLearned.wentWell.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
              <p className="font-bold text-slate-900 mt-3">What Didn&apos;t Go Well:</p>
              <ul className="ml-4 space-y-1">
                {page9Data.lessonsLearned.didntGoWell.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
              <p className="font-bold text-slate-900 mt-3">Actions for Next Time:</p>
              <ul className="ml-4 space-y-1">
                {page9Data.lessonsLearned.actions.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
              <p className="font-bold text-slate-900 mt-3">Key Metric:</p>
              <p>{page9Data.lessonsLearned.keyMetric}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
            <strong>Why this works:</strong> Future teams read this BEFORE starting similar projects. You&apos;re reducing organizational debt.
          </div>
        </div>
      </Section>

      {/* Slack Update */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Slack / Teams Update (Copy & Adapt)</h2>
          <p className="text-base text-slate-800 mb-3 leading-relaxed">
            After the retrospective and improvement backlog prioritization, post an update.
          </p>
          <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
            <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
              {page9Data.slackUpdate.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
            <strong>Why this works:</strong> Shows continuous ownership, structured learning, and forward planning. This is how senior BAs operate.
          </div>
        </div>
      </Section>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default ContinuousImprovement;
