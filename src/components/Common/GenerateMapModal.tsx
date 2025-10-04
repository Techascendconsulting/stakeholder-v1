import React, { useState } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import AIService from '../../services/aiService';

interface GenerateMapModalProps {
  onClose: () => void;
  onGenerate: (mapData: any, clarificationNeeded?: boolean, error?: string) => void;
}

interface StructuredInput {
  processDescription: string;
  roles: string;
  decisions: string;
  outcome: string;
}

export default function GenerateMapModal({ onClose, onGenerate }: GenerateMapModalProps) {
  const [structuredInput, setStructuredInput] = useState<StructuredInput>({
    processDescription: '',
    roles: '',
    decisions: '',
    outcome: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState<'process' | 'roles' | 'decisions' | 'outcome'>('process');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!structuredInput.processDescription.trim() || structuredInput.processDescription.trim().length < 10) {
      setError('Please provide a detailed process description (at least 10 characters).');
      return;
    }

    if (!structuredInput.roles.trim()) {
      setError('Please specify the roles or departments involved in the process.');
      return;
    }

    if (!structuredInput.outcome.trim()) {
      setError('Please describe the desired outcome or end state.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Combine all fields into a structured prompt
      const structuredPrompt = `Create a detailed business process map with the following information:

OVERALL PROCESS DESCRIPTION:
${structuredInput.processDescription}

ROLES OR DEPARTMENTS INVOLVED:
${structuredInput.roles}

KEY DECISIONS OR CONDITIONS:
${structuredInput.decisions || 'No specific decisions mentioned'}

DESIRED OUTCOME OR END STATE:
${structuredInput.outcome}

Please create a comprehensive process map that includes all the steps, decision points, and flows between the mentioned roles/departments.`;

      const aiService = AIService.getInstance();
      
      // Extract roles if provided
      const forcedRoles = structuredInput.roles.trim() 
        ? structuredInput.roles.split(',').map(r => r.trim()).filter(r => r.length > 0)
        : undefined;
      
      const result = await aiService.generateProcessMap(structuredPrompt, forcedRoles);

      if (result.success && result.spec) {
        onGenerate(result.spec, result.clarificationNeeded, result.error);
        console.log('Process map generated successfully!', { clarificationNeeded: result.clarificationNeeded });
      } else {
        throw new Error(result.error || 'Failed to generate process map');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate process map. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateInput = (field: keyof StructuredInput, value: string) => {
    setStructuredInput(prev => ({ ...prev, [field]: value }));
  };

  const getCharacterCount = (text: string) => text.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generate Process Map with AI
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Provide detailed information for the best results
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instructional Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Get the Best Results
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Provide as much detail as possible for best results. The more specific you are about roles, decisions, and outcomes, the more accurate your process map will be.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'process', label: 'Process Overview', required: true },
                { key: 'roles', label: 'Roles & Departments', required: true },
                { key: 'decisions', label: 'Decisions & Conditions', required: false },
                { key: 'outcome', label: 'Desired Outcome', required: true }
              ].map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setCurrentSection(section.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSection === section.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {section.label}
                  {section.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Process Description */}
              <div className={currentSection === 'process' ? 'block' : 'hidden'}>
                <label htmlFor="processDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Process Description *
                </label>
                <textarea
                  id="processDescription"
                  value={structuredInput.processDescription}
                  onChange={(e) => updateInput('processDescription', e.target.value)}
                  placeholder="Describe the overall process from start to finish. Include the main steps, who performs them, and how they flow together..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={isGenerating}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getCharacterCount(structuredInput.processDescription)}/1000 characters
                  </span>
                  {structuredInput.processDescription.length < 10 && structuredInput.processDescription.length > 0 && (
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      Minimum 10 characters required
                    </span>
                  )}
                </div>
              </div>

              {/* Roles and Departments */}
              <div className={currentSection === 'roles' ? 'block' : 'hidden'}>
                <label htmlFor="roles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roles or Departments Involved *
                </label>
                <textarea
                  id="roles"
                  value={structuredInput.roles}
                  onChange={(e) => updateInput('roles', e.target.value)}
                  placeholder="List all the roles, departments, or people involved in this process. For example: Customer Service, Finance Department, Manager, IT Support..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={isGenerating}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getCharacterCount(structuredInput.roles)}/500 characters
                  </span>
                </div>
              </div>

              {/* Decisions and Conditions */}
              <div className={currentSection === 'decisions' ? 'block' : 'hidden'}>
                <label htmlFor="decisions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Decisions or Conditions (Optional)
                </label>
                <textarea
                  id="decisions"
                  value={structuredInput.decisions}
                  onChange={(e) => updateInput('decisions', e.target.value)}
                  placeholder="Describe any decision points, approval requirements, or conditions that affect the process flow. For example: 'If amount &gt; $1000, requires manager approval' or 'If customer is VIP, skip verification'..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={isGenerating}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getCharacterCount(structuredInput.decisions)}/500 characters
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Optional - helps create more accurate decision points
                  </span>
                </div>
              </div>

              {/* Desired Outcome */}
              <div className={currentSection === 'outcome' ? 'block' : 'hidden'}>
                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Desired Outcome or End State *
                </label>
                <textarea
                  id="outcome"
                  value={structuredInput.outcome}
                  onChange={(e) => updateInput('outcome', e.target.value)}
                  placeholder="Describe what should happen at the end of the process. What is the final result, deliverable, or state that indicates the process is complete?"
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={isGenerating}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getCharacterCount(structuredInput.outcome)}/500 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Example */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Example:</h3>
              <div className="text-green-700 dark:text-green-300 text-sm space-y-2">
                <p><strong>Process:</strong> "When a customer submits a refund request, the system validates the purchase and checks return policy."</p>
                <p><strong>Roles:</strong> "Customer Service Representative, Finance Team, Store Manager"</p>
                  <p><strong>Decisions:</strong> "If purchase &gt; 30 days old, requires manager approval. If item is damaged, different refund amount applies."</p>
                <p><strong>Outcome:</strong> "Customer receives refund confirmation email and money is credited to their original payment method."</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !structuredInput.processDescription.trim() || !structuredInput.roles.trim() || !structuredInput.outcome.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Map
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
