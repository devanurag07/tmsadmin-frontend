"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSalonShowStylists } from "@/lib/api/salon/salon_api";
import {
  Stylist,
  createStylist,
  deleteStylist,
  fetchStylists,
  renameStylist,
} from "@/lib/api/salon/stylists_api";

interface StylistsSectionProps {
  value: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Stylist names for the mirror kiosk. When on, the kiosk home screen asks
 * which stylist is taking the consultation before it can begin.
 */
export function StylistsSection({ value, onChange, disabled }: StylistsSectionProps) {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStylists().then((res) => {
      if (cancelled) return;
      if (res.success) setStylists(res.data);
      else setError(res.message);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setSavingToggle(true);
    setError(null);
    try {
      const response = await updateSalonShowStylists(enabled);
      if (!response.success) {
        setError(response.message || "Failed to save stylist setting");
        return;
      }
      onChange(enabled);
    } finally {
      setSavingToggle(false);
    }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusyId("new");
    setError(null);
    const res = await createStylist(name);
    setBusyId(null);
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    const added = res.data;
    setStylists((prev) =>
      [...prev, added].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNewName("");
  };

  const handleRename = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    setBusyId(id);
    setError(null);
    const res = await renameStylist(id, name);
    setBusyId(null);
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    const renamed = res.data;
    setStylists((prev) =>
      prev
        .map((s) => (s.id === id ? renamed : s))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    setBusyId(id);
    setError(null);
    const res = await deleteStylist(id);
    setBusyId(null);
    if (!res.success) {
      setError(res.message);
      return;
    }
    setStylists((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleBusy = disabled || savingToggle;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <UserRound className="h-4 w-4" />
            Stylist selection
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            When on, the mirror kiosk home screen asks which stylist is taking
            the consultation before it can begin. Consultations per stylist
            appear on your dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          {savingToggle ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <Switch
            id="show-stylists"
            checked={value}
            disabled={toggleBusy}
            onCheckedChange={(enabled) => void handleToggle(enabled)}
          />
          <Label htmlFor="show-stylists" className="text-sm">
            {value ? "On" : "Off"}
          </Label>
        </div>
      </div>

      {value && !loading && stylists.length === 0 ? (
        <p className="text-xs text-amber-600">
          Add at least one stylist name for the kiosk to show the selection.
        </p>
      ) : null}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAdd();
        }}
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Stylist name"
          maxLength={100}
          disabled={disabled || busyId === "new"}
        />
        <Button
          type="submit"
          disabled={disabled || busyId === "new" || !newName.trim()}
        >
          {busyId === "new" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </form>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading stylists...
        </p>
      ) : stylists.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {stylists.map((stylist) => (
            <li key={stylist.id} className="flex items-center gap-2 px-3 py-2">
              {editingId === stylist.id ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleRename(stylist.id);
                  }}
                >
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength={100}
                    autoFocus
                    className="h-8"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={busyId === stylist.id || !editingName.trim()}
                    aria-label="Save name"
                  >
                    {busyId === stylist.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm">{stylist.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={disabled || busyId !== null}
                    onClick={() => {
                      setEditingId(stylist.id);
                      setEditingName(stylist.name);
                    }}
                    aria-label={`Rename ${stylist.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={disabled || busyId !== null}
                    onClick={() => void handleDelete(stylist.id)}
                    aria-label={`Remove ${stylist.name}`}
                  >
                    {busyId === stylist.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
