import React from 'react';
import { ArrowRight, Target, TrendingUp, Clock, Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ProjectBriefProps {
  data: {
    projectId: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const ProjectBrief: React.FC<ProjectBriefProps> = ({ data, onUpdate, onNext }) => {
  const { projects } = useApp();
  
  // Find the project based on the projectId
  const project = projects.find(p => p.id === data.projectId);
  
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-3">
          <Target className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Brief</h2>
        <p className="text-gray-600">Review the project details before setting up your meeting</p>
      </div>

      {/* Project Header with badges */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Layers className="w-4 h-4" />
            {project.complexity} Complexity
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-4 h-4" />
            {project.duration}
          </span>
          {project.relevantStakeholders?.length ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
              {project.relevantStakeholders.length} Key Stakeholders
            </span>
          ) : null}
        </div>
      </div>

      {/* Primary sections (single column) */}
      <div className="space-y-6 mb-6">
        {/* Business Context */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900">Business Context</h4>
          </div>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {project.businessContext}
          </p>
        </div>

        {/* Problem Statement */}
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900">Problem Statement</h4>
          </div>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {project.problemStatement}
          </p>
        </div>
      </div>

      {/* As-Is Process */}
      <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-200 p-6 mb-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-3">Current As-Is Process</h4>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{project.asIsProcess}</p>
      </div>

      {/* Business Goals */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 p-6 mb-8 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">Business Goals</h4>
        <ul className="space-y-2">
          {project.businessGoals?.map((goal, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 shadow"
        >
          <span>Continue to Meeting Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectBrief;
