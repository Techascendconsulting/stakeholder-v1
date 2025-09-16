import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PenTool, ArrowRight, Palette, Layers, Eye, Code, Zap, Sparkles } from 'lucide-react';

const DesignHub: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentPage, setCurrentPage] = useState<'overview' | 'lessons'>('overview');
  const [activeTab, setActiveTab] = useState(0);

  const lessons = [
    {
      id: 'lesson-1',
      title: 'What Happens in Design?',
      content: `Once a preferred solution has been chosen, the project enters the Design stage. This is the moment when ideas and decisions begin to turn into something tangible. The purpose of design is not to decorate wireframes or choose colours. It is to shape the chosen solution into enough detail so that delivery teams, testers, and stakeholders all share the same picture of how it will work.

As a Business Analyst, you are not expected to create designs yourself, but you play a central role in ensuring that what is designed reflects the business needs, requirements, and scope that have been agreed.

**Not All Design Looks the Same**

One of the first things you will notice as a BA is that design work varies depending on the type of project:

**New UX/UI Design Projects**

These are projects where new screens, workflows, or user journeys are needed.

For example, an Expense Management project might require new forms where employees submit and track claims.

A Customer Identity Verification project may need a new "Upload ID" screen with built-in error handling.

In these projects, UX/UI designers create mock-ups and wireframes, and your role is to check that every detail aligns with the requirements captured earlier.

**Existing Platform Projects**

Many projects are built on tools like Salesforce, SAP, or SaaS platforms where the design is already provided.

In these cases, the focus is not on creating a new UI but on configuring what exists.

Your job is to confirm that the platform can handle the To-Be process, add new fields or workflows if needed, and ensure users know how the system will be used.

This distinction is important: not every BA project involves sitting with designers to review wireframes. Sometimes your design role is all about process mapping and configuration rules, rather than UI sketches.

**Why Design Is Critical**

Even when a solution has been chosen, it is still abstract. "Enhance the CRM" or "Use Salesforce" does not tell anyone how the system will behave or what users will need to do differently. Design creates the bridge:

- It shows how the process will change.

- It confirms what the system will do and what the user will see.

- It highlights edge cases and exceptions before delivery begins.

Without this stage, teams risk rushing into development with assumptions, leading to rework and wasted effort.

**Real-Life Examples**

**Example 1: Expense Management**
The business agrees to enhance its finance system with a new expense module.

The UX designer creates wireframes for the claim submission screen.

The BA checks that rules such as "Receipts must be submitted within 30 days" are reflected.

The Tester raises questions about how the system should handle claims in foreign currency.

Here, the BA ensures the design reflects both requirements and real-world exceptions.

**Example 2: Salesforce Case Management**
The business agrees to use Salesforce's built-in case management module.

No new UI is required — Salesforce already has forms and dashboards.

The BA works with the Salesforce admin to configure fields like "Case Priority" and "Regulatory Tag."

The BA documents escalation rules, such as "High-priority cases must be resolved within 2 hours."

Here, the BA focuses less on UX design and more on aligning the existing platform to business rules.

**The BA's Role**

During design, your responsibilities include:

- Carrying forward the context of why the preferred solution was chosen.

- Facilitating workshops where design is validated against requirements.

- Working with UX/UI designers when new screens are needed, or with platform owners when configuring existing tools.

- Capturing detailed business rules, exceptions, and future processes.

- Protecting the scope so that design doesn't drift beyond agreed requirements.

- Linking design to delivery: Once a design is signed off, you attach it to the relevant user stories in Jira (or another backlog tool).

Frontend developers use it for visuals and behaviour.

Backend developers use it to understand the data and logic behind the screens.

Testers use it to prepare test cases and confirm the system behaves as intended.

This step ensures nobody builds from assumptions — the design becomes a shared reference point across the team.

In summary, Design is where a preferred solution is shaped into something concrete. Sometimes this means reviewing wireframes, other times it means confirming platform configurations. Either way, the BA ensures the design reflects business requirements and becomes the foundation for user stories, estimations, and delivery.

👉 Next, in Lesson 2: To-Be Process Mapping, we'll look at how BAs guide stakeholders through defining the future process — one of the most common and valuable contributions you'll make during design.`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-2',
      title: 'To-Be Process Mapping',
      content: `Once a preferred solution has been chosen, one of the first tasks in design is to define the To-Be process — the way things should work in the future.

For a Business Analyst, this step is both practical and powerful. Stakeholders often know the pain of the current process (the As-Is), but unless the future state is mapped, nobody has a shared understanding of what the solution is meant to achieve. To-Be process mapping transforms ideas into a clear, visual flow that everyone can understand.

**Why To-Be Mapping Matters**

Without a To-Be process, delivery teams are left with assumptions. Developers may build the wrong functionality, testers may miss key scenarios, and business users may imagine outcomes that were never in scope. The To-Be process ensures:

- Everyone knows what steps will change and how.

- The team understands who will be involved at each stage.

- The business is aligned on what outcomes must be achieved.

This doesn't mean the BA creates the process alone. Instead, you facilitate workshops where stakeholders, architects, and sometimes UX designers come together to shape the process collaboratively.

**How It Works in Practice**

A typical session might begin with the As-Is process map on the wall. The BA asks:

"Here's how things work today. With the new solution we agreed, what will change? What steps will be removed? What new steps appear? Who will handle them?"

Together, the group maps out the future state. Tools vary — sometimes it's sticky notes and whiteboards, other times BPMN diagrams or digital tools like Lucidchart. What matters is clarity. Anyone should be able to look at the To-Be map and understand how the future process will operate.

**Real-Life Example: Customer Identity Verification**

**As-Is:** Customers email scanned IDs to a generic inbox. Staff manually review them.

**To-Be:**

- Customers upload IDs directly in the CRM.

- The system checks document type validity through an API.

- Staff review only flagged or rejected cases.

- The system updates customer status automatically when IDs are valid.

This To-Be map reduces manual effort and introduces automation, aligning directly with the project's goal of reducing fraud and improving efficiency.

**Real-Life Example: Expense Management**

**As-Is:** Employees email Excel spreadsheets to managers, who forward them to finance. Errors and delays are common.

**To-Be:**

- Employees submit expenses directly in the finance system.

- Managers receive automated approval notifications.

- The system blocks claims missing receipts or exceeding limits.

- Finance validates only approved claims and pushes them to payroll.

The BA ensures that rules like "Claims must be submitted within 30 days" and "Receipts are mandatory" are included in the future process.

**Real-Life Example: Inventory Management**

**As-Is:** Warehouse staff conduct weekly manual stock counts. Stockouts are frequent.

**To-Be:**

- Staff scan items using handheld devices.

- The system updates stock levels in real time.

- Automated low-stock alerts trigger replenishment.

- Managers review dashboards showing live inventory levels.

The To-Be process gives visibility and reduces costly shortages, directly linking back to the business case.

**The BA's Role**

In To-Be process mapping, you:

- Facilitate workshops where the group co-creates the future process.

- Align requirements and scope with the agreed solution.

- Document business rules and exceptions alongside the map. For example: "If a customer fails three ID uploads, route case to manual review."

- Link processes to user stories so backlog items clearly show how they support the To-Be state.

**Preparing for MVP**

Once the To-Be process is mapped, it becomes easier to decide what's essential for the first release versus what can wait.

For Identity Verification, MVP might be "Upload ID + manual staff review" before adding API automation.

For Expense Management, MVP might be "Submit and approve claims" before rolling out mobile scanning.

For Inventory, MVP might be "Low-stock alerts" before building full dashboards.

This is where the To-Be process naturally feeds into MVP scoping.

In summary, To-Be process mapping is one of the BA's most valuable contributions in design. You don't invent the process alone — you help the business and technical teams visualise it, capture rules and exceptions, and prepare the ground for incremental delivery. Without it, delivery risks being misaligned and incomplete.

👉 Next, in Lesson 3: Wireframes and Prototypes, we'll look at how visual mock-ups and design sketches are used alongside process maps to help stakeholders and developers picture the future solution in detail.`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-3',
      title: 'Wireframes & Prototypes',
      content: `While process maps show how the future solution will flow, they don't show what the user will actually see. That's where wireframes and prototypes come in.

For many projects, this is the first time stakeholders can visualise the solution. Screens, forms, and interactions suddenly stop being abstract discussions and start becoming concrete. As a BA, you don't design the screens yourself, but you play a key role in reviewing them, linking them back to requirements, and making sure stakeholders agree on what's being proposed.

**Wireframes vs. Prototypes**

Wireframes are low-fidelity sketches of a screen or user journey. They show layout and functionality without colours or branding.

Prototypes are interactive models. They allow stakeholders to click through flows, simulating what the final product will feel like.

Both are tools for communication. They help uncover misunderstandings early, before development starts.

**Why They Matter**

Even when requirements are well documented, people interpret them differently. A stakeholder might imagine a drop-down, while a developer imagines a text box. Wireframes and prototypes remove that ambiguity. They:

- Align everyone on how the system should behave.

- Provide a concrete reference for developers and testers.

- Reduce costly rework by uncovering mismatches before build.

**Real-Life Example: Customer Identity Verification**

The design team produces a wireframe for an "Upload ID" screen.

The BA checks that the fields match requirements: ID type, file upload, expiry date.

The BA confirms that error handling is visible — "If file type is invalid, display message X."

The prototype lets stakeholders click through: upload → confirmation → error handling.

Here, the BA ensures rules captured earlier appear in the design. For example, if stakeholders said only passports and licences are allowed, the wireframe must not include "Student ID."

**Real-Life Example: Expense Management**

A prototype shows the expense submission journey.

Employees add a claim, upload a receipt, and select category.

Managers see a review screen with approve/reject buttons.

Finance sees a consolidated dashboard.

The BA checks this flow against business rules:

- "Receipts are mandatory."

- "Claims over £1000 need two approvals."

- "Foreign currency entries must capture exchange rate."

Stakeholders click through the prototype, often spotting gaps they hadn't thought of during workshops.

**When Wireframes Aren't Needed**

Not every project requires UX/UI design. For example:

In Salesforce or SAP projects, the UI is predefined.

Instead of wireframes, the BA works with platform owners to configure existing screens and workflows.

In this case, design discussions focus more on fields, reports, and automation rules than on screen sketches.

Recognising this distinction is important: the BA adapts to the project context.

**The BA's Role**

In wireframe and prototype stages, you:

- Ensure designs reflect the requirements and business rules.

- Facilitate feedback sessions with stakeholders, documenting changes.

- Link finalised wireframes/prototypes to user stories in Jira or Azure DevOps.

- Use them as part of backlog grooming — developers can size stories more accurately when designs are attached.

- Help testers use designs to prepare realistic test scenarios.

In summary, wireframes and prototypes transform requirements into something stakeholders and delivery teams can see, click, and understand. As a BA, you are the bridge between design artefacts and business needs — making sure what's drawn or prototyped truly reflects what was agreed.

👉 Next, in Lesson 4: Business Rules and Edge Cases, we'll explore how BAs capture the details that often trip teams up — the "what ifs" that make or break a solution in real-world use.`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-4',
      title: 'Business Rules & Edge Cases',
      content: `When you're working in the design stage, it's easy for everyone to focus on the "happy path" — the ideal flow where everything goes right. But in real life, users make mistakes, data is incomplete, and processes don't always run smoothly. This is why capturing business rules and edge cases is so important.

As a BA, you're not just there to confirm the straightforward flow. Your job is to make sure the solution can handle the messy, imperfect, but inevitable scenarios that happen in day-to-day operations.

**What Are Business Rules?**

Business rules are the conditions and constraints that must always be followed. They are non-negotiable, agreed rules of the business.

Examples:

- "Receipts must be submitted within 30 days."

- "Customer ID must not be expired at the time of upload."

- "High-priority cases must be escalated within 2 hours."

These rules need to be clearly defined, documented, and reflected in the design.

**What Are Edge Cases?**

Edge cases are the unusual, less common scenarios that still need to be considered. They don't happen often, but when they do, they can cause major issues if the system doesn't handle them.

Examples:

- What happens if a customer uploads a blurry photo?

- What happens if an employee submits an expense in a currency the system doesn't recognise?

- What happens if a warehouse scanner goes offline mid-shift?

By thinking about these scenarios early, you help prevent costly fixes later.

**Real-Life Example: Customer Identity Verification**

During workshops, the "Upload ID" design looks simple enough — but the BA digs deeper:

Business rule: Only passports and driving licences are accepted.

Edge case: What happens if someone tries to upload a student ID?

Business rule: Expired IDs cannot be accepted.

Edge case: What if the system can't detect expiry dates? Who reviews manually?

Capturing these rules ensures developers know what validation to build and testers know what to check.

**Real-Life Example: Expense Management**

The "Submit Expense" prototype is reviewed. The BA checks:

Business rule: Claims over £1000 need two levels of approval.

Business rule: Receipts are mandatory for all claims.

Edge case: What if a user uploads the same receipt twice?

Edge case: What if a claim is submitted after the employee has left the company?

Here, the BA ensures exceptions are not overlooked — because these are the very situations that cause disputes in finance teams.

**The BA's Role**

When it comes to rules and edge cases, your role is to:

- Facilitate discussions that go beyond the happy path.

- Document rules in plain, unambiguous language.

- Record edge cases and ensure designs show how they'll be handled.

- Attach these rules and scenarios to user stories, so developers and testers build with them in mind.

- Validate with stakeholders: "Is this the correct way the system should behave if this happens?"

**Why This Matters**

Skipping rules and edge cases often leads to gaps in scope. Stakeholders assume they're covered, but developers may never have been told. When the system goes live, these are the scenarios that cause frustration — and sometimes project failure.

By capturing them early, you reduce rework, improve quality, and protect the project from unpleasant surprises.

In summary, business rules and edge cases turn an ideal design into a realistic one. As a BA, you make sure the design doesn't just show what happens when everything goes right, but also how the system and process will behave when things go wrong.

👉 Next, in Lesson 5: Linking Design to User Stories, we'll look at how the BA takes everything captured in design — processes, wireframes, rules — and attaches them directly to backlog items so development is aligned and delivery teams have a complete picture.`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-5',
      title: 'Linking Design to User Stories',
      content: `By the time designs are signed off — whether they are process maps, wireframes, prototypes, or configuration rules — the BA's work is not finished. In fact, this is the point where design becomes most valuable: it must now feed directly into delivery.

This happens through user stories. Every story written for the backlog should carry the design context with it. Without this, developers and testers are forced to guess what the screen, process, or interaction should look like. That guesswork is where misunderstandings, delays, and rework creep in.

**Why Designs Must Be Attached**

Delivery teams don't just need words. They need visuals, rules, and flows that bring those words to life. Attaching designs to user stories ensures:

- Frontend developers understand exactly what the screen should look like and how it should behave.

- Backend developers see the data fields, rules, and integrations that drive that screen.

- Testers can prepare test cases that confirm the built system matches the signed-off design.

This alignment saves time, improves estimation, and reduces costly rework.

**Real-Life Example: Expense Management**

The design team has produced a prototype for the expense claim form.

The BA writes a user story:
"As an employee, I want to submit an expense with a receipt so that I can be reimbursed quickly."

The prototype is attached to the story.

Acceptance criteria specify the business rules: receipts are mandatory, claims over £1000 need 2 approvals, and submissions must be within 30 days.

When developers open the story, they see not only the words but the visual prototype. They build with full confidence in what's expected.

**Real-Life Example: Identity Verification**

The design includes a wireframe of the "Upload ID" page.

The BA writes a user story:
"As a customer, I want to upload my ID document so that my account can be verified securely."

The wireframe is attached to the story.

Edge cases are covered in the acceptance criteria: invalid file types, expired IDs, and repeated upload failures.

Developers and testers can see exactly what to implement and validate — no guesswork.

**The BA's Role**

At this stage, your responsibilities are to:

- Write clear user stories that capture requirements in simple, testable language.

- Attach designs (process maps, wireframes, configuration notes) to each story in Jira, Azure DevOps, or whichever tool the team uses.

- Check traceability — each requirement and design element is linked to at least one story.

- Support estimation — developers can size work more accurately when designs are visible.

- Protect alignment — ensuring the backlog reflects the signed-off scope, not someone's assumption.

In summary, linking design to user stories is how you ensure the work done in design doesn't sit in a folder and gather dust. It becomes a living reference point for developers and testers, reducing misunderstandings and keeping delivery aligned with the business need.

👉 This completes the Design Hub. From here, the natural next step is the MVP Hub, where you'll learn how to take the full design picture and slice it into the smallest, most valuable release that can be built first.

**Ready to continue your journey?**`,
      image: '/images/design-placeholder.png'
    }
  ];

  // Skip the overview page entirely - go straight to lessons
  if (currentPage === 'overview') {
    setCurrentPage('lessons');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-fuchsia-900/20">
      {/* Creative Studio Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <Palette className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
              Design Studio
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Visual examples of how solutions take shape in practice
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Design Portfolio Grid - Completely Different Approach */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => setActiveTab(index)}
              className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                activeTab === index ? 'scale-110 ring-4 ring-purple-400 ring-opacity-50' : ''
              }`}
            >
              {/* Design Project Card */}
              <div className={`relative h-48 rounded-3xl overflow-hidden shadow-2xl ${
                activeTab === index ? 'shadow-purple-500/25 shadow-2xl' : ''
              }`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  index === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                  index === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                  index === 2 ? 'bg-gradient-to-br from-pink-500 to-red-600' :
                  index === 3 ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                  index === 4 ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                  'bg-gradient-to-br from-yellow-500 to-green-600'
                }`}></div>
                
                {/* Overlay Pattern */}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full blur-lg"></div>
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-4 text-white">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        {index === 0 && <PenTool className="w-5 h-5" />}
                        {index === 1 && <Layers className="w-5 h-5" />}
                        {index === 2 && <Eye className="w-5 h-5" />}
                        {index === 3 && <Code className="w-5 h-5" />}
                        {index === 4 && <Zap className="w-5 h-5" />}
                        {index === 5 && <Sparkles className="w-5 h-5" />}
                      </div>
                      <div className="text-xl font-black opacity-60">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 leading-tight">
                      {lesson.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-80">
                      {activeTab === index ? 'SELECTED' : (
                        index === 0 ? 'Foundation' :
                        index === 1 ? 'Process' :
                        index === 2 ? 'Visual' :
                        index === 3 ? 'Logic' :
                        index === 4 ? 'Integration' :
                        'Delivery'
                      )}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeTab === index ? 'bg-white text-gray-900' : 'bg-white/20'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Lesson Content - Simple and Clean */}
        {activeTab !== null && (
          <div className="mt-8">
            <div className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${
                activeTab === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                activeTab === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                activeTab === 2 ? 'bg-gradient-to-r from-pink-500 to-red-600' :
                activeTab === 3 ? 'bg-gradient-to-r from-red-500 to-orange-600' :
                activeTab === 4 ? 'bg-gradient-to-r from-orange-500 to-yellow-600' :
                'bg-gradient-to-r from-yellow-500 to-green-600'
              }`}>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    {activeTab === 0 && <PenTool className="w-6 h-6 text-white" />}
                    {activeTab === 1 && <Layers className="w-6 h-6 text-white" />}
                    {activeTab === 2 && <Eye className="w-6 h-6 text-white" />}
                    {activeTab === 3 && <Code className="w-6 h-6 text-white" />}
                    {activeTab === 4 && <Zap className="w-6 h-6 text-white" />}
                    {activeTab === 5 && <Sparkles className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {lessons[activeTab].title}
                    </h2>
                    <p className="text-white/80">
                      Lesson {activeTab + 1} of {lessons.length}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div 
                className="p-8"
                style={{
                  background: activeTab === 0 ? 'linear-gradient(135deg, #dbeafe 0%, #e9d5ff 100%)' :
                             activeTab === 1 ? 'linear-gradient(135deg, #e9d5ff 0%, #fce7f3 100%)' :
                             activeTab === 2 ? 'linear-gradient(135deg, #fce7f3 0%, #fee2e2 100%)' :
                             activeTab === 3 ? 'linear-gradient(135deg, #fee2e2 0%, #fed7aa 100%)' :
                             activeTab === 4 ? 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)' :
                             'linear-gradient(135deg, #fef3c7 0%, #dcfce7 100%)'
                }}
              >
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {lessons[activeTab].content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    // Handle headings
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    
                    // Handle bold text within paragraphs
                    if (paragraph.includes('**')) {
                      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={index} className="text-gray-700 dark:text-gray-200 mb-4">
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={partIndex} className="font-semibold text-gray-900 dark:text-white">
                                  {part.replace(/\*\*/g, '')}
                                </strong>
                              );
                            }
                            return part;
                          })}
                        </p>
                      );
                    }
                    
                    // Handle bullet points
                    if (paragraph.includes('- ')) {
                      const lines = paragraph.split('\n').filter(line => line.trim() !== '');
                      const bulletLines = lines.filter(line => line.startsWith('- '));
                      return (
                        <div key={index} className="ml-6 mb-6">
                          <ul className="space-y-2">
                            {bulletLines.map((line, lineIndex) => {
                              const text = line.substring(2);
                              const parts = text.split(/(\*\*.*?\*\*)/g);
                              return (
                                <li key={lineIndex} className="text-gray-700 dark:text-gray-200 flex items-start">
                                  <span className="text-gray-500 dark:text-gray-400 mr-2">•</span>
                                  <span>
                                    {parts.map((part, partIndex) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return (
                                          <strong key={partIndex} className="font-semibold text-gray-900 dark:text-white">
                                            {part.replace(/\*\*/g, '')}
                                          </strong>
                                        );
                                      }
                                      return part;
                                    })}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-200 mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
                
                {/* MVP Hub Button for Lesson 5 */}
                {activeTab === 4 && (
                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => setCurrentView('mvp-hub')} 
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Go to MVP Hub →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignHub;