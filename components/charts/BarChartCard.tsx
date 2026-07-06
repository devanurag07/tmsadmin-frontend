"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartCardProps {
  title: string;
  description?: string;
  data: { name: string; count: number }[];
  color?: string;
  height?: number;
  emptyMessage?: string;
}

export function BarChartCard({
  title,
  description,
  data,
  color = "#6366f1",
  height = 280,
  emptyMessage = "No data yet",
}: BarChartCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div style={{ height }} className="w-full">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 70, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={80}
                tickLine={false}
                axisLine={false}
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
              <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
