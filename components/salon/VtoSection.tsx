"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TrendChart } from "@/components/charts/TrendChart";
import { ServiceMetricRow, SERVICE_TREND_SERIES } from "@/components/kpi/ServiceMetricRow";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChartCard } from "@/components/charts/BarChartCard";
import {
  CHART_MONTH_OPTIONS,
  ChartMonthOption,
  fillVtoLifetimeRange,
  prepareVtoMonthlyTrend,
  toVtoTrendPoints,
  withSkinHairTrend,
} from "@/lib/charts/vtoTrend";
import type { SalonDashboard, VtoAnalytics } from "@/lib/api/salon/dashboard_api";

interface VtoSectionProps {
  vto: VtoAnalytics;
  createdAt: string;
  /** When provided, the trend is fetched across the salon lifetime regardless
   * of the active date filter — pass the lifetime VTO object here. */
  lifetimeVto?: VtoAnalytics | null;
  /** Salon-level monthly trend; supplies the skin / hair lines. */
  salonTrend?: SalonDashboard["monthly_trend"];
}

function chartRows(items: { name: string; count: number }[] | undefined) {
  const merged = new Map<string, { name: string; count: number }>();
  for (const item of items ?? []) {
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
  const byType = vto.top_makeup_by_type;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BarChartCard
        title="Top Beard Styles"
        data={chartRows(vto.top_beards)}
        color="#f59e0b"
        emptyMessage="No beard trials yet"
      />
      <BarChartCard
        title="Top Lipstick"
        data={chartRows(byType?.lipstick)}
        color="#f43f5e"
        emptyMessage="No lipstick trials yet"
      />
      <BarChartCard
        title="Top Blush"
        data={chartRows(byType?.blush)}
        color="#fb7185"
        emptyMessage="No blush trials yet"
      />
      <BarChartCard
        title="Top Eyeshadow"
        data={chartRows(byType?.eyeshadow)}
        color="#e11d48"
        emptyMessage="No eyeshadow trials yet"
      />
      <BarChartCard
        title="Top Bridal Looks"
        data={chartRows(byType?.bridal)}
        color="#c026d3"
        emptyMessage="No bridal makeup trials yet"
      />
    </div>
  );
}

function sumCounts(items: { name: string; count: number }[] | undefined): number {
  return (items ?? []).reduce((sum, row) => sum + (row.count || 0), 0);
}

/** Prefer API bridal total; fall back to ranked bridal looks when the API
 * still rolls bridal into makeup (older backends). */
function bridalAndMakeupTotals(vto: VtoAnalytics): {
  bridal: number;
  makeup: number;
} {
  const bridalLooks = sumCounts(vto.top_makeup_by_type?.bridal);
  const apiBridal = vto.total_bridal_trials ?? 0;
  const apiMakeup = vto.total_makeup_trials ?? 0;

  if (apiBridal > 0) {
    return { bridal: apiBridal, makeup: apiMakeup };
  }
  if (bridalLooks > 0) {
    return {
      bridal: bridalLooks,
      makeup: Math.max(0, apiMakeup - bridalLooks),
    };
  }
  return { bridal: 0, makeup: apiMakeup };
}

export function VtoSection({ vto, createdAt, lifetimeVto, salonTrend }: VtoSectionProps) {
  const [serviceChartMonths, setServiceChartMonths] = useState<ChartMonthOption>(6);
  const created = new Date(createdAt);
  const trendSource = lifetimeVto ?? vto;
  const trend = fillVtoLifetimeRange(
    toVtoTrendPoints(trendSource.monthly_trend),
    created
  );
  const { bridal: bridalTotal, makeup: makeupTotal } = bridalAndMakeupTotals(vto);
  const trendHasBridal = trend.some((point) => (point.bridal ?? 0) > 0);
  const bridalTrendPending = bridalTotal > 0 && !trendHasBridal;
  const usageByService = vto.usage_by_service ?? {
    hairstyle: vto.total_hairstyle_trials,
    haircolor: vto.total_haircolor_trials,
    beard: vto.total_beard_trials,
    makeup: makeupTotal,
    bridal: bridalTotal,
  };

  // Unprojected lifetime trends; prepareVtoMonthlyTrend slices and projects them.
  const usageTrend = withSkinHairTrend(
    fillVtoLifetimeRange(toVtoTrendPoints(trendSource.monthly_trend), created, new Date(), false),
    salonTrend
  );
  const customerTrend = trendSource.monthly_customer_trend
    ? withSkinHairTrend(
        fillVtoLifetimeRange(
          toVtoTrendPoints(trendSource.monthly_customer_trend),
          created,
          new Date(),
          false
        ),
        salonTrend
      )
    : null;
  const serviceRangeLabel = `last ${serviceChartMonths} month${serviceChartMonths > 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">
      <ServiceMetricRow
        title="Services by Customer"
        subtitle="Each customer counts once per service tried in a session"
        values={vto.customers_by_service}
      />
      <ServiceMetricRow
        title="Services by Usage"
        subtitle="Every try-on counted · avg uses per customer below"
        values={usageByService}
        subValues={vto.avg_usage_by_service}
        formatSub={(v) => `avg ${v.toFixed(1)} / customer`}
      />

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
          { key: "bridal", color: "#c026d3", label: "Bridal Makeup" },
        ]}
      />
      {bridalTrendPending && (
        <p className="text-xs text-muted-foreground -mt-4">
          Bridal looks are counted in the cards below, but the monthly bridal
          line needs the updated salon dashboard API (bridal split). Until then
          those trials are included in Makeup Try-On on the chart.
        </p>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Service Trends</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {serviceChartMonths === 1
                ? "Actual counts for the current month"
                : "Multi-month view projects current month at 30-day pace (usage ÷ day × 30)"}
            </p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={String(serviceChartMonths)}
            onValueChange={(v) => {
              if (v) setServiceChartMonths(Number(v) as ChartMonthOption);
            }}
          >
            {CHART_MONTH_OPTIONS.map((m) => (
              <ToggleGroupItem key={m} value={String(m)} className="text-xs px-3">
                {m}M
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {customerTrend && (
            <TrendChart
              key={`service-customers-${serviceChartMonths}`}
              chartKey={serviceChartMonths}
              title="Services by Customer"
              description={`Unique customers per service · ${serviceRangeLabel}`}
              data={prepareVtoMonthlyTrend(customerTrend, serviceChartMonths)}
              series={SERVICE_TREND_SERIES}
            />
          )}
          <TrendChart
            key={`service-usage-${serviceChartMonths}`}
            chartKey={serviceChartMonths}
            title="Services by Usage"
            description={`Every try-on and analysis per service · ${serviceRangeLabel}`}
            data={prepareVtoMonthlyTrend(usageTrend, serviceChartMonths)}
            series={SERVICE_TREND_SERIES}
          />
        </div>
      </div>

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
