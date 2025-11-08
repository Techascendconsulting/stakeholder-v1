import React from 'react';
import { useApp } from '../../contexts/AppContext';

interface BreadcrumbItem {
  label: string;
  view?: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const { setCurrentView } = useApp();

  return (
    <div className={`flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.active ? (
            <span className="text-gray-400 dark:text-gray-400">{item.label}</span>
          ) : (
            <button
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.view) {
                  setCurrentView(item.view as any);
                }
              }}
              className="hover:text-gray-300 dark:hover:text-gray-300 transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};










