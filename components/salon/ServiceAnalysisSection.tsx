"use client";

import { useState } from "react";
import { StatCard } from "@/components/kpi/StatCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ParameterAverageCard,
  ScoreTallyCard,
  ScoreTallyLegend,
} from "@/components/kpi/ScoreTallyCard";
import { toScoreTallyBuckets } from "@/lib/analytics/scoreTally";
import {
  CHART_MONTH_OPTIONS,
  ChartMonthOption,
  prepareServiceMonthlyTrend,
} from "@/lib/charts/vtoTrend";
import type { SalonDashboard, ServiceAnalytics } from "@/lib/api/salon/dashboard_api";
import { Users } from "lucide-react";

interface ServiceAnalysisSectionProps {
  analysis: ServiceAnalytics;
  accent: string;
  /** "skin" uses skin_metrics, "hair" uses hair_metrics. */
  kind: "skin" | "hair";
  /** Salon monthly trend (last 12 months, per service); drives the usage chart. */
  monthlyTrend?: SalonDashboard["monthly_trend"];
}

function MetricGrid({
  metrics,
  gradient,
}: {
  metrics: Record<string, number>;
  gradient: string;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Object.entries(metrics).map(([key, val]) => {
        const pct = Math.min(Math.max(val, 0), 100);
        return (
          <div
            key={key}
            className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </p>
              <span className="text-sm font-bold tabular-nums">{val}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ServiceAnalysisSection({
  analysis,
  accent,
  kind,
  monthlyTrend,
}: ServiceAnalysisSectionProps) {
  const [chartMonths, setChartMonths] = useState<ChartMonthOption>(6);
  const chartData = monthlyTrend
    ? prepareServiceMonthlyTrend(monthlyTrend, kind, chartMonths)
    : [];
  const metrics = kind === "skin" ? analysis.skin_metrics : analysis.hair_metrics;
  const gradient =
    kind === "skin" ? "from-cyan-500 to-blue-500" : "from-amber-400 to-orange-500";
  const tallyTotal = analysis.parameters.reduce((sum, param) => {
    const buckets = toScoreTallyBuckets(analysis.parameter_distribution[param]);
    return sum + buckets.reduce((s, b) => s + b.count, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <StatCard
          label={kind === "skin" ? "Total Skin Analyses" : "Total Hair Analyses"}
          value={analysis.total_analyses}
          icon={Users}
          accent={accent}
        />
      </div>

      {chartData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Monthly Usage</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {kind === "skin" ? "Skin" : "Hair"} analyses per month
              </p>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={String(chartMonths)}
              onValueChange={(v) => v && setChartMonths(Number(v) as ChartMonthOption)}
            >
              {CHART_MONTH_OPTIONS.map((m) => (
                <ToggleGroupItem key={m} value={String(m)} className="text-xs px-2.5">
                  {m}M
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <TrendChart
            title={kind === "skin" ? "Skin Analysis Trend" : "Hair Analysis Trend"}
            description={`Last ${chartMonths} month${chartMonths > 1 ? "s" : ""}`}
            data={chartData}
            series={[
              {
                key: kind,
                color: accent,
                label: kind === "skin" ? "Skin Analyses" : "Hair Analyses",
              },
            ]}
            chartKey={`${kind}-${chartMonths}`}
          />
        </div>
      )}

      {metrics && Object.keys(metrics).length > 0 && (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Parameter Averages</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Average score per parameter
              </p>
            </div>
            <ScoreTallyLegend />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {analysis.parameters.map((param) => (
              <ParameterAverageCard
                key={param}
                name={param}
                value={metrics[param] ?? 0}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Score Tally</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              3 score bands per parameter
            </p>
          </div>
          <ScoreTallyLegend />
        </div>
        {tallyTotal === 0 && analysis.total_analyses > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            No per-parameter scores found in {kind} analysis results for this period.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {analysis.parameters.map((param) => {
            const buckets = toScoreTallyBuckets(
              analysis.parameter_distribution[param]
            );
            if (!buckets.some((b) => b.count > 0)) return null;
            return <ScoreTallyCard key={param} name={param} buckets={buckets} />;
          })}
        </div>
      </div>
    </div>
  );
}
