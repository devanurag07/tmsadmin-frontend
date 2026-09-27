"use client";

import { useState } from "react";
import { TrendChart } from "@/components/charts/TrendChart";
import { SERVICE_TREND_SERIES } from "@/components/kpi/ServiceMetricRow";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CHART_MONTH_OPTIONS,
  ChartMonthOption,
  fillVtoLifetimeRange,
  prepareVtoMonthlyTrend,
  toVtoTrendPoints,
  withSkinHairTrend,
} from "@/lib/charts/vtoTrend";
import type { SalonDashboard, VtoAnalytics } from "@/lib/api/salon/dashboard_api";

interface ServiceTrendsSectionProps {
  /** Lifetime VTO analytics (falls back to the filtered one while loading). */
  vto: VtoAnalytics;
  createdAt: string;
  /** Salon-level monthly trend; supplies the skin / hair lines. */
  salonTrend?: SalonDashboard["monthly_trend"];
}

/** Services by Customer / Usage trend charts across VTO, skin and hair. */
export function ServiceTrendsSection({ vto, createdAt, salonTrend }: ServiceTrendsSectionProps) {
  const [serviceChartMonths, setServiceChartMonths] = useState<ChartMonthOption>(6);
  const created = new Date(createdAt);
  // Unprojected lifetime trends; prepareVtoMonthlyTrend slices and projects them.
  const usageTrend = withSkinHairTrend(
    fillVtoLifetimeRange(toVtoTrendPoints(vto.monthly_trend), created, new Date(), false),
    salonTrend
  );
  const customerTrend = vto.monthly_customer_trend
    ? withSkinHairTrend(
        fillVtoLifetimeRange(
          toVtoTrendPoints(vto.monthly_customer_trend),
          created,
          new Date(),
          false
        ),
        salonTrend
      )
    : null;
  const serviceRangeLabel = `last ${serviceChartMonths} month${serviceChartMonths > 1 ? "s" : ""}`;

  return (
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
  );
}
