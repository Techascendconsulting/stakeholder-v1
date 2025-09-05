import React, { useState } from 'react';
import { CheckCircle, Lightbulb, Users, Target } from 'lucide-react';

interface Cluster3ReflectionStepProps {
  onComplete: (data: any) => void;
}

export const Cluster3ReflectionStep: React.FC<Cluster3ReflectionStepProps> = ({ onComplete }) => {
  const [reflections, setReflections] = useState({
    stakeholderMapping: '',
    unwrittenExpectations: '',
    keyInsight: '',
    application: '',
  });

  const handleInputChange = (field: keyof typeof reflections, value: string) => {
    setReflections(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleComplete = () => {
    onComplete({
      completed: true,
      reflections,
      timestamp: new Date().toISOString(),
    });
  };

  const isComplete = Object.values(reflections).every(reflection => reflection.trim().length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Cluster 3 Reflection</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Take a moment to reflect on what you've learned about stakeholder mapping and unwritten expectations. 
          This reflection will help solidify your understanding.
        </p>
      </div>

      {/* Reflection Questions */}
      <div className="space-y-8">
        {/* Stakeholder Mapping Reflection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Stakeholder Mapping Reflection</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              Think about a project you've been involved in (or imagine one). Who were the key stakeholders? 
              How would you have mapped them using the Power-Interest Grid?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe how stakeholder mapping could have improved that project:
              </label>
              <textarea
                value={reflections.stakeholderMapping}
                onChange={(e) => handleInputChange('stakeholderMapping', e.target.value)}
                placeholder="Consider: Who was missing? Who should have been engaged differently? What communication gaps existed?"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Unwritten Expectations Reflection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Unwritten Expectations Reflection</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              Think about a time when you or someone you know was disappointed with a product or service, 
              even though it seemed to work as described. What unwritten expectations were violated?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe the unwritten expectations that weren't met:
              </label>
              <textarea
                value={reflections.unwrittenExpectations}
                onChange={(e) => handleInputChange('unwrittenExpectations', e.target.value)}
                placeholder="Consider: What did you expect that wasn't explicitly promised? How did this affect your experience?"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Key Insight</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              What's the most important insight you've gained from learning about stakeholder mapping and unwritten expectations? 
              How does this change how you'll approach future projects?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your key insight:
              </label>
              <textarea
                value={reflections.keyInsight}
                onChange={(e) => handleInputChange('keyInsight', e.target.value)}
                placeholder="What's the one thing you'll remember and apply from this cluster?"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Application */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Application</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              How will you apply what you've learned about stakeholder mapping and unwritten expectations 
              in your role as a Business Analyst? What specific techniques will you use?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your action plan:
              </label>
              <textarea
                value={reflections.application}
                onChange={(e) => handleInputChange('application', e.target.value)}
                placeholder="Consider: What questions will you ask? What tools will you use? How will you ensure you don't miss unwritten expectations?"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Reflection Tips */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reflection Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Stakeholder Mapping:</h4>
              <ul className="space-y-1">
                <li>• Think about who has power vs. who has interest</li>
                <li>• Consider who might be missing from your analysis</li>
                <li>• Reflect on how different engagement strategies might work</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Unwritten Expectations:</h4>
              <ul className="space-y-1">
                <li>• Consider what "obvious" things might not be obvious</li>
                <li>• Think about past disappointments and what was missing</li>
                <li>• Reflect on how to discover these hidden requirements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reflection Progress</h3>
          <div className="space-y-3">
            {Object.entries(reflections).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${value.trim().length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {value.trim().length > 0 && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="text-center pt-6">
        <button
          onClick={handleComplete}
          disabled={!isComplete}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            isComplete
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Complete Reflection
        </button>
        {!isComplete && (
          <p className="text-sm text-gray-500 mt-2">
            Please complete all reflection questions to continue
          </p>
        )}
      </div>
    </div>
  );
};
