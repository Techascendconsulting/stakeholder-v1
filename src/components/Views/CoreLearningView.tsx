import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  User, 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Workflow, 
  GitBranch, 
  Search,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Play,
  Clock
} from 'lucide-react';

interface ConceptCard {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;
  keyPoints: string[];
  icon: React.ReactNode;
  color: string;
  gradient: string;
  
}

const concepts: ConceptCard[] = [
  {
    id: 1,
    title: "Who Is a Business Analyst?",
    description: "Understand what a Business Analyst is and why the role exists.",
    detailedDescription: "A Business Analyst helps organisations solve business problems. They work across teams to understand needs and shape the right solutions. They don't build the solution — they define and clarify it. The BA role exists because businesses often struggle to explain problems clearly.",
    keyPoints: [
      "A Business Analyst helps organisations solve business problems.",
      "They work across teams to understand needs and shape the right solutions.",
      "They don't build the solution — they define and clarify it.",
      "The BA role exists because businesses often struggle to explain problems clearly."
    ],
    icon: <User className="w-8 h-8" />,
    color: "from-purple-500 to-indigo-600",
    gradient: "bg-gradient-to-br from-purple-50 to-indigo-50"
  },
  {
    id: 2,
    title: "How Organisations Work",
    description: "To solve business problems, you must understand how businesses operate.",
    detailedDescription: "Every organisation either sells products, services, or both. They exist to deliver value — money, time saved, or impact. Understanding what they sell helps you understand their goals. BA work always ties back to business performance and value.",
    keyPoints: [
      "Every organisation either sells products, services, or both.",
      "They exist to deliver value — money, time saved, or impact.",
      "Understanding what they sell helps you understand their goals.",
      "BA work always ties back to business performance and value."
    ],
    icon: <Building2 className="w-8 h-8" />,
    color: "from-blue-500 to-cyan-600",
    gradient: "bg-gradient-to-br from-blue-50 to-cyan-50"
  },
  {
    id: 3,
    title: "Departments in an Organisation",
    description: "The different departments help the business deliver its services or products.",
    detailedDescription: "Common departments include Sales, Marketing, Finance, Operations, Compliance, and Customer Service. Each one has its own goals and pain points. BAs often work across departments to understand where processes break down. Knowing who does what helps you ask better questions and involve the right people.",
    keyPoints: [
      "Common departments include Sales, Marketing, Finance, Operations, Compliance, and Customer Service.",
      "Each one has its own goals and pain points.",
      "BAs often work across departments to understand where processes break down.",
      "Knowing who does what helps you ask better questions and involve the right people."
    ],
    icon: <Users className="w-8 h-8" />,
    color: "from-emerald-500 to-teal-600",
    gradient: "bg-gradient-to-br from-emerald-50 to-teal-50"
  },
  {
    id: 4,
    title: "Why Projects Happen",
    description: "Projects begin when the business wants to fix something, improve, or stay competitive.",
    detailedDescription: "Projects are usually triggered by problems, regulations, inefficiencies, or growth plans. They are time-bound and goal-driven — not ongoing tasks. The BA helps define the project clearly before it begins. Your work prevents wasted time and money solving the wrong thing.",
    keyPoints: [
      "Projects are usually triggered by problems, regulations, inefficiencies, or growth plans.",
      "They are time-bound and goal-driven — not ongoing tasks.",
      "The BA helps define the project clearly before it begins.",
      "Your work prevents wasted time and money solving the wrong thing."
    ],
    icon: <Target className="w-8 h-8" />,
    color: "from-orange-500 to-red-600",
    gradient: "bg-gradient-to-br from-orange-50 to-red-50"
  },
  {
    id: 5,
    title: "Why BAs Are Hired",
    description: "BAs help the business understand itself before spending money on solutions.",
    detailedDescription: "Without BAs, teams may waste time building the wrong solution. The BA adds clarity, structure, and alignment. They reduce risk, surface hidden needs, and ensure what gets delivered actually helps. BAs are paid to improve decision-making before the build starts.",
    keyPoints: [
      "Without BAs, teams may waste time building the wrong solution.",
      "The BA adds clarity, structure, and alignment.",
      "They reduce risk, surface hidden needs, and ensure what gets delivered actually helps.",
      "BAs are paid to improve decision-making before the build starts."
    ],
    icon: <TrendingUp className="w-8 h-8" />,
    color: "from-pink-500 to-rose-600",
    gradient: "bg-gradient-to-br from-pink-50 to-rose-50"
  },
  {
    id: 6,
    title: "What a BA Does (and Doesn't Do)",
    description: "A BA defines what's needed — but doesn't deliver it themselves.",
    detailedDescription: "They ask questions, gather info, and document what the business really needs. They write clear requirements — not vague guesses. They don't code, design, or test directly — but support those who do. Their job is to define the 'what' and 'why' — not the 'how'.",
    keyPoints: [
      "They ask questions, gather info, and document what the business really needs.",
      "They write clear requirements — not vague guesses.",
      "They don't code, design, or test directly — but support those who do.",
      "Their job is to define the 'what' and 'why' — not the 'how'."
    ],
    icon: <CheckCircle className="w-8 h-8" />,
    color: "from-violet-500 to-purple-600",
    gradient: "bg-gradient-to-br from-violet-50 to-purple-50"
  },
  {
    id: 7,
    title: "How a BA Works",
    description: "BAs work through collaboration, research, and structured thinking.",
    detailedDescription: "They speak with stakeholders to uncover goals, gaps, and conflicts. They map out current and future states. They write user stories, acceptance criteria, and sometimes process flows. They support delivery teams by keeping the focus on solving the right problem.",
    keyPoints: [
      "They speak with stakeholders to uncover goals, gaps, and conflicts.",
      "They map out current and future states.",
      "They write user stories, acceptance criteria, and sometimes process flows.",
      "They support delivery teams by keeping the focus on solving the right problem."
    ],
    icon: <Workflow className="w-8 h-8" />,
    color: "from-amber-500 to-yellow-600",
    gradient: "bg-gradient-to-br from-amber-50 to-yellow-50"
  },
  {
    id: 8,
    title: "Agile and Waterfall",
    description: "Projects are delivered differently — BAs adapt based on the method.",
    detailedDescription: "Waterfall means plan everything up front, then build. Agile means break the work into small chunks and adjust along the way. In Agile, BAs work closely with teams during each sprint. In Waterfall, BAs often define everything before development begins.",
    keyPoints: [
      "Waterfall means plan everything up front, then build.",
      "Agile means break the work into small chunks and adjust along the way.",
      "In Agile, BAs work closely with teams during each sprint.",
      "In Waterfall, BAs often define everything before development begins."
    ],
    icon: <GitBranch className="w-8 h-8" />,
    color: "from-green-500 to-emerald-600",
    gradient: "bg-gradient-to-br from-green-50 to-emerald-50"
  },
  {
    id: 9,
    title: "Understanding the Problem",
    description: "BAs must define the problem before anyone starts solving it.",
    detailedDescription: "Most people focus on symptoms — BAs go deeper. Good BAs ask 'What's really going wrong here?' You're not paid to guess — you're paid to confirm. The wrong solution to the wrong problem still fails.",
    keyPoints: [
      "Most people focus on symptoms — BAs go deeper.",
      "Good BAs ask 'What's really going wrong here?'",
      "You're not paid to guess — you're paid to confirm.",
      "The wrong solution to the wrong problem still fails."
    ],
    icon: <Search className="w-8 h-8" />,
    color: "from-slate-500 to-gray-600",
    gradient: "bg-gradient-to-br from-slate-50 to-gray-50"
  },
  {
    id: 10,
    title: "Working With Stakeholders",
    description: "Stakeholders are anyone affected by or involved in the change.",
    detailedDescription: "BAs interview stakeholders to understand different perspectives. You'll deal with conflict, uncertainty, and unclear needs. Listening well builds trust — guessing loses it. Keep stakeholders involved and aligned.",
    keyPoints: [
      "BAs interview stakeholders to understand different perspectives.",
      "You'll deal with conflict, uncertainty, and unclear needs.",
      "Listening well builds trust — guessing loses it.",
      "Keep stakeholders involved and aligned."
    ],
    icon: <Users className="w-8 h-8" />,
    color: "from-indigo-500 to-blue-600",
    gradient: "bg-gradient-to-br from-indigo-50 to-blue-50"
  },
  {
    id: 11,
    title: "Working With Developers",
    description: "You're the bridge between business needs and tech execution.",
    detailedDescription: "Developers rely on you to explain what needs to be built — clearly. You don't need to know code, but you must speak clearly and be available. You remove confusion and answer questions — fast. When you're clear, developers build better and faster.",
    keyPoints: [
      "Developers rely on you to explain what needs to be built — clearly.",
      "You don't need to know code, but you must speak clearly and be available.",
      "You remove confusion and answer questions — fast.",
      "When you're clear, developers build better and faster."
    ],
    icon: <User className="w-8 h-8" />,
    color: "from-teal-500 to-cyan-600",
    gradient: "bg-gradient-to-br from-teal-50 to-cyan-50"
  },
  {
    id: 12,
    title: "Understanding Systems and Processes",
    description: "BAs must understand how work flows and how systems support that work.",
    detailedDescription: "Processes = what people do. Systems = the tools they use to do it. BAs map out both — especially when things aren't working. A great system can still fail if the process behind it is broken. Always check how people and tech interact — that's where the truth is.",
    keyPoints: [
      "Processes = what people do. Systems = the tools they use to do it.",
      "BAs map out both — especially when things aren't working.",
      "A great system can still fail if the process behind it is broken.",
      "Always check how people and tech interact — that's where the truth is."
    ],
    icon: <Workflow className="w-8 h-8" />,
    color: "from-rose-500 to-pink-600",
    gradient: "bg-gradient-to-br from-rose-50 to-pink-50"
  },
  {
    id: 13,
    title: "Spotting Inefficiencies",
    description: "BAs help teams stop wasting time — even if they've gotten used to it.",
    detailedDescription: "Look for delays, double entry, unclear handoffs, and manual rework. You may hear: 'It's just how we do it.' That's your cue. Inefficiencies hide inside normal routines. Your job is to question what everyone else ignores.",
    keyPoints: [
      "Look for delays, double entry, unclear handoffs, and manual rework.",
      "You may hear: 'It's just how we do it.' That's your cue.",
      "Inefficiencies hide inside normal routines.",
      "Your job is to question what everyone else ignores."
    ],
    icon: <Target className="w-8 h-8" />,
    color: "from-yellow-500 to-orange-600",
    gradient: "bg-gradient-to-br from-yellow-50 to-orange-50"
  },
  {
    id: 14,
    title: "Tools Business Analysts Use",
    description: "BAs use tools to gather, write, and communicate — but tools aren't the point.",
    detailedDescription: "Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams). You'll use CRM systems, ticketing platforms, and internal apps too. You don't need to master them all — just know how to use them for clarity. Good thinking always matters more than flashy tools.",
    keyPoints: [
      "Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams).",
      "You'll use CRM systems, ticketing platforms, and internal apps too.",
      "You don't need to master them all — just know how to use them for clarity.",
      "Good thinking always matters more than flashy tools."
    ],
    icon: <CheckCircle className="w-8 h-8" />,
    color: "from-purple-500 to-violet-600",
    gradient: "bg-gradient-to-br from-purple-50 to-violet-50"
  }
];

