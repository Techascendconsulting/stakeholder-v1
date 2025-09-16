import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Layers, ArrowRight, BookOpen } from 'lucide-react';

const SolutionOptions: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentPage, setCurrentPage] = useState<'overview' | 'lessons'>('overview');
  const [activeTab, setActiveTab] = useState(0);

  const lessons = [
    {
      id: 'lesson-1',
      title: 'What Are Solution Options?',
      content: `Once you've completed elicitation, you don't jump straight into design. First, you pause and ask: "Given what we know about the problem and the desired future state, what different solutions could we consider?"

This is the stage called exploring solution options.

**Why It Matters**

Solutioning is where a project begins to bridge from understanding the problem (elicitation and analysis) to shaping how the problem could be solved. If you skip this step, teams often default to the loudest stakeholder's idea or the newest technology trend. By deliberately exploring options, you help the business see that there are usually multiple paths forward.

**Different Types of Solutions**

A solution doesn't always mean "build a new IT system." In real projects, options might include:

- Process improvement – streamlining how work is done today.

- System enhancement – adding functionality to an existing platform.

- New system – implementing a completely new tool or application.

- Manual workaround – a short-term solution while bigger changes are planned.

- Automation – using scripts, RPA (Robotic Process Automation), or AI to reduce manual effort.

- Outsourcing – shifting part of the work to an external provider.

As a BA, part of your value is reminding stakeholders that there's more than one way to solve a problem.

**Who Shapes the Solution?**

This is where collaboration comes alive. You're not solutioning alone.

**Solution Architects** – They look across the technical landscape. They know whether a proposed idea will integrate with existing systems, scale to demand, or meet security and compliance needs.

**Tech Leads/Developers** – They bring a practical lens: "This is possible, but it will take six months," or "This could work if we adjust the API."

**Testers/QA** – They ensure that whatever option is chosen can actually be tested and verified later.

**Business Analysts (You)** – Your role is to make sure the conversation stays grounded in the problem and aligned with scope and value. You also capture and structure the options so stakeholders can compare them clearly.

**Stakeholders/Product Owners** – They bring business priorities and customer perspective. They care about impact, usability, and return on investment.

Often, these people are brought together in early workshops — even while you're still in elicitation. That's normal. Architects and tech leads may begin thinking of solutions the moment they hear the problem. Your role is to balance their ideas with the need to first fully understand the business context.

**The Three Amigos**

In Agile delivery, there's also the Three Amigos model:

**The BA** – representing business value and clarity.

**The Developer/Tech Lead** – representing technical feasibility.

**The Tester/QA** – representing quality and testability.

Together, the Three Amigos make sure requirements and solutions are shaped from three angles at once: value, feasibility, and testability. This collaboration is a practical way of validating solution options before delivery even begins.

**The BA's Responsibility**

Your responsibility in solutioning is to:

- Facilitate structured discussions on options.

- Ensure options don't drift away from the real problem.

- Capture trade-offs (cost, feasibility, risk, value).

- Help stakeholders compare choices fairly.

You are not there to pick the solution — but to make sure the process of choosing is clear, balanced, and aligned to the project goals.

In summary, solution options are the bridge between problem and design. They involve exploring multiple ways forward, guided by collaboration between business, technical, and quality perspectives. As a BA, your role is to structure these conversations, keep them tied to the problem, and record the options so the team can move forward with confidence.`
    },
    {
      id: 'lesson-2', 
      title: 'Evaluating Options',
      content: `Once potential solution options have been identified, the next step is to evaluate them. This is where you as a BA help the business move from "what could we do?" to "what makes the most sense for us right now?"

When you're sitting in these meetings, it often feels like there are too many voices in the room. One stakeholder loves the cheapest option, another is pushing for the newest technology, and someone else is worried about compliance risks. This is exactly why your role as a BA matters — you bring structure to what would otherwise be a noisy debate.

🧩 **Common Evaluation Criteria**

You don't let people simply vote on their favourite idea. A BA introduces structured criteria that give decision makers a fair, consistent way to compare very different options.

**1. Business Value**
At the heart of every decision is value. You ask: "How much does this option improve things for the business or its customers?"

For customers, this could mean faster service or fewer errors.

For internal teams, it might mean cost savings or improved efficiency.

Example: In the Expense Management project, a SaaS tool offers high value because it reduces staff effort and mistakes, even though it's more expensive upfront.

**2. Feasibility**
An idea might sound great, but can the organisation actually deliver it with the resources and skills available?

Example: In the Inventory Management project, IoT sensors promise real-time accuracy, but if the warehouses lack Wi-Fi or the IT team has no IoT experience, feasibility is a major concern.

**3. Cost**
Every option has a price tag — not only to build, but to run and maintain.

Example: In the Customer Identity Verification project, expanding the manual team seems cheap at first but becomes the most expensive option over time due to ongoing salaries.

**4. Risk**
You capture risks openly: what could go wrong if we pick this path? This could include compliance, security, or organisational resistance.

Example: In the Expense Management project, buying a SaaS tool may introduce data security risks if financial data is stored overseas.

**5. Time to Deliver**
Sometimes the "best" option takes too long. Time matters, especially with regulatory deadlines or urgent business pain points.

Example: In the Customer Identity Verification project, hiring more staff could be done in weeks, while integrating an AI tool might take nine months. The group may agree on a hybrid: Option A short term, Option C long term.

📚 **Real-Life Examples**

Now let's look at how these criteria play out in three different projects:

**Customer Identity Verification**
Options: Expand manual team, enhance CRM, buy new AI tool.
Trade-offs: Fast but costly vs balanced but dependent on vendor vs high-value but long integration.
BA role: Capture these in a comparison matrix, guide structured discussion, highlight hybrid approaches.

**Expense Management**
Options: Better Excel templates, enhance finance system, buy SaaS tool.
Trade-offs: Low cost but short-lived vs practical but limited vs high-value but costly and complex.
BA role: Balance finance concerns with employee efficiency gains, ensure value is seen beyond just money.

**Inventory Management**
Options: Train staff for more manual counts, enhance ERP, roll out IoT sensors.
Trade-offs: Cheap but not scalable vs realistic balance vs high-tech but slow and expensive.
BA role: Anchor debate to feasibility and scalability, not just excitement over shiny technology.

🎯 **The BA's Role**

In evaluation workshops, you are the anchor. You:

**Introduce the criteria** so debate is structured.

**Ensure Solution Architects, Tech Leads, Testers, and business stakeholders** all contribute from their perspective.

**Document the trade-offs clearly**, so nothing is forgotten.

**Guide the group toward clarity**, not confusion.

Remember: you don't choose the solution. Your role is to create the environment where the right people can make a fair, informed choice.

👉 Next, in Lesson 3: Recommending a Way Forward, we'll see how you as the BA present these evaluated options back to decision makers, helping them agree on a "preferred solution" that carries into design.`
    },
    {
      id: 'lesson-3',
      title: 'Recommending a Way Forward', 
      content: `After solution options have been identified and evaluated, the business now faces a choice: which way forward? This is the point where the BA helps move from structured evaluation into a clear recommendation that stakeholders can align around.

**Why This Step Matters**

Evaluating options without making a recommendation leaves the project stuck in limbo. People walk out of meetings saying "we'll think about it" but never commit. On the other hand, jumping to a decision without evidence risks choosing the wrong path.

As a BA, you sit in the middle: you don't make the decision for the business, but you present the options and their trade-offs in a way that makes the decision clear and informed.

**How BAs Recommend a Way Forward**

**Summarise the Options Clearly**
Don't overwhelm decision makers with raw notes. Present a clean summary:

- Option A: Expand manual team – Fast, low setup, but high ongoing cost.

- Option B: Enhance CRM – Medium cost, vendor dependency, balanced feasibility.

- Option C: New AI tool – High value, scalable, but long and expensive to deliver.

A simple table or comparison matrix often works best.

**Highlight the Trade-Offs**
Every option has a "but." The BA makes these visible. For example:

- Option A solves the immediate pain but doesn't scale.

- Option C is best for the future but too slow to meet short-term deadlines.

Decision makers need to see both sides clearly.

**Show Hybrid or Phased Approaches**
Often the answer isn't one option alone. A BA might recommend:

- "Option A short-term while we prepare for Option C long-term."

- Or "Option B now, with flexibility to expand to Option C in future."

This shows pragmatism and keeps momentum.

**Keep it Evidence-Based**
Anchor every recommendation back to the criteria: value, feasibility, cost, risk, and time. This prevents decisions being swayed only by gut feeling or seniority.

**Real-Life Example: Expense Management**

Let's return to the Expense Management project. After evaluation, the group saw:

- Excel templates (cheap, but a short-term fix).

- Finance system enhancement (moderate, but limited features).

- SaaS tool (high value, but costly and requires training).

As the BA, you bring this together in a recommendation:

"Based on value, cost, and feasibility, the preferred way forward is Option B — enhancing the finance system. However, this should be paired with a long-term roadmap to move to a SaaS tool within 18 months. This balances immediate efficiency with future scalability."

Notice how the BA doesn't choose for the business, but frames the recommendation so stakeholders can agree.

**Documenting the Preferred Solution**

Once stakeholders align, the BA records the preferred solution. This could be in:

- A Solution Options Paper (lightweight document summarising the options and trade-offs).

- The Business Case update (if still early in the project).

- A section of the Requirements Document or Confluence space.

The goal is clarity: everyone should be able to look back and understand why the chosen solution was selected.

**The BA's Role in This Step**

At this stage, your role is to:

- Frame the options clearly.

- Highlight trade-offs without bias.

- Facilitate agreement in workshops or steering committees.

- Document the decision and keep it visible for the team.

You're not the one who approves the budget or signs off the final decision. But without you, the conversation risks going in circles or being based on opinions instead of evidence.

In summary, recommending a way forward is about turning evaluation into action. The BA ensures stakeholders see the options clearly, understand the trade-offs, and commit to a preferred solution. This preferred solution is what carries forward into the Design phase, where it will be shaped into something real.`
    },
    {
      id: 'lesson-4',
      title: 'From Preferred Solution to Design',
      content: `After the business has agreed on a preferred solution, the next challenge is to answer the question: "What will this actually look like in practice?"

This is where the project moves into the Design stage. Design is not about decorating wireframes or choosing colours. It's about shaping the chosen solution into processes, system behaviours, and user experiences that will guide delivery.

**Why This Step Matters**

Agreeing on a preferred solution is a milestone, but it is still abstract. "Enhance the CRM" or "Buy a SaaS tool" doesn't tell anyone exactly how the system will behave, what the process will look like, or what users will need to do differently. Without design, teams risk rushing into delivery with unclear scope and conflicting expectations.

Design provides the bridge: it translates the preferred solution into enough detail so that development teams, testers, and stakeholders all share the same vision.

**What Happens in Design**

**To-Be Process Mapping**
The BA facilitates mapping sessions to capture how the new process will flow. This might involve swimlanes, activity diagrams, or structured workshops that compare the new process against the As-Is.

**Wireframes and Prototypes**
UX designers (or sometimes the business team) sketch draft screens and journeys. The BA checks that requirements are reflected accurately.

**System and Data Design**
Solution Architects and Tech Leads define how systems will integrate, what new fields or tables are needed, and how information will flow between components.

**Business Rules and Edge Cases**
The BA ensures detailed rules are captured (e.g., accepted document types, submission deadlines) and that exceptions are considered early.

**Real-Life Examples**

**Example 1: Customer Identity Verification**
The preferred solution was to enhance the CRM with an ID verification feature.

- The Solution Architect maps how the CRM will connect to an external API for document checks.

- A UX designer sketches a simple "Upload ID" screen for customers.

- The BA checks these designs against requirements captured earlier, such as which IDs are valid and how error messages should appear.

- The Tester raises edge cases like: "What if the photo is blurry?" or "What if the ID is expired?"

Here, design sessions bring together requirements, technical feasibility, and user experience in one place.

**Example 2: Expense Management**
The preferred solution was to add an expense module to the finance system.

- The To-Be process is mapped: employee submits claim → manager approves → finance validates → payroll reimburses.

- Wireframes show a form with fields for amount, category, and receipt upload.

- The BA ensures that rules from elicitation (e.g., receipts must be submitted within 30 days) are included.

- Finance raises exceptions like foreign currency handling and VAT receipts, which are documented for developers.

Design in this context transforms the abstract "add a module" into a clear picture of how employees and finance will interact with the system.

**Example 3: Inventory Management**
The preferred solution was to enhance the ERP system rather than implement IoT sensors immediately.

- Architects confirm the ERP can support real-time stock updates.

- Mock-ups show warehouse staff scanning items with handheld devices.

- The BA ensures the process reflects requirements such as low-stock alerts and role-based permissions.

- Edge cases are raised: "What if the scanner is offline?" or "What if items are moved between warehouses?"

This example shows how design forces the project team to think about real-world situations, not just ideal flows.

**Preparing for MVP**

A key realisation in design is that not everything needs to be delivered at once.

- In Identity Verification, MVP might be "Allow customers to upload ID; staff review in CRM."

- In Expense Management, MVP might be "Submit and approve claims — no mobile app yet."

- In Inventory Management, MVP might be "Enable low-stock alerts — full reporting comes later."

Design creates the big picture, and MVP slices it into a first release that delivers immediate value.

**The BA's Role**

In this stage, your role is to:

- Carry forward the why behind the preferred solution.

- Facilitate design workshops and ensure requirements are reflected.

- Capture detailed business rules and exceptions.

- Protect the scope by reminding the team what was agreed.

- Prepare the ground for MVP by highlighting essential vs optional features.

In summary, Design is the stage where the preferred solution takes shape. As a BA, you ensure the design reflects business needs, captures exceptions, and prepares the team for MVP scoping. Without this step, delivery risks being misaligned, incomplete, or focused on the wrong priorities.`
    },
    {
      id: 'lesson-5',
      title: 'The Three Amigos',
      content: `In Agile delivery, there's also the Three Amigos model:

**The BA** – representing business value and clarity.

**The Developer/Tech Lead** – representing technical feasibility.

**The Tester/QA** – representing quality and testability.

Together, the Three Amigos make sure requirements and solutions are shaped from three angles at once: value, feasibility, and testability. This collaboration is a practical way of validating solution options before delivery even begins.`
    },
    {
      id: 'lesson-6',
      title: 'The BA\'s Responsibility',
      content: `Your responsibility in solutioning is to:

**Facilitate structured discussions** on options.

**Ensure options don't drift away** from the real problem.

**Capture trade-offs** (cost, feasibility, risk, value).

**Help stakeholders compare choices** fairly.

You are not there to pick the solution — but to make sure the process of choosing is clear, balanced, and aligned to the project goals.

In summary, solution options are the bridge between problem and design. They involve exploring multiple ways forward, guided by collaboration between business, technical, and quality perspectives. As a BA, your role is to structure these conversations, keep them tied to the problem, and record the options so the team can move forward with confidence.`
    }
  ];

  if (currentPage === 'overview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero */}
        <div className="relative bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10" />
          <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">📖 Solution Options</h1>
              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
                From problem to possible solutions — this is where the BA helps shape the way forward.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Intro Narrative */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              After elicitation, once the problem is clear and both the current (As-Is) and future (To-Be) states are understood,
              the next step is to explore how the problem could be solved. This hub is about generating and evaluating possible
              solution options. As a BA, you don't invent solutions in isolation — you facilitate conversations, capture trade-offs,
              and ensure options are tied to business needs. In real projects, you'll work closely with Solution Architects,
              Tech Leads, and Testers to shape solutions that are realistic, valuable, and testable.
            </p>
          </div>

          {/* What You'll Explore */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What You'll Explore Here</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">What Are Solution Options?</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Understanding the bridge between problem analysis and solution design.
                </p>
              </div>

              <div className="rounded-xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Evaluating Options</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Structured criteria for comparing different solution approaches.
                </p>
              </div>

              <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Types of Solutions</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  From process improvements to new systems - understanding all options.
                </p>
              </div>

              <div className="rounded-xl p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">The BA's Role</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Facilitating structured discussions and keeping options grounded in business value.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-center shadow-md">
            <p className="text-white/90 mb-4 text-lg">
              Ready to dive deep into solution options? Explore the detailed lessons below.
            </p>
            <button
              onClick={() => setCurrentPage('lessons')}
              className="inline-flex items-center px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-white/90 transition-all"
            >
              Explore Solution Options Lessons <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">📖 Solution Options</h1>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
              Detailed lessons on exploring and evaluating solution options.
            </p>
            <button
              onClick={() => setCurrentPage('overview')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabbed Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === index
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {lesson.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                {lessons[activeTab].title}
              </h2>
              <div className="prose prose-lg max-w-none">
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lessons[activeTab].content.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={index} className="font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                    } else if (line.startsWith('- ')) {
                      return (
                        <div key={index} className="ml-4 mb-1">
                          • {line.substring(2)}
                        </div>
                      );
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      return (
                        <div key={index} className="mb-2">
                          {line}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SolutionOptions;