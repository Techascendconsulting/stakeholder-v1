import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Sidebar } from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAdmin } from '../../contexts/AdminContext';
import Dashboard from '../Views/Dashboard'; // Updated with journey integration
// import Dashboard2 from '../Views/Dashboard2'; // OLD: Clean, purposeful dashboard
import VerityWidget from '../Verity/VerityWidget';
import LearningIntro from '../../views/LearningFlow/LearningIntro';
import LearningFlowView from '../../views/LearningFlow/LearningFlowView';
import PracticeIntro from '../../views/PracticeFlow/PracticeIntro';
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
import VoiceMeetingV2Rebuilt from '../Views/VoiceMeetingV2Rebuilt';
import VoiceMeetingV2Simple from '../Views/VoiceMeetingV2Simple';
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
import StakeholdersView from '../Views/StakeholdersView';
import ScrumEssentialsView from '../Views/ScrumEssentialsView';
import ScrumLearningView from '../Views/ScrumLearningView';
import { AgileHubView } from '../Views/AgileHubView';
// Lazy load heavy Scrum views
const ScrumPracticeView = lazy(() => import('../Views/ScrumPracticeView'));
const ElevenLabsMultiAgentMeeting = lazy(() => import('../Views/ElevenLabsMultiAgentMeeting'));
const IndividualAgentMeeting = lazy(() => import('../Views/IndividualAgentMeeting'));
import ProjectView from '../Views/ProjectView';
import ProjectJourneyView from '../Views/ProjectJourneyView';
import ProjectBrief from '../Views/ProjectBrief';
import StageSelectionView from '../Views/StageSelectionView';
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
import BAInActionIntroPage from '../../pages/ba-in-action/intro';
import BAInActionIndexPage from '../../pages/ba-in-action';
import BAInActionPage1 from '../../pages/ba-in-action/join-orientation';
import UnderstandProblemPage from '../../pages/ba-in-action/understand-problem';
import StakeholderLandscape from '../../pages/ba-in-action/StakeholderLandscape';
import UnderstandingContext from '../../ba-in-action/UnderstandingContext';
import StakeholderCommunication from '../../ba-in-action/StakeholderCommunication';
import AnalysisSpottingIssues from '../../ba-in-action/AnalysisSpottingIssues';
import ToBeAndSolutionShaping from '../../ba-in-action/ToBeAndSolutionShaping';
import Implementation from '../../ba-in-action/Implementation';
import WorkingWithDevelopers from '../../ba-in-action/WorkingWithDevelopers';
import ContinuousDevelopment from '../../ba-in-action/ContinuousDevelopment';
import BAChallenges from '../../ba-in-action/BAChallenges';
import UATValidation from '../../ba-in-action/UATValidation';
import ContinuousImprovement from '../../ba-in-action/ContinuousImprovement';
import AdminDashboard from '../AdminDashboard';
import AdminPanel from '../AdminPanel';
import MvpBuilder from '../Views/MvpBuilder';
import ContactUsView from '../Views/ContactUsView';
import ContactSupportView from '../Views/ContactSupportView';
import AdminContactSubmissionsView from '../Views/AdminContactSubmissionsView';
import SupportCentreView from '../Views/SupportCentreView';
import CareerJourneyView from '../Views/CareerJourneyView';
import MeetingModeSelection from '../Views/MeetingModeSelection';
import CoreLearningView from '../Views/CoreLearningView';
import CoreLearning2View from '../Views/CoreLearning2View'; // NEW: Overview + Individual Topic Pages
import LearningPageWrapper from '../LearningPageWrapper';
import MyCohortPage from '../Views/MyCohortPage';
import AdminCohortsPage from '../Views/AdminCohortsPage';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LockMessageToast from '../LockMessageToast';
// import NavigationGuideView from '../Views/NavigationGuideView'; // Removed: Using interactive tour instead
import OnboardingTour from '../OnboardingTour';
import GlobalBreadcrumbs from '../GlobalBreadcrumbs';
import { ContinueModal } from '../ContinueModal';
import { useContinuePrompt } from '../../hooks/useContinuePrompt';
import { trackContinueErrorFallback } from '../../services/continueAnalytics';
import { clearResumeState } from '../../services/resumeStore';


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
    console.log("FLAG VALUE inside MainLayout:", import.meta.env.VITE_FEATURE_STARTER_BA_ROLE);
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
      case 'learning-intro':
        return <LearningIntro />;
      case 'learning-flow':
        return <LearningFlowView />;
      case 'practice-intro':
        return <PracticeIntro />;
      case 'practice-flow':
        return <PracticeFlowView />;
      case 'project-flow':
        return <ProjectFlowView />;
      case 'project-journey':
        return <ProjectJourneyView />;
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
        // Requirements Specification - assignment appears at end of walkthrough, not on teaching page
        return <DocumentationView />;
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
      case 'stage-selection':
        return <StageSelectionView />;
      case 'stakeholders':
        return <StakeholdersView />;
      case 'project-setup':
        return selectedProject ? <ProjectView projectId={selectedProject.id} /> : <ProjectsView />;
      case 'meeting-mode-selection':
        return <MeetingModeSelection />;
      case 'meeting':
        return <MeetingView />;
      case 'voice-only-meeting':
        return <VoiceOnlyMeetingView />;
      case 'voice-meeting-v2':
        // TESTING: Using rebuilt version (can revert to VoiceMeetingV2 if needed)
        return <VoiceMeetingV2Rebuilt />;
      case 'voice-meeting-simple':
        return <VoiceMeetingV2Simple />;
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
      case 'ba-in-action-intro':
        return <BAInActionIntroPage />;
      case 'ba-in-action-index':
        return <BAInActionIndexPage />;
      case 'ba_in_action_join_orientation':
        return <BAInActionPage1 />;
      case 'ba_in_action_understand_problem':
        return <UnderstandProblemPage />;
      case 'ba_in_action_whos_involved':
        return <StakeholderLandscape />;
      case 'ba_in_action_stakeholder_communication':
        return <StakeholderCommunication />;
      case 'ba_in_action_as_is_to_be':
        return <AnalysisSpottingIssues />;
      case 'ba_in_action_requirements':
        return <ToBeAndSolutionShaping />;
      case 'ba_in_action_implementation':
        return <Implementation />;
      case 'ba_in_action_agile_delivery':
        return <WorkingWithDevelopers />;
      case 'ba_in_action_continuous_development':
        return <ContinuousDevelopment />;
      case 'ba_in_action_challenges':
        return <BAChallenges />;
      case 'ba_in_action_handover_value':
        return <UATValidation />;
      case 'ba_in_action_improvement':
        return <ContinuousImprovement />;
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
      case 'contact-support':
        return <ContactSupportView />;
      case 'admin-contact-submissions':
        return <AdminContactSubmissionsView />;
      case 'support':
        return <SupportCentreView />;
      case 'career-journey':
        return <CareerJourneyView />;
      case 'my-cohort':
        return <MyCohortPage />;
      case 'admin-cohorts':
        return <AdminCohortsPage />;
      case 'start-your-ba-role': {
        // Feature-flagged lazy import to avoid loading bundle when disabled
        if (!import.meta.env.VITE_FEATURE_STARTER_BA_ROLE) return <ProjectsView />;
        const Starter = React.lazy(async () => {
          console.log("📦 LAZY IMPORT TRIGGERED…");
          try {
            const mod = await import('@/starter-ba-role/index');
            console.log("🔍 DYNAMIC IMPORT MODULE CONTENT:", mod);
            return mod;
          } catch (err) {
            console.error("❌ DYNAMIC IMPORT FAILED:", err);
            throw err;
          }
        });
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <Starter />
          </Suspense>
        );
      }
      default:
        return <ProjectsView />;
    }
  };

  return (
    <div className={`flex flex-row w-full h-full min-h-screen bg-gray-50 dark:bg-gray-900 ${isAdmin && currentView === 'admin' ? 'admin-dark-purple' : ''}`}>
      {/* Debug indicator for admin theme */}
      {isAdmin && currentView === 'admin' && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          Admin Purple Theme Active
        </div>
      )}
      {/* Mobile Menu Toggle - visible on small screens */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
        className="lg:hidden fixed top-4 left-4 z-50 px-3 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-md text-sm font-medium text-gray-700 dark:text-gray-200"
        aria-label="Toggle menu"
      >
        Menu
      </button>
      <Sidebar />
      <main
        className="grid grid-rows-[auto,1fr] min-h-screen flex-1 bg-gray-50 dark:bg-gray-900"
      >
        {/* Global Breadcrumbs - Always visible */}
        <GlobalBreadcrumbs />
        
        {/* Content row that can actually stretch */}
        <section className="min-h-0 overflow-auto">
          {lockMessage ? (
            <LockMessageToast
              message={lockMessage}
              onClose={clearLockMessage}
            />
          ) : (
            <ErrorBoundary>
              {renderView()}
            </ErrorBoundary>
          )}
        </section>
      </main>
      
      {/* Verity Assistant - Hide on conversational AI pages AND admin pages */}
      {!isAdmin && !['voice-only-meeting', 'voice-meeting-v2', 'meeting', 'documentation'].includes(currentView) && (
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
    
    // Learning & Requirements Specification
    'documentation': 'Requirements Specification',
    'documentation-practice': 'Requirements Specification Practice',
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
  
  return titles[view] || 'BA WorkXP™';
}

// Add this before the export
const MainLayoutWithTour: React.FC = () => {
  console.log('🚀 MAIN_LAYOUT_WRAPPER: Component rendering/updating');
  const { setCurrentView } = useApp();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const [showTour, setShowTour] = React.useState(false);
  
  // Debug: Log whenever user changes
  React.useEffect(() => {
    console.log('🚀 MAIN_LAYOUT_WRAPPER: User state changed', { userId: user?.id, isAdmin });
  }, [user?.id, isAdmin]);

  // Check onboarding status for continue prompt
  const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
  const isOnboardingInProgress = localStorage.getItem('onboardingInProgress') === 'true';
  const hasCompletedOnboarding = onboardingCompleted || (!onboardingCompleted && !isOnboardingInProgress);

  // Debug: Log values being passed to hook
  console.log('🎯 MAIN_LAYOUT_WRAPPER: Values for continue prompt hook', {
    userId: user?.id,
    isAdmin,
    onboardingCompleted,
    isOnboardingInProgress,
    hasCompletedOnboarding
  });

  // Continue where you left off prompt
  const { shouldShow: showContinuePrompt, resumeState, dismiss: dismissContinuePrompt } = useContinuePrompt(
    user?.id,
    isAdmin,
    hasCompletedOnboarding
  );
  
  // Debug: Log hook result
  console.log('🎯 MAIN_LAYOUT_WRAPPER: Continue prompt hook result', {
    shouldShow: showContinuePrompt,
    hasResumeState: !!resumeState,
    resumeStatePath: resumeState?.path
  });

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

  const handleContinue = () => {
    if (resumeState) {
      console.log('🔄 Continue: Navigating to', resumeState.path);
      
      // Validate that the route still exists/is accessible
      const validViews = [
        'core-learning', 'project-initiation', 'requirements-engineering', 
        'solution-options', 'documentation', 'design-hub', 'mvp-hub',
        'stakeholder-mapping', 'elicitation', 'process-mapper', 'scrum-essentials',
        'training-practice', 'practice', 'meeting', 'voice-only-meeting',
        'projects', 'project', 'custom-project', 'create-project'
      ];
      
      const isValidRoute = validViews.includes(resumeState.path);
      
      if (!isValidRoute) {
        // Invalid route - fallback to dashboard with error tracking
        console.warn('⚠️ Continue: Invalid route detected, falling back to dashboard');
        trackContinueErrorFallback('invalid_route', resumeState);
        clearResumeState();
        setCurrentView('dashboard');
        dismissContinuePrompt();
        return;
      }
      
      // Check if practice session expired (for practice pages)
      if (resumeState.pageType === 'practice' && resumeState.practiceSessionId) {
        // In Phase 2, we'll assume sessions don't expire quickly
        // In Phase 3, add actual session validation
        console.log('📝 Continue: Practice session ID:', resumeState.practiceSessionId);
      }
      
      // Check if project still exists (for project pages)
      if (resumeState.pageType === 'project' && resumeState.projectId) {
        // In Phase 2, we'll navigate anyway and let the view handle missing projects
        // In Phase 3, add project validation
        console.log('📁 Continue: Project ID:', resumeState.projectId);
      }
      
      try {
        // Navigate to the saved view
        setCurrentView(resumeState.path as any);
        
        // Restore scroll/step state after a brief delay to allow view to render
        setTimeout(() => {
          try {
            const { restoreResumeState } = require('../../utils/scrollRestore');
            restoreResumeState(resumeState);
          } catch (error) {
            console.warn('⚠️ Continue: Error restoring scroll/step state:', error);
            // Non-critical error, continue anyway
          }
        }, 300); // Small delay to ensure view component has mounted
        
        dismissContinuePrompt();
      } catch (error) {
        // Fallback on navigation error
        console.error('❌ Continue: Navigation error:', error);
        trackContinueErrorFallback('navigation_error', resumeState);
        setCurrentView('dashboard');
        dismissContinuePrompt();
      }
    }
  };

  const handleGoToDashboard = () => {
    console.log('🔄 Continue: Going to dashboard');
    setCurrentView('dashboard');
    dismissContinuePrompt();
  };

  const handleDismissContinue = () => {
    dismissContinuePrompt();
  };

  // Get user's first name for personalization
  const userName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || undefined;

  return (
    <>
      <MainLayout />
      {showTour && (
        <OnboardingTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}
      {showContinuePrompt && resumeState && (
        <ContinueModal
          resumeState={resumeState}
          userName={userName}
          onContinue={handleContinue}
          onGoToDashboard={handleGoToDashboard}
          onDismiss={handleDismissContinue}
        />
      )}
    </>
  );
};

export default MainLayoutWithTour;