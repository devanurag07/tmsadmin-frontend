import { format } from "date-fns";

export interface VtoTrendPoint {
  label: string;
  hairstyle: number;
  haircolor: number;
  beard: number;
  total: number;
  isProjected?: boolean;
  actual?: Record<string, number>;
  [key: string]: string | number | boolean | Record<string, number> | undefined;
}

const VTO_METRIC_KEYS = ["hairstyle", "haircolor", "beard", "total"] as const;

function emptyVtoPoint(label: string): VtoTrendPoint {
  return { label, hairstyle: 0, haircolor: 0, beard: 0, total: 0 };
}

export function toVtoTrendPoints(
  data: {
    label: string;
    hairstyle: number;
    haircolor: number;
    beard: number;
    total: number;
  }[]
): VtoTrendPoint[] {
  return data.map(({ label, hairstyle, haircolor, beard }) => ({
    label,
    hairstyle,
    haircolor,
    beard,
    total: hairstyle + haircolor + beard,
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
