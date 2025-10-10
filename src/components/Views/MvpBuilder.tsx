import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target, BookOpen, CheckCircle, ArrowRight, Save, Plus, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Layers, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { 
  fetchEpics, 
  fetchStoriesWithAC, 
  saveMvpFlow, 
  updateStoryPriority, 
  validateMvpFlow,
  fetchMvpFlow,
  testMvpBuilderConnection,
  getMvpFlows,
  type Epic, 
  type Story 
} from '../../services/mvpBuilderService';

interface MvpBuilderProps {
  projectId?: string | null;
  userId?: string;
  mode?: 'training' | 'project';
}

// Helper function to auto-summarize story titles
const generateStoryTitle = (summary: string): string => {
  if (!summary) return "Untitled Story";
  const words = summary.split(" ");
  return words.length > 7 ? words.slice(0, 7).join(" ") + "..." : summary;
};

// MoSCoW color scheme
const getMoscowColor = (moscow: string) => {
  switch (moscow) {
    case 'Must': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
    case 'Should': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
    case 'Could': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
    case 'Won\'t': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
  }
};

const MvpBuilder: React.FC<MvpBuilderProps> = ({ 
  projectId = null, 
  userId, 
  mode = 'training'
}) => {
  console.log('🔄 MvpBuilder: Component mounting...');
  const { user } = useAuth();
  const { selectedProject, projects, setCurrentView } = useApp();
  
  // Resolve active project id
  let activeProjectId: string | null = null;

  if (projectId) {
    activeProjectId = projectId;
  } else if (selectedProject) {
    activeProjectId = selectedProject.id;
  } else if (projects && projects.length > 0) {
    activeProjectId = projects[0].id;
  }

  console.log("🟢 Resolved activeProjectId:", activeProjectId);
  console.log('🔄 MvpBuilder - Component initialized');
  console.log('🔄 MvpBuilder - Props projectId:', projectId);
  console.log('🔄 MvpBuilder - Selected project:', selectedProject);
  
  // State management
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  
  // Use sessionStorage to persist loading state across component mounts
  const getInitialLoadingState = () => {
    const saved = sessionStorage.getItem('mvp-builder-loading');
    return saved ? JSON.parse(saved) : true;
  };
  
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(getInitialLoadingState);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [flowOrder, setFlowOrder] = useState<string[]>([]);
  const [expandedAC, setExpandedAC] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: false, errors: [], warnings: [] });

  // Load epics on component mount (practice-only, always uses training project)
  useEffect(() => {
    console.log('🔄 MvpBuilder - useEffect triggered (practice-only mode)');
    
    // Prevent multiple loads in React Strict Mode
    if (hasLoadedRef.current) {
      console.log('🔄 MvpBuilder - Already loaded, skipping...');
      return;
    }
    
    const loadEpicsAndStories = async () => {
      try {
        console.log('🔄 MvpBuilder - Starting to load epics for practice mode...');
        setLoading(true);

        // First test the connection
        console.log('🔍 MVP Builder - Testing connection...');
        const connectionTest = await testMvpBuilderConnection();
        console.log('🔍 Connection test result:', connectionTest);

        if (!connectionTest.success) {
          console.error('❌ MVP Builder - Connection failed:', connectionTest.message);
          setSetupError("MVP Builder database tables haven't been created yet. Please run the migration to get started.");
          return;
        }

        // Clear any previous setup errors
        setSetupError(null);

        // Load epics for training project (practice-only mode)
        console.log('🔄 MvpBuilder - Fetching epics for training project (practice-only)');
        const epicsData = await fetchEpics();
        console.log('✅ MvpBuilder - Epics loaded:', epicsData);

        setEpics(epicsData);
        console.log('✅ MvpBuilder - Epics state set, current epics length:', epicsData?.length || 0);

        // Auto-select first epic if available
        if (epicsData.length > 0) {
          setSelectedEpicId(epicsData[0].id);
        }
      } catch (error: any) {
        console.error('❌ MvpBuilder - Error loading epics:', error);
        if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
          setSetupError("MVP Builder database tables haven't been created yet. Please run the migration to get started.");
        }
      } finally {
        console.log('🔄 MvpBuilder - Setting loading to false');
        hasLoadedRef.current = true;
        setLoading(false);
        setIsInitiallyLoading(false);
        sessionStorage.setItem('mvp-builder-loading', 'false');
      }
    };

    loadEpicsAndStories();
  }, []); // Remove activeProjectId dependency since we're practice-only

  // Load stories when epic is selected
  useEffect(() => {
    const loadStories = () => {
      if (!selectedEpicId) return;

      const selectedEpic = epics.find(epic => epic.id === selectedEpicId);
      if (selectedEpic && selectedEpic.stories) {
        setStories(selectedEpic.stories);
      } else {
        setStories([]);
      }

      console.log('🔄 Epic switched, stories set:', selectedEpic?.stories?.length || 0);
    };

    loadStories();
  }, [selectedEpicId, epics]);

  // Validate flow whenever stories or flowOrder changes
  useEffect(() => {
    if (stories.length > 0) {
      const validationResult = validateMvpFlow(stories, flowOrder);
      setValidation(validationResult);
    }
  }, [stories, flowOrder]);

  const handleEpicSelect = (epicId: string) => {
    setSelectedEpicId(epicId);
    setExpandedAC([]);
  };

  const handleMoscowChange = async (storyId: string, moscow: 'Must' | 'Should' | 'Could' | 'Won\'t') => {
    try {
      await updateStoryPriority(storyId, moscow);
      setStories(prevStories =>
        prevStories.map(s => s.id === storyId ? { ...s, moscow } : s)
      );
    } catch (error) {
      console.error('Error updating story priority:', error);
    }
  };

  const toggleAC = (storyId: string) => {
    setExpandedAC(prev =>
      prev.includes(storyId) ? prev.filter(id => id !== storyId) : [...prev, storyId]
    );
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
  };

  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    e.dataTransfer.setData('text/plain', storyId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('text/plain');
    
    if (!flowOrder.includes(storyId)) {
      setFlowOrder(prev => [...prev, storyId]);
    }
  };

  const removeFromFlow = (storyId: string) => {
    setFlowOrder(prev => prev.filter(id => id !== storyId));
  };

  const handleSaveMVP = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Save each story in the flow to the MVP flows table
      for (const storyId of flowOrder) {
        const story = stories.find(s => s.id === storyId);
        if (story) {
          await saveMvpFlow({
            projectId: activeProjectId,
            epicId: story.epic_id || selectedEpicId,
            storyId: story.id,
            priority: story.moscow || 'Must',
            inMvp: true,
            createdBy: user.id
          });
        }
      }
      
      // Also save stories not in MVP as "not in MVP"
      for (const story of stories) {
        if (!flowOrder.includes(story.id)) {
          await saveMvpFlow({
            projectId: activeProjectId,
            epicId: story.epic_id || selectedEpicId,
            storyId: story.id,
            priority: story.moscow || 'Should',
            inMvp: false,
            createdBy: user.id
          });
        }
      }
      
      alert('✅ MVP saved successfully!');
    } catch (error) {
      console.error('Error saving MVP:', error);
      alert('Error saving MVP. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEpic = epics.find(epic => epic.id === selectedEpicId);
  const availableStories = stories.filter(story => !flowOrder.includes(story.id));
  const flowStories = stories.filter(story => flowOrder.includes(story.id));

  if (isInitiallyLoading || loading || epics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-4"></div>
                <div className="space-y-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only check for project in project mode
  if (mode === 'project' && !selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Project Selected</h2>
          <p className="text-gray-600 dark:text-gray-400">Please select a project to use the MVP Builder.</p>
        </div>
      </div>
    );
  }

  // Show no project selected message only in project mode
  if (mode === 'project' && !currentProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Project Selected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The MVP Builder requires a project to be selected. Please select a project first to start building your MVP.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Go back to the main dashboard</li>
              <li>2. Select or create a project</li>
              <li>3. Return to MVP Builder</li>
            </ol>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show migration notice if no epics are found and we're not loading
  // Show setup error if tables are missing
  if (setupError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">MVP Builder Setup Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {setupError}
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Next Steps:</h3>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>1. Go to your Supabase Dashboard</li>
              <li>2. Open SQL Editor</li>
              <li>3. Copy and run the migration from <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">COMPLETE_MVP_BUILDER_SETUP.sql</code></li>
              <li>4. Refresh this page</li>
            </ol>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Debug Info:</p>
            <p>• Project ID: {activeProjectId}</p>
            <p>• Loading: {loading ? 'Yes' : 'No'}</p>
            <p>• Epics found: {epics.length}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no epics found (but tables exist)
  console.log('🔄 MvpBuilder - Render check - Loading:', loading, 'Epics length:', epics.length, 'Setup error:', setupError);
  if (!loading && epics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Epics Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No epics found in this project. You can create epics in the Backlog or run the seed script to add sample data.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Options:</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Go to Backlog and create an Epic</li>
              <li>• Run the seed script to add sample training data</li>
              <li>• Switch to a different project that has epics</li>
            </ul>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Debug Info:</p>
            <p>• Project ID: {activeProjectId}</p>
            <p>• Loading: {loading ? 'Yes' : 'No'}</p>
            <p>• Epics found: {epics.length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Modern Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('practice-flow')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
                title="Back to Practice Journey"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    MVP Builder
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Build your Minimum Viable Product flow</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveMVP}
              disabled={saving || flowOrder.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transform hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save MVP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Guidance Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-white/10 backdrop-blur-sm p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="text-base font-bold mb-2">
                  Now that you've learnt about MVP… it's time to practice.
                </h3>
                <div className="text-sm space-y-2 text-white/90">
                  <p className="font-semibold">On this page, you will:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>See your Epics and their related User Stories in the left panel</li>
                    <li>Review each story's details and tag them with MoSCoW priorities</li>
                    <li>Drag the Must-Have stories into the center MVP Flow area</li>
                    <li>Check the right-hand panel for full story details and acceptance criteria</li>
                    <li>When you're done, click Save MVP to record your selection</li>
                  </ul>
                  <p className="mt-2 font-semibold bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
                    🎯 Goal: Create a clear MVP made up of only the essential stories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-6 h-[calc(100vh-160px)]">
          {/* Left Sidebar - Epics */}
          <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-lg overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600">
              <h3 className="text-base font-bold text-white flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Epics
              </h3>
              <p className="text-xs text-purple-100 mt-1">Select an Epic to build MVP</p>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {epics.map(epic => (
                <button
                  key={epic.id}
                  onClick={() => handleEpicSelect(epic.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md ${
                    selectedEpicId === epic.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">{epic.title}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {epic.stories?.length || 0}
                    </span>
                  </div>
                </button>
              ))}
              {epics.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Epics yet</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create your first Epic to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1 flex flex-col">
            {selectedEpic ? (
              <>
                {/* Stories Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 mb-6 shadow-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h3 className="text-base font-bold text-white flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Stories
                    </h3>
                    <p className="text-xs text-indigo-100 mt-1">Assign MoSCoW priorities and select for MVP</p>
                  </div>
                  <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                    {selectedEpic.stories?.map(story => (
                      <button
                        key={story.id}
                        onClick={() => handleStorySelect(story)}
                        className={`w-full text-left p-2 rounded-lg transition-all duration-200 hover:shadow-md border ${selectedStory?.id === story.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, story.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 mb-1">
                              <BookOpen className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {generateStoryTitle(story.summary)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {generateStoryTitle(story.summary)}
                            </p>
                            {story.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                                {story.description}
                              </p>
                            )}
                            
                            {/* Acceptance Criteria - Compact */}
                            {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
                              <button
                                onClick={() => toggleAC(story.id)}
                                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-1"
                              >
                                {expandedAC.includes(story.id) ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                                <span>AC ({story.acceptance_criteria.length})</span>
                              </button>
                            )}
                            
                            {/* Expanded AC */}
                            {expandedAC.includes(story.id) && (
                              <div className="mt-1 space-y-1">
                                {story.acceptance_criteria && story.acceptance_criteria.length > 0 ? (
                                  story.acceptance_criteria.map((ac, index) => (
                                    <div key={ac.id || index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-1 rounded">
                                      {ac.description}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No acceptance criteria yet</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* MoSCoW Dropdown */}
                          <div className="ml-2 flex-shrink-0">
                            <select
                              value={story.moscow || 'none'}
                              onChange={(e) => handleMoscowChange(story.id, e.target.value as any)}
                              className={`text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-20 ${
                                story.moscow ? getMoscowColor(story.moscow) : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              <option value="none">Priority</option>
                              <option value="Must">Must</option>
                              <option value="Should">Should</option>
                              <option value="Could">Could</option>
                              <option value="Won't">Won't</option>
                            </select>
                          </div>
                        </div>
                      </button>
                    ))}
                    {(!selectedEpic.stories || selectedEpic.stories.length === 0) && (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Stories yet</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add stories to this Epic to build your MVP</p>
                      </div>
                    )}
                  </div>
                  {/* Selected Story Detail Panel */}
                  {selectedStory && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Selected Story</h4>
                      <div className="mt-2">
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{selectedStory.summary}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedStory.description || 'No description provided.'}</p>
                        <div className="mt-2 pl-4">
                          {selectedStory.acceptance_criteria?.length ? (
                            <ul className="list-disc text-xs text-gray-600 dark:text-gray-400">
                              {selectedStory.acceptance_criteria.map((ac) => (
                                <li key={ac.id}>• {ac.description}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No acceptance criteria yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Flow Builder Area */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex-1 shadow-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600">
                    <h3 className="text-base font-bold text-white flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      MVP Flow Builder
                    </h3>
                    <p className="text-xs text-green-100 mt-1">Drag Must-Have stories here to form your MVP</p>
                  </div>
                  <div
                    className="p-4 min-h-48"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {flowOrder.length === 0 ? (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="text-center">
                          <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Drag Must-Have stories here to build your MVP flow
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {flowOrder.map((storyId, index) => {
                          const story = stories.find(s => s.id === storyId);
                          if (!story) return null;
                          
                          return (
                            <div key={storyId} className="flex items-center space-x-4">
                              {/* Flow Step Number */}
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {index + 1}
                                </span>
                              </div>
                              
                              {/* Arrow */}
                              {index < flowOrder.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              )}
                              
                              {/* Story Card */}
                              <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <BookOpen className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {generateStoryTitle(story.summary)}
                                      </span>
                                      {story.moscow && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${getMoscowColor(story.moscow)}`}>
                                          {story.moscow}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {generateStoryTitle(story.summary)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeFromFlow(storyId)}
                                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors hover:bg-gray-100 rounded-full"
                                    title="Remove from flow"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Panel */}
                {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                  <div className="mt-6 space-y-3">
                    {validation.errors.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Validation Errors</h4>
                        </div>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validation.warnings.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Recommendations</h4>
                        </div>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select an Epic</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose an Epic from the sidebar to start building your MVP</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MvpBuilder;