import React from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import Dashboard from '../Views/Dashboard';
import CoreConceptsView from '../Views/CoreConceptsView';
import GuidedPracticeHub from '../Views/GuidedPracticeHub';
import ProjectsView from '../Views/ProjectsView';
import MeetingView from '../Views/MeetingView';
import { VoiceOnlyMeetingView } from '../Views/VoiceOnlyMeetingView';
import { MyMeetingsView } from '../Views/MyMeetingsView';
import { MeetingHistoryView } from '../Views/MeetingHistoryView';
import { MeetingSummaryView } from '../Views/MeetingSummaryView';
import { MeetingDetailsView } from '../Views/MeetingDetailsView';
import { RawTranscriptView } from '../Views/RawTranscriptView';
import { InterviewNotesView } from '../Views/InterviewNotesView';
import DeliverablesView from '../Views/DeliverablesView';
import { ProfileView } from '../Views/ProfileView';
import AnalysisView from '../Views/AnalysisView';
import CustomProjectView from '../Views/CustomProjectView';
import CustomStakeholdersView from '../Views/CustomStakeholdersView';
import { AgileHubView } from '../Views/AgileHubView';
import ElevenLabsMultiAgentMeeting from '../Views/ElevenLabsMultiAgentMeeting';
import IndividualAgentMeeting from '../Views/IndividualAgentMeeting';
import ProjectView from '../Views/ProjectView';
import DebugConsole from '../Debug/DebugConsole';

const MainLayout: React.FC = () => {
  const { currentView, isLoading, selectedProject } = useApp();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'core-concepts':
        return <CoreConceptsView />;
      case 'guided-practice-hub':
        return <GuidedPracticeHub />;
      case 'projects':
        return <ProjectsView />;
      case 'project-setup':
        return selectedProject ? <ProjectView projectId={selectedProject.id} /> : <ProjectsView />;
      case 'meeting':
        return <MeetingView />;
      case 'voice-only-meeting':
        return <VoiceOnlyMeetingView />;
      case 'my-meetings':
        return <MyMeetingsView />;
      case 'meeting-history':
        return <MeetingHistoryView />;
      case 'meeting-summary':
        return <MeetingSummaryView />;
      case 'meeting-details':
        return <MeetingDetailsView />;
      case 'raw-transcript':
        return <RawTranscriptView />;
      case 'notes':
        return <InterviewNotesView />;
      case 'deliverables':
        return <DeliverablesView />;
      case 'profile':
        return <ProfileView />;
      case 'analysis':
        return <AnalysisView />;
      case 'custom-project':
        return <CustomProjectView />;
      case 'custom-stakeholders':
        return <CustomStakeholdersView />;
      case 'agile-hub':
        return <AgileHubView />;
      case 'elevenlabs-meeting':
        return <ElevenLabsMultiAgentMeeting />;
      case 'individual-agent-meeting':
        return <IndividualAgentMeeting />;
      default:
        return <ProjectsView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {renderView()}
      </main>
      <DebugConsole />
    </div>
  );
};

export default MainLayout;