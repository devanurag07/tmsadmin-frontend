import type { VtoService } from "@/lib/api/salon/dashboard_api";

export const VTO_SERVICES: {
  key: VtoService;
  label: string;
  color: string;
  textClass: string;
}[] = [
  { key: "hairstyle", label: "Hairstyle", color: "#8b5cf6", textClass: "text-violet-600" },
  { key: "haircolor", label: "Haircolor", color: "#ec4899", textClass: "text-pink-500" },
  { key: "beard", label: "Beard", color: "#f59e0b", textClass: "text-amber-500" },
  { key: "makeup", label: "Makeup Try-On", color: "#f43f5e", textClass: "text-rose-500" },
  { key: "bridal", label: "Bridal Makeup", color: "#c026d3", textClass: "text-fuchsia-600" },
];

export const VTO_SERVICE_SERIES = VTO_SERVICES.map(({ key, color, label }) => ({
  key,
  color,
  label,
}));

/** VTO services plus skin / hair analysis lines. Hair is green so it doesn't clash with Beard. */
export const SERVICE_TREND_SERIES = [
  ...VTO_SERVICE_SERIES,
  { key: "skin", color: "#06b6d4", label: "Skin Analysis" },
  { key: "hair", color: "#10b981", label: "Hair Analysis" },
];

export function ServiceMetricRow({
  title,
  subtitle,
  values,
  subValues,
  formatSub,
}: {
  title: string;
  subtitle: string;
  /** Undefined when the API doesn't provide this metric yet; cards show "—". */
  values?: Partial<Record<VtoService, number>>;
  subValues?: Partial<Record<VtoService, number>>;
  formatSub?: (value: number) => string;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {VTO_SERVICES.map(({ key, label, textClass }) => (
          <div key={key} className="rounded-xl border bg-card p-4 text-center">
            <p className={`text-xl font-bold ${textClass}`}>
              {values ? (values[key] ?? 0).toLocaleString() : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            {subValues && formatSub && (
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                {formatSub(subValues[key] ?? 0)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
