import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Layers, Shuffle, Users, Scale, ArrowRight } from 'lucide-react';

const SolutionOptions: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">📖 Solution Options</h1>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
              From problem to possible solutions — this is where the BA helps shape the way forward.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Intro Narrative */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            After elicitation, once the problem is clear and both the current (As-Is) and future (To-Be) states are understood,
            the next step is to explore how the problem could be solved. This hub is about generating and evaluating possible
            solution options. As a BA, you don’t invent solutions in isolation — you facilitate conversations, capture trade-offs,
            and ensure options are tied to business needs. In real projects, you’ll work closely with Solution Architects,
            Tech Leads, and Testers to shape solutions that are realistic, valuable, and testable.
          </p>
        </div>

        {/* What You’ll Explore */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What You’ll Explore Here</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center"><Shuffle className="w-5 h-5" /></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Types of Solutions</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Options may include system enhancements, process changes, manual workarounds, automation, or outsourcing.
              </p>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center"><Layers className="w-5 h-5" /></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">The BA’s Role</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Keep discussions anchored to the problem. Document options, trade-offs, and assumptions. Prevent premature solutionising.
              </p>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><Users className="w-5 h-5" /></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Working with Experts</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Collaborate with Solution Architects, Tech Leads, and Testers — the “Three Amigos” — to ensure options are feasible, valuable, and testable.
              </p>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center"><Scale className="w-5 h-5" /></div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Decision Making</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Compare options based on value, feasibility, cost, and risk. The BA facilitates and records the decision process.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-center shadow-md">
          <p className="text-white/90 mb-4 text-lg">
            This hub sets the stage for the Design and MVP hubs that follow. Ready to continue?
          </p>
          <button
            onClick={() => setCurrentView('design-hub')}
            className="inline-flex items-center px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-white/90 transition-all"
          >
            Go to Design <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SolutionOptions;


