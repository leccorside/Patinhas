import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-3xl
        bg-white
        p-8
        text-center
        shadow-card
        border
        border-gray-100/60
        ${className}
      `}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary text-primary mb-3">
        {icon || <span className="text-2xl">🐾</span>}
      </div>

      <h4 className="text-base font-bold text-charcoal">{title}</h4>
      <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-charcoal-muted">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

