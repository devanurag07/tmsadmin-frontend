"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Download,
  Eye,
  Minus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  exportSkinResults,
  getSkinResults,
  SkinMetric,
  SkinResultRecord,
} from "@/lib/api/skin/skin_results_api";
import { SalonAnalysisOverview } from "@/components/salon/SalonAnalysisOverview";

type ParamKey =
  | "Acne"
  | "Oiliness"
  | "Redness"
  | "Wrinkles"
  | "Pores"
  | "Pigmentation"
  | "Skin Texture"
  | "Dark Circles";

const getParameterStatus = (value: number) => {
  if (value >= 80)
    return { status: "excellent", color: "bg-green-500", icon: TrendingUp };
  if (value >= 60)
    return { status: "good", color: "bg-blue-500", icon: TrendingUp };
  if (value >= 40)
    return { status: "average", color: "bg-yellow-500", icon: Minus };
  if (value >= 20)
    return { status: "poor", color: "bg-orange-500", icon: TrendingDown };
  return {
    status: "very_poor",
    color: "bg-red-500",
    icon: TrendingDown,
  };
};

const SkinAnalysisPage = () => {
  const [records, setRecords] = useState<SkinResultRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SkinResultRecord | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    param: "all" as "all" | ParamKey,
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSkinResults();
      if (res.success && res.data) {
        setRecords(res.data);
      } else {
        setError(res.message || "Failed to fetch skin results");
      }
    } catch (e) {
      setError("Failed to fetch skin results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportSkinResults();
    } catch (error) {
      setError("Failed to export skin analysis data");
    } finally {
      setExporting(false);
    }
  };

  const filtered = useMemo(() => {
    const term = filters.searchTerm.trim().toLowerCase();
    return records.filter((r) => {
      const inText = term
        ? r.result.skin_analysis.some(
            (m) =>
              m.name.toLowerCase().includes(term) ||
              m.analysis.toLowerCase().includes(term) ||
              m.suggestions.toLowerCase().includes(term)
          )
        : true;
      const inParam =
        filters.param === "all"
          ? true
          : r.result.skin_analysis.some((m) => m.name === filters.param);
      return inText && inParam;
    });
  }, [records, filters]);

  const metricAverage = (name: ParamKey): string => {
    const vals: number[] = [];
    filtered.forEach((r) => {
      const metric = r.result.skin_analysis.find((m) => m.name === name);
      if (metric) vals.push(metric.score);
    });
    if (!vals.length) return "0";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading skin analysis…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Skin Analysis
          </h1>
          <p className="text-muted-foreground">
            Results and insights from AI skin analysis
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || loading}
          className="w-full shrink-0 sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      <SalonAnalysisOverview kind="skin" />

      <div className="border-t pt-6 mt-2">
        <h2 className="text-sm font-semibold mb-4">Per-result records</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length}</div>
            <p className="text-xs text-muted-foreground">Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Acne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricAverage("Acne")}</div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Oiliness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricAverage("Oiliness")}
            </div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Redness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricAverage("Redness")}</div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter by parameter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="skin-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="skin-search"
                  placeholder="Search metrics, analysis, suggestions…"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  className="h-10 touch-manipulation pl-10"
                />
              </div>
            </div>
            <div className="min-w-0 space-y-2">
              <Label>Parameter</Label>
              <Select
                value={filters.param}
                onValueChange={(v: any) =>
                  setFilters((prev) => ({ ...prev, param: v }))
                }
              >
                <SelectTrigger className="h-10 w-full touch-manipulation">
                  <SelectValue placeholder="All parameters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Acne">Acne</SelectItem>
                  <SelectItem value="Oiliness">Oiliness</SelectItem>
                  <SelectItem value="Redness">Redness</SelectItem>
                  <SelectItem value="Wrinkles">Wrinkles</SelectItem>
                  <SelectItem value="Pores">Pores</SelectItem>
                  <SelectItem value="Pigmentation">Pigmentation</SelectItem>
                  <SelectItem value="Skin Texture">Skin Texture</SelectItem>
                  <SelectItem value="Dark Circles">Dark Circles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Results</CardTitle>
          <CardDescription>Latest skin analysis results</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 p-3 sm:p-6">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No results match your filters.
            </p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filtered.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="space-y-4 p-4">
                      <div className="flex gap-3">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Captured
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {r.result.skin_analysis.slice(0, 4).map((m: SkinMetric) => {
                          const status = getParameterStatus(m.score);
                          const Icon = status.icon;
                          return (
                            <div key={m.name} className="rounded-md border p-2">
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate text-[11px] font-medium leading-tight">
                                  {m.name}
                                </span>
                                <Icon
                                  className={`h-3.5 w-3.5 shrink-0 ${status.color.replace(
                                    "bg-",
                                    "text-"
                                  )}`}
                                />
                              </div>
                              <div className="font-mono text-xs">{m.score}</div>
                              <div className="line-clamp-2 text-[11px] text-muted-foreground">
                                {m.analysis}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-11 w-full touch-manipulation"
                        onClick={() => setSelected(r)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="-mx-1 hidden max-w-[100vw] min-w-0 overflow-x-auto overscroll-x-contain px-1 pb-1 touch-pan-x md:block">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Image</TableHead>
                      <TableHead>Top Metrics</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.image}
                              alt="Skin"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid gap-2 md:grid-cols-2">
                            {r.result.skin_analysis
                              .slice(0, 4)
                              .map((m: SkinMetric) => {
                                const status = getParameterStatus(m.score);
                                const Icon = status.icon;
                                return (
                                  <div
                                    key={m.name}
                                    className="rounded-md border p-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">{m.name}</div>
                                      <div className="flex items-center gap-1 text-sm">
                                        <Icon
                                          className={`h-3.5 w-3.5 ${status.color.replace(
                                            "bg-",
                                            "text-"
                                          )}`}
                                        />
                                        {m.score}
                                      </div>
                                    </div>
                                    <div className="line-clamp-2 text-xs text-muted-foreground">
                                      {m.analysis}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => setSelected(r)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[min(90dvh,720px)] w-full max-w-5xl overflow-y-auto rounded-t-lg bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] dark:bg-slate-900 sm:rounded-lg sm:p-6 sm:pb-6 sm:pt-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold sm:text-2xl">Skin Analysis Details</h2>
              <Button variant="outline" className="shrink-0 sm:self-auto" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="w-full h-80 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.image}
                    alt="Skin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Captured {new Date(selected.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  {selected.result.skin_analysis.map((m) => {
                    const status = getParameterStatus(m.score);
                    const Icon = status.icon;
                    return (
                      <div key={m.name} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{m.name}</div>
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`h-4 w-4 ${status.color.replace(
                                "bg-",
                                "text-"
                              )}`}
                            />
                            <Badge variant="outline">{m.score}</Badge>
                          </div>
                        </div>
                        <div className="text-sm">{m.analysis}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {m.suggestions}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinAnalysisPage;
