import React from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAdmin } from '../../contexts/AdminContext';
import Dashboard from '../Views/Dashboard';
import CoreConceptsView from '../Views/CoreConceptsView';
import GuidedPracticeHub from '../Views/GuidedPracticeHub';
import ProjectsView from '../Views/ProjectsView';
import MeetingView from '../Views/MeetingView';
import { VoiceOnlyMeetingView } from '../Views/VoiceOnlyMeetingView';
import { MyMeetingsView } from '../Views/MyMeetingsView';
import { MeetingSummaryView } from '../Views/MeetingSummaryView';
import { MeetingDetailsView } from '../Views/MeetingDetailsView';
import { RawTranscriptView } from '../Views/RawTranscriptView';
import { InterviewNotesView } from '../Views/InterviewNotesView';
import DeliverablesView from '../Views/DeliverablesView';
import { ProfileView } from '../Views/ProfileView';
import AnalysisView from '../Views/AnalysisView';
import CustomProjectView from '../Views/CustomProjectView';
import CustomStakeholdersView from '../Views/CustomStakeholdersView';
import ScrumEssentialsView from '../Views/ScrumEssentialsView';
import ScrumLearningView from '../Views/ScrumLearningView';
import BAReferenceLibrary from '../Views/BAReferenceLibrary';
import HandbookView from '../Views/HandbookView';
import { AgileHubView } from '../Views/AgileHubView';
import ScrumPracticeView from '../Views/ScrumPracticeView';
import ElevenLabsMultiAgentMeeting from '../Views/ElevenLabsMultiAgentMeeting';
import IndividualAgentMeeting from '../Views/IndividualAgentMeeting';
import ProjectView from '../Views/ProjectView';
import EnhancedTrainingFlow from '../Views/EnhancedTrainingFlow';
import BAAcademyView from '../Views/BAAcademyView';
import ProjectInitiationView from '../Views/ProjectInitiationView';
import RequirementsEngineeringView from '../Views/RequirementsEngineeringView';
import DocumentationView from '../Views/DocumentationView';
import DocumentationPracticeView from '../Views/DocumentationPracticeView';
import MyResourcesView from '../Views/MyResourcesView';
import IntroductionToElicitation from '../Views/IntroductionToElicitation';
import SolutionOptions from '../Views/SolutionOptions';
import DesignHub from '../Views/DesignHub';
import MVPHub from '../Views/MVPHub';
import MyMentorship from '../Views/MyMentorship';
import BookSession from '../Views/BookSession';
import MentorFeedback from '../Views/MentorFeedback';
import CareerCoaching from '../Views/CareerCoaching';
import MyProgressWithMentor from '../Views/MyProgressWithMentor';
// Training Hub Views
import TrainingHubView from '../Views/TrainingHubView';
import PracticeHubCardsView from '../Views/PracticeHubCardsView';
import TrainingPracticeView from '../Views/TrainingPracticeView';
import TrainingAssessView from '../Views/TrainingAssessView';
import TrainingFeedbackView from '../Views/TrainingFeedbackView';
import TrainingDashboardView from '../Views/TrainingDashboardView';
import TrainingDeliverablesView from '../Views/TrainingDeliverablesView';
import ProjectDeliverablesView from '../Views/ProjectDeliverablesView';
import WelcomeView from '../Views/WelcomeView';
import MotivationPage from '../Views/MotivationPage';
import GetStartedView from '../Views/GetStartedView';
import ProcessMappingIntroView from '../Views/ProcessMappingIntroView';
// import AIProcessMapperView from '../Views/AIProcessMapperView'; // Archived
import DiagramCreationView from '../Views/DiagramCreationView';
import ProcessMapperView from '../Views/ProcessMapperView';
import TrainingUI from '../Views/TrainingUI';
import PracticeLabView from '../Views/PracticeLabView';
import LearnLandingView from '../Views/LearnLandingView';
import CommunityHub from '../Views/Community/CommunityHub';
import AdminCommunityHub from '../Views/Community/AdminCommunityHub';
import ProjectLandingView from '../Views/ProjectLandingView';
import AdminDashboard from '../AdminDashboard';
import AdminPanel from '../AdminPanel';
import MvpBuilder from '../Views/MvpBuilder';
import MeetingModeSelection from '../Views/MeetingModeSelection';
import CoreLearningView from '../Views/CoreLearningView';


