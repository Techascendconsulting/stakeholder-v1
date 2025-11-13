import React from 'react';
import { ArrowRight, Users, FileText, Target, Zap, CheckCircle2, Play, Building2, TrendingUp } from 'lucide-react';

interface BAInActionIntroProps {
  onContinue: () => void;
}

const BAInActionIntro: React.FC<BAInActionIntroProps> = ({ onContinue }) => {
  const journeySteps = [
    { id: 1, label: 'Join & Orientation', icon: Users },
    { id: 2, label: 'Understand the Problem', icon: Target },
    { id: 3, label: 'Stakeholder Mapping', icon: Building2 },
    { id: 4, label: 'Stakeholder Communication', icon: Users },
    { id: 5, label: 'Process Analysis', icon: TrendingUp },
    { id: 6, label: 'Requirements & Docs', icon: FileText },
    { id: 7, label: 'Agile Delivery', icon: Zap },
    { id: 8, label: 'Handover & Tracking', icon: CheckCircle2 },
    { id: 9, label: 'Continuous Improvement', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Hero Content */}
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-6">
              <Play className="w-4 h-4" />
              <span>Immersive Learning Experience</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              BA in Action
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Shadow a real Business Analyst from Day 1 through delivery
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the complete BA workflow—stakeholder meetings, documentation, requirements, and decisions—as if you're on a real project team.
            </p>
          </div>

          {/* Hero Image Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-200 dark:border-purple-800">
              <img 
                src="/images/collaborate1.jpg" 
                alt="BA team collaboration and stakeholder meetings"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // Fallback to gradient if image doesn't load
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.className += ' bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 min-h-[400px] flex items-center justify-center';
                    parent.innerHTML = '<div class="text-white text-center p-12"><Users class="w-24 h-24 mx-auto mb-6 opacity-80" /><h3 class="text-3xl font-bold mb-4">Business Analyst in Action</h3><p class="text-xl opacity-90">Real project experience, step by step</p></div>';
                  }
                }}
              />
              {/* Overlay gradient for better text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What You'll Experience
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              This isn't theory—it's a step-by-step walkthrough of real BA work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real Stakeholder Conversations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See how BAs actually talk to stakeholders, ask questions, and handle pushback
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Actual Documentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Review real artifacts—requirements, process maps, user stories that developers actually use
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Critical Decisions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Understand the trade-offs, constraints, and reasoning behind every BA choice
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Overview Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your 9-Step Journey
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Follow the complete BA project lifecycle from Day 1 to continuous improvement
          </p>
        </div>

        {/* Journey Steps Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 mb-12 max-w-6xl mx-auto">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    {step.id}
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                    {step.label}
                  </p>
                </div>
                {index < journeySteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-7 left-full ml-2 w-4 h-4 text-purple-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* What Makes This Different */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why This Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Real-World Context</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Every decision happens in a realistic business environment with actual constraints
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Complete Picture</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  See the full project lifecycle, not just isolated concepts or techniques
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Portfolio Ready</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Complete projects you can talk about in interviews with concrete examples
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Self-Paced</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Work through each step at your own speed, revisit sections as needed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <span>Choose Your Project</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Select from beginner-friendly or advanced projects to match your experience level
          </p>
        </div>
      </div>
    </div>
  );
};

export default BAInActionIntro;

