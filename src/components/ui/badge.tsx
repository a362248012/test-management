"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "secondary";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-destructive text-destructive-foreground": variant === "destructive",
          "border-transparent bg-green-500 text-white": variant === "success",
          "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
        },
        className
      )}
      {...props}
    />
  );
}
