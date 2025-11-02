import { useState, useEffect } from 'react';

interface AdvancedTrainingIntroProps {
  onStartPractice: () => void;
}

export default function AdvancedTrainingIntro({ onStartPractice }: AdvancedTrainingIntroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Skip Button - Top Right */}
        <div className="flex justify-end mb-6">
          <button
            onClick={onStartPractice}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Skip to Advanced Practice
          </button>
        </div>

        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
            <h1 className="relative text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Advanced Form Training
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Master the art of documenting complex forms, field validations, and system integrations 
            with professional-grade acceptance criteria
          </p>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to the Advanced Practice section. Before you begin writing user stories and acceptance criteria at this level, 
                it's important to understand critical concepts about forms, validations, and system integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-purple-200/30 dark:border-purple-800/30 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Why This Matters
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                In simple projects, it's enough to say:
              </p>
              
              <div className="relative group/card">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-2xl blur-sm group-hover/card:blur-md transition-all duration-300"></div>
                <div className="relative bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                  <p className="italic text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    "As a tenant, I want to request a repair so that the housing team can fix it."
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                But in real projects, this is not enough. You'll be expected to say:
              </p>
              
              <div className="relative group/card">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-sm group-hover/card:blur-md transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    "The request form should include the following fields: Property Address (text), Issue Category (dropdown), 
                    Description of the Problem (textarea), Upload Photo (file upload), and Preferred Contact Method (radio button). 
                    All fields except Upload are required."
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                This means you must know how to describe each field, what it accepts, and how the system should behave.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Field Types Table - COMPACT VERSION */}
      <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-purple-200/30 dark:border-purple-800/30 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Common Field Types and How to Describe Them
              </h2>
            </div>
            
            {/* Compact Table Format */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-purple-200 dark:border-purple-700">
                    <th className="text-left py-3 px-4 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">Field Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">Example Label</th>
                    <th className="text-left py-3 px-4 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">User Experience</th>
                    <th className="text-left py-3 px-4 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">How to Describe It</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-800">
                  {[
                    { type: 'text', label: 'Full Name', experience: 'User types short text', description: 'Text input labeled Full Name, max 100 characters.' },
                    { type: 'numeric', label: 'Age', experience: 'Only numbers allowed', description: 'Accept numbers only; block letters/symbols.' },
                    { type: 'textarea', label: 'Description of Issue', experience: 'User can type long text', description: 'Multi-line input, max 500 characters.' },
                    { type: 'email', label: 'Email Address', experience: 'Validates email format', description: 'Must accept valid email format (name@example.com).' },
                    { type: 'dropdown', label: 'Select Department', experience: 'Choose one from a list', description: 'Dropdown with options: Sales, HR, Finance.' },
                    { type: 'radio', label: 'Do you agree? Yes/No', experience: 'Pick one option', description: 'Radio buttons for Yes and No; default unselected.' },
                    { type: 'checkbox', label: 'Agree to Terms', experience: 'Tick to confirm', description: 'User must tick checkbox to proceed.' },
                    { type: 'date', label: 'Date of Birth', experience: 'Opens calendar picker', description: 'Date must be in DD/MM/YYYY format.' },
                    { type: 'file upload', label: 'Attach Photo', experience: 'Upload JPG or PDF', description: 'Accept JPG or PDF only; max 5MB.' },
                    { type: 'password', label: 'Set Password', experience: 'Hidden input', description: 'Minimum 8 characters, include 1 symbol and 1 number.' }
                  ].map((field, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors duration-200"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-block bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm font-medium">
                          {field.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {field.label}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {field.experience}
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {field.description}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Form Recognition */}
      <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-purple-200/30 dark:border-purple-800/30 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                How to Recognise That a Form is Required
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                You'll often hear stakeholders say things like:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-sm group-hover/card:blur-md transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm p-4 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/50">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>"They should be able to apply online."</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>"We want users to submit their request."</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>"Let them book the appointment directly."</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>"They should upload the document."</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-sm group-hover/card:blur-md transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg">When you hear them, think:</p>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>What fields are needed?</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>What rules or limits apply to each field?</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Is this information stored or sent to another system?</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🤖 When Integration is Needed
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            If your form needs to do any of the following:
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Send confirmation emails</li>
              <li>• Generate a PDF</li>
              <li>• Store or sync data with another system</li>
              <li>• Match the user input to existing records</li>
            </ul>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Then you're dealing with system integration or data mapping. This means you should:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Specify what system it talks to (e.g., NHS booking tool, Housing CRM)</li>
              <li>• Describe what happens to the data</li>
              <li>• Identify fields that are linked to backend logic</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Mapping Example */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          📆 Example Table: Data Mapping
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">📂 Form Field</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">→ 📚 Target System Field</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">⚖️ Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Full Name</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">applicant_name</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Stored in CRM profile</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">NHS Number</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">nhs_reference</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Used to validate booking eligibility</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Appointment Type</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">booking_type</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Mapped to external NHS booking categories</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Upload ID Proof</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">id_upload</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Stored in secure file storage (e.g. Azure)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">Preferred Date</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">booking_preference_date</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Logged for scheduling team</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* What You'll Do */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🔹 What You'll Do in Advanced Practice
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            When writing user stories and ACs in this section:
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Spot the form based on the stakeholder scenario</li>
              <li>• List each field they'll fill out (with label + type)</li>
              <li>• Add clear validation rules</li>
              <li>• Include trigger logic (e.g., when submitted, send confirmation email)</li>
              <li>• Mention if any data is stored, sent, or checked against another system</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🎓 Summary
        </h2>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This is where your skill as a Business Analyst really shines.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Anyone can write a user story. But a great BA sees beneath the surface:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">• What the user actually interacts with</p>
              <p className="text-gray-700 dark:text-gray-300">• What fields matter</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">• What systems are involved</p>
              <p className="text-gray-700 dark:text-gray-300">• What makes it usable, testable, and safe</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            You are now ready to start Advanced Practice.
          </p>
        </div>
      </div>

      {/* Start Practice Button */}
      <div className="text-center">
        <button
          onClick={onStartPractice}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Start Advanced Practice
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Turn on the toggle when you're ready, and get to work — the system will coach you step by step.
        </p>
      </div>
    </div>
  );
}
