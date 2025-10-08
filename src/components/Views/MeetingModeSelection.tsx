import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MessageSquareText, Mic, Users, Clock, FileText, Volume2 } from 'lucide-react';

const MeetingModeSelection: React.FC = () => {
  const { 
    selectedProject, 
    selectedStakeholders, 
    setSelectedStakeholders,
    stakeholders,
    setCurrentView 
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  // Restore selectedStakeholders from localStorage on component mount
  useEffect(() => {
    const restoreStakeholders = () => {
      try {
        const raw = localStorage.getItem("meetingSetupProgress");
        if (raw) {
          const setup = JSON.parse(raw);
          console.log("🔍 MEETING_MODE_SELECTION: Setup data:", setup);
          
          if (setup?.meetingData?.selectedStakeholders && Array.isArray(setup.meetingData.selectedStakeholders)) {
            const selectedStakeholderIds = setup.meetingData.selectedStakeholders;
            const restoredStakeholders = stakeholders.filter(stakeholder => 
              selectedStakeholderIds.includes(stakeholder.id)
            );
            console.log("👥 MEETING_MODE_SELECTION: Restoring selected stakeholders:", restoredStakeholders.length);
            setSelectedStakeholders(restoredStakeholders);
          }
        }
      } catch (error) {
        console.error("❌ MEETING_MODE_SELECTION: Error restoring stakeholders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreStakeholders();
  }, [stakeholders, setSelectedStakeholders]);

  const handleModeSelection = (mode: 'transcript' | 'voice-only') => {
    if (mode === 'transcript') {
      setCurrentView('meeting');
    } else if (mode === 'voice-only') {
      setCurrentView('voice-only-meeting');
    }
  };

  // Show loading state while restoring data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading...</h2>
          <p className="text-gray-600 dark:text-gray-400">Restoring your meeting setup</p>
        </div>
      </div>
    );
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Setup Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please select a project and stakeholders first.</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Meeting Mode</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Select how you'd like to conduct your stakeholder interview
          </p>
        </div>

        {/* Project & Stakeholders Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Meeting Setup</h3>
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Project:</strong> {selectedProject.name}
              </p>
              <p className="text-blue-700 dark:text-blue-300 flex items-center mt-2">
                <Users className="w-4 h-4 mr-2" />
                <strong>Stakeholders:</strong> {selectedStakeholders.map(s => s.name).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* With Transcripts Mode */}
          <div 
            onClick={() => handleModeSelection('transcript')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                <MessageSquareText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">With Transcripts</h3>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                Full conversation view with real-time transcripts, message history, and detailed notes.
              </p>
              
              <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Complete conversation transcripts</span>
                </div>
                <div className="flex items-center justify-center">
                  <MessageSquareText className="w-4 h-4 mr-2" />
                  <span>Message-by-message view</span>
                </div>
                <div className="flex items-center justify-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  <span>Audio playback controls</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                  Start Transcript Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Voice-Only Mode */}
          <div 
            onClick={() => handleModeSelection('voice-only')}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-6 cursor-pointer hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/40 dark:hover:to-green-700/40 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">Voice-Only Meeting</h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Natural conversation flow without visible transcripts. Focus on the dialogue, not the text.
              </p>
              
              <div className="space-y-2 text-sm text-green-600 dark:text-green-400">
                <div className="flex items-center justify-center">
                  <Mic className="w-4 h-4 mr-2" />
                  <span>Voice-first interaction</span>
                </div>
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Real-time conversation</span>
                </div>
                <div className="flex items-center justify-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Natural meeting flow</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors w-full">
                  Start Voice Meeting
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // Check if we're in training hub flow vs regular elicitation practice
              const trainingConfigRaw = sessionStorage.getItem('trainingConfig');
              if (trainingConfigRaw) {
                try {
                  const config = JSON.parse(trainingConfigRaw);
                  if (config.isTrainingHub) {
                    // Training Hub flow - go back to training-practice (stakeholder selection)
                    setCurrentView('training-practice');
                  } else {
                    // Regular elicitation practice flow
                    setCurrentView('practice-2');
                  }
                } catch {
                  // Fallback to regular flow if parse fails
                  setCurrentView('practice-2');
                }
              } else {
                // No config - regular flow
                setCurrentView('practice-2');
              }
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 transition-colors"
          >
            ← Back to Stakeholder Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingModeSelection;