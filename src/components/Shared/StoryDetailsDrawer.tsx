import React from 'react';

export interface StoryDetails {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  type: 'Story' | 'Task' | 'Bug' | 'Spike';
  priority: 'Low' | 'Medium' | 'High';
  storyPoints?: number;
  status: string;
}

interface StoryDetailsDrawerProps {
  story: StoryDetails;
  isOpen: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onChange?: (next: StoryDetails) => void;
  onSave?: () => void;
}

const StoryDetailsDrawer: React.FC<StoryDetailsDrawerProps> = ({
  story,
  isOpen,
  readOnly = false,
  onClose,
  onChange,
  onSave
}) => {
  if (!isOpen) return null;

  const setField = <K extends keyof StoryDetails>(key: K, value: StoryDetails[K]) => {
    if (!onChange) return;
    onChange({ ...story, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-[720px] max-w-full h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-600 font-medium">{story.ticketNumber}</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-0.5">{readOnly ? 'Story Details' : 'Edit Story'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <button onClick={onSave} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">Save</button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">Close</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Main */}
          <div className="col-span-2 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
              <input
                value={story.title}
                onChange={(e) => setField('title', e.target.value)}
                readOnly={readOnly}
                className={`w-full px-3 py-2 rounded-lg border ${readOnly ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <textarea
                value={story.description}
                onChange={(e) => setField('description', e.target.value)}
                readOnly={readOnly}
                rows={5}
                className={`w-full px-3 py-2 rounded-lg border ${readOnly ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Acceptance Criteria</label>
              <textarea
                value={story.acceptanceCriteria || ''}
                onChange={(e) => setField('acceptanceCriteria', e.target.value)}
                readOnly={readOnly}
                rows={6}
                className={`w-full px-3 py-2 rounded-lg border ${readOnly ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                placeholder="List your criteria"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select
                value={story.type}
                onChange={(e) => setField('type', e.target.value as StoryDetails['type'])}
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="Story">Story</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Spike">Spike</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
              <select
                value={story.priority}
                onChange={(e) => setField('priority', e.target.value as StoryDetails['priority'])}
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Story Points</label>
              <input
                type="number"
                value={story.storyPoints || ''}
                onChange={(e) => setField('storyPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                readOnly={readOnly}
                className={`w-full px-3 py-2 rounded-lg border ${readOnly ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={story.status}
                onChange={(e) => setField('status', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="Draft">Draft</option>
                <option value="Ready for Refinement">Ready for Refinement</option>
                <option value="Refined">Refined</option>
                <option value="In Sprint">In Sprint</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Test">In Test</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailsDrawer;























