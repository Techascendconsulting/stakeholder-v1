import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen
          });
        }
        if (React.isValidElement(child) && child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onSelect: (value: string) => {
              onValueChange(value);
              setIsOpen(false);
            }
          });
        }
        return child;
      })}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  isOpen?: boolean;
  className?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ 
  children, 
  onClick, 
  isOpen, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onSelect?: (value: string) => void;
}

export const SelectContent: React.FC<SelectContentProps> = ({ 
  children, 
  isOpen, 
  onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md">
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect: (value: string) => onSelect?.(value)
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ 
  value, 
  children, 
  onSelect, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => {
  return (
    <span className="block truncate">
      {children || placeholder}
    </span>
  );
};
