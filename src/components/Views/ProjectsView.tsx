import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import ProjectGrid from '../ProjectGrid';
import { type Project } from '../ProjectCard';
import { Sparkles, Zap } from 'lucide-react';

const ProjectsView: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView, setSelectedProject } = useApp();

  // Sample project data adapted to our app
  const projects: Project[] = [
    {
      id: "1",
      name: "Customer Onboarding Process Optimization",
      title: "Customer Onboarding Process Optimization",
      description: "Analyze and redesign the customer onboarding workflow to reduce time-to-value, improve customer satisfaction scores, and decrease early-stage churn rates through systematic process improvement.",
      complexity: "Intermediate",
      category: "Process Improvement",
      stakeholders: 4,
      impact: "High",
      roi: "25%"
    },
    {
      id: "2", 
      name: "AI-Powered Marketing Campaign Analysis",
      title: "AI-Powered Marketing Campaign Analysis", 
      description: "Develop machine learning models to analyze campaign performance across multiple channels, predict optimal budget allocation, and automate A/B testing recommendations.",
      complexity: "Advanced",
      category: "Data Science",
      stakeholders: 6,
      impact: "High",
      roi: "40%"
    },
    {
      id: "3",
      name: "Mobile App User Experience Redesign", 
      title: "Mobile App User Experience Redesign",
      description: "Conduct user research and redesign the mobile application interface to improve user engagement, reduce bounce rates, and increase conversion rates through improved UX/UI design.",
      complexity: "Intermediate", 
      category: "UX/UI Design",
      stakeholders: 5,
      impact: "Medium",
      roi: "20%"
    },
    {
      id: "4",
      name: "Supply Chain Automation System",
      title: "Supply Chain Automation System", 
      description: "Build an automated system to optimize inventory management, predict demand fluctuations, and streamline vendor relationships through intelligent automation and data analytics.",
      complexity: "Advanced",
      category: "Automation",
      stakeholders: 8,
      impact: "High", 
      roi: "35%"
    },
    {
      id: "5",
      name: "Employee Training Portal Development",
      title: "Employee Training Portal Development",
      description: "Create an interactive learning management system with gamification elements to improve employee skill development and track training progress across departments.",
      complexity: "Beginner",
      category: "Web Development",
      stakeholders: 3,
      impact: "Medium",
      roi: "15%"
    },
    {
      id: "6",
      name: "Financial Risk Assessment Model", 
      title: "Financial Risk Assessment Model",
      description: "Develop predictive models to assess financial risks, identify potential fraud patterns, and provide real-time risk scoring for transaction processing.",
      complexity: "Advanced",
      category: "FinTech",
      stakeholders: 7,
      impact: "High",
      roi: "50%"
    }
  ];

  const handleProjectSelect = (project: Project) => {
    setSelectedProject({
      id: project.id,
      name: project.name || project.title,
      description: project.description,
      complexity: project.complexity
    });
    setCurrentView('meeting-room');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Zap className="text-indigo-600 animate-pulse" size={32} />
              <Sparkles className="absolute -top-1 -right-1 text-purple-600 animate-bounce" size={16} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Project Hub
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl">
            Choose from our curated collection of projects designed to challenge your skills and drive real-world impact. Each project is carefully crafted with clear objectives and success metrics.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <ProjectGrid projects={projects} onProjectSelect={handleProjectSelect} />
      </div>
    </div>
  );
};

export default ProjectsView;