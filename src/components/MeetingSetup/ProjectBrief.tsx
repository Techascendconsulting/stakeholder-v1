import React from 'react';
import { ArrowRight } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Brief</h2>
        <p className="text-gray-600">Review the project details before setting up your meeting</p>
      </div>

      {/* Project Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span className={`px-2 py-1 rounded-full ${
            project.priority === 'Critical' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {project.priority} Priority
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            {project.tier || 'Premium'}
          </span>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Project Overview</h4>
        <p className="text-gray-600 mb-4">{project.description}</p>
      </div>

      {/* Business Impact */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <h4 className="font-semibold text-green-800 mb-2">Business Impact</h4>
          <p className="text-2xl font-bold text-green-600 mb-1">{project.businessImpact || '£1.8M'}</p>
          <p className="text-sm text-green-700">Annual Cost Savings</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h4 className="font-semibold text-blue-800 mb-2">ROI Potential</h4>
          <p className="text-2xl font-bold text-blue-600 mb-1">{project.roiPotential || '340%'}</p>
          <p className="text-sm text-blue-700">Expected Return</p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <span>Continue to Meeting Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectBrief;
