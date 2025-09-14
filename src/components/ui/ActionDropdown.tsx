import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  triggerLabel?: string;
  className?: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ 
  actions, 
  triggerLabel = "Actions",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getVariantStyles = (variant: string = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20';
      case 'warning':
        return 'text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20';
      case 'success':
        return 'text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20';
      default:
        return 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700';
    }
  };

  const handleActionClick = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="mr-2">{triggerLabel}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          style={{ 
            zIndex: 9999 
          }}
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`
                  w-full flex items-center px-3 py-1.5 text-sm transition-colors duration-150
                  ${getVariantStyles(action.variant)}
                  ${action.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                  first:rounded-t-lg last:rounded-b-lg
                `}
              >
                {action.icon && (
                  <span className="mr-2 flex-shrink-0">
                    {action.icon}
                  </span>
                )}
                <span className="flex-1 text-left">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;

