"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">Settings</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">Manage your profile, theme, and application preferences.</p>
      </div>

      <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10 pb-4 pt-6 px-6">
          <CardTitle className="text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] overflow-hidden shrink-0">
              <img src="https://ui-avatars.com/api/?name=Mehraab+Singh&background=random" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue="Mehraab Singh" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input defaultValue="mehraab@example.com" disabled className="opacity-70" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea className="flex min-h-[100px] w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none" defaultValue="Software Engineering Intern." />
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>

      <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10 pb-4 pt-6 px-6">
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input defaultValue="UTC (GMT)" disabled className="opacity-70" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Input defaultValue="Dark Mode (Cal.com)" disabled className="opacity-70" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notification Settings</label>
            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[hsl(var(--border))] bg-transparent" />
              <span className="text-sm">Email me when a booking is created</span>
            </div>
          </div>
          <Button variant="outline">Update Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
