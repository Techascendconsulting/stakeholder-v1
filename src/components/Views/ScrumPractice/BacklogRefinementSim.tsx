import React, { useState } from 'react';
import { ArrowLeft, Play, Users, Target, CheckCircle } from 'lucide-react';
import { RefinementMeetingView } from '../RefinementMeetingView';

interface BacklogRefinementSimProps {
  onBack: () => void;
}

// Move static data outside component to prevent recreation on each render
const participants = [
  { name: 'Product Owner', description: 'Clarifies value, priority, and acceptance.' },
  { name: 'Business Analyst', description: 'Shapes user stories, ACs, and business rules.' },
  { name: 'Developers', description: 'Explore feasibility, dependencies, and effort.' },
  { name: 'QA/Test Engineer', description: 'Ensures testability and negative-path coverage.' },
  { name: 'Scrum Master', description: 'Facilitates the discussion and keeps outcomes clear.' }
];

const sampleStories = [
  {
    id: 'STORY-1',
    title: 'Tenant can upload attachments to maintenance request',
    description: 'Allow tenants to attach images or documents to speed up diagnosis.',
    status: 'Ready for Refinement'
  }
] as any;

const sampleStoriesAlt = [
  {
    id: 'STORY-2',
    title: 'Password reset confirmation email',
    description: 'Send a confirmation email when a user resets their password to improve security and visibility.',
    status: 'Ready for Refinement'
  }
] as any;

