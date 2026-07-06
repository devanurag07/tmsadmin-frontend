import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accent?: string;
}

export function StatCard({ label, value, sub, icon: Icon, trend, accent }: StatCardProps) {
  return (
    <div className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
      {accent && (
        <div
          className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
          style={{ backgroundColor: accent }}
        />
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {sub && (
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {trend && trend !== "neutral" && (
        <div className={cn(
          "mt-2 text-xs font-medium",
          trend === "up" ? "text-emerald-600" : "text-red-500"
        )}>
          {trend === "up" ? "+" : "-"}
        </div>
      )}
    </div>
  );
}
