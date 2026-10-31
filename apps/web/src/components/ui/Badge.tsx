import React, { ReactNode } from 'react';

export type BadgeVariant = 'coral' | 'teal' | 'apricot' | 'ice' | 'gray' | 'success' | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export function Badge({
  children,
  variant = 'ice',
  icon,
  size = 'md',
  className = '',
  onClick,
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    coral: 'bg-primary/10 text-primary border border-primary/20',
    teal: 'bg-secondary/10 text-[#006A63] border border-secondary/20',
    apricot: 'bg-tertiary text-primary border border-[#FFE0B2]',
    ice: 'bg-surface-variant text-[#0277BD] border border-[#BBDEFB]/60',
    gray: 'bg-gray-100 text-charcoal border border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold gap-1',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex
        items-center
        rounded-full
        tracking-tight
        transition-all
        ${onClick ? 'active:scale-95 cursor-pointer hover:opacity-90' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </Component>
  );
}

export default Badge;

