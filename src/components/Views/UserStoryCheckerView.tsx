import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, FileText } from 'lucide-react';

// ✅ User Story & AC Rules Engine - Universal Prompt System
const STORY_QUALITY_RULES = [
  {
    name: "Role Clarity",
    key: "roleClarity",
    detect: (text) => /as a \w+|as an \w+|as the \w+/i.test(text),
    prompt: "Who is the user? Start with 'As a [user type]'",
    missingMessage: "Missing clear user role. Start with 'As a [user type]'"
  },
  {
    name: "Action Clarity", 
    key: "actionClarity",
    detect: (text) => /i want to \w+|i need to \w+|i can \w+/i.test(text),
    prompt: "What does the user want to do? Use 'I want to [action]'",
    missingMessage: "Missing clear action. Use 'I want to [action]'"
  },
  {
    name: "Outcome Clarity",
    key: "outcomeClarity", 
    detect: (text) => /so that|in order to|to enable|to allow/i.test(text),
    prompt: "Why does the user want this? Use 'so that [benefit]'",
    missingMessage: "Missing clear outcome. Use 'so that [benefit]'"
  },
  {
    name: "Not Too Technical",
    key: "notTooTechnical",
    detect: (text) => !/api|database|sql|json|xml|rest|endpoint|microservice|kubernetes|docker|aws|azure/i.test(text.toLowerCase()),
    prompt: "Is this written in business language, not technical jargon?",
    missingMessage: "Too technical. Write in business language, not developer terms."
  },
  {
    name: "Appropriate Scope",
    key: "appropriateScope",
    detect: (text) => text.length < 200 && !/and also|additionally|furthermore|moreover|also.*want/i.test(text),
    prompt: "Does this focus on one specific outcome?",
    missingMessage: "Scope too broad. Focus on one specific outcome per story."
  }
];

const AC_COVERAGE_RULES = [
  {
    name: "Happy Path",
    key: "happyPath",
    detect: (text) => /success|complete|upload|submit|given.*when.*then|happy path|normal flow/i.test(text.toLowerCase()),
    prompt: "What happens in the normal, successful scenario?",
    missingMessage: "Missing happy path. Describe what happens when everything works correctly."
  },
  {
    name: "Input/Trigger",
    key: "inputTrigger",
    detect: (text) => /when.*user|when.*click|when.*select|given.*when|trigger|input|action|button|click/i.test(text.toLowerCase()),
    prompt: "What input or action starts the feature?",
    missingMessage: "You haven't described what input or action starts the feature."
  },
  {
    name: "Business Rules",
    key: "businessRules",
    detect: (text) => /must|only|should not|limit|allowed|validate|require|file type|size|format/i.test(text.toLowerCase()),
    prompt: "Are there any rules or constraints the system must enforce?",
    missingMessage: "No business rules detected. Add conditions like allowed file types or limits."
  },
  {
    name: "Feedback",
    key: "feedback",
    detect: (text) => /success message|error message|see|receive|shown|confirmation|notification|display|show/i.test(text.toLowerCase()),
    prompt: "What does the user see, hear, or receive after completing the action?",
    missingMessage: "Missing user feedback. How does the user know it worked or failed?"
  },
  {
    name: "Error Handling",
    key: "errors",
    detect: (text) => /error|fail|invalid|wrong|blocked|retry|exceed|oversize|timeout|exception/i.test(text.toLowerCase()),
    prompt: "What happens when things go wrong — invalid input, failure, or edge cases?",
    missingMessage: "No error handling described. What happens when something fails?"
  },
  {
    name: "Non-Functionals",
    key: "nonFunctionals",
    detect: (text) => /speed|performance|mobile|load|responsive|secure|reliable|fast|quick|seconds|mb|kb/i.test(text.toLowerCase()),
    prompt: "Should this work on mobile? Fast? Secure? Reliable?",
    missingMessage: "No non-functional requirements included. Should it load fast or support mobile?"
  },
  {
    name: "Separate Story?",
    key: "separateStory",
    detect: (text) => !/and.*(email|track|store|log)|multiple.*features|also.*want|additionally/i.test(text.toLowerCase()),
    prompt: "Does this story try to do too much? Should it be split?",
    missingMessage: "This story might combine multiple outcomes. Consider splitting."
  }
];

interface RuleResult {
  name: string;
  key: string;
  status: "✅" | "❌";
  message: string | null;
  prompt: string;
}

interface StoryQualityResult {
  roleClarity: boolean;
  actionClarity: boolean;
  outcomeClarity: boolean;
  notTooTechnical: boolean;
  appropriateScope: boolean;
  hasAcceptanceCriteria: boolean;
}

interface ACCoverageResult {
  happyPath: boolean;
  inputTrigger: boolean;
  businessRules: boolean;
  feedback: boolean;
  errors: boolean;
  nonFunctionals: boolean;
  separateStory: boolean;
}

// Rule evaluation functions
export function checkRule(text: string, rule: any): RuleResult {
  const passed = rule.detect(text);
  return {
    name: rule.name,
    key: rule.key,
    status: passed ? "✅" : "❌",
    message: passed ? null : rule.missingMessage,
    prompt: rule.prompt
  };
}

export function evaluateUserStory(rawText: string): RuleResult[] {
  return STORY_QUALITY_RULES.map(rule => checkRule(rawText, rule));
}

