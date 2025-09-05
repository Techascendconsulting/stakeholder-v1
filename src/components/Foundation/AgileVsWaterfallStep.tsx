import React from 'react';
import { GitBranch, Calendar, Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface AgileVsWaterfallStepProps {
  onComplete: () => void;
}

export const AgileVsWaterfallStep: React.FC<AgileVsWaterfallStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Agile vs Waterfall</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Understanding different project methodologies and when to use each approach for maximum success.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Methodology Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Waterfall */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900">Waterfall</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Sequential phases where each phase must be completed before the next begins.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-blue-700">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Requirements → Design → Development → Testing → Deployment</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">Best For</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Projects with clear, stable requirements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Regulated industries (healthcare, finance)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Large, complex systems</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>When documentation is critical</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">Pros & Cons</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-green-100 p-2 rounded text-xs">
                    <div className="font-medium text-green-800">Pros:</div>
                    <div className="text-green-700">Clear milestones, comprehensive documentation, predictable timeline</div>
                  </div>
                  <div className="bg-red-100 p-2 rounded text-xs">
                    <div className="font-medium text-red-800">Cons:</div>
                    <div className="text-red-700">Rigid, late feedback, hard to change requirements</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agile */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900">Agile</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-900 mb-2">How It Works</h4>
                <p className="text-sm text-green-800 mb-3">
                  Iterative development in short sprints with continuous feedback and adaptation.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-green-700">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Sprint 1 → Sprint 2 → Sprint 3 → (Repeat until done)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-green-900 mb-2">Best For</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Projects with evolving requirements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Software development</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Innovation and experimentation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>When speed to market matters</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-green-900 mb-2">Pros & Cons</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-green-100 p-2 rounded text-xs">
                    <div className="font-medium text-green-800">Pros:</div>
                    <div className="text-green-700">Flexible, early feedback, faster delivery, customer collaboration</div>
                  </div>
                  <div className="bg-red-100 p-2 rounded text-xs">
                    <div className="font-medium text-red-800">Cons:</div>
                    <div className="text-red-700">Less predictable, requires active participation, can lack documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Visual Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Waterfall Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-20 h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center mr-2">Requirements</div>
                  <div className="w-20 h-8 bg-blue-400 rounded text-white text-xs flex items-center justify-center mr-2">Design</div>
                  <div className="w-20 h-8 bg-blue-300 rounded text-white text-xs flex items-center justify-center mr-2">Build</div>
                  <div className="w-20 h-8 bg-blue-200 rounded text-white text-xs flex items-center justify-center mr-2">Test</div>
                  <div className="w-20 h-8 bg-blue-100 rounded text-gray-800 text-xs flex items-center justify-center">Deploy</div>
                </div>
                <p className="text-sm text-gray-600">Sequential phases, no overlap</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Agile Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-16 h-8 bg-green-500 rounded text-white text-xs flex items-center justify-center mr-1">Sprint 1</div>
                  <div className="w-16 h-8 bg-green-400 rounded text-white text-xs flex items-center justify-center mr-1">Sprint 2</div>
                  <div className="w-16 h-8 bg-green-300 rounded text-white text-xs flex items-center justify-center mr-1">Sprint 3</div>
                  <div className="w-16 h-8 bg-green-200 rounded text-white text-xs flex items-center justify-center mr-1">Sprint 4</div>
                  <div className="w-16 h-8 bg-green-100 rounded text-gray-800 text-xs flex items-center justify-center">...</div>
                </div>
                <p className="text-sm text-gray-600">Iterative cycles, continuous delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* BA Role in Each Methodology */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">BA Role in Each Methodology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Waterfall BA Role</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Extensive upfront requirements gathering</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Detailed documentation and specifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Change control and scope management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>User acceptance testing coordination</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Agile BA Role</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Continuous stakeholder collaboration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>User story writing and backlog management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sprint planning and daily standups</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Iterative feedback and refinement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* When to Choose Which */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">When to Choose Which?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                Choose Waterfall When:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Requirements are well-defined and unlikely to change</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Compliance and documentation are critical</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Project timeline and budget are fixed</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Team is distributed and coordination is difficult</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                Choose Agile When:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Requirements are evolving or unclear</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Speed to market is important</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Customer feedback is readily available</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Team can work closely together</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-World Example</h3>
          <div className="space-y-4 text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Waterfall Success:</h4>
                <p className="text-sm text-blue-800">
                  <strong>Banking System Upgrade</strong><br/>
                  Clear regulatory requirements, fixed compliance deadlines, 
                  and well-defined functionality made Waterfall the right choice. 
                  Project delivered on time with full documentation.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Agile Success:</h4>
                <p className="text-sm text-green-800">
                  <strong>Mobile App Development</strong><br/>
                  Changing user preferences, evolving technology, 
                  and need for rapid iteration made Agile perfect. 
                  App launched 3 months early with higher user satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>There's no "best" methodology - only the right one for your specific situation.</strong>
            </p>
            <p className="mb-3">
              As a BA, you need to understand both approaches and help your team choose the methodology 
              that best fits the project's requirements, constraints, and business context.
            </p>
            <p>
              Many organizations now use <strong>hybrid approaches</strong> - combining the structure of Waterfall 
              with the flexibility of Agile to get the best of both worlds.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand Agile vs Waterfall
        </button>
      </div>
    </div>
  );
};
