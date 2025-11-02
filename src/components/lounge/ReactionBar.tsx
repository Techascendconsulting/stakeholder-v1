import React from 'react';

interface Reaction {
  emoji: string;
  count: number;
  user_reacted: boolean;
}

interface ReactionBarProps {
  reactions: Reaction[];
  onReaction: (emoji: string) => void;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, onReaction }) => {
  const defaultEmojis = ['👍', '🎉', '🤔', '😂', '❤️'];

  const handleReaction = (emoji: string) => {
    onReaction(emoji);
  };

  // Get reaction count for a specific emoji
  const getReactionCount = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction?.count || 0;
  };

  // Check if user has reacted with a specific emoji
  const hasUserReacted = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction?.user_reacted || false;
  };

  return (
    <div className="flex items-center space-x-1">
      {defaultEmojis.map((emoji) => {
        const count = getReactionCount(emoji);
        const userReacted = hasUserReacted(emoji);
        
        return (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              userReacted
                ? 'bg-violet-100 text-violet-700 border border-violet-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && (
              <span className="text-xs">{count}</span>
            )}
          </button>
        );
      })}
      
      {/* Show any additional reactions that aren't in the default set */}
      {reactions
        .filter(reaction => !defaultEmojis.includes(reaction.emoji))
        .map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => handleReaction(reaction.emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              reaction.user_reacted
                ? 'bg-violet-100 text-violet-700 border border-violet-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{reaction.emoji}</span>
            <span className="text-xs">{reaction.count}</span>
          </button>
        ))}
    </div>
  );
};

export default ReactionBar;
