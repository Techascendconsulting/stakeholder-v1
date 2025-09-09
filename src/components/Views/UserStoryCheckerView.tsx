import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, FileText } from 'lucide-react';

interface StoryQualityResult {
  roleClarity: boolean;
  triggerAction: boolean;
  outcomeResult: boolean;
  acFormat: boolean;
  notTooTechnical: boolean;
  businessRulesPresent: boolean;
  scopeAppropriate: boolean;
}

interface ACCoverageResult {
  happyPath: boolean;
  inputTrigger: boolean;
  errors: boolean;
  feedback: boolean;
  nonFunctionals: boolean;
  businessRules: boolean;
  scope: boolean;
}

const UserStoryCheckerView: React.FC = () => {
  const [userStory, setUserStory] = useState('');
  const [results, setResults] = useState<{
    storyQuality: StoryQualityResult | null;
    acCoverage: ACCoverageResult | null;
  }>({ storyQuality: null, acCoverage: null });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const analyzeStoryQuality = (story: string): StoryQualityResult => {
    const lowerStory = story.toLowerCase();
    
    return {
      roleClarity: /as a \w+/i.test(story),
      triggerAction: /i want to \w+/i.test(story),
      outcomeResult: /so that/i.test(story),
      acFormat: /given|when|then|acceptance criteria/i.test(story),
      notTooTechnical: !/api|database|sql|json|xml|rest|endpoint/i.test(lowerStory),
      businessRulesPresent: /rule|policy|validation|limit|maximum|minimum/i.test(lowerStory),
      scopeAppropriate: story.length < 200 && !/and also|additionally|furthermore/i.test(story)
    };
  };

  const analyzeACCoverage = (story: string): ACCoverageResult => {
    const lowerStory = story.toLowerCase();
    
    return {
      happyPath: /success|complete|upload|submit/i.test(lowerStory),
      inputTrigger: /when|if|user|click|select/i.test(lowerStory),
      errors: /error|invalid|fail|reject|deny/i.test(lowerStory),
      feedback: /message|notification|confirm|success|feedback/i.test(lowerStory),
      nonFunctionals: /size|time|performance|mobile|responsive/i.test(lowerStory),
      businessRules: /rule|policy|validation|limit|maximum|minimum/i.test(lowerStory),
      scope: story.length < 200
    };
  };

  const handleCheckStory = () => {
    if (userStory.length < 50) {
      alert('Please enter at least 50 characters for a meaningful analysis.');
      return;
    }

    const storyQuality = analyzeStoryQuality(userStory);
    const acCoverage = analyzeACCoverage(userStory);
    
    setResults({ storyQuality, acCoverage });
    setShowSuggestions(true);
  };

  const getQualityScore = (quality: StoryQualityResult): number => {
    const total = Object.keys(quality).length;
    const passed = Object.values(quality).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  };

  const getCoverageScore = (coverage: ACCoverageResult): number => {
    const total = Object.keys(coverage).length;
    const passed = Object.values(coverage).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  };

  const QualityIcon = ({ passed }: { passed: boolean }) => 
    passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;

  const CoverageIcon = ({ passed }: { passed: boolean }) => 
    passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Story Quality & Acceptance Criteria Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze your user stories for quality and completeness. Get feedback on story structure and acceptance criteria coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                User Story Input
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste your user story and any acceptance criteria
                  </label>
                  <textarea
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                    placeholder="As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to understand and resolve the problem.

Acceptance Criteria:
- Given a tenant is submitting a maintenance request
- When they click 'Add Attachment'
- Then they should be able to upload files..."
                    className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm ${userStory.length < 50 ? 'text-red-500' : 'text-green-500'}`}>
                      {userStory.length}/50 characters minimum
                    </span>
                    <span className="text-sm text-gray-500">
                      {userStory.length} characters
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckStory}
                  disabled={userStory.length < 50}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Check My Story</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            {/* Story Quality Panel */}
            {results.storyQuality && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Story Quality Check
                  </h2>
                  <div className="text-2xl font-bold text-purple-600">
                    {getQualityScore(results.storyQuality)}%
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.roleClarity} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Clear role: "As a [user type]"
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.triggerAction} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Clear action: "I want to [action]"
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.outcomeResult} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Clear outcome: "so that [benefit]"
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.acFormat} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Acceptance criteria format
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.notTooTechnical} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Not too technical
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.businessRulesPresent} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Business rules included
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <QualityIcon passed={results.storyQuality.scopeAppropriate} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Appropriate scope
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AC Coverage Panel */}
            {results.acCoverage && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    AC Completeness Scan
                  </h2>
                  <div className="text-2xl font-bold text-blue-600">
                    {getCoverageScore(results.acCoverage)}%
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.happyPath} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Happy Path
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.inputTrigger} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Input/Trigger
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.errors} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Error Handling
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.feedback} />
                    <span className="text-gray-700 dark:text-gray-300">
                      User Feedback
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.nonFunctionals} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Non-Functional Requirements
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.businessRules} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Business Rules
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CoverageIcon passed={results.acCoverage.scope} />
                    <span className="text-gray-700 dark:text-gray-300">
                      Scope
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Suggestions Panel */}
            {showSuggestions && results.storyQuality && results.acCoverage && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Smart Suggestions
                </h2>
                
                <div className="space-y-3">
                  {!results.storyQuality.roleClarity && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        💡 <strong>Role Clarity:</strong> Start with "As a [specific user type]" to clearly define who the story is for.
                      </p>
                    </div>
                  )}
                  
                  {!results.acCoverage.errors && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        ⚠️ <strong>Error Handling:</strong> Consider what happens when things go wrong (file too large, invalid format, network issues).
                      </p>
                    </div>
                  )}
                  
                  {!results.acCoverage.feedback && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💬 <strong>User Feedback:</strong> Define what users see after successful/failed actions (success messages, error notifications).
                      </p>
                    </div>
                  )}
                  
                  {!results.acCoverage.nonFunctionals && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        📱 <strong>Non-Functional:</strong> Consider performance, mobile experience, file size limits, and response times.
                      </p>
                    </div>
                  )}
                </div>
                
                <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                  Generate Acceptance Criteria
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStoryCheckerView;
