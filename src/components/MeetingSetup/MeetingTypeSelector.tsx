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

  // Color tokens to match app accents per card
  const typeStyles: Record<string, {
    tint: string; // light bg tint
    ring: string; // ring/border color
    iconBg: string; // icon circle bg
    iconColor: string;
    hoverBorder: string;
  }> = {
    transcript: { tint: 'bg-indigo-50', ring: 'ring-indigo-500 border-indigo-500', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', hoverBorder: 'hover:border-indigo-200' },
    group:      { tint: 'bg-blue-50',   ring: 'ring-blue-500 border-blue-500',     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   hoverBorder: 'hover:border-blue-200' },
    voice:      { tint: 'bg-purple-50', ring: 'ring-purple-500 border-purple-500', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', hoverBorder: 'hover:border-purple-200' },
  };

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
            className={`p-6 bg-white dark:bg-gray-800 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
              data.meetingType === type.id
                ? `${typeStyles[type.id]?.ring || 'ring-2 ring-indigo-500 border-indigo-500'} ${typeStyles[type.id]?.tint || ''}`
                : `border-slate-200 dark:border-gray-700 ${typeStyles[type.id]?.hoverBorder || 'hover:border-indigo-200'} dark:hover:border-indigo-800`
            } min-h-[280px] flex flex-col items-center text-center`}
          >
            <div className={`w-12 h-12 rounded-full ${typeStyles[type.id]?.iconBg || 'bg-slate-100'} flex items-center justify-center mb-3`}>
              <type.icon className={`w-6 h-6 ${data.meetingType === type.id ? (typeStyles[type.id]?.iconColor || 'text-indigo-600') : (typeStyles[type.id]?.iconColor || 'text-slate-600')}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{type.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{type.description}</p>
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">{type.duration}</div>
            <ul className="space-y-2">
              {type.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
                  <span>{feature}</span>
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
