"use client"

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// 淡入效果组件
export function FadeIn({ 
  children, 
  duration = 500, 
  delay = 0,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  duration?: number;
  delay?: number;
}) {
  return (
    <div
      className={cn("opacity-0 animate-in fade-in", className)}
      style={{
        '--tw-duration': `${duration}ms`,
        animationDelay: `${delay}ms`,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

// 滑入效果组件
export function SlideIn({
  children,
  direction = 'up',
  distance = '20px',
  duration = 500,
  delay = 0,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: string;
  duration?: number;
  delay?: number;
}) {
  const directionMap = {
    up: { initial: `translateY(${distance})`, animate: 'translateY(0)' },
    down: { initial: `translateY(-${distance})`, animate: 'translateY(0)' },
    left: { initial: `translateX(${distance})`, animate: 'translateX(0)' },
    right: { initial: `translateX(-${distance})`, animate: 'translateX(0)' },
  };
  
  return (
    <div
      className={cn("opacity-0", className)}
      style={{
        transform: directionMap[direction].initial,
        animation: `${duration}ms ease-out ${delay}ms forwards slideAndFade`,
      }}
      {...props}
    >
      <style jsx>{`
        @keyframes slideAndFade {
          from {
            opacity: 0;
            transform: ${directionMap[direction].initial};
          }
          to {
            opacity: 1;
            transform: ${directionMap[direction].animate};
          }
        }
      `}</style>
      {children}
    </div>
  );
}

// 交错显示容器
export function StaggerContainer({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  staggerDelay?: number;
  initialDelay?: number;
}) {
  const childArray = React.Children.toArray(children);
  
  return (
    <div className={cn(className)} {...props}>
      {childArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            key: `stagger-child-${index}`,
            style: {
              ...child.props.style,
              animationDelay: `${initialDelay + index * staggerDelay}ms`,
            },
          });
        }
        return child;
      })}
    </div>
  );
}

// 消息提示动画
export function ToastAnimation({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-top-2 duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 脉冲动画
export function PulseAnimation({
  children,
  className,
  active = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        active && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 页面进入动画
export function PageTransition({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
