import { useStakeholderBot } from '../context/StakeholderBotContext';
import { MessageCircle, Sparkles } from 'lucide-react';

export const StakeholderBotLauncher = () => {
  const { openBot, currentUserStory } = useStakeholderBot();

  if (!currentUserStory) return null; // Hide if no user story yet

  return (
    <button
      onClick={openBot}
      className="group fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold">Ask Stakeholder</div>
          <div className="text-xs opacity-90">Get instant feedback</div>
        </div>
      </div>
    </button>
  );
};


