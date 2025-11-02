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

  // Solid color backgrounds per card
  const typeStyles: Record<string, {
    bg: string;
    hoverBg: string;
    ring: string;
    iconBg: string;
    iconColor: string;
  }> = {
    // Lighter full-color backgrounds to match app accents
    transcript: { bg: 'bg-purple-500', hoverBg: 'hover:bg-purple-600', ring: 'ring-white', iconBg: 'bg-white/10', iconColor: 'text-white' },
    group:      { bg: 'bg-blue-500',   hoverBg: 'hover:bg-blue-600',   ring: 'ring-white', iconBg: 'bg-white/10', iconColor: 'text-white' },
    voice:      { bg: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-600', ring: 'ring-white', iconBg: 'bg-white/10', iconColor: 'text-white' },
  };

  const handleSelect = (typeId: string) => {
    console.log('🔍 MEETING_TYPE_SELECTOR: User selected meeting type:', typeId);
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
            className={`p-6 rounded-2xl border transition-all shadow-sm ${typeStyles[type.id]?.bg || 'bg-slate-700'} ${typeStyles[type.id]?.hoverBg || ''} text-white ${
              data.meetingType === type.id ? `ring-2 ${typeStyles[type.id]?.ring || 'ring-white'}` : ''
            } min-h-[300px] flex flex-col items-center text-center border-transparent`}
          >
            <div className={`w-12 h-12 rounded-full ${typeStyles[type.id]?.iconBg || 'bg-white/10'} flex items-center justify-center mb-3`}>
              <type.icon className={`w-6 h-6 ${typeStyles[type.id]?.iconColor || 'text-white'}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
            <p className="text-white/90 mb-3 leading-relaxed">{type.description}</p>
            <div className="text-sm text-white/90 mb-3">{type.duration}</div>
            <ul className="space-y-2">
              {type.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white/70 rounded-full mr-2"></span>
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
