import React from 'react';
import { BookOpen, Target, Users, CheckCircle, Lightbulb, ArrowRight, Star, Zap, Award, FileText } from 'lucide-react';

interface TeachingStep {
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const teachingSteps: TeachingStep[] = [
  {
    title: 'What is Requirements Documentation?',
    content: `Requirements documentation is the foundation of every successful project. It's how you capture, organize, and communicate what needs to be built in a way that developers can understand, testers can verify, and stakeholders can approve.

Think of it as the blueprint for your project. Without clear requirements documentation, you're essentially asking a construction team to build a house without any plans. The result? Miscommunication, rework, delays, and frustrated stakeholders.

**Why Requirements Documentation Matters:**

As a Business Analyst, you're the bridge between business needs and technical solutions. Your documentation is what transforms vague business ideas into concrete, buildable features. It's your responsibility to ensure that:

• **Stakeholders know exactly what they're getting** - No surprises, no scope creep
• **Developers have clear instructions** - They know what to build and how to test it
• **Testers can verify functionality** - They have clear criteria for what "done" looks like
• **Project managers can track progress** - They can see what's complete and what's pending

**The Challenge You Face:**

Stakeholders rarely come to you with perfectly written requirements. Instead, you'll hear things like:
• "We need a better user experience"
• "The system should be faster"
• "We want to improve customer satisfaction"

Your job is to take these high-level statements and break them down into specific, testable requirements that your development team can actually build.

**This is where user stories become your most powerful tool.**`,
    icon: <FileText className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: 'Understanding Epics: The Big Picture',
    content: `Before diving into individual user stories, you need to understand epics - the high-level containers that organize your requirements into meaningful business capabilities.

**What is an Epic?**

An epic is a large user story that represents a significant business capability or feature area. Think of it as a theme or initiative that contains multiple smaller user stories. Epics help you organize and prioritize work at a strategic level before breaking it down into actionable pieces.

**Why Epics Matter for Business Analysts:**

Epics serve several critical purposes in requirements documentation:

• **Strategic Alignment**: They connect individual features to business objectives
• **Scope Management**: They help you understand the full scope of a capability before diving into details
• **Stakeholder Communication**: They provide a high-level view that executives and business stakeholders can easily understand
• **Release Planning**: They help you plan which capabilities to deliver in which release
• **Team Organization**: They allow different teams to work on different aspects of the same business capability

**Real-World Epic Examples:**

**E-commerce Platform Epic:**
"Customer Account Management" - This epic might contain stories about:
- User registration and login
- Profile management
- Password reset functionality
- Account security settings
- Order history viewing

**Healthcare System Epic:**
"Patient Appointment Scheduling" - This epic might include:
- Appointment booking
- Calendar integration
- Reminder notifications
- Cancellation and rescheduling
- Provider availability management

**Banking Application Epic:**
"Mobile Payment Processing" - This epic could encompass:
- Payment initiation
- Security verification
- Transaction confirmation
- Payment history
- Fraud detection alerts

**How Epics Relate to User Stories:**

Epics are the "parent" containers that hold multiple user stories. Each epic represents a complete business capability, while user stories represent specific functionality within that capability.

**The Epic-to-Story Breakdown Process:**

1. **Start with Business Value**: What major business capability does this epic deliver?
2. **Identify User Types**: Who are the different users who will interact with this capability?
3. **Define User Journeys**: What are the key workflows within this capability?
4. **Break into Stories**: Each workflow becomes one or more user stories
5. **Prioritize Stories**: Which stories are most critical to the epic's success?

**Epic Benefits for Your BA Work:**

• **Better Requirements Organization**: Instead of a flat list of 50 stories, you have 5-7 epics with 5-10 stories each
• **Clearer Stakeholder Discussions**: You can discuss "Customer Account Management" as a concept before diving into login details
• **Improved Release Planning**: You can plan to deliver entire epics in specific releases
• **Enhanced Traceability**: You can trace business objectives → epics → stories → acceptance criteria
• **Better Scope Management**: When stakeholders want to add features, you can see which epic they belong to

**Common Epic Mistakes to Avoid:**

• **Too Technical**: "Database Optimization" is a technical task, not a business epic
• **Too Small**: "User Login" is a story, not an epic
• **Too Vague**: "System Improvement" doesn't provide clear business value
• **No User Focus**: Epics should always be about what users can do, not what the system does

**Epic Best Practices:**

• **Name from User Perspective**: "Customer Self-Service" not "Customer Portal Development"
• **Include Business Value**: Each epic should deliver measurable business outcomes
• **Size Appropriately**: An epic should take 3-6 months to complete all stories
• **Clear Boundaries**: Each epic should be independent and deliverable
• **Stakeholder Ownership**: Each epic should have a clear business owner

**The Epic-Story-AC Hierarchy:**

```
Epic: Customer Account Management
├── Story: As a customer, I want to register for an account so I can access personalized features
│   └── AC: Registration form validation, email confirmation, account activation
├── Story: As a customer, I want to log in securely so I can access my account
│   └── AC: Username/password validation, security measures, session management
└── Story: As a customer, I want to update my profile so I can keep my information current
    └── AC: Profile editing, data validation, change confirmation
```

This hierarchy makes it easy to understand how individual stories contribute to larger business capabilities, making your requirements documentation more strategic and easier to manage.`,
    icon: <Star className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    title: 'User Stories',
    content: `How to Write User Stories and Acceptance Criteria That Actually Get Built

When you walk into sprint planning and someone asks, "What exactly are we building?" your story should speak for itself. It should describe value clearly, for one person, in one moment — and it should never need a follow-up meeting to explain.

A user story is a short, simple promise of value from the user's perspective. It's not a spec, not a task list, and definitely not a design. It's a clear expression of who wants what, and why. As a Business Analyst, writing user stories well is how you make sure what gets delivered is aligned to the need. And it's how you keep Agile projects flowing.

**The Power of User Stories:**

User stories transform abstract business requirements into concrete, actionable items. They force you to think from the user's perspective, ensuring that every feature you document delivers real value to real people.

Instead of writing "The system shall have a login function," you write "As a returning customer, I want to log in with my email and password so I can access my account and previous orders."

See the difference? The second version tells you exactly who benefits, what they get, and why it matters to them.`,
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    title: 'What Is a User Story?',
    content: `A user story is a small chunk of work that delivers something meaningful to the user. In Agile, it represents a slice of value that a developer can build and a tester can verify. In Waterfall, stories often sit below larger functional requirements as detailed tasks or testable behaviours.

**The classic format is:**

As a [type of user]
I want to [do something]
So that [I get a benefit]

**Example (Agile eCommerce project)**
As a returning shopper, I want to reuse my saved address so I can check out faster without retyping it.

**Example (Waterfall HR system project)**
As an HR admin, I want to export payroll data to Excel so I can process monthly salaries.`,
    icon: <Users className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    title: 'INVEST: The 6 Criteria for a Strong User Story',
    content: `A well-written story passes the INVEST test. This checklist helps ensure that your story is worth writing and delivering. These aren't just abstract principles; they are what make stories actually buildable and testable in the real world.

**Let's break them down with examples:**

**I = Independent**
The story can be delivered on its own without relying on other stories.
Instead of: "As a customer, I want to track my order so I can know its status" (which depends on having order history first)
Try: "As a customer, I want to view my recent order confirmation so I can keep a record of what I purchased."

**N = Negotiable**
It isn't set in stone. The story is a conversation starter, not a fixed contract.
Example: A BA might write the story, but developers can suggest whether it's better to use a banner or a modal for an alert.

**V = Valuable**
The user or business gets a visible benefit.
If the story is only for code cleanup or API changes with no user impact, it might be a task, not a user story.
Good: "As a tenant, I want to download my rent receipts so I can track my payments."

**E = Estimable**
The team can size it because the scope is clear.
If devs say, "We can't estimate this yet," the story may be missing rules, formats, or decisions.
Fix: Add acceptance criteria or stakeholder clarifications.

**S = Small**
It fits within a sprint. If the AC looks like a full spec, split it.
Big: "As a user, I want a full dashboard with analytics, trends, downloads, sharing, and email alerts."
Small slice: "As a user, I want to see my daily usage in a line chart so I can track activity trends."

**T = Testable**
You can verify it through clear outcomes.
Weak: "The system should be fast."
Better: "After clicking 'Submit', I receive a confirmation within 5 seconds."

You can use INVEST to review each story before putting it into Jira, or even to improve stories written by someone else. If any part of INVEST fails, clarify with the stakeholder or split the story.`,
    icon: <Target className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    title: 'How It Fits in Agile and Scrum',
    content: `In Agile (especially Scrum), user stories live on the Product Backlog. During Refinement, they are discussed and shaped. During Sprint Planning, developers commit to delivering them. And during the Sprint Review, they demo the story to prove it's done.

**The Business Analyst helps:**
• Shape the story to be testable and small enough to deliver
• Clarify the purpose of the story
• Write or support the creation of acceptance criteria
• Ensure the story aligns with business needs and sprint goals

**How It Fits in Waterfall**
In a Waterfall environment, you may not use the word "user story", but you will still:
• Capture what users want to do (scenarios or functional requirements)
• Break requirements down into testable conditions
• Ensure each requirement delivers a specific business outcome
• You can still apply user story thinking to break up long documents into manageable, verifiable chunks.

**Where Does Jira Come In?**
In most companies using Agile, user stories are written directly in Jira. Each Jira story includes:
• The story title and description (your "As a..., I want..., so that..." format)
• Acceptance criteria (how we know it's done)
• Tags (like "Frontend", "Backend", "API")
• Story points (to estimate complexity)
• Status (To Do, In Progress, In Review, Done, etc.)

**BAs often:**
• Draft stories and review them with the team
• Add attachments (flows, mockups, requirements docs)
• Link stories to Epics and Features
• Ensure all acceptance criteria are visible and agreed`,
    icon: <Zap className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    title: 'What Are Acceptance Criteria?',
    content: `Acceptance criteria (AC) are the conditions that must be true for a story to be accepted as complete. They turn vague ideas into checkable statements.

Think of AC like the referee's rulebook. They help developers know what to build and testers know what to verify.

**Format:**
AC are usually written as simple, user-facing behaviours:
• If I do X, I see Y
• If input is invalid, I get an error message
• When I complete the process, I receive confirmation

**Example:**
Story: As a tenant, I want to upload a photo when reporting an issue so the housing team can understand the problem.

**Acceptance Criteria:**
• I can upload one or more image files (.jpg, .png)
• If the file is too large (over 5MB), I see an error message
• Upload is optional; I can still submit without a photo
• After upload, the image preview is shown on the form`,
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    title: 'More Worked Examples',
    content: `**Example 1: Healthcare Portal (Doctor Appointments)**

Story: As a patient, I want to book an appointment with my GP online so I don't have to call the clinic.

**Acceptance Criteria:**
• I can view available slots for the selected GP
• I can choose a date and time and receive confirmation
• If no slots are available, I see an appropriate message
• I can cancel or reschedule from the booking summary
• If I double-book, I receive a warning and cannot proceed

**Why it matters:** This prevents unnecessary calls, reduces wait time, and improves user experience. Each AC ties directly to real-world frustrations.

**Example 2: Banking App (Mobile Notifications)**

Story: As a customer, I want to receive a push notification after each transaction so I can monitor my account activity in real time.

**Acceptance Criteria:**
• After any debit or credit, I receive a push notification within 10 seconds
• The notification includes the amount, merchant name, and remaining balance
• If notifications are disabled in settings, none are sent
• If network is offline, the notification is sent when back online
• If multiple transactions occur at once, I receive a summary alert

**Why it matters:** These ACs make sure the feature is reliable, timely, and respects user preferences — all while being testable.`,
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  }
];

interface TeachingLayerProps {
  onStartPractice: () => void;
}

export default function TeachingLayer({ onStartPractice }: TeachingLayerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Requirements Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Master the art of documenting requirements through user stories and acceptance criteria that actually get built
        </p>
        
        {/* Hero Image */}
        <div className="max-w-4xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&auto=format&q=80" 
            alt="Business analyst documenting requirements" 
            className="w-full h-64 object-cover rounded-2xl shadow-lg"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Business analyst documenting requirements and user stories</p>
        </div>
      </div>

      <div className="space-y-8">
        {teachingSteps.map((step, index) => (
          <div
            key={index}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative p-8">
              {/* Header with icon */}
              <div className="flex items-start space-x-4 mb-6">
                <div className={`flex-shrink-0 w-12 h-12 ${step.bgColor} rounded-xl flex items-center justify-center ${step.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                    {step.title}
                  </h2>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {/* Add Scrum.org-style images for Agile and Scrum section */}
                {index === 3 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <img 
                          src="https://images.pexels.com/photos/4623478/pexels-photo-4623478.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop" 
                          alt="Scrum team planning session" 
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Scrum Team Planning Session</p>
                      </div>
                      <div>
                        <img 
                          src="https://images.pexels.com/photos/1181615/pexels-photo-1181615.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop" 
                          alt="Jira dashboard interface" 
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">User Story Decomposition</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div 
                  className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base"
                  dangerouslySetInnerHTML={{
                    __html: step.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-4 shadow-lg">
            <ArrowRight className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ready for Walkthrough?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Apply what you've learned with interactive scenarios and get real-time feedback from AI stakeholders.
          </p>
          <button 
            onClick={onStartPractice}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <span>Start Walkthrough</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}