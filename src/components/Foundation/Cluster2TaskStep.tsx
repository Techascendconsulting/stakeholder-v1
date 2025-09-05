import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Cluster2TaskStepProps {
  onComplete: (data: any) => void;
}

interface Requirement {
  id: string;
  text: string;
  category: 'business' | 'functional' | 'non-functional';
}

const requirements: Requirement[] = [
  { id: '1', text: 'Reduce customer service response time by 50%', category: 'business' },
  { id: '2', text: 'System must handle 1000 concurrent users', category: 'non-functional' },
  { id: '3', text: 'Users can reset their password via email', category: 'functional' },
  { id: '4', text: 'Increase monthly revenue by 25%', category: 'business' },
  { id: '5', text: 'Page load time must be under 2 seconds', category: 'non-functional' },
  { id: '6', text: 'Users can upload profile pictures', category: 'functional' },
  { id: '7', text: 'System must be accessible to users with disabilities', category: 'non-functional' },
  { id: '8', text: 'Improve customer satisfaction scores', category: 'business' },
];

export const Cluster2TaskStep: React.FC<Cluster2TaskStepProps> = ({ onComplete }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [categories, setCategories] = useState<{
    business: string[];
    functional: string[];
    'non-functional': string[];
  }>({
    business: [],
    functional: [],
    'non-functional': [],
  });
  const [taskCompleted, setTaskCompleted] = useState(false);

  const handleDragStart = (e: React.DragEvent, requirementId: string) => {
    setDraggedItem(requirementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, category: keyof typeof categories) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from all categories first
    const newCategories = {
      business: categories.business.filter(id => id !== draggedItem),
      functional: categories.functional.filter(id => id !== draggedItem),
      'non-functional': categories['non-functional'].filter(id => id !== draggedItem),
    };

    // Add to the new category
    newCategories[category] = [...newCategories[category], draggedItem];
    setCategories(newCategories);
    setDraggedItem(null);
  };

  const getRequirementById = (id: string) => requirements.find(r => r.id === id);

  const checkAnswers = () => {
    let correct = 0;
    let total = requirements.length;

    requirements.forEach(req => {
      const isInCorrectCategory = categories[req.category].includes(req.id);
      if (isInCorrectCategory) correct++;
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const handleComplete = () => {
    const results = checkAnswers();
    setTaskCompleted(true);
    onComplete({
      completed: true,
      score: results.percentage,
      correct: results.correct,
      total: results.total,
    });
  };

  const resetTask = () => {
    setCategories({
      business: [],
      functional: [],
      'non-functional': [],
    });
    setTaskCompleted(false);
  };

  if (taskCompleted) {
    const results = checkAnswers();
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Task Complete!</h2>
          <div className="text-6xl font-bold text-green-600 mb-2">{results.percentage}%</div>
          <p className="text-lg text-gray-600">
            You correctly categorized {results.correct} out of {results.total} requirements.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Results</h3>
          <div className="space-y-4">
            {requirements.map((req) => {
              const isCorrect = categories[req.category].includes(req.id);
              return (
                <div key={req.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{req.text}</p>
                      <p className="text-sm text-gray-600">
                        Correct category: <span className="text-green-700 font-medium capitalize">{req.category.replace('-', ' ')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={resetTask}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors mr-4"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Try Again
          </button>
          <button
            onClick={handleComplete}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Cluster 3
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Requirements Categorization Task</h2>
        <p className="text-lg text-gray-600">
          Drag each requirement to the correct category. This tests your understanding of different requirement types.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Business Requirements</h4>
            <p>High-level business goals and objectives</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Functional Requirements</h4>
            <p>Specific features and functions the system must perform</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Non-Functional Requirements</h4>
            <p>Quality attributes like performance, security, usability</p>
          </div>
        </div>
      </div>

      {/* Requirements to Drag */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements to Categorize</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requirements.map((req) => {
            const isPlaced = Object.values(categories).some(cat => cat.includes(req.id));
            return (
              <div
                key={req.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, req.id)}
                className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-all ${
                  isPlaced 
                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <p className="text-sm">{req.text}</p>
                {isPlaced && <p className="text-xs text-gray-400 mt-1">✓ Placed</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'business')}
          className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-6 min-h-[200px]"
        >
          <h3 className="text-lg font-semibold text-green-900 mb-4">Business Requirements</h3>
          <div className="space-y-2">
            {categories.business.map((reqId) => {
              const req = getRequirementById(reqId);
              return req ? (
                <div key={reqId} className="p-2 bg-white rounded border text-sm">
                  {req.text}
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'functional')}
          className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 min-h-[200px]"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Functional Requirements</h3>
          <div className="space-y-2">
            {categories.functional.map((reqId) => {
              const req = getRequirementById(reqId);
              return req ? (
                <div key={reqId} className="p-2 bg-white rounded border text-sm">
                  {req.text}
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'non-functional')}
          className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg p-6 min-h-[200px]"
        >
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Non-Functional Requirements</h3>
          <div className="space-y-2">
            {categories['non-functional'].map((reqId) => {
              const req = getRequirementById(reqId);
              return req ? (
                <div key={reqId} className="p-2 bg-white rounded border text-sm">
                  {req.text}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="text-center">
        <button
          onClick={handleComplete}
          disabled={Object.values(categories).every(cat => cat.length === 0)}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            Object.values(categories).every(cat => cat.length === 0)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }`}
        >
          Check My Answers
        </button>
      </div>
    </div>
  );
};
