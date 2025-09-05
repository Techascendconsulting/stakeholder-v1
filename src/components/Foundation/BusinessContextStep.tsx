import React from 'react';
import { Building2, Users, Target, TrendingUp, CheckCircle } from 'lucide-react';

interface BusinessContextStepProps {
  onComplete: () => void;
}

export const BusinessContextStep: React.FC<BusinessContextStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Understanding Business Context</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Before diving into Business Analysis, let's understand how businesses actually work and why they need BAs.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Business Fundamentals */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              What is a Business?
            </h3>
            <div className="space-y-4 text-gray-700">
              <p>
                A business is an organization that creates value by solving problems for customers. 
                Every business has:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Customers</strong> - People who need the problem solved</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Products/Services</strong> - Solutions that address customer needs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Processes</strong> - How work gets done to deliver value</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Technology</strong> - Tools and systems that enable operations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              Business Departments
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>Most businesses are organized into departments, each with specific responsibilities:</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-900">Sales & Marketing</div>
                  <div className="text-sm text-blue-700">Find and attract customers</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-900">Operations</div>
                  <div className="text-sm text-green-700">Deliver products and services</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-medium text-purple-900">Finance</div>
                  <div className="text-sm text-purple-700">Manage money and resources</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="font-medium text-orange-900">IT/Technology</div>
                  <div className="text-sm text-orange-700">Build and maintain systems</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="font-medium text-red-900">HR</div>
                  <div className="text-sm text-red-700">Manage people and culture</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Business Challenges */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Why Businesses Need Change
            </h3>
            <div className="space-y-4 text-gray-700">
              <p>Businesses constantly face challenges that require change:</p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Market Changes</div>
                    <div className="text-sm text-gray-600">New competitors, changing customer needs</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Technology Evolution</div>
                    <div className="text-sm text-gray-600">New tools, automation opportunities</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Regulatory Requirements</div>
                    <div className="text-sm text-gray-600">New laws, compliance needs</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Growth Opportunities</div>
                    <div className="text-sm text-gray-600">Expanding to new markets, products</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
            <div className="text-gray-700">
              <p className="mb-3">
                <strong>Businesses are complex systems</strong> where different departments work together 
                to create value for customers. When change is needed, it affects multiple parts of the business.
              </p>
              <p>
                This is where Business Analysts come in - to help businesses understand what needs to change, 
                how to change it, and ensure the change actually solves the problem.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand Business Context
        </button>
      </div>
    </div>
  );
};
