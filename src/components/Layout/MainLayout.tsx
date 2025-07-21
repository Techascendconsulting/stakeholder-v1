import React from 'react'
import { Sidebar } from './Sidebar'
import { useApp } from '../../contexts/AppContext'
import Dashboard from '../Views/Dashboard'
import ProjectsView from '../Views/ProjectsView'
import ProjectBrief from '../Views/ProjectBrief'
import StakeholdersView from '../Views/StakeholdersView'
import MeetingModeSelection from '../Views/MeetingModeSelection'
import MeetingView from '../Views/MeetingView'
import { VoiceOnlyMeetingView } from '../Views/VoiceOnlyMeetingView'
import { MyMeetingsView } from '../Views/MyMeetingsView'
import { MeetingHistoryView } from '../Views/MeetingHistoryView'
import DeliverablesView from '../Views/DeliverablesView'
import NotesView from '../Views/NotesView'
import ProfileView from '../Views/ProfileView'
import AnalysisView from '../Views/AnalysisView'
import CustomProjectView from '../Views/CustomProjectView'
import CustomStakeholdersView from '../Views/CustomStakeholdersView'

const MainLayout: React.FC = () => {
  const { currentView, isLoading, selectedProject, selectedStakeholders, user } = useApp()

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    console.log('🔍 DEBUG: MainLayout renderView called with currentView:', currentView)
    console.log('🔍 DEBUG: selectedProject:', selectedProject?.name || 'null')
    console.log('🔍 DEBUG: selectedStakeholders count:', selectedStakeholders?.length || 0)
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <ProjectsView />
      case 'project-brief':
        return <ProjectBrief />
      case 'stakeholders':
        return <StakeholdersView />
      case 'meeting-mode-selection':
        return <MeetingModeSelection />
      case 'meeting':
        return <MeetingView />
      case 'voice-only-meeting':
        return <VoiceOnlyMeetingView />
      case 'my-meetings':
        return <MyMeetingsView />
      case 'meeting-history':
        return <MeetingHistoryView />
      case 'notes':
        return <NotesView />
      case 'deliverables':
        return <DeliverablesView />
      case 'profile':
        return <ProfileView />
      case 'analysis':
        return <AnalysisView />
      case 'custom-project':
        return <CustomProjectView />
      case 'custom-stakeholders':
        return <CustomStakeholdersView />
      default:
        return <ProjectsView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  )
}

export default MainLayout