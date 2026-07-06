export const SCORE_TALLY_BUCKETS = [
  { key: "0-60", label: "0-60", color: "#ef4444" },
  { key: "61-80", label: "61-80", color: "#eab308" },
  { key: "81-100", label: "81-100", color: "#22c55e" },
] as const;

export type ScoreTallyBucket = (typeof SCORE_TALLY_BUCKETS)[number];

/** Bar/text color for a 0–100 score using the 3-band scale. */
export function scoreBandColor(value: number): string {
  if (value <= 60) return SCORE_TALLY_BUCKETS[0].color;
  if (value <= 80) return SCORE_TALLY_BUCKETS[1].color;
  return SCORE_TALLY_BUCKETS[2].color;
}

type DistributionInput =
  | Record<string, number>
  | { bucket: string; count: number }[];

/** Normalize API distribution into the 3-band score tally format. */
export function toScoreTallyBuckets(
  dist: DistributionInput | undefined
): { bucket: string; count: number; color: string }[] {
  if (!dist) return [];

  const counts: Record<string, number> = {};

  if (Array.isArray(dist)) {
    for (const { bucket, count } of dist) {
      counts[bucket] = count;
    }
  } else {
    Object.assign(counts, dist);
  }

  // Legacy 4-bucket API → merge into 3 bands
  if (counts["0-39"] != null || counts["40-59"] != null) {
    return SCORE_TALLY_BUCKETS.map(({ key, label, color }) => ({
      bucket: label,
      color,
      count:
        key === "0-60"
          ? (counts["0-39"] ?? 0) + (counts["40-59"] ?? 0) + (counts["0-60"] ?? 0)
          : key === "61-80"
            ? (counts["60-79"] ?? 0) + (counts["61-80"] ?? 0)
            : (counts["80-100"] ?? 0) + (counts["81-100"] ?? 0),
    }));
  }

  return SCORE_TALLY_BUCKETS.map(({ key, label, color }) => ({
    bucket: label,
    color,
    count: counts[key] ?? 0,
  }));
}
