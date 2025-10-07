import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import ReportIssueModal from './ReportIssueModal';

interface ReportIssueButtonProps {
  pageContext: string;
  pageTitle: string;
}

/**
 * Report Issue Button
 * 
 * Small floating button for quick technical issue reporting
 * Positioned near the Verity widget
 */
export default function ReportIssueButton({ pageContext, pageTitle }: ReportIssueButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
        aria-label="Report an Issue"
      >
        <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
        <span className="text-white font-semibold text-xs whitespace-nowrap">Report Issue</span>
        
        {/* Pulse animation on hover */}
        <span className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
      </button>

      <ReportIssueModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        pageContext={pageContext}
        pageTitle={pageTitle}
      />
    </>
  );
}

