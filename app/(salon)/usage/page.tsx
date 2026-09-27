"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ServiceTabsList, ServiceTabsTrigger } from "@/components/ui/service-tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState, ErrorState } from "@/components/layout/LoadingState";
import { StatCard } from "@/components/kpi/StatCard";
import { DashboardFilters } from "@/components/salon/DashboardFilters";
import { VtoSection } from "@/components/salon/VtoSection";
import { ServiceTrendsSection } from "@/components/salon/ServiceTrendsSection";
import { ServiceAnalysisSection } from "@/components/salon/ServiceAnalysisSection";
import { useSalonDashboard } from "@/hooks/useSalonDashboard";
import {
  DEFAULT_SALON_FILTERS,
  SalonDashboardFilters,
  dateRangeDescription,
} from "@/lib/salon/filters";
import { fetchSalonDashboard, SalonDashboard, VtoAnalytics } from "@/lib/api/salon/dashboard_api";
import { Activity, MapPin, Scissors, Sparkles, Users, Waves, Zap } from "lucide-react";

export default function UsagePage() {
  const [filters, setFilters] = useState<SalonDashboardFilters>(DEFAULT_SALON_FILTERS);
  const { data, loading, error, reload } = useSalonDashboard(filters);
  const [lifetimeVto, setLifetimeVto] = useState<VtoAnalytics | null>(null);

  // Fetch the VTO trend across the salon's full lifetime (overall), independent
  // of the active date filter, so the trend chart always shows full history.
  useEffect(() => {
    let cancelled = false;
    fetchSalonDashboard({ ...DEFAULT_SALON_FILTERS, dateRange: "overall" })
      .then((d: SalonDashboard) => {
        if (!cancelled) setLifetimeVto(d.virtual_tryon);
      })
      .catch(() => {
        if (!cancelled) setLifetimeVto(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !data) return <LoadingState message="Loading salon dashboard..." />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <ErrorState message="No dashboard data available" onRetry={reload} />;

  const { salon, summary, virtual_tryon, skin_analysis, hair_analysis } = data;

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={salon.name}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {salon.city ? `${salon.city}, ${salon.state}` : salon.state || "—"} · Code: {salon.code}
            </span>
            <Badge variant={salon.is_active ? "default" : "secondary"} className="text-xs">
              {salon.is_active ? "Active" : "Inactive"}
            </Badge>
          </span>
        }
        icon={Activity}
      />

      <DashboardFilters filters={filters} onChange={setFilters} />

      <p className="text-xs text-muted-foreground -mt-2">
        Showing data for: <span className="font-medium text-foreground">{dateRangeDescription(filters)}</span>
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <StatCard label="Total Customers" value={summary.total_customers} icon={Users} accent="#6366f1" />
        <StatCard label="Total Sessions" value={summary.total_sessions} icon={Zap} accent="#8b5cf6" />
      </div>

      <ServiceTrendsSection
        vto={lifetimeVto ?? virtual_tryon}
        createdAt={salon.created_at}
        salonTrend={data.monthly_trend}
      />

      <Tabs defaultValue="vto" className="space-y-6">
        <ServiceTabsList>
          <ServiceTabsTrigger value="vto">
            <Scissors />
            Virtual Try-On
          </ServiceTabsTrigger>
          <ServiceTabsTrigger value="skin">
            <Sparkles />
            Skin Analysis
          </ServiceTabsTrigger>
          <ServiceTabsTrigger value="hair">
            <Waves />
            Hair Analysis
          </ServiceTabsTrigger>
        </ServiceTabsList>

        <TabsContent value="vto" className="space-y-6">
          <VtoSection vto={virtual_tryon} createdAt={salon.created_at} lifetimeVto={lifetimeVto} />
        </TabsContent>

        <TabsContent value="skin" className="space-y-6">
          <ServiceAnalysisSection
            analysis={skin_analysis}
            accent="#06b6d4"
            kind="skin"
            monthlyTrend={data.monthly_trend}
          />
        </TabsContent>

        <TabsContent value="hair" className="space-y-6">
          <ServiceAnalysisSection
            analysis={hair_analysis}
            accent="#f59e0b"
            kind="hair"
            monthlyTrend={data.monthly_trend}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
