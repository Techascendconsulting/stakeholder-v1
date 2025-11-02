import React, { useState, useEffect } from 'react';
import { MeetingStage } from '../../types/stages';
import { StageIndicator } from '../StageIndicator';
import { useStagePrompt } from '../../hooks/useStagePrompt';
import { AIService } from '../../services/aiService';

export const StagedMeetingView: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<MeetingStage>('problem_exploration');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedStakeholder] = useState({
    name: 'Aisha',
    role: 'Customer Service Manager',
    department: 'Customer Support'
  });

  const { buildStagePrompt } = useStagePrompt({
    stakeholder: selectedStakeholder,
    currentStage,
    projectContext: {
      asIsProcess: [], // This should come from your project data
      problemStatement: '' // This should come from your project data
    }
  });

  const handleSendMessage = async (message: string) => {
    try {
      setIsTyping(true);
      
      // Add user message
      const userMessage = {
        content: message,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response with stage awareness
      const stagePrompt = buildStagePrompt();
      const response = await AIService.getInstance().generateResponse(message, stagePrompt);

      // Add AI response
      const aiMessage = {
        content: response,
        sender: 'ai',
        stakeholder: selectedStakeholder.name,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Check if stage completion criteria are met
      checkStageProgress(message, response);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const checkStageProgress = (userMessage: string, aiResponse: string) => {
    // Add logic to determine if stage objectives are met
    // This would check for key topics covered, understanding demonstrated, etc.
    // When met, enable progression to next stage
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <StageIndicator currentStage={currentStage} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isTyping && <TypingIndicator stakeholder={selectedStakeholder} />}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <MessageInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};
