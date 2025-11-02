import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ProjectSelection from './ProjectSelection';
import MeetingSetup from './MeetingSetup';
import ActiveMeeting from './ActiveMeeting';
import { Project, MeetingType, Stakeholder } from '../types/meeting';

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Customer Onboarding Process Optimization',
    description: 'Analyze and redesign the customer onboarding workflow to reduce time-to-value, improve customer satisfaction score...',
    businessImpact: '£1.8M Annual Cost Savings',
    roiPotential: '340% Expected Return',
    priority: 'High Priority',
    tier: 'Premium',
    status: 'available'
  },
  {
    id: '2',
    name: 'Digital Expense Management System Implementation',
    description: 'Transform manual expense reporting processes through digital automation, implementing policy compliance controls...',
    businessImpact: '£250K Process Efficiency',
    roiPotential: '180% Expected Return',
    priority: 'Critical Priority',
    tier: 'Enterprise',
    status: 'active'
  },
  {
    id: '3',
    name: 'Multi-Location Inventory Management Enhancement',
    description: 'Optimize inventory levels across 15 warehouse locations through real-time visibility, demand forecasting integration...',
    businessImpact: '£3.3M Revenue Impact',
    roiPotential: '420% Expected Return',
    priority: 'High Priority',
    tier: 'Premium',
    status: 'available'
  }
];

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

export default function MeetingInterface() {
  const [currentStep, setCurrentStep] = useState<'project' | 'setup' | 'meeting'>('project');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMeetingType, setSelectedMeetingType] = useState<MeetingType | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentStep('setup');
  };

  const handleStartMeeting = (meetingType: MeetingType, stakeholders: Stakeholder[]) => {
    setSelectedMeetingType(meetingType);
    setSelectedStakeholders(stakeholders);
    setCurrentStep('meeting');
  };

  const handleBackToProjects = () => {
    setCurrentStep('project');
    setSelectedProject(null);
    setSelectedMeetingType(null);
    setSelectedStakeholders([]);
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
    setSelectedMeetingType(null);
    setSelectedStakeholders([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {currentStep === 'project' && (
          <ProjectSelection 
            projects={SAMPLE_PROJECTS}
            onProjectSelect={handleProjectSelect}
          />
        )}
        
        {currentStep === 'setup' && selectedProject && (
          <MeetingSetup
            project={selectedProject}
            meetingTypes={MEETING_TYPES}
            stakeholders={ALL_STAKEHOLDERS}
            onStartMeeting={handleStartMeeting}
            onBack={handleBackToProjects}
          />
        )}
        
        {currentStep === 'meeting' && selectedProject && selectedMeetingType && (
          <ActiveMeeting
            project={selectedProject}
            meetingType={selectedMeetingType}
            stakeholders={selectedStakeholders}
            onBack={handleBackToSetup}
          />
        )}
      </div>
    </div>
  );
}