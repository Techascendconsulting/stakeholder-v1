import React, { useState } from 'react';
import { ArrowLeft, Play, Users, Target, FileText, Lightbulb, CheckCircle } from 'lucide-react';
import { RefinementMeetingView } from '../RefinementMeetingView';

interface BacklogRefinementSimProps {
  onBack: () => void;
}

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
  console.log('📺 BacklogRefinementSim render', { page, scenario, showSimulation });

  if (showSimulation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowSimulation(false)}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Refinement Overview
            </button>
          </div>
        </div>
        <RefinementMeetingView
          stories={scenario === 'meeting-2' ? sampleStoriesAlt : sampleStories}
          onMeetingEnd={() => setShowSimulation(false)}
          onClose={() => setShowSimulation(false)}
        />
      </div>
    );
  }

  // Simulation Info Page (Page 2)
  if (page === 'simulation-info') {
    return (
      <div className="content-root min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setPage('overview')}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </button>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Refinement Simulation</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What you will watch</h1>
            <p className="text-gray-700 dark:text-gray-300">
              You’ll watch two short refinement meetings. Each one focuses on how the team clarifies the requirement and confirms it’s ready.
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Focus in this meeting</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Clarify functional acceptance criteria</li>
                  <li>Agree visible user feedback</li>
                  <li>Surface dependencies and constraints</li>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text_WHITE mb-2">Meeting 2</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Requirement</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{sampleStoriesAlt[0].title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{sampleStoriesAlt[0].description}</p>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Focus in this meeting</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Identify questions and edge cases</li>
                  <li>Align on Definition of Ready</li>
                  <li>Confirm shared understanding</li>
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

  // Overview Page (Page 1)
  return (
    <div className="content-root min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scrum Practice
          </button>
          <button
            onClick={() => { console.log('🟣 CLICK: Watch Refinement Simulation (header)'); setPage('simulation-info'); }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <Play className="w-4 h-4 mr-1" />
            Watch Refinement Simulation
          </button>
        </div>
      </div>

      {/* Scenario Tabs removed in favor of clear scenario cards below */}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
              <Target className="w-4 h-4" />
              <span>Story Shaping • Estimation • Readiness</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-3">
              What is a Backlog Refinement Meeting?
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Backlog Refinement is a collaborative session where the team discusses upcoming backlog items to ensure they are <strong className="text-gray-900 dark:text-white">well understood, valuable, and ready</strong> for Sprint Planning. The outcome: clear user stories, solid acceptance criteria, known dependencies, and reasonable estimates.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start space-x-2"><CheckCircle className="w-4 h-4 text-green-600 mt-1" /><span>Clarify user stories and business rules</span></li>
              <li className="flex items-start space-x-2"><CheckCircle className="w-4 h-4 text-green-600 mt-1" /><span>Identify edge cases and test scenarios</span></li>
              <li className="flex items-start space-x-2"><CheckCircle className="w-4 h-4 text-green-600 mt-1" /><span>Discuss technical approach and constraints</span></li>
              <li className="flex items-start space-x-2"><CheckCircle className="w-4 h-4 text-green-600 mt-1" /><span>Estimate effort and confirm readiness</span></li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage('simulation-info')}
                className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Refinement Simulation
              </button>
              <a
                href="#participants"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                See Participants
              </a>
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 max-w-prose">
              This session focuses on shaping a story’s scope and ACs. Watch how the BA and team clarify value, business rules, and edge cases.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white dark:bg-gray-800">
              <img
                src="/images/refinement1.png"
                alt="Refinement meeting overview"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What this visual shows</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The flowchart shows that refinement isn’t about collecting every idea but about filtering so only clear, valuable, vision-aligned work enters the backlog.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants & Visual Aid */}
      <div id="participants" className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white dark:bg-gray-800">
            <img
              src="/images/refinement2.png"
              alt="Refinement meeting details"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Who is in the room?</h2>
            <ul className="space-y-3">
              {participants.map(p => (
                <li key={p.name} className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{p.description}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Key Outputs</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Clear user stories with functional, testable ACs</li>
                <li>Known dependencies and constraints</li>
                <li>Right-sized scope and agreed estimates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Overview page ends here (lean) */}
    </div>
  );
};

export default BacklogRefinementSim;


