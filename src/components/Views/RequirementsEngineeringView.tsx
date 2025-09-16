import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";

const lessons = [
  { 
    id: "what-is-re", 
    title: "What is Requirements Engineering?",
    content: `When most people hear the term "requirements engineering," they imagine a Business Analyst sitting at a desk, writing long lists of requirements in a document. But in reality, Requirements Engineering (RE) is much more than that. It is the discipline that ensures projects build the right solution, for the right problem, in the right way.

Put simply, Requirements Engineering is the process of taking the raw information gathered from stakeholders and shaping it into structured, clear, and agreed requirements that can guide delivery. If elicitation is about asking questions and listening, Requirements Engineering is about making sense of those answers — analysing them, clarifying them, and turning them into something that a delivery team can actually build and test.

A key thing to understand is that Requirements Engineering is not a single step you do once and move on from. It is a cycle. As a BA, you never really stop doing it. You analyse requirements, document them, prioritise them, validate them, and manage them. Then new information comes in, stakeholders change their minds, or scope shifts — and you go through the cycle again.

In traditional waterfall projects, BAs were expected to "finish" requirements before delivery began. In Agile, things are different. You don't wait until you have every single requirement nailed down before the team can start building. Instead, once you have enough well-understood and prioritised requirements for the team to deliver a first valuable slice, development begins. While the team is working on that, you as the BA continue refining, analysing, and validating the next set of requirements. In other words, Requirements Engineering and delivery happen in parallel.

So what does this discipline actually involve? There are several overlapping activities that make up Requirements Engineering:

Analysing requirements – reviewing stakeholder input, looking for conflicts, assumptions, and gaps.

Specifying requirements – documenting them in a clear and unambiguous way, such as user stories, use cases, or process models.

Prioritising requirements – helping stakeholders decide what is most important and what can wait.

Validating requirements – confirming with stakeholders that the documented requirements are correct.

Managing requirements – tracking changes, dependencies, and ensuring everything remains aligned to the business goals.

Why is all this necessary? Because raw stakeholder input is rarely enough. Stakeholders often say things in broad or conflicting terms. One person may say, "We need better reporting," while another insists, "We need to simplify approvals." On their own, these are vague. Without proper Requirements Engineering, a team could waste time building features that don't solve the real problem or miss out on something critical.

Think of it like building a house. The project brief or charter gives you the scope — the starting point. Elicitation is like gathering the bricks, timber, and cement. But Requirements Engineering is where you create the blueprint — a structured plan that ensures everyone builds the same house. And in Agile, you don't wait until every detail of the blueprint is finished. You design enough of it to start building the foundation, while continuing to refine the rest as the house goes up.

In summary, Requirements Engineering is the continuous bridge between elicitation and delivery. It transforms raw, scattered input into structured requirements, ensures priorities are clear, validates them with stakeholders, and keeps everything aligned with business goals. Without it, projects risk building the wrong thing, or worse, building nothing of real value.`
  },
  { 
    id: "analysing-requirements", 
    title: "Analysing Requirements",
    content: `After you've spoken with stakeholders and captured their input, you'll quickly realise something: what you've written down is not yet ready to hand over to a delivery team. Stakeholders will have given you information in many different forms — some detailed, some vague, some even contradictory. This is normal. It's your job as a BA to analyse those requirements so that they start to make sense in the bigger picture of the project.

Think of this stage like tidying up after a brainstorming session. When you leave a workshop, the whiteboard may be filled with sticky notes — useful ideas, but all over the place. If you handed that board straight to a developer, they wouldn't know where to start. Your role is to organise, refine, and structure what you've collected so it becomes a usable foundation for prioritisation and documentation.

One of the first things you do is group requirements. Let's say you're working on a retail platform and stakeholders have mentioned things like "customer login," "weekly sales reports," "discount vouchers," and "dashboard for store managers." On the surface, it's just a list. When you group them, you start to see categories: authentication, reporting, promotions, and management tools. Suddenly, the scattered list begins to take shape.

Next comes spotting conflicts and overlaps. A finance manager might insist that every transaction requires supervisor approval, while the sales lead argues that approvals slow things down. Both perspectives are valid — but they clash. By highlighting this conflict, you create a talking point for follow-up sessions rather than allowing the contradiction to sneak into delivery.

Another responsibility is identifying gaps and assumptions. Stakeholders don't always say everything. For example, nobody may have mentioned how refunds are processed, but you know it's part of the business. That gap must be noted and explored. Similarly, assumptions can be dangerous if left unchecked. A stakeholder might say, "Of course customers will use this on their phone," but unless you confirm, you risk building a solution that doesn't meet the real need.

This is also the stage where you break down vague requirements into specific, testable ones. A common phrase you'll hear is, "The system should be user-friendly." On its own, this is meaningless for developers or testers. Your role is to unpack what "user-friendly" means. Does it mean fewer steps to complete a task? Does it mean a cleaner interface? A good refinement might be: "A first-time user should be able to register and log in within three steps." That is testable and clear.

Often, the best way to analyse is to visualise. Drawing process maps, swimlanes, or data flows can reveal inefficiencies that words alone don't capture. For example, mapping a current approval process might show five unnecessary handoffs that nobody realised were slowing things down. When you put that in front of stakeholders, it becomes obvious why change is needed.

**Try it yourself:** Use our [Process Mapper](/process-mapper) to create visual process maps that help identify inefficiencies and gaps in your requirements analysis.

The point of analysis is not to finalise requirements immediately but to create clarity and structure. You are moving from messy notes and stakeholder soundbites to organised insights that everyone can build on. By the end of this stage, you'll have a clearer picture of what the project really needs, which areas need further exploration, and what gaps or conflicts must be resolved before moving forward.

In summary, analysing requirements is where the BA brings order to chaos. Through grouping, resolving conflicts, testing assumptions, breaking down vague statements, and using visual models, you transform scattered input into structured insights that can guide prioritisation and documentation. Without this step, requirements remain raw fragments that no delivery team could realistically use.`
  },
  { 
    id: "prioritising-requirements", 
    title: "Prioritising Requirements",
    content: `Once you have analysed requirements and begun to make sense of stakeholder input, the next challenge is deciding which ones should be delivered first. This is where prioritisation comes in.

In every project, you will face the same reality: you cannot deliver everything at once. Budgets are limited, deadlines are tight, and resources are constrained. Even if you had unlimited time, trying to build everything in one go almost always leads to wasted effort, scope creep, and disappointed stakeholders. Prioritisation is the discipline that prevents this.

Your role as a BA is not to decide priorities in isolation. Instead, you facilitate prioritisation discussions, helping stakeholders balance competing needs and ensuring that decisions are tied back to business goals. Done well, prioritisation reduces conflict, creates focus, and ensures the team starts with the most valuable work.

**The MoSCoW Method**

The most widely used technique for prioritisation is the MoSCoW method. It divides requirements into four categories:

Must have – Without these, the solution fails. These are non-negotiable.

Should have – Important requirements, but not critical for the first release.

Could have – Nice-to-have features that can be included if time and resources allow.

Won't have (for now) – Requirements explicitly agreed to be out of scope for this release.

For example, imagine you are working on a new online expense management system.

A Must have might be: "Employees must be able to submit an expense claim with supporting receipts." Without this, the system cannot function.

A Should have could be: "Employees should be able to submit expenses via a mobile app." It adds value, but the web version is sufficient for launch.

A Could have might be: "Employees could have the option to take a photo of their receipt and the system automatically extracts the details." Useful, but not essential.

A Won't have (for now) might be: "Integration with personal finance apps." A good idea, but not within the immediate project scope.

Using MoSCoW gives stakeholders a shared language to have difficult conversations. Instead of everyone claiming their requirement is "urgent," the discussion shifts to: "Is this a Must, Should, Could, or Won't for this release?"

**MVP and Prioritisation**

In Agile, prioritisation is not just about classifying requirements — it's about shaping the Minimum Viable Product (MVP). The MVP is the smallest version of the product that still delivers value to stakeholders. It allows the team to start delivering benefits early, test assumptions, and learn from real feedback.

When using MoSCoW, the MVP usually consists of the Must haves and a carefully selected set of Should haves that deliver a meaningful outcome. The rest are planned for later releases. As a BA, you play a key role in guiding stakeholders to see what the MVP should include, and what can wait.

For example, in the expense management project, the MVP might be:

Employees can submit claims (Must have).

Finance can approve or reject claims (Must have).

Claims are stored and can be reported by month (Should have).

Everything else — mobile app, AI receipt scanning, fancy dashboards — can follow once the MVP is live.

**Prioritisation and Design Conversations**

Prioritisation also feeds directly into the design phase. Once you know what features are Must haves, designers and developers can begin shaping the first version of the solution. The BA ensures that early design work aligns with the agreed priorities. For instance, there is no point designing an elaborate dashboard if reporting is only a Could have for a later release.

**The BA's Role**

Facilitating prioritisation can sometimes be challenging. Stakeholders may resist categorising their needs as anything less than a Must. This is where you use skills such as negotiation, asking probing questions, and pointing back to the business case or project goals. A good BA helps stakeholders see the bigger picture and make informed trade-offs.

In summary, prioritisation is about focusing the project on what matters most. MoSCoW is the most popular tool for achieving this, helping stakeholders distinguish Musts from Shoulds and Coulds. Done well, prioritisation defines the MVP, guides early design, and ensures delivery starts with the highest-value features. Without it, projects risk overcommitting, building the wrong things first, or never delivering at all.`
  },
  { 
    id: "documenting-requirements", 
    title: "Documenting Requirements",
    content: `Up to this point, you have elicited requirements, analysed them to bring structure, and worked with stakeholders to prioritise what matters most. The next question is: how do you capture these requirements so that everyone — business stakeholders, designers, developers, and testers — can work from the same understanding? This is where documentation comes in.

Documentation is often misunderstood. Some people imagine it as creating a thick requirements document that nobody ever reads. Others think Agile means "no documentation at all." The truth lies in the middle. Documentation is not about producing endless paperwork — it is about capturing requirements in a clear, usable format that communicates effectively to the people who need it.

In Agile environments, documentation tends to be lightweight and iterative. Instead of huge documents created at the start of a project, requirements are documented just enough to keep the team aligned and delivery moving forward.

**User Stories**

One of the most common formats is the user story. A user story captures a requirement from the perspective of the user, typically written in the format:

"As a [user role], I want [goal], so that [benefit]."

For example:

"As an employee, I want to submit my expense claim online so that I don't have to fill out paper forms."

This simple structure keeps the focus on who needs something, what they need, and why they need it. A user story is not detailed enough on its own, but it creates a shared starting point for conversation and collaboration.

**Acceptance Criteria**

Every user story should be supported by acceptance criteria — conditions that define when the story is considered complete. Acceptance criteria make requirements testable and unambiguous. For example, for the expense claim story, acceptance criteria might include:

The employee can upload a receipt as a JPG or PNG.

The claim must include the amount, date, and expense category.

The system must show an error if mandatory fields are missing.

Together, the story and its acceptance criteria ensure everyone understands the expectation and can agree on what "done" looks like.

**Process Maps and Diagrams**

Not all requirements are best expressed in words. Sometimes, a visual model communicates more effectively. A process map showing how expense claims move from employee to manager to finance makes it easier for stakeholders to see the flow. Swimlane diagrams can highlight handoffs between teams. Data models can clarify what information is needed and how it connects. These visuals are not "extras" — they are core documentation tools that help people see and agree on the requirement.

**The BA's Responsibility**

As a BA, your responsibility is not to create documentation for its own sake, but to ensure that requirements are communicated clearly, completely, and in a format that fits the project. In Agile, this often means creating just enough documentation, kept up to date, and evolving with the backlog as priorities shift.

The real test of good documentation is simple: can stakeholders read it and say, "Yes, that's what I meant," and can delivery teams read it and say, "Yes, we can build and test that."

In summary, documenting requirements in Agile is about clarity, not volume. Whether through user stories and acceptance criteria, or process maps and models, documentation ensures that everyone shares the same understanding. And now, it's your turn to practise. In the next section, you'll move into Requirements Documentation, where you can walk through examples, practise writing your own, and test yourself in advanced scenarios.`
  },
  { 
    id: "validating-requirements", 
    title: "Validating Requirements",
    content: `By now, you've elicited, analysed, prioritised, and documented requirements. But here's a hard truth: just because something is written down doesn't mean it's correct. Requirements must be validated — checked and confirmed with stakeholders to ensure they reflect what the business truly needs.

Validation is one of the most overlooked skills for new BAs. Many assume that once requirements are documented, the job is done. In reality, requirements are only useful if stakeholders agree they are accurate, complete, and aligned to the project's goals. Without validation, you risk building a solution that nobody recognises when it's delivered.

Think of validation as a feedback loop. You take what you've captured, present it back to stakeholders, and confirm whether it matches their intent. This is not just a formality — it's an active process of uncovering misunderstandings, resolving ambiguities, and building confidence across the team.

**How Validation Happens in Practice**

Validation doesn't always mean a formal sign-off. In Agile projects, it often happens continuously through collaboration. For example, during backlog refinement, you walk through user stories with the Product Owner, developers, and testers. Together, you check:

Does the story represent the real need?

Are the acceptance criteria testable?

Is there anything missing or unclear?

Sometimes, validation is more focused. You might hold a requirements walkthrough with a small group of stakeholders. Here, you step through a process map or a set of stories and ask, "Does this reflect how you see the business working?" These walkthroughs are powerful because they give stakeholders a chance to react to something tangible instead of relying on memory of a conversation.

Validation also happens through examples and scenarios. For instance, if you've documented requirements for an expense system, you might say:

"Let's imagine John submits a £100 claim for travel with a receipt. Does the process we've captured handle this correctly?"

"Now what if John forgets to attach the receipt — does the system behave as expected?"

By playing through scenarios, stakeholders quickly spot gaps or corrections that wouldn't appear in abstract discussions.

**The BA's Role**

Your role as a BA in validation is not to defend your documentation but to facilitate agreement. You create a safe environment where stakeholders can say, "This isn't quite right," without it being seen as failure. The goal is to catch misunderstandings early, before they become expensive problems in delivery.

Validation is also about alignment. Stakeholders often have different perspectives, and by reviewing requirements together, you help them converge on a shared view. This shared understanding is more valuable than a signature on a document.

**Why Validation Matters**

Skipping validation is one of the fastest ways for a project to go wrong. Imagine spending weeks capturing requirements for a new system, only to discover during user acceptance testing that key scenarios were missed. At that point, changes are costly and frustrating for everyone. By validating continuously, you reduce risk and ensure that what gets built is what the business actually needs.

In summary, validation is about creating confidence and alignment. It is the process of confirming that requirements are correct, complete, and testable — not in your opinion, but in the eyes of stakeholders. Through backlog refinement, walkthroughs, and scenario-based reviews, you as a BA close the loop between what is written and what is truly needed. Without validation, even the best-written requirements risk missing the mark.`
  },
  { 
    id: "transition-to-delivery", 
    title: "Transition to Delivery",
    content: `By this stage, you've elicited requirements, analysed them to bring structure, prioritised what matters most, documented them clearly, and validated them with stakeholders. The next step is ensuring those requirements transition smoothly into delivery — where designers, developers, and testers begin to bring the solution to life.

Transition isn't about "handing over" requirements and walking away. In Agile, there is no handover. Delivery and requirements engineering overlap, and you as a BA remain actively involved throughout. Transition is not the end of your job — it is the bridge between understanding the problem and helping the team build the solution.

**What Transition Really Means**

Transition begins when requirements are ready enough for the team to act on. That might mean a set of Must-have user stories with acceptance criteria, or a process map validated with stakeholders. These artefacts don't sit on a shelf — they move directly into the team's backlog, shaping the upcoming sprints.

As a BA, your responsibility is to make sure that when requirements enter delivery, they are:

Clear enough to build — no ambiguity about what's expected.

Testable — acceptance criteria define what "done" means.

Aligned with priorities — the team starts with the Musts and MVP scope.

But delivery is not just a technical process. In Scrum, it is organised through a set of ceremonies that bring rhythm and collaboration to the work. Understanding these ceremonies — and your role in them — is critical.

**Scrum Ceremonies and the BA**

Scrum ceremonies are the structured touchpoints where requirements move from ideas into working software. Each ceremony gives you, as a BA, an opportunity to ensure requirements are understood, refined, and validated as delivery progresses.

Sprint Planning – The team decides what can be delivered in the sprint. You explain user stories, clarify acceptance criteria, and ensure everyone understands the business context before work begins.

Daily Scrum (Stand-up) – Each day the team aligns on progress and blockers. You don't run this meeting, but you listen carefully. If a developer mentions confusion about a requirement or a tester flags an unclear rule, you step in to clarify after the stand-up.

Backlog Refinement – This is where requirements work is most visible. You break down stories, resolve questions, and make sure the backlog is ready for upcoming sprints. Backlog refinement is where Requirements Engineering and Agile delivery meet in the most practical way.

Sprint Review – At the end of the sprint, the team demonstrates the increment to stakeholders. You check whether what has been built matches the requirements and note any feedback that should update the backlog. This is also where validation continues in real time.

Sprint Retrospective – While this ceremony is about improving team collaboration rather than requirements, your perspective as a BA helps the team reflect on communication, clarity, and stakeholder engagement.

These ceremonies are not optional extras — they are the heartbeat of Agile delivery. By being present and engaged, you make sure requirements are not just written down but actually delivered in a way that stakeholders recognise and value.

**The BA's Role in Transition**

During delivery, your focus shifts. You are no longer just gathering and structuring requirements; you are actively supporting the team to build them correctly. That means:

Answering questions about requirements quickly.

Clarifying edge cases and business rules.

Checking whether delivered features meet acceptance criteria.

Feeding back stakeholder input into the backlog for future sprints.

In many ways, you act as the translator between the business and the delivery team, ensuring that what was agreed in requirements engineering doesn't get lost in translation during development.

**Closing the Loop**

It's important to understand that Requirements Engineering doesn't stop once delivery begins. While one set of requirements is being built, you are often eliciting, analysing, and validating the next set. Agile delivery is a cycle — requirements and delivery happen in parallel, constantly feeding into one another.

In summary, transition to delivery is where requirements stop being just words and start becoming working software. Scrum ceremonies provide the structure, and your role as a BA is to guide, clarify, and validate throughout. You remain the bridge between business intent and technical delivery, ensuring that every increment delivers value.

Now that you've completed the Requirements Engineering hub, it's time to see these ceremonies in action. Move into the Scrum Practice area, where you'll experience how requirements come to life inside real Scrum events.`
  },
];

