'use client';

import { ArrowRight, Play, BookOpen, Target, Users, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

// Symbol Card Component with modern design
const SymbolCard = ({ 
  title, 
  icon, 
  meaning, 
  whenToUse, 
  tips 
}: {
  title: string;
  icon: React.ReactNode;
  meaning: string;
  whenToUse: string;
  tips: string;
}) => (
  <div className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 hover:bg-white">
    <div className="flex items-start gap-4 mb-4">
      <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-700">What it means:</span>
            <p className="mt-1">{meaning}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">When to use it:</span>
            <p className="mt-1">{whenToUse}</p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-200 pl-3 py-2 rounded-r">
            <span className="font-medium text-blue-800">💡 Tip:</span>
            <p className="mt-1 text-blue-700">{tips}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default function ProcessMappingIntroView() {
  const { setCurrentView } = useApp();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen size={16} />
              Business Analysis Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Process Mapping
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Getting Started
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Master the art of visual process documentation. Create professional BPMN diagrams that 
              communicate clearly, identify improvements, and drive better business outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  // Navigate to the ProcessMapper component
                  setCurrentView('process-mapper-editor');
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowRight size={20} />
                Start Your First Map
              </button>
              <button 
                onClick={() => {
                  // Navigate to the ProcessMapper component with sample
                  setCurrentView('process-mapper-editor');
                }}
                className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:bg-white text-gray-700 font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Play size={20} />
                View Sample
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* What is Process Mapping */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What is Process Mapping?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A visual story of how work gets done—the steps, who does them, and how information flows.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Current State (As-Is)</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Document how processes actually work today, not how they "should" work. 
                This reveals the real bottlenecks, inefficiencies, and opportunities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Capture actual workflow steps</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Identify inefficiencies and delays</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Map handoffs and ownership</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Future State (To-Be)</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Design improved processes that eliminate waste, reduce cycle time, 
                and enhance customer experience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Target className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Streamline workflow steps</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Automate manual processes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Improve decision points</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Essential for BA */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Process Mapping is Essential for Business Analysts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your BA practice with visual process documentation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="text-green-600" size={24} />}
              title="Reduces Confusion"
              description="Everyone sees the same picture. No more misaligned expectations or assumptions."
            />
            <FeatureCard
              icon={<AlertTriangle className="text-red-600" size={24} />}
              title="Surfaces Gaps"
              description="Identify missing steps, unclear ownership, and risky handoffs before they become problems."
            />
            <FeatureCard
              icon={<BookOpen className="text-blue-600" size={24} />}
              title="Drives Better Requirements"
              description="Clear workflows make user stories and acceptance criteria more precise and actionable."
            />
            <FeatureCard
              icon={<Target className="text-purple-600" size={24} />}
              title="Boosts Interview Performance"
              description="Confidently walk through real processes you've mapped during job interviews."
            />
          </div>
        </div>
      </section>

      {/* Core Symbols */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Core BPMN Symbols
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master these eight essential symbols to create professional process maps
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <SymbolCard
              title="Start Event"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-green-500">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="Where the process begins"
              whenToUse="First trigger (e.g., 'Customer submits request')"
              tips="One clear start is best"
            />
            
            <SymbolCard
              title="End Event"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-red-500">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                </svg>
              }
              meaning="Where the process finishes"
              whenToUse="Final outcome (e.g., 'Request approved')"
              tips="Use at least one end"
            />
            
            <SymbolCard
              title="Task"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-500">
                  <rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="A step of work"
              whenToUse="Any action ('Validate form', 'Send email')"
              tips="Name with verb + object: 'Verify identity'"
            />
            
            <SymbolCard
              title="Sub Process"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-teal-500">
                  <rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <rect x="4" y="8" width="16" height="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
                </svg>
              }
              meaning="A group of related tasks"
              whenToUse="Complex processes that can be broken down further"
              tips="Use to simplify complex diagrams and show hierarchy"
            />
            
            <SymbolCard
              title="Exclusive Gateway"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-indigo-500">
                  <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="A decision with one path taken"
              whenToUse="Yes/No or single-choice branching"
              tips="Phrase as a question; label each outgoing path"
            />
            
            <SymbolCard
              title="Pool/Lane (Swimlanes)"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-purple-500">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1"/>
                </svg>
              }
              meaning="Who does the work (role, team, system)"
              whenToUse="To show handoffs and ownership"
              tips="Keep titles short and consistent"
            />
            
            <SymbolCard
              title="Text Annotation"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-500">
                  <path d="M4,6 L20,6 L20,18 L4,18 L4,6 Z M8,10 L16,10 M8,14 L14,14" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20,12 L24,12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              }
              meaning="Extra statement, rule, or explanation"
              whenToUse="Business rules, exceptions, clarifications"
              tips="Attach to a task/flow with an association arrow"
            />
            
            <SymbolCard
              title="Sequence Flow"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-600">
                  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <polygon points="20,12 16,8 16,16" fill="currentColor"/>
                </svg>
              }
              meaning="The order of steps"
              whenToUse="Between tasks/events inside the same pool"
              tips="Label when it clarifies meaning ('Yes', 'No')"
            />
          </div>
        </div>
      </section>

      {/* How to Map */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How to Map an As-Is Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these 8 steps to create your first professional process map
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { step: 1, title: "Set Boundaries", desc: "Define the start trigger and end outcome" },
                  { step: 2, title: "List Actors", desc: "Add swimlanes for roles/teams/systems" },
                  { step: 3, title: "Add Main Steps", desc: "Place tasks in rough order—don't chase perfection yet" },
                  { step: 4, title: "Place Decisions", desc: "Add gateways only where paths actually change" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-6">
                {[
                  { step: 5, title: "Connect Flows", desc: "Link elements left→right, avoid crossing lines" },
                  { step: 6, title: "Add Annotations", desc: "Include rules, exceptions, timeouts, SLAs" },
                  { step: 7, title: "Check Story", desc: "Can a new teammate follow it without questions?" },
                  { step: 8, title: "Name Clearly", desc: "Verbs on tasks, questions on gateways, labels on flows" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Task */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Practice?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with this real-world scenario to build your process mapping skills
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-8 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Password Reset Process</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Brief:</h4>
                    <p className="text-blue-700">Map the as-is process for Password Reset at a typical online service.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">👥 Actors:</h4>
                    <p className="text-blue-700">Customer, App, Support</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">🎯 Start:</h4>
                    <p className="text-blue-700">Customer clicks "Forgot Password"</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">🏁 End:</h4>
                    <p className="text-blue-700">Customer successfully signs in with new password</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-800 mb-4">✅ Must Include:</h4>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                    <span>Decision for token validity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                    <span>Annotation for expiry ("Token expires in 15 minutes")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                    <span>Handoff to Support if user is locked out</span>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 Pro Tip:</strong> Start with swimlanes for the three actors, then add the main flow. 
                    Don't forget to include error paths and business rules!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Creating Professional Process Maps Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Business Analysts who use process mapping to deliver better requirements, 
            reduce confusion, and advance their careers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Navigate to the ProcessMapper component
                setCurrentView('process-mapper-editor');
              }}
              className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ArrowRight size={20} />
              Start Mapping Now
            </button>
            <button
              onClick={() => {
                // Navigate to the ProcessMapper component with sample
                setCurrentView('process-mapper-editor');
              }}
              className="inline-flex items-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-xl transition-all duration-300"
            >
              <Play size={20} />
              View Sample Map
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
