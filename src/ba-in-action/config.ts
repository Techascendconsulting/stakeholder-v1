import type { AppView } from '../types';

export const BA_IN_ACTION_BASE_PATH = '/ba-in-action';
export const BA_IN_ACTION_INDEX_VIEW: AppView = 'ba-in-action-index';

export interface BAInActionPageDefinition {
  title: string;
  slug: string;
  view: AppView;
  description?: string;
}

export const BA_IN_ACTION_PAGES: BAInActionPageDefinition[] = [
  {
    title: 'Understand the Business Problem',
    slug: 'understanding-context',
    view: 'ba-in-action-understanding-context',
    description: 'Frame the core problem the business is trying to solve.',
  },
  {
    title: 'Who’s Involved & Why It Matters',
    slug: 'stakeholder-landscape',
    view: 'ba-in-action-stakeholder-landscape',
    description: 'Map stakeholders and understand their motivations.',
  },
  {
    title: 'Stakeholder Communication',
    slug: 'stakeholder-communication',
    view: 'ba-in-action-stakeholder-communication',
    description: 'Plan how you’ll keep every stakeholder aligned.',
  },
  {
    title: 'Discovery / Elicitation',
    slug: 'discovery-elicitation',
    view: 'ba-in-action-discovery-elicitation',
    description: 'Elicit requirements and uncover hidden constraints.',
  },
  {
    title: 'As-Is & Analysis',
    slug: 'analysis-spotting-issues',
    view: 'ba-in-action-analysis-spotting-issues',
    description: 'Analyse current processes to surface gaps and risks.',
  },
  {
    title: 'To-Be & Solution Direction',
    slug: 'to-be-and-solution-shaping',
    view: 'ba-in-action-to-be-and-solution-shaping',
    description: 'Shape the target state and articulate solution direction.',
  },
  {
    title: 'Working with Developers & QA',
    slug: 'working-with-developers',
    view: 'ba-in-action-working-with-developers',
    description: 'Collaborate with delivery teams to build the right thing.',
  },
  {
    title: 'UAT & Validation',
    slug: 'uat-validation',
    view: 'ba-in-action-uat-validation',
    description: 'Validate that the solution meets acceptance criteria.',
  },
  {
    title: 'Continuous Improvement',
    slug: 'continuous-improvement',
    view: 'ba-in-action-continuous-improvement',
    description: 'Monitor outcomes and drive iterative improvements.',
  },
] as const;

export const BA_IN_ACTION_VIEW_IDS = BA_IN_ACTION_PAGES.map((page) => page.view);

export const baInActionPathToView = BA_IN_ACTION_PAGES.reduce<Record<string, AppView>>(
  (acc, page) => {
    acc[`${BA_IN_ACTION_BASE_PATH}/${page.slug}`] = page.view;
    return acc;
  },
  {
    [BA_IN_ACTION_BASE_PATH]: BA_IN_ACTION_INDEX_VIEW,
  }
);

export const baInActionViewToPath = BA_IN_ACTION_PAGES.reduce<Partial<Record<AppView, string>>>(
  (acc, page) => {
    acc[page.view] = `${BA_IN_ACTION_BASE_PATH}/${page.slug}`;
    return acc;
  },
  {
    [BA_IN_ACTION_INDEX_VIEW]: BA_IN_ACTION_BASE_PATH,
  }
);

export function getBaInActionNavigation(view: AppView) {
  const index = BA_IN_ACTION_PAGES.findIndex((page) => page.view === view);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  const previous = index > 0 ? BA_IN_ACTION_PAGES[index - 1] : undefined;
  const next = index < BA_IN_ACTION_PAGES.length - 1 ? BA_IN_ACTION_PAGES[index + 1] : undefined;

  return {
    previous,
    next,
  };
}

