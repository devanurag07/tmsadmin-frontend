"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  SalonDashboardFilters,
  DateRangePreset,
  GenderFilter,
  ServiceFilter,
} from "@/lib/salon/filters";

interface DashboardFiltersProps {
  filters: SalonDashboardFilters;
  onChange: (next: SalonDashboardFilters) => void;
  /** Hide the service selector (e.g. on service-specific pages). */
  hideService?: boolean;
}

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "overall", label: "Overall" },
  { value: "custom", label: "Custom" },
];

export function DashboardFilters({
  filters,
  onChange,
  hideService,
}: DashboardFiltersProps) {
  const update = <K extends keyof SalonDashboardFilters>(
    key: K,
    value: SalonDashboardFilters[K]
  ) => onChange({ ...filters, [key]: value });

  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Period
          </label>
          <Select
            value={filters.dateRange}
            onValueChange={(v) => update("dateRange", v as DateRangePreset)}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hideService && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground">
              Service
            </label>
            <Select
              value={filters.service}
              onValueChange={(v) => update("service", v as ServiceFilter)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                <SelectItem value="vto">Virtual Try-On</SelectItem>
                <SelectItem value="skin">Skin Analysis</SelectItem>
                <SelectItem value="hair">Hair Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Gender
          </label>
          <Select
            value={filters.gender}
            onValueChange={(v) => update("gender", v as GenderFilter)}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.dateRange === "custom" && (
          <>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                From
              </label>
              <Input
                type="date"
                value={filters.startDate ?? ""}
                onChange={(e) => update("startDate", e.target.value)}
                className="w-[150px] h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                value={filters.endDate ?? ""}
                onChange={(e) => update("endDate", e.target.value)}
                className="w-[150px] h-9"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
