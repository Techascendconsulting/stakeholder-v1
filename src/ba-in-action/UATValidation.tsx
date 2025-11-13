import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_8_DATA } from './page8-data';
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
  Sparkles,
  ArrowRight,
  Lightbulb,
  Eye,
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_handover_value';

const HERO_IMAGE = '/images/collaborate1.jpg';

function useNotes() {
  const [notes, setNotes] = useState<{[k: string]: string}>({
    test_scenario: "",
    issue_log: "",
    handover_notes: "",
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

const UATValidation: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page8Data = PAGE_8_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  
  const { notes, saveNote } = useNotes();

  return (
    <PageShell>
      <div className="space-y-2 mb-6">
        <p className="uppercase tracking-wider text-xs font-semibold text-purple-500">BA In Action</p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">UAT & Handover: Closing the Loop</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
            {projectData.initiativeName}
          </span>
        </div>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">{page8Data.sprint} complete. {page8Data.ticketId} is deployed. Now you coordinate UAT, validate outcomes, and hand over to BAU.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Team validating outcomes"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <CheckCircle2 size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            UAT & Handover: Prove Value, Transfer Knowledge
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            Projects finish when value is proven (Did we solve the problem?) and knowledge is transferred (Can BAU run this without you?).
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Why UAT & Handover Matter (Especially in Interviews)</h2>
          <div className="space-y-3 text-base text-slate-800">
            <p className="leading-relaxed">
              Interviewers ask: <strong className="text-slate-900">&quot;How do you validate that a solution works?&quot;</strong> or <strong className="text-slate-900">&quot;Tell me about a time you closed a project.&quot;</strong>
            </p>
            <p className="leading-relaxed">
              UAT (User Acceptance Testing) = stakeholders verify the solution meets requirements. Handover = BAU team can run/support it independently.
            </p>
          </div>
          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Target size={16} />
              UAT Context for This Project
            </div>
            <p className="mb-2"><strong>What&apos;s being tested:</strong> {page8Data.uatContext.whatBeingTested}</p>
            <p className="mb-2"><strong>Who tests:</strong> {page8Data.uatContext.whoTests}</p>
            <p><strong>Success criteria:</strong> {page8Data.uatContext.successCriteria}</p>
          </div>
        </div>
      </Section>

      {/* UAT Test Scenario */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-slate-900">UAT Test Scenarios: What the BA Prepares</h2>
            </div>
            <FileText size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              The BA creates test scenarios BEFORE UAT starts. These link back to acceptance criteria from {page8Data.ticketId}.
            </p>

            {/* Test Scenario Document */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-lg">
              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <div className="text-white font-bold">UAT Test Scenarios - {page8Data.ticketId}</div>
                <div className="text-white/70 text-xs mt-1">{projectData.initiativeName} | Prepared by: BA | Date: {page8Data.sprint} End</div>
              </div>

              <div className="p-5 space-y-4">
                {page8Data.testScenarios.map((scenario, index) => (
                  <div key={index} className={`border ${scenario.borderColor} rounded-lg p-4 ${scenario.bgColor}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 ${scenario.color} text-white text-xs font-bold rounded`}>{scenario.id}</span>
                      <span className="font-semibold text-slate-900">{scenario.title}</span>
                    </div>
                    <div className="text-sm space-y-2 text-slate-800">
                      <p><strong>Test Data:</strong> {scenario.testData}</p>
                      <p><strong>Expected {selectedProject === 'cif' ? 'Risk Score' : 'Status'}:</strong> {scenario.expectedScore}</p>
                      <p><strong>Steps:</strong></p>
                      <ol className="list-decimal ml-5 space-y-1">
                        {scenario.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                      <p><strong>Pass Criteria:</strong> {scenario.passCriteria}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <LookFor items={[
              "Each scenario maps to ONE acceptance criterion",
              "Test data is specific (exact email addresses, expected scores)",
              "Steps are numbered and actionable",
              "Pass criteria is measurable (not vague)",
              "BA references original AC (AC01, AC02, AC03)"
            ]} />

            <CoachingHint title="How BAs Write UAT Scenarios">
              <p>UAT scenarios are NOT the same as QA test cases.</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• QA tests technical functionality</li>
                <li>• UAT validates business requirements from stakeholder perspective</li>
                <li>• BA writes scenarios in business language, not technical jargon</li>
                <li>• Each scenario links to original AC so stakeholders know what they&apos;re validating</li>
              </ul>
            </CoachingHint>

            {/* Task 1 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Write a UAT Scenario
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Write a UAT scenario for <strong>AC04: Feedback Loop</strong> (Manual review outcome updates risk model within 24h).
                <br />Include: Test data, steps, and pass criteria.
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={6}
                placeholder="Write your UAT scenario here..."
                value={notes.test_scenario}
                onChange={(e) => saveNote('test_scenario', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* UAT Feedback Email */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-slate-900">UAT Feedback: Stakeholder Finds an Issue</h2>
            </div>
            <Mail size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              {page8Data.uatFeedback.stakeholderName} tested Scenario 3 and found an issue. {selectedProject === 'cif' ? 'She' : 'He'} emails the team.
            </p>

            {/* Email */}
            <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
              <div className="border-b border-slate-300 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail size={16} className="text-indigo-600" />
                  <span className="font-semibold">Inbox</span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-600">UAT Feedback - {page8Data.ticketId} Scenario 3</span>
                </div>
              </div>
              
              <div className="px-4 py-3 border-b border-slate-200 bg-white space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-base text-slate-900">{page8Data.uatFeedback.stakeholderName}</div>
                    <div className="text-sm text-slate-600">{page8Data.uatFeedback.stakeholderEmail}</div>
                  </div>
                  <div className="text-sm text-slate-500">Today, 16:22</div>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">To:</span> You (BA), Dev Team, {selectedProject === 'cif' ? 'Ben Carter (PO)' : 'Sarah Thompson (PO)'}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Subject:</span> {page8Data.uatFeedback.subject}
                </div>
              </div>

              <div className="px-4 py-4 text-base text-slate-800 leading-relaxed space-y-3">
                <p>Hi team,</p>
                <p>
                  I tested Scenario 3 ({page8Data.testScenarios[2].title}) using the test {selectedProject === 'cif' ? 'account' : 'property'} provided. The case did route to the {selectedProject === 'cif' ? 'Ops queue' : 'Repairs queue'} as expected, but I noticed the <strong className="text-red-700">{page8Data.uatFeedback.issueDescription}</strong>.
                </p>
                <p>
                  {page8Data.uatFeedback.whyItMatters}
                </p>
                <p>
                  Can this be fixed before we move to production?
                </p>
                <p className="pt-2">
                  Best,<br />
                  {page8Data.uatFeedback.stakeholderName.split('(')[0].trim()}
                </p>
              </div>
            </div>

            <LookFor items={[
              "Stakeholder describes what they tested (Scenario 3)",
              `Issue is specific (${page8Data.uatFeedback.issueDescription})`,
              `Stakeholder explains WHY it matters (${selectedProject === 'cif' ? 'regulatory compliance' : 'SLA targets'})`,
              "BA now needs to log this as a bug and coordinate fix"
            ]} />

            {/* BA Response */}
            <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
              <div className="text-sm font-semibold text-slate-900 mb-2">What the BA Does Next:</div>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-slate-700">
                <li><strong>Acknowledge the issue immediately:</strong> Reply to {page8Data.uatFeedback.stakeholderName.split('(')[0].trim()} confirming you&apos;ve logged it</li>
                <li><strong>Log in issue tracker:</strong> Create bug ticket with severity: High (blocks production)</li>
                <li><strong>Notify dev team:</strong> Slack message with link to bug ticket</li>
                <li><strong>Track to resolution:</strong> Monitor fix, coordinate re-test with {page8Data.uatFeedback.stakeholderName.split('(')[0].trim()}</li>
                <li><strong>Update stakeholders:</strong> Confirm when fixed and re-validated</li>
              </ol>
            </div>

            <CoachingHint title="How BAs Handle UAT Feedback">
              <p>When stakeholders find issues during UAT:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Acknowledge quickly (don&apos;t let emails sit)</li>
                <li>• Log formally (Jira bug ticket with severity)</li>
                <li>• Coordinate fix (connect dev + stakeholder)</li>
                <li>• Verify resolution (coordinate re-test)</li>
                <li>• Document (update issue log for handover)</li>
              </ul>
              <p className="mt-2">In interviews: &quot;During UAT, Compliance found a missing field. I logged it as high-severity, coordinated the fix with dev, and arranged re-validation.&quot;</p>
            </CoachingHint>

            {/* Task 2 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Log the Issue
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Write the Jira bug ticket for Marie&apos;s finding. Include: Title, Description, Steps to reproduce, Expected vs Actual, Severity.
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={6}
                placeholder="Write your bug ticket here..."
                value={notes.issue_log}
                onChange={(e) => saveNote('issue_log', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Metrics Dashboard */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                3
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Value Validation: Did We Solve the Problem?</h2>
            </div>
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              3 weeks after {page8Data.ticketId} deployed. BA compares metrics to baseline (from Day 1 project brief).
            </p>

            {/* Metrics Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-300 shadow-sm">
              <table className="min-w-full border-collapse text-sm bg-white">
                <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-200">KPI</th>
                    <th className="px-5 py-3 border-b border-slate-200">Baseline (Before)</th>
                    <th className="px-5 py-3 border-b border-slate-200">Current (After)</th>
                    <th className="px-5 py-3 border-b border-slate-200">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {page8Data.metrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">{metric.kpi}</td>
                      <td className="px-5 py-4 text-slate-700">{metric.baseline}</td>
                      <td className="px-5 py-4 text-green-700 font-bold">{metric.current}</td>
                      <td className="px-5 py-4 text-slate-700">{metric.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 text-base text-green-900">
              <strong>Outcome:</strong> All three targets met. Problem solved. Value proven.
            </div>

            <CoachingHint title="Why Metrics Matter for BAs">
              <p>BAs return to the ORIGINAL problem statement and KPIs (Day 1 project brief) to prove value.</p>
              <p className="mt-2">Without this:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• You can&apos;t prove the project succeeded</li>
                <li>• Stakeholders won&apos;t fund future work</li>
                <li>• You can&apos;t defend scope decisions in hindsight</li>
              </ul>
              <p className="mt-2">In interviews: &quot;I tracked KPIs from project kickoff. We reduced fraud by 30%, protected conversion, and cut manual review workload by 42%.&quot;</p>
            </CoachingHint>
          </div>
        </div>
      </Section>

      {/* Handover Checklist */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                4
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Handover Checklist: Transfer to BAU</h2>
            </div>
            <Users size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              The BA prepares handover artifacts so the BAU (Business as Usual) team can run/support the system independently.
            </p>

            {/* Checklist */}
            <div className="border-2 border-slate-300 rounded-lg p-5 bg-white space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Problem Statement & Business Case</div>
                  <p className="text-sm text-slate-700 mt-1">Document explaining WHY this exists (prevents future teams from undoing it)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">User Stories & Acceptance Criteria</div>
                  <p className="text-sm text-slate-700 mt-1">Final versions of all delivered stories (US-142, US-145, etc.)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Decision Log</div>
                  <p className="text-sm text-slate-700 mt-1">Key decisions made (why {page8Data.handover.thresholds}, why {page8Data.handover.sla} SLA, etc.)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Operational Runbook</div>
                  <p className="text-sm text-slate-700 mt-1">How {selectedProject === 'cif' ? 'Ops handles manual review queue' : 'Repairs handles work order queue'}, what to do if SLA breaches, escalation paths</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">KPI Baselines & Monitoring</div>
                  <p className="text-sm text-slate-700 mt-1">Before/after metrics, dashboard links, alert thresholds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Known Issues & Workarounds</div>
                  <p className="text-sm text-slate-700 mt-1">Any bugs accepted as low-priority, temporary fixes, future improvements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Stakeholder Contacts</div>
                  <p className="text-sm text-slate-700 mt-1">Who owns what ({selectedProject === 'cif' ? 'Marie for Compliance questions, James for Ops support' : 'Tom for Repairs questions, Sarah for Housing support'})</p>
                </div>
              </div>
            </div>

            <CoachingHint title="What Good Handover Looks Like">
              <p>Handover is NOT dumping documents. It&apos;s transfer of understanding.</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Schedule handover session (1-2 hours with BAU team)</li>
                <li>• Walk through artifacts (don&apos;t email and disappear)</li>
                <li>• Answer questions in real-time</li>
                <li>• Be available for 2 weeks post-handover for follow-up</li>
              </ul>
              <p className="mt-2">In interviews: &quot;I created a handover pack with runbook, decision log, and KPI baselines. I ran a 90-minute session with BAU team and was available for 2 weeks after for questions.&quot;</p>
            </CoachingHint>

            {/* Task 3 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Write Handover Notes
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Write the &quot;Key Decisions&quot; section for your handover document. Explain: {page8Data.handover.decisionLogQuestion}
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={5}
                placeholder="Write your handover notes here..."
                value={notes.handover_notes}
                onChange={(e) => saveNote('handover_notes', e.target.value)}
              />
              <p className="text-xs text-slate-600 mt-2">
                Hint: {page8Data.handover.hint}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Slack Update */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Slack / Teams Update (Copy & Adapt)</h2>
          <p className="text-base text-slate-800 mb-3 leading-relaxed">
            After UAT completion and successful handover, post a closure update.
          </p>
          <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
            <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
              {page8Data.slackUpdate.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
            <strong>Why this works:</strong> Clear closure. Metrics proven. Continuity ensured. This is how senior BAs close projects.
          </div>
        </div>
      </Section>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default UATValidation;
