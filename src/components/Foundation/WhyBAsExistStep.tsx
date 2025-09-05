import React from 'react';
import { UserCheck, MessageSquare, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';

interface WhyBAsExistStepProps {
  onComplete: () => void;
}

export const WhyBAsExistStep: React.FC<WhyBAsExistStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Business Analysts Exist</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Understanding the critical role BAs play in bridging the gap between business needs and technical solutions.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* The Problem Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-900 mb-4">The Problem: Communication Gap</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-gray-900 mb-2">Business People Say:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>"We need a system that's easy to use"</p>
                <p>"It should be fast and reliable"</p>
                <p>"Our customers will love it"</p>
                <p>"Make it work like our current process"</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-gray-900 mb-2">Technical People Hear:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>"Build something... user-friendly?"</p>
                <p>"Performance requirements... unclear"</p>
                <p>"Customer satisfaction... how to measure?"</p>
                <p>"Replicate existing system... which parts?"</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-red-700 font-medium">
              <ArrowRight className="w-4 h-4 mr-2" />
              Result: Misunderstood requirements, failed projects, wasted money
            </div>
          </div>
        </div>

        {/* The Solution Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-900 mb-4">The Solution: Business Analysts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Bridge Communication</h4>
              <p className="text-sm text-gray-700">
                Translate business language into technical requirements and vice versa.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Solve Problems</h4>
              <p className="text-sm text-gray-700">
                Identify root causes and design solutions that actually work.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Ensure Success</h4>
              <p className="text-sm text-gray-700">
                Make sure projects deliver real business value.
              </p>
            </div>
          </div>
        </div>

        {/* What BAs Actually Do */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">What Business Analysts Actually Do</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Discovery & Analysis</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Interview stakeholders to understand their needs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Analyze current business processes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Identify problems and root causes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Research industry best practices</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Solution Design & Delivery</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Write clear, detailed requirements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Design new processes and workflows</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Work with developers to build solutions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Test and validate that solutions work</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-World Example</h3>
          <div className="space-y-4 text-gray-700">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">The Situation:</h4>
              <p className="text-sm">
                A retail company's customer service team was overwhelmed with complaints about slow order processing. 
                The IT team wanted to build a new system, but didn't understand what was actually causing the delays.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">What the BA Did:</h4>
              <ul className="text-sm space-y-1">
                <li>• Interviewed customer service reps to understand the real problems</li>
                <li>• Mapped out the current order processing workflow</li>
                <li>• Identified that the bottleneck was manual data entry, not the system</li>
                <li>• Designed a solution that automated data entry instead of replacing the whole system</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">The Result:</h4>
              <p className="text-sm">
                The company saved $500K by fixing the real problem instead of building an unnecessary new system. 
                Customer complaints dropped by 80% and processing time improved by 60%.
              </p>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaway</h3>
          <div className="text-gray-700">
            <p className="mb-3">
              <strong>Business Analysts exist because businesses need someone who can:</strong>
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Understand both business and technology</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Ask the right questions to find the real problems</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Design solutions that actually solve business problems</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Ensure projects deliver real value, not just technology</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          I Understand Why BAs Exist
        </button>
      </div>
    </div>
  );
};
