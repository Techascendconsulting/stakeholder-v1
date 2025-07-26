import React from 'react';
import { Users, ArrowRight, Target, TrendingUp, DollarSign, Star, Crown, CheckCircle, Building2 } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  title: string;
  description: string;
  complexity: string;
  stakeholders?: number;
  impact?: string;
  roi?: string;
  priority?: string;
  category?: string;
  estimatedTime?: string;
  difficulty?: string;
}

interface ProjectCardProps {
  project: Project;
  onProjectSelect: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onProjectSelect }) => {
  const getComplexityConfig = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Beginner Friendly'
        };
      case 'Intermediate':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'Intermediate'
        };
      case 'Advanced':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: <Crown className="w-4 h-4" />,
          label: 'Advanced'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: <Star className="w-4 h-4" />,
          label: complexity
        };
    }
  };

  const complexityConfig = getComplexityConfig(project.complexity || project.difficulty || 'Intermediate');

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1 w-full"></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                {project.title || project.name}
              </h3>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${complexityConfig.color}`}>
            {complexityConfig.icon}
            {complexityConfig.label}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {project.description}
        </p>

        {/* Key Metrics Row */}
        <div className="mb-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-500">Category</span>
            </div>
            <p className="font-semibold text-slate-900 text-sm">{project.category || 'Business Analysis'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            {project.stakeholders && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">{project.stakeholders} stakeholders</span>
              </div>
            )}
            {project.impact && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-500">{project.impact} impact</span>
              </div>
            )}
          </div>
          {project.roi && (
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">{project.roi} ROI</span>
            </div>
          )}
        </div>

        {/* Learning Highlights */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">What You'll Learn</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
              Stakeholder Management
            </span>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
              Requirements Analysis
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
              Process Improvement
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onProjectSelect(project)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
        >
          <span>Start Project</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;