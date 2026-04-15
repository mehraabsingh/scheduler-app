import * as React from "react"
import { cn } from "@/lib/utils"

export const Tabs = ({ children, defaultValue, className }: { children: React.ReactNode, defaultValue: string, className?: string }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  )
}

export const TabsList = ({ children, className, activeTab, setActiveTab }: any) => {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-[hsl(var(--muted))] p-1 text-[hsl(var(--muted-foreground))]", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  )
}

export const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: any) => {
  const isActive = activeTab === value;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-[hsl(var(--background))] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
        isActive ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm" : "",
        className
      )}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, children, className, activeTab }: any) => {
  if (value !== activeTab) return null;
  return (
    <div className={cn("mt-2 ring-offset-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}