export function evaluateAcceptanceCriteria(rawText: string): RuleResult[] {
  return AC_COVERAGE_RULES.map(rule => checkRule(rawText, rule));
}

const UserStoryCheckerView: React.FC = () => {
  const [userStory, setUserStory] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [results, setResults] = useState<{
    storyQuality: RuleResult[] | null;
    acCoverage: RuleResult[] | null;
  }>({ storyQuality: null, acCoverage: null });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const analyzeStoryQuality = (story: string, hasAC: boolean): RuleResult[] => {
    const storyResults = evaluateUserStory(story);
    
    // Add AC format rule
    const acFormatRule: RuleResult = {
      name: "Acceptance Criteria",
      key: "hasAcceptanceCriteria",
      status: hasAC ? "✅" : "❌",
      message: hasAC ? null : "No acceptance criteria provided. Add detailed criteria to make the story testable.",
      prompt: "Are there detailed acceptance criteria that define when this story is complete?"
    };
    
    return [...storyResults, acFormatRule];
  };

  const analyzeACCoverage = (acText: string): RuleResult[] => {
    console.log('🔍 AC Analysis - Input AC text:', acText);
    console.log('🔍 AC Analysis - AC length:', acText.length);
    
    if (!acText.trim()) {
      console.log('❌ No AC provided - returning all false');
      // Return all rules as failed when no AC is provided
      return AC_COVERAGE_RULES.map(rule => ({
        name: rule.name,
        key: rule.key,
        status: "❌" as const,
        message: "No acceptance criteria provided",
        prompt: rule.prompt
      }));
    }
    
    return evaluateAcceptanceCriteria(acText);
  };

  const handleCheckStory = () => {
    if (userStory.length < 50) {
      alert('Please enter at least 50 characters for a meaningful analysis.');
      return;
    }

    console.log('🔍 Analyzing user story:', userStory);
    console.log('🔍 Analyzing acceptance criteria:', acceptanceCriteria);
    console.log('📏 Story length:', userStory.length);
    console.log('📏 AC length:', acceptanceCriteria.length);
    
    const storyQuality = analyzeStoryQuality(userStory, acceptanceCriteria.trim().length > 0);
    const acCoverage = analyzeACCoverage(acceptanceCriteria);
    
    console.log('📊 Story Quality Results:', storyQuality);
    console.log('📊 AC Coverage Results:', acCoverage);
    
    setResults({ storyQuality, acCoverage });
    setShowSuggestions(true);
  };

  const getScore = (rules: RuleResult[]): number => {
    const total = rules.length;
    const passed = rules.filter(rule => rule.status === "✅").length;
    return Math.round((passed / total) * 100);
  };

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
                Story & Acceptance Criteria Input
              </h2>
              
              <div className="space-y-6">
                {/* User Story Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Story
                  </label>
                  <textarea
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                    placeholder="As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to understand and resolve the problem."
                    className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
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

                {/* Acceptance Criteria Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Acceptance Criteria (Optional)
                  </label>
                  <textarea
                    value={acceptanceCriteria}
                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                    placeholder="Given a tenant is submitting a maintenance request
When they click 'Add Attachment'
Then they should be able to upload files up to 5MB
And they should see a success message after upload
And they should be able to preview the uploaded file

Error Cases:
- If file is larger than 5MB, show error message
- If file type is not supported, show error message
- If upload fails, show retry option"
                    className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {acceptanceCriteria.length} characters
                    </span>
                    <span className="text-sm text-blue-500">
                      {acceptanceCriteria.length > 0 ? 'AC provided' : 'No AC provided'}
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
                  <h3 className="text-lg font-semibold text-green-500 dark:text-green-400">
                    🟩 User Story Quality Check
                  </h3>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getScore(results.storyQuality)}% Complete
                  </span>
                </div>
                <div className="space-y-3">
                  {results.storyQuality.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="text-lg">{rule.status}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{rule.name}</div>
                        {rule.message && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {rule.message}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          💡 {rule.prompt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AC Coverage Panel */}
            {results.acCoverage && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-yellow-500 dark:text-yellow-400">
                    🟨 Acceptance Criteria Coverage
                  </h3>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getScore(results.acCoverage)}% Complete
                  </span>
                </div>
                {!acceptanceCriteria.trim() && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>No Acceptance Criteria Provided:</strong> You can add acceptance criteria in the separate input box above to get detailed coverage analysis. This will help ensure your story is well-defined and testable.
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {results.acCoverage.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="text-lg">{rule.status}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{rule.name}</div>
                        {rule.message && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {rule.message}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          💡 {rule.prompt}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {/* Show suggestions for failed story quality rules */}
                  {results.storyQuality
                    .filter(rule => rule.status === "❌")
                    .map((rule, index) => (
                      <div key={`story-${index}`} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          💡 <strong>{rule.name}:</strong> {rule.message}
                        </p>
                      </div>
                    ))}
                  
                  {/* Show suggestions for failed AC coverage rules */}
                  {results.acCoverage
                    .filter(rule => rule.status === "❌")
                    .map((rule, index) => (
                      <div key={`ac-${index}`} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          ⚠️ <strong>{rule.name}:</strong> {rule.message}
                        </p>
                      </div>
                    ))}
                </div>
                
                <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                  💡 Generate Detailed ACs
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
