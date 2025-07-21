import React from 'react';
import { LayoutDashboard, FolderOpen, MessageSquare, FileText, Plus, User, LogOut, GraduationCap, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { currentView, setCurrentView } = useApp();
  const { user, signOut } = useAuth();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Your progress overview'
    },
    { 
      id: 'projects', 
      label: 'Training Projects', 
      icon: FolderOpen,
      description: 'Practice scenarios'
    },
    { 
      id: 'my-meetings', 
      label: 'My Meetings', 
      icon: MessageSquare,
      description: 'Interview history'
    },
    { 
      id: 'notes', 
      label: 'Interview Notes', 
      icon: BookOpen,
      description: 'Your observations'
    },
    { 
      id: 'deliverables', 
      label: 'Deliverables', 
      icon: FileText,
      description: 'Generated documents'
    },
    { 
      id: 'custom-project', 
      label: 'Create Project', 
      icon: Plus,
      description: 'Build your own scenario'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      description: 'Settings & preferences'
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white w-72 min-h-screen flex flex-col shadow-2xl ${className}`}>
      {/* Logo/Brand */}
      <div className="p-8 border-b border-slate-700/50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BA Interview Pro</h1>
            <p className="text-sm text-slate-300">Professional Development</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01]'
                  }`}
                >
                  <Icon size={20} className={`transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{item.label}</span>
                    <p className={`text-xs mt-0.5 transition-colors duration-300 ${
                      isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-6 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-slate-400">Business Analyst</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-300 group"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-white transition-colors duration-300" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};