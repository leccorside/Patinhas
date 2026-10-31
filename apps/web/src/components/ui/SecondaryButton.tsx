import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'teal' | 'outline' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SecondaryButton({
  children,
  icon,
  variant = 'teal',
  isLoading = false,
  fullWidth = true,
  size = 'md',
  className = '',
  disabled,
  ...props
}: SecondaryButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-4 text-xs font-semibold gap-1.5',
    md: 'py-3.5 px-6 text-sm font-bold gap-2',
    lg: 'py-4 px-8 text-base font-bold gap-2.5',
  };

  const variantClasses = {
    teal: 'bg-secondary text-white shadow-teal hover:bg-secondary-dark active:scale-[0.98]',
    outline: 'border border-gray-200 bg-white text-charcoal hover:bg-gray-50 active:scale-[0.98]',
    ghost: 'bg-transparent text-charcoal hover:bg-black/5 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        transition-all
        duration-200
        disabled:opacity-50
        disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
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
        </>
      )}
    </button>
  );
}

export default SecondaryButton;

