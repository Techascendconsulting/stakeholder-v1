import { Phase, Section, Step } from '../types/models';

export const phases: Phase[] = [
  {
    id: 'phase-0',
    slug: 'phase-0',
    title: 'Your First Day',
    order: 0,
    isActive: true
  }
];

export const sections: Section[] = [
  {
    id: 'section-0-0',
    phaseId: 'phase-0',
    slug: 'intro',
    title: 'Welcome & Orientation',
    order: 0,
    isActive: true
  }
];

export const steps: Step[] = [
  {
    id: 'step-0',
    sectionId: 'section-0-0',
    title: 'Welcome to Your First Day',
    order: 0,
    stepType: 'text',
    payload: { markdown: '### Welcome\nThis is your first step in your BA journey.' },
    isActive: true
  },
  {
    id: 'step-1',
    sectionId: 'section-0-0',
    title: 'Meet Your Manager',
    order: 1,
    stepType: 'text',
    payload: { markdown: '### Meet Ben\nBen will guide you on your first week.' },
    isActive: true
  }
];



