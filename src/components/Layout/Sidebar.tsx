import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Archive,
  Target,
  Home,
  LayoutDashboard,
  Plus,
  Heart,
  PlayCircle,
  FileText,
  Layers,
  PenTool,
  Rocket,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Moon,
  Sun,
  HelpCircle,
  Briefcase,
  Lock,
  // Sparkles // Archived with AI Process Mapper
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdmin } from '../../contexts/AdminContext';
import { UserAvatar } from '../Common/UserAvatar';
import SidebarAudioPlayer from './SidebarAudioPlayer';
import { supabase } from '../../lib/supabase';
import { useUserJourney } from '../../hooks/useUserJourney';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  isCollapsible?: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}


export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { currentView, setCurrentView } = useApp();
  const { user, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  
  // Debug: Log currentView changes
  console.log('🎨 SIDEBAR: Rendering with currentView =', currentView);
  const { isAdmin } = useAdmin();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [displayName, setDisplayName] = useState<string>('');
  
  // Get unlock status from useUserJourney
  const { practiceUnlocked, projectUnlocked } = useUserJourney(user?.id || null);

  // Load user type from database
  useEffect(() => {
    console.log('🔄 Sidebar useEffect triggered, user?.id =', user?.id);
    
    const loadUserType = async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID, skipping user_type load');
        return;
      }

      console.log('🔍 Loading user_type for user:', user.id);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        console.log('🔍 User type query result:', { data, error, userId: user.id });

        if (!error && data) {
          console.log('✅ Setting user type to:', data.user_type || 'existing');
          setUserType(data.user_type || 'existing');
        } else {
          console.log('⚠️ No user_type found or error, defaulting to existing. Error:', error);
          setUserType('existing');
        }
      } catch (error) {
        console.error('❌ Failed to load user type:', error);
        setUserType('existing'); // Default to existing on error
      }
    };

    loadUserType();
  }, [user?.id]);

  // Auto-collapse sidebar on small screens and expand on large screens
  useEffect(() => {
    const handleResponsiveCollapse = () => {
      const shouldCollapse = window.innerWidth < 1024; // collapse below lg
      setIsCollapsed(shouldCollapse);
    };
    handleResponsiveCollapse();
    window.addEventListener('resize', handleResponsiveCollapse);
    return () => window.removeEventListener('resize', handleResponsiveCollapse);
  }, []);

  // Load and react to display name changes saved in profile
  useEffect(() => {
    const loadDisplayName = () => {
      try {
        if (!user?.id) { setDisplayName(''); return; }
        const saved = localStorage.getItem(`profile-${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.displayName && typeof parsed.displayName === 'string') {
            setDisplayName(parsed.displayName);
            return;
          }
        }
        // Fallback to email prefix
        setDisplayName(user?.email?.split('@')[0] || 'User');
      } catch {
        setDisplayName(user?.email?.split('@')[0] || 'User');
      }
    };

    loadDisplayName();
    const onStorage = (e: StorageEvent) => {
      if (!user?.id) return;
      if (e.key === `profile-${user.id}`) {
        loadDisplayName();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user?.id, user?.email]);

  // Admin-specific menu items
  const adminMenuItems: MenuItem[] = [
    { 
      id: 'admin', 
      label: 'Admin Dashboard', 
      icon: LayoutDashboard
    },
    { 
      id: 'admin-panel', 
      label: 'Admin Panel', 
      icon: Settings
    },
    // { 
    //   id: 'community-admin', 
    //   label: 'Community Hub (Admin)', 
    //   icon: Users
    // } // Archived for MVP
  ];

  // Check onboarding status to determine if welcome page should be shown
  const onboardingCompleted = localStorage.getItem('onboardingCompleted')
  const isOnboardingInProgress = localStorage.getItem('onboardingInProgress')
  
  // For existing users who don't have onboarding flags, assume they've completed onboarding
  if (!onboardingCompleted && !isOnboardingInProgress) {
    localStorage.setItem('onboardingCompleted', 'true')
  }

  // Student menu items
  const studentMenuItems: MenuItem[] = [
    // Only show welcome page if onboarding is not completed
    ...(localStorage.getItem('onboardingCompleted') !== 'true' ? [{
      id: 'welcome', 
      label: 'Welcome', 
      icon: Home
    }] : []),
    {
      id: 'how-to-navigate',
      label: 'How to Navigate', 
      icon: HelpCircle
    },
    { 
      id: 'dashboard', 
      label: 'My Dashboard', 
      icon: LayoutDashboard
    },
    {
      id: 'career-journey',
      label: 'Project Lifecycle',
      icon: Briefcase
    },
    { 
      id: 'learning-flow', 
      label: 'My Learning', 
      icon: GraduationCap
    },
    { 
      id: 'practice-flow', 
      label: 'My Practice', 
      icon: Target
    },
    // { 
    //   id: 'project-flow',
    //   label: 'My Hands-On Project', 
    //   icon: FolderOpen
    // }, // Removed as requested
    { 
      id: 'project-journey',
      label: 'My Project', 
      icon: Rocket
    },
    { 
      id: 'my-cohort',
      label: 'My Cohort', 
      icon: Users
    },
    // { 
    //   id: 'create-project',
    //   label: 'Create Project', 
    //   icon: Plus
    // }, // Archived for MVP - will add when custom project creation is ready
    // { 
    //   id: 'my-mentorship', 
    //   label: 'My Mentorship', 
    //   icon: Users,
    //   isCollapsible: true,
    //   subItems: [
    //     { 
    //       id: 'book-session', 
    //       label: 'Book a Session', 
    //       icon: Calendar
    //     },
    //     { 
    //       id: 'mentor-feedback', 
    //       label: 'Mentor Feedback', 
    //       icon: MessageSquare
    //     },
    //     { 
    //       id: 'career-coaching', 
    //       label: 'Career Coaching', 
    //       icon: Target
    //     },
    //     { 
    //       id: 'my-progress-mentor', 
    //       label: 'My Progress with Mentor', 
    //       icon: TrendingUp
    //     }
    //   ]
    // }, // Archived for MVP - will add when mentorship program launches
    // { 
    //   id: 'community-hub', 
    //   label: 'Community Hub', 
    //   icon: Users
    // }, // Archived for MVP
    {
      id: 'my-resources',
      label: 'My Resources',
      icon: Archive
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: HelpCircle
    }
  ];

  // Use admin or student menu items based on user role
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Debug: log resize and sidebar state to help trace whitespace issues when exiting fullscreen
  useEffect(() => {
    const handleResize = () => {
      // Minimal logging to avoid noise
      console.debug('[Sidebar] resize', { width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for global toggle events from mobile menu button
  useEffect(() => {
    const handleToggle = () => setIsCollapsed(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle as EventListener);
    return () => window.removeEventListener('toggle-sidebar', handleToggle as EventListener);
  }, []);


  console.log('🎨 SIDEBAR RENDER: userType =', userType, 'user?.id =', user?.id);

  return (
    <div className={`bg-gradient-to-b from-purple-600 to-indigo-700 text-white 
      ${isCollapsed ? 'w-0 lg:w-20' : 'w-64 lg:w-64'} h-screen flex flex-col shadow-lg overflow-hidden relative z-40 ${className}
      fixed lg:static top-0 left-0 transform transition-all duration-300 ease-in-out 
      ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`} aria-hidden={isCollapsed ? 'true' : 'false'}>
      {/* DEBUG Badge - visible only for admins */}
      {!isCollapsed && isAdmin && (
        <div className="absolute top-2 right-2 z-50 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">
          {userType}
        </div>
      )}
      
      {/* Logo/Brand with Toggle */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-purple-500/30 transition-all duration-300`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shadow-sm">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">BA WorkXP™</h1>

              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-full flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-sm mb-3">
                <Target className="w-8 h-8 text-white" />
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

      </div>

      {/* Theme Toggle */}
      <div className={`mx-4 mb-2 mt-4 ${isCollapsed ? 'mx-2' : ''}`} data-tour="theme-toggle">
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

      {/* Navigation */}
      <nav className="flex-1 p-1 overflow-y-auto" data-tour="main-menu">
        <ul className="space-y-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isExpanded = expandedSections.has(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            // Check if this item is locked
            const isPracticeLocked = item.id === 'practice-flow' && !practiceUnlocked;
            const isProjectLocked = item.id === 'project-journey' && !projectUnlocked;
            const isLocked = isPracticeLocked || isProjectLocked;

            return (
              <li key={item.id} className="relative group">
                <button
                  onClick={() => {
                    console.log('🖱️ SIDEBAR CLICK:', item.id, 'hasSubItems:', hasSubItems, 'isCollapsible:', item.isCollapsible);
                    
                    // Early return for locked items with alerts
                    if (isPracticeLocked) {
                      alert('Your Practice Journey unlocks after completing Modules 1–3 and submitting assignments.');
                      return;
                    }
                    if (isProjectLocked) {
                      alert('Complete your Practice Journey to unlock your Final Project.');
                      return;
                    }
                    
                    // Special handling for "How to Navigate" - trigger tour
                    if (item.id === 'how-to-navigate') {
                      console.log('🎯 Sidebar: Triggering onboarding tour from main menu');
                      setCurrentView('dashboard'); // Go to dashboard first
                      setTimeout(() => {
                        window.dispatchEvent(new Event('start-onboarding-tour'));
                      }, 100); // Small delay to ensure dashboard renders
                      return;
                    }
                    
                    if (hasSubItems && item.isCollapsible) {
                      toggleSection(item.id);
                    } else {
                      console.log('🖱️ SIDEBAR: Navigating to:', item.id);
                      setCurrentView(item.id as any);
                      console.debug('[Sidebar] sectionClick', { id: item.id });
                    }
                  }}
                  data-tour={
                    item.id === 'my-learning' ? 'learning-journey' :
                    item.id === 'my-practice' ? 'practice-journey' :
                    item.id === 'my-resources' ? 'resources' :
                    (item.id === 'admin' || item.id === 'admin-panel') ? 'admin-section' :
                    undefined
                  }
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-2' : 'space-x-3 px-2 py-1.5'} rounded-lg text-left transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                      : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={
                    isPracticeLocked ? 'Complete Modules 1–3 and assignments to unlock Practice'
                    : isProjectLocked ? 'Complete Practice to unlock Final Project'
                    : isCollapsed ? item.label
                    : undefined
                  }
                >
                  <Icon size={isCollapsed ? 20 : 16} className={isActive ? 'text-white' : 'text-purple-200'} />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {hasSubItems && item.isCollapsible && (
                        <div className="ml-auto">
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-purple-200" />
                          ) : (
                            <ChevronDown size={14} className="text-purple-200" />
                          )}
                        </div>
                      )}
                      {isLocked && (
                        <Lock className="w-4 h-4 text-gray-400 ml-auto" />
                      )}
                    </>
                  )}
                </button>

                {/* Sub-items for collapsible sections */}
                {!isCollapsed && hasSubItems && item.isCollapsible && isExpanded && item.subItems && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = currentView === subItem.id;
                      
                      return (
                        <li key={subItem.id}>
                          <button
                            onClick={() => {
                              console.log('🖱️ SIDEBAR SUB-ITEM CLICK:', subItem.id);
                              
                              // Special handling for "How to Navigate" - trigger tour instead of navigation
                              if (subItem.id === 'how-to-navigate') {
                                console.log('🎯 Sidebar: Triggering onboarding tour');
                                setCurrentView('dashboard'); // Go to dashboard first
                                window.dispatchEvent(new Event('start-onboarding-tour'));
                              } else {
                                setCurrentView(subItem.id as any);
                              }
                              
                              console.debug('[Sidebar] subItemClick', { id: subItem.id });
                            }}
                            className={`w-full flex items-center space-x-3 px-2 py-1.5 rounded-lg text-left transition-all duration-200 text-sm font-medium ${
                              isSubActive
                                ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                                : 'text-purple-100 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-purple-200'} />
                            <span className="truncate">{subItem.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

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


      {/* Audio Player */}
      <div className="px-3">
        <SidebarAudioPlayer />
      </div>

      {/* User Section with Profile */}
      <div className="p-3 border-t border-purple-500/30" data-tour="profile-menu">
        <div className="relative">
          <button
            onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm group`}
            title={isCollapsed ? (displayName || user?.email?.split('@')[0] || 'User') : ''}
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
                    {displayName || user?.email?.split('@')[0] || 'User'}
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
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-purple-100 shadow-lg overflow-hidden z-50">
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
                  onClick={() => {
                    setShowUserMenu(false);
                    handleSignOut();
                  }}
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
