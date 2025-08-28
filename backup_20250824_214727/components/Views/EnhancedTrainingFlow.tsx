import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProjectsView from './ProjectsView';
import MeetingSetup from '../MeetingSetup';
import { Project, MeetingType, Stakeholder } from '../../types/meeting';

// Define meeting types that integrate with existing app functionality
const MEETING_TYPES: MeetingType[] = [
  {
    id: 'transcript',
    name: 'Transcript Meeting',
    description: 'Text-based structured interview with AI stakeholders',
    icon: '💬',
    duration: '45-60 minutes',
    features: ['Real-time transcript', 'Stage-aware guidance', 'Multi-stakeholder support']
  },
  {
    id: 'group',
    name: 'Group Interview',
    description: 'Interactive group session with multiple stakeholders',
    icon: '👥',
    duration: '60-90 minutes',
    features: ['Group dynamics', 'Collaborative discussion', 'Consensus building']
  },
  {
    id: 'voice',
    name: 'Voice Chat (ElevenLabs)',
    description: 'Natural voice conversation with AI-powered stakeholders',
    icon: '🎙️',
    duration: '30-45 minutes',
    features: ['Natural speech', 'Voice synthesis', 'Real-time interaction']
  }
];

// Define stakeholders that integrate with existing app data
const ALL_STAKEHOLDERS: Stakeholder[] = [
  {
    id: '1',
    name: 'James Walker',
    role: 'Head of Operations',
    department: 'Operations',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
    background: 'James leads operational excellence initiatives across the organization with 15 years of experience in process optimization and operational strategy.'
  },
  {
    id: '2',
    name: 'Jess Morgan',
    role: 'Customer Service Manager',
    department: 'Customer Service',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
    background: 'Manages customer service operations with 10 years of experience in customer experience management and service delivery optimization.'
  },
  {
    id: '3',
    name: 'Sarah Patel',
    role: 'HR Business Partner',
    department: 'Human Resources',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
    background: 'HR Business Partner specializing in change management and employee training needs with 8 years of experience in organizational development.'
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'IT Systems Lead',
    department: 'Information Technology',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
    background: 'David leads IT systems architecture and implementation with 12 years of experience in enterprise technology solutions.'
  },
  {
    id: '5',
    name: 'Robert Kim',
    role: 'Customer Experience Manager',
    department: 'Customer Experience',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
    background: 'Manages customer experience initiatives with focus on satisfaction improvement and service delivery optimization.'
  }
];

const EnhancedTrainingFlow: React.FC = () => {
  const { projects, selectedProject, setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState<'projects' | 'setup'>('projects');
  const [selectedTrainingProject, setSelectedTrainingProject] = useState<Project | null>(null);

  // Convert existing project to new format
  const convertToMeetingProject = (project: any): Project => {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      businessImpact: project.businessImpact || '£1.8M Annual Cost Savings',
      roiPotential: project.roiPotential || '340% Expected Return',
      priority: project.priority === 'Critical' ? 'Critical Priority' : 'High Priority',
      tier: project.tier || 'Premium',
      status: 'available'
    };
  };

  const handleProjectSelect = (project: any) => {
    const meetingProject = convertToMeetingProject(project);
    setSelectedTrainingProject(meetingProject);
    setCurrentStep('setup');
  };

  const handleStartMeeting = async (meetingType: MeetingType, stakeholders: Stakeholder[], selectedStage: any) => {
    // Validate that stakeholders are selected
    if (!stakeholders || stakeholders.length === 0) {
      alert('Please select at least one stakeholder before starting the meeting.');
      return;
    }

    try {
      // Store the selected configuration for the meeting
      const meetingConfig = {
        project: selectedTrainingProject,
        meetingType,
        stakeholders,
        selectedStage
      };
      
      // Store this in sessionStorage for the meeting interface to access
      sessionStorage.setItem('trainingMeetingConfig', JSON.stringify(meetingConfig));
      
      // Navigate to appropriate meeting view based on meeting type
      if (meetingType.id === 'voice') {
        setCurrentView('voice-only-meeting');
      } else {
        setCurrentView('meeting');
      }
    } catch (error) {
      console.error('Error starting meeting:', error);
      alert('Error starting meeting. Please try again.');
    }
  };

  const handleBackToProjects = () => {
    setCurrentStep('projects');
    setSelectedTrainingProject(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 'projects' && (
        <div>
          {/* We'll render our own project selection that integrates with the existing data */}
          <ProjectsView />
        </div>
      )}
      
      {currentStep === 'setup' && selectedTrainingProject && (
        <MeetingSetup
          project={selectedTrainingProject}
          meetingTypes={MEETING_TYPES}
          stakeholders={ALL_STAKEHOLDERS}
          onStartMeeting={handleStartMeeting}
          onBack={handleBackToProjects}
        />
      )}
    </div>
  );
};

export default EnhancedTrainingFlow;
