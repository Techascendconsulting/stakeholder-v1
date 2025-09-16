import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";

const lessons = [
  { 
    id: "what-is-re", 
    title: "What is Requirements Engineering?",
    content: `Requirements Engineering is the discipline of analysing, specifying, and validating requirements. It's the crucial bridge between elicitation (gathering raw information from stakeholders) and delivery (building the solution).

While elicitation focuses on asking the right questions and capturing stakeholder input, Requirements Engineering transforms that raw information into something usable. This is where you take the conversations, notes, and ideas from stakeholder meetings and turn them into structured, clear, and actionable requirements.

The process involves several key activities:

Analysing Requirements – examining stakeholder input to identify patterns, conflicts, and gaps.

Specifying Requirements – documenting needs in a clear, unambiguous format that can be understood by all stakeholders.

Validating Requirements – confirming with stakeholders that you've captured their needs correctly.

Prioritising Requirements – determining which requirements are most important and should be delivered first.

Managing Requirements – tracking changes, dependencies, and relationships between different requirements.

This phase is essential because raw stakeholder input is often incomplete, contradictory, or unclear. Without proper Requirements Engineering, you risk building the wrong solution or missing critical functionality.

Think of it this way: elicitation is like gathering ingredients, but Requirements Engineering is the process of creating a recipe that everyone can follow to cook the same dish successfully.`
  },
  { 
    id: "analysing-requirements", 
    title: "Analysing Requirements",
    content: `Once you've gathered input from stakeholders through elicitation, your next step is to analyse that information. This involves examining what you've collected to identify patterns, conflicts, overlaps, and gaps.

Start by reviewing all your elicitation outputs – interview notes, workshop results, surveys, and any other stakeholder input. Look for common themes and recurring needs. You might notice that multiple stakeholders mention similar pain points or desired outcomes.

As you analyse, watch for:

Conflicts – when different stakeholders have opposing views on the same requirement. For example, one group wants a simple process while another needs detailed controls.

Overlaps – when multiple requirements essentially ask for the same thing but are worded differently. These can often be consolidated.

Gaps – when you realise that important functionality or constraints haven't been mentioned by anyone. This might indicate missing stakeholders or incomplete elicitation.

Ambiguities – when requirements are unclear or could be interpreted in multiple ways. These need to be clarified before they can be implemented.

During analysis, you'll also start to see relationships between requirements. Some requirements depend on others, some conflict with each other, and some might be alternative approaches to the same goal.

A useful technique is to create a requirements traceability matrix, showing how each requirement links back to specific stakeholder needs and business objectives. This helps ensure that every requirement serves a clear purpose and can be justified to stakeholders.

The goal of analysis is to transform raw stakeholder input into a coherent set of requirements that accurately represent what the business needs, without contradictions or gaps.`
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
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                    {lessons[activeTab].content}
                  </p>
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
