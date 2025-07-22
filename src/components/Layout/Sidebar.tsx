import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  BookOpen,
  BookText,
  FileText,
  Plus,
  User,
  Settings,
  LogOut,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserAvatar } from '../Common/UserAvatar';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { currentView, setCurrentView } = useApp();
  const { user, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Environment indicator for cost awareness
  const environment = import.meta.env.VITE_APP_ENV || 'development';
  const isTestMode = environment === 'development';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'guided-practice-hub', label: 'Training Projects', icon: FolderOpen },
    { id: 'my-meetings', label: 'My Meetings', icon: MessageSquare },
    { id: 'notes', label: 'Interview Notes', icon: BookText },
    { id: 'deliverables', label: 'Deliverables', icon: FileText },
    { id: 'custom-project', label: 'Create Project', icon: Plus },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Close user menu when collapsing
    if (!isCollapsed) {
      setShowUserMenu(false);
    }
  };

  return (
    <div className={`bg-gradient-to-b from-purple-600 to-indigo-700 text-white ${isCollapsed ? 'w-20' : 'w-64'} min-h-screen flex flex-col shadow-lg transition-all duration-300 ${className}`}>
      {/* Logo/Brand with Toggle */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-purple-500/30 transition-all duration-300`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">BA Interview Pro</h1>
                <p className="text-xs text-purple-200">Professional Development</p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-full flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-sm mb-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20"
                title="Expand sidebar"
              >
                <ChevronRight size={22} className="text-white" />
              </button>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          )}
        </div>

        {/* Environment Indicator */}
        {!isCollapsed && (
          <div className={`mx-4 mt-3 mb-2 px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1 ${
            isTestMode 
              ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
              : 'bg-orange-500/20 text-orange-200 border border-orange-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isTestMode ? 'bg-green-400' : 'bg-orange-400'}`}></div>
            <span>{isTestMode ? '🧪 TEST MODE' : '🚀 PRODUCTION'}</span>
            {isTestMode && <span className="text-green-300">(85% cheaper)</span>}
          </div>
        )}

        {/* Theme Toggle */}
        <div className={`mx-4 mb-4 ${isCollapsed ? 'mx-2' : ''}`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group`}
            title={isCollapsed ? `Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode` : ''}
          >
            {resolvedTheme === 'light' ? (
              <Moon size={isCollapsed ? 22 : 18} className="text-purple-200" />
            ) : (
              <Sun size={isCollapsed ? 22 : 18} className="text-purple-200" />
            )}
            {!isCollapsed && (
              <span className="text-purple-200 text-sm">
                {resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
          </button>
          
          {/* Tooltip for collapsed theme toggle */}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              {resolvedTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id} className="relative group">
                <button
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-3 py-2.5'} rounded-lg text-left transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                      : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={isCollapsed ? 28 : 20} className={isActive ? 'text-white' : 'text-purple-200'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section with Profile */}
      <div className="p-4 border-t border-purple-500/30">
        <div className="relative">
          <button
            onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm group`}
            title={isCollapsed ? user?.email?.split('@')[0] || 'User' : ''}
          >
            <UserAvatar 
              userId={user?.id || ''} 
              email={user?.email} 
              size={isCollapsed ? 'lg' : 'md'} 
              className="transition-all duration-200" 
              showBorder={false}
            />
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-purple-200">Business Analyst</p>
                </div>
                {showUserMenu ? (
                  <ChevronUp size={16} className="text-purple-200" />
                ) : (
                  <ChevronDown size={16} className="text-purple-200" />
                )}
              </>
            )}
          </button>

          {/* Tooltip for collapsed user section */}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              {user?.email?.split('@')[0] || 'User'}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}

          {/* User Dropdown Menu - Only show when not collapsed */}
          {!isCollapsed && showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-purple-100 shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  setCurrentView('profile');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <Settings size={16} className="text-gray-500" />
                <span>Profile & Settings</span>
              </button>
              <div className="border-t border-gray-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut size={16} className="text-gray-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};