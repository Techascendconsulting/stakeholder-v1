import React from 'react';
import { useApp } from '../../contexts/AppContext';

export default function ProcessMappingIntroView() {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              Process Mapping: Seeing How Work Really Happens
            </h1>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                If there's one skill that separates a good Business Analyst from a great one, it's the ability to make work visible.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Most of the pain points, inefficiencies, and frustrations inside organisations hide in the invisible space between people, systems, and decisions. Everyone describes what they do — "I approve the form," "I process the payment," "I send the email" — but few can clearly explain how all these actions connect. That gap between perception and reality is where confusion, duplication, and wasted effort live.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Process mapping bridges that gap. It takes something messy and scattered — often just stories from stakeholders — and turns it into a clear visual picture of how work actually flows. It shows, in one glance, where things start, where they end, who's involved, what decisions are made, and where delays creep in.
              </p>
            </div>

            {/* Quick Start Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Start Your First Map */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Start Your First Map</h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Create a new process map to visualize how work really happens in your organization.
                </p>
                <button 
                  onClick={() => setCurrentView('process-mapper-editor')}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create New Process Map
                </button>
              </div>

              {/* View Sample */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">View Sample</h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Explore existing process maps to see examples of how others have mapped their workflows.
                </p>
                <button 
                  onClick={() => setCurrentView('process-mapper-editor')}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Existing Maps
                </button>
              </div>
            </div>

            {/* What Is Process Mapping */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What Is Process Mapping?</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Process mapping is the act of visually representing how a process works. It's not about fancy symbols or complex notations — it's about clarity. You're simply drawing the journey of a task from beginning to end.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  You can think of it like telling a story, but instead of words, you use shapes and arrows. Each shape represents an action, decision, or event. Each arrow shows what happens next. Together, they form a visual narrative of how something gets done.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  For example, if you were mapping the process of handling a tenant repair request, your map might start when the tenant submits a form. The next step could be the Tenant Services team reviewing it, followed by a decision: "Is this a maintenance issue or a voids issue?" If it's maintenance, it's sent to the contractor; if it's voids, it's logged differently. That simple map already tells a story — who does what, when, and how decisions shape the journey.
                </p>
              </div>
            </section>

            {/* Why a Business Analyst Should Do It */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why a Business Analyst Should Do It</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  As a BA, process mapping is one of your most powerful tools for understanding how things really work. Stakeholders often explain processes in vague terms. They'll say, "We check it," or "We send it to Finance." But when you map it, those generalities fall apart. You discover that "checking" involves three people, two systems, and a manual spreadsheet.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Mapping forces clarity. It helps you ask better questions like:
                </p>
                <ul className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed list-disc list-inside space-y-2 ml-4">
                  <li>Who exactly performs this task?</li>
                  <li>What triggers it?</li>
                  <li>What happens if it's delayed?</li>
                  <li>Where does information come from and where does it go next?</li>
                </ul>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  It's also a unifying tool. When stakeholders see the process on paper, they stop talking in assumptions and start talking in facts. Suddenly, everyone can point to the same diagram and say, "Yes, that's how it actually happens" — or, "Wait, no, that's not right." That moment of alignment is where real analysis begins.
                </p>
              </div>
            </section>

            {/* Why Clarity Matters */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Clarity Matters</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Processes live in people's heads. And when things go wrong, everyone sees the symptom but not the cause. A process map brings the cause into view. It reveals the handovers, delays, approvals, and decision points that make or break efficiency.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">Without a map</h3>
                    <p className="text-red-700 dark:text-red-300">Conversations stay emotional — "It takes too long!" or "The system is slow!"</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">With a map</h3>
                    <p className="text-green-700 dark:text-green-300">Conversations become objective — "Here's where the delay happens," "Here's where two teams are doing the same task," or "Here's where automation could save time."</p>
                  </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Clarity gives control. Once you can see a process, you can improve it. Without visibility, improvement is guesswork.
                </p>
              </div>
            </section>

            {/* Benefits of Process Mapping */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Benefits of Process Mapping</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  A well-designed process map delivers value far beyond documentation. It:
                </p>
                <ul className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">•</span>
                    <span><strong>Creates shared understanding.</strong> Everyone — from leadership to operations — can see the same picture and agree on what really happens.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">•</span>
                    <span><strong>Reveals inefficiencies.</strong> Bottlenecks, rework loops, and redundant steps become obvious when visualised.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">•</span>
                    <span><strong>Supports improvement.</strong> It becomes the foundation for redesign — you can't build a "to-be" process until you understand the "as-is."</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">•</span>
                    <span><strong>Strengthens communication.</strong> A picture cuts through jargon; you can explain a complex workflow to anyone in minutes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mr-3">•</span>
                    <span><strong>Provides evidence for decisions.</strong> When you propose changes, the map supports your argument. You're not giving opinions; you're showing facts.</span>
                  </li>
                </ul>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-6">
                  For many analysts, the moment they present a map to stakeholders is when their credibility skyrockets. People see that you've captured reality — not theory — and that instantly builds trust.
                </p>
              </div>
            </section>

            {/* Importance in Projects */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Importance in Projects</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every major improvement, automation, or system implementation depends on understanding existing processes. Whether you're replacing a legacy CRM, introducing AI, or redesigning a customer journey, you must first know what is being changed.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  If you skip process mapping, you risk automating chaos — locking bad processes into expensive systems. Projects that fail often do so because teams built the solution around assumptions instead of facts.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Mapping provides the anchor. It helps scope requirements, define integration points, and reveal dependencies early. It becomes the reference point throughout the project lifecycle: business case, design, testing, even training.
                </p>
              </div>
            </section>

            {/* What Process Mapping Reveals */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What Process Mapping Reveals</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  When you map a process honestly — not the "ideal version," but what really happens — patterns emerge:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Rework loops</h3>
                    <p className="text-yellow-700 dark:text-yellow-300">where information circles back because the first submission wasn't right.</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">Manual handovers</h3>
                    <p className="text-orange-700 dark:text-orange-300">between systems that should be integrated.</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">Unclear ownership</h3>
                    <p className="text-red-700 dark:text-red-300">where multiple teams assume someone else is responsible.</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">Bottlenecks</h3>
                    <p className="text-purple-700 dark:text-purple-300">at decision points where work piles up.</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3">Risk areas</h3>
                    <p className="text-indigo-700 dark:text-indigo-300">where single people or spreadsheets carry too much dependency.</p>
                  </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-6">
                  These discoveries aren't embarrassing — they're the reason you map. They give the business a mirror to see itself, often for the first time.
                </p>
              </div>
            </section>

            {/* How to Do It */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How to Do It (Step by Step)</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  You don't need expensive software or complex notation. Start simple.
                </p>
                <ol className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed space-y-4 list-decimal list-inside">
                  <li><strong>Identify the process.</strong> Choose a clear start and end point.</li>
                  <li><strong>Gather inputs.</strong> Talk to people who do the work. Ask them to walk you through it "as if you were new."</li>
                  <li><strong>Sketch the steps.</strong> Use basic shapes — rectangles for activities, diamonds for decisions, arrows for flow. Keep it readable.</li>
                  <li><strong>Validate with stakeholders.</strong> Review your draft. Let them correct, add, or clarify.</li>
                  <li><strong>Refine and finalise.</strong> Add roles, systems, and key pain points. Label clearly.</li>
                  <li><strong>Analyse.</strong> Ask: Where does time go? What can fail? What can be automated?</li>
                </ol>
              </div>
              
              {/* Example */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Example:</h3>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  Imagine mapping how a customer complaint is handled.
                </p>
                <ol className="text-blue-700 dark:text-blue-300 leading-relaxed space-y-2 mt-4 list-decimal list-inside">
                  <li>It starts when a complaint form is submitted.</li>
                  <li>The Tenant Services team logs it into the system.</li>
                  <li>A decision is made: Is this about maintenance, billing, or communication?</li>
                  <li>If maintenance, it goes to the contractor; if billing, to Finance; if communication, to Customer Experience.</li>
                  <li>Each team investigates, resolves, and closes the issue, feeding back to the tenant.</li>
                </ol>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed mt-4">
                  Now, when you look at that visual flow, patterns become obvious. Maybe Finance takes 24 hours longer to respond. Maybe two teams both contact the tenant separately. Maybe there's no automatic alert when a complaint is overdue. That's analysis born from mapping — insight through visibility.
                </p>
              </div>
            </section>

            {/* Symbols and What They Mean */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Symbols and What They Mean</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                  Process mapping doesn't need to be complicated, but consistency matters. These simple symbols are all you need to tell a clear story:
                </p>
                
                {/* Symbols Grid */}
                <div className="space-y-6">
                  {/* Start/End */}
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg width="60" height="40" viewBox="0 0 60 40" aria-label="Start/End symbol">
                        <ellipse cx="30" cy="20" rx="25" ry="15" fill="#10b981" stroke="#059669" strokeWidth="2"/>
                        <text x="30" y="25" textAnchor="middle" className="text-sm font-medium fill-white">Start</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start / End (Oval)</h3>
                      <p className="text-gray-600 dark:text-gray-400">Marks where a process begins and finishes. Every process should have one clear start and one clear end — otherwise, no one knows where it truly starts or how to know it's complete.</p>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg width="60" height="40" viewBox="0 0 60 40" aria-label="Activity/Process Step symbol">
                        <rect x="5" y="5" width="50" height="30" rx="4" fill="white" stroke="#1e40af" strokeWidth="2"/>
                        <text x="30" y="22" textAnchor="middle" className="text-xs font-medium fill-gray-700">Activity</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Activity / Process Step (Rectangle)</h3>
                      <p className="text-gray-600 dark:text-gray-400">Shows an action being performed. Always describe it using a verb, like "Log complaint," "Approve invoice," "Send confirmation." It keeps the process dynamic and readable.</p>
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg width="60" height="40" viewBox="0 0 60 40" aria-label="Decision symbol">
                        <path d="M30 5 L55 20 L30 35 L5 20 Z" fill="white" stroke="#d97706" strokeWidth="2"/>
                        <text x="30" y="22" textAnchor="middle" className="text-xs font-medium fill-gray-700">Decision</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Decision (Diamond)</h3>
                      <p className="text-gray-600 dark:text-gray-400">Represents a point where something is evaluated and different outcomes follow. For example, "Approved?" → Yes: Proceed to next step. No: Send back for rework. Decisions add logic and realism to your flow.</p>
                    </div>
                  </div>

                  {/* Document */}
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg width="60" height="40" viewBox="0 0 60 40" aria-label="Document/Data symbol">
                        <path d="M8 8 L45 8 L52 15 L52 32 L8 32 Z M45 8 L45 15 L52 15" fill="white" stroke="#0d9488" strokeWidth="2"/>
                        <text x="30" y="22" textAnchor="middle" className="text-xs font-medium fill-gray-700">Document</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Document / Data (Parallelogram)</h3>
                      <p className="text-gray-600 dark:text-gray-400">Indicates where a form, record, or file is created, read, or stored. It helps trace how information travels.</p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg width="60" height="40" viewBox="0 0 60 40" aria-label="Connector/Arrow symbol">
                        <path d="M10 20 L45 20 M40 15 L45 20 L40 25" stroke="#1e40af" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connector / Arrow</h3>
                      <p className="text-gray-600 dark:text-gray-400">Shows direction of flow — the order of events. A process without arrows is just shapes; arrows give it meaning.</p>
                    </div>
                  </div>

                  {/* Swimlanes */}
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg width="60" height="40" viewBox="0 0 60 40" aria-label="Swimlane symbol">
                        <rect x="2" y="2" width="56" height="36" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1"/>
                        <rect x="2" y="2" width="56" height="18" fill="#e5e7eb"/>
                        <rect x="2" y="20" width="56" height="18" fill="#f9fafb"/>
                        <text x="30" y="12" textAnchor="middle" className="text-xs font-medium fill-gray-600">Team A</text>
                        <text x="30" y="30" textAnchor="middle" className="text-xs font-medium fill-gray-600">Team B</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Swimlanes (Horizontal or Vertical Bands)</h3>
                      <p className="text-gray-600 dark:text-gray-400">Divide tasks by department, role, or system. Swimlanes make accountability visible and immediately show handovers between teams.</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-8">
                  When in doubt, keep it simple. The goal is clarity, not decoration. If someone can look at your map for 10 seconds and explain how the process works, you've done it right.
                </p>
              </div>
            </section>

            {/* From Understanding to Action */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">From Understanding to Action</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Process mapping isn't paperwork. It's the foundation for change. Once the process is clear, you can start improving it — redesigning steps, automating tasks, or redefining roles.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every project that succeeds does so because someone took the time to understand what existed before. That someone is usually the Business Analyst.
                </p>
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-8 mt-8 text-center">
                  <p className="text-xl text-white font-semibold leading-relaxed">
                    So before you rush to define requirements or design a new solution, stop and map what is.<br/>
                    Only then can you confidently shape what should be.
                  </p>
                </div>
              </div>
            </section>

            {/* Action Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => setCurrentView('process-mapper-editor')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Process Mapping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}