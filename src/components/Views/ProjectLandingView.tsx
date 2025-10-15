import React from 'react';
import { 
  FolderOpen, 
  Workflow, 
  Calendar, 
  Map,
  FileText,
  BookText,
  ArrowRight,
  Play,
  Users,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ProjectCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  actionText: string;
  viewId: string;
  isNew?: boolean;
}

const ProjectLandingView: React.FC = () => {
  const { setCurrentView } = useApp();

  const projectCategories: ProjectCategory[] = [
    {
      id: 'projects',
      title: 'Project Workspace',
      description: 'Manage your active projects and collaborate with stakeholders',
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Project Dashboard',
        'Stakeholder Management',
        'Requirements Tracking',
        'Document Collaboration'
      ],
      actionText: 'Open Workspace',
      viewId: 'projects'
    },
    {
      id: 'agile-scrum',
      title: 'Agile Hub',
      description: 'Conduct Agile ceremonies and manage your Scrum activities',
      icon: Workflow,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'Sprint Planning',
        'Daily Standups',
        'Retrospectives',
        'Backlog Management'
      ],
      actionText: 'Enter Agile Hub',
      viewId: 'agile-scrum'
    },
    {
      id: 'meeting-history',
      title: 'Meeting History',
      description: 'Review past meetings and track stakeholder interactions',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      features: [
        'Meeting Transcripts',
        'Action Items',
        'Stakeholder Notes',
        'Follow-up Tracking'
      ],
      actionText: 'View History',
      viewId: 'meeting-history'
    },
    {
      id: 'project-deliverables',
      title: 'Project Deliverables',
      description: 'Create and manage your project documentation and artifacts',
      icon: Map,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      features: [
        'Requirements Documents',
        'Process Maps',
        'User Stories',
        'Acceptance Criteria'
      ],
      actionText: 'Manage Deliverables',
      viewId: 'project-deliverables'
    },
    {
      id: 'my-deliverables',
      title: 'My Deliverables',
      description: 'Access your personal library of BA artifacts and templates',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Document Library',
        'Template Gallery',
        'Version Control',
        'Sharing & Export'
      ],
      actionText: 'Browse Library',
      viewId: 'deliverables'
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      description: 'Showcase your work and build your professional portfolio',
      icon: BookText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'Project Showcase',
        'Skill Demonstrations',
        'Achievement Gallery',
        'Professional Profile'
      ],
      actionText: 'View Portfolio',
      viewId: 'portfolio',
      isNew: true
    }
  ];

  const handleCategoryClick = (viewId: string) => {
    setCurrentView(viewId as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header */}
      <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Project Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Manage your projects, collaborate with stakeholders, and deliver exceptional results
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Project Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => handleCategoryClick(category.viewId)}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                {/* Category Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 ${category.bgColor} rounded-2xl`}>
                    <Icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    {category.isNew && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
                        NEW
                      </span>
                    )}
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </div>

                {/* Category Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-2">
                    {category.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg group-hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category.viewId);
                  }}
                >
                  {category.actionText}
                </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ProjectLandingView;

















