import React from 'react';
import { FileText, Target, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface RequirementsEngineeringStepProps {
  onComplete: () => void;
}

export const RequirementsEngineeringStep: React.FC<RequirementsEngineeringStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Requirements Engineering</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          The foundation of successful projects: understanding what stakeholders really need and translating it into clear, actionable requirements.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* What are Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">What Are Requirements?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Simple Definition</h4>
              <p className="text-gray-700 mb-4">
                Requirements are <strong>clear statements</strong> of what a system, process, or solution must do to meet business needs.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Think of it like ordering food:</strong> You don't just say "I want food." 
                  You specify "I want a medium pizza with pepperoni, delivered in 30 minutes."
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Why Requirements Matter</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Prevent misunderstandings between teams</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Provide clear success criteria</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Enable accurate time and cost estimates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reduce project risks and rework</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Types of Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Types of Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900 mb-3">Business Requirements</h4>
              <p className="text-sm text-blue-800 mb-3">
                High-level business goals and objectives that the solution must achieve.
              </p>
              <div className="text-xs text-blue-700">
                <strong>Example:</strong> "Reduce customer service response time by 50%"
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-900 mb-3">Functional Requirements</h4>
              <p className="text-sm text-green-800 mb-3">
                Specific features and functions the system must perform.
              </p>
              <div className="text-xs text-green-700">
                <strong>Example:</strong> "System must send email notifications when orders are processed"
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-900 mb-3">Non-Functional Requirements</h4>
              <p className="text-sm text-purple-800 mb-3">
                Quality attributes like performance, security, usability, and reliability.
              </p>
              <div className="text-xs text-purple-700">
                <strong>Example:</strong> "System must handle 1000 concurrent users"
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Gathering Process */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">The Requirements Gathering Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Step-by-Step Process</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Identify Stakeholders</div>
                    <div className="text-sm text-gray-600">Who are the people affected by this solution?</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Conduct Interviews</div>
                    <div className="text-sm text-gray-600">Ask questions to understand current state and needs</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Document Requirements</div>
                    <div className="text-sm text-gray-600">Write clear, testable requirements</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">4</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Validate & Prioritize</div>
                    <div className="text-sm text-gray-600">Confirm with stakeholders and rank importance</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Key Techniques</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 text-sm">Stakeholder Interviews</div>
                  <div className="text-xs text-gray-600">One-on-one conversations to understand needs</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 text-sm">Workshops</div>
                  <div className="text-xs text-gray-600">Group sessions to gather input from multiple people</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 text-sm">Process Mapping</div>
                  <div className="text-xs text-gray-600">Visualize current workflows to identify gaps</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 text-sm">Prototyping</div>
                  <div className="text-xs text-gray-600">Create mockups to validate understanding</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Requirements Pitfalls */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Common Requirements Pitfalls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-900 mb-3">What Goes Wrong</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Vague requirements like "make it user-friendly"</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Assuming you know what users want</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Not involving all relevant stakeholders</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Requirements that can't be tested</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-900 mb-3">How to Avoid Them</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Use specific, measurable criteria</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ask "why" to understand root needs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Create a comprehensive stakeholder map</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Write testable acceptance criteria</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-World Example</h3>
          <div className="space-y-4 text-gray-700">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h4 className="font-medium text-gray-900 mb-2">The Situation:</h4>
              <p className="text-sm">
                A hospital wanted to "improve patient care" by implementing a new system. 
                The initial requirement was vague and led to a $2M project that didn't solve the real problems.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h4 className="font-medium text-gray-900 mb-2">What the BA Did:</h4>
              <ul className="text-sm space-y-1">
                <li>• Interviewed nurses, doctors, and administrators</li>
                <li>• Discovered the real problem: patients waiting 3+ hours for test results</li>
                <li>• Identified that lab results weren't being delivered to the right people quickly</li>
                <li>• Wrote specific requirements: "System must deliver lab results to ordering physician within 15 minutes"</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h4 className="font-medium text-gray-900 mb-2">The Result:</h4>
              <p className="text-sm">
                Clear requirements led to a focused $200K solution that reduced patient wait times by 70% 
                and improved patient satisfaction scores significantly.
              </p>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>Good requirements are the foundation of successful projects.</strong> They must be:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Clear</strong> - Anyone can understand what's needed</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Complete</strong> - Cover all necessary functionality</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Testable</strong> - You can verify if they're met</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Prioritized</strong> - Ranked by business importance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand Requirements Engineering
        </button>
      </div>
    </div>
  );
};
