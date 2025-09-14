import { useStakeholderBot } from '../context/StakeholderBotContext';
import { MessageCircle, Sparkles } from 'lucide-react';

export const StakeholderBotLauncher = () => {
  const { openBot, currentUserStory, isOpen } = useStakeholderBot();

  // Debug logging
  console.log('StakeholderBotLauncher rendered', { currentUserStory });

  // Don't show the floating button when the bot panel is already open
  if (isOpen) return null;

  return (
    <button
      onClick={openBot}
      className="group fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        backgroundColor: '#7c3aed',
        color: 'white',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '2px solid #ffffff',
        minWidth: '200px'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold">Ask Stakeholder</div>
          <div className="text-xs opacity-90">
            {currentUserStory ? 'Get instant feedback' : 'Ask about scenarios'}
          </div>
        </div>
      </div>
    </button>
  );
};


