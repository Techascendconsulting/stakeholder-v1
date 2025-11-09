import React from 'react';
import type { AppView } from '../types';
import {
  PageShell,
  PageTitle,
  Section,
  Placeholder,
  NavigationButtons,
} from './common';
import { baInActionViewToPath, getBaInActionNavigation } from './config';

const VIEW_ID: AppView = 'ba_in_action_handover_value';

const UATValidation: React.FC = () => {
  const { previous, next } = getBaInActionNavigation(VIEW_ID);
  const backLink = previous ? baInActionViewToPath[previous.view] : undefined;
  const nextLink = next ? baInActionViewToPath[next.view] : undefined;

  return (
    <PageShell>
      <PageTitle title="Handover & Value Tracking" />

      <Section title="Real Scenario">
        <Placeholder text="Example scenario will go here." />
      </Section>

      <Section title="What This Means to a BA">
        <Placeholder text="Interpretation table will go here." />
      </Section>

      <Section title="Process Breakdown (As-Is → Gap → To-Be)">
        <Placeholder text="Text-based process lists will go here." />
      </Section>

      <Section title="Mini Practice">
        <Placeholder text="Short exercise question will go here." />
      </Section>

      <NavigationButtons backLink={backLink} nextLink={nextLink} />
    </PageShell>
  );
};

export default UATValidation;

