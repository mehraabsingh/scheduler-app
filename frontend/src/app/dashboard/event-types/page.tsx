"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Copy, Clock, CalendarIcon, Settings, Settings2, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newType, setNewType] = useState({ id: "", title: "", description: "", duration: 30, slug: "" });
  const [isEdit, setIsEdit] = useState(false);

  const loadEvents = async () => {
    try {
      const data = await api.get("/event-types");
      setEventTypes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("loadEvents error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSave = async () => {
    console.log("[handleSave] triggered, isEdit:", isEdit, "payload:", newType);

    // Basic validation
    if (!newType.title.trim()) {
      setSaveError("Title is required.");
      return;
    }
    if (!newType.slug.trim()) {
      setSaveError("URL slug is required.");
      return;
    }
    if (!newType.duration || newType.duration < 1) {
      setSaveError("Duration must be at least 1 minute.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      title: newType.title.trim(),
      description: newType.description.trim(),
      duration: Number(newType.duration),
      slug: newType.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    };

    console.log("[handleSave] sending payload:", payload);

    try {
      if (isEdit) {
        console.log("[handleSave] PUT /event-types/", newType.id);
        await api.put(`/event-types/${newType.id}`, payload);
      } else {
        console.log("[handleSave] POST /event-types/");
        await api.post("/event-types/", payload);
      }
      console.log("[handleSave] success — reloading events");
      setShowModal(false);
      setNewType({ id: "", title: "", description: "", duration: 30, slug: "" });
      setIsEdit(false);
      await loadEvents();
    } catch (e: any) {
      console.error("[handleSave] error:", e);
      setSaveError(e?.message || "Failed to save. Check browser console for details.");
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setIsEdit(false);
    setSaveError(null);
    setNewType({ id: "", title: "", description: "", duration: 30, slug: "" });
    setShowModal(true);
  };

  const openEdit = (et: any) => {
    setIsEdit(true);
    setSaveError(null);
    setNewType({ id: et.id, title: et.title || "", description: et.description || "", duration: et.duration || 30, slug: et.slug || "" });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this event type? This action cannot be undone.")) {
      try {
        await api.delete(`/event-types/${id}`);
        await loadEvents();
      } catch (e: any) {
        alert("Delete failed: " + (e?.message || "Unknown error"));
      }
    }
  };

  const copyToClipboard = (slug: string) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${base}/book/${slug}`);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">Event Types</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Create events to share for people to book on your calendar.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button variant="outline" className="h-[38px] px-4 hidden sm:flex">
              <Settings2 className="w-4 h-4 mr-2 text-[hsl(var(--muted-foreground))]" />
              Settings
            </Button>
          </Link>
          <Button onClick={openNew} className="h-[38px] px-4 font-medium transition-all shadow-sm">
            <Plus className="mr-[6px] h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0">
              <img src="https://ui-avatars.com/api/?name=Mehraab+Singh&background=random" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Mehraab Singh</h3>
              <span className="text-[hsl(var(--muted-foreground))] text-xs px-2 py-0.5 rounded-full border border-[hsl(var(--border))]">scheduler-app</span>
            </div>
          </div>
        </div>

        {/* Event Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-44 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] animate-pulse" />)}
          </div>
        ) : eventTypes.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />}
            title="No event types yet"
            description="Create your first event type to start allowing people to book time with you easily."
            action={
              <Button onClick={openNew} variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-4xl">
            {eventTypes.map((et) => (
              <div key={et.id} className="group relative flex flex-col justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]/40 rounded-xl transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md">
                {/* Card Content */}
                <div className="p-5 pt-5 pb-0 relative z-0">
                  <div className="flex justify-between items-start">
                    <Link href={`/book/${et.slug}`} target="_blank" className="hover:underline underline-offset-4 decoration-[hsl(var(--border))] hover:decoration-[hsl(var(--foreground))] decoration-2 transition-all">
                      <h3 className="font-semibold text-base text-[hsl(var(--foreground))]">{et.title}</h3>
                    </Link>
                    <Switch checked={!!et.is_active} onCheckedChange={async () => {
                      try {
                        await api.put(`/event-types/${et.id}`, { is_active: !et.is_active });
                        await loadEvents();
                      } catch (e: any) {
                        alert("Toggle failed: " + e?.message);
                      }
                    }} className="scale-90 shadow-sm" />
                  </div>
                  <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1.5 leading-snug">/{et.slug}</p>
                  <div className="flex items-center gap-5 mt-4 text-[13px] font-medium text-[hsl(var(--muted-foreground))]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-70" /> {et.duration}m
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-5 px-3 py-2.5 bg-[hsl(var(--muted))]/10 border-t border-[hsl(var(--border))]/50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" onClick={() => copyToClipboard(et.slug)}>
                      <Copy className="h-3.5 w-3.5 mr-1.5 opacity-70" /> Copy link
                    </Button>
                    <Link href={`/book/${et.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border))] border border-transparent">
                        View Booking Page
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(et)} className="h-8 w-8 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(et.id)} className="h-8 w-8 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 group/delete">
                      <Trash2 className="h-3.5 w-3.5 group-hover/delete:scale-110 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={() => { if (!saving) setShowModal(false); }} />
          <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex justify-between items-center">
              <h3 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
                {isEdit ? "Edit event type" : "Add a new event type"}
              </h3>
              <button onClick={() => { if (!saving) setShowModal(false); }} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Error Banner */}
              {saveError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Title <span className="text-red-400">*</span></label>
                <Input
                  value={newType.title}
                  onChange={e => { setNewType({ ...newType, title: e.target.value }); setSaveError(null); }}
                  placeholder="e.g. 15 Min Meeting"
                  className="h-10 border-[hsl(var(--border))] bg-transparent shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">URL Slug <span className="text-red-400">*</span></label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))] sm:text-sm whitespace-nowrap">
                    /book/
                  </span>
                  <Input
                    value={newType.slug}
                    onChange={e => { setNewType({ ...newType, slug: e.target.value }); setSaveError(null); }}
                    placeholder="15min"
                    className="flex-1 min-w-0 rounded-none rounded-r-md border-[hsl(var(--border))] bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Duration</label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={newType.duration}
                    onChange={e => setNewType({ ...newType, duration: parseInt(e.target.value) || 30 })}
                    className="h-10 bg-transparent pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-[hsl(var(--muted-foreground))]">
                    mins
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Description</label>
                <textarea
                  className="flex min-h-[90px] w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
                  value={newType.description}
                  onChange={e => setNewType({ ...newType, description: e.target.value })}
                  placeholder="Brief description of this event..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[hsl(var(--muted))]/30 border-t border-[hsl(var(--border))] flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={saving} className="h-9 font-medium">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="h-9 px-6 font-medium shadow-sm min-w-[80px]">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
