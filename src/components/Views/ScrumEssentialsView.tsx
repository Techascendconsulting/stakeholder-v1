import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, BookOpen, Users, Target, Zap, FileText, ArrowRight, Star, Lightbulb, AlertCircle, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';

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
  const { user } = useAuth();
  const { setCurrentView } = useApp();
  const [currentSection, setCurrentSection] = useState<ScrumSection | null>(null);
  const [sections, setSections] = useState<ScrumSection[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [reflection, setReflection] = useState<LearningReflection | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(1);
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
    setCurrentSectionId(sectionId);
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

  const renderContent = (content: string) => {
    // Split content into sections based on headers
    const sections = content.split(/(?=## )/);
    
    return sections.map((section, index) => {
      if (section.trim() === '') return null;
      
      // Check if it's a header section
      if (section.startsWith('## ')) {
        const lines = section.split('\n');
        const header = lines[0].replace('## ', '');
        const body = lines.slice(1).join('\n').trim();
        
        return (
          <div key={index} className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                {getSectionIcon(header)}
                <span className="ml-3">{header}</span>
              </h3>
              <div className="prose prose-gray max-w-none">
                {renderTextContent(body)}
              </div>
            </div>
          </div>
        );
      } else {
        // Regular content
        return (
          <div key={index} className="mb-6">
            <div className="prose prose-lg max-w-none">
              {renderTextContent(section)}
            </div>
          </div>
        );
      }
    });
  };

  const getSectionIcon = (header: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'The Product Owner': <Target className="w-5 h-5 text-purple-600" />,
      'The Scrum Master': <Users className="w-5 h-5 text-indigo-600" />,
      'The Developers': <Zap className="w-5 h-5 text-purple-600" />,
      'The Business Analyst': <FileText className="w-5 h-5 text-indigo-600" />,
      'Putting It All Together': <Lightbulb className="w-5 h-5 text-purple-600" />,
      'The Scrum Approach': <Zap className="w-5 h-5 text-purple-600" />,
      'Why Scrum is Used': <Target className="w-5 h-5 text-indigo-600" />,
      'What This Means for You as a BA': <FileText className="w-5 h-5 text-purple-600" />,
      'The Consequences of Poor Scrum Implementation': <AlertCircle className="w-5 h-5 text-indigo-600" />,
      'Introduction': <BookOpen className="w-5 h-5 text-purple-600" />,
      'Backlog Refinement': <Target className="w-5 h-5 text-purple-600" />,
      'Sprint Planning': <CheckSquare className="w-5 h-5 text-indigo-600" />,
      'Daily Scrum': <Users className="w-5 h-5 text-purple-600" />,
      'Sprint Review': <Star className="w-5 h-5 text-indigo-600" />,
      'Sprint Retrospective': <Lightbulb className="w-5 h-5 text-purple-600" />,
      'Bringing the Events Together': <ArrowRight className="w-5 h-5 text-indigo-600" />,
      'The Product Backlog': <FileText className="w-5 h-5 text-purple-600" />,
      'The Sprint Backlog': <Target className="w-5 h-5 text-indigo-600" />,
      'The Increment': <CheckCircle className="w-5 h-5 text-purple-600" />,
      'Definition of Ready': <CheckSquare className="w-5 h-5 text-indigo-600" />,
      'Definition of Done': <CheckCircle className="w-5 h-5 text-purple-600" />,
      'Bringing the Artefacts Together': <ArrowRight className="w-5 h-5 text-indigo-600" />,
      'The Setup': <BookOpen className="w-5 h-5 text-purple-600" />,
      'Your Role as the BA': <FileText className="w-5 h-5 text-indigo-600" />,
      'Why It Matters': <Lightbulb className="w-5 h-5 text-purple-600" />,
      'Summary': <CheckCircle className="w-5 h-5 text-indigo-600" />,
      'What "Just Enough" Documentation Means': <Target className="w-5 h-5 text-purple-600" />,
      'Key Artifacts You\'ll Own as a BA': <FileText className="w-5 h-5 text-indigo-600" />,
      'Where Does This Documentation Live?': <BookOpen className="w-5 h-5 text-purple-600" />,
      'How Requirements Evolve': <ArrowRight className="w-5 h-5 text-indigo-600" />,
      'How Much Is Enough?': <Lightbulb className="w-5 h-5 text-purple-600" />,
      'The BA\'s Real Job in Documentation': <CheckCircle className="w-5 h-5 text-indigo-600" />,
    };
    
    return iconMap[header] || <BookOpen className="w-5 h-5 text-purple-600" />;
  };

  const renderTextContent = (text: string) => {
    // Check for special BA callout formatting
    if (text.includes('**Where you, the BA, come in:**') || 
        text.includes('**How you, the BA, fit with') ||
        text.includes('**Where you fit with')) {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-purple-800 prose prose-purple max-w-none">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          </div>
        </div>
      );
    }
    
    // Regular content with ReactMarkdown
    return (
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    );
  };

  if (isLoading || !currentSection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
                {progress?.is_complete && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Section {currentSectionId} of {totalSections} • {getCompletedCount()}/{totalSections} completed
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{currentSection.estMinutes} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalSections }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 < currentSectionId
                        ? 'bg-green-500'
                        : i + 1 === currentSectionId
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentSectionId / totalSections) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderContent(currentSection.content)}
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
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
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
