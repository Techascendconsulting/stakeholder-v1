import React, { lazy, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAdmin } from '../../contexts/AdminContext';
import Dashboard from '../Views/Dashboard'; // Updated with journey integration
import Dashboard2 from '../Views/Dashboard2'; // OLD: Clean, purposeful dashboard
import VerityWidget from '../Verity/VerityWidget';
import LearningFlowView from '../../views/LearningFlow/LearningFlowView';
import PracticeFlowView from '../../views/PracticeFlow/PracticeFlowView';
import ProjectFlowView from '../../views/ProjectFlow/ProjectFlowView';

// Loading fallback component
const ViewLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  </div>
);
import CoreConceptsView from '../Views/CoreConceptsView';
import GuidedPracticeHub from '../Views/GuidedPracticeHub';
import ProjectsView from '../Views/ProjectsView';
import MeetingView from '../Views/MeetingView';
import { VoiceOnlyMeetingView } from '../Views/VoiceOnlyMeetingView';
import VoiceMeetingV2 from '../Views/VoiceMeetingV2';
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
import { AgileHubView } from '../Views/AgileHubView';
// Lazy load heavy Scrum views
const ScrumPracticeView = lazy(() => import('../Views/ScrumPracticeView'));
const ElevenLabsMultiAgentMeeting = lazy(() => import('../Views/ElevenLabsMultiAgentMeeting'));
const IndividualAgentMeeting = lazy(() => import('../Views/IndividualAgentMeeting'));
import ProjectView from '../Views/ProjectView';
import ProjectBrief from '../Views/ProjectBrief';
import EnhancedTrainingFlow from '../Views/EnhancedTrainingFlow';
import BAAcademyView from '../Views/BAAcademyView';
import ProjectInitiationView from '../Views/ProjectInitiationView';
import StakeholderMappingView from '../Views/StakeholderMappingView';
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
import GetStartedView from '../Views/GetStartedView';
import ProcessMappingIntroView from '../Views/ProcessMappingIntroView';
// import AIProcessMapperView from '../Views/AIProcessMapperView'; // Archived
import DiagramCreationView from '../Views/DiagramCreationView';
import ProcessMapperView from '../Views/ProcessMapperView';
import TrainingUI from '../Views/TrainingUI';
import PracticeLabView from '../Views/PracticeLabView';
import LearnLandingView from '../Views/LearnLandingView';
// import CommunityHub from '../Views/Community/CommunityHub'; // Archived for MVP
// import AdminCommunityHub from '../Views/Community/AdminCommunityHub'; // Archived for MVP
import ProjectLandingView from '../Views/ProjectLandingView';
import AdminDashboard from '../AdminDashboard';
import AdminPanel from '../AdminPanel';
import MvpBuilder from '../Views/MvpBuilder';
import ContactUsView from '../Views/ContactUsView';
import AdminContactSubmissionsView from '../Views/AdminContactSubmissionsView';
import SupportCentreView from '../Views/SupportCentreView';
import CareerJourneyView from '../Views/CareerJourneyView';
import MeetingModeSelection from '../Views/MeetingModeSelection';
import CoreLearningView from '../Views/CoreLearningView';
import CoreLearning2View from '../Views/CoreLearning2View'; // NEW: Overview + Individual Topic Pages
import LearningPageWrapper from '../LearningPageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LockMessageToast from '../LockMessageToast';
// import NavigationGuideView from '../Views/NavigationGuideView'; // Removed: Using interactive tour instead
import OnboardingTour from '../OnboardingTour';


