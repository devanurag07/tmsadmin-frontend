"use client";

import { StatCard } from "@/components/kpi/StatCard";
import {
  ParameterAverageCard,
  ScoreTallyCard,
  ScoreTallyLegend,
} from "@/components/kpi/ScoreTallyCard";
import { toScoreTallyBuckets } from "@/lib/analytics/scoreTally";
import type { ServiceAnalytics } from "@/lib/api/salon/dashboard_api";
import { Users } from "lucide-react";

interface ServiceAnalysisSectionProps {
  analysis: ServiceAnalytics;
  accent: string;
  /** "skin" uses skin_metrics, "hair" uses hair_metrics. */
  kind: "skin" | "hair";
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
}: ServiceAnalysisSectionProps) {
  const metrics = kind === "skin" ? analysis.skin_metrics : analysis.hair_metrics;
  const gradient =
    kind === "skin" ? "from-cyan-500 to-blue-500" : "from-amber-400 to-orange-500";
  const tallyTotal = analysis.parameters.reduce((sum, param) => {
    const buckets = toScoreTallyBuckets(analysis.parameter_distribution[param]);
    return sum + buckets.reduce((s, b) => s + b.count, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard
          label={kind === "skin" ? "Total Skin Analyses" : "Total Hair Analyses"}
          value={analysis.total_analyses}
          icon={Users}
          accent={accent}
        />
        <StatCard
          label="Male / Female"
          value={`${analysis.gender_counts.male} / ${analysis.gender_counts.female}`}
        />
        {kind === "hair" && analysis.deep_analysis_count != null && (
          <StatCard
            label="Deep Analyses"
            value={analysis.deep_analysis_count}
            accent="#06b6d4"
          />
        )}
        {kind === "skin" && (
          <StatCard
            label="Other / Unknown"
            value={analysis.gender_counts.other}
          />
        )}
      </div>

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
