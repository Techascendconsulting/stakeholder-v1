import type { AppView } from '../types';

export const BA_IN_ACTION_BASE_PATH = '/ba-in-action';

export interface BAInActionPageDefinition {
  title: string;
  slug: string;
  view: AppView;
}

export const BA_IN_ACTION_PAGES: BAInActionPageDefinition[] = [
  {
    title: 'Understanding Context',
    slug: 'understanding-context',
    view: 'ba-in-action-understanding-context',
  },
  {
    title: 'Stakeholder Communication',
    slug: 'stakeholder-communication',
    view: 'ba-in-action-stakeholder-communication',
  },
  {
    title: 'Discovery & Elicitation',
    slug: 'discovery-elicitation',
    view: 'ba-in-action-discovery-elicitation',
  },
  {
    title: 'Analysis & Spotting Issues',
    slug: 'analysis-spotting-issues',
    view: 'ba-in-action-analysis-spotting-issues',
  },
  {
    title: 'To-Be & Solution Shaping',
    slug: 'to-be-and-solution-shaping',
    view: 'ba-in-action-to-be-and-solution-shaping',
  },
  {
    title: 'Working with Developers',
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
  {}
);

export const baInActionViewToPath = BA_IN_ACTION_PAGES.reduce<Partial<Record<AppView, string>>>(
  (acc, page) => {
    acc[page.view] = `${BA_IN_ACTION_BASE_PATH}/${page.slug}`;
    return acc;
  },
  {}
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

