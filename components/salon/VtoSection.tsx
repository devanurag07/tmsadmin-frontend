"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fillVtoLifetimeRange,
  toVtoTrendPoints,
} from "@/lib/charts/vtoTrend";
import type { VtoAnalytics } from "@/lib/api/salon/dashboard_api";

const MAKEUP_TABS = [
  { value: "all", label: "All" },
  { value: "combo", label: "Combo" },
  { value: "bridal", label: "Bridal" },
] as const;

type MakeupTab = (typeof MAKEUP_TABS)[number]["value"];

interface VtoSectionProps {
  vto: VtoAnalytics;
  createdAt: string;
  /** When provided, the trend is fetched across the salon lifetime regardless
   * of the active date filter — pass the lifetime VTO object here. */
  lifetimeVto?: VtoAnalytics | null;
}

function chartRows(items: { name: string; count: number }[]) {
  const merged = new Map<string, { name: string; count: number }>();
  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    if (!key) continue;
    const existing = merged.get(key);
    if (existing) {
      existing.count += item.count;
    } else {
      merged.set(key, { name: item.name.trim(), count: item.count });
    }
  }
  return [...merged.values()].sort((a, b) => b.count - a.count);
}

function GenderTopSection({
  title,
  description,
  menTitle,
  womenTitle,
  breakdown,
  emptyMessage,
}: {
  title: string;
  description: string;
  menTitle: string;
  womenTitle: string;
  breakdown?: { male: { name: string; count: number }[]; female: { name: string; count: number }[] };
  emptyMessage: string;
}) {
  if (!breakdown) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title={menTitle}
          data={chartRows(breakdown.male)}
          emptyMessage={emptyMessage}
        />
        <BarChartCard
          title={womenTitle}
          data={chartRows(breakdown.female)}
          color="#ec4899"
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}

function TopBeardAndMakeup({ vto }: { vto: VtoAnalytics }) {
  const [makeupTab, setMakeupTab] = useState<MakeupTab>("all");
  const makeupChartData = chartRows(
    vto.top_makeup_by_type?.[makeupTab] ?? vto.top_makeup ?? []
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BarChartCard
        title="Top Beard Styles"
        data={chartRows(vto.top_beards)}
        color="#f59e0b"
        emptyMessage="No beard trials yet"
      />
      <BarChartCard
        title="Top Makeup Try-On"
        data={makeupChartData}
        color="#f43f5e"
        emptyMessage="No makeup try-ons yet"
        actions={
          <Tabs
            value={makeupTab}
            onValueChange={(v) => setMakeupTab(v as MakeupTab)}
          >
            <TabsList className="h-8">
              {MAKEUP_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-2.5"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xl font-bold text-rose-500">
            {(vto.total_makeup_trials ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Makeup Try-On</p>
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
          { key: "makeup", color: "#f43f5e", label: "Makeup Try-On" },
        ]}
      />

      {vto.top_hairstyles_by_gender ? (
        <GenderTopSection
          title="Top Hairstyles by Gender"
          description="Most popular styles tried, split by customer gender"
          menTitle="Top Hairstyles — Men"
          womenTitle="Top Hairstyles — Women"
          breakdown={vto.top_hairstyles_by_gender}
          emptyMessage="No gender-tagged hairstyle trials yet"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartCard
            title="Top Hairstyles"
            description="Most popular styles tried"
            data={chartRows(vto.top_hairstyles)}
            emptyMessage="No hairstyle trials yet"
          />
          <BarChartCard
            title="Top Haircolors"
            data={chartRows(vto.top_haircolors)}
            color="#ec4899"
            emptyMessage="No haircolor trials yet"
          />
        </div>
      )}

      {vto.top_haircolors_by_gender ? (
        <GenderTopSection
          title="Top Haircolors by Gender"
          description="Most popular colors tried, split by customer gender"
          menTitle="Top Haircolors — Men"
          womenTitle="Top Haircolors — Women"
          breakdown={vto.top_haircolors_by_gender}
          emptyMessage="No gender-tagged haircolor trials yet"
        />
      ) : null}

      <TopBeardAndMakeup vto={vto} />
    </div>
  );
}
