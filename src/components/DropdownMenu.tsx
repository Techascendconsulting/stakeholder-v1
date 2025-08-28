import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  tooltip?: string;
}

interface DropdownMenuProps {
  label: string;
  icon?: React.ReactNode;
  items: DropdownItem[];
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  icon,
  items,
  variant = 'default',
  className = ''
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
      default:
        return 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300';
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-all duration-200 ${getVariantStyles()} ${
          isOpen ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="font-medium">{label}</span>
        <ChevronDown 
          size={12} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {item.divider && index > 0 && (
                  <div className="border-t border-gray-100 my-1" />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`w-full flex items-center space-x-2.5 px-3 py-1.5 text-xs text-left transition-colors ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 w-3.5 h-3.5">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
