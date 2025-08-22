import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Users, Target } from 'lucide-react';
import { Project, MeetingType, Stakeholder } from '../types/meeting';

const MEETING_STAGES = [
  {
    id: 'kickoff',
    name: 'Kickoff',
    objective: 'Establish rapport, set expectations, and understand the project context',
    description: 'Start here to practice introductions and setting the meeting foundation'
  },
  {
    id: 'discovery',
    name: 'Discovery',
    objective: 'Gather detailed requirements and understand current state processes',
    description: 'Practice asking probing questions and uncovering hidden requirements'
  },
  {
    id: 'analysis',
    name: 'Analysis',
    objective: 'Analyze gathered information and identify gaps or opportunities',
    description: 'Work through complex problem analysis with stakeholders'
  },
  {
    id: 'solution',
    name: 'Solution Design',
    objective: 'Collaborate on potential solutions and validate approaches',
    description: 'Practice facilitating solution discussions and getting buy-in'
  },
  {
    id: 'closure',
    name: 'Closure',
    objective: 'Summarize findings, confirm next steps, and close the session',
    description: 'Practice wrapping up meetings effectively with clear outcomes'
  }
];

interface MeetingSetupProps {
  project: Project;
  meetingTypes: MeetingType[];
  stakeholders: Stakeholder[];
  onStartMeeting: (meetingType: MeetingType, selectedStakeholders: Stakeholder[], selectedStage: any) => void;
  onBack: () => void;
}

export default function MeetingSetup({ 
  project, 
  meetingTypes, 
  stakeholders, 
  onStartMeeting, 
  onBack 
}: MeetingSetupProps) {
  const [selectedMeetingType, setSelectedMeetingType] = useState<MeetingType | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'brief' | 'meeting-type' | 'stakeholders' | 'stage' | 'ready'>('brief');

  const handleMeetingTypeSelect = (meetingType: MeetingType) => {
    setSelectedMeetingType(meetingType);
    setCurrentStep('stakeholders');
  };

  const handleStakeholderToggle = (stakeholder: Stakeholder) => {
    setSelectedStakeholders(prev => {
      const isSelected = prev.find(s => s.id === stakeholder.id);
      if (isSelected) {
        return prev.filter(s => s.id !== stakeholder.id);
      } else {
        return [...prev, stakeholder];
      }
    });
  };

  const handleContinue = () => {
    if (selectedStakeholders.length > 0) {
      setCurrentStep('stage');
    }
  };

  const handleStageSelect = (stage: any) => {
    setSelectedStage(stage);
    setCurrentStep('ready');
  };

  const handleStartMeeting = () => {
    if (selectedMeetingType && selectedStakeholders.length > 0 && selectedStage) {
      onStartMeeting(selectedMeetingType, selectedStakeholders, selectedStage);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Skip to Projects →
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className={`flex items-center space-x-2 ${
            currentStep === 'brief' ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep === 'brief' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Project Brief</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'meeting-type' ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep === 'meeting-type' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Meeting Type</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'stakeholders' ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep === 'stakeholders' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Stakeholders</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'stage' ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep === 'stage' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              4
            </div>
            <span className="text-sm font-medium">Select Stage</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'ready' ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep === 'ready' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}>
              5
            </div>
            <span className="text-sm font-medium">Ready</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Project Brief */}
        {currentStep === 'brief' && (
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
                  project.priority === 'High Priority' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {project.priority}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {project.tier}
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
                <p className="text-2xl font-bold text-green-600 mb-1">{project.businessImpact}</p>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h4 className="font-semibold text-blue-800 mb-2">ROI Potential</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">{project.roiPotential}</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep('meeting-type')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <span>Continue to Meeting Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Meeting Type Selection */}
        {currentStep === 'meeting-type' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Meeting Type</h2>
              <p className="text-gray-600">Select how you'd like to conduct your stakeholder interview</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {meetingTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleMeetingTypeSelect(type)}
                  className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{type.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                    <div className="text-xs text-indigo-600 font-medium mb-4">{type.duration}</div>
                    
                    <div className="space-y-2">
                      {type.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stakeholder Selection */}
        {currentStep === 'stakeholders' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Stakeholders</h2>
              <p className="text-gray-600">
                Choose one or multiple stakeholders for your <strong>{project.name}</strong> project
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Key Stakeholders for {project.name}</h3>
                  <p className="text-sm text-indigo-700">
                    These stakeholders have been selected based on their expertise and relevance to this project type.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {stakeholders.map((stakeholder) => {
                const isSelected = selectedStakeholders.find(s => s.id === stakeholder.id);
                return (
                  <div
                    key={stakeholder.id}
                    onClick={() => handleStakeholderToggle(stakeholder)}
                    className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={stakeholder.avatar}
                          alt={stakeholder.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{stakeholder.name}</h4>
                        <p className="text-sm text-indigo-600">{stakeholder.role}</p>
                        <p className="text-xs text-gray-500">{stakeholder.department}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      {stakeholder.background}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedStakeholders.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleContinue}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <span>Continue with {selectedStakeholders.length} stakeholder{selectedStakeholders.length > 1 ? 's' : ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stage Selection */}
        {currentStep === 'stage' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Meeting Stage</h2>
              <p className="text-gray-600">Choose which stage of the stakeholder interview you want to practice</p>
            </div>

            <div className="space-y-4 mb-8">
              {MEETING_STAGES.map((stage, index) => {
                const isDisabled = stage.id === 'kickoff';
                return (
                <div
                  key={stage.id}
                  onClick={() => !isDisabled && handleStageSelect(stage)}
                  className={`bg-white rounded-lg border-2 p-6 transition-all ${
                    isDisabled 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : selectedStage?.id === stage.id
                      ? 'border-indigo-500 bg-indigo-50 cursor-pointer'
                      : 'border-gray-200 hover:border-indigo-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedStage?.id === stage.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{stage.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{stage.objective}</p>
                      <p className="text-xs text-gray-500">{stage.description}</p>
                      {isDisabled && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                          Coming soon
                        </div>
                      )}
                    </div>
                    {selectedStage?.id === stage.id && (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedStage && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('ready')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <span>Continue with {selectedStage.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ready to Start */}
        {currentStep === 'ready' && selectedMeetingType && selectedStage && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Meeting</h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Meeting Type</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">{selectedMeetingType.icon}</span>
                    <span className="font-medium">{selectedMeetingType.name}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Meeting Stage</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">{selectedStage.name}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Stakeholders</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedStakeholders.map((stakeholder) => (
                      <div key={stakeholder.id} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 border">
                        <img
                          src={stakeholder.avatar}
                          alt={stakeholder.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{stakeholder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartMeeting}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <span>Start Meeting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}