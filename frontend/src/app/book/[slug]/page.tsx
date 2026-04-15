"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import Link from "next/link";

export default function BookingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [eventType, setEventType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [step, setStep] = useState<"calendar" | "form" | "success">("calendar");
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const et = await api.get(`/event-types/${slug}`);
        setEventType(et);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (slug) loadData();
  }, [slug]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !slug) return;
      setIsLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const availableSlots = await api.get(`/event-types/${slug}/slots?date=${dateStr}`);
        setSlots(availableSlots);
      } catch (err) { console.error(err); }
      setIsLoadingSlots(false);
    }
    loadSlots();
  }, [selectedDate, slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
       <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-white animate-spin"></div>
       </div>
    </div>
  );

  if (!eventType) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(var(--background))]">
      <h2 className="text-xl font-bold">Event not found</h2>
      <Link href="/" className="text-blue-500 mt-4 hover:underline">Return home</Link>
    </div>
  );

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDatetime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00Z`);
      const endDatetime = new Date(startDatetime.getTime() + eventType.duration * 60000);

      await api.post("/bookings/", {
        event_type_id: eventType.id,
        name: form.name,
        email: form.email,
        notes: form.notes,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startDatetime.toISOString(),
        end_time: endDatetime.toISOString(),
      });
      setStep("success");
    } catch (err: any) {
      alert(err.message || "Failed to book");
    } finally {
      setSubmitting(false);
    }
  };

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-8 px-4 flex flex-col bg-gradient-to-tr from-neutral-950 to-neutral-900">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 font-semibold text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
        <LayoutDashboard className="h-5 w-5" /> Back to Dashboard
      </Link>
      
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-[1024px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[550px]">
          
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10 p-8 flex flex-col">
            {step === "form" && (
              <button 
                className="h-10 w-10 flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))] mb-6 transition-colors group"
                onClick={() => setStep("calendar")}
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            
            <div className="text-[hsl(var(--muted-foreground))] font-medium text-sm mb-2">Mehraab Singh</div>
            <h1 className="text-2xl font-bold tracking-tight mb-6">{eventType.title}</h1>
            
            <div className="space-y-4">
              <div className="flex items-center text-[hsl(var(--muted-foreground))] text-sm font-medium">
                <Clock className="w-5 h-5 mr-3 shrink-0" />
                {eventType.duration} min
              </div>
              {selectedTime && step !== "calendar" && (
                <div className="flex items-start text-white text-sm font-medium">
                  <Calendar className="w-5 h-5 mr-3 shrink-0" />
                  <div className="flex flex-col">
                    <span>{selectedTime} - {format(new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00Z`).getTime() + eventType.duration * 60000, "HH:mm")}</span>
                    <span className="text-[hsl(var(--muted-foreground))] font-normal mt-0.5">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                </div>
              )}
            </div>

            {eventType.description && (
              <p className="mt-8 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] flex-1">
                {eventType.description}
              </p>
            )}
            
            <div className="mt-8 text-xs text-[hsl(var(--muted-foreground))] font-medium">
              Powered by Cal.com Clone
            </div>
          </div>

          <div className="w-full md:w-2/3 p-8 flex flex-col">
            {step === "calendar" && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-lg mb-8">Select a Date & Time</h3>
                
                <div className="flex flex-col md:flex-row gap-10 flex-1">
                  <div className="w-full md:w-[60%]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-medium text-sm">{format(selectedDate, "MMMM yyyy")}</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-4 uppercase tracking-wider">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 gap-y-2">
                       {dates.map((d, i) => {
                         const isSelected = format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                         return (
                           <button
                             key={i}
                             onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                             className={`h-11 w-11 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                               isSelected ? "bg-white text-black shadow-lg mx-auto" : "bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] mx-auto"
                             }`}
                           >
                             {format(d, "d")}
                           </button>
                         )
                       })}
                    </div>
                  </div>

                  <div className="w-full md:w-[40%] flex flex-col">
                    <div className="font-medium text-sm mb-4">
                      {format(selectedDate, "EEEE, MMMM d")}
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-3 max-h-[300px] fancy-scrollbar">
                      {isLoadingSlots ? (
                         <div className="text-[hsl(var(--muted-foreground))] text-sm py-4 text-center animate-pulse">Loading slots...</div>
                      ) : slots.length === 0 ? (
                        <div className="text-[hsl(var(--muted-foreground))] text-sm py-4 text-center">No slots available</div>
                      ) : (
                        slots.map(t => {
                          const displayTime = t.slice(0, 5);
                          return (
                          <div key={t} className="flex gap-2 w-full animate-in slide-in-from-bottom-2 fade-in" style={{ animationFillMode: 'both' }}>
                            <Button 
                              variant={selectedTime === displayTime ? "default" : "outline"}
                              className={`flex-1 font-medium transition-all h-11 ${selectedTime === displayTime ? 'w-1/2 rounded-md' : 'rounded-md border-[hsl(var(--border))] hover:border-white'}`}
                              onClick={() => setSelectedTime(displayTime)}
                            >
                              {displayTime}
                            </Button>
                            {selectedTime === displayTime && (
                              <Button className="w-1/2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))]/90 h-11" onClick={() => setStep("form")}>
                                Next
                              </Button>
                            )}
                          </div>
                        )})
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "form" && (
              <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-right-4 fade-in duration-300 max-w-sm mx-auto w-full">
                <h3 className="font-semibold text-xl mb-6">Enter Details</h3>
                <form onSubmit={handleBook} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none" placeholder="Share anything that will help prepare for our meeting." />
                  </div>
                  <div className="pt-4">
                     <Button type="submit" disabled={submitting} className="w-full h-11 text-base bg-white text-black hover:bg-neutral-200">
                        {submitting ? "Confirming..." : "Confirm Booking"}
                     </Button>
                  </div>
                </form>
              </div>
            )}

            {step === "success" && (
               <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 space-y-6">
                 <div className="relative">
                   <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
                   <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
                 </div>
                 <h2 className="text-3xl font-bold tracking-tight">You are scheduled</h2>
                 <p className="text-[hsl(var(--muted-foreground))]">
                   A calendar invitation has been sent to your email address.
                 </p>
                 <Button variant="outline" className="mt-8" onClick={() => window.location.href = '/'}>
                   Return to Dashboard
                 </Button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
