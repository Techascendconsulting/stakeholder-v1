import type { AppView } from '../types';

export const BA_IN_ACTION_BASE_PATH = '/ba-in-action';
export const BA_IN_ACTION_INDEX_VIEW: AppView = 'ba-in-action-index';

export interface BAInActionPageDefinition {
  title: string;
  slug: string;
  view: AppView;
}

export const BA_IN_ACTION_PAGES: BAInActionPageDefinition[] = [
  {
    title: 'Understand the Business Problem',
    slug: 'understanding-context',
    view: 'ba-in-action-understanding-context',
  },
  {
    title: 'Who’s Involved & Why It Matters',
    slug: 'stakeholder-landscape',
    view: 'ba-in-action-stakeholder-landscape',
  },
  {
    title: 'Stakeholder Communication',
    slug: 'stakeholder-communication',
    view: 'ba-in-action-stakeholder-communication',
  },
  {
    title: 'Discovery / Elicitation',
    slug: 'discovery-elicitation',
    view: 'ba-in-action-discovery-elicitation',
  },
  {
    title: 'As-Is & Analysis',
    slug: 'analysis-spotting-issues',
    view: 'ba-in-action-analysis-spotting-issues',
  },
  {
    title: 'To-Be & Solution Direction',
    slug: 'to-be-and-solution-shaping',
    view: 'ba-in-action-to-be-and-solution-shaping',
  },
  {
    title: 'Working with Developers & QA',
    slug: 'working-with-developers',
    view: 'ba-in-action-working-with-developers',
  },
  {
    title: 'UAT & Validation',
    slug: 'uat-validation',
    view: 'ba-in-action-uat-validation',
  },
  {
    title: 'Continuous Improvement',
    slug: 'continuous-improvement',
    view: 'ba-in-action-continuous-improvement',
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

