import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ScrumSection {
  id: number;
  title: string;
  estMinutes: number;
  content: string;
}

interface LearningProgress {
  is_complete: boolean;
  completed_at: string | null;
}

interface LearningReflection {
  notes: string;
  updated_at: string;
}

const ScrumEssentialsView: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState<ScrumSection | null>(null);
  const [sections, setSections] = useState<ScrumSection[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [reflection, setReflection] = useState<LearningReflection | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const currentSectionId = parseInt(sectionId || '1');
  const totalSections = 7;

  // Load sections data
  useEffect(() => {
    const loadSections = async () => {
      try {
        const sectionFiles = [
          '01-where-scrum-fits.md',
          '02-scrum-roles.md',
          '03-scrum-events.md',
          '04-scrum-artefacts.md',
          '05-backlog-refinement.md',
          '06-requirements-docs.md',
          '07-delivery-flow.md'
        ];

        const loadedSections: ScrumSection[] = [];
        
        for (const file of sectionFiles) {
          try {
            const response = await fetch(`/content/scrum-essentials/${file}`);
            const content = await response.text();
            
            // Parse frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (frontmatterMatch) {
              const frontmatter = frontmatterMatch[1];
              const markdownContent = frontmatterMatch[2];
              
              const idMatch = frontmatter.match(/id:\s*(\d+)/);
              const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
              const minutesMatch = frontmatter.match(/estMinutes:\s*(\d+)/);
              
              if (idMatch && titleMatch && minutesMatch) {
                loadedSections.push({
                  id: parseInt(idMatch[1]),
                  title: titleMatch[1],
                  estMinutes: parseInt(minutesMatch[1]),
                  content: markdownContent
                });
              }
            }
          } catch (error) {
            console.error(`Error loading ${file}:`, error);
          }
        }
        
        setSections(loadedSections.sort((a, b) => a.id - b.id));
      } catch (error) {
        console.error('Error loading sections:', error);
      }
    };

    loadSections();
  }, []);

  // Load current section
  useEffect(() => {
    if (sections.length > 0) {
      const section = sections.find(s => s.id === currentSectionId);
      setCurrentSection(section || sections[0]);
    }
  }, [sections, currentSectionId]);

  // Load progress and reflection
  useEffect(() => {
    if (user && currentSectionId) {
      loadProgressAndReflection();
    }
  }, [user, currentSectionId]);

  const loadProgressAndReflection = async () => {
    if (!user) return;

    try {
      // Load progress
      const { data: progressData } = await supabase
        .from('learning_progress')
        .select('is_complete, completed_at')
        .eq('user_id', user.id)
        .eq('module', 'scrum-essentials')
        .eq('section_id', currentSectionId)
        .single();

      setProgress(progressData || { is_complete: false, completed_at: null });

      // Load reflection
      const { data: reflectionData } = await supabase
        .from('learning_reflections')
        .select('notes, updated_at')
        .eq('user_id', user.id)
        .eq('module', 'scrum-essentials')
        .eq('section_id', currentSectionId)
        .single();

      if (reflectionData) {
        setReflection(reflectionData);
        setReflectionText(reflectionData.notes || '');
      }
    } catch (error) {
      console.error('Error loading progress and reflection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReflection = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('learning_reflections')
        .upsert({
          user_id: user.id,
          module: 'scrum-essentials',
          section_id: currentSectionId,
          notes: reflectionText,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const markComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          module: 'scrum-essentials',
          section_id: currentSectionId,
          is_complete: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setProgress({ is_complete: true, completed_at: new Date().toISOString() });
    } catch (error) {
      console.error('Error marking section complete:', error);
    }
  };

  const navigateToSection = (sectionId: number) => {
    navigate(`/scrum-essentials/${sectionId}`);
    window.scrollTo(0, 0);
  };

  const goToPrevious = () => {
    if (currentSectionId > 1) {
      navigateToSection(currentSectionId - 1);
    }
  };

  const goToNext = () => {
    if (currentSectionId < totalSections) {
      navigateToSection(currentSectionId + 1);
    }
  };

  const getCompletedCount = () => {
    // This would need to be calculated from the database
    // For now, return 0
    return 0;
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - you might want to use a proper markdown library
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  if (isLoading || !currentSection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading section...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Section {currentSectionId} of {totalSections} • {getCompletedCount()}/{totalSections} completed
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{currentSection.estMinutes} min read</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentSectionId / totalSections) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(currentSection.content) }}
          />
        </div>

        {/* Reflection Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Reflection</h3>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            onBlur={saveReflection}
            placeholder="What are your key takeaways from this section? What questions do you have?"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSaving && (
            <p className="text-sm text-gray-500 mt-2">Saving...</p>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentSectionId === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentSectionId === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              {!progress?.is_complete && (
                <button
                  onClick={markComplete}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              )}
              {progress?.is_complete && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentSectionId === totalSections}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentSectionId === totalSections
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrumEssentialsView;
