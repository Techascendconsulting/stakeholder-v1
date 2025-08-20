import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { ChatMessage, Stakeholder } from '../types/meeting';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isVoiceMode: boolean;
  onToggleVoice: () => void;
  stakeholders: Stakeholder[];
}

export default function ChatArea({ 
  messages, 
  onSendMessage, 
  isVoiceMode, 
  onToggleVoice,
  stakeholders 
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-full">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {messages.length === 0 && (
              <p className="text-sm">Start the conversation to begin the Kickoff stage</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.isRedirect
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : message.sender === 'system'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {message.isRedirect && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-600">
                      Gentle Redirect
                    </span>
                  </div>
                )}
                
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' 
                    ? 'text-indigo-200' 
                    : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              type="button"
              onClick={onToggleVoice}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isVoiceMode
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isVoiceMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Stakeholder Panel */}
      <div className="w-80 border-l border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Active Stakeholders</h3>
        <div className="space-y-3">
          {stakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start space-x-3">
                <img
                  src={stakeholder.avatar}
                  alt={stakeholder.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stakeholder.name}</h4>
                  <p className="text-sm text-indigo-600">{stakeholder.role}</p>
                  <p className="text-xs text-gray-500">{stakeholder.department}</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}