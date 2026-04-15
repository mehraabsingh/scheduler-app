"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CalendarX2, ArrowUpRight } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [bData, eData] = await Promise.all([
        api.get("/bookings"),
        api.get("/event-types")
      ]);
      // Sort bookings by date descending
      const sorted = [...bData].sort((a,b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      setBookings(sorted);
      
      const etMap: Record<string, string> = {};
      eData.forEach((et: any) => { etMap[et.id] = et.title; });
      setEventTypes(etMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cancelBooking = async (id: string) => {
    await api.patch(`/bookings/${id}/cancel`);
    loadData();
  };

  const now = new Date();
  const upcoming = bookings.filter(b => b.status !== 'cancelled' && new Date(b.start_time) >= now);
  const past = bookings.filter(b => b.status !== 'cancelled' && new Date(b.start_time) < now);
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const renderBookingList = (list: any[], showCancel: boolean) => {
    if (loading) return <div className="py-12 text-center animate-pulse">Loading bookings...</div>;
    if (list.length === 0) {
      return (
        <EmptyState 
          icon={<CalendarX2 className="w-8 h-8 text-neutral-500" />}
          title="No bookings found"
          description="You don't have any event schedule here yet."
        />
      );
    }

    return (
      <div className="space-y-4">
        {list.map(b => (
          <Card key={b.id} className="overflow-hidden hover:border-[hsl(var(--muted-foreground))]/40 transition-colors">
            <div className="flex flex-col md:flex-row shadow-sm">
              <div className="md:w-56 bg-[hsl(var(--muted))]/30 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[hsl(var(--border))]">
                <div className="text-xl font-bold tracking-tight">
                  {new Date(b.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
                <div className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
                  {new Date(b.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg">{b.name}</span>
                    <Badge variant={b.status === 'booked' ? 'default' : 'secondary'} className="capitalize">{b.status}</Badge>
                  </div>
                  <div className="text-sm font-medium">
                    {eventTypes[b.event_type_id] || "Unknown Event"}
                  </div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-2">
                    {b.email}
                  </div>
                </div>
                
                {showCancel && (
                  <Button variant="outline" size="sm" onClick={() => cancelBooking(b.id)} className="shrink-0 hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))]/30">
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Bookings</h2>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">See upcoming and past events booked with you.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderBookingList(upcoming, true)}
        </TabsContent>
        <TabsContent value="past">
          {renderBookingList(past, false)}
        </TabsContent>
        <TabsContent value="cancelled">
          {renderBookingList(cancelled, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
