import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;


