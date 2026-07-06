"use client";

import { format } from "date-fns";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarChartCard } from "@/components/charts/BarChartCard";
import {
  fillVtoLifetimeRange,
  toVtoTrendPoints,
} from "@/lib/charts/vtoTrend";
import type { VtoAnalytics } from "@/lib/api/salon/dashboard_api";

interface VtoSectionProps {
  vto: VtoAnalytics;
  createdAt: string;
  /** When provided, the trend is fetched across the salon lifetime regardless
   * of the active date filter — pass the lifetime VTO object here. */
  lifetimeVto?: VtoAnalytics | null;
}

function TopByGender({
  breakdown,
  color,
  emptyMessage,
}: {
  breakdown?: { male: { name: string; count: number }[]; female: { name: string; count: number }[] };
  color: string;
  emptyMessage: string;
}) {
  if (!breakdown) return null;
  const hasData =
    breakdown.male.some((m) => m.count > 0) ||
    breakdown.female.some((f) => f.count > 0);
  if (!hasData) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BarChartCard
        title="Top — Male"
        data={breakdown.male}
        color="#3b82f6"
        emptyMessage={emptyMessage}
        height={220}
      />
      <BarChartCard
        title="Top — Female"
        data={breakdown.female}
        color="#ec4899"
        emptyMessage={emptyMessage}
        height={220}
      />
    </div>
  );
}

export function VtoSection({ vto, createdAt, lifetimeVto }: VtoSectionProps) {
  const created = new Date(createdAt);
  const trend = fillVtoLifetimeRange(
    toVtoTrendPoints((lifetimeVto ?? vto).monthly_trend),
    created
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xl font-bold text-violet-600">
            {vto.total_hairstyle_trials.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Hairstyle trials</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xl font-bold text-pink-500">
            {vto.total_haircolor_trials.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Haircolor trials</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xl font-bold text-amber-500">
            {vto.total_beard_trials.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Beard trials</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Distinct customers</p>
          <p className="text-lg font-bold mt-1">{vto.distinct_customers.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Trials / customer</p>
          <p className="text-lg font-bold mt-1">{vto.sessions_per_customer_avg}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Repeat users</p>
          <p className="text-lg font-bold mt-1">{vto.repeat_users.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">New users</p>
          <p className="text-lg font-bold mt-1">{vto.new_users.toLocaleString()}</p>
        </div>
      </div>

      <TrendChart
        title="Virtual Try-On Monthly Trend"
        description={`Since ${format(created, "MMM yyyy")} · full salon history · current month projected to a 30-day pace`}
        data={trend}
        series={[
          { key: "hairstyle", color: "#8b5cf6", label: "Hairstyle" },
          { key: "haircolor", color: "#ec4899", label: "Haircolor" },
          { key: "beard", color: "#f59e0b", label: "Beard" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <BarChartCard
          title="Top Hairstyles"
          data={vto.top_hairstyles}
          color="#8b5cf6"
          emptyMessage="No hairstyle trials yet"
        />
        <BarChartCard
          title="Top Haircolors"
          data={vto.top_haircolors}
          color="#ec4899"
          emptyMessage="No haircolor trials yet"
        />
        <BarChartCard
          title="Top Beard Styles"
          data={vto.top_beards}
          color="#f59e0b"
          emptyMessage="No beard trials yet"
        />
      </div>

      <TopByGender
        breakdown={vto.top_hairstyles_by_gender}
        color="#8b5cf6"
        emptyMessage="No gender-tagged hairstyle trials yet"
      />
      <TopByGender
        breakdown={vto.top_haircolors_by_gender}
        color="#ec4899"
        emptyMessage="No gender-tagged haircolor trials yet"
      />
    </div>
  );
}
