import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  showArrow?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PrimaryButton({
  children,
  icon,
  showArrow = false,
  isLoading = false,
  fullWidth = true,
  size = 'md',
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-4 text-xs font-semibold gap-1.5',
    md: 'py-3.5 px-6 text-sm font-bold gap-2',
    lg: 'py-4 px-8 text-base font-bold gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        relative
        inline-flex
        items-center
        justify-center
        rounded-full
        bg-gradient-to-r
        from-[#FF8A65]
        to-[#FF7043]
        text-white
        shadow-coral
        transition-all
        duration-200
        active:scale-[0.98]
        hover:opacity-95
        disabled:opacity-50
        disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          <span>{children}</span>
          {showArrow && (
            <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-white">
              <ArrowRight size={14} />
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default PrimaryButton;