const MainLayout: React.FC = () => {
  const { currentView, setCurrentView, isLoading, selectedProject, lockMessage, clearLockMessage } = useApp();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const [userType, setUserType] = React.useState<'new' | 'existing'>('existing'); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Load user type
  React.useEffect(() => {
    const loadUserType = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setUserType(data.user_type || 'existing');
        }
      } catch (error) {
        console.error('Failed to load user type:', error);
      }
    };

    loadUserType();
  }, [user?.id]);

  // Helper: Wrap learning pages with back button and assignments
  const wrapLearningPage = (
    pageComponent: React.ReactNode,
    moduleId: string,
    moduleTitle: string,
    assignmentTitle: string,
    assignmentDescription: string
  ) => {
    return (
      <LearningPageWrapper
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        assignmentTitle={assignmentTitle}
        assignmentDescription={assignmentDescription}
      >
        {pageComponent}
      </LearningPageWrapper>
    );
  };

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
        // Using updated Dashboard with journey integration
        return <Dashboard />;
        
        // OLD: Cluttered dashboard (uncomment to revert)
        // return <Dashboard />;
      case 'learn':
        return <LearnLandingView />;
      case 'learning-hub':
        return <CoreLearningView />; // This will be the main Learning Hub view
      case 'learning-flow':
        return <LearningFlowView />;
      case 'practice-flow':
        return <PracticeFlowView />;
      case 'project-flow':
        return <ProjectFlowView />;
      case 'core-learning':
        // NEW: Use CoreLearning2View (Overview + Individual Topic Pages)
        // To revert: Replace CoreLearning2View with CoreLearningView
        return <CoreLearning2View />;
        
        // OLD: Tabbed interface (uncomment to revert)
        // return wrapLearningPage(
        //   <CoreLearningView />,
        //   'module-1-core-learning',
        //   'Core Learning',
        //   'BA Fundamentals Assessment',
        //   'Explain the role of a BA and why organizations hire them. Include at least 3 specific responsibilities.'
        // );
      case 'project-initiation':
        // Don't wrap - has internal tabs, will handle assignment itself
        return <ProjectInitiationView />;
      case 'stakeholder-mapping':
      case 'module-3-stakeholder-mapping':
        // Stakeholder mapping module
        return <StakeholderMappingView />;
      case 'requirements-engineering':
        // Has tabs - will handle assignment on last tab
        return <RequirementsEngineeringView />;
      case 'solution-options':
        // Has tabs - will handle assignment on last tab
        return <SolutionOptions />;
      case 'documentation':
        return wrapLearningPage(
          <DocumentationView />,
          'module-7-documentation',
          'Documentation',
          'User Story Writing',
          'Write 2 user stories with 3 acceptance criteria each for a tenant repair request system. Follow INVEST principles.'
        );
      case 'documentation-practice':
        return <DocumentationPracticeView />;
      case 'design-hub':
        // Has tabs - will handle assignment on last tab
        return <DesignHub />;
      case 'mvp-hub':
        return wrapLearningPage(
          <MVPHub />,
          'module-9-mvp',
          'MVP Strategy',
          'MVP Feature Prioritization',
          'Given a full feature list for an app, identify the MVP using MoSCoW. Justify why you included/excluded each feature.'
        );
      case 'mvp-engine':
        return <MvpBuilder />;
      case 'mvp-practice':
        return <MvpBuilder />;
        case 'practice':
          return <PracticeLabView />;
      case 'elicitation':
        return wrapLearningPage(
          <IntroductionToElicitation />,
          'module-3-elicitation',
          'Requirements Elicitation',
          'Elicitation Strategy',
          'Choose an elicitation technique and explain when you would use it and why. Provide a specific scenario.'
        );
      case 'practice-2':
        return <GuidedPracticeHub />;
      case 'elicitation-hub':
        return <GuidedPracticeHub />;
      case 'project':
        return <ProjectLandingView />;

      case 'core-concepts':
        return <CoreConceptsView />;
      case 'scrum-essentials':
        console.log('🔄 MainLayout: Rendering ScrumEssentialsView');
        return wrapLearningPage(
          <ScrumEssentialsView />,
          'module-10-agile-scrum',
          'Agile & Scrum Basics',
          'Agile Understanding',
          'Explain the difference between Agile and Waterfall methodologies. When would you use each?'
        );
      case 'scrum-learning':
        console.log('🔄 MainLayout: Rendering ScrumLearningView');
        return <ScrumLearningView />;
      case 'agile-scrum':
        return <AgileHubView />;
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
        return wrapLearningPage(
          <ProcessMappingIntroView />,
          'module-4-process-mapping',
          'Process Mapping',
          'Process Analysis',
          'Map a simple "as-is" process (e.g., customer refund request) and identify 2-3 inefficiencies or bottlenecks.'
        );
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
      case 'project-brief':
        return <ProjectBrief />;
      case 'project-setup':
        return selectedProject ? <ProjectView projectId={selectedProject.id} /> : <ProjectsView />;
      case 'meeting-mode-selection':
        return <MeetingModeSelection />;
      case 'meeting':
        return <MeetingView />;
      case 'voice-only-meeting':
        return <VoiceOnlyMeetingView />;
      case 'voice-meeting-v2':
        return <VoiceMeetingV2 />;
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
      // case 'navigation-guide': // Removed: Using interactive tour instead
      //   return <NavigationGuideView />;
      case 'analysis':
        return <AnalysisView />;
      case 'custom-project':
        return <CustomProjectView />;
      case 'custom-stakeholders':
        return <CustomStakeholdersView />;
      case 'elevenlabs-meeting':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <ElevenLabsMultiAgentMeeting />
          </Suspense>
        );
      case 'individual-agent-meeting':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <IndividualAgentMeeting />
          </Suspense>
        );
      case 'enhanced-training-flow':
        return <EnhancedTrainingFlow />;
      // Training Hub Views
      case 'training-hub':
        return <TrainingHubView />;
      case 'training-hub-project-selection':
        return <TrainingHubView startingStep="project-selection" />;
      case 'training-hub-stage-selection':
        return <TrainingHubView startingStep="training-hub" />;
      case 'practice-hub-cards':
        return <PracticeHubCardsView />;
      case 'agile-practice':
        return <ScrumPracticeView />; // TODO: Create this view for training scenarios
      case 'scrum-practice':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <ScrumPracticeView />
          </Suspense>
        );
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
      // case 'community-hub':
      //   return <CommunityHub />; // Archived for MVP
      // case 'community-admin':
      //   return <AdminCommunityHub onBack={() => setCurrentView('dashboard')} />; // Archived for MVP
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
      case 'contact-us':
        return <ContactUsView />;
      case 'admin-contact-submissions':
        return <AdminContactSubmissionsView />;
      case 'support':
        return <SupportCentreView />;
      case 'career-journey':
        return <CareerJourneyView />;
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
        {lockMessage ? (
          <LockMessageToast
            message={lockMessage}
            onClose={clearLockMessage}
          />
        ) : (
          renderView()
        )}
      </main>
      
      {/* Verity Assistant - Hide only on pages with conversational AI (not coaching AI) */}
      {!['voice-only-meeting', 'meeting', 'documentation'].includes(currentView) && (
        <div className="fixed bottom-6 right-6 z-50" data-tour="verity">
          <VerityWidget 
            context={currentView} 
            pageTitle={getPageTitle(currentView)} 
          />
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to get user-friendly page titles for Verity context
 */
function getPageTitle(view: string): string {
  const titles: Record<string, string> = {
    // Main sections
    'dashboard': 'Dashboard',
    'welcome': 'Welcome',
    'get-started': 'Getting Started',
    
    // Learning & Documentation
    'documentation': 'Documentation',
    'documentation-practice': 'Documentation Practice',
    'learning-flow': 'Learning Journey',
    'handbook': 'BA Handbook',
    'ba-reference': 'BA Reference Library',
    'ba-fundamentals': 'BA Fundamentals',
    'core-concepts': 'Core Concepts',
    'my-resources': 'My Resources',
    
    // Scrum & Agile
    'scrum-practice': 'Scrum Practice',
    'scrum-learning': 'Scrum Learning',
    'scrum-essentials': 'Scrum Essentials',
    'agile-scrum': 'Agile Hub',
    'backlog-refinement': 'Backlog Refinement',
    'sprint-planning': 'Sprint Planning',
    
    // Practice & Training
    'practice': 'Practice Lab',
    'practice-2': 'Guided Practice',
    'training-practice': 'Training Practice',
    'training-hub': 'Training Hub',
    'training-assess': 'Training Assessment',
    'training-feedback': 'Training Feedback',
    'training-dashboard': 'Training Dashboard',
    
    // Elicitation & Requirements
    'elicitation': 'Introduction to Elicitation',
    'elicitation-hub': 'Elicitation Hub',
    'solution-options': 'Solution Options',
    
    // Design & MVP
    'design-hub': 'Design Hub',
    'mvp-hub': 'MVP Hub',
    'mvp-engine': 'MVP Engine',
    'mvp-practice': 'MVP Practice',
    
    // Projects & Meetings
    'projects': 'Projects',
    'project': 'Project Workspace',
    'project-workspace': 'Project Workspace',
    'project-brief': 'Project Brief',
    'meeting': 'Stakeholder Meeting',
    'meeting-summary': 'Meeting Summary',
    'meeting-history': 'Meeting History',
    'voice-only-meeting': 'Voice Meeting',
    'elevenlabs-meeting': 'AI Meeting',
    
    // Process Mapping
    'process-mapper': 'Process Mapper',
    'diagram-creation': 'Diagram Creation',
    
    // Other
    'motivation': 'Motivation',
    'deliverables': 'Deliverables',
    'analysis': 'Analysis',
    'profile': 'Profile'
  };
  
  return titles[view] || 'BA WorkXP Platform';
}

// Add this before the export
const MainLayoutWithTour: React.FC = () => {
  const { currentView, setCurrentView, isLoading, selectedProject, lockMessage, clearLockMessage } = useApp();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const [userType, setUserType] = React.useState<'new' | 'existing'>('existing');
  const [showTour, setShowTour] = React.useState(false);

  // Listen for tour trigger from Dashboard
  React.useEffect(() => {
    const handleStartTour = () => {
      console.log('🎯 MainLayout: Tour triggered');
      setShowTour(true);
    };

    window.addEventListener('start-onboarding-tour', handleStartTour);
    return () => window.removeEventListener('start-onboarding-tour', handleStartTour);
  }, []);

  const handleTourComplete = () => {
    console.log('✅ MainLayout: Tour completed');
    setShowTour(false);
    if (user?.id) {
      localStorage.setItem(`onboarding_tour_completed_${user.id}`, 'true');
    }
  };

  const handleTourSkip = () => {
    console.log('⏭️ MainLayout: Tour skipped');
    setShowTour(false);
    if (user?.id) {
      localStorage.setItem(`onboarding_tour_completed_${user.id}`, 'true');
    }
  };

  return (
    <>
      <MainLayout />
      {showTour && (
        <OnboardingTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}
    </>
  );
};

export default MainLayoutWithTour;