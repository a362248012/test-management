'use client'

import { cn } from "@/lib/utils"

export default function Loading({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}
