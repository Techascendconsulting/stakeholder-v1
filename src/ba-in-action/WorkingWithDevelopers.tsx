import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_7_DATA } from './page7-data';
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
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page7Data = PAGE_7_DATA[selectedProject];
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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Using Jira as a Tool</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
            {projectData.initiativeName}
          </span>
        </div>
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

      {/* Breaking Down High-Level Requirements */}
      <Section>
        <div className="bg-white border-2 border-blue-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">1) Breaking Down High-Level Requirements from Page 6</h2>
          <div className="space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              On Page 6, you wrote <strong>high-level requirements</strong>. Now, in tools (Jira or Excel), you break them down into detailed requirements with stakeholder sign-off.
            </p>
            
            <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
              <div className="text-base font-bold text-indigo-900 mb-3">The Process:</div>
              <div className="space-y-3 text-sm text-indigo-800">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-indigo-700 mt-0.5">1.</span>
                  <div>
                    <strong>Take high-level requirements from Page 6</strong><br/>
                    Example: "The system must evaluate identity risk at account creation and output one of three decision states."
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-indigo-700 mt-0.5">2.</span>
                  <div>
                    <strong>Break down in tools (Jira or Excel)</strong><br/>
                    Create epics, user stories, detailed acceptance criteria
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-indigo-700 mt-0.5">3.</span>
                  <div>
                    <strong>Get stakeholder sign-off</strong><br/>
                    Share the breakdown, get approval before development starts
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-indigo-700 mt-0.5">4.</span>
                  <div>
                    <strong>Refine during implementation</strong><br/>
                    As questions arise, update requirements, get sign-off again
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Excel Document Example */}
      <Section>
        <div className="bg-white border-2 border-emerald-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">2) Requirements Breakdown in Excel (Alternative to Jira)</h2>
          <div className="space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              Some teams use Excel to break down requirements before moving to Jira. This is especially useful for getting stakeholder sign-off in a format they're familiar with.
            </p>
            
            {/* Excel Mockup */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-lg">
              <div className="bg-emerald-600 px-4 py-2 flex items-center gap-3">
                <div className="text-white font-semibold text-sm">Requirements Breakdown - Excel</div>
                <div className="text-white/80 text-xs ml-auto">Project: {projectData.initiativeName}</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm bg-white">
                  <thead className="bg-slate-100 text-left font-semibold text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3 border border-slate-300">Epic</th>
                      <th className="px-4 py-3 border border-slate-300">User Story ID</th>
                      <th className="px-4 py-3 border border-slate-300">User Story</th>
                      <th className="px-4 py-3 border border-slate-300">Acceptance Criteria</th>
                      <th className="px-4 py-3 border border-slate-300">Stakeholder Sign-Off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-blue-50">
                      <td className="px-4 py-3 border border-slate-300 font-semibold text-blue-900" rowSpan={2}>
                        Risk-Based Identity Verification
                      </td>
                      <td className="px-4 py-3 border border-slate-300 font-mono text-xs">US-142</td>
                      <td className="px-4 py-3 border border-slate-300">
                        As a Risk Engine, I want to auto-approve low-risk accounts, so that legitimate users sign up smoothly.
                      </td>
                      <td className="px-4 py-3 border border-slate-300 text-xs">
                        • Risk score ≥85<br/>
                        • Account approved automatically<br/>
                        • No manual review
                      </td>
                      <td className="px-4 py-3 border border-slate-300 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">✓ Approved</span>
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="px-4 py-3 border border-slate-300 font-mono text-xs">US-143</td>
                      <td className="px-4 py-3 border border-slate-300">
                        As a Risk Engine, I want to route medium-risk accounts to manual review, so that we catch fraud without blocking legitimate users.
                      </td>
                      <td className="px-4 py-3 border border-slate-300 text-xs">
                        • Risk score 31-84<br/>
                        • Case routes to Ops queue<br/>
                        • User sees "verification in progress"
                      </td>
                      <td className="px-4 py-3 border border-slate-300 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">✓ Approved</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-300 text-xs text-slate-600">
                <strong>Note:</strong> This Excel document is shared with stakeholders for sign-off before requirements are moved to Jira for development.
              </div>
            </div>

            <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
              <strong>Why Excel?</strong> Some stakeholders prefer Excel because they can review, comment, and sign off in a familiar format. After sign-off, you move the requirements to Jira for development tracking.
            </div>
          </div>
        </div>
      </Section>

      {/* Jira Epics and User Stories */}
      <Section>
        <div className="bg-white border-2 border-purple-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">3) Requirements in Jira: Epics and User Stories</h2>
          <div className="space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              In Jira, requirements are organized as <strong>Epics</strong> (large features) containing multiple <strong>User Stories</strong> (specific functionality). This is where you break down your high-level requirements from Page 6.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4">
                <div className="text-sm font-bold text-indigo-900 mb-2">Epic (Large Feature)</div>
                <p className="text-sm text-indigo-800 leading-relaxed mb-2">
                  Example: <strong>"Risk-Based Identity Verification"</strong>
                </p>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  This is the high-level requirement from Page 6, broken down into multiple user stories.
                </p>
              </div>
              
              <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4">
                <div className="text-sm font-bold text-purple-900 mb-2">User Stories (Specific Functionality)</div>
                <p className="text-sm text-purple-800 leading-relaxed mb-2">
                  Examples:
                </p>
                <ul className="text-sm text-purple-800 space-y-1 list-disc ml-5">
                  <li>US-142: Auto-approve low-risk accounts</li>
                  <li>US-143: Route medium-risk to review</li>
                  <li>US-144: Auto-block high-risk accounts</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
              <strong>Stakeholder Sign-Off:</strong> Before development starts, you share the epic and user stories with stakeholders (via Jira or Excel), get their approval, then the team starts building.
            </div>
          </div>
        </div>
      </Section>

      {/* Why This Matters */}
      <Section>
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Why This Matters (Especially in Interviews)</h2>
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
              Context for This Project
            </div>
            <p className="mb-2"><strong>Sprint:</strong> {page7Data.sprintContext.sprint}</p>
            <p className="mb-2"><strong>Team:</strong> {page7Data.sprintContext.team}</p>
            <p><strong>Tools:</strong> {page7Data.sprintContext.tools}</p>
          </div>
        </div>
      </Section>

      {/* The Iterative Loop */}
      <Section>
        <div className="bg-white border-2 border-indigo-300 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">The Iterative Loop: Going Back to Stakeholders</h2>
          <div className="space-y-4">
            <p className="text-base text-slate-800 leading-relaxed">
              <strong>Important:</strong> Requirements are not set in stone. During implementation, developers will have questions. Edge cases will appear. Things you didn't think of will come up. <strong>This is normal.</strong>
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
                    <strong>You don't know the answer</strong> - this is an edge case you didn't think of
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
              <strong>This is not failure.</strong> This is being thorough. Good BAs expect questions and are ready to go back to stakeholders. You're not expected to think of everything upfront.
            </div>
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
              <h2 className="text-lg font-semibold text-slate-900">The Jira Ticket: {page7Data.jiraTicket.id}</h2>
            </div>
            <FileText size={18} className="text-indigo-600" />
          </div>
          
          <div className="p-6 space-y-4">
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The ticket code (e.g., {page7Data.jiraTicket.id}) is just a generic example. Jira will automatically generate the actual ticket code based on your project name when you create the ticket.
              </p>
            </div>
            <p className="text-base text-slate-800 leading-relaxed">
              This is the main story for {selectedProject === 'cif' ? 'Sprint 12' : 'Sprint 8'}. The BA (you) wrote this after requirements were finalized.
            </p>

            {/* Jira UI Mockup */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-lg">
              {/* Jira Header */}
              <div className="bg-indigo-600 px-4 py-2 flex items-center gap-3">
                <div className="text-white font-mono text-xs font-bold">JIRA</div>
                <div className="text-white/80 text-sm">{projectData.initiativeName}</div>
              </div>

              {/* Ticket Header */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">STORY</span>
                      <span className="font-mono font-bold text-lg text-slate-900">{page7Data.jiraTicket.id}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{page7Data.jiraTicket.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">Ready for Dev</div>
                    <div className="text-xs text-slate-500 mt-1">Story Points: {page7Data.jiraTicket.storyPoints}</div>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="px-5 py-4 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Description</div>
                  <div className="text-base text-slate-800 leading-relaxed space-y-2">
                    <p><strong>As a</strong> {page7Data.jiraTicket.description.as}</p>
                    <p><strong>I want to</strong> {page7Data.jiraTicket.description.want}</p>
                    <p><strong>So that</strong> {page7Data.jiraTicket.description.so}</p>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Business Context</div>
                  <p className="text-base text-slate-800">
                    {page7Data.jiraTicket.businessContext}
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Acceptance Criteria</div>
                  <div className="space-y-3">
                    {page7Data.jiraTicket.acceptanceCriteria.map((ac, index) => (
                      <div key={index} className={`pl-4 border-l-4 ${ac.borderColor} py-2 ${ac.color}`}>
                        <p className="text-sm font-semibold text-slate-900 mb-2">{ac.id}: {ac.title}</p>
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
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Attachments</div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <FileText size={14} />
                    <span className="underline cursor-pointer">{page7Data.jiraTicket.attachment}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Comments ({page7Data.jiraTicket.comments.length})</div>
                  <div className="space-y-3">
                    {page7Data.jiraTicket.comments.map((comment, index) => {
                      const participant = page7Data.sprintPlanning.participants.find(p => 
                        comment.author.includes(p.name.split('(')[0].trim()) || 
                        (comment.author.includes('You') && p.role === 'BA')
                      );
                      const color = participant?.color || (comment.author.includes('You') ? 'bg-purple-600' : 'bg-blue-600');
                      const initials = comment.authorInitials || participant?.initials || 'UN';
                      return (
                        <div key={index} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}>{initials}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900">{comment.author}</span>
                              <span className="text-xs text-slate-500">{comment.time}</span>
                            </div>
                            <p className="text-sm text-slate-800 mt-1">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}
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
                Dev asked: &quot;{page7Data.tasks.jiraComment.question}&quot;
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
                Hint: {page7Data.tasks.jiraComment.hint}
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
              <strong>Scene:</strong> {page7Data.sprintPlanning.scene}
            </p>

            {/* Meeting Transcript */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2">
                <div className="text-white font-semibold text-sm flex items-center gap-2">
                  <Users size={16} />
                  Sprint Planning - {selectedProject === 'cif' ? 'Sprint 12' : 'Sprint 8'}
                </div>
                <div className="text-white/80 text-xs mt-1">Attendees: {page7Data.sprintPlanning.participants.map(p => p.name).join(', ')}</div>
              </div>

              <div className="p-4 bg-white space-y-3">
                {page7Data.sprintPlanning.messages.map((message, index) => {
                  const participant = page7Data.sprintPlanning.participants.find(p => p.initials === message.participant);
                  if (!participant) return null;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${participant.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>{participant.initials}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">{participant.name}</div>
                        <p className="text-base text-slate-800 mt-1 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
              <strong>Scene:</strong> {page7Data.standup.scene}
            </p>

            {/* Standup Transcript */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-700 px-4 py-2">
                <div className="text-white font-semibold text-sm">Daily Standup - 15 min</div>
              </div>

              <div className="p-4 bg-white space-y-3">
                {page7Data.standup.messages.map((message, index) => {
                  const participant = page7Data.sprintPlanning.participants.find(p => p.initials === message.participant);
                  if (!participant) return null;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${participant.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>{participant.initials}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">{participant.name}</div>
                        <p className="text-base text-slate-800 mt-1 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
              <div className="text-sm font-semibold text-slate-900 mb-2">After Standup: BA Updates Jira</div>
              <p className="text-sm text-slate-700 mb-3">You immediately add this comment to {page7Data.jiraTicket.id}:</p>
              <div className="bg-white border border-slate-300 rounded p-3 font-mono text-sm text-slate-800">
                <p><strong>{page7Data.standup.jiraUpdate.title}</strong></p>
                {page7Data.standup.jiraUpdate.fields.map((field, index) => (
                  <p key={index} className="mt-2">• <code>{field.name}</code> ({field.type})</p>
                ))}
                <p className="mt-2 text-xs text-slate-600">{page7Data.standup.jiraUpdate.note}</p>
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
                <strong>Scenario:</strong> {page7Data.tasks.standupResponse.scenario}
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
                Hint: {page7Data.tasks.standupResponse.hint}
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
              {page7Data.slackUpdate.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
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
