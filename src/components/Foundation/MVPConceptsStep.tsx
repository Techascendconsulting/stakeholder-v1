import React from 'react';
import { Target, Zap, Users, CheckCircle, Lightbulb } from 'lucide-react';

interface MVPConceptsStepProps {
  onComplete: () => void;
}

export const MVPConceptsStep: React.FC<MVPConceptsStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">MVP Concepts</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Learn how to build the right thing by starting with the minimum viable product approach.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* What is MVP */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">What is an MVP?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Definition</h4>
              <p className="text-gray-700 mb-4">
                A <strong>Minimum Viable Product (MVP)</strong> is the simplest version of a product 
                that can be released with just enough features to satisfy early customers and provide 
                feedback for future development.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Think of it like a restaurant:</strong> You don't open with a full menu. 
                  You start with 3-4 signature dishes, test what customers love, then expand.
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Why MVP Matters</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Validates assumptions with real users</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reduces time to market</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Minimizes development costs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Enables rapid iteration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* MVP vs Full Product */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">MVP vs Full Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-900">MVP Approach</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Core features only</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quick to build and test</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>User feedback drives next features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Lower risk of building wrong thing</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-red-900">Full Product Approach</h4>
              </div>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>All features planned upfront</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Long development time</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>No user feedback until launch</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>High risk of building wrong thing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Define an MVP */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">How to Define an MVP</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Step-by-Step Process</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-600">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Identify Core Problem</div>
                      <div className="text-sm text-gray-600">What's the main pain point you're solving?</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-600">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">List All Features</div>
                      <div className="text-sm text-gray-600">Brainstorm everything you could build</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-600">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Prioritize by Value</div>
                      <div className="text-sm text-gray-600">Which features solve the core problem?</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-600">4</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Cut to Minimum</div>
                      <div className="text-sm text-gray-600">Remove everything except core features</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-600">5</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Test with Users</div>
                      <div className="text-sm text-gray-600">Get feedback on the minimal version</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-600">6</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Iterate & Expand</div>
                      <div className="text-sm text-gray-600">Add features based on user feedback</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Examples */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Real-World MVP Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Dropbox MVP</h4>
              <p className="text-sm text-gray-700 mb-3">
                Instead of building the full file sync system, they created a simple video 
                showing how it would work. The video got 75,000 signups in one day!
              </p>
              <div className="text-xs text-gray-600">
                <strong>Lesson:</strong> Sometimes the MVP is just proving demand exists.
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Airbnb MVP</h4>
              <p className="text-sm text-gray-700 mb-3">
                Started with just a simple website where the founders rented out air mattresses 
                in their apartment during a conference. No payment system, no reviews, no maps.
              </p>
              <div className="text-xs text-gray-600">
                <strong>Lesson:</strong> Start with the core value proposition only.
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Zappos MVP</h4>
              <p className="text-sm text-gray-700 mb-3">
                The founder went to shoe stores, took photos of shoes, posted them online, 
                and when someone ordered, he went back to buy the shoes and ship them.
              </p>
              <div className="text-xs text-gray-600">
                <strong>Lesson:</strong> Manual processes can validate the concept before automation.
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Buffer MVP</h4>
              <p className="text-sm text-gray-700 mb-3">
                Started with just a landing page explaining the concept and a "Pricing" page. 
                When people clicked "Plans & Pricing," they got a "Coming Soon" message.
              </p>
              <div className="text-xs text-gray-600">
                <strong>Lesson:</strong> Test willingness to pay before building the product.
              </div>
            </div>
          </div>
        </div>

        {/* Common MVP Mistakes */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-900 mb-4">Common MVP Mistakes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-900 mb-3">What Goes Wrong</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Making MVP too minimal (no real value)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Making MVP too complex (defeats the purpose)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Not getting real user feedback</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Building features nobody asked for</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-900 mb-3">How to Avoid Them</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Focus on solving ONE core problem well</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Get feedback from real users, not just friends</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Measure what users actually do, not what they say</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Be ready to pivot based on feedback</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BA Role in MVP */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">BA Role in MVP Development</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>As a BA, you're crucial in MVP development because you understand both business needs and user requirements.</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Key Responsibilities:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Identify the core business problem</span>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Prioritize features by business value</span>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Define success metrics</span>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Facilitate user feedback sessions</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Questions You Should Ask:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start">
                    <Users className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>"What's the minimum that would solve this problem?"</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>"How will we know if this MVP is successful?"</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>"What can we remove without losing core value?"</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>"Who are our early adopters and what do they need?"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>MVP is not about building less - it's about learning more.</strong>
            </p>
            <p className="mb-3">
              The goal is to validate your assumptions about what users want and need, 
              so you can build the right thing instead of building everything.
            </p>
            <p>
              As a BA, you help teams focus on the core value proposition and avoid 
              the common trap of building features that seem important but don't actually 
              solve the user's problem.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand MVP Concepts
        </button>
      </div>
    </div>
  );
};
