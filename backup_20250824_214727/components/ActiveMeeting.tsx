import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, HelpCircle, MessageSquare, FileText, Users } from 'lucide-react';

interface ActiveMeetingProps {
  projectName: string;
  stakeholders: Stakeholder[];
  selectedStage: any;
  onBack: () => void;
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'stakeholder' | 'system';
  timestamp: Date;
  isRedirect?: boolean;
}

export default function ActiveMeeting({ projectName, stakeholders, selectedStage, onBack }: ActiveMeetingProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'stage' | 'brief'>('video');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const toggleVoice = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{projectName}</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Live Meeting • 0:06</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Transcription</span>
          <div className="w-8 h-4 bg-gray-600 rounded-full"></div>
          <button className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Video className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300">4 participants</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('video')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'video'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Video Call
        </button>
        <button
          onClick={() => setActiveTab('stage')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stage'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Meeting Stage
        </button>
        <button
          onClick={() => setActiveTab('brief')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'brief'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Project Brief
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'video' && (
          <div className="h-full flex flex-col">
            {/* Video Grid */}
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 gap-4 h-96">
                  {/* You tile */}
                  <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-white">A</span>
                      </div>
                      <p className="text-sm text-white">Business Analyst</p>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
                      You
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                        <MicOff className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Participant tiles */}
                  {stakeholders.slice(0, 3).map((stakeholder, index) => (
                    <div key={stakeholder.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={stakeholder.avatar}
                        alt={stakeholder.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
                        {stakeholder.name}
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                          <MicOff className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`p-2 rounded-lg transition-colors ${
                      isVoiceMode
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isVoiceMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'stage' && (
          <div className="h-full bg-white p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Stage Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Stage 1 of 5</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Stage Card */}
              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedStage?.name || 'Kickoff'}</h3>
                    <p className="text-gray-600">{selectedStage?.objective || 'Establish rapport, set expectations, and understand the project context'}</p>
                  </div>
                </div>
              </div>

              {/* Stage Objectives */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Stage Objectives</h4>
                <p className="text-gray-600">{selectedStage?.description || 'Practice the fundamentals of stakeholder engagement'}</p>
              </div>

              {/* Guidance */}
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Stage Guidance</h4>
                <p className="text-yellow-700 text-sm">
                  You are now practicing the <strong>{selectedStage?.name || 'Kickoff'}</strong> stage. 
                  Focus on the specific objectives for this stage and use appropriate techniques for this phase of the interview.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brief' && (
          <div className="h-full bg-white p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Project Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{projectName}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">High Priority</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Premium</span>
                </div>
              </div>

              {/* Project Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Project Overview</h3>
                <p className="text-gray-600 mb-4">
                  Analyze and redesign the customer onboarding workflow to reduce time-to-value, improve customer satisfaction score, 
                  and streamline the process for both customers and internal teams. This initiative aims to transform the current 
                  manual and fragmented onboarding experience into a seamless, automated journey.
                </p>
              </div>

              {/* Business Impact */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <h4 className="font-semibold text-green-800 mb-2">Business Impact</h4>
                  <p className="text-2xl font-bold text-green-600 mb-1">£1.8M</p>
                  <p className="text-sm text-green-700">Annual Cost Savings</p>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h4 className="font-semibold text-blue-800 mb-2">ROI Potential</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">340%</p>
                  <p className="text-sm text-blue-700">Expected Return</p>
                </div>
              </div>

              {/* Key Challenges */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Key Challenges</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span>Current onboarding takes 14+ days on average</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span>Multiple manual handoffs between departments</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span>Inconsistent customer experience across regions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span>Limited visibility into onboarding progress</span>
                  </li>
                </ul>
              </div>

              {/* Success Criteria */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Success Criteria</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Reduce onboarding time to 5 days or less</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Increase customer satisfaction score by 25%</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Automate 80% of manual processes</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Implement real-time progress tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}