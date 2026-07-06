"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendChartDataPoint = {
  label: string;
  isProjected?: boolean;
  actual?: Record<string, number>;
  [key: string]: string | number | boolean | Record<string, number> | undefined;
};

interface Series {
  key: string;
  color: string;
  label?: string;
}

interface TrendChartProps {
  title: string;
  description?: string;
  data: TrendChartDataPoint[];
  series: Series[];
  xKey?: string;
  height?: number;
  chartKey?: string | number;
  yDomain?: [number, number];
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: TrendChartDataPoint;
  }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const isProjected = point?.isProjected;

  return (
    <div className="rounded-lg border bg-card shadow-sm p-2 text-xs">
      <p className="font-medium mb-1.5">
        {label}
        {isProjected && (
          <span className="text-muted-foreground font-normal"> (30-day projected)</span>
        )}
      </p>
      {payload.map((entry) => {
        const key = entry.dataKey as string;
        const actualVal = point?.actual?.[key];
        return (
          <p key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium tabular-nums">{entry.value?.toLocaleString()}</span>
            {isProjected && actualVal != null && (
              <span className="text-muted-foreground tabular-nums">
                (actual: {actualVal.toLocaleString()})
              </span>
            )}
          </p>
        );
      })}
    </div>
  );
}

export function TrendChart({
  title,
  description,
  data,
  series,
  xKey = "label",
  height = 300,
  chartKey,
  yDomain,
}: TrendChartProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={chartKey}
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              allowDecimals={false}
            />
            <Tooltip content={<TrendTooltip />} />
            {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#gradient-${s.key})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