// Main CoreConceptsView Component
const CoreConceptsView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptCard | null>(null);

  // Force light theme for this component
  useEffect(() => {
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains('dark');
    
    // Remove dark class when component mounts
    root.classList.remove('dark');
    
    // Restore original theme when component unmounts
    return () => {
      if (hadDarkClass) {
        root.classList.add('dark');
      }
    };
  }, []);

  // Detail view for selected concept
  if (selectedConcept) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedConcept(null)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Core Concepts
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Title Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedConcept.gradient} text-gray-700 dark:text-gray-300`}>
                  {selectedConcept.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block mb-2">
                    Concept {selectedConcept.id}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedConcept.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {selectedConcept.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Video Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Video content for this concept will be available soon. 
                For now, review the key points and description below.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                {selectedConcept.detailedDescription}
              </p>
            </div>
          </div>

          {/* Key Points */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Learning Points</h2>
              <div className="space-y-4">
                {selectedConcept.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className={`w-8 h-8 bg-gradient-to-r ${selectedConcept.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-float" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '-4s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6 animate-float">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Core Learning for Aspiring Business Analysts
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Master the essential concepts and skills needed to excel as a Business Analyst
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      {/* Concepts Grid - Modern Design */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">14 Essential Concepts</h2>
          <p className="text-gray-600 dark:text-gray-400">Click any concept to dive deeper into the details</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className={`group relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${concept.gradient} hover:shadow-2xl hover:-translate-y-1`}
              style={{borderColor: 'transparent'}}
              onClick={() => setSelectedConcept(concept)}
            >
              {/* Concept Number Badge */}
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {concept.id}
                  </span>
                </div>
              </div>

              {/* Icon - Large & Prominent */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${concept.color} flex items-center justify-center shadow-xl mb-5 group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                  {concept.icon}
                </div>
              </div>

              {/* Title - Bold & Clear */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug pr-12">
                {concept.title}
              </h3>

              {/* Description - Concise */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5 line-clamp-3">
                {concept.description}
              </p>

              {/* CTA */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${concept.color} text-white text-sm font-semibold shadow-md group-hover:shadow-xl group-hover:gap-3 transition-all`}>
                <span>Click to learn</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Complete all concepts to build a comprehensive understanding of Business Analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreConceptsView;
