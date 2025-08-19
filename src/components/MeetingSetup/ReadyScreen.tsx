import React from 'react';
import { MessageSquare, Users, Mic } from 'lucide-react';

interface ReadyScreenProps {
  data: {
    meetingType: string;
    selectedStakeholders: string[];
    selectedStage: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const ReadyScreen: React.FC<ReadyScreenProps> = ({ data, onNext }) => {
  const meetingTypeIcons = {
    transcript: MessageSquare,
    group: Users,
    voice: Mic
  };

  const meetingTypeLabels = {
    transcript: 'Transcript Meeting',
    group: 'Group Interview',
    voice: 'Voice Chat (ElevenLabs)'
  };

  const stageLabels = {
    kickoff: 'Kickoff',
    discovery: 'Discovery',
    analysis: 'Analysis',
    solution: 'Solution Design',
    closure: 'Closure'
  };

  const Icon = meetingTypeIcons[data.meetingType as keyof typeof meetingTypeIcons];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <div className="text-2xl">👥</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ready to Start Your Meeting
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Meeting Type
          </div>
          <div className="flex items-center">
            {Icon && <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />}
            <span className="text-gray-900 dark:text-white">
              {meetingTypeLabels[data.meetingType as keyof typeof meetingTypeLabels]}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Meeting Stage
          </div>
          <div className="flex items-center">
            <span className="text-gray-900 dark:text-white">
              {stageLabels[data.selectedStage as keyof typeof stageLabels]}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Selected Stakeholders
          </div>
          <div className="flex flex-wrap gap-2">
            {data.selectedStakeholders.map((stakeholderId) => (
              <div
                key={stakeholderId}
                className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
              >
                <img
                  src={`/stakeholders/${stakeholderId}.jpg`}
                  alt=""
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  {stakeholderId.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onNext}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start Meeting
        </button>
      </div>
    </div>
  );
};

export default ReadyScreen;
