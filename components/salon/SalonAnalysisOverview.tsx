"use client";

import { useState } from "react";
import { DashboardFilters } from "@/components/salon/DashboardFilters";
import { ServiceAnalysisSection } from "@/components/salon/ServiceAnalysisSection";
import { LoadingState, ErrorState } from "@/components/layout/LoadingState";
import { useSalonDashboard } from "@/hooks/useSalonDashboard";
import {
  DEFAULT_SALON_FILTERS,
  SalonDashboardFilters,
  dateRangeDescription,
} from "@/lib/salon/filters";

interface SalonAnalysisOverviewProps {
  kind: "skin" | "hair";
}

/**
 * Aggregated salon-wide analysis metrics (totals, parameter averages, score
 * tally) sourced from the salon dashboard endpoint — the same data the
 * superadmin sees for this salon. Shown above the per-record tables on the
 * skin / hair analysis pages.
 */
export function SalonAnalysisOverview({ kind }: SalonAnalysisOverviewProps) {
  const [filters, setFilters] = useState<SalonDashboardFilters>({
    ...DEFAULT_SALON_FILTERS,
    service: kind,
  });
  const { data, loading, error, reload } = useSalonDashboard(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Salon-wide aggregates</h2>
          <p className="text-xs text-muted-foreground">
            Aggregated {kind} analysis metrics across all sessions
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {dateRangeDescription(filters)}
        </span>
      </div>

      <DashboardFilters filters={filters} onChange={setFilters} hideService />

      {loading ? (
        <LoadingState message={`Loading ${kind} aggregates...`} />
      ) : error || !data ? (
        <ErrorState
          message={error ?? "No aggregated data available"}
          onRetry={reload}
        />
      ) : (
        <ServiceAnalysisSection
          analysis={kind === "skin" ? data.skin_analysis : data.hair_analysis}
          accent={kind === "skin" ? "#06b6d4" : "#f59e0b"}
          kind={kind}
        />
      )}
    </div>
  );
}
