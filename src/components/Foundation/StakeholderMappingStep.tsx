import React from 'react';
import { Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';

interface StakeholderMappingStepProps {
  onComplete: () => void;
}

export const StakeholderMappingStep: React.FC<StakeholderMappingStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Stakeholder Mapping</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Learn to identify, analyze, and engage with the people who can make or break your project.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* What are Stakeholders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">What are Stakeholders?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Definition</h4>
              <p className="text-gray-700 mb-4">
                <strong>Stakeholders</strong> are any individuals, groups, or organizations that can 
                affect or be affected by your project. They have a "stake" in the outcome.
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  <strong>Think of it like a wedding:</strong> The bride and groom are the primary stakeholders, 
                  but family, friends, vendors, and even the venue all have a stake in the success.
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Why Stakeholder Mapping Matters</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Prevents surprises and resistance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ensures you have the right people involved</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Helps prioritize communication efforts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reduces project risks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Types of Stakeholders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Types of Stakeholders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-900 mb-3">Primary Stakeholders</h4>
              <p className="text-sm text-green-800 mb-3">
                Directly affected by the project outcome. They use the solution or are directly impacted.
              </p>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• End users</li>
                <li>• Customers</li>
                <li>• Project sponsor</li>
                <li>• Project team members</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900 mb-3">Secondary Stakeholders</h4>
              <p className="text-sm text-blue-800 mb-3">
                Indirectly affected by the project. They may influence or be influenced by the project.
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Management</li>
                <li>• Support teams</li>
                <li>• Regulatory bodies</li>
                <li>• Vendors/partners</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Power-Interest Grid */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Power-Interest Grid</h3>
          <p className="text-gray-700 mb-6">
            The Power-Interest Grid helps you prioritize stakeholders based on their level of influence 
            and interest in your project.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">High Power, High Interest</h4>
              <p className="text-sm text-red-800 mb-2">Manage Closely</p>
              <p className="text-xs text-red-700">Keep satisfied, engage frequently</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">High Power, Low Interest</h4>
              <p className="text-sm text-yellow-800 mb-2">Keep Satisfied</p>
              <p className="text-xs text-yellow-700">Monitor, don't over-communicate</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Low Power, High Interest</h4>
              <p className="text-sm text-green-800 mb-2">Keep Informed</p>
              <p className="text-xs text-green-700">Regular updates, listen to feedback</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Low Power, Low Interest</h4>
              <p className="text-sm text-gray-800 mb-2">Monitor</p>
              <p className="text-xs text-gray-700">Minimal effort, watch for changes</p>
            </div>
          </div>
        </div>

        {/* Stakeholder Analysis Process */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Stakeholder Analysis Process</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm font-medium text-teal-600">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Identify All Stakeholders</div>
                <div className="text-sm text-gray-600">Brainstorm everyone who might be affected by or influence your project</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm font-medium text-teal-600">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Analyze Each Stakeholder</div>
                <div className="text-sm text-gray-600">Assess their power, interest, influence, and impact on the project</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm font-medium text-teal-600">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Map to Power-Interest Grid</div>
                <div className="text-sm text-gray-600">Position each stakeholder based on their power and interest levels</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-sm font-medium text-teal-600">4</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Develop Engagement Strategy</div>
                <div className="text-sm text-gray-600">Create specific communication and engagement plans for each stakeholder group</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-World Example</h3>
          <div className="space-y-4 text-gray-700">
            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <h4 className="font-medium text-gray-900 mb-2">The Situation:</h4>
              <p className="text-sm">
                A hospital was implementing a new patient management system. The IT team focused only on 
                technical requirements and didn't properly map stakeholders.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <h4 className="font-medium text-gray-900 mb-2">What Went Wrong:</h4>
              <ul className="text-sm space-y-1">
                <li>• Nurses weren't consulted, leading to workflow issues</li>
                <li>• Doctors felt the system was imposed on them</li>
                <li>• Patient data privacy concerns weren't addressed</li>
                <li>• The system was rejected by end users</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <h4 className="font-medium text-gray-900 mb-2">How Stakeholder Mapping Would Have Helped:</h4>
              <ul className="text-sm space-y-1">
                <li>• Nurses (High Interest, Medium Power) - Involve in design</li>
                <li>• Doctors (High Power, High Interest) - Get buy-in early</li>
                <li>• Privacy Officer (High Power, Low Interest) - Keep satisfied</li>
                <li>• Patients (High Interest, Low Power) - Keep informed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>Stakeholder mapping is not a one-time activity.</strong> It's an ongoing process 
              that should be updated as your project evolves and new stakeholders emerge.
            </p>
            <p className="mb-3">
              The goal is to ensure you're engaging with the right people, in the right way, 
              at the right time to maximize your project's chances of success.
            </p>
            <p>
              As a BA, you're often the bridge between different stakeholder groups, making this 
              skill essential for project success.
            </p>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand Stakeholder Mapping
        </button>
      </div>
    </div>
  );
};
