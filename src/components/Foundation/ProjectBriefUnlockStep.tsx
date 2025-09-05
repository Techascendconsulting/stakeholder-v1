import React from 'react';
import { CheckCircle, ArrowRight, Trophy, Star, Users, Target } from 'lucide-react';

interface ProjectBriefUnlockStepProps {
  onComplete: () => void;
}

export const ProjectBriefUnlockStep: React.FC<ProjectBriefUnlockStepProps> = ({ onComplete }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">🎉 Foundation Complete!</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Congratulations! You've mastered the fundamentals of Business Analysis. 
          You're now ready to dive into real-world projects.
        </p>
      </div>

      {/* Achievement Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">What You've Accomplished</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Business Context</h4>
            <p className="text-sm text-gray-600">
              You understand how businesses work, why BAs exist, and how projects run in the real world.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Requirements Engineering</h4>
            <p className="text-sm text-gray-600">
              You know how to gather, document, and manage requirements effectively.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Methodology Mastery</h4>
            <p className="text-sm text-gray-600">
              You understand Agile vs Waterfall and when to use each approach.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">MVP Concepts</h4>
            <p className="text-sm text-gray-600">
              You can help teams build the right thing by starting with minimum viable products.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Stakeholder Mapping</h4>
            <p className="text-sm text-gray-600">
              You can identify, analyze, and engage with the right people for project success.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-pink-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Unwritten Expectations</h4>
            <p className="text-sm text-gray-600">
              You can discover hidden assumptions and unspoken requirements that make or break projects.
            </p>
          </div>
        </div>
      </div>

      {/* Skills Gained */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Skills You've Developed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Core BA Skills</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Requirements gathering and documentation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Stakeholder analysis and engagement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Business process understanding</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Project methodology selection</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Advanced Techniques</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Power-Interest Grid analysis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Unwritten expectations discovery</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>MVP definition and validation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Requirements categorization</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">What's Next?</h3>
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">🚀 Project Brief Unlocked!</h4>
            <p className="text-gray-700 mb-4">
              You now have access to the <strong>Project Brief</strong> module, where you'll work on real-world 
              business analysis scenarios. This is where you'll apply everything you've learned in the Foundation.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>In the Project Brief, you'll:</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Work with realistic business scenarios</li>
                <li>• Practice stakeholder interviews and requirements gathering</li>
                <li>• Create actual project deliverables</li>
                <li>• Get feedback on your BA work</li>
                <li>• Build a portfolio of real project experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-8 text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">🎊 Congratulations!</h3>
        <p className="text-lg text-gray-700 mb-6">
          You've completed the Foundation journey and are now ready to tackle real-world business analysis challenges. 
          Your understanding of business fundamentals, requirements engineering, and stakeholder management will serve you well.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>Foundation Complete</span>
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-2" />
            <span>Ready for Projects</span>
          </div>
        </div>
      </div>

      {/* Unlock Button */}
      <div className="text-center pt-6">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Trophy className="w-6 h-6 inline mr-3" />
          Unlock Project Brief
          <ArrowRight className="w-6 h-6 inline ml-3" />
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Click to start working on real-world business analysis projects
        </p>
      </div>
    </div>
  );
};
