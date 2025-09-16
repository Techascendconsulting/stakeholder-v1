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
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-4',
      title: 'Business Rules & Edge Cases',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-5',
      title: 'System Integration Design',
      content: `Content coming soon...`,
      image: '/images/design-placeholder.png'
    },
    {
      id: 'lesson-6',
      title: 'Preparing for MVP',
      content: `Content coming soon...`,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => setActiveTab(index)}
              className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                activeTab === index ? 'scale-110 ring-4 ring-purple-400 ring-opacity-50' : ''
              }`}
            >
              {/* Design Project Card */}
              <div className={`relative h-64 rounded-3xl overflow-hidden shadow-2xl ${
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
                <div className="relative h-full flex flex-col justify-between p-6 text-white">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        {index === 0 && <PenTool className="w-6 h-6" />}
                        {index === 1 && <Layers className="w-6 h-6" />}
                        {index === 2 && <Eye className="w-6 h-6" />}
                        {index === 3 && <Code className="w-6 h-6" />}
                        {index === 4 && <Zap className="w-6 h-6" />}
                        {index === 5 && <Sparkles className="w-6 h-6" />}
                      </div>
                      <div className="text-2xl font-black opacity-60">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 leading-tight">
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
                <div className="max-w-none">
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
                      
                      // Handle bullet points
                      if (paragraph.includes('- ')) {
                        const lines = paragraph.split('\n').filter(line => line.trim() !== '');
                        const bulletLines = lines.filter(line => line.startsWith('- '));
                        return (
                          <div key={index} className="space-y-3 mb-6">
                            {bulletLines.map((line, lineIndex) => (
                              <div key={lineIndex} className="flex items-start gap-4">
                                <div className={`w-8 h-8 bg-gradient-to-r ${
                                  activeTab === 0 ? 'from-blue-500 to-purple-600' :
                                  activeTab === 1 ? 'from-purple-500 to-pink-600' :
                                  activeTab === 2 ? 'from-pink-500 to-red-600' :
                                  activeTab === 3 ? 'from-red-500 to-orange-600' :
                                  activeTab === 4 ? 'from-orange-500 to-yellow-600' :
                                  'from-yellow-500 to-green-600'
                                } rounded-full flex items-center justify-center flex-shrink-0`}>
                                  <span className="text-white font-bold text-sm">{lineIndex + 1}</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-200">
                                  {line.substring(2)}
                                </p>
                              </div>
                            ))}
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignHub;