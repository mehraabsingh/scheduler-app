"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, NotebookText, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/event-types", label: "Event Types", icon: Calendar },
    { href: "/dashboard/bookings", label: "Bookings", icon: NotebookText },
    { href: "/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] hidden md:block">
        <div className="p-6 pb-8">
          <Link href="/" className="flex items-center gap-3 font-semibold text-xl tracking-tight">
            <div className="bg-white text-black p-1 rounded">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            Cal.com Clone
          </Link>
        </div>
        <nav className="px-4 py-2 flex flex-col gap-1.5 text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isActive 
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" 
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))/50] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-6xl w-full mx-auto">
        <div className="flex-1 p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
