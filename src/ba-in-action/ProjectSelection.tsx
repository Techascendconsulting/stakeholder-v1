import React from 'react';
import { Building2, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import { PROJECTS, ProjectData } from './projectData';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';

interface ProjectSelectionProps {
  onSelect: (projectId: 'cif' | 'voids') => void;
}

const ProjectCard: React.FC<{ project: ProjectData; onSelect: () => void }> = ({ project, onSelect }) => {
  const difficultyLabels = {
    beginner: 'Beginner Friendly',
    advanced: 'Advanced',
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-2 border-white/50 rounded-2xl p-6 hover:border-blue-600 hover:shadow-2xl transition-all cursor-pointer group shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border-2 mb-3 ${
            project.difficulty === 'beginner' 
              ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
              : 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-600 border-blue-600/50 dark:border-blue-600/30'
          }`}>
            {difficultyLabels[project.difficulty]}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.industry}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0 border-2 border-blue-600/30">
          {project.id === 'voids' ? (
            <Building2 size={32} className="text-blue-600" />
          ) : (
            <TrendingUp size={32} className="text-indigo-600" />
          )}
        </div>
      </div>

      {/* Tagline */}
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 italic">
        {project.tagline}
      </p>

      {/* Problem Statement */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">The Problem</div>
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
          {project.problemStatement}
        </p>
      </div>

      {/* Business Goal */}
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-600/30 dark:border-blue-600/20 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-blue-600" />
          <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Your Goal</div>
        </div>
        <p className="text-sm text-gray-900 dark:text-white font-medium">
          {project.businessGoal}
        </p>
      </div>

      {/* Stakeholders Preview */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-gray-600 dark:text-gray-400" />
          <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold">Key Stakeholders</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.stakeholders.slice(0, 4).map((stakeholder) => (
            <div key={stakeholder.name} className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 text-gray-700 dark:text-gray-300">
              {stakeholder.role}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs Preview */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 font-semibold mb-2">Key Metrics</div>
        <div className="space-y-1">
          {project.kpis.map((kpi) => (
            <div key={kpi.name} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <CheckCircle2 size={12} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="font-medium">{kpi.name}:</span>
              <span className="text-gray-600 dark:text-gray-400">{kpi.baseline} → {kpi.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all shadow-md">
        Start This Project →
      </button>
    </div>
  );
};

export const ProjectSelection: React.FC<ProjectSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-800 dark:via-indigo-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your BA Project
          </h1>
          <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
            Select a project to shadow a Business Analyst from day 1 through delivery. Each project follows the same 9-step journey but with different stakeholders, artifacts, and complexity levels.
          </p>
        </div>

        {/* Guidance */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-white/30 rounded-2xl p-6 md:p-8 mb-8 max-w-4xl mx-auto shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
              <span className="text-white font-bold text-lg">?</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">Which project should I choose?</h3>
              <ul className="space-y-3 text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400 mt-0.5 text-lg">✓</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">New to BA work?</strong> Start with <strong className="text-blue-600">Voids (Housing)</strong> — more relatable, simpler concepts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 mt-0.5 text-lg">✓</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Have BA experience?</strong> Try <strong className="text-blue-600">CI&F (FinTech)</strong> — advanced concepts like risk scoring, compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-indigo-600 mt-0.5 text-lg">✓</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Building your portfolio?</strong> Complete <strong className="text-blue-600">both projects</strong> to show versatility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <ProjectCard project={PROJECTS.voids} onSelect={() => onSelect('voids')} />
          <ProjectCard project={PROJECTS.cif} onSelect={() => onSelect('cif')} />
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-white/80">
          <p>You can switch projects anytime from the BA In Action menu</p>
        </div>
      </div>
    </div>
  );
};

