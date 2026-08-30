"use client";

import { useState } from "react";
import { Loader2, Tag } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSalonShowPricing } from "@/lib/api/salon/salon_api";

interface PricingToggleSectionProps {
  value: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Instant-save toggle for whether the mirror kiosk shows product prices.
 */
export function PricingToggleSection({
  value,
  onChange,
  disabled,
}: PricingToggleSectionProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (enabled: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const response = await updateSalonShowPricing(enabled);
      if (!response.success) {
        setError(response.message || "Failed to save pricing setting");
        return;
      }
      onChange(enabled);
    } catch {
      setError("Failed to save pricing setting");
    } finally {
      setSaving(false);
    }
  };

  const busy = disabled || saving;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            Product pricing
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            When off, the mirror kiosk hides product prices in the catalog,
            recommendations, cart, and reports.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <Switch
            id="show-pricing"
            checked={value}
            disabled={busy}
            onCheckedChange={(enabled) => void handleToggle(enabled)}
          />
          <Label htmlFor="show-pricing" className="text-sm">
            {value ? "On" : "Off"}
          </Label>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