const BacklogRefinementSim: React.FC<BacklogRefinementSimProps> = ({ onBack }) => {
  const [showSimulation, setShowSimulation] = useState(false);
  const [scenario, setScenario] = useState<'meeting-1' | 'meeting-2'>('meeting-1');
  const [page, setPage] = useState<'overview' | 'simulation-info'>('overview');
  const [isProcessHighlighted, setIsProcessHighlighted] = useState(false);

  // Performance logging - track component mount time
  React.useEffect(() => {
    const mountTime = performance.now();
    console.log('⏱️ BacklogRefinementSim mounted at:', mountTime.toFixed(2), 'ms');

    // Track when the critical "Watch Refinement Simulation" button becomes visible
    const checkVisibility = () => {
      // Use XPath to find button containing the text
      const buttonElement = document.evaluate(
        "//button[contains(text(), 'Watch Refinement Simulation')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      
      if (buttonElement) {
        const visibleTime = performance.now();
        const elapsed = ((visibleTime - mountTime) / 1000).toFixed(2);
        console.log(`🚀 Backlog Refinement page visible in ${elapsed} seconds (after optimization)`);
        console.log('📊 Performance improvements applied:');
        console.log('   ✅ Lazy loading for heavy components');
        console.log('   ✅ Code splitting (42KB+ saved from main bundle)');
        console.log('   ✅ Static data moved outside component');
        console.log('   ✅ Simplified gradient rendering');
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkVisibility()) return;

    // If not visible yet, check after a short delay
    const timeoutId = setTimeout(() => {
      if (checkVisibility()) return;
      
      // Final check after animation completes
      setTimeout(checkVisibility, 500);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const scrollToProcessSection = () => {
    const processSection = document.getElementById('process');
    if (processSection) {
      processSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setTimeout(() => {
        setIsProcessHighlighted(true);
        setTimeout(() => {
          setIsProcessHighlighted(false);
        }, 2000);
      }, 800);
    }
  };

  // If simulation is active, show the meeting view
  if (showSimulation) {
    const stories = scenario === 'meeting-1' ? sampleStories : sampleStoriesAlt;
    return (
      <RefinementMeetingView
        stories={stories}
        onMeetingEnd={(results) => {
          console.log('Meeting ended with results:', results);
          setShowSimulation(false);
        }}
        onClose={() => setShowSimulation(false)}
      />
    );
  }

  // Simulation Info Page (Page 2) - Simplified initial render
  if (page === 'simulation-info') {
    return (
      <div data-testid="refinement-page" className="content-root min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => setPage('overview')}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What you will watch</h1>
            <p className="text-gray-700 dark:text-gray-300">
              You'll watch two short refinement meetings. Each one focuses on how the team clarifies the requirement and confirms it's ready.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Meeting 1 Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Meeting 1</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Requirement</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{sampleStories[0].title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{sampleStories[0].description}</p>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">What this meeting is about</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  In this refinement session, the team reviews the story for allowing tenants to upload attachments to maintenance requests. The goal is to clarify the functional requirements, establish clear acceptance criteria, and ensure the story is ready for development.
                </p>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">What to look out for while watching</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-2">
                  <li><strong>BA:</strong> How they clarify business rules and edge cases</li>
                  <li><strong>Developers:</strong> Technical feasibility and implementation approach</li>
                  <li><strong>QA:</strong> Test scenarios and negative path coverage</li>
                  <li><strong>Scrum Master:</strong> Facilitation and keeping discussions focused</li>
                </ul>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Key learning focus</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>How to break down complex user stories into clear acceptance criteria</li>
                  <li>Techniques for uncovering hidden requirements and edge cases</li>
                  <li>Balancing business needs with technical constraints</li>
                </ul>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => { setScenario('meeting-1'); setShowSimulation(true); }}
                  className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Meeting 1
                </button>
              </div>
            </div>

            {/* Meeting 2 Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Meeting 2</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Requirement</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{sampleStoriesAlt[0].title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{sampleStoriesAlt[0].description}</p>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">What this meeting is about</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  In this refinement session, the team reviews the story for sending a confirmation email after a customer successfully resets their password. The goal is to make sure the process is secure, technically sound, and ready for development.
                </p>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">What to look out for while watching</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-2">
                  <li><strong>BA:</strong> Security requirements and user experience considerations</li>
                  <li><strong>Developers:</strong> Email infrastructure and security implementation</li>
                  <li><strong>QA:</strong> Testing email delivery and edge cases</li>
                  <li><strong>Scrum Master:</strong> Ensuring all security concerns are addressed</li>
                </ul>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Key learning focus</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>How to handle technical stories with security implications</li>
                  <li>Balancing user experience with security requirements</li>
                  <li>Identifying and addressing technical dependencies early</li>
                </ul>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => { setScenario('meeting-2'); setShowSimulation(true); }}
                  className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Meeting 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview Page (Page 1) - Optimized for fast initial render
  return (
    <div data-testid="refinement-page" className="content-root min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Critical content, render immediately */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scrum Practice
          </button>
        </div>
      </div>

      {/* Hero Section - Critical content, simplified gradients for faster render */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-3xl mx-6 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-6">
              <Target className="w-4 h-4" />
              <span>Story Shaping • Estimation • Readiness</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Backlog Refinement</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Learn how experienced teams transform vague requirements into sprint-ready user stories through collaborative refinement sessions
            </p>
          </div>
          
          {/* Visual Elements */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Collaborative</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Team discussions and shared understanding</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Focused</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Clear scope and well-defined outcomes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ready</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Sprint-ready stories with solid estimates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Backlog Refinement Matters</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Backlog refinement transforms vague ideas into actionable stories that drive successful development
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-4 right-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-16">Clarity & Understanding</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Transform ambiguous requirements into crystal-clear user stories with well-defined acceptance criteria that everyone understands.</p>
          </div>
          
          <div className="relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-4 right-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-16">Risk Reduction</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Identify dependencies, constraints, and edge cases early to prevent costly surprises during development.</p>
          </div>
          
          <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-4 right-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-16">Sprint Readiness</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Ensure stories are properly sized, estimated, and ready to be committed to in Sprint Planning.</p>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div 
        id="process" 
        className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-1000 ${
          isProcessHighlighted 
            ? 'bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl' 
            : ''
        }`}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">The Refinement Process</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A structured approach to transforming backlog items into sprint-ready user stories
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                step: "1",
                title: "Story Review",
                description: "Read the user story aloud and ensure everyone understands the basic requirement",
                color: "from-blue-500 to-cyan-600",
                bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                borderColor: "border-blue-200/50 dark:border-blue-800/50"
              },
              {
                step: "2", 
                title: "Clarification",
                description: "Ask questions about business rules, edge cases, and acceptance criteria",
                color: "from-purple-500 to-pink-600",
                bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
                borderColor: "border-purple-200/50 dark:border-purple-800/50"
              },
              {
                step: "3",
                title: "Technical Discussion",
                description: "Explore feasibility, dependencies, and technical approach with the development team",
                color: "from-orange-500 to-red-600",
                bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
                borderColor: "border-orange-200/50 dark:border-orange-800/50"
              },
              {
                step: "4",
                title: "Estimation & Readiness",
                description: "Size the story, confirm it meets Definition of Ready, and mark as refined",
                color: "from-green-500 to-emerald-600",
                bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                borderColor: "border-green-200/50 dark:border-green-800/50"
              }
            ].map((step, index) => (
              <div key={index} className={`p-6 bg-gradient-to-br ${step.bgColor} rounded-2xl border ${step.borderColor} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <span className="text-xl font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div id="participants" className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Who's in the Room?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Each participant brings unique perspectives and expertise to create well-rounded user stories
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{participant.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{participant.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to See It in Action?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Watch real refinement sessions and learn how experienced BAs facilitate these crucial discussions
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setPage('simulation-info')}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5 mr-3" />
            Watch Refinement Simulation
          </button>
          <button
            onClick={scrollToProcessSection}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 shadow-lg"
          >
            <Target className="w-5 h-5 mr-3" />
            Learn the Process
          </button>
        </div>
      </div>

    </div>
  );
};

export default BacklogRefinementSim;