const MainLayout: React.FC = () => {
  const { currentView, setCurrentView, isLoading, selectedProject } = useApp();
  const { isAdmin } = useAdmin();

  // Debug admin status
  console.log('🎨 ADMIN THEME: isAdmin =', isAdmin, 'currentView =', currentView);

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
    console.log('🔄 MainLayout: renderView called with currentView:', currentView);
    switch (currentView) {
      case 'welcome':
        return <WelcomeView />;
      case 'get-started':
        return <GetStartedView />;
      case 'dashboard':
        return <Dashboard />;
      case 'learn':
        return <LearnLandingView />;
      case 'learning-hub':
        return <CoreLearningView />; // This will be the main Learning Hub view
      case 'core-learning':
        return <CoreLearningView />;
      case 'project-initiation':
        return <ProjectInitiationView />;
      case 'requirements-engineering':
        return <RequirementsEngineeringView />;
      case 'solution-options':
        return <SolutionOptions />;
      case 'documentation':
        return <DocumentationView />;
      case 'documentation-practice':
        return <DocumentationPracticeView />;
      case 'design-hub':
        return <DesignHub />;
      case 'mvp-hub':
        return <MVPHub />;
      case 'mvp-engine':
        return <MvpBuilder />;
      case 'mvp-practice':
        return <MvpBuilder />;
        case 'practice':
          return <PracticeLabView />;
      case 'elicitation':
        return <IntroductionToElicitation />;
      case 'practice-2':
        return <GuidedPracticeHub />;
      case 'elicitation-hub':
        return <GuidedPracticeHub />;
      case 'motivation':
        return <MotivationPage />;
      case 'project':
        return <ProjectLandingView />;

      case 'core-concepts':
        return <CoreConceptsView />;
      case 'scrum-essentials':
        console.log('🔄 MainLayout: Rendering ScrumEssentialsView');
        return <ScrumEssentialsView />;
      case 'scrum-learning':
        console.log('🔄 MainLayout: Rendering ScrumLearningView');
        return <ScrumLearningView />;
      case 'agile-scrum':
        return <AgileHubView />;
      case 'ba-reference':
        return <BAReferenceLibrary />;
      case 'handbook':
        return <HandbookView />;
      case 'my-resources':
        return <MyResourcesView />;
      case 'progress-tracking':
        return <TrainingDashboardView />; // TODO: Create ProgressTrackingView
      case 'project-workspace':
        return <GuidedPracticeHub />;
      case 'meeting-history':
        return <MyMeetingsView />;
      case 'portfolio':
        return <DeliverablesView />; // TODO: Create PortfolioView
      case 'create-project':
        return <CustomProjectView />;
      case 'ba-fundamentals':
        return <BAAcademyView />;

      case 'process-mapper':
        return <ProcessMappingIntroView />;
      // case 'ai-process-mapper': // Archived
      //   return <AIProcessMapperView />;
      case 'process-mapper-editor':
        return <ProcessMapperView />;
      case 'diagram-creation':
        return <DiagramCreationView />;


      case 'advanced-topics':
        return <BAAcademyView />; // Will be enhanced later
      case 'projects':
        return <ProjectsView />;
      case 'project-setup':
        return selectedProject ? <ProjectView projectId={selectedProject.id} /> : <ProjectsView />;
      case 'meeting-mode-selection':
        return <MeetingModeSelection />;
      case 'meeting':
        return <MeetingView />;
      case 'voice-only-meeting':
        return <VoiceOnlyMeetingView />;
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
      case 'elevenlabs-meeting':
        return <ElevenLabsMultiAgentMeeting />;
      case 'individual-agent-meeting':
        return <IndividualAgentMeeting />;
      case 'enhanced-training-flow':
        return <EnhancedTrainingFlow />;
      // Training Hub Views
      case 'training-hub':
        return <TrainingHubView />;
      case 'training-hub-project-selection':
        return <TrainingHubView startingStep="project-selection" />;
      case 'practice-hub-cards':
        return <PracticeHubCardsView />;
      case 'agile-practice':
        return <ScrumPracticeView />; // TODO: Create this view for training scenarios
      case 'scrum-practice':
        return <ScrumPracticeView />;
      case 'training-practice':
        return <TrainingPracticeView />;
      case 'training-assess':
        return <TrainingAssessView />;
      case 'training-feedback':
        return <TrainingFeedbackView 
          sessionId=""
          stageId=""
          mode="practice"
          onBack={() => setCurrentView('training-hub')}
        />;
      case 'training-dashboard':
        return <TrainingDashboardView />;
      case 'training-deliverables':
        return <TrainingDeliverablesView />;
      case 'project-deliverables':
        return <ProjectDeliverablesView />;
            case 'user-story-checker':
              return <TrainingUI />;
      case 'admin':
        console.log('🔍 MAIN_LAYOUT: Rendering AdminDashboard');
        return <AdminDashboard />;
      case 'admin-panel':
        console.log('🔍 MAIN_LAYOUT: Rendering AdminPanel');
        return <AdminPanel />;
      case 'community-hub':
        return <CommunityHub />;
      case 'community-admin':
        return <AdminCommunityHub onBack={() => setCurrentView('dashboard')} />;
      // Mentorship cases
      case 'my-mentorship':
        return <MyMentorship />;
      case 'book-session':
        return <BookSession />;
      case 'mentor-feedback':
        return <MentorFeedback />;
      case 'career-coaching':
        return <CareerCoaching />;
      case 'my-progress-mentor':
        return <MyProgressWithMentor />;
      default:
        return <ProjectsView />;
    }
  };

  return (
    <div className={`flex h-screen w-full bg-gray-50 dark:bg-gray-900 ${isAdmin && currentView === 'admin' ? 'admin-dark-purple' : ''}`}>
      {/* Debug indicator for admin theme */}
      {isAdmin && currentView === 'admin' && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          Admin Purple Theme Active
        </div>
      )}
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
        {renderView()}
      </main>
    </div>
  );
};

export default MainLayout;