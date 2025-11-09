import React from 'react';
import type { AppView } from '../../types';
import PageContainer from '../../components/Layout/PageContainer';
import { useApp } from '../../contexts/AppContext';
import { BA_IN_ACTION_PAGES } from '../../ba-in-action/config';

const BAInActionIndexPage: React.FC = () => {
  const { setCurrentView, currentView } = useApp();

  const handleNavigate = (view: AppView) => {
    void setCurrentView(view);
  };

  return (
    <PageContainer className="py-12 space-y-12">
      <header className="space-y-4">
        <span className="inline-flex items-center rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-200">
          BA In Action Journey
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Shadow a Business Analyst in a Real Project Workflow
          </h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Follow the real flow of how a BA understands the problem, engages stakeholders, uncovers insights, shapes solutions, and supports delivery.
          </p>
        </div>
      </header>

      <section className="-mx-4 sm:-mx-6 md:-mx-8">
        <div className="overflow-x-auto pb-8">
          <div className="flex items-center gap-6 px-4 sm:px-6 md:px-8">
            {BA_IN_ACTION_PAGES.map((page, index) => {
              const view = page.view;
              const isActive = currentView === view;
              const isLast = index === BA_IN_ACTION_PAGES.length - 1;

              return (
                <div className="flex items-center gap-6" key={page.view}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(view)}
                    aria-label={page.title}
                    className={`group relative flex min-w-[220px] items-center gap-3 rounded-2xl border px-5 py-4 text-left shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:focus:ring-offset-slate-950 ${
                      isActive
                        ? 'border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 dark:border-indigo-500/60 dark:from-indigo-900/30 dark:to-blue-900/20'
                        : 'border-transparent bg-white hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-500/40'
                    }`}
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-semibold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {page.title}
                      </span>
                      {page.description && (
                        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:block group-hover:opacity-100 group-focus-visible:block group-focus-visible:opacity-100 dark:bg-slate-800/95">
                          {page.description}
                        </span>
                      )}
                    </div>
                  </button>

                  {!isLast && (
                    <span className="inline-flex text-xl sm:text-2xl font-medium text-transparent bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text">
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default BAInActionIndexPage;

