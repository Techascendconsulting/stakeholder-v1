import React, { useState } from 'react';
import { 
  BookOpen, 
  Heart, 
  Library,
  Archive,
  Sparkles
} from 'lucide-react';
import HandbookView from './HandbookView';
import BAReferenceLibrary from './BAReferenceLibrary';
import MotivationPage from './MotivationPage';

const MyResourcesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'handbook' | 'reference' | 'motivation'>('handbook');

  // Render the appropriate component based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'handbook':
        return <HandbookView showTabs={true} onTabChange={setActiveTab} />;
      case 'reference':
        return <BAReferenceLibrary showTabs={true} onTabChange={setActiveTab} />;
      case 'motivation':
        return <MotivationPage showTabs={true} onTabChange={setActiveTab} />;
      default:
        return <HandbookView showTabs={true} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Tab Navigation Bar - Fixed height for alignment */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-600" />
              My Resources
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('handbook')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'handbook'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                BA Handbook
              </button>
              <button
                onClick={() => setActiveTab('reference')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'reference'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Library className="w-4 h-4" />
                Reference Library
              </button>
              <button
                onClick={() => setActiveTab('motivation')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'motivation'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                Motivation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default MyResourcesView;
