'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

// Symbol Card Component
const SymbolCard = ({ 
  title, 
  icon, 
  meaning, 
  whenToUse, 
  tips 
}: {
  title: string;
  icon: React.ReactNode;
  meaning: string;
  whenToUse: string;
  tips: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-2 text-sm text-gray-700">
      <p><strong>What it means:</strong> {meaning}</p>
      <p><strong>When to use it:</strong> {whenToUse}</p>
      <p><strong>Tips:</strong> {tips}</p>
    </div>
  </div>
);

export default function ProcessMappingIntro() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Process Mapping: Getting Started
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to create professional process maps that help you analyze workflows, 
            identify improvements, and communicate clearly with stakeholders.
          </p>
        </div>

        {/* What is Process Mapping */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What a Process Map Is (in plain English)
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-lg text-gray-700 mb-4">
              A process map is a visual story of how work gets done—the steps, who does them, 
              and how information flows. In projects, it helps you explain the current situation 
              (as-is) and design a better future (to-be).
            </p>
            <p className="font-semibold text-gray-900 mb-3">You'll use it to:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Capture how things actually happen today (not how they "should" happen).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Spot inefficiencies, delays, handoffs, and duplicate work.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Explain improvements clearly to stakeholders, developers, and testers.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Support interviews with concrete, visual examples of your work.
              </li>
            </ul>
          </div>
        </section>

        {/* Why Essential for BA */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why It's Essential for a BA
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <strong>It reduces confusion:</strong> everyone can see the same picture.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <strong>It surfaces gaps:</strong> missing steps, unclear ownership, or risky handoffs.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <strong>It drives better requirements:</strong> once the workflow is clear, writing user stories and acceptance criteria becomes easier and more precise.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <strong>It boosts interview performance:</strong> you can confidently walk through a real process you've mapped.
              </li>
            </ul>
          </div>
        </section>

        {/* Core Symbols */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Core Symbols (the only ones you need to start)
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <SymbolCard
              title="Start Event"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-green-500">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="Where the process begins"
              whenToUse="First trigger (e.g., 'Customer submits request')"
              tips="One clear start is best"
            />
            
            <SymbolCard
              title="End Event"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-red-500">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                </svg>
              }
              meaning="Where the process finishes"
              whenToUse="Final outcome (e.g., 'Request approved')"
              tips="Use at least one end"
            />
            
            <SymbolCard
              title="Task"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-500">
                  <rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="A step of work"
              whenToUse="Any action ('Validate form', 'Send email')"
              tips="Name with verb + object: 'Verify identity'"
            />
            
            <SymbolCard
              title="Exclusive Gateway"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-orange-500">
                  <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="A decision with one path taken"
              whenToUse="Yes/No or single-choice branching"
              tips="Phrase as a question; label each outgoing path"
            />
            
            <SymbolCard
              title="Pool/Lane (Swimlanes)"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-purple-500">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1"/>
                </svg>
              }
              meaning="Who does the work (role, team, system)"
              whenToUse="To show handoffs and ownership"
              tips="Keep titles short and consistent"
            />
            
            <SymbolCard
              title="Text Annotation"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-500">
                  <path d="M4,6 L20,6 L20,18 L4,18 L4,6 Z M8,10 L16,10 M8,14 L14,14" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20,12 L24,12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="Extra statement, rule, or explanation"
              whenToUse="Business rules, exceptions, clarifications"
              tips="Attach to a task/flow with an association arrow"
            />
            
            <SymbolCard
              title="Sequence Flow"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-600">
                  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <polygon points="20,12 16,8 16,16" fill="currentColor"/>
                </svg>
              }
              meaning="The order of steps"
              whenToUse="Between tasks/events inside the same pool"
              tips="Label when it clarifies meaning ('Yes', 'No')"
            />
          </div>
        </section>

        {/* How to Map */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How to Map an As-Is Process (step-by-step)
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <span><strong>Set the boundaries:</strong> define the start trigger and the end outcome.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <span><strong>List the actors:</strong> add swimlanes for roles/teams/systems.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <span><strong>Add the main steps (Tasks)</strong> in rough order—don't chase perfection yet.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <span><strong>Place decisions (Gateways)</strong> only where the path actually changes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</span>
                <span><strong>Connect with flows</strong> from left→right; avoid crossing lines where possible.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">6</span>
                <span><strong>Add statements (Annotations)</strong> for rules, exceptions, timeouts, SLAs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">7</span>
                <span><strong>Check the story:</strong> can a new teammate follow it without asking you anything?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">8</span>
                <span><strong>Name everything clearly:</strong> verbs on tasks, questions on gateways, labels on Yes/No flows.</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Designing To-Be */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Designing a To-Be Process
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Remove or merge unnecessary steps.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Automate handoffs (system tasks) where it makes sense.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Tighten decision points with clear rules and data sources.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Keep the same symbol set so stakeholders can compare as-is vs to-be easily.
              </li>
            </ul>
          </div>
        </section>

        {/* Quick Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Example (swimlanes + decisions + statements)
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="font-semibold text-gray-900 mb-4">Swimlanes: Customer | Customer Service</p>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Start → Customer "Submit Request"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Decision: "Is customer verified?"</span>
              </li>
              <li className="flex items-start gap-3 ml-9">
                <span className="text-green-500 mt-1">•</span>
                <span>Yes → Customer Service "Approve Request" → End (Approved)</span>
              </li>
              <li className="flex items-start gap-3 ml-9">
                <span className="text-red-500 mt-1">•</span>
                <span>No → Customer Service "Request ID Documents"</span>
              </li>
              <li className="flex items-start gap-3 ml-9">
                <span className="text-gray-500 mt-1">•</span>
                <span>Annotation: "Accept passport or driving licence only."</span>
              </li>
              <li className="flex items-start gap-3 ml-9">
                <span className="text-gray-500 mt-1">•</span>
                <span>Then "Verify Documents" → decision repeats.</span>
              </li>
            </ol>
            <p className="mt-4 text-sm text-gray-600 italic">
              What this shows: ownership changes across lanes, decision logic, and a business rule captured as a statement.
            </p>
          </div>
        </section>

        {/* Quality Checklist */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quality Checklist (use this before you hit Save)
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                One clear Start and at least one End.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Every Task is "verb + object" (e.g., "Validate address").
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Every Gateway is a question; outgoing flows are labeled (e.g., "Yes", "No").
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Swimlanes cover all actors; each step sits in the correct owner's lane.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Annotations capture rules/exceptions instead of cramming them in task names.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Left-to-right flow; minimal crossing lines.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                The diagram fits on one screen/page for the main path (branches can collapse/fold).
              </li>
            </ul>
          </div>
        </section>

        {/* Common Pitfalls */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Common Pitfalls
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Unlabeled decision branches.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Tasks with vague names ("Check stuff", "Handle it").
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Mixing many decisions in a row (consider combining with clear rules or sub-processes).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Using too many symbols too soon—keep it simple.
              </li>
            </ul>
          </div>
        </section>

        {/* Practice Task */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Practice Task (start here)
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Brief:</h3>
            <p className="text-blue-800 mb-4">
              Map the as-is process for Password Reset at a typical online service.
            </p>
            
            <h3 className="font-semibold text-blue-900 mb-2">Actors:</h3>
            <p className="text-blue-800 mb-4">Customer, App, Support.</p>
            
            <h3 className="font-semibold text-blue-900 mb-2">Start:</h3>
            <p className="text-blue-800 mb-4">Customer clicks "Forgot Password".</p>
            
            <h3 className="font-semibold text-blue-900 mb-2">End:</h3>
            <p className="text-blue-800 mb-4">Customer successfully signs in with the new password.</p>
            
            <h3 className="font-semibold text-blue-900 mb-2">Include:</h3>
            <p className="text-blue-800">
              decision for token validity, an annotation for expiry ("Token expires in 15 minutes"), 
              and a handoff to Support if the user is locked out.
            </p>
          </div>
        </section>

        {/* CTA Buttons */}
        <section className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/process-mapper"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <ArrowRight size={20} />
              Start Mapping
            </Link>
            <Link
              href="/process-mapper?sample=reset-flow"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Play size={20} />
              View Sample Map
            </Link>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Ready to create your first process map? Start with the practice task or explore our sample.
          </p>
        </section>
      </div>
    </div>
  );
}
































