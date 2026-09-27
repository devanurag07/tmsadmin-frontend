import { format, subMonths } from "date-fns";

export const CHART_MONTH_OPTIONS = [1, 3, 6, 12] as const;
export type ChartMonthOption = (typeof CHART_MONTH_OPTIONS)[number];

export interface VtoTrendPoint {
  label: string;
  hairstyle: number;
  haircolor: number;
  beard: number;
  makeup: number;
  bridal: number;
  /** Skin / hair analyses, merged in via withSkinHairTrend (0 otherwise). */
  skin: number;
  hair: number;
  total: number;
  isProjected?: boolean;
  actual?: Record<string, number>;
  [key: string]: string | number | boolean | Record<string, number> | undefined;
}

const VTO_METRIC_KEYS = [
  "hairstyle",
  "haircolor",
  "beard",
  "makeup",
  "bridal",
  "skin",
  "hair",
  "total",
] as const;

function emptyVtoPoint(label: string): VtoTrendPoint {
  return {
    label,
    hairstyle: 0,
    haircolor: 0,
    beard: 0,
    makeup: 0,
    bridal: 0,
    skin: 0,
    hair: 0,
    total: 0,
  };
}

export function toVtoTrendPoints(
  data: {
    label: string;
    hairstyle: number;
    haircolor: number;
    beard: number;
    makeup?: number;
    bridal?: number;
    total: number;
  }[]
): VtoTrendPoint[] {
  return data.map(({ label, hairstyle, haircolor, beard, makeup, bridal }) => ({
    label,
    hairstyle,
    haircolor,
    beard,
    makeup: makeup ?? 0,
    bridal: bridal ?? 0,
    skin: 0,
    hair: 0,
    total: hairstyle + haircolor + beard + (makeup ?? 0) + (bridal ?? 0),
  }));
}

/** Project a partial-month value to a 30-day pace (day-1 value of 6 → 180). */
export function projectValueAt30DayPace(value: number, dayOfMonth: number): number {
  if (dayOfMonth <= 0) return value;
  return Math.round((value / dayOfMonth) * 30);
}

/** Zero-fill every calendar month from `start` to today (inclusive) so the
 * chart always renders an axis even when there is no VTO data.
 *
 * When `projectCurrentMonth` is true (default), the current calendar month —
 * which is only partially elapsed — is projected to a 30-day pace so an
 * early-month spike doesn't look like a flat/down trend. The real observed
 * value is preserved in `actual` and the point is flagged `isProjected` so the
 * tooltip can label it. */
export function fillVtoLifetimeRange(
  data: VtoTrendPoint[] | null | undefined,
  start: Date,
  endDate: Date = new Date(),
  projectCurrentMonth = true
): VtoTrendPoint[] {
  const safeData = Array.isArray(data) ? data : [];
  const byLabel = new Map(safeData.map((point) => [point.label, point]));
  const result: VtoTrendPoint[] = [];

  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const cursor = new Date(startMonth);

  const currentLabel = format(endDate, "MMM yyyy");
  const dayOfMonth = endDate.getDate();
  const shouldProject = projectCurrentMonth && dayOfMonth > 0 && dayOfMonth < 30;

  while (cursor <= endMonth) {
    const label = format(cursor, "MMM yyyy");
    const existing = byLabel.get(label);
    const base: VtoTrendPoint = existing
      ? {
          label,
          hairstyle: existing.hairstyle,
          haircolor: existing.haircolor,
          beard: existing.beard,
          makeup: existing.makeup ?? 0,
          bridal: existing.bridal ?? 0,
          skin: existing.skin ?? 0,
          hair: existing.hair ?? 0,
          total: existing.total,
        }
      : emptyVtoPoint(label);

    if (shouldProject && label === currentLabel) {
      const actual: Record<string, number> = {};
      for (const key of VTO_METRIC_KEYS) {
        actual[key] = base[key] as number;
      }
      const projected: VtoTrendPoint = { ...base, actual, isProjected: true };
      for (const key of VTO_METRIC_KEYS) {
        projected[key] = projectValueAt30DayPace(base[key] as number, dayOfMonth);
      }
      result.push(projected);
    } else {
      result.push(base);
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return result;
}

/** Add per-month skin / hair analysis counts onto a VTO trend. `total` stays VTO-only. */
export function withSkinHairTrend(
  data: VtoTrendPoint[],
  monthly: { label: string; skin: number; hair: number }[] | null | undefined
): VtoTrendPoint[] {
  const byLabel = new Map((monthly ?? []).map((point) => [point.label, point]));
  return data.map((point) => {
    const month = byLabel.get(point.label);
    return { ...point, skin: month?.skin ?? 0, hair: month?.hair ?? 0 };
  });
}

/** Last N calendar months of an unprojected trend; multi-month views project
 * the current month to a 30-day pace. */
export function prepareVtoMonthlyTrend(
  data: VtoTrendPoint[],
  months: ChartMonthOption
): VtoTrendPoint[] {
  const byLabel = new Map(data.map((point) => [point.label, point]));
  const now = new Date();
  const currentLabel = format(now, "MMM yyyy");
  const dayOfMonth = now.getDate();
  const result: VtoTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const label = format(subMonths(now, i), "MMM yyyy");
    const base = byLabel.get(label) ?? emptyVtoPoint(label);
    if (months === 1 || label !== currentLabel || dayOfMonth <= 0) {
      result.push(base);
      continue;
    }
    const actual: Record<string, number> = {};
    const projected: VtoTrendPoint = { ...base, actual, isProjected: true };
    for (const key of VTO_METRIC_KEYS) {
      actual[key] = base[key] as number;
      projected[key] = projectValueAt30DayPace(base[key] as number, dayOfMonth);
    }
    result.push(projected);
  }

  return result;
}

export interface ServiceTrendPoint {
  label: string;
  isProjected?: boolean;
  actual?: Record<string, number>;
  [key: string]: string | number | boolean | Record<string, number> | undefined;
}

/** Last N calendar months of one service count (e.g. "skin" / "hair") from the
 * salon monthly trend; multi-month views project the current month to a 30-day pace. */
export function prepareServiceMonthlyTrend(
  data: ({ label: string } & Record<string, string | number>)[] | null | undefined,
  key: string,
  months: ChartMonthOption
): ServiceTrendPoint[] {
  const byLabel = new Map((data ?? []).map((point) => [point.label, Number(point[key]) || 0]));
  const now = new Date();
  const currentLabel = format(now, "MMM yyyy");
  const dayOfMonth = now.getDate();
  const result: ServiceTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const label = format(subMonths(now, i), "MMM yyyy");
    const value = byLabel.get(label) ?? 0;
    if (months > 1 && label === currentLabel && dayOfMonth > 0) {
      result.push({
        label,
        [key]: projectValueAt30DayPace(value, dayOfMonth),
        actual: { [key]: value },
        isProjected: true,
      });
    } else {
      result.push({ label, [key]: value });
    }
  }

  return result;
}
