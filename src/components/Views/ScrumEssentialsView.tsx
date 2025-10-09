import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Target, Clock, BookOpen, Zap, Award, ArrowRight, X, ArrowLeft } from 'lucide-react';

const ScrumEssentialsView: React.FC = () => {
  console.log('🔄 ScrumEssentialsView: Component mounting...');
  const { setCurrentView } = useApp();
  const [showImageModal, setShowImageModal] = useState(false);

  const scrumConcepts = [
    {
      title: 'Agile vs Waterfall: The Foundation',
      content: `Before diving into Scrum, it's essential to understand the broader context of project management methodologies.

**Waterfall Methodology:**
Waterfall is a traditional, sequential approach where each phase must be completed before the next begins. Think of it like building a house - you need the foundation before the walls, and the walls before the roof.

• **Phases**: Requirements → Design → Implementation → Testing → Deployment → Maintenance
• **Characteristics**: Linear, document-heavy, rigid, predictable
• **Best for**: Projects with clear, stable requirements and long timelines
• **Challenges**: Difficult to accommodate changes, late feedback, high risk of failure

**Agile Methodology:**
Agile is an iterative approach that emphasizes collaboration, flexibility, and rapid delivery of working software. It's like building a house room by room, getting feedback after each room.

• **Principles**: Individuals and interactions, working software, customer collaboration, responding to change
• **Characteristics**: Iterative, collaborative, adaptive, customer-focused
• **Best for**: Projects with evolving requirements and need for frequent feedback
• **Benefits**: Faster time to market, better quality, higher customer satisfaction

**The Agile Manifesto:**
The foundation of Agile is the Agile Manifesto, created in 2001 by 17 software developers. It states:

*"We are uncovering better ways of developing software by doing it and helping others do it. Through this work we have come to value:*

• **Individuals and interactions** over processes and tools
• **Working software** over comprehensive documentation  
• **Customer collaboration** over contract negotiation
• **Responding to change** over following a plan

*That is, while there is value in the items on the right, we value the items on the left more."*

**How Scrum Fits In:**
Scrum is one of the most popular Agile frameworks. While Agile is a philosophy, Scrum provides the specific structure, roles, and events to implement Agile principles effectively. It translates the Agile Manifesto into actionable practices.`,
      icon: <Zap className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      title: 'What is Scrum?',
      content: `Scrum is an Agile framework that helps teams deliver value in short, iterative cycles called sprints. It's built on three pillars: transparency, inspection, and adaptation.

**Key Scrum Roles:**
• **Product Owner** - Represents stakeholders and manages the product backlog
• **Scrum Master** - Facilitates the process and removes impediments  
• **Development Team** - Cross-functional team that builds the product

**The Scrum Framework:**
Scrum provides structure through events, artifacts, and roles that help teams work together effectively to deliver high-quality products.`,
      icon: <Target className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Scrum Events',
      content: `Scrum defines five key events that create regularity and minimize the need for meetings not defined in Scrum.

**Sprint Planning** - Team plans the work for the upcoming sprint
**Daily Scrum** - 15-minute daily sync to inspect progress toward the sprint goal
**Sprint Review** - Team demonstrates completed work to stakeholders
**Sprint Retrospective** - Team reflects on the sprint and identifies improvements
**The Sprint** - A time-boxed period (1-4 weeks) where work is completed

These events provide opportunities to inspect and adapt the product and process.`,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Scrum Artifacts',
      content: `Scrum's artifacts represent work or value to provide transparency and opportunities for inspection and adaptation.

**Product Backlog** - An ordered list of everything needed in the product
**Sprint Backlog** - The set of Product Backlog items selected for the sprint
**Increment** - A concrete stepping stone toward the Product Goal

**Definition of Done** - A shared understanding of what it means for work to be complete
**Product Goal** - A long-term objective for the Scrum Team

These artifacts help ensure transparency and alignment across the team.`,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Scrum Values',
      content: `Successful use of Scrum depends on people becoming more proficient in living five values:

**Commitment** - People personally commit to achieving the goals of the Scrum Team
**Courage** - Team members have courage to do the right thing and work on tough problems
**Focus** - Everyone focuses on the work of the Sprint and the goals of the Scrum Team
**Openness** - Team and stakeholders agree to be open about all the work and challenges
**Respect** - Team members respect each other to be capable, independent people

These values give direction to the Scrum Team with regard to their work, actions, and behavior.`,
      icon: <Award className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

      console.log('🔄 ScrumEssentialsView: Rendering JSX...');
      return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Back to Learning Journey */}
        <button
          onClick={() => setCurrentView('learning-flow')}
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Learning Journey</span>
        </button>

        {/* Hero Section with Image */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 px-8 py-12">
            <div className="text-center text-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Agile & Scrum Essentials
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Learn the essential concepts, roles, events, and artifacts that make Scrum an effective framework for delivering value
              </p>
              
              {/* Quick Action Buttons */}
              <div className="flex justify-center space-x-3 flex-wrap gap-3">
                <button 
                  onClick={() => {
                    console.log('🔄 ScrumEssentialsView: Navigating to scrum-learning...');
                    setCurrentView('scrum-learning');
                  }}
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold shadow-lg flex items-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Start Learning</span>
                </button>
                <button 
                  onClick={() => setCurrentView('scrum-practice')}
                  className="bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold shadow-lg flex items-center space-x-2"
                >
                  <Target className="w-5 h-5" />
                  <span>Practice Scrum</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto">
              <img 
                src="/Screenshot 2025-09-27 at 11.36.44.png" 
                alt="Scrum team collaboration" 
                className="w-full rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700"
                onClick={() => setShowImageModal(true)}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center italic">
                Click to view full size • Image courtesy of Scrum Alliance
              </p>
            </div>
          </div>
        </div>

      {/* Learning Content */}
      <div className="space-y-8">
        {scrumConcepts.map((concept, index) => (
          <div
            key={index}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 ${concept.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative p-8">
              {/* Header with icon */}
              <div className="flex items-start space-x-4 mb-6">
                <div className={`flex-shrink-0 w-12 h-12 ${concept.bgColor} rounded-xl flex items-center justify-center ${concept.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {concept.icon}
                </div>
            <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                    {concept.title}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full"></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div 
                  className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base"
                  dangerouslySetInnerHTML={{
                    __html: concept.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
        </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ready to Dive Deeper?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Continue your Scrum learning journey with our comprehensive step-by-step guide covering roles, events, artifacts, and more.
          </p>
          <button
            onClick={() => {
              console.log('🔄 ScrumEssentialsView: Navigating to scrum-learning...');
              setCurrentView('scrum-learning');
            }}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-10 py-4 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl max-h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image */}
            <div className="p-8">
              <img 
                src="/Screenshot 2025-09-27 at 11.36.44.png" 
                alt="Scrum team collaboration - Full Size" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scrum team working together on product development
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Click outside the image or press the X button to close
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ScrumEssentialsView;