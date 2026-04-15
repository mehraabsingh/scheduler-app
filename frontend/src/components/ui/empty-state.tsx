import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]/50", className)}
      {...props}
    >
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 mb-6 max-w-sm text-sm text-[hsl(var(--muted-foreground))] leading-tight">
        {description}
      </p>
      {action}
    </div>
  )
}