const RequirementsEngineeringView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { setCurrentView } = useApp();

  const handleProcessMapperClick = () => {
    setCurrentView('process-mapper');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/20 px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Requirements Engineering
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            You've gathered input from stakeholders. Now it's time to engineer those requirements into structured, prioritised, and validated outputs that can guide successful delivery.
          </p>
        </header>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Elicitation</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-300 dark:bg-blue-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {activeTab + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">Requirements Engineering</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Scrum Practice</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lessons</h3>
              <nav className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveTab(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === index
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 ${
                        activeTab === index
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      {lesson.title}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Content Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {lessons[activeTab].title}
                </h2>
                <div className="flex items-center text-blue-100">
                  <span className="text-sm">Lesson {activeTab + 1} of {lessons.length}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                    {lessons[activeTab].content.split('[Process Mapper](/process-mapper)').map((part, index, array) => (
                      <span key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <button
                            onClick={handleProcessMapperClick}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium cursor-pointer"
                          >
                            Process Mapper
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Practice button for documenting requirements lesson */}
                {activeTab === 3 && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                        Ready to practice writing user stories and acceptance criteria with interactive feedback?
                      </p>
                      <button
                        onClick={() => setCurrentView('user-story-checker')}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Go to Documentation Practice →
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA for transition lesson */}
                {activeTab === lessons.length - 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                        With validated requirements, you can now support delivery through Scrum ceremonies and backlog refinement.
                      </p>
                      <button
                        onClick={() => setCurrentView('scrum-practice')}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Start Scrum Practice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsEngineeringView;
