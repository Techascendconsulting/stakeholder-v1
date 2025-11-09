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
  Sparkles,
  ArrowRight,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Eye,
  FileText,
} from 'lucide-react';

const VIEW_ID: AppView = 'ba_in_action_agile_delivery';

const HERO_IMAGE = '/images/collaborate1.jpg';

function useNotes() {
  const [notes, setNotes] = useState<{[k: string]: string}>({
    jira_comment: "",
    standup_response: "",
    sprint_review_notes: "",
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

const WorkingWithDevelopers: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  
  const { notes, saveNote } = useNotes();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <PageShell>
      <div className="space-y-2 mb-6">
        <p className="uppercase tracking-wider text-xs font-semibold text-purple-500">BA In Action</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agile Delivery: Working in Sprints</h1>
      </div>

      <div className="mt-2 mb-6 flex items-center gap-3 text-sm text-slate-700">
        <Clock size={16} className="text-indigo-600" />
        <span className="font-medium">Sprint 12 is underway. You&apos;re navigating ceremonies, clarifying stories, and keeping the team aligned.</span>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative h-80 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
        <img
          src={HERO_IMAGE}
          alt="Agile team collaborating"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 mb-3">
            <CheckCircle2 size={14} />
            Real BA Work
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            How BAs Navigate Scrum: From Planning to Review
          </h2>
          <p className="mt-3 text-base text-white/90 max-w-3xl">
            You&apos;re not just writing stories. You&apos;re clarifying in planning, unblocking in standups, refining mid-sprint, and validating in reviews. This is how it actually works.
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Why Agile Matters (Especially in Interviews)</h2>
          <div className="space-y-3 text-base text-slate-800">
            <p className="leading-relaxed">
              Interviewers ask: <strong className="text-slate-900">&quot;How do you work in an Agile environment?&quot;</strong> or <strong className="text-slate-900">&quot;Walk me through your role in sprint ceremonies.&quot;</strong>
            </p>
            <p className="leading-relaxed">
              Most companies use Scrum (2-week sprints). The BA ensures engineering builds the RIGHT thing, stakeholders stay informed, and nothing gets lost in translation.
            </p>
          </div>
          <div className="mt-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-sm text-white shadow-md">
            <div className="flex items-center gap-2 font-bold mb-2">
              <Target size={16} />
              Agile Context for This Project
            </div>
            <p className="mb-2"><strong>Sprint:</strong> 2-week sprints. Currently in Sprint 12.</p>
            <p className="mb-2"><strong>Team:</strong> BA (you), 3 devs, 1 QA, 1 Scrum Master, PO (Ben Carter)</p>
            <p><strong>Tools:</strong> Jira for backlog, Slack for daily comms, Confluence for docs</p>
          </div>
        </div>
      </Section>

      {/* Jira Ticket - US-142 */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-slate-900">The Jira Ticket: US-142</h2>
            </div>
            <FileText size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              This is the main story for Sprint 12. The BA (you) wrote this after requirements were finalized.
            </p>

            {/* Jira UI Mockup */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-lg">
              {/* Jira Header */}
              <div className="bg-indigo-600 px-4 py-2 flex items-center gap-3">
                <div className="text-white font-mono text-xs font-bold">JIRA</div>
                <div className="text-white/80 text-sm">CI&F Programme</div>
              </div>

              {/* Ticket Header */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">STORY</span>
                      <span className="font-mono font-bold text-lg text-slate-900">US-142</span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Risk-Based Identity Verification</h3>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">Ready for Dev</div>
                    <div className="text-xs text-slate-500 mt-1">Story Points: 8</div>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="px-5 py-4 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Description</div>
                  <div className="text-base text-slate-800 leading-relaxed space-y-2">
                    <p><strong>As a</strong> Risk Engine</p>
                    <p><strong>I want to</strong> classify identity verification outcomes into approve / block / review</p>
                    <p><strong>So that</strong> we reduce fraud while minimizing manual workload and customer friction</p>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Business Context</div>
                  <p className="text-base text-slate-800">
                    Fraudulent account creation increased 17% QoQ. Current KYC creates 9% checkout drop-off. 
                    We need adaptive verification that protects conversion while reducing fraud.
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Acceptance Criteria</div>
                  <div className="space-y-3">
                    <div className="pl-4 border-l-4 border-green-500 py-2 bg-green-50/50">
                      <p className="text-sm font-semibold text-slate-900">AC01: Auto-Approve High Confidence</p>
                      <p className="text-sm text-slate-700 mt-1"><strong>Given</strong> risk score ≥ 85</p>
                      <p className="text-sm text-slate-700"><strong>When</strong> verification completes</p>
                      <p className="text-sm text-slate-700"><strong>Then</strong> account approved automatically, decision logged with timestamp</p>
                    </div>
                    <div className="pl-4 border-l-4 border-red-500 py-2 bg-red-50/50">
                      <p className="text-sm font-semibold text-slate-900">AC02: Auto-Block High Risk</p>
                      <p className="text-sm text-slate-700 mt-1"><strong>Given</strong> risk score ≤ 30</p>
                      <p className="text-sm text-slate-700"><strong>When</strong> verification completes</p>
                      <p className="text-sm text-slate-700"><strong>Then</strong> account creation fails, generic error shown, flagged for audit</p>
                    </div>
                    <div className="pl-4 border-l-4 border-amber-500 py-2 bg-amber-50/50">
                      <p className="text-sm font-semibold text-slate-900">AC03: Manual Review Queue</p>
                      <p className="text-sm text-slate-700 mt-1"><strong>Given</strong> risk score 31–84</p>
                      <p className="text-sm text-slate-700"><strong>When</strong> verification completes</p>
                      <p className="text-sm text-slate-700"><strong>Then</strong> routes to Ops queue with evidence summary, user sees &quot;verification in progress&quot;, 24h SLA starts</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Attachments</div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <FileText size={14} />
                    <span className="underline cursor-pointer">Risk_Scoring_Logic_v2.pdf</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Comments (3)</div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">YOU</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">You (BA)</span>
                          <span className="text-xs text-slate-500">2 days ago</span>
                        </div>
                        <p className="text-sm text-slate-800 mt-1">Confirmed with Marie (Compliance): Thresholds align with FCA requirements. Audit trail must include timestamp, decision, score, and input signals.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">DM</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">Dev (Maria)</span>
                          <span className="text-xs text-slate-500">1 day ago</span>
                        </div>
                        <p className="text-sm text-slate-800 mt-1">Question: What data fields go into the evidence summary for manual review cases?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <LookFor items={[
              "Story follows user story format: As a / I want / So that",
              "Business context explains WHY this matters",
              "AC is testable with Given/When/Then format",
              "Thresholds are specific (≥85, ≤30, 31-84)",
              "BA has already added comments clarifying compliance requirements"
            ]} />

            <CoachingHint title="Why This Story Structure Works">
              <p>This story is &quot;sprint-ready&quot; because:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Clear acceptance criteria with no ambiguity</li>
                <li>• Business context helps dev understand priorities</li>
                <li>• Compliance requirements documented in comments</li>
                <li>• Estimated at 8 points (team discussed complexity)</li>
              </ul>
            </CoachingHint>

            {/* Task 1 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Answer Dev&apos;s Question
              </div>
              <p className="text-sm text-amber-900 mb-3">
                Dev (Maria) asked: &quot;What data fields go into the evidence summary for manual review cases?&quot;
                <br />Write your Jira comment response (refer back to your requirements from Day 5).
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Write your Jira comment here..."
                value={notes.jira_comment}
                onChange={(e) => saveNote('jira_comment', e.target.value)}
              />
              <p className="text-xs text-slate-600 mt-2">
                Hint: Day 5 mentioned IP address, email domain, device signals, and previous fraud flags.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Sprint Planning Scene */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Sprint Planning: BA Presents US-142</h2>
            </div>
            <Calendar size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              <strong>Scene:</strong> Monday morning, 10am. Sprint 12 planning. BA presents US-142 to the team.
            </p>

            {/* Meeting Transcript */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2">
                <div className="text-white font-semibold text-sm flex items-center gap-2">
                  <Users size={16} />
                  Sprint Planning - Sprint 12
                </div>
                <div className="text-white/80 text-xs mt-1">Attendees: BA (you), Ben (PO), 3 Devs, QA, Scrum Master</div>
              </div>

              <div className="p-4 bg-white space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">YOU</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">You (BA)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Okay, let&apos;s walk through US-142: Risk-Based Verification. The business problem: fraud is up 17%, but our current KYC causes 9% drop-off. We need smarter verification.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">YOU</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">You (BA)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Three decision states: auto-approve if score is 85 or higher, auto-block if 30 or lower, manual review for everything in between. The thresholds came from Compliance—they align with regulatory requirements.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">DM</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Dev (Maria)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Do we have the risk scoring API endpoint ready?&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">YOU</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">You (BA)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Yes, Data team confirmed it&apos;s live in staging. I&apos;ll add the endpoint docs to the Jira ticket after this call.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">QA</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">QA (Sarah)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;For AC03, how do we test the 24-hour SLA timer without waiting 24 hours?&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">YOU</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">You (BA)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Good question. We can use a test account with time-mocking, or we manually trigger the SLA flag in the database. I&apos;ll coordinate with you offline to set up test data.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">DT</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Dev (Tom)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;I&apos;m estimating this at 8 story points. Complexity is medium—mainly integration work.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">BC</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Ben (PO)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Great. This is our top priority for the sprint. Let&apos;s commit to US-142.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <LookFor items={[
              "BA explains the business problem BEFORE the technical solution",
              "BA references stakeholders (Compliance) to add credibility",
              "BA unblocks dev by confirming API is ready",
              "BA coordinates testing approach with QA",
              "BA documents follow-up actions (add endpoint docs to Jira)"
            ]} />

            <CoachingHint title="What a BA Does in Sprint Planning">
              <p>Notice the BA:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Sets context FIRST (business problem, stakeholder input)</li>
                <li>• Answers questions confidently (checked API status beforehand)</li>
                <li>• Coordinates between team members (QA testing approach)</li>
                <li>• Commits to follow-up actions (add docs to Jira)</li>
              </ul>
              <p className="mt-2">In interviews: &quot;During sprint planning, I present stories with business context and answer technical questions by referencing my requirements and stakeholder conversations.&quot;</p>
            </CoachingHint>
          </div>
        </div>
      </Section>

      {/* Daily Standup Scene */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-bold">
                3
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Daily Standup: BA Unblocks Dev</h2>
            </div>
            <MessageSquare size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              <strong>Scene:</strong> Wednesday, 10am. Day 3 of Sprint 12. Dev is blocked on US-142.
            </p>

            {/* Standup Transcript */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-700 px-4 py-2">
                <div className="text-white font-semibold text-sm">Daily Standup - 15 min</div>
              </div>

              <div className="p-4 bg-white space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">DM</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Dev (Maria)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Yesterday I started on US-142. Today I&apos;m building the decision logic. Blocked: I need the exact threshold values for the evidence summary fields.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">YOU</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">You (BA)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Got it. The evidence summary needs: IP address, email domain, device fingerprint, and previous fraud flags. I&apos;ll update the Jira ticket with the exact field names by noon.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">DM</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Dev (Maria)</div>
                    <p className="text-base text-slate-800 mt-1 leading-relaxed">
                      &quot;Perfect. I&apos;ll check Jira at noon and continue building.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
              <div className="text-sm font-semibold text-slate-900 mb-2">After Standup: BA Updates Jira</div>
              <p className="text-sm text-slate-700 mb-3">You immediately add this comment to US-142:</p>
              <div className="bg-white border border-slate-300 rounded p-3 font-mono text-sm text-slate-800">
                <p><strong>Evidence Summary Fields (for AC03):</strong></p>
                <p className="mt-2">• <code>ip_address</code> (string)</p>
                <p>• <code>email_domain</code> (string)</p>
                <p>• <code>device_fingerprint</code> (string)</p>
                <p>• <code>previous_fraud_flags</code> (array)</p>
                <p className="mt-2 text-xs text-slate-600">Confirmed with Data team. All fields available in staging DB.</p>
              </div>
            </div>

            <LookFor items={[
              "Dev states blocker clearly in standup (doesn't wait for 1-on-1)",
              "BA provides immediate, specific answer (not 'I'll look into it')",
              "BA commits to timeline (by noon)",
              "BA follows through immediately after standup",
              "BA adds technical detail (field names, data types)"
            ]} />

            <CoachingHint title="How BAs Unblock in Standups">
              <p>Standups are NOT status reports. They&apos;re for surfacing blockers.</p>
              <p className="mt-2">BA role:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Listen for hidden blockers (&quot;waiting on...&quot;, &quot;not sure about...&quot;)</li>
                <li>• Unblock immediately if you have the answer</li>
                <li>• If you don&apos;t, commit to a timeline (&quot;I&apos;ll check with Ops by 2pm&quot;)</li>
                <li>• Document answers in Jira so they&apos;re visible to everyone</li>
              </ul>
            </CoachingHint>

            {/* Task 2 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Target size={16} />
                Your Task: Respond to a Standup Blocker
              </div>
              <p className="text-sm text-amber-900 mb-3">
                <strong>Scenario:</strong> In tomorrow&apos;s standup, QA (Sarah) says: &quot;I&apos;m blocked on testing AC02. I don&apos;t know what &apos;generic error message&apos; should say to the user.&quot;
                <br /><br />What would you say in the standup?
              </p>
              <textarea
                className="w-full text-base text-slate-800 leading-relaxed focus:outline-none resize-none bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Write your standup response..."
                value={notes.standup_response}
                onChange={(e) => saveNote('standup_response', e.target.value)}
              />
              <p className="text-xs text-slate-600 mt-2">
                Hint: Error message must NOT reveal fraud detection logic (security requirement).
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
            After sprint planning and key standup interactions, post an update. This shows you&apos;re on top of things.
          </p>
          <div className="rounded-lg border-2 border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
            <div className="font-mono text-sm leading-relaxed space-y-1 p-3 rounded bg-slate-50 border border-slate-200">
              <p>Sprint 12 planning complete. Committed to US-142 (Risk-Based Verification) as top priority.</p>
              <p>Dev started implementation. Unblocked data field questions—updated Jira with evidence summary spec.</p>
              <p>Coordinating with QA on test approach for SLA timer.</p>
              <p>US-142 on track for Sprint 12 completion.</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-cyan-600 p-3 text-sm text-white shadow-md">
            <strong>Why this works:</strong> Clear, factual, shows ownership. Team knows you&apos;re actively managing the story.
          </div>
        </div>
      </Section>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default WorkingWithDevelopers;
