import React from 'react';

export default function AdvancedExplainerPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Advanced User Story Coaching
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Learn to handle complex user stories involving forms, integrations, and system interactions
        </p>
      </div>

      {/* What Makes a Story Advanced */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          🎯 What Makes a User Story "Advanced"?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Form-Based Workflows</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Multi-step form submissions</li>
              <li>• Field validation and business rules</li>
              <li>• File uploads with restrictions</li>
              <li>• Conditional logic based on user input</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">System Integrations</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• API calls to external services</li>
              <li>• Database synchronization</li>
              <li>• Email notifications</li>
              <li>• Payment processing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Advanced AC Structure */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          📋 Advanced Acceptance Criteria Structure
        </h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Data Mapping & Validation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              When forms involve multiple fields, specify how data flows between systems:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
              <p className="font-mono text-gray-800 dark:text-gray-200">
                "When the user submits the form, the system maps:<br/>
                • Full Name → Customer.firstName + Customer.lastName<br/>
                • NHS Number → Patient.uniqueIdentifier<br/>
                • Email → Notification.recipient"
              </p>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Business Rule Validation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Complex rules that determine eligibility or behavior:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
              <p className="font-mono text-gray-800 dark:text-gray-200">
                "The system validates eligibility by checking:<br/>
                • Age ≥ 65 OR clinical vulnerability flag = true<br/>
                • No existing appointment within 30 days<br/>
                • NHS number exists in patient database"
              </p>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Integration Points</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              External system interactions and data synchronization:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
              <p className="font-mono text-gray-800 dark:text-gray-200">
                "After successful booking:<br/>
                • Send confirmation email via NHS Mail API<br/>
                • Create appointment record in Practice Management System<br/>
                • Update patient record with appointment reference"
              </p>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Error Handling & Edge Cases</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Comprehensive failure scenarios and recovery:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
              <p className="font-mono text-gray-800 dark:text-gray-200">
                "If validation fails:<br/>
                • Display specific error message per field<br/>
                • Preserve user input for correction<br/>
                • Log validation failure for system monitoring<br/>
                • Offer alternative booking methods if API unavailable"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Advanced User Story */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          📝 Example: Advanced User Story Breakdown
        </h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">User Story:</h3>
            <p className="text-blue-800 dark:text-blue-300">
              "As a patient, I want to book a flu jab online by entering my details and selecting a date, 
              so that I don't have to call the clinic."
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Advanced Acceptance Criteria:</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm space-y-2">
              <p><strong>Data Collection:</strong> The form captures: Full Name, NHS Number, Date of Birth, Email, Preferred Date</p>
              <p><strong>Validation Rules:</strong> NHS Number must be valid format, Date of Birth must be ≥ 65 years, Email must be valid</p>
              <p><strong>Eligibility Check:</strong> System calls NHS API to verify patient eligibility for flu jab</p>
              <p><strong>Appointment Creation:</strong> On successful validation, create appointment in Practice Management System</p>
              <p><strong>Confirmation:</strong> Send email confirmation with appointment details and reference number</p>
              <p><strong>Error Handling:</strong> If NHS API unavailable, show "Please call clinic" message with phone number</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for Advanced Stories */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          💡 Tips for Writing Advanced Acceptance Criteria
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">✅ Do:</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Map data flow between systems</li>
              <li>• Specify validation rules clearly</li>
              <li>• Include integration touchpoints</li>
              <li>• Plan for system failures</li>
              <li>• Consider performance requirements</li>
              <li>• Define audit trail requirements</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">❌ Avoid:</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Vague technical requirements</li>
              <li>• Assuming system availability</li>
              <li>• Ignoring data privacy rules</li>
              <li>• Forgetting user feedback loops</li>
              <li>• Overlooking edge cases</li>
              <li>• Mixing UI and business logic</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ready to Practice */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Ready to Practice Advanced Stories?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You'll now get enhanced coaching that helps you think through forms, integrations, 
          and complex business rules when writing acceptance criteria.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Start Advanced Practice
          </button>
        </div>
      </div>
    </div>
  );
}























