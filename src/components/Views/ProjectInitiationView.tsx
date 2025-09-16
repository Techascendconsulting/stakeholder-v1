import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";

const lessons = [
  { 
    id: "day-one", 
    title: "Day One: Induction and Getting Settled",
    content: `When you begin your first role as a Business Analyst, the day does not start with you writing requirements or running workshops. It begins like any other new employee in the organisation — with induction.

On your very first day, the HR or People team usually runs an induction session. This may include setting up your laptop and system access, explaining company policies, and showing you how to use the tools you'll rely on every day such as email, Teams or Slack, and the company intranet. You may also meet other new joiners and be introduced to the organisation's culture, values, and expectations.

Although this feels routine, it is an important step. Without the right access and understanding of company processes, you would not be able to participate effectively in any project. So, part of your responsibility as a BA is to pay attention during this stage, ask for help if something is missing, and make sure you are fully set up to contribute.

After induction, you will usually have an introductory meeting with your line manager or project manager. This is where you first hear about the project you will be joining. At this point, you are not expected to know everything. Instead, your manager will walk you through the basics: the project's name, why it is happening, and what outcomes the business hopes to achieve. Sometimes you will also be given early documents such as a Project Charter, Business Case, or Project Brief, which capture the project's background, objectives, and constraints.

Your role here is to listen and absorb. As a BA, you should start to build an early picture of why this project exists and what business problem it is aiming to solve. At this stage, you are not writing requirements or running meetings. You are reviewing whatever material is available, making notes, and beginning to identify areas you may need to ask more questions about later.

You may also be invited to attend some early planning or alignment meetings. These are not elicitation sessions, but discussions between senior stakeholders, sponsors, and technical leads. In these meetings, your role is to observe, take notes, and begin to notice where your BA skills will add value later.

Finally, even at this early stage, you should begin thinking about stakeholders. You may hear names mentioned repeatedly in meetings or see them listed in documents. A good BA starts keeping track of these names, noting their role and interest in the project. Later, this becomes your formal stakeholder analysis, often mapped on a Power–Interest Grid.

This period between your HR induction and the official project kickoff is about orientation. You are learning how the organisation works, absorbing the business context, and preparing yourself to become an effective part of the project team. By the time you step into the kickoff meeting, you should already understand the project's purpose, have seen some of the key documents, and know who the important stakeholders are.

Project initiation begins here — with you moving from being a new employee to being an active member of a project team, ready to add value as a Business Analyst.`
  },
  { 
    id: "intro-project", 
    title: "Introduction to the Project",
    content: `Once you've completed your induction and settled into the organisation, the next important step in your journey as a Business Analyst is your introduction to the project you will be working on.

This usually comes from your line manager or project manager. In this meeting, their goal is to give you the context you need to understand what the project is about, why it exists, and where it currently stands. Don't worry if everything feels new or overwhelming — at this stage, no one expects you to know the details. Your role is to listen carefully, absorb the information, and begin forming an initial understanding.

You will often be shown or given key documents such as:

Project Charter – a high-level document that sets out the project's purpose, objectives, and boundaries.

Business Case – the justification for the project, including the problem it solves, benefits expected, and sometimes the costs involved.

Project Brief – a summary that outlines what the project is about, the intended outcomes, and major constraints.

As a BA, your task here is to start building a mental map of the project. These documents are not just paperwork — they give you clues about the business drivers, the urgency of the work, and the expectations from leadership. You should read them carefully, highlight key points, and note any gaps or questions. For example, if the business case explains why the project is happening but not how success will be measured, that is a gap you'll want to revisit later.

At this stage, you may also start hearing about high-level goals or even early solution ideas. Stakeholders sometimes already have opinions such as "we need a new system" or "this process should be automated." Your role as a BA is not to jump straight to solutions but to keep these ideas in mind while remaining focused on understanding the business problem first.

In addition, this introduction often reveals the sponsor or main driver of the project — the senior stakeholder who cares the most about its success. Knowing who the sponsor is gives you an early indication of who holds power and influence in the project, which will be important when you begin stakeholder analysis.

Remember, at this point you are not running workshops or collecting requirements. You are absorbing, analysing the available information, and beginning to connect the dots. By the end of this phase, you should have a clear sense of the why behind the project and an outline of the what it hopes to deliver. This sets you up perfectly for the next stage, where you will begin to look deeper into documents and prepare for stakeholder engagement.`
  },
  { 
    id: "doc-analysis", 
    title: "Early Document Analysis",
    content: `After being introduced to the project and receiving the initial documents, one of your first responsibilities as a Business Analyst is to begin analysing those documents carefully. This is not about memorising every page but about reading with a BA's lens — looking for clarity, gaps, risks, and insights that will shape your understanding of the project.

The kinds of documents you may encounter at this stage include:

Business Case – outlining why the project is needed, the expected benefits, and the costs or risks involved.

Project Charter – setting out high-level objectives, scope, constraints, and authority of the project.

Project Brief – a shorter summary of the project's purpose and outcomes.

Strategy or Policy Papers – background context from the wider organisation that links the project to business priorities.

As a BA, you are not only reading these documents but actively asking yourself:

Does this document clearly explain the problem we are solving?

Is there agreement on the goals of the project?

Are there assumptions that need to be tested later with stakeholders?

Are there gaps or contradictions in the information provided?

For example, you may notice that the business case mentions "improving customer experience" as a goal but does not explain what aspect of the experience is failing today. That gap tells you that this is an area to probe further during stakeholder conversations.

Document analysis at this stage also helps you prepare for upcoming meetings. If you walk into discussions having read the background material, you can ask more targeted questions and demonstrate that you are already adding value.

It's important to note that while documents give you a starting point, they are never the full picture. They are written from a certain perspective, often by sponsors or managers, and may leave out details that other stakeholders care about. That is why document analysis is only one part of your role. It sets the stage for elicitation, where you will validate and expand on what you've read.

By the end of this phase, you should have a set of notes that summarise the key drivers of the project, a list of assumptions or open questions, and an early sense of what success might look like. This ensures that when you meet stakeholders, you are prepared to guide conversations with context rather than starting from zero.`
  },
  { 
    id: "early-meetings", 
    title: "Sitting in Early Meetings",
    content: `At the very start of a project, long before formal elicitation workshops are held, a Business Analyst is often invited to attend early meetings. These may include planning sessions, alignment calls, or progress updates between senior stakeholders. They are not requirement-gathering sessions, but they are still valuable opportunities for you to learn and prepare.

The people in these meetings may include the project sponsor, project manager, senior leaders from affected departments, and sometimes technical leads or architects. The discussions are usually focused on scope, timelines, risks, and resources, rather than detailed requirements. Even though you are not expected to contribute heavily at this stage, your presence is important.

As a BA, your role in these meetings is to:

Observe – listen carefully to the way stakeholders talk about the project. Pay attention to language, pain points, and early solution ideas.

Take Notes – capture anything that seems important, unclear, or contradictory. These notes will help you prepare for future elicitation sessions.

Spot Gaps – notice when key details are missing. For example, stakeholders may agree on what needs to be done but not on why it is important.

Start Identifying Stakeholders – meetings are where you learn who really has influence, who asks the most questions, and who seems resistant. These early observations will feed into your stakeholder analysis later.

Sometimes, you may be asked to give a short update about your role or explain how you will support the project. This is a chance to position yourself as a partner who will help make sure the project's outcomes are clear and achievable. A simple introduction like, "I'll be working with you to capture requirements, ensure they're aligned to business goals, and support the team in delivering solutions that meet your needs," helps stakeholders see your value early on.

One challenge in early meetings is that you will often hear conflicting perspectives. A sponsor may be focused on strategic outcomes, while a department lead may be more concerned with operational details. Don't feel pressured to resolve these conflicts immediately. Instead, note them down and plan to explore them further during stakeholder interviews and elicitation workshops.

By attending early meetings, you begin to understand the politics and dynamics of the project environment. You see who drives conversations, who stays quiet, and where tensions might exist. This awareness will make you a more effective BA when it is time to facilitate discussions and gather detailed requirements.

By the end of this stage, you should have:

A clearer understanding of the project's high-level scope and priorities.

A growing list of stakeholders and their perspectives.

A set of notes highlighting areas to explore further.

This is the groundwork that prepares you for the more active phases of your BA role.`
  },
  { 
    id: "stakeholder-awareness", 
    title: "Stakeholder Awareness",
    content: `As you progress through the initiation phase, one of the most important responsibilities for a Business Analyst is to start building stakeholder awareness. Even before you conduct formal stakeholder analysis, you will begin to notice names, roles, and influences that shape the project. This early awareness is crucial because successful Business Analysis is as much about people as it is about processes and systems.

At this stage, you may hear stakeholders mentioned in documents such as the business case or project brief. You may also see them attending early meetings, voicing concerns, or asking key questions. Each of these encounters gives you clues about who matters to the project and why.

The goal of stakeholder awareness is to start forming answers to questions like:

Who are the sponsors driving this project forward?

Who are the end users that will be directly impacted by the solution?

Who are the supporting teams (e.g., IT, compliance, operations) that need to be involved?

Who has power and influence that could accelerate or block progress?

Who shows interest and energy in the project versus who seems disengaged?

A practical tool you will use later is the Power–Interest Grid, which helps classify stakeholders based on how much power they hold and how much interest they show in the project. But even before you draw a grid, you can start noting:

"This person is highly influential but not engaged — I need to plan how to involve them later."

"This team is very interested but has little power — I can keep them informed but they won't drive decisions."

Building stakeholder awareness early also helps you prepare for potential conflicts. For example, you may observe that two departments have different views on the project's priorities. By noting this early, you can plan questions or workshops to address these differences during elicitation.

It's also good practice to begin keeping a stakeholder log or list, even if it's informal at first. Write down names, roles, and any notes about their influence, attitude, or concerns. This record will later evolve into a full stakeholder register and analysis, but starting early means you don't lose valuable observations.

For a BA, strong stakeholder awareness is the foundation of effective requirements work. The better you understand who your stakeholders are, the more effectively you can plan elicitation, manage expectations, and ensure the final solution meets real business needs.

By the end of this stage, you should:

Have a draft list of stakeholders, drawn from documents and meetings.

Understand which individuals or groups appear most powerful or interested.

Be preparing to build a formal stakeholder analysis using tools like the Power–Interest Grid.

This sets the stage for you to enter elicitation with confidence, knowing who you need to speak to and what dynamics you will need to manage.`
  },
  { 
    id: "early-design", 
    title: "Early Design Conversations",
    content: `In many organisations, conversations about design begin very early in the life of a project — sometimes even before requirements are fully understood. As a Business Analyst, you may find yourself in meetings where stakeholders are already suggesting solutions, sketching ideas, or showing rough prototypes.

For example, someone might say, "We just need a new mobile app" or "Let's add another system to handle this process." While these conversations can be useful, they also carry a risk: the project may jump to solutions before clearly defining the problem.

Your role as a BA in these moments is to acknowledge design ideas without locking into them too soon. You must keep the focus on understanding the business problem, goals, and user needs before agreeing to any specific solution. A good approach is to capture the idea but reframe it into a requirement question, such as:

Instead of: "We need a chatbot."

Reframe: "It sounds like customers need faster support. Let's explore what options could solve that problem."

Sometimes, you may also encounter UX or design teams who are already preparing early user journeys or wireframes. This is a positive step, but as a BA, you must ensure that these designs are grounded in actual business needs and stakeholder requirements. Rather than rejecting early designs, work collaboratively by connecting them to the requirements you are uncovering.

For example, if a designer shows you a mock-up of a new expense reporting form, your response could be:

"This looks promising. Let's confirm with finance and end-users that this layout captures the mandatory information and fits their workflow."

Early design conversations are also an opportunity to bridge the gap between business and technical teams. Stakeholders may not understand technical limitations, while designers may not fully grasp business rules. You, as the BA, play a critical role in ensuring that both sides are aligned and that the design supports business goals.

The key takeaway is that early design conversations should not be dismissed, but they should not dominate either. Capture the ideas, link them back to business needs, and make sure they are validated through proper elicitation and requirement analysis.

By the end of this stage, you should:

Have a record of early solution or design ideas.

Be clear that these are assumptions to validate, not final decisions.

Understand how to work with design teams without losing sight of your role as a BA.

This prepares you for the final part of initiation, where all the background work comes together as you approach the project kickoff meeting.`
  },
  { 
    id: "kickoff", 
    title: "Preparing for Kickoff",
    content: `By this stage, you have gone through induction, been introduced to the project, reviewed early documents, observed meetings, built initial stakeholder awareness, and noted early design ideas. All of this work prepares you for one of the first major milestones in any project — the kickoff meeting.

The kickoff is not the beginning of requirements elicitation, but it is the moment where the project is formally launched with the wider team. Sponsors, project managers, business analysts, technical leads, and sometimes end users come together to align on the purpose of the project, the expected outcomes, and the way of working.

For a Business Analyst, preparation for kickoff is crucial. You are not expected to lead the meeting — that is usually the role of the project manager — but you are expected to walk in with context and clarity. By now you should:

Understand the business problem the project is trying to solve.

Be familiar with key documents such as the business case or project charter.

Have a growing awareness of stakeholders and their perspectives.

Know about any early design ideas or assumptions that have been suggested.

In the lead-up to kickoff, your project manager may ask you to contribute to slides or materials, especially around scope, objectives, or how requirements will be handled. This is an opportunity to show your value early. Keep your contributions simple and clear — the goal is alignment, not detail.

During the kickoff itself, your role is to listen actively, take notes, and pay close attention to how stakeholders respond. Are they aligned on the project's goals? Do they raise concerns about scope, timelines, or resourcing? Do they seem engaged or hesitant? These observations will shape your approach to elicitation and requirements work afterwards.

Another important part of kickoff preparation is thinking about how you will introduce yourself. A short, professional introduction that highlights your role can set the tone for how stakeholders perceive you. For example:
"I'm here as the Business Analyst on this project. My role will be to work with you to understand your needs, capture requirements, and make sure the solution we deliver meets the business objectives."

By the end of the kickoff, you should leave with a stronger understanding of the project environment, a clear view of what comes next, and confirmation of who your key stakeholders are. This marks the end of Project Initiation and the beginning of the next stage in your BA journey — elicitation and requirements engineering.`
  },
];

const ProjectInitiationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 px-8 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Project Initiation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Before you ever get to a project kickoff meeting, there are important
            steps that set the foundation for your role as a Business Analyst.
            This hub walks you through what happens in those first weeks — from
            induction to early design conversations.
          </p>
        </header>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === index
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {lesson.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {lessons[activeTab].title}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                {lessons[activeTab].content}
              </p>
            </div>
            
            {/* CTA for kickoff lesson */}
            {activeTab === lessons.length - 1 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    You are now ready to begin eliciting requirements from stakeholders.
                  </p>
                  <button
                    onClick={() => setCurrentView('practice-2')}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start Elicitation Practice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInitiationView;
