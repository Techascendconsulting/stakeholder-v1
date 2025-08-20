import React from 'react';
import { MessageSquare, Users, Mic } from 'lucide-react';

interface MeetingTypeSelectorProps {
  data: {
    meetingType: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const MeetingTypeSelector: React.FC<MeetingTypeSelectorProps> = ({ data, onUpdate, onNext }) => {
  const meetingTypes = [
    {
      id: 'transcript',
      icon: MessageSquare,
      title: 'Transcript Meeting',
      description: 'Text-based structured interview with AI stakeholders',
      duration: '45-60 minutes',
      features: [
        'Real-time transcript',
        'Stage-aware guidance',
        'Multi-stakeholder support'
      ]
    },
    {
      id: 'group',
      icon: Users,
      title: 'Group Interview',
      description: 'Interactive group session with multiple stakeholders',
      duration: '60-90 minutes',
      features: [
        'Group dynamics',
        'Collaborative discussion',
        'Consensus building'
      ]
    },
    {
      id: 'voice',
      icon: Mic,
      title: 'Voice Chat (ElevenLabs)',
      description: 'Natural voice conversation with AI-powered stakeholders',
      duration: '30-45 minutes',
      features: [
        'Natural speech',
        'Voice synthesis',
        'Real-time interaction'
      ]
    }
  ];

  const handleSelect = (typeId: string) => {
    onUpdate({ meetingType: typeId });
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Meeting Type</h2>
        <p className="text-gray-600 dark:text-gray-300">Select how you'd like to conduct your stakeholder interview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {meetingTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`text-left p-6 bg-white dark:bg-gray-800 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
              data.meetingType === type.id
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-slate-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <type.icon className={`w-6 h-6 ${
                data.meetingType === type.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
              }`} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{type.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{type.description}</p>
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">{type.duration}</div>
            <ul className="space-y-2">
              {type.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MeetingTypeSelector;
