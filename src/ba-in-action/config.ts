import type { AppView } from '../types';

export const BA_IN_ACTION_BASE_PATH = '/ba-in-action';
export const BA_IN_ACTION_INDEX_VIEW: AppView = 'ba-in-action-index';

export interface BAInActionPageDefinition {
  title: string;
  slug: string;
  route: string;
  view: AppView;
  description?: string;
}

const rawPages: Array<Omit<BAInActionPageDefinition, 'route'>> = [
  {
    title: 'Join & Orientation (Day 1)',
    slug: 'join-orientation',
    view: 'ba_in_action_join_orientation',
    description: 'Get welcomed, understand expectations, and set up your BA WorkXP workspace.',
  },
  {
    title: 'Understand the Business Problem',
    slug: 'understand-problem',
    view: 'ba_in_action_understand_problem',
    description: 'Clarify what the business is trying to achieve and why this work matters now.',
  },
  {
    title: 'Who’s Involved & Why It Matters',
    slug: 'whos-involved',
    view: 'ba_in_action_whos_involved',
    description: 'Identify the people who are affected, responsible, or influential in the outcome.',
  },
  {
    title: 'Stakeholder Communication',
    slug: 'stakeholder-communication',
    view: 'ba_in_action_stakeholder_communication',
    description: 'Learn how a BA approaches outreach, tone, and relationship-building.',
  },
  {
    title: 'As-Is → Gap → To-Be',
    slug: 'as-is-to-be',
    view: 'ba_in_action_as_is_to_be',
    description: 'Break down the current workflow and chart the future state with clear gaps identified.',
  },
  {
    title: 'Requirements & Documentation',
    slug: 'requirements-documentation',
    view: 'ba_in_action_requirements',
    description: 'Capture requirements, documentation, and traceability so delivery teams have clarity.',
  },
  {
    title: 'Agile Delivery',
    slug: 'agile-delivery',
    view: 'ba_in_action_agile_delivery',
    description: 'Work with developers and QA to turn requirements into working solutions.',
  },
  {
    title: 'Handover & Value Tracking',
    slug: 'handover-value',
    view: 'ba_in_action_handover_value',
    description: 'Support UAT, launch handover, and measure the value delivered after go-live.',
  },
] as const;

export const BA_IN_ACTION_PAGES: BAInActionPageDefinition[] = rawPages.map((page) => ({
  ...page,
  route: `${BA_IN_ACTION_BASE_PATH}/${page.slug}`,
}));

export const BA_IN_ACTION_VIEW_IDS = BA_IN_ACTION_PAGES.map((page) => page.view);

export const baInActionPathToView = BA_IN_ACTION_PAGES.reduce<Record<string, AppView>>(
  (acc, page) => {
    acc[page.route] = page.view;
    return acc;
  },
  {
    [BA_IN_ACTION_BASE_PATH]: BA_IN_ACTION_INDEX_VIEW,
  }
);

export const baInActionViewToPath = BA_IN_ACTION_PAGES.reduce<Partial<Record<AppView, string>>>(
  (acc, page) => {
    acc[page.view] = page.route;
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

