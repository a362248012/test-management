import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  withPadding?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  size = 'default',
  centered = false,
  withPadding = true,
  ...props
}: ResponsiveContainerProps) {
  const sizeClasses = {
    default: 'max-w-7xl',
    sm: 'max-w-3xl',
    lg: 'max-w-6xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        withPadding && 'px-4 sm:px-6 md:px-8',
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
