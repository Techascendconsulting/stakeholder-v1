import React from 'react';

interface ProjectBriefProps {
  data: {
    projectId: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const ProjectBrief: React.FC<ProjectBriefProps> = ({ data, onUpdate, onNext }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Brief
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Review the project details before setting up your meeting
          </p>
          
          {/* Project content will be dynamically loaded based on projectId */}
          
          <div className="mt-6">
            <button
              onClick={onNext}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Meeting Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBrief;
