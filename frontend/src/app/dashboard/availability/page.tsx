"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Plus, Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAvail = async () => {
    try {
      const data = await api.get("/availabilities");
      setAvailabilities(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvail();
  }, []);

  const addAvail = async (day_of_week: number) => {
    await api.post("/availabilities/", {
      day_of_week,
      start_time: "09:00:00",
      end_time: "17:00:00",
      timezone: "UTC"
    });
    loadAvail();
  };

  const removeAvail = async (id: string) => {
    await api.delete(`/availabilities/${id}`);
    loadAvail();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Availability</h2>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Configure times when you are available for bookings.</p>
      </div>

      <Card className="overflow-hidden border-[hsl(var(--border))]">
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
          <div className="font-semibold text-lg">Weekly hours</div>
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors">
            <Globe className="h-4 w-4" />
            UTC / GMT
          </div>
        </div>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-[hsl(var(--muted-foreground))] animate-pulse">Loading schedules...</div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {DAYS.map((day, index) => {
                const dayAvail = availabilities.find((a) => a.weekday === index);
                const isActive = dayAvail ? dayAvail.enabled : false;

                const toggleDay = async (checked: boolean) => {
                  if (dayAvail) {
                    await api.put(`/availabilities/${dayAvail.id}`, { enabled: checked });
                  } else {
                    await api.post("/availabilities/", {
                      weekday: index,
                      enabled: true,
                      start_time: "09:00:00",
                      end_time: "17:00:00",
                      timezone: "UTC"
                    });
                  }
                  loadAvail();
                };

                const updateTime = async (id: string, field: "start_time" | "end_time", val: string) => {
                  await api.put(`/availabilities/${id}`, { [field]: val + ":00" });
                  loadAvail();
                };

                return (
                  <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center p-5 sm:p-6 transition-colors hover:bg-[hsl(var(--muted))]/10">
                    <div className="flex items-center gap-4 w-48 mb-4 sm:mb-0">
                      <Switch 
                        checked={isActive} 
                        onCheckedChange={toggleDay} 
                      />
                      <span className={`font-medium tracking-tight ${isActive ? '' : 'text-[hsl(var(--muted-foreground))]'}`}>{day}</span>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      {isActive && dayAvail ? (
                          <div className="flex items-center gap-3">
                            <Input 
                              type="time" 
                              defaultValue={dayAvail.start_time.slice(0, 5)} 
                              onBlur={(e) => updateTime(dayAvail.id, "start_time", e.target.value)}
                              className="w-28 font-mono text-sm bg-[hsl(var(--background))]" 
                            />
                            <span className="text-[hsl(var(--muted-foreground))]">—</span>
                            <Input 
                              type="time" 
                              defaultValue={dayAvail.end_time.slice(0, 5)} 
                              onBlur={(e) => updateTime(dayAvail.id, "end_time", e.target.value)}
                              className="w-28 font-mono text-sm bg-[hsl(var(--background))]" 
                            />
                          </div>
                      ) : (
                        <div className="h-10 flex items-center text-sm font-medium text-[hsl(var(--muted-foreground))]">Unavailable</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
