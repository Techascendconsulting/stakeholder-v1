import React from 'react';
import { Target, Search, LineChart, Lightbulb, CheckSquare } from 'lucide-react';

interface StageSelectorProps {
  data: {
    selectedStage: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({ data, onUpdate, onNext }) => {
  const stages = [
    {
      id: 'kickoff',
      number: 1,
      title: 'Kickoff',
      description: 'Establish rapport, set expectations, and understand the project context',
      subtext: 'Start here to practice introductions and setting the meeting foundation',
      icon: Target
    },
    {
      id: 'discovery',
      number: 2,
      title: 'Discovery',
      description: 'Gather detailed requirements and understand current state processes',
      subtext: 'Practice asking probing questions and uncovering hidden requirements',
      icon: Search
    },
    {
      id: 'analysis',
      number: 3,
      title: 'Analysis',
      description: 'Analyze gathered information and identify gaps or opportunities',
      subtext: 'Work through complex problem analysis with stakeholders',
      icon: LineChart
    },
    {
      id: 'solution',
      number: 4,
      title: 'Solution Design',
      description: 'Collaborate on potential solutions and validate approaches',
      subtext: 'Practice facilitating solution discussions and getting buy-in',
      icon: Lightbulb
    },
    {
      id: 'closure',
      number: 5,
      title: 'Closure',
      description: 'Summarize findings, confirm next steps, and close the session',
      subtext: 'Practice wrapping up meetings effectively with clear outcomes',
      icon: CheckSquare
    }
  ];

  const handleSelect = (stageId: string) => {
    onUpdate({ selectedStage: stageId });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Select Meeting Stage
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Choose which stage of the stakeholder interview you want to practice
      </p>

      <div className="space-y-4">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => handleSelect(stage.id)}
            className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
              data.selectedStage === stage.id
                ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-gray-800 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                <span className="text-gray-900 dark:text-white font-medium">
                  {stage.number}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <stage.icon className={`w-5 h-5 mr-2 ${
                    data.selectedStage === stage.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stage.title}
                  </h3>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {stage.description}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {stage.subtext}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StageSelector;
