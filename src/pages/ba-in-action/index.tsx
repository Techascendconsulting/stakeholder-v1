import React from 'react';
import type { AppView } from '../../types';
import PageContainer from '../../components/Layout/PageContainer';
import { Card } from '../../components/ui/card';
import { useApp } from '../../contexts/AppContext';
import { BA_IN_ACTION_PAGES } from '../../ba-in-action/config';

const BAInActionIndexPage: React.FC = () => {
  const { setCurrentView, currentView } = useApp();

  const handleNavigate = (view: AppView) => {
    void setCurrentView(view);
  };

  return (
    <PageContainer className="py-10 space-y-10">
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          BA In Action
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            See How Business Analysts Move from Insight to Impact
          </h1>
          <p className="max-w-2xl text-base text-gray-600 dark:text-gray-300">
            Walk through real project scenarios in sequence. Each step shows what you observe,
            how you respond, and how to translate discovery into delivery.
          </p>
        </div>
      </header>

      <div className="-mx-4 sm:-mx-6 md:-mx-8">
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 px-4 sm:px-6 md:px-8">
            {BA_IN_ACTION_PAGES.map((page, index) => {
              const view = page.view;
              const isActive = currentView === view;

              return (
                <button
                  key={page.view}
                  type="button"
                  onClick={() => handleNavigate(view)}
                  className="group relative min-w-[260px] text-left focus:outline-none"
                >
                  <Card
                    className={`h-full rounded-2xl border border-indigo-100 bg-white/70 px-6 py-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-indigo-900/40 dark:bg-slate-900/60 ${
                      isActive
                        ? 'ring-2 ring-offset-2 ring-indigo-400 dark:ring-offset-slate-950'
                        : 'hover:ring-1 hover:ring-indigo-200 dark:hover:ring-indigo-500/40'
                    }`}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-semibold text-white shadow-md">
                      {index + 1}
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                      {page.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Explore how a BA tackles this stage in a live project setting.
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 transition-colors group-hover:text-blue-500 dark:text-indigo-300 dark:group-hover:text-blue-300">
                      Open scenario
                      <svg
                        className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 0 1 .75-.75h9.638l-3.194-3.195a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.194-3.195H3.75A.75.75 0 0 1 3 10Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default BAInActionIndexPage;

