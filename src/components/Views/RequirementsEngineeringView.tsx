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
    content: `Not all requirements are equally important. Some are essential for the project's success, while others are nice-to-have features that could be delivered later or not at all. Prioritisation helps you focus on what matters most and make informed decisions about scope and delivery.

Several techniques can help you prioritise requirements effectively:

MoSCoW Prioritisation – categorises requirements into Must have, Should have, Could have, and Won't have (this time). This is particularly useful when you need to deliver within fixed timeframes or budgets.

Value vs Effort Matrix – plots requirements on a grid showing business value against implementation effort. High-value, low-effort requirements are obvious wins, while high-effort, low-value requirements should be questioned.

Kano Model – categorises requirements based on how they affect customer satisfaction. Basic requirements are expected, performance requirements increase satisfaction, and excitement requirements create delight.

Stakeholder voting – allows stakeholders to vote on which requirements they consider most important. This can reveal consensus or highlight areas of disagreement.

When prioritising, consider factors such as:

Business value – how much this requirement contributes to achieving business objectives.

User impact – how many users will benefit and how significantly.

Technical risk – how difficult or risky it is to implement.

Dependencies – whether this requirement blocks or enables other important work.

Regulatory or compliance needs – whether this requirement is mandatory for legal or policy reasons.

Remember that prioritisation is not a one-time activity. As you learn more about the project and stakeholder needs, priorities may change. Regular review and adjustment of priorities helps ensure the project stays focused on delivering maximum value.`
  },
  { 
    id: "documenting-requirements", 
    title: "Documenting Requirements",
    content: `Now that you've analyzed and prioritized requirements, it's time to document them properly. This is where you transform stakeholder input into structured, actionable specifications that development teams can implement.

**What Makes Good Requirements Documentation?**

Requirements documentation should be:
- **Clear and unambiguous** - Anyone can understand what needs to be built
- **Complete and accurate** - Nothing important is missing or incorrect
- **Testable and verifiable** - You can prove when something is done correctly
- **Traceable** - You can link back to the original business need
- **Maintainable** - Easy to update as things change

**Key Documentation Formats**

**1. User Stories**
User stories capture requirements from the user's perspective:
"As a [user type], I want [functionality] so that [benefit]"

Example: "As a customer, I want to reset my password so that I can access my account when I forget it."

**2. Acceptance Criteria**
These define when a user story is complete:
- User receives email within 5 minutes
- Link expires after 24 hours
- New password meets security requirements
- User can log in with new password immediately

**3. Business Requirements Document (BRD)**
A comprehensive document that includes:
- Executive summary and business context
- Stakeholder analysis and objectives
- Functional and non-functional requirements
- Assumptions, constraints, and risks
- Success criteria and metrics

**4. Use Cases**
Step-by-step descriptions of how users interact with the system:
- Preconditions (what must be true before starting)
- Main flow (the happy path)
- Alternative flows (what happens when things go wrong)
- Postconditions (what's true after completion)

**Documentation Best Practices**

**1. Start with the End in Mind**
- What does success look like?
- How will this be tested?
- Who needs to understand this?

**2. Use Consistent Language**
- Define all terms clearly
- Use the same terminology throughout
- Avoid jargon and acronyms

**3. Include Examples**
- Show what good looks like
- Provide real-world scenarios
- Use visual aids when helpful

**4. Make it Living Documentation**
- Update as requirements change
- Version control your documents
- Keep stakeholders informed of changes

**Common Documentation Mistakes**

**1. Too Much Detail**
- Including implementation specifics
- Over-engineering simple requirements
- Creating documents that are hard to read

**2. Too Little Detail**
- Vague or ambiguous language
- Missing important requirements
- No acceptance criteria

**3. Wrong Audience**
- Technical details for business users
- Business language for developers
- No consideration for different readers

**4. Out of Date**
- Not updating when requirements change
- Inconsistent with current project state
- Conflicting information across documents

**The BA's Role in Documentation**

As a Business Analyst, you're responsible for:
- **Creating clear, complete requirements**
- **Ensuring stakeholder understanding**
- **Maintaining documentation quality**
- **Facilitating communication between teams**
- **Managing changes and updates**

**Ready to Practice?**

Now that you understand the fundamentals of requirements documentation, it's time to practice writing user stories and acceptance criteria with interactive feedback and real-world scenarios.`
  },
  { 
    id: "validating-requirements", 
    title: "Validating Requirements",
    content: `Validation is the process of confirming that your requirements accurately capture what stakeholders actually need. It's not enough to document requirements – you must verify that they are correct, complete, and understood by all parties.

Validation involves checking back with stakeholders to ensure that your interpretation of their needs matches their actual requirements. This is crucial because misunderstandings at this stage can lead to expensive rework later in the project.

Key validation activities include:

Stakeholder Review – presenting your documented requirements to stakeholders and asking them to confirm accuracy and completeness.

Walkthroughs – going through requirements with stakeholders step-by-step to ensure understanding and identify any gaps or errors.

Prototyping – creating simple models or mockups to help stakeholders visualise and validate requirements.

Acceptance Criteria Review – ensuring that the criteria for determining whether a requirement has been met are clear and agreed upon.

During validation, you might discover that:

Requirements are missing – stakeholders identify needs that weren't captured during elicitation.

Requirements are incorrect – your interpretation doesn't match what stakeholders actually want.

Requirements are incomplete – additional detail is needed to make requirements implementable.

Requirements are conflicting – different stakeholders have different expectations that need to be resolved.

Validation is also an opportunity to check that requirements are:

Feasible – can be implemented with available resources and technology.

Testable – can be verified to ensure they've been met.

Aligned with business objectives – support the overall goals of the project.

When stakeholders confirm that requirements are correct, you have confidence that the solution you're planning to build will meet their actual needs. This validation step is essential for project success.`
  },
  { 
    id: "transition-to-delivery", 
    title: "Transition to Delivery",
    content: `Once you have analysed, prioritised, documented, and validated your requirements, you're ready to transition from requirements engineering to delivery. This transition involves handing over your requirements work to the development team and supporting them throughout the delivery process.

The transition typically involves several key activities:

Requirements Handover – presenting your requirements documentation to the development team and ensuring they understand what needs to be built.

Backlog Creation – converting your requirements into a product backlog that can be used for sprint planning and development.

Acceptance Criteria Definition – working with the team to define specific, testable criteria for each requirement.

Ongoing Support – being available to clarify requirements, answer questions, and help resolve issues as they arise during development.

In agile environments, this transition often involves:

Sprint Planning – participating in planning meetings to help the team understand requirements and estimate effort.

Backlog Refinement – regularly reviewing and updating the backlog as you learn more about requirements or as business needs change.

User Story Writing – collaborating with the team to write detailed user stories with clear acceptance criteria.

Definition of Done – ensuring that the team understands what constitutes a complete, deliverable feature.

Throughout the delivery phase, your role as a BA continues to be important. You may need to:

Clarify requirements when the development team has questions.

Refine requirements as you learn more about technical constraints or possibilities.

Validate that delivered features meet the original requirements.

Manage changes to requirements as business needs evolve.

The transition to delivery marks the end of the requirements engineering phase, but it's not the end of your involvement. You remain a key stakeholder in ensuring that the solution delivered meets the business needs you've worked so hard to understand and document.`
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
                        Practice Documentation Skills
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
