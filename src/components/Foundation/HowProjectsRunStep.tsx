import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Users, Target } from 'lucide-react';

interface HowProjectsRunStepProps {
  onComplete: () => void;
}

export const HowProjectsRunStep: React.FC<HowProjectsRunStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How Projects Actually Run</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Understanding the project lifecycle and how BAs fit into the bigger picture of delivering business value.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Project Lifecycle Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">The Project Lifecycle</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Initiation</h4>
              <p className="text-sm text-gray-600">Define the problem and project scope</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Planning</h4>
              <p className="text-sm text-gray-600">Design the solution and plan execution</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Execution</h4>
              <p className="text-sm text-gray-600">Build and implement the solution</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Closure</h4>
              <p className="text-sm text-gray-600">Deliver, test, and measure success</p>
            </div>
          </div>
        </div>

        {/* Detailed Project Phases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Project Phases */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Phase 1: Initiation
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Identify the business problem or opportunity</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Define project scope and objectives</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Identify key stakeholders</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Get approval and funding</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Phase 2: Planning
              </h3>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Gather detailed requirements</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Design the solution architecture</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Create project timeline and budget</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Assemble the project team</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - More Phases */}
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Phase 3: Execution
              </h3>
              <div className="space-y-3 text-sm text-purple-800">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Build the solution (development)</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Test and validate functionality</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage changes and issues</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Communicate progress to stakeholders</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Phase 4: Closure
              </h3>
              <div className="space-y-3 text-sm text-orange-800">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Deploy the solution to users</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Train users on new processes</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Measure success and benefits</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Document lessons learned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BA Role in Each Phase */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Where BAs Fit In</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Early Phases (Initiation & Planning)</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Lead stakeholder interviews and requirements gathering</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Analyze current state and identify gaps</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Design future state processes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Write detailed requirements and specifications</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Later Phases (Execution & Closure)</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Clarify requirements for developers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Test solutions against requirements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage scope changes and new requirements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ensure solution meets business objectives</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Project Challenges */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-900 mb-4">Common Project Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-900 mb-3">Why Projects Fail</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Unclear or changing requirements</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Poor communication between teams</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Scope creep (adding features mid-project)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Unrealistic timelines or budgets</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-900 mb-3">How BAs Help Prevent These</h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Write clear, detailed requirements upfront</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Facilitate communication between all parties</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage scope changes through proper processes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Help set realistic expectations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>Projects are structured ways to deliver business value.</strong> They follow predictable phases, 
              and BAs play a crucial role throughout the entire lifecycle.
            </p>
            <p>
              Understanding how projects work helps BAs know when to ask the right questions, 
              what deliverables to create, and how to ensure projects actually solve business problems.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand How Projects Run
        </button>
      </div>
    </div>
  );
};
