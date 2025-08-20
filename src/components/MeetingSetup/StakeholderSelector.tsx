import React from 'react';
import DebugConsole from '../Debug/DebugConsole';
import { Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface StakeholderSelectorProps {
  data: {
    selectedStakeholders: string[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const StakeholderSelector: React.FC<StakeholderSelectorProps> = ({ data, onUpdate, onNext }) => {
  const { stakeholders: allStakeholders, selectedProject } = useApp();

  // Build available stakeholders from the app's data model based on the selected project's mapping
  const availableStakeholders = React.useMemo(() => {
    if (!selectedProject) return allStakeholders;
    const ids = selectedProject.relevantStakeholders || [];
    const map = new Map(allStakeholders.map(s => [s.id, s] as const));
    return ids.map(id => map.get(id)).filter(Boolean) as typeof allStakeholders;
  }, [allStakeholders, selectedProject]);
  const toggleStakeholder = (stakeholderId: string) => {
    const current = data.selectedStakeholders || [];
    const updated = current.includes(stakeholderId)
      ? current.filter(id => id !== stakeholderId)
      : [...current, stakeholderId];
    onUpdate({ selectedStakeholders: updated });
  };

  const handleContinue = () => {
    if (data.selectedStakeholders?.length > 0) {
      onNext();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section header to match design */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select Stakeholders</h2>
        <p className="text-gray-600">
          Choose one or multiple stakeholders for your <span className="font-medium">{selectedProject?.name}</span> project
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 dark:text-blue-300">👥</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Key Stakeholders for {selectedProject?.name}
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              These stakeholders have been selected based on their expertise and relevance to this project type.
            </p>
          </div>
        </div>
      </div>

      {/* Top-right CTA reflecting selection count */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleContinue}
          disabled={!data.selectedStakeholders?.length}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold shadow transition-colors ${
            data.selectedStakeholders?.length
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {data.selectedStakeholders?.length > 1
            ? 'Start Group Meeting'
            : data.selectedStakeholders?.length === 1
            ? 'Start Interview'
            : 'Start'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableStakeholders.map((stakeholder) => (
          <div
            key={stakeholder.id}
            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all shadow-sm ${
              data.selectedStakeholders?.includes(stakeholder.id)
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-gray-800 ring-2 ring-indigo-500'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md'
            }`}
            onClick={() => toggleStakeholder(stakeholder.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <img
                  src={stakeholder.photo || `/stakeholders/${stakeholder.id}.jpg`}
                  alt={stakeholder.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {data.selectedStakeholders?.includes(stakeholder.id) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stakeholder.name}
                </h3>
                <div className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {stakeholder.role}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {stakeholder.department}
                </div>
                {stakeholder.bio && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {stakeholder.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeholderSelector;
