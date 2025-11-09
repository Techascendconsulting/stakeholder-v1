import React from 'react';
import { Building2, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import { PROJECTS, ProjectData } from './projectData';
import { useBAInActionProject } from '../contexts/BAInActionProjectContext';

interface ProjectSelectionProps {
  onSelect: (projectId: 'cif' | 'voids') => void;
}

const ProjectCard: React.FC<{ project: ProjectData; onSelect: () => void }> = ({ project, onSelect }) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-300',
    advanced: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const difficultyLabels = {
    beginner: 'Beginner Friendly',
    advanced: 'Advanced',
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white border-2 border-slate-300 rounded-2xl p-6 hover:border-purple-500 hover:shadow-2xl transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border-2 mb-3 ${difficultyColors[project.difficulty]}`}>
            {difficultyLabels[project.difficulty]}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">{project.industry}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
          {project.id === 'voids' ? (
            <Building2 size={32} className="text-purple-600" />
          ) : (
            <TrendingUp size={32} className="text-indigo-600" />
          )}
        </div>
      </div>

      {/* Tagline */}
      <p className="text-slate-700 text-sm mb-4 italic">
        {project.tagline}
      </p>

      {/* Problem Statement */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">The Problem</div>
        <p className="text-sm text-slate-800 leading-relaxed">
          {project.problemStatement}
        </p>
      </div>

      {/* Business Goal */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-purple-600" />
          <div className="text-xs uppercase tracking-wide text-purple-700 font-semibold">Your Goal</div>
        </div>
        <p className="text-sm text-purple-900 font-medium">
          {project.businessGoal}
        </p>
      </div>

      {/* Stakeholders Preview */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-slate-600" />
          <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold">Key Stakeholders</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.stakeholders.slice(0, 4).map((stakeholder) => (
            <div key={stakeholder.name} className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-700">
              {stakeholder.role}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs Preview */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">Key Metrics</div>
        <div className="space-y-1">
          {project.kpis.map((kpi) => (
            <div key={kpi.name} className="flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
              <span className="font-medium">{kpi.name}:</span>
              <span className="text-slate-600">{kpi.baseline} → {kpi.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
        Start This Project →
      </button>
    </div>
  );
};

export const ProjectSelection: React.FC<ProjectSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your BA Project
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Select a project to shadow a Business Analyst from day 1 through delivery. Each project follows the same 9-step journey but with different stakeholders, artifacts, and complexity levels.
          </p>
        </div>

        {/* Guidance */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white font-bold text-sm">?</span>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Which project should I choose?</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600 mt-0.5">✓</span>
                  <span><strong>New to BA work?</strong> Start with <strong>Voids (Housing)</strong> — more relatable, simpler concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 mt-0.5">✓</span>
                  <span><strong>Have BA experience?</strong> Try <strong>CI&F (FinTech)</strong> — advanced concepts like risk scoring, compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 mt-0.5">✓</span>
                  <span><strong>Building your portfolio?</strong> Complete <strong>both projects</strong> to show versatility</span>
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
        <div className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          <p>You can switch projects anytime from the BA In Action menu</p>
        </div>
      </div>
    </div>
  );
};

