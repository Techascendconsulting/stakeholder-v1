export interface Scenario {
  id: string;
  category: string;
  title: string;
  description: string;
  sampleUserStory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Complex';
  tags: string[];
}

export const scenarios: Scenario[] = [
  // 🏠 Housing / Tenant Management
  {
    id: 'blurry-id-photos',
    category: 'Housing / Tenant Management',
    title: 'Blurry ID Photo Validation',
    description: 'You met your compliance manager, Marie, who said tenants often upload ID photos that are blurry or expired. She wants to reduce the number of invalid submissions to help the fraud review team respond faster.',
    sampleUserStory: 'As a tenant, I want to upload clear, valid ID photos so that my identity verification is processed quickly and accurately.',
    difficulty: 'Intermediate',
    tags: ['id-validation', 'photo-quality', 'fraud-prevention', 'compliance']
  },
  {
    id: 'refund-receipts',
    category: 'Finance / Billing',
    title: 'Refund Receipt System',
    description: 'You\'re in a kickoff call with the Finance Lead. They explained that every time a refund is processed, tenants get no receipt — which leads to multiple support tickets. They want proof of refund emailed immediately after submission.',
    sampleUserStory: 'As a tenant, I want to receive an email receipt when my refund is processed so that I have proof of the transaction and don\'t need to contact support.',
    difficulty: 'Beginner',
    tags: ['refunds', 'receipts', 'email', 'support-reduction']
  },
  {
    id: 'noise-complaint-tracking',
    category: 'Housing / Tenant Management',
    title: 'Noise Complaint Tracking',
    description: 'You just spoke with the customer service team. They mentioned tenants keep submitting complaints about noisy neighbours, but there\'s no way to track which ones are in progress or resolved. They want more visibility.',
    sampleUserStory: 'As a tenant, I want to track the status of my noise complaints so that I can see if they are being investigated and when they might be resolved.',
    difficulty: 'Intermediate',
    tags: ['complaints', 'tracking', 'status', 'visibility']
  },
  {
    id: 'maintenance-photos',
    category: 'Housing / Tenant Management',
    title: 'Maintenance Issue Photos',
    description: 'You met with James from the Maintenance Team. He said engineers are showing up to properties with no idea what tools to bring. Sometimes they arrive and can\'t do the job. He wants tenants to describe the issue better and attach photos.',
    sampleUserStory: 'As a tenant, I want to describe my maintenance issue and attach photos so that the engineer arrives with the right tools and can complete the job in one visit.',
    difficulty: 'Intermediate',
    tags: ['maintenance', 'photos', 'descriptions', 'efficiency']
  },
  {
    id: 'appointment-reminders',
    category: 'Housing / Tenant Management',
    title: 'Appointment Text Reminders',
    description: 'In your weekly sync, the Housing Officer told you many appointments are missed because tenants don\'t know what time the engineer will arrive. She wants a text reminder system with time slots confirmed the night before.',
    sampleUserStory: 'As a tenant, I want to receive text reminders with confirmed time slots the night before my appointment so that I don\'t miss the engineer\'s visit.',
    difficulty: 'Beginner',
    tags: ['appointments', 'reminders', 'sms', 'scheduling']
  },
  {
    id: 'subscription-pause',
    category: 'Product / Service Features',
    title: 'Service Pause Feature',
    description: 'Your Product Owner asked you to explore options for pausing subscription-based services, like cleaning or waste collection. Currently, tenants can only cancel, and there\'s no way to suspend a service when they\'re away for holiday.',
    sampleUserStory: 'As a tenant, I want to pause my subscription services when I\'m away on holiday so that I can resume them when I return without losing my subscription.',
    difficulty: 'Complex',
    tags: ['subscription', 'pause', 'holiday', 'services']
  },
  {
    id: 'clear-acceptance-criteria',
    category: 'Development / QA',
    title: 'Clear Acceptance Criteria',
    description: 'You sat in a retrospective where the Dev Team mentioned getting unclear requests with missing edge cases. They want more specific acceptance criteria — including what should happen when something fails or errors out.',
    sampleUserStory: 'As a developer, I want clear acceptance criteria with error handling scenarios so that I can build features that handle all edge cases properly.',
    difficulty: 'Complex',
    tags: ['acceptance-criteria', 'error-handling', 'edge-cases', 'development']
  },
  {
    id: 'change-address-journey',
    category: 'Housing / Tenant Management',
    title: 'Change of Address Journey',
    description: 'You interviewed the Contact Centre manager. He said when tenants submit change-of-address requests, they often forget to update their emergency contact, which leads to issues. He wants to make it part of the same journey.',
    sampleUserStory: 'As a tenant, I want to update my address and emergency contact in the same process so that all my contact information stays current.',
    difficulty: 'Intermediate',
    tags: ['address-change', 'emergency-contact', 'contact-info', 'journey']
  },
  {
    id: 'accessibility-screen-readers',
    category: 'Accessibility / Compliance',
    title: 'Screen Reader Accessibility',
    description: 'You received a complaint from the Accessibility Champion. She said blind users can\'t complete the tenancy termination form because the radio buttons aren\'t labeled for screen readers. This needs to be fixed.',
    sampleUserStory: 'As a blind user, I want radio buttons to be properly labeled for screen readers so that I can complete the tenancy termination form independently.',
    difficulty: 'Intermediate',
    tags: ['accessibility', 'screen-readers', 'forms', 'compliance']
  },
  {
    id: 'data-archiving',
    category: 'Data Governance / Compliance',
    title: 'Data Archiving System',
    description: 'During a data governance session, the Lead Analyst pointed out that tenants can still see past records even after they\'ve been marked as closed. The system should archive them properly to comply with data retention rules.',
    sampleUserStory: 'As a tenant, I want my closed records to be properly archived so that the system complies with data retention policies and my privacy is protected.',
    difficulty: 'Complex',
    tags: ['data-archiving', 'retention', 'compliance', 'privacy']
  },
  {
    id: 'terms-version-control',
    category: 'Legal / Compliance',
    title: 'Terms Version Control',
    description: 'You met your legal advisor, who mentioned a recent audit flagged that tenants weren\'t being shown updated terms before signing a lease renewal. She wants the system to always show the latest version of terms before they can proceed.',
    sampleUserStory: 'As a tenant, I want to see the latest version of terms before signing my lease renewal so that I\'m always agreeing to the most current legal terms.',
    difficulty: 'Intermediate',
    tags: ['terms', 'version-control', 'legal', 'compliance']
  },
  {
    id: 'mandatory-field-clarity',
    category: 'Development / UX',
    title: 'Mandatory Field Clarity',
    description: 'You had a chat with Lisa from Dev, who said they need more clarity on which fields are mandatory in forms. Stakeholders just say "collect user info" but never specify rules, and this leads to guesswork and rework during QA.',
    sampleUserStory: 'As a developer, I want clear specifications about which form fields are mandatory so that I can build forms correctly without guesswork.',
    difficulty: 'Beginner',
    tags: ['forms', 'mandatory-fields', 'validation', 'specifications']
  },
  {
    id: 'mobile-critical-issues',
    category: 'Mobile / Accessibility',
    title: 'Mobile Critical Issues',
    description: 'You were looped into a post-incident meeting where a tenant couldn\'t report a gas leak online because the form wasn\'t mobile-friendly. The operations team wants critical issues like gas or electrical to always work across devices.',
    sampleUserStory: 'As a tenant, I want to report critical issues like gas leaks on my mobile device so that I can report emergencies quickly from anywhere.',
    difficulty: 'Intermediate',
    tags: ['mobile', 'critical-issues', 'emergency', 'responsive']
  },
  {
    id: 'holiday-booking-restrictions',
    category: 'Scheduling / Business Rules',
    title: 'Holiday Booking Restrictions',
    description: 'Tom from QA mentioned that the feature for rescheduling appointments doesn\'t check for public holidays, which causes failed bookings. He wants a rule that restricts bookings to working days only.',
    sampleUserStory: 'As a tenant, I want the system to prevent me from booking appointments on public holidays so that my appointments are always scheduled for valid working days.',
    difficulty: 'Intermediate',
    tags: ['scheduling', 'holidays', 'business-rules', 'validation']
  },
  {
    id: 'colorblind-accessibility',
    category: 'Accessibility / UX',
    title: 'Colorblind Accessibility',
    description: 'In your catch-up with the Accessibility Officer, she flagged that color-coded alerts (like green for success) don\'t work for colorblind users. She wants the system to include icon labels or text alternatives.',
    sampleUserStory: 'As a colorblind user, I want alerts to include icons or text labels in addition to colors so that I can understand the status of my actions.',
    difficulty: 'Beginner',
    tags: ['accessibility', 'colorblind', 'alerts', 'icons']
  },
  {
    id: 'complaint-processing-times',
    category: 'Customer Service / Transparency',
    title: 'Complaint Processing Times',
    description: 'You spoke to the Community Manager, who said tenants are always confused about how long it takes to process a complaint. She wants estimated processing times shown clearly after submission, with status tracking updates.',
    sampleUserStory: 'As a tenant, I want to see estimated processing times and status updates for my complaints so that I know what to expect and when to follow up.',
    difficulty: 'Intermediate',
    tags: ['complaints', 'processing-times', 'status-tracking', 'transparency']
  },
  {
    id: 'partial-payment-logic',
    category: 'Finance / Business Logic',
    title: 'Partial Payment Business Logic',
    description: 'Srikanth (Tech Lead) told you the new payment system doesn\'t support partial payments, but stakeholders keep requesting it. He wants the story to specify business logic for when and how a partial payment is allowed.',
    sampleUserStory: 'As a tenant, I want to make partial payments when allowed by business rules so that I can manage my finances more flexibly.',
    difficulty: 'Complex',
    tags: ['payments', 'partial-payments', 'business-logic', 'finance']
  },
  {
    id: 'chatbot-payment-cancellation',
    category: 'Customer Service / Chatbot',
    title: 'Chatbot Payment Cancellation',
    description: 'You reviewed live chat logs and noticed many users try to cancel their rent payments through the chatbot — which it doesn\'t support. The team wants to explore whether chatbot flows should redirect users to proper channels.',
    sampleUserStory: 'As a tenant, I want the chatbot to either help me cancel my rent payment or redirect me to the right channel so that I can complete my request efficiently.',
    difficulty: 'Intermediate',
    tags: ['chatbot', 'payments', 'cancellation', 'routing']
  },
  {
    id: 'fraud-id-flagging',
    category: 'Security / Fraud Prevention',
    title: 'Fraud ID Flagging',
    description: 'You joined a workshop with the fraud team. They want a new flow that flags if the same tenant uploads different IDs in short succession — a signal of potential misuse. They want the rule clearly outlined in the story.',
    sampleUserStory: 'As a fraud analyst, I want the system to flag when the same tenant uploads different IDs in short succession so that I can investigate potential misuse.',
    difficulty: 'Complex',
    tags: ['fraud', 'id-verification', 'flagging', 'security']
  },
  {
    id: 'contractor-invoice-reminders',
    category: 'Procurement / Automation',
    title: 'Contractor Invoice Reminders',
    description: 'Your stakeholder in Procurement wants contractors to receive automatic reminders to upload invoices before the 20th of each month. Currently, it\'s all manual and often late. The rule must support recurring triggers.',
    sampleUserStory: 'As a contractor, I want to receive automatic reminders to upload my invoices before the 20th so that I never miss the deadline and get paid on time.',
    difficulty: 'Intermediate',
    tags: ['invoices', 'reminders', 'automation', 'procurement']
  },
  {
    id: 'income-change-documents',
    category: 'Housing Benefits / Documentation',
    title: 'Income Change Documentation',
    description: 'You met with the Housing Benefits Officer, who said when tenants report income changes, they often miss adding supporting documents. She wants the journey to include clear prompts for what\'s needed, with upload validations.',
    sampleUserStory: 'As a tenant, I want clear prompts about what documents I need to upload when reporting income changes so that my application is complete and processed quickly.',
    difficulty: 'Intermediate',
    tags: ['income-changes', 'documents', 'validation', 'benefits']
  },
  {
    id: 'pdf-download-journey',
    category: 'Accessibility / User Experience',
    title: 'PDF Download for Elderly Users',
    description: 'In a feedback session, the Tenant Advisory Board said many elderly users struggle with the step-by-step journey. They want a "Download All Steps as PDF" option so they can read it offline with their caregiver.',
    sampleUserStory: 'As an elderly tenant, I want to download all the steps as a PDF so that I can read through the process offline with my caregiver at my own pace.',
    difficulty: 'Beginner',
    tags: ['pdf', 'accessibility', 'elderly-users', 'offline']
  },
  {
    id: 'inactive-account-verification',
    category: 'Account Management / Security',
    title: 'Inactive Account Re-verification',
    description: 'During a planning session, the PO asked for a quick win: flag accounts that have been inactive for 6 months and show a prompt to re-verify contact info. You need to think about how to define inactivity and what to display.',
    sampleUserStory: 'As a tenant with an inactive account, I want to be prompted to re-verify my contact information so that my account stays secure and up-to-date.',
    difficulty: 'Intermediate',
    tags: ['inactive-accounts', 'verification', 'security', 'contact-info']
  },
  {
    id: 'new-device-alerts',
    category: 'Security / Notifications',
    title: 'New Device Security Alerts',
    description: 'A stakeholder in IT Security mentioned that password reset attempts from new devices should trigger an alert. You need to capture what counts as a "new device" and how the alert will be sent — email, SMS, or both.',
    sampleUserStory: 'As a tenant, I want to be alerted when someone tries to reset my password from a new device so that I can take action if it\'s not me.',
    difficulty: 'Complex',
    tags: ['security', 'new-device', 'alerts', 'password-reset']
  },
  {
    id: 'complaint-metrics-display',
    category: 'Reporting / Frontline Visibility',
    title: 'Complaint Metrics for Housing Officers',
    description: 'You met a senior stakeholder who said their priority is to surface metrics from the last 3 complaints per tenant, so housing officers see context at a glance. The request is not to build analytics, but to improve frontline visibility.',
    sampleUserStory: 'As a housing officer, I want to see the last 3 complaints for each tenant so that I have context about their history when I interact with them.',
    difficulty: 'Intermediate',
    tags: ['metrics', 'complaints', 'context', 'frontline-visibility']
  }
];

// Helper functions
export const getRandomScenario = (): Scenario => {
  const randomIndex = Math.floor(Math.random() * scenarios.length);
  return scenarios[randomIndex];
};

export const getScenariosByCategory = (category: string): Scenario[] => {
  return scenarios.filter(scenario => scenario.category === category);
};

export const getScenariosByDifficulty = (difficulty: 'Beginner' | 'Intermediate' | 'Complex'): Scenario[] => {
  return scenarios.filter(scenario => scenario.difficulty === difficulty);
};

export const getCategories = (): string[] => {
  return [...new Set(scenarios.map(scenario => scenario.category))];
};
