"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  getMirrorApiResults,
  MirrorApiResult,
} from "@/lib/api/mirror/mirror_api";
import {
  VTO_RESULT_SERVICE_LABELS,
  VtoResultService,
  vtoResultLabel,
  vtoResultService,
  vtoResultValue,
} from "@/lib/analytics/vtoResultLabel";
import { Activity, CheckCircle, Clock } from "lucide-react";

type SortOrder = "newest" | "oldest";

const ALL = "all";

const TIME_PRESETS = [
  { label: "1W", days: 7 },
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
] as const;

/** yyyy-mm-dd in local time, matching the date inputs. */
function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function presetFromDate(preset: (typeof TIME_PRESETS)[number]): string {
  const d = new Date();
  if ("days" in preset) d.setDate(d.getDate() - preset.days);
  else d.setMonth(d.getMonth() - preset.months);
  return toDateInput(d);
}

export default function ResultsPage() {
  const [mirrorResults, setMirrorResults] = useState<MirrorApiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMirror, setLoadingMirror] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [service, setService] = useState<VtoResultService | typeof ALL>(ALL);
  const [serviceValue, setServiceValue] = useState<string>(ALL);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchMirrorResults = async () => {
    try {
      setLoadingMirror(true);
      setError(null);
      const response = await getMirrorApiResults(500);
      if (response.success && response.data) {
        setMirrorResults(response.data);
      } else {
        setError(response.message || "Failed to fetch mirror results");
      }
    } catch (err) {
      console.error("Error fetching mirror results:", err);
      setError("Failed to fetch mirror results");
    } finally {
      setLoadingMirror(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMirrorResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Date range narrows everything below it, so service/value counts follow it.
  const dateFilteredResults = useMemo(() => {
    const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toMs = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;

    return mirrorResults.filter((r) => {
      const t = new Date(r.created_at).getTime();
      if (Number.isNaN(t)) return true;
      if (fromMs !== null && t < fromMs) return false;
      if (toMs !== null && t > toMs) return false;
      return true;
    });
  }, [mirrorResults, fromDate, toDate]);

  // Only offer services that actually appear in the results.
  const serviceOptions = useMemo(() => {
    const present = new Set(dateFilteredResults.map(vtoResultService));
    return (Object.keys(VTO_RESULT_SERVICE_LABELS) as VtoResultService[]).filter((s) =>
      present.has(s)
    );
  }, [dateFilteredResults]);

  const valueOptions = useMemo(() => {
    if (service === ALL) return [];
    const counts = new Map<string, number>();
    for (const r of dateFilteredResults) {
      if (vtoResultService(r) !== service) continue;
      const v = vtoResultValue(r);
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [dateFilteredResults, service]);

  const filteredAndSortedResults = useMemo(() => {
    const filtered = dateFilteredResults.filter((r) => {
      if (service !== ALL && vtoResultService(r) !== service) return false;
      if (serviceValue !== ALL && vtoResultValue(r) !== serviceValue) return false;
      return true;
    });

    const dir = sortOrder === "newest" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return (at - bt) * dir;
    });
  }, [dateFilteredResults, sortOrder, service, serviceValue]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <p className="text-destructive">{error}</p>
          <Button
            onClick={fetchMirrorResults}
            disabled={loadingMirror}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">
            Latest virtual try-on generated outputs
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1">
            {TIME_PRESETS.map((preset) => {
              const from = presetFromDate(preset);
              const active = fromDate === from && !toDate;
              return (
                <Button
                  key={preset.label}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => {
                    setFromDate(from);
                    setToDate("");
                  }}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[150px]"
              aria-label="From date"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[150px]"
              aria-label="To date"
            />
            {(fromDate || toDate) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <Select
            value={service}
            onValueChange={(v) => {
              setService(v as VtoResultService | typeof ALL);
              setServiceValue(ALL);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All services</SelectItem>
              {serviceOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {VTO_RESULT_SERVICE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={serviceValue}
            onValueChange={setServiceValue}
            disabled={service === ALL}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>
                {service === ALL ? "Pick a service first" : "All values"}
              </SelectItem>
              {valueOptions.map(([v, count]) => (
                <SelectItem key={v} value={v}>
                  {v} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as SortOrder)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={fetchMirrorResults}
            disabled={loadingMirror}
            variant="outline"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {loadingMirror ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {filteredAndSortedResults.length === 0 ? (
        <div className="flex items-center justify-center min-h-[240px]">
          <p className="text-muted-foreground">No results found.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredAndSortedResults.map((result) => {
            const label = vtoResultLabel(result);
            return (
              <div
                key={result.id}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow"
              >
                {result.is_ready && result.output_url ? (
                  <div className="aspect-square bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.output_url}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2.5 space-y-1.5">
                  <p className="text-xs font-medium leading-snug line-clamp-2" title={label}>
                    {label}
                  </p>
                  <Badge
                    variant={result.is_ready ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0 h-5 gap-1"
                  >
                    {result.is_ready ? (
                      <><CheckCircle className="h-2.5 w-2.5" />Ready</>
                    ) : (
                      <><Clock className="h-2.5 w-2.5" />Pending</>
                    )}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(result.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
