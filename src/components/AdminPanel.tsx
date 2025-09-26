import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Database,
  Search,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Mail,
  Bell,
  Shield
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useApp } from '../contexts/AppContext';
import AdminUserManagement from './AdminUserManagement';
import ContentManagementService, { LearningModule, PracticeScenario, AssessmentQuestion, EpicStory } from '../services/contentManagementService';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  lastModified: string;
  type: 'module' | 'scenario' | 'question' | 'epic' | 'story';
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'boolean' | 'number';
  description: string;
  category: 'general' | 'security' | 'learning' | 'features';
}

const AdminPanel: React.FC = () => {
  console.log('🔧 ADMIN PANEL: Component rendering');
  const { isAdmin, hasPermission } = useAdmin();
  const { setCurrentView } = useApp();
  console.log('🔧 ADMIN PANEL: Current view from context:', setCurrentView);
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'settings' | 'communication' | 'data'>('users');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Content Management State
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [practiceScenarios, setPracticeScenarios] = useState<PracticeScenario[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [epicStories, setEpicStories] = useState<EpicStory[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [contentManagementService] = useState(() => ContentManagementService.getInstance());
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  
  // Communication State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    duration: 7
  });

  useEffect(() => {
    if (isAdmin) {
      loadContentItems();
      loadSystemSettings();
      loadAnnouncements();
    }
  }, [isAdmin]);

  const loadContentItems = async () => {
    setLoading(true);
    try {
      console.log('📚 Loading content items from database...');
      
      // Load all content types in parallel
      const [modules, scenarios, questions, stories] = await Promise.all([
        contentManagementService.getLearningModules(),
        contentManagementService.getPracticeScenarios(),
        contentManagementService.getAssessmentQuestions(),
        contentManagementService.getEpicStories()
      ]);

      setLearningModules(modules);
      setPracticeScenarios(scenarios);
      setAssessmentQuestions(questions);
      setEpicStories(stories);

      console.log('📚 Content loaded:', {
        modules: modules.length,
        scenarios: scenarios.length,
        questions: questions.length,
        stories: stories.length
      });
    } catch (error) {
      console.error('Error loading content items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      // Mock system settings - would be replaced with actual database queries
      const mockSettings: SystemSetting[] = [
        {
          id: '1',
          key: 'app_name',
          value: 'Stakeholder Practice Platform',
          type: 'string',
          description: 'Application display name',
          category: 'general'
        },
        {
          id: '2',
          key: 'maintenance_mode',
          value: 'false',
          type: 'boolean',
          description: 'Enable maintenance mode',
          category: 'general'
        },
        {
          id: '3',
          key: 'mvp_builder_enabled',
          value: 'true',
          type: 'boolean',
          description: 'Enable MVP Builder feature',
          category: 'features'
        },
        {
          id: '4',
          key: 'mentorship_enabled',
          value: 'true',
          type: 'boolean',
          description: 'Enable mentorship features',
          category: 'features'
        },
        {
          id: '5',
          key: 'session_timeout',
          value: '30',
          type: 'number',
          description: 'Session timeout in minutes',
          category: 'security'
        }
      ];
      setSystemSettings(mockSettings);
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      // Mock announcements - would be replaced with actual database queries
      const mockAnnouncements = [
        {
          id: '1',
          title: 'New Learning Module Added',
          message: 'Check out our new AI & Machine Learning module!',
          targetAudience: 'all',
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on Sunday 2-4 AM',
          targetAudience: 'all',
          status: 'scheduled',
          createdAt: '2024-01-14'
        }
      ];
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleContentEdit = (item: ContentItem) => {
    setEditingItem(item);
  };

  const handleAnnouncementCreate = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    
    try {
      // Here you would save to Supabase
      console.log('Creating announcement:', newAnnouncement);
      // await supabase.from('announcements').insert(newAnnouncement);
      
      // Add to local state
      const announcement = {
        id: Date.now().toString(),
        ...newAnnouncement,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAnnouncements(prev => [announcement, ...prev]);
      setNewAnnouncement({ title: '', message: '', targetAudience: 'all', duration: 7 });
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users, permission: 'user_management' },
    { id: 'content', label: 'Content Management', icon: BookOpen, permission: 'admin_management' },
    { id: 'settings', label: 'System Settings', icon: Settings, permission: 'system_settings' },
    { id: 'communication', label: 'Communication', icon: MessageSquare, permission: 'admin_management' },
    { id: 'data', label: 'Data Management', icon: Database, permission: 'admin_management' }
  ].filter(tab => !tab.permission || hasPermission(tab.permission as keyof import('../contexts/AdminContext').AdminPermissions));

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users, content, settings, and system configuration
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('admin')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </button>
          </div>
        </div>
              </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* User Management Tab */}
        {activeTab === 'users' && hasPermission('user_management') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                User Management
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
            
            <AdminUserManagement />
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && hasPermission('admin_management') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Content Management
              </h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </button>
        </div>
          </div>

            {/* Content Items List */}
            <div className="space-y-6">
              {/* Learning Modules */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Learning Modules ({learningModules.length})
                </h3>
                <div className="space-y-3">
                  {learningModules.map((module) => (
                    <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">
                              {module.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              module.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : module.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {module.status.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {module.difficulty.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {module.estimated_hours}h • {module.topics.length} topics • Updated: {new Date(module.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(module)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => contentManagementService.deleteLearningModule(module.id).then(() => loadContentItems())}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Scenarios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Practice Scenarios ({practiceScenarios.length})
                </h3>
                <div className="space-y-3">
                  {practiceScenarios.map((scenario) => (
                    <div key={scenario.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">
                              {scenario.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              scenario.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : scenario.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {scenario.status.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {scenario.stage_id.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {scenario.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {scenario.success_criteria.length} success criteria • Updated: {new Date(scenario.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(scenario)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => contentManagementService.deletePracticeScenario(scenario.id).then(() => loadContentItems())}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Questions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Assessment Questions ({assessmentQuestions.length})
                </h3>
                <div className="space-y-3">
                  {assessmentQuestions.map((question) => (
                    <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">
                              {question.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              question.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : question.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {question.status.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              {question.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {question.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {question.difficulty} • {question.estimated_time} • Updated: {new Date(question.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(question)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => contentManagementService.deleteAssessmentQuestion(question.id).then(() => loadContentItems())}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Epic Stories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Epic Stories ({epicStories.length})
                </h3>
                <div className="space-y-3">
                  {epicStories.map((story) => (
                    <div key={story.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">
                              {story.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              story.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : story.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {story.status.toUpperCase()}
                            </span>
                            {story.moscow_priority && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                {story.moscow_priority.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {story.description || story.summary}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {story.acceptance_criteria.length} acceptance criteria • Updated: {new Date(story.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(story)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => contentManagementService.deleteEpicStory(story.id).then(() => loadContentItems())}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && hasPermission('system_settings') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                System Settings
              </h2>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <Save className="h-4 w-4 mr-2" />
                Save All
              </button>
            </div>

            {/* Settings Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
                {systemSettings.filter(s => s.category === 'general').map((setting) => (
                  <div key={setting.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {setting.key.replace(/_/g, ' ').toUpperCase()}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {setting.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {setting.type === 'boolean' ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.value === 'true'}
                              onChange={(e) => {
                                const updatedSetting = { ...setting, value: e.target.checked.toString() };
                                setSystemSettings(prev => 
                                  prev.map(s => s.id === setting.id ? updatedSetting : s)
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </label>
                        ) : (
                          <input
                            type={setting.type === 'number' ? 'number' : 'text'}
                            value={setting.value}
                            onChange={(e) => {
                              const updatedSetting = { ...setting, value: e.target.value };
                              setSystemSettings(prev => 
                                prev.map(s => s.id === setting.id ? updatedSetting : s)
                              );
                            }}
                            className="w-32 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                </div>
              </div>
            ))}
          </div>

              {/* Feature Settings */}
                <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Feature Settings</h3>
                {systemSettings.filter(s => s.category === 'features').map((setting) => (
                  <div key={setting.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {setting.key.replace(/_/g, ' ').toUpperCase()}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {setting.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.value === 'true'}
                            onChange={(e) => {
                              const updatedSetting = { ...setting, value: e.target.checked.toString() };
                              setSystemSettings(prev => 
                                prev.map(s => s.id === setting.id ? updatedSetting : s)
                              );
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                    </div>
                  ))}
              </div>
            </div>
              </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && hasPermission('admin_management') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Communication Center
              </h2>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
                </button>
            </div>

            {/* Create Announcement */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create System Announcement
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter announcement message"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={newAnnouncement.targetAudience}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Users</option>
                      <option value="students">Students Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={newAnnouncement.duration}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAnnouncementCreate}
                  disabled={!newAnnouncement.title || !newAnnouncement.message}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Create Announcement
                </button>
            </div>
          </div>

            {/* Existing Announcements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Existing Announcements
            </h3>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {announcement.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            announcement.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {announcement.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {announcement.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Target: {announcement.targetAudience} | Created: {announcement.createdAt}
                        </p>
                    </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
                    </div>
                  )}

        {/* Data Management Tab */}
        {activeTab === 'data' && hasPermission('admin_management') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Data Management
              </h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  User Data Export
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Export user information, progress, and activity data
                </p>
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Learning Progress Export
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Export learning progress, module completion, and assessment data
                </p>
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export Progress
                </button>
            </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  System Backup
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create a complete system backup including all data and settings
                </p>
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
    </div>
  );
};

export default AdminPanel;