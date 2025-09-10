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
  // 📦 Product / Service Features
  {
    id: 'subscription-pause',
    category: 'Product / Service Features',
    title: 'Subscription Pause',
    description: 'Customers want the ability to pause their subscription for up to 3 months without losing access to their data.',
    sampleUserStory: 'As a customer, I want to pause my subscription for up to 3 months so that I can maintain access to my data during temporary breaks.',
    difficulty: 'Intermediate',
    tags: ['subscription', 'data-access', 'temporary-pause']
  },
  {
    id: 'digital-receipts',
    category: 'Product / Service Features',
    title: 'Digital Receipts',
    description: 'Retail customers are requesting email receipts instead of paper ones after in-store purchases.',
    sampleUserStory: 'As a retail customer, I want to receive email receipts instead of paper ones so that I can keep digital records and reduce paper waste.',
    difficulty: 'Beginner',
    tags: ['receipts', 'email', 'sustainability', 'digital']
  },
  {
    id: 'otp-verification',
    category: 'Product / Service Features',
    title: 'One-Time Password (OTP)',
    description: 'To reduce fraud, the system should require OTP verification before account changes.',
    sampleUserStory: 'As a user, I want OTP verification before making account changes so that my account remains secure from unauthorized access.',
    difficulty: 'Intermediate',
    tags: ['security', 'otp', 'verification', 'fraud-prevention']
  },
  {
    id: 'add-to-wishlist',
    category: 'Product / Service Features',
    title: 'Add to Wishlist',
    description: 'Users want to save products they\'re interested in to a wishlist for future purchase.',
    sampleUserStory: 'As a customer, I want to save products to a wishlist so that I can easily find and purchase them later.',
    difficulty: 'Beginner',
    tags: ['wishlist', 'products', 'save', 'future-purchase']
  },
  {
    id: 'delivery-instructions',
    category: 'Product / Service Features',
    title: 'Delivery Instructions',
    description: 'Customers want to provide specific delivery instructions (e.g., "leave with neighbour").',
    sampleUserStory: 'As a customer, I want to provide specific delivery instructions so that my packages are delivered according to my preferences.',
    difficulty: 'Beginner',
    tags: ['delivery', 'instructions', 'customization', 'logistics']
  },

  // 🏠 Housing / Tenant Management
  {
    id: 'rent-payment-reminder',
    category: 'Housing / Tenant Management',
    title: 'Rent Payment Reminder',
    description: 'Tenants often forget their rent date. The housing provider wants to send automatic reminders 3 days before.',
    sampleUserStory: 'As a tenant, I want to receive automatic rent payment reminders 3 days before my due date so that I never miss a payment.',
    difficulty: 'Beginner',
    tags: ['rent', 'reminders', 'automation', 'payments']
  },
  {
    id: 'request-property-repair',
    category: 'Housing / Tenant Management',
    title: 'Request Property Repair',
    description: 'Tenants want to request repairs through a self-service portal, with options to attach photos and select urgency.',
    sampleUserStory: 'As a tenant, I want to request property repairs through a self-service portal so that I can quickly report issues with photos and urgency levels.',
    difficulty: 'Intermediate',
    tags: ['repairs', 'self-service', 'photos', 'urgency', 'portal']
  },
  {
    id: 'add-occupant',
    category: 'Housing / Tenant Management',
    title: 'Add Occupant',
    description: 'Some tenants need to add family members or new residents to their housing agreement.',
    sampleUserStory: 'As a tenant, I want to add family members or new residents to my housing agreement so that they are officially recognized as occupants.',
    difficulty: 'Intermediate',
    tags: ['occupants', 'family', 'agreement', 'residents']
  },
  {
    id: 'report-anti-social-behaviour',
    category: 'Housing / Tenant Management',
    title: 'Report Anti-Social Behaviour',
    description: 'Tenants need a secure way to report noise complaints or anti-social behaviour anonymously.',
    sampleUserStory: 'As a tenant, I want to report anti-social behaviour anonymously so that I can address issues without fear of retaliation.',
    difficulty: 'Complex',
    tags: ['reporting', 'anonymous', 'anti-social', 'security', 'complaints']
  },
  {
    id: 'proof-of-address-letter',
    category: 'Housing / Tenant Management',
    title: 'Proof of Address Letter',
    description: 'Tenants want to download a letter confirming their address for use in visa or school applications.',
    sampleUserStory: 'As a tenant, I want to download a proof of address letter so that I can use it for visa or school applications.',
    difficulty: 'Beginner',
    tags: ['proof-of-address', 'download', 'letter', 'applications']
  },

  // 🏥 Healthcare / Wellbeing
  {
    id: 'book-gp-appointment',
    category: 'Healthcare / Wellbeing',
    title: 'Book a GP Appointment',
    description: 'Patients should be able to book appointments online and choose between in-person or phone.',
    sampleUserStory: 'As a patient, I want to book GP appointments online so that I can choose between in-person or phone consultations at my convenience.',
    difficulty: 'Intermediate',
    tags: ['appointments', 'booking', 'gp', 'online', 'consultation']
  },
  {
    id: 'prescription-refill',
    category: 'Healthcare / Wellbeing',
    title: 'Prescription Refill',
    description: 'Users should be able to reorder previously prescribed medication without starting a new consultation.',
    sampleUserStory: 'As a patient, I want to reorder previously prescribed medication so that I can continue my treatment without a new consultation.',
    difficulty: 'Intermediate',
    tags: ['prescription', 'refill', 'medication', 'reorder']
  },
  {
    id: 'mental-health-checkin',
    category: 'Healthcare / Wellbeing',
    title: 'Mental Health Check-In',
    description: 'Users can self-check their mental health weekly and get automated signposting based on answers.',
    sampleUserStory: 'As a user, I want to complete weekly mental health check-ins so that I can receive automated signposting and support based on my responses.',
    difficulty: 'Complex',
    tags: ['mental-health', 'check-in', 'signposting', 'automated', 'wellbeing']
  },

  // 🧾 Finance / Billing / Accounts
  {
    id: 'split-bill-feature',
    category: 'Finance / Billing / Accounts',
    title: 'Split Bill Feature',
    description: 'Users want to split bills with friends directly in the app and track who has paid.',
    sampleUserStory: 'As a user, I want to split bills with friends in the app so that I can track who has paid and manage shared expenses easily.',
    difficulty: 'Complex',
    tags: ['split-bill', 'friends', 'tracking', 'payments', 'shared-expenses']
  },
  {
    id: 'update-bank-details',
    category: 'Finance / Billing / Accounts',
    title: 'Update Bank Details',
    description: 'Staff should be able to update their payment details before payday and get confirmation of change.',
    sampleUserStory: 'As a staff member, I want to update my bank details before payday so that I can ensure my salary is paid to the correct account.',
    difficulty: 'Intermediate',
    tags: ['bank-details', 'payment', 'payday', 'confirmation', 'staff']
  },
  {
    id: 'late-payment-fee-warning',
    category: 'Finance / Billing / Accounts',
    title: 'Late Payment Fee Warning',
    description: 'Customers should be warned before a late payment fee is applied.',
    sampleUserStory: 'As a customer, I want to be warned before a late payment fee is applied so that I can make the payment on time and avoid additional charges.',
    difficulty: 'Beginner',
    tags: ['late-payment', 'warning', 'fees', 'notification']
  },
  {
    id: 'cancel-direct-debit',
    category: 'Finance / Billing / Accounts',
    title: 'Cancel Direct Debit',
    description: 'Users should be able to cancel a direct debit without calling support, and see when it takes effect.',
    sampleUserStory: 'As a user, I want to cancel a direct debit without calling support so that I can manage my payments independently and see when the cancellation takes effect.',
    difficulty: 'Intermediate',
    tags: ['direct-debit', 'cancel', 'self-service', 'support']
  },

  // 📲 Admin / Profile / Settings
  {
    id: 'change-phone-number',
    category: 'Admin / Profile / Settings',
    title: 'Change Phone Number',
    description: 'Users should be able to update their phone number and verify it with an OTP.',
    sampleUserStory: 'As a user, I want to update my phone number and verify it with OTP so that I can keep my contact information current and secure.',
    difficulty: 'Intermediate',
    tags: ['phone-number', 'update', 'otp', 'verification', 'profile']
  },
  {
    id: 'delete-account',
    category: 'Admin / Profile / Settings',
    title: 'Delete Account',
    description: 'Users want to delete their account and receive confirmation that all data will be removed.',
    sampleUserStory: 'As a user, I want to delete my account so that I can remove all my personal data and receive confirmation that the deletion is complete.',
    difficulty: 'Complex',
    tags: ['delete-account', 'data-removal', 'confirmation', 'privacy']
  },
  {
    id: 'notification-preferences',
    category: 'Admin / Profile / Settings',
    title: 'Notification Preferences',
    description: 'Customers want to choose which types of notifications they receive (email, SMS, push).',
    sampleUserStory: 'As a customer, I want to choose which types of notifications I receive so that I can control my communication preferences and avoid notification overload.',
    difficulty: 'Beginner',
    tags: ['notifications', 'preferences', 'email', 'sms', 'push']
  },

  // 🚀 Projects / Workflows / Approvals
  {
    id: 'leave-request-workflow',
    category: 'Projects / Workflows / Approvals',
    title: 'Leave Request Workflow',
    description: 'Staff want to request annual leave, see their remaining allowance, and view approval status.',
    sampleUserStory: 'As a staff member, I want to request annual leave so that I can see my remaining allowance and track the approval status of my requests.',
    difficulty: 'Intermediate',
    tags: ['leave-request', 'annual-leave', 'allowance', 'approval', 'workflow']
  },
  {
    id: 'document-upload-application',
    category: 'Projects / Workflows / Approvals',
    title: 'Document Upload in Application',
    description: 'Applicants should be able to upload supporting documents (e.g. ID) in their application process.',
    sampleUserStory: 'As an applicant, I want to upload supporting documents during my application so that I can provide all required information in one place.',
    difficulty: 'Intermediate',
    tags: ['document-upload', 'application', 'supporting-documents', 'id']
  },
  {
    id: 'manager-approval-flow',
    category: 'Projects / Workflows / Approvals',
    title: 'Manager Approval Flow',
    description: 'A request should only progress to HR after a line manager approves it.',
    sampleUserStory: 'As a line manager, I want to approve requests before they go to HR so that I can ensure proper authorization and workflow control.',
    difficulty: 'Complex',
    tags: ['approval-flow', 'manager', 'hr', 'workflow', 'authorization']
  },

  // 📈 Reporting / Tracking / Status
  {
    id: 'track-order-status',
    category: 'Reporting / Tracking / Status',
    title: 'Track Order Status',
    description: 'Customers want to track the status of their order in real time and receive updates.',
    sampleUserStory: 'As a customer, I want to track my order status in real time so that I can stay informed about delivery progress and receive timely updates.',
    difficulty: 'Intermediate',
    tags: ['order-tracking', 'real-time', 'status', 'updates', 'delivery']
  },
  {
    id: 'view-usage-report',
    category: 'Reporting / Tracking / Status',
    title: 'View Usage Report',
    description: 'Users want to see a summary of their account usage for the past 12 months, with download options.',
    sampleUserStory: 'As a user, I want to view my account usage summary for the past 12 months so that I can understand my usage patterns and download reports for my records.',
    difficulty: 'Intermediate',
    tags: ['usage-report', 'summary', '12-months', 'download', 'analytics']
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
