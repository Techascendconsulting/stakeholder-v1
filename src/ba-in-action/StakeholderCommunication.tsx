import React, { useRef, useState } from 'react';
import type { AppView } from '../types';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';
import { PAGE_1_DATA } from './page1-data';
import { PAGE_4_DATA } from './page4-data';
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
  MessageCircle,
  Target,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { getGlossaryTerms } from './glossary-data';

const VIEW_ID: AppView = 'ba_in_action_stakeholder_communication';

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
          <div className="text-base font-bold text-white">A BA's Approach to Stakeholder Communication</div>
        </div>
        <div className="text-sm text-white/95 leading-relaxed space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">1.</span>
              <div>
                <div className="font-semibold">Choose the right channel</div>
                <div className="text-white/80 text-xs mt-0.5">Email for formal, Teams for quick, video for complex</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">2.</span>
              <div>
                <div className="font-semibold">Draft your first message</div>
                <div className="text-white/80 text-xs mt-0.5">Context, specific ask, suggested next step</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">3.</span>
              <div>
                <div className="font-semibold">Run the meeting with structure</div>
                <div className="text-white/80 text-xs mt-0.5">Set frame, reflect, surface differences, clarify, define next steps</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">4.</span>
              <div>
                <div className="font-semibold">Take analytical notes</div>
                <div className="text-white/80 text-xs mt-0.5">Capture meaning and decisions, not just words</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-100 font-bold mt-0.5">5.</span>
              <div>
                <div className="font-semibold">Follow up immediately</div>
                <div className="text-white/80 text-xs mt-0.5">Post summary in channel with decisions, owners, and next steps</div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30 mt-3">
            <div className="text-xs font-semibold text-white mb-1">BA Mindset</div>
            <div className="text-white/90 text-xs leading-relaxed">
              You're not just talking. You're <strong>building trust, creating decision trails, and managing expectations</strong> so stakeholders feel heard and projects stay on track.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StakeholderCommunication: React.FC = () => {
  const { selectedProject } = useBAInActionProject();
  const projectData = PAGE_1_DATA[selectedProject];
  const page4Data = PAGE_4_DATA[selectedProject];
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;
  const [firstMessage, setFirstMessage] = useState('');
  const [showExample, setShowExample] = useState(false);
  const exampleRef = useRef<HTMLDivElement | null>(null);

  // Map communication tool icons
  const communicationChannelsWithIcons = page4Data.communicationChannels.map((channel) => {
    let icon: React.ReactNode;
    if (channel.tool.includes('Teams') || channel.tool.includes('Slack') || channel.tool.includes('Channel')) {
      icon = <MessageCircleMore size={18} />;
    } else if (channel.tool === 'Email') {
      icon = <Mail size={18} />;
    } else if (channel.tool.includes('Video') || channel.tool.includes('Calls')) {
      icon = <Video size={18} />;
    } else if (channel.tool.includes('Walkthroughs') || channel.tool.includes('Phone') || channel.tool.includes('In-Person')) {
      icon = <Phone size={18} />;
    } else {
      icon = <MessageCircle size={18} />;
    }
    return { ...channel, icon };
  });

  const handleOpenExample = () => {
    setShowExample(true);
    requestAnimationFrame(() => {
      exampleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-4">
        <PageTitle title="Stakeholder Communication" />
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject === 'cif' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
          {projectData.initiativeName}
        </span>
      </div>

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
          <strong>Real BA work:</strong> You don&apos;t just &quot;communicate well.&quot; You choose channels strategically, lead conversations with intent, and document decisions clearly.
        </div>
      </Section>

      {/* Glossary */}
      <GlossarySidebar project={selectedProject} pageKey="stakeholder-communication" />

      {/* BA Journey Sidebar */}
      <BAJourneySidebar />

      {/* Communication Channels */}
      <Section title="2) Tools of Communication (When to Use Teams, Slack, Email, or Face-to-Face)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          BAs don&apos;t just &quot;send a message.&quot; They choose the right channel for the right purpose. Here&apos;s how:
        </p>
        <div className="space-y-4">
          {communicationChannelsWithIcons.map((channel) => (
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
      <Section title="3) Conversation Scripts for Each Stakeholder Type">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Copy these scripts. Adapt them. Use them in your BA WorkXP™ scenarios and reference them in interviews.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {page4Data.conversationScripts.map((entry) => (
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
      <Section title="4) The 5-Step BA Meeting Framework">
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
              {page4Data.meetingFramework.map((row) => (
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
      <Section title="5) How You Take Notes (Analysis vs. Transcription)">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Weak BAs transcribe. Strong BAs analyse. Your notes should capture meaning, not words.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {page4Data.notesComparison.map((comparison) => (
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

      {/* Task 1: Draft First Message */}
      <Section title="6) Your Task: Draft Your First Stakeholder Message">
        <p className="text-sm text-slate-800 mb-4 leading-relaxed">
          Choose one stakeholder. Draft your first message to them in Teams/Slack. Include:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-4">
          <li>Context (why you&apos;re reaching out)</li>
          <li>What you need from them (specific, actionable)</li>
          <li>Suggested next step (meeting, async response, etc.)</li>
        </ul>
        <textarea
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          rows={6}
          placeholder={page4Data.firstMessagePlaceholder}
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
      <Section title="7) Post-Meeting Follow-Up (Copy & Adapt for Slack/Teams)">
        <p className="text-sm text-slate-800 mb-3 leading-relaxed">
          After every meeting, post a summary in the project channel. This builds trust and creates a decision trail.
        </p>
        <div className="rounded-2xl border border-slate-300 bg-slate-900 p-5 text-sm text-white shadow-lg font-mono leading-relaxed">
          {page4Data.followUpMessage.map((line, index) => (
            <p key={index} className={line.startsWith('  ') ? 'ml-4' : line.startsWith('•') ? '' : 'mb-2'}>
              {line}
            </p>
          ))}
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
            <h4 className="text-base font-semibold text-slate-900 mb-3">Example: {projectData.initiativeName} Stakeholder Mapping</h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-sm text-slate-800">
              {page4Data.exampleStakeholderMap.map((stakeholder, index) => (
                <div key={index} className={index < page4Data.exampleStakeholderMap.length - 1 ? 'pb-3 border-b border-slate-200' : ''}>
                  <p className="font-semibold text-slate-900">{stakeholder.name} ({stakeholder.role})</p>
                  <p className="text-xs text-slate-600 mt-1">Quadrant: {stakeholder.quadrant}</p>
                  <p className="mt-2 leading-relaxed">Engagement: {stakeholder.engagement}</p>
                  <p className="mt-1 leading-relaxed"><strong>{stakeholder.risk.includes('Ground truth') ? 'Value' : 'Risk'}:</strong> {stakeholder.risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example Message Templates */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-3">Example: First Message Templates</h4>
            <div className="space-y-4">
              {page4Data.exampleMessages.map((message, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">To: {message.to}</p>
                  <div className="font-mono text-sm text-slate-800 leading-relaxed space-y-2">
                    {message.content.map((line, lineIndex) => (
                      <p key={lineIndex} className={line.includes('[Your name]') ? 'text-slate-600' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                    <strong>Why this works:</strong> {message.why}
                  </div>
                </div>
              ))}
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

