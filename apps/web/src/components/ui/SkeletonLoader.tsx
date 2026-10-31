import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const variantClasses = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded-md h-3.5',
  };

  return (
    <div
      className={`
        animate-pulse
        bg-gray-200/80
        ${variantClasses[variant]}
        ${className}
      `}
    />
  );
}

export function PetCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-card border border-gray-100">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="mt-3 px-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-36" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

