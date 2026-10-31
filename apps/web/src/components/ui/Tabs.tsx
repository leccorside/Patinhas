import React from 'react';
import { motion } from 'framer-motion';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps<T extends string = string> {
  options: TabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  options,
  activeId,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div
      className={`
        flex
        items-center
        gap-1.5
        overflow-x-auto
        no-scrollbar
        py-1
        ${className}
      `}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              relative
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-full
              px-4
              py-2
              text-xs
              font-bold
              transition-colors
              focus:outline-none
              ${isActive ? 'text-white' : 'bg-white text-charcoal-muted hover:text-charcoal shadow-sm'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="pill-tab-active"
                className="absolute inset-0 rounded-full bg-primary shadow-coral"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon}
              <span>{option.label}</span>
              {typeof option.count === 'number' && (
                <span
                  className={`
                    flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-extrabold
                    ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-charcoal-muted'}
                  `}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

