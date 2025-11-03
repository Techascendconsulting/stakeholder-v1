// Epic selection steps for user story walkthrough scenarios
export interface EpicOption {
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface EpicStep {
  question: string;
  options: EpicOption[];
}

export interface EpicSelectionScenario {
  id: string;
  title: string;
  epicStep: EpicStep;
}

export const epicSelectionScenarios: EpicSelectionScenario[] = [
  {
    "id": "1",
    "title": "Requesting a Repair Appointment",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Repair Request Scheduling", "isCorrect": true, "feedback": "Correct — the issue is engineers missing tenants because appointments aren't scheduled properly." },
        { "label": "Tenant Services Improvements", "isCorrect": false, "feedback": "Too broad. This is specifically about scheduling repairs, not all services." },
        { "label": "Appointment Management", "isCorrect": false, "feedback": "Close, but the Epic is focused on repair scheduling, not general appointments." },
        { "label": "Customer Communication", "isCorrect": false, "feedback": "Not correct. Communication helps, but the root issue is scheduling slots." }
      ]
    }
  },
  {
    "id": "2",
    "title": "View Pending Charges",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Tenant Finance Dashboard", "isCorrect": true, "feedback": "Correct — tenants need visibility of pending charges in their dashboard." },
        { "label": "Rent & Charges Transparency", "isCorrect": false, "feedback": "Important, but the Epic is a dashboard feature, not transparency in general." },
        { "label": "Billing and Payments", "isCorrect": false, "feedback": "Not quite. This is about showing information, not changing billing logic." },
        { "label": "Customer Self-Service", "isCorrect": false, "feedback": "Broad. The focus here is specifically finance dashboard access." }
      ]
    }
  },
  {
    "id": "3",
    "title": "Refund Receipt Email",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Payment & Refunds", "isCorrect": true, "feedback": "Correct — the Epic is ensuring refunds generate a confirmation email." },
        { "label": "Customer Communication", "isCorrect": false, "feedback": "Close, but this is finance-specific communication, not generic." },
        { "label": "Finance Operations", "isCorrect": false, "feedback": "Not quite. Operations benefit, but the Epic is refund confirmation emails." },
        { "label": "Tenant Reassurance", "isCorrect": false, "feedback": "Not correct. Reassurance is the benefit, but the Epic is refund receipts." }
      ]
    }
  },
  {
    "id": "4",
    "title": "Update Emergency Contact",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Contact Management", "isCorrect": true, "feedback": "Correct — this is about prompting tenants to update emergency contacts." },
        { "label": "CRM Enhancements", "isCorrect": false, "feedback": "Too back-end focused. The Epic is tenant contact updates." },
        { "label": "Tenant Safety", "isCorrect": false, "feedback": "Important outcome, but not the Epic itself." },
        { "label": "Emergency Preparedness", "isCorrect": false, "feedback": "Close, but the actionable Epic is Contact Management." }
      ]
    }
  },
  {
    "id": "5",
    "title": "Add Photos to Maintenance Request",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Maintenance Requests", "isCorrect": true, "feedback": "Correct — the Epic is adding photo attachments to maintenance requests." },
        { "label": "Engineer Readiness", "isCorrect": false, "feedback": "That's the benefit, but the Epic is photo attachments." },
        { "label": "Job Preparation", "isCorrect": false, "feedback": "Close, but preparation is the effect, not the Epic itself." },
        { "label": "Tenant Communication", "isCorrect": false, "feedback": "Not correct. This is about describing issues visually, not messaging." }
      ]
    }
  },
  {
    "id": "6",
    "title": "Edit Personal Details",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Profile Management", "isCorrect": true, "feedback": "Correct — this Epic is about editing tenant details." },
        { "label": "Mobile App Enhancements", "isCorrect": false, "feedback": "Too broad. This is specifically profile management." },
        { "label": "Self-Service Features", "isCorrect": false, "feedback": "Close, but profile management is the clearer Epic." },
        { "label": "Tenant Account Settings", "isCorrect": false, "feedback": "Related, but the most accurate Epic is Profile Management." }
      ]
    }
  },
  {
    "id": "7",
    "title": "Medication Reminders",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Medication Safety", "isCorrect": true, "feedback": "Correct — the Epic is about ensuring patients take medication on time." },
        { "label": "Healthcare Management", "isCorrect": false, "feedback": "Broad. The focus is medication reminders." },
        { "label": "Patient Support Tools", "isCorrect": false, "feedback": "Support tools are helpful, but the Epic is safety reminders." },
        { "label": "Caregiver Communication", "isCorrect": false, "feedback": "Not correct. This is about system reminders, not caregiver messaging." }
      ]
    }
  },
  {
    "id": "8",
    "title": "Order Cancellation Window",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Order Management", "isCorrect": true, "feedback": "Correct — the Epic is adding cancellation windows to orders." },
        { "label": "Customer Flexibility", "isCorrect": false, "feedback": "Flexibility is the outcome, but the Epic is Order Management controls." },
        { "label": "E-commerce Enhancements", "isCorrect": false, "feedback": "Broad. The specific Epic is Order Management." },
        { "label": "Customer Experience", "isCorrect": false, "feedback": "Not quite. CX is the benefit, the Epic is cancellations." }
      ]
    }
  },
  {
    "id": "9",
    "title": "Course Progress Tracker",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Progress Tracking", "isCorrect": true, "feedback": "Correct — this is about tracking course progress." },
        { "label": "Learning Experience", "isCorrect": false, "feedback": "Broad. The Epic is specifically progress tracking." },
        { "label": "Education Dashboard", "isCorrect": false, "feedback": "Close, but progress tracking is clearer." },
        { "label": "Student Self-Service", "isCorrect": false, "feedback": "Not quite. The Epic is progress tracking." }
      ]
    }
  },
  {
    "id": "10",
    "title": "Submit Meter Reading",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Meter Reading", "isCorrect": true, "feedback": "Correct — this is about tenants submitting readings to avoid estimated bills." },
        { "label": "Energy Billing", "isCorrect": false, "feedback": "Billing depends on readings, but the Epic is about capturing readings." },
        { "label": "Utilities Management", "isCorrect": false, "feedback": "Broad. Focus is reading submission." },
        { "label": "Customer Self-Service", "isCorrect": false, "feedback": "Self-service is an outcome, but the Epic is Meter Reading." }
      ]
    }
  },
  {
    "id": "11",
    "title": "Request Annual Leave",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Leave Management", "isCorrect": true, "feedback": "Correct — this is about employees requesting time off through a proper system." },
        { "label": "HR Automation", "isCorrect": false, "feedback": "Too broad. The focus is specifically leave requests." },
        { "label": "Employee Self-Service", "isCorrect": false, "feedback": "Close, but leave management is more specific." },
        { "label": "Workforce Planning", "isCorrect": false, "feedback": "Not quite. This is about individual leave requests." }
      ]
    }
  },
  {
    "id": "12",
    "title": "Download My Data",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Data Portability", "isCorrect": true, "feedback": "Correct — this is about customers downloading their personal data." },
        { "label": "GDPR Compliance", "isCorrect": false, "feedback": "Compliance is the driver, but the Epic is data portability." },
        { "label": "Customer Rights", "isCorrect": false, "feedback": "Rights are the foundation, but the Epic is data download functionality." },
        { "label": "Privacy Management", "isCorrect": false, "feedback": "Not quite. This is about data access, not privacy controls." }
      ]
    }
  },
  {
    "id": "13",
    "title": "Reserve a Company Vehicle",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Vehicle Booking", "isCorrect": true, "feedback": "Correct — this is about staff booking company cars to avoid conflicts." },
        { "label": "Fleet Management", "isCorrect": false, "feedback": "Too broad. The focus is booking, not fleet operations." },
        { "label": "Resource Scheduling", "isCorrect": false, "feedback": "Close, but vehicle booking is more specific." },
        { "label": "Facilities Management", "isCorrect": false, "feedback": "Not quite. This is specifically about vehicle reservations." }
      ]
    }
  },
  {
    "id": "14",
    "title": "Leave a Product Review",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Product Reviews", "isCorrect": true, "feedback": "Correct — this is about customers writing reviews after purchase." },
        { "label": "Customer Feedback", "isCorrect": false, "feedback": "Too broad. The focus is product reviews specifically." },
        { "label": "Marketing Tools", "isCorrect": false, "feedback": "Reviews help marketing, but the Epic is review functionality." },
        { "label": "Social Commerce", "isCorrect": false, "feedback": "Not quite. This is about review collection, not social features." }
      ]
    }
  },
  {
    "id": "15",
    "title": "Choose a Meal Preference",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Meal Selection", "isCorrect": true, "feedback": "Correct — this is about passengers choosing meal preferences during booking." },
        { "label": "Flight Booking", "isCorrect": false, "feedback": "Too broad. This is specifically about meal choices." },
        { "label": "Passenger Services", "isCorrect": false, "feedback": "Close, but meal selection is more specific." },
        { "label": "Catering Management", "isCorrect": false, "feedback": "Not quite. This is about passenger choice, not catering operations." }
      ]
    }
  },
  {
    "id": "16",
    "title": "Submit Absence Note",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Absence Management", "isCorrect": true, "feedback": "Correct — this is about parents submitting absence notes via the app." },
        { "label": "Parent Communication", "isCorrect": false, "feedback": "Too broad. The focus is absence reporting." },
        { "label": "School Administration", "isCorrect": false, "feedback": "Close, but absence management is more specific." },
        { "label": "Student Attendance", "isCorrect": false, "feedback": "Not quite. This is about absence reporting, not attendance tracking." }
      ]
    }
  },
  {
    "id": "17",
    "title": "Book Flu Jab Online",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Online Appointments", "isCorrect": true, "feedback": "Correct — this is about patients booking flu jabs through the online system." },
        { "label": "Healthcare Booking", "isCorrect": false, "feedback": "Too broad. The focus is online appointment booking." },
        { "label": "Patient Self-Service", "isCorrect": false, "feedback": "Close, but online appointments is more specific." },
        { "label": "Vaccination Management", "isCorrect": false, "feedback": "Not quite. This is about booking appointments, not vaccine management." }
      ]
    }
  },
  {
    "id": "18",
    "title": "Track Case Progress",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Case Tracking", "isCorrect": true, "feedback": "Correct — this is about clients tracking their legal case status online." },
        { "label": "Client Portal", "isCorrect": false, "feedback": "Too broad. The focus is case status tracking." },
        { "label": "Legal Services", "isCorrect": false, "feedback": "Too broad. This is specifically about case tracking." },
        { "label": "Status Notifications", "isCorrect": false, "feedback": "Close, but case tracking is more comprehensive." }
      ]
    }
  },
  {
    "id": "19",
    "title": "Upload Supporting Documents",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Document Upload", "isCorrect": true, "feedback": "Correct — this is about loan applicants uploading required documents." },
        { "label": "Loan Application", "isCorrect": false, "feedback": "Too broad. The focus is document upload functionality." },
        { "label": "Application Processing", "isCorrect": false, "feedback": "Close, but document upload is more specific." },
        { "label": "File Management", "isCorrect": false, "feedback": "Not quite. This is about document submission, not file organization." }
      ]
    }
  },
  {
    "id": "20",
    "title": "Download Event Ticket",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Ticket Management", "isCorrect": true, "feedback": "Correct — this is about attendees downloading their e-tickets after purchase." },
        { "label": "Event Ticketing", "isCorrect": false, "feedback": "Too broad. The focus is ticket download functionality." },
        { "label": "Digital Tickets", "isCorrect": false, "feedback": "Close, but ticket management is more comprehensive." },
        { "label": "Purchase Confirmation", "isCorrect": false, "feedback": "Not quite. This is about ticket access, not purchase confirmation." }
      ]
    }
  },
  {
    "id": "21",
    "title": "Escalate Chat to Human Agent",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Chat Escalation", "isCorrect": true, "feedback": "Correct — this is about escalating chatbot conversations to human agents." },
        { "label": "Customer Support", "isCorrect": false, "feedback": "Too broad. The focus is chat escalation specifically." },
        { "label": "AI Handoff", "isCorrect": false, "feedback": "Close, but chat escalation is clearer." },
        { "label": "Support Automation", "isCorrect": false, "feedback": "Not quite. This is about human handoff, not automation." }
      ]
    }
  },
  {
    "id": "22",
    "title": "Track Job Application Status",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Application Tracking", "isCorrect": true, "feedback": "Correct — this is about candidates tracking their job application progress." },
        { "label": "Recruitment Process", "isCorrect": false, "feedback": "Too broad. The focus is application status tracking." },
        { "label": "Candidate Portal", "isCorrect": false, "feedback": "Close, but application tracking is more specific." },
        { "label": "Hiring Pipeline", "isCorrect": false, "feedback": "Not quite. This is about candidate visibility, not pipeline management." }
      ]
    }
  },
  {
    "id": "23",
    "title": "Notify Landlord of Move-Out",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Move-Out Notifications", "isCorrect": true, "feedback": "Correct — this is about tenants notifying landlords of their move-out plans." },
        { "label": "Property Management", "isCorrect": false, "feedback": "Too broad. The focus is move-out notifications." },
        { "label": "Tenant Communication", "isCorrect": false, "feedback": "Close, but move-out notifications is more specific." },
        { "label": "Lease Management", "isCorrect": false, "feedback": "Not quite. This is about move-out notice, not lease administration." }
      ]
    }
  },
  {
    "id": "24",
    "title": "Download Policy Document",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Document Access", "isCorrect": true, "feedback": "Correct — this is about customers downloading their policy documents." },
        { "label": "Policy Management", "isCorrect": false, "feedback": "Too broad. The focus is document access." },
        { "label": "Customer Portal", "isCorrect": false, "feedback": "Close, but document access is more specific." },
        { "label": "File Downloads", "isCorrect": false, "feedback": "Not quite. This is about policy document access, not general file downloads." }
      ]
    }
  },
  {
    "id": "25",
    "title": "Pause Subscription Temporarily",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Subscription Management", "isCorrect": true, "feedback": "Correct — this is about customers pausing and resuming subscriptions." },
        { "label": "Billing Control", "isCorrect": false, "feedback": "Close, but subscription management is more comprehensive." },
        { "label": "Customer Retention", "isCorrect": false, "feedback": "Retention is the benefit, but the Epic is subscription controls." },
        { "label": "Payment Flexibility", "isCorrect": false, "feedback": "Not quite. This is about subscription pausing, not payment options." }
      ]
    }
  },
  {
    "id": "26",
    "title": "Book Flu Jab Online",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Online Appointments", "isCorrect": true, "feedback": "Correct — this is about patients booking flu jabs through the online system." },
        { "label": "Healthcare Booking", "isCorrect": false, "feedback": "Too broad. The focus is online appointment booking." },
        { "label": "Patient Self-Service", "isCorrect": false, "feedback": "Close, but online appointments is more specific." },
        { "label": "Vaccination Management", "isCorrect": false, "feedback": "Not quite. This is about booking appointments, not vaccine management." }
      ]
    }
  },
  {
    "id": "27",
    "title": "Apply for Housing Transfer",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Housing Transfers", "isCorrect": true, "feedback": "Correct — this is about tenants applying for housing transfers through a standard form." },
        { "label": "Property Management", "isCorrect": false, "feedback": "Too broad. The focus is transfer applications." },
        { "label": "Tenant Services", "isCorrect": false, "feedback": "Close, but housing transfers is more specific." },
        { "label": "Application Processing", "isCorrect": false, "feedback": "Not quite. This is about transfer requests, not general applications." }
      ]
    }
  },
  {
    "id": "28",
    "title": "Register a New Vendor",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Vendor Registration", "isCorrect": true, "feedback": "Correct — this is about suppliers registering as vendors through a form." },
        { "label": "Procurement Management", "isCorrect": false, "feedback": "Too broad. The focus is vendor registration." },
        { "label": "Supplier Onboarding", "isCorrect": false, "feedback": "Close, but vendor registration is more specific." },
        { "label": "Business Registration", "isCorrect": false, "feedback": "Not quite. This is about vendor registration, not general business registration." }
      ]
    }
  },
  {
    "id": "29",
    "title": "Eligibility Check for Childcare Scheme",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Eligibility Checking", "isCorrect": true, "feedback": "Correct — this is about checking if parents qualify for childcare benefits." },
        { "label": "Benefits Management", "isCorrect": false, "feedback": "Too broad. The focus is eligibility checking." },
        { "label": "Childcare Services", "isCorrect": false, "feedback": "Close, but eligibility checking is more specific." },
        { "label": "Income Verification", "isCorrect": false, "feedback": "Not quite. This is about eligibility assessment, not just income verification." }
      ]
    }
  },
  {
    "id": "30",
    "title": "Upload Rent Payment Proof",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Payment Verification", "isCorrect": true, "feedback": "Correct — this is about tenants uploading proof of rent payments." },
        { "label": "Rent Management", "isCorrect": false, "feedback": "Too broad. The focus is payment verification." },
        { "label": "Document Upload", "isCorrect": false, "feedback": "Close, but payment verification is more specific." },
        { "label": "Financial Tracking", "isCorrect": false, "feedback": "Not quite. This is about payment proof, not general financial tracking." }
      ]
    }
  },
  {
    "id": "31",
    "title": "Report Anti-Social Behaviour",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Incident Reporting", "isCorrect": true, "feedback": "Correct — this is about tenants reporting anti-social behaviour incidents." },
        { "label": "Community Safety", "isCorrect": false, "feedback": "Too broad. The focus is incident reporting." },
        { "label": "Safety Management", "isCorrect": false, "feedback": "Close, but incident reporting is more specific." },
        { "label": "Complaint Handling", "isCorrect": false, "feedback": "Not quite. This is about incident reporting, not general complaints." }
      ]
    }
  },
  {
    "id": "32",
    "title": "Register for Apprenticeship Scheme",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Apprenticeship Registration", "isCorrect": true, "feedback": "Correct — this is about young people registering interest in apprenticeships." },
        { "label": "Skills Development", "isCorrect": false, "feedback": "Too broad. The focus is apprenticeship registration." },
        { "label": "Employment Services", "isCorrect": false, "feedback": "Close, but apprenticeship registration is more specific." },
        { "label": "Youth Programs", "isCorrect": false, "feedback": "Not quite. This is about apprenticeship registration, not general youth programs." }
      ]
    }
  },
  {
    "id": "33",
    "title": "Request Home Adaptations",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Home Adaptations", "isCorrect": true, "feedback": "Correct — this is about residents requesting home adaptations for disabilities." },
        { "label": "Accessibility Services", "isCorrect": false, "feedback": "Too broad. The focus is home adaptations." },
        { "label": "Disability Support", "isCorrect": false, "feedback": "Close, but home adaptations is more specific." },
        { "label": "Property Modifications", "isCorrect": false, "feedback": "Not quite. This is about adaptation requests, not general modifications." }
      ]
    }
  },
  {
    "id": "34",
    "title": "Update Emergency Contact Info",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "Contact Management", "isCorrect": true, "feedback": "Correct — this is about tenants updating their emergency contact information." },
        { "label": "Emergency Preparedness", "isCorrect": false, "feedback": "Too broad. The focus is contact management." },
        { "label": "Tenant Safety", "isCorrect": false, "feedback": "Close, but contact management is more specific." },
        { "label": "Welfare Support", "isCorrect": false, "feedback": "Not quite. This is about contact updates, not general welfare support." }
      ]
    }
  },
  {
    "id": "35",
    "title": "Apply for Business License Renewal",
    "epicStep": {
      "question": "Which Epic does this requirement belong to?",
      "options": [
        { "label": "License Renewal", "isCorrect": true, "feedback": "Correct — this is about traders renewing their business licenses." },
        { "label": "Business Licensing", "isCorrect": false, "feedback": "Too broad. The focus is license renewal." },
        { "label": "Regulatory Compliance", "isCorrect": false, "feedback": "Close, but license renewal is more specific." },
        { "label": "Permit Management", "isCorrect": false, "feedback": "Not quite. This is about license renewal, not general permit management." }
      ]
    }
  }
];

export const getEpicSelectionScenario = (id: string): EpicSelectionScenario | undefined => {
  return epicSelectionScenarios.find(scenario => scenario.id === id);
};













