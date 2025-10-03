import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import HTMLFlipBook from 'react-pageflip';
import { 
  BookOpen, 
  Search, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Home,
  List
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Chapter {
  id: string;
  title: string;
  file: string;
  part: string;
  order: number;
}

interface Page {
  content: string;
  title: string;
  chapterId: string;
}

const HandbookView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTOC, setShowTOC] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageNumber, setCurrentPageNumber] = useState(0);
  const [chapterFirstPageIndex, setChapterFirstPageIndex] = useState<Record<string, number>>({});
  const [startPage, setStartPage] = useState(0);
  const bookRef = useRef<any>(null);
  const isProgrammaticFlip = useRef(false);
    // Responsive size that fits screen
    const [pageWidth, setPageWidth] = useState<number>(Math.min(1200, window.innerWidth - 100));
    const [pageHeight, setPageHeight] = useState<number>(Math.min(700, window.innerHeight - 150));

  const chapters: Chapter[] = [
    // Front Matter
    { id: 'foreword', title: 'Foreword', file: 'foreword.md', part: 'Front Matter', order: 0 },
    { id: 'preface', title: 'Preface', file: 'preface.md', part: 'Front Matter', order: 1 },
    { id: 'toc', title: 'Table of Contents', file: 'toc.md', part: 'Front Matter', order: 2 },
    
    // Part I - Core Foundations
    { id: '01-what-is-ba', title: 'Chapter 1: What Business Analysis Really Is', file: '01-what-is-ba.md', part: 'Part I', order: 3 },
    { id: '02-where-ba-fits', title: 'Chapter 2: Where the BA Fits', file: '02-where-ba-fits.md', part: 'Part I', order: 4 },
    { id: '03-core-competencies', title: 'Chapter 3: Core Competencies', file: '03-core-competencies.md', part: 'Part I', order: 5 },
    
    // Part II - Stakeholder Mastery
    { id: '04-stakeholder-identification-analysis', title: 'Chapter 4: Stakeholder Identification & Analysis', file: '04-stakeholder-identification-analysis.md', part: 'Part II', order: 6 },
    { id: '05-stakeholder-engagement-management', title: 'Chapter 5: Stakeholder Engagement', file: '05-stakeholder-engagement-management.md', part: 'Part II', order: 7 },
    { id: '06-workshops-and-1-1s', title: 'Chapter 6: Workshops & Conversations', file: '06-workshops-and-1-1s.md', part: 'Part II', order: 8 },
    
    // Part III - Requirements & Analysis
    { id: '07-requirements-engineering-e2e', title: 'Chapter 7: Requirements Engineering', file: '07-requirements-engineering-e2e.md', part: 'Part III', order: 9 },
    { id: '08-elicitation-techniques', title: 'Chapter 8: Elicitation Techniques', file: '08-elicitation-techniques.md', part: 'Part III', order: 10 },
    { id: '09-modelling-what-matters', title: 'Chapter 9: Modelling What Matters', file: '09-modelling-what-matters.md', part: 'Part III', order: 11 },
    { id: '10-spec-quality-prioritisation', title: 'Chapter 10: Specification Quality', file: '10-spec-quality-prioritisation.md', part: 'Part III', order: 12 },
    
    // Part IV - Agile Delivery
    { id: '11-epics-story-mapping-mvp', title: 'Chapter 11: Epics & Story Mapping', file: '11-epics-story-mapping-mvp.md', part: 'Part IV', order: 13 },
    { id: '12-acceptance-criteria-testing', title: 'Chapter 12: Acceptance Criteria', file: '12-acceptance-criteria-testing.md', part: 'Part IV', order: 14 },
    { id: '13-ba-in-scrum-events', title: 'Chapter 13: BA in Scrum Events', file: '13-ba-in-scrum-events.md', part: 'Part IV', order: 15 },
    
    // Part V - Data & Tech Fluency
    { id: '14-data-for-bas', title: 'Chapter 14: Data for BAs', file: '14-data-for-bas.md', part: 'Part V', order: 16 },
    { id: '15-apis-integrations-for-bas', title: 'Chapter 15: APIs & Integrations', file: '15-apis-integrations-for-bas.md', part: 'Part V', order: 17 },
    
    // Part VI - Challenges & Ethics
    { id: '16-common-challenges', title: 'Chapter 16: Common Challenges', file: '16-common-challenges.md', part: 'Part VI', order: 18 },
    { id: '17-ethics-neutrality-professionalism', title: 'Chapter 17: Ethics & Professionalism', file: '17-ethics-neutrality-professionalism.md', part: 'Part VI', order: 19 },
    
    // Part VII - The Future of BA
    { id: '18-ai-in-business-analysis', title: 'Chapter 18: AI in Business Analysis', file: '18-ai-in-business-analysis.md', part: 'Part VII', order: 20 },
    { id: '19-digital-transformation-scale-product-thinking', title: 'Chapter 19: Digital Transformation', file: '19-digital-transformation-scale-product-thinking.md', part: 'Part VII', order: 21 },
    
    // Part VIII - Career & Portfolio
    { id: '20-career-portfolio', title: 'Chapter 20: Career Growth', file: '20-career-portfolio.md', part: 'Part VIII', order: 22 },
    
    // Back Matter
    { id: 'glossary', title: 'Glossary', file: 'glossary.md', part: 'Back Matter', order: 23 },
    { id: 'references', title: 'References', file: 'references.md', part: 'Back Matter', order: 24 }
  ];

  useEffect(() => {
    console.log('📚 HandbookView: Component mounted');
    console.log('📚 Window size:', window.innerWidth, 'x', window.innerHeight);
    console.log('📚 Fixed book size:', pageWidth, 'x', pageHeight);
    
    setTimeout(() => {
      const container = document.getElementById('handbook-book');
      if (container) {
        const rect = container.getBoundingClientRect();
        console.log('📚 CONTAINER DEBUG:');
        console.log('  - Position:', { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom });
        console.log('  - Size:', { width: rect.width, height: rect.height });
        
        const styles = window.getComputedStyle(container);
        console.log('  - Padding:', styles.padding);
        console.log('  - Margin:', styles.margin);
        console.log('  - Background:', styles.backgroundColor);
        console.log('  - Display:', styles.display);
        console.log('  - Flex:', styles.flex);
        
        // Check if book is touching edges
        if (rect.top <= 0) console.warn('⚠️ BOOK TOUCHING TOP EDGE!');
        if (rect.left <= 0) console.warn('⚠️ BOOK TOUCHING LEFT EDGE!');
        if (rect.right >= window.innerWidth) console.warn('⚠️ BOOK TOUCHING RIGHT EDGE!');
        if (rect.bottom >= window.innerHeight) console.warn('⚠️ BOOK TOUCHING BOTTOM EDGE!');
        
        // Check actual book element with longer delay for react-pageflip
        setTimeout(() => {
          const bookElement = container.querySelector('.react-pageflip');
          if (bookElement) {
            const bookRect = bookElement.getBoundingClientRect();
            console.log('📚 BOOK ELEMENT DEBUG:');
            console.log('  - Book position:', { top: bookRect.top, left: bookRect.left, right: bookRect.right, bottom: bookRect.bottom });
            console.log('  - Book size:', { width: bookRect.width, height: bookRect.height });
          } else {
            console.warn('⚠️ Book element not found!');
          }
        }, 2000);
      } else {
        console.error('❌ Container element not found!');
      }
    }, 1000);
    
    loadAllPages();
  }, []);

  // Debug startPage changes
  useEffect(() => {
    console.log('📚 startPage changed to:', startPage);
  }, [startPage]);

  // No dynamic sizing - use fixed large size

  const splitContentByParagraphs = (content: string, approxCharsPerPage: number): string[] => {
    // Split by double line breaks (paragraphs) and single line breaks (sections)
    const sections = content.split(/\n\s*\n/);
    const pages: string[] = [];
    let currentPage = '';
    let currentLength = 0;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const trimmedSection = section.trim();
      if (!trimmedSection) continue;
      
      // Check if this section is a heading (starts with #)
      const isHeading = trimmedSection.startsWith('#');
      const nextSection = i + 1 < sections.length ? sections[i + 1]?.trim() : '';
      const isNextHeading = nextSection && nextSection.startsWith('#');
      
      const sectionWithSpacing = currentPage ? '\n\n' + trimmedSection : trimmedSection;
      const newLength = currentLength + sectionWithSpacing.length;
      const remainingCapacity = approxCharsPerPage - currentLength;
      
      // Heuristic: if placing a heading near the bottom, ensure there's room for some following content
      // Require at least a small chunk (~200 chars) of following content to accompany a heading
      if (isHeading && currentPage) {
        const minimalFollowing = isNextHeading ? 0 : Math.min((nextSection?.length || 0), 220);
        const neededForHeadingBlock = sectionWithSpacing.length + minimalFollowing;
        if (remainingCapacity < neededForHeadingBlock) {
          // push current page and start a new one with the heading
          pages.push(currentPage);
          currentPage = trimmedSection;
          currentLength = trimmedSection.length;
          continue;
        }
      }
      
      // If adding this section would exceed the limit and we have content
      if (newLength > approxCharsPerPage && currentPage) {
        // If this is a heading and there's content after it, move the heading to next page
        if (isHeading && nextSection) {
          pages.push(currentPage);
          currentPage = trimmedSection;
          currentLength = trimmedSection.length;
        } else {
          // For regular content, split at the current point
          pages.push(currentPage);
          currentPage = trimmedSection;
          currentLength = trimmedSection.length;
        }
      } else {
        currentPage += sectionWithSpacing;
        currentLength = newLength;
      }
    }
    
    // Add the last page if it has content
    if (currentPage.trim()) {
      pages.push(currentPage);
    }
    
    return pages;
  };

  const loadAllPages = async () => {
    setLoading(true);
    const loadedPages: Page[] = [];
    const chapterIndexMap: Record<string, number> = {};

    // Add cover page
    loadedPages.push({
      content: `# Practical Business Analysis

## A Modern Guide to Agile, Requirements & Value

---

### Teaching Handbook for Aspiring and Practicing Business Analysts

*Flip to begin your journey*`,
      title: 'Cover',
      chapterId: 'cover'
    });

    for (const chapter of chapters) {
      try {
        const response = await fetch(`/content/handbook/${chapter.file}`);
        if (response.ok) {
          const content = await response.text();
          // Determine an approximate chars-per-page based on current computed height
          // Very conservative per-page sizing to prevent clipping and orphaned headings
          const approxCharsPerPage = Math.max(1500, Math.floor((pageHeight || 1000) * 2.5));
          const segments = splitContentByParagraphs(content, approxCharsPerPage);
          chapterIndexMap[chapter.id] = loadedPages.length; // first page index for this chapter
          segments.forEach((segment) => {
            loadedPages.push({
              content: segment,
              title: chapter.title,
              chapterId: chapter.id
            });
          });
        }
      } catch (error) {
        console.error(`Error loading ${chapter.file}:`, error);
      }
    }

    console.log('📚 Total pages loaded:', loadedPages.length);
    console.log('📚 Chapter page mapping:', chapterIndexMap);
    setPages(loadedPages);
    setChapterFirstPageIndex(chapterIndexMap);
    setLoading(false);
  };

  const onFlip = (e: any) => {
    console.log('📖 Page flipped to:', e.data);
    // Only update state if this is a user-initiated flip, not programmatic
    if (!isProgrammaticFlip.current) {
      setCurrentPageNumber(e.data);
    } else {
      console.log('📖 Ignoring programmatic flip event');
      isProgrammaticFlip.current = false; // Reset flag
    }
  };

  const goToNextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const goToPage = (pageNumber: number) => {
    console.log('📚 Navigating to page:', pageNumber);
    isProgrammaticFlip.current = true;
    setStartPage(pageNumber);
    setCurrentPageNumber(pageNumber);
    setShowTOC(false);
  };

  // Disable copy-paste and right-click
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const bookElement = document.getElementById('handbook-book');
    if (bookElement) {
      bookElement.addEventListener('copy', handleCopy);
      bookElement.addEventListener('cut', handleCut);
      bookElement.addEventListener('paste', handlePaste);
      bookElement.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (bookElement) {
        bookElement.removeEventListener('copy', handleCopy);
        bookElement.removeEventListener('cut', handleCut);
        bookElement.removeEventListener('paste', handlePaste);
        bookElement.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-blue-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">Loading handbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                title="Back to Dashboard"
              >
                <Home className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">
                    BA Handbook
                  </h1>
                  <p className="text-sm text-gray-300">
                    Page {currentPageNumber + 1} of {pages.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTOC(!showTOC)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                title="Table of Contents"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents Sidebar */}
      {showTOC && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTOC(false)}
          />
          {/* Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Table of Contents
                </h2>
                <button
                  onClick={() => setShowTOC(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {filteredChapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      const target = chapterFirstPageIndex[chapter.id] ?? 0;
                      console.log('📚 TOC click - navigating to page:', target, 'for chapter:', chapter.id);
                      console.log('📚 Using react-pageflip API to navigate...');
                      
                      // Use react-pageflip API to navigate
                      if (bookRef.current && bookRef.current.pageFlip) {
                        try {
                          // Try different methods available in react-pageflip
                          const pageFlip = bookRef.current.pageFlip();
                          console.log('📚 PageFlip methods:', Object.keys(pageFlip));
                          
                          // Try turnToPage method
                          if (typeof pageFlip.turnToPage === 'function') {
                            console.log('📚 Using turnToPage method');
                            pageFlip.turnToPage(target);
                          } else if (typeof pageFlip.flip === 'function') {
                            console.log('📚 Using flip method with page number');
                            pageFlip.flip(target);
                          } else {
                            console.log('📚 Using flipNext repeatedly');
                            // Flip through pages one by one
                            let currentPage = 0;
                            const flipInterval = setInterval(() => {
                              if (currentPage < target) {
                                pageFlip.flipNext();
                                currentPage++;
                              } else {
                                clearInterval(flipInterval);
                              }
                            }, 100);
                          }
                          
                          setCurrentPageNumber(target);
                          setShowTOC(false);
                        } catch (error) {
                          console.error('📚 Error navigating to page:', error);
                        }
                      } else {
                        console.warn('📚 BookRef or pageFlip not available');
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {chapter.part}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {chapter.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Container */}
      <div 
        className="flex justify-center bg-slate-800 px-1 md:px-2" 
        id="handbook-book"
        style={{
          height: 'calc(100vh - 80px)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          padding: '60px',
          margin: '0'
        }}
      >
        <div 
          className="relative flex justify-center w-full h-full"
          style={{
            backgroundColor: 'transparent'
          }}
        >
          {/* @ts-ignore */}
          <HTMLFlipBook
            ref={bookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={pageWidth}
            maxWidth={pageWidth}
            minHeight={pageHeight}
            maxHeight={pageHeight}
            maxShadowOpacity={0.8}
            showCover={false}
            mobileScrollSupport={false}
            onFlip={onFlip}
            className="shadow-2xl"
            style={{
              width: `${pageWidth}px`,
              height: `${pageHeight}px`
            }}
            startPage={0}
            drawShadow={true}
            flippingTime={800}
            usePortrait={true}
            startZIndex={0}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={50}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages.map((page, index) => {
              // Special handling for cover page
              if (page.chapterId === 'cover') {
                return (
                  <div key={index} className="page bg-white handbook-page" style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: 'white'
                  }}>
                    <div className="h-full flex flex-col items-center justify-center text-center" style={{ padding: '3rem' }}>
                      <img 
                        src="/coverpage.png" 
                        alt="Practical Business Analysis Cover" 
                        style={{ 
                          maxWidth: '80%', 
                          maxHeight: '60%', 
                          objectFit: 'contain', 
                          marginBottom: '2rem' 
                        }}
                        onLoad={() => console.log('✅ Cover image loaded successfully')}
                        onError={(e) => {
                          console.error('❌ Cover image failed to load:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                        Practical Business Analysis
                      </h1>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#e5e7eb' }}>
                        A Modern Guide to Agile, Requirements & Value
                      </h2>
                      <p style={{ fontSize: '1.1rem', color: '#d1d5db', marginTop: '2rem' }}>
                        Teaching Handbook for Aspiring and Practicing Business Analysts
                      </p>
                      <p style={{ fontSize: '1rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem' }}>
                        Flip to begin your journey
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-300 text-center text-sm text-gray-300 flex-shrink-0">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                );
              }

              // Regular pages
              return (
                <div key={index} className="page bg-white handbook-page" style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  overflow: 'hidden', // prevent internal scrolling
                  boxSizing: 'border-box'
                }}>
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden prose prose-sm max-w-none handbook-content" style={{ paddingBottom: '1.5rem' }}>
                      <ReactMarkdown>{page.content}</ReactMarkdown>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 text-center text-sm text-gray-500 flex-shrink-0">
                      {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </HTMLFlipBook>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevPage}
            disabled={currentPageNumber === 0}
            className="absolute -left-20 top-1/2 transform -translate-y-1/2 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full shadow-2xl hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft className="w-8 h-8 text-gray-700 dark:text-white" />
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPageNumber >= pages.length - 1}
            className="absolute -right-20 top-1/2 transform -translate-y-1/2 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full shadow-2xl hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight className="w-8 h-8 text-gray-700 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .handbook-page {
          padding: 1.5rem 2rem;
        }
        
        @media (min-width: 640px) {
          .handbook-page {
            padding: 2rem 2.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .handbook-page {
            padding: 2.5rem 3rem;
          }
        }
        
        @media print {
          .page {
            page-break-after: always;
            width: 210mm;
            height: 297mm;
            padding: 20mm;
          }
        }
        
        .handbook-content {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .handbook-content h1 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          margin-top: 0;
          color: #1e3a8a;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .handbook-content h2 {
          font-size: 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #1e40af;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .handbook-content h3 {
          font-size: 1.05rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #2563eb;
          font-weight: 600;
          line-height: 1.4;
        }
        
        .handbook-content h4 {
          font-size: 0.95rem;
          margin-top: 0.85rem;
          margin-bottom: 0.4rem;
          color: #3b82f6;
          font-weight: 600;
        }
        
        .handbook-content p {
          margin-bottom: 0.85rem;
          text-align: justify;
        }
        
        .handbook-content ul, .handbook-content ol {
          margin-bottom: 0.85rem;
          padding-left: 1.75rem;
        }
        
        .handbook-content li {
          margin-bottom: 0.4rem;
        }
        
        .handbook-content strong {
          color: #111827;
          font-weight: 600;
        }
        
        .handbook-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
        }
        
        .handbook-content table {
          margin: 1.5rem 0;
          width: 100%;
          border-collapse: collapse;
        }
        
        .handbook-content th, .handbook-content td {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          text-align: left;
        }
        
        .handbook-content th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .page {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default HandbookView;