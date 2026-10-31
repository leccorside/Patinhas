import React, { ReactNode } from 'react';

interface SpecBadgeProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'apricot' | 'white' | 'ice';
  className?: string;
}

export function SpecBadge({
  label,
  value,
  icon,
  variant = 'apricot',
  className = '',
}: SpecBadgeProps) {
  const variantClasses = {
    apricot: 'bg-tertiary text-charcoal border border-[#FFE0B2]/60',
    white: 'bg-white text-charcoal shadow-card border border-gray-100',
    ice: 'bg-surface-variant text-charcoal border border-[#BBDEFB]/40',
  };

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        p-3
        text-center
        transition-all
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <div className="mb-1 text-primary">{icon}</div>}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-muted">
        {label}
      </span>
      <span className="mt-0.5 text-sm font-extrabold text-charcoal">
        {value}
      </span>
    </div>
  );
}

export default SpecBadge;

