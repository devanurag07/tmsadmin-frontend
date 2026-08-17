"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ROW_HEIGHT = 36;
const X_AXIS_HEIGHT = 28;
const PLOT_RIGHT_PAD = 12;
const LABEL_GAP = 12;

interface BarChartCardProps {
  title: string;
  description?: string;
  data: { name: string; count: number }[];
  color?: string;
  /** Visible viewport height; chart scrolls inside when there are many rows. */
  height?: number;
  actions?: ReactNode;
  emptyMessage?: string;
  yAxisWidth?: number;
}

function niceXTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0, 1];
  const target = 4;
  const raw = maxValue / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 5, 10].find((n) => n * mag >= raw) ?? 10) * mag;
  const end = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= end + 1e-9; v += step) ticks.push(v);
  return ticks;
}

export function BarChartCard({
  title,
  description,
  data,
  color = "#6366f1",
  height = 280,
  actions,
  emptyMessage = "No data yet",
}: BarChartCardProps) {
  const xTicks = niceXTicks(Math.max(0, ...data.map((d) => d.count)));
  const xMax = xTicks[xTicks.length - 1] ?? 1;
  const plotHeight = Math.max(data.length * ROW_HEIGHT, ROW_HEIGHT);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {data.length === 0 ? (
        <div
          style={{ height }}
          className="flex flex-col items-center justify-center text-center"
        >
          <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div style={{ height }} className="flex min-h-0 w-full flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="flex" style={{ height: plotHeight }}>
              <ul className="m-0 flex w-max shrink-0 list-none flex-col p-0">
                {data.map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center whitespace-nowrap text-left text-[11px] leading-tight text-foreground"
                    style={{ height: ROW_HEIGHT }}
                    title={row.name}
                  >
                    {row.name}
                  </li>
                ))}
              </ul>
              <div className="min-w-0 flex-1" style={{ marginLeft: LABEL_GAP }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                      top: 0,
                      right: PLOT_RIGHT_PAD,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/50"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, xMax]}
                      hide
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      hide
                      width={0}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,.08)",
                        fontSize: 12,
                      }}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    />
                    <Bar
                      dataKey="count"
                      fill={color}
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 shrink-0 border-t bg-card pt-1">
            <div className="flex h-6 items-end" style={{ paddingRight: PLOT_RIGHT_PAD }}>
              <div
                className="w-max shrink-0"
                style={{ marginRight: LABEL_GAP }}
                aria-hidden
              >
                <span className="invisible block whitespace-nowrap text-[11px] leading-tight">
                  {data.reduce((a, b) => (a.length >= b.name.length ? a : b.name), "")}
                </span>
              </div>
              <div className="relative h-5 min-w-0 flex-1">
                {xTicks.map((tick) => {
                  const isFirst = tick === 0;
                  const isLast = tick === xMax;
                  return (
                    <span
                      key={tick}
                      className="absolute bottom-0 text-[11px] tabular-nums text-muted-foreground"
                      style={{
                        left: `${xMax === 0 ? 0 : (tick / xMax) * 100}%`,
                        transform: isFirst
                          ? "translateX(0)"
                          : isLast
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                      }}
                    >
                      {tick}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
