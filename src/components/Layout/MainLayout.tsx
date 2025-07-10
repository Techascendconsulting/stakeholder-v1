import React from 'react'
import Sidebar from './Sidebar'
import { useApp } from '../../contexts/AppContext'
import Dashboard from '../Views/Dashboard'
import ProjectsView from '../Views/ProjectsView'
import ProjectBrief from '../Views/ProjectBrief'
import StakeholdersView from '../Views/StakeholdersView'
import MeetingView from '../Views/MeetingView'
import NotesView from '../Views/NotesView'
import DeliverablesView from '../Views/DeliverablesView'
import ProfileView from '../Views/ProfileView'

const MainLayout: React.FC = () => {
  const { currentView } = useApp()

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <ProjectsView />
      case 'project-brief':
        return <ProjectBrief />
      case 'stakeholders':
        return <StakeholdersView />
      case 'meeting':
        return <MeetingView />
      case 'notes':
        return <NotesView />
      case 'deliverables':
        return <DeliverablesView />
      case 'profile':
        return <ProfileView />
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