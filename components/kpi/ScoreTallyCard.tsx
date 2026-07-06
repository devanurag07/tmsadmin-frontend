import { SCORE_TALLY_BUCKETS, scoreBandColor } from "@/lib/analytics/scoreTally";

interface ScoreTallyCardProps {
  name: string;
  buckets: { bucket: string; count: number; color: string }[];
}

export function ScoreTallyLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
      {SCORE_TALLY_BUCKETS.map(({ label, color }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

export function ScoreTallyCard({ name, buckets }: ScoreTallyCardProps) {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-semibold capitalize mb-3">{name.replace(/_/g, " ")}</p>
      <div className="space-y-2">
        {buckets.map((b) => {
          const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
          return (
            <div key={b.bucket} className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground w-14 shrink-0 tabular-nums">
                {b.bucket}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: b.color }}
                />
              </div>
              <span className="text-[11px] font-medium w-8 text-right tabular-nums shrink-0">
                {b.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ParameterAverageCardProps {
  name: string;
  value: number;
}

export function ParameterAverageCard({ name, value }: ParameterAverageCardProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const color = scoreBandColor(value);

  return (
    <div className="rounded-xl border bg-card p-4 group hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground capitalize">
          {name.replace(/_/g, " ")}
        </p>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
