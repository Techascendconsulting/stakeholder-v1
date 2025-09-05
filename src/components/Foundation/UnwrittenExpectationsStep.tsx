import React from 'react';
import { Eye, EyeOff, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface UnwrittenExpectationsStepProps {
  onComplete: () => void;
}

export const UnwrittenExpectationsStep: React.FC<UnwrittenExpectationsStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Unwritten Expectations</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the hidden assumptions and unspoken requirements that can make or break your project.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* What are Unwritten Expectations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">What are Unwritten Expectations?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Definition</h4>
              <p className="text-gray-700 mb-4">
                <strong>Unwritten expectations</strong> are assumptions, beliefs, and requirements that 
                stakeholders have but haven't explicitly stated. They're the "obvious" things that 
                everyone "knows" but no one has documented.
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <p className="text-sm text-pink-800">
                  <strong>Think of it like a restaurant:</strong> You expect clean silverware, 
                  but it's not written on the menu. If it's missing, you're disappointed even 
                  though it was never promised.
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Why They Matter</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>They're often the real success criteria</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Missing them leads to project failure</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>They're usually the hardest to discover</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>They can change throughout the project</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Types of Unwritten Expectations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Types of Unwritten Expectations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-red-900 mb-3">Performance Expectations</h4>
              <p className="text-sm text-red-800 mb-3">
                Unspoken assumptions about speed, capacity, reliability, or quality.
              </p>
              <div className="text-xs text-red-700">
                <strong>Examples:</strong> "It should be fast," "It should never crash," "It should work on my old computer"
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900 mb-3">Usability Expectations</h4>
              <p className="text-sm text-blue-800 mb-3">
                Assumptions about how easy or intuitive the solution should be to use.
              </p>
              <div className="text-xs text-blue-700">
                <strong>Examples:</strong> "It should be like Google," "I shouldn't need training," "It should remember my preferences"
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-900 mb-3">Feature Expectations</h4>
              <p className="text-sm text-green-800 mb-3">
                Assumptions about functionality that "obviously" should be included.
              </p>
              <div className="text-xs text-green-700">
                <strong>Examples:</strong> "Of course it can export to Excel," "It should send email notifications," "It should work offline"
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <EyeOff className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-900 mb-3">Process Expectations</h4>
              <p className="text-sm text-purple-800 mb-3">
                Assumptions about how the solution fits into existing workflows.
              </p>
              <div className="text-xs text-purple-700">
                <strong>Examples:</strong> "It should integrate with our current system," "It should follow our approval process," "It should generate reports we already use"
              </div>
            </div>
          </div>
        </div>

        {/* How to Discover Unwritten Expectations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">How to Discover Unwritten Expectations</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Discovery Techniques</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-pink-600">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Ask "What If" Questions</div>
                      <div className="text-sm text-gray-600">"What if the system is slow? What if it crashes?"</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-pink-600">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Use Scenario-Based Questions</div>
                      <div className="text-sm text-gray-600">"Walk me through a typical day using this system"</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-pink-600">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Observe Current Behavior</div>
                      <div className="text-sm text-gray-600">Watch how people work with existing systems</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-pink-600">4</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Ask About Past Disappointments</div>
                      <div className="text-sm text-gray-600">"What didn't work well with previous solutions?"</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-pink-600">5</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Use Prototypes and Mockups</div>
                      <div className="text-sm text-gray-600">Show something visual to trigger reactions</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-pink-600">6</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Ask About Success Criteria</div>
                      <div className="text-sm text-gray-600">"How will you know this project succeeded?"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-World Example</h3>
          <div className="space-y-4 text-gray-700">
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <h4 className="font-medium text-gray-900 mb-2">The Situation:</h4>
              <p className="text-sm">
                A company built a new customer portal. The requirements said "customers can view their orders" 
                and "customers can update their profile." The system worked perfectly according to specs.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <h4 className="font-medium text-gray-900 mb-2">The Unwritten Expectations:</h4>
              <ul className="text-sm space-y-1">
                <li>• "View orders" meant "see order history for the last 2 years" (not just current orders)</li>
                <li>• "Update profile" meant "change everything except email address" (not just name/phone)</li>
                <li>• The system should work on mobile phones (never mentioned)</li>
                <li>• Password reset should be instant (not take 5 minutes)</li>
                <li>• The interface should look "professional" (subjective but important)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <h4 className="font-medium text-gray-900 mb-2">The Result:</h4>
              <p className="text-sm">
                Customers were frustrated and complained. The project was considered a failure even though 
                it met all documented requirements. The team had to spend 3 more months adding the "missing" features.
              </p>
            </div>
          </div>
        </div>

        {/* Common Unwritten Expectations */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-900 mb-4">Common Unwritten Expectations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-900 mb-3">Technical Expectations</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should work on all devices/browsers</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should be fast (but "fast" is undefined)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should never lose data</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should integrate with everything</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-900 mb-3">User Experience Expectations</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should be intuitive (no training needed)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should look modern/professional</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should remember user preferences</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>It should provide helpful error messages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>Unwritten expectations are often more important than written requirements.</strong>
            </p>
            <p className="mb-3">
              As a BA, your job isn't just to document what people say they want - it's to discover 
              what they really expect, even when they can't articulate it.
            </p>
            <p className="mb-3">
              The best way to uncover these hidden expectations is through active listening, 
              observation, and asking the right questions at the right time.
            </p>
            <p>
              Remember: If you don't discover unwritten expectations during requirements gathering, 
              you'll discover them during user acceptance testing - and that's much more expensive to fix.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand Unwritten Expectations
        </button>
      </div>
    </div>
  );
};
