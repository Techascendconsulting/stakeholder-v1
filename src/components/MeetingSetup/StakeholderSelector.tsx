import React from 'react';
import { Check } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  image: string;
}

interface StakeholderSelectorProps {
  data: {
    selectedStakeholders: string[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const StakeholderSelector: React.FC<StakeholderSelectorProps> = ({ data, onUpdate, onNext }) => {
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 dark:text-blue-300">👥</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Key Stakeholders for Digital Expense Management System Implementation
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              These stakeholders have been selected based on their expertise and relevance to this project type.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {stakeholders.map((stakeholder) => (
          <div
            key={stakeholder.id}
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
              data.selectedStakeholders?.includes(stakeholder.id)
                ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-gray-800'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800'
            }`}
            onClick={() => toggleStakeholder(stakeholder.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <img
                  src={stakeholder.image}
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
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {stakeholder.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleContinue}
          disabled={!data.selectedStakeholders?.length}
          className={`w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
            data.selectedStakeholders?.length
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Continue with {data.selectedStakeholders?.length || 0} stakeholder
          {(data.selectedStakeholders?.length || 0) !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

const stakeholders = [
  {
    id: 'james_walker',
    name: 'James Walker',
    role: 'Head of Operations',
    department: 'Operations',
    description: 'James leads operational excellence initiatives across the organization with 15 years of experience in process optimization and operational strategy.',
    image: '/stakeholders/james.jpg'
  },
  {
    id: 'jess_morgan',
    name: 'Jess Morgan',
    role: 'Customer Service Manager',
    department: 'Customer Service',
    description: 'Manages customer service operations with 10 years of experience in customer experience management and service delivery optimization.',
    image: '/stakeholders/jess.jpg'
  },
  {
    id: 'david_thompson',
    name: 'David Thompson',
    role: 'IT Systems Lead',
    department: 'Information Technology',
    description: 'David leads IT systems architecture and implementation with 12 years of experience in enterprise technology solutions.',
    image: '/stakeholders/david.jpg'
  },
  {
    id: 'sarah_patel',
    name: 'Sarah Patel',
    role: 'HR Business Partner',
    department: 'Human Resources',
    description: 'HR Business Partner specializing in change management and employee training needs with 8 years of experience in organizational development.',
    image: '/stakeholders/sarah.jpg'
  }
];

export default StakeholderSelector;
