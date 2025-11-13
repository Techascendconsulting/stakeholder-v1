import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { baInActionPathToView } from './config';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className = '' }) => (
  <PageContainer className={`py-10 space-y-8 ${className}`}>{children}</PageContainer>
);

export const PageTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-2">
    <p className="uppercase tracking-wider text-xs font-semibold text-purple-500">BA In Action</p>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
  </div>
);

export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Card className="border border-purple-100 dark:border-purple-900/40 shadow-sm">
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{children}</div>
    </div>
  </Card>
);

export const Placeholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-lg border border-dashed border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-900/10 p-4 text-sm text-purple-700 dark:text-purple-200">
    {text}
  </div>
);

interface NavigationButtonsProps {
  backLink?: string;
  nextLink?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ backLink, nextLink }) => {
  const { setCurrentView } = useApp();

  // Debug logging
  console.log('🔍 NavigationButtons render:', { backLink, nextLink, hasBackLink: !!backLink, hasNextLink: !!nextLink });

  const handleNavigation = (path?: string) => {
    if (!path) return;
    const targetView = baInActionPathToView[path];
    if (targetView) {
      void setCurrentView(targetView);
    } else {
      window.location.href = path;
    }
  };

  // Don't render if no links at all
  if (!backLink && !nextLink) {
    console.warn('⚠️ NavigationButtons: No links provided, returning null');
    return null;
  }

  console.log('✅ NavigationButtons: Rendering buttons', { backLink, nextLink });

  // Force render test - always show something if we have at least one link
  const hasAnyLink = backLink || nextLink;
  console.log('🔍 NavigationButtons: hasAnyLink =', hasAnyLink);

  if (!hasAnyLink) {
    console.warn('⚠️ NavigationButtons: No links at all, returning null');
    return null;
  }

  return (
    <div 
      className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-8 mb-20 w-full relative z-50" 
      style={{ 
        minHeight: '80px',
        backgroundColor: 'transparent',
        position: 'relative'
      }}
      data-testid="navigation-buttons"
    >
      {backLink ? (
        <Button
          variant="outline"
          className="w-full sm:w-auto min-w-[120px] border-2 border-gray-300"
          onClick={() => {
            console.log('🖱️ Previous button clicked, navigating to:', backLink);
            handleNavigation(backLink);
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      ) : (
        <div className="text-sm text-gray-400">No previous page</div>
      )}
      {nextLink ? (
        <Button
          className="w-full sm:w-auto min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-700 shadow-lg"
          onClick={() => {
            console.log('🖱️ Next button clicked, navigating to:', nextLink);
            handleNavigation(nextLink);
          }}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <div className="text-sm text-gray-400">No next page</div>
      )}
    </div>
  );
};

