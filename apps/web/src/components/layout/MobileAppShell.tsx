import React, { ReactNode } from 'react';

interface MobileAppShellProps {
  children: ReactNode;
  className?: string;
}

export function MobileAppShell({ children, className = '' }: MobileAppShellProps) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-background-desktop antialiased">
      <div
        id="mobile-app-root"
        className={`
          relative
          flex
          min-h-dvh
          w-full
          max-w-mobile
          flex-col
          overflow-x-clip
          bg-background
          text-charcoal
          shadow-[0_0_50px_rgba(0,0,0,0.12)]
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}

export default MobileAppShell;

