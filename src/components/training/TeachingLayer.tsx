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
    title: 'Welcome to Documentation Practice',
    content: `Stakeholders never come to you with perfect user stories.
Instead, you'll hear big requirements like:

"We need to improve the way customers prove their identity."
or
"We want a new payments process."

If you hand these straight to developers, they'll push back:

"This is too big. Where do we even start?"

This is where Epics come in.`,
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: "What's an Epic?",
    content: `An Epic is a large requirement — too big for one sprint, too high-level for developers to code immediately.

Think of it as a bucket: you throw all the related stories inside it. Without that bucket, your backlog is just a list of random tasks with no structure.

**Example**

Epic: Verify Customer Identity

Story: As a customer, I want to upload my ID so that I can prove who I am.

Story: As the system, I need to validate the ID so the customer can be approved.

Story: As a customer, I want to see confirmation so I know my account is active.`,
    icon: <Users className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    title: 'Where AC Fits',
    content: `But even these stories aren't enough on their own. How will the team know when "Upload ID" is actually complete?

That's why every story needs Acceptance Criteria (AC) — a short checklist of rules the feature must meet:

• The system accepts valid ID files.
• The system rejects invalid file types.
• The customer sees a clear confirmation message after upload.`,
    icon: <Target className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    title: 'Why This Matters',
    content: `• Epics keep requirements organised.
• Stories make the work deliverable in sprints.
• AC makes each story testable and clear.

This is how you, as a BA, turn big messy requirements into structured Agile documentation that developers and testers can actually use.`,
    icon: <Zap className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
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
          Documentation Practice
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Turn big messy requirements into structured Agile documentation that developers and testers can actually use
        </p>
        
        {/* Hero Image */}
        <div className="max-w-4xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&auto=format&q=80" 
            alt="Business analyst organizing requirements into structured documentation" 
            className="w-full h-64 object-cover rounded-2xl shadow-lg"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Business analyst organizing requirements into structured documentation</p>
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
            Ready to Practice?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Practice turning big requirements into structured Epics, Stories, and Acceptance Criteria with interactive scenarios.
          </p>
          <button 
            onClick={onStartPractice}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <span>Start Practice</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
