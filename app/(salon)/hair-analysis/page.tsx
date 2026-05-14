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
  exportHairResults,
  getHairResults,
  HairAttribute,
  HairResultRecord,
} from "@/lib/api/mirror/mirror_api";

type ParamKey =
  | "hair_density"
  | "oiliness"
  | "scalp_redness"
  | "hair_thinning"
  | "hair_texture"
  | "shaft_thickness"
  | "scalp_texture"
  | "dandruff";

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

const HairAnalysisPage = () => {
  const [records, setRecords] = useState<HairResultRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<HairResultRecord | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    param: "all" as "all" | ParamKey,
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHairResults();
      if (res.success && res.data) {
        setRecords(res.data);
      } else {
        setError(res.message || "Failed to fetch hair results");
      }
    } catch (e) {
      setError("Failed to fetch hair results");
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
      await exportHairResults();
    } catch (error) {
      setError("Failed to export hair analysis data");
    } finally {
      setExporting(false);
    }
  };

  const filtered = useMemo(() => {
    const term = filters.searchTerm.trim().toLowerCase();
    return records.filter((r) => {
      const hairAttributes = r?.result?.hair_attributes || [];
      const inText = term
        ? hairAttributes.some(
          (m) =>
            m.attribute.toLowerCase().includes(term) ||
            m.analysis.toLowerCase().includes(term) ||
            m.recommendation.toLowerCase().includes(term) ||
            (r.name && r.name.toLowerCase().includes(term)) ||
            (r.phone_number && r.phone_number.includes(term))
        )
        : true;
      const inParam =
        filters.param === "all"
          ? true
          : hairAttributes.some((m) => m.attribute === filters.param);
      return inText && inParam;
    });
  }, [records, filters]);

  const metricAverage = (attribute: ParamKey): string => {
    const vals: number[] = [];
    filtered.forEach((r) => {
      const metric = (r?.result?.hair_attributes || []).find(
        (m) => m.attribute === attribute
      );

      if (metric) vals.push(metric.score);
    });
    if (!vals.length) return "0";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const formatAttributeName = (attribute: string): string => {
    return attribute
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hair analysis…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Hair Analysis
          </h1>
          <p className="text-muted-foreground">
            Results and insights from AI hair analysis
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
            <CardTitle className="text-sm font-medium">
              Avg Hair Density
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricAverage("hair_density")}
            </div>
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
              {metricAverage("oiliness")}
            </div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Dandruff</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricAverage("dandruff")}
            </div>
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
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
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
            <div className="min-w-0 space-y-2 sm:col-span-1">
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
                  <SelectItem value="hair_density">Hair Density</SelectItem>
                  <SelectItem value="oiliness">Oiliness</SelectItem>
                  <SelectItem value="scalp_redness">Scalp Redness</SelectItem>
                  <SelectItem value="hair_thinning">Hair Thinning</SelectItem>
                  <SelectItem value="hair_texture">Hair Texture</SelectItem>
                  <SelectItem value="shaft_thickness">
                    Shaft Thickness
                  </SelectItem>
                  <SelectItem value="scalp_texture">Scalp Texture</SelectItem>
                  <SelectItem value="dandruff">Dandruff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Results</CardTitle>
          <CardDescription>Latest hair analysis results</CardDescription>
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
                          <div className="truncate font-medium leading-snug">
                            {r.name || "N/A"}
                          </div>
                          <div className="truncate text-sm text-muted-foreground">
                            {r.phone_number || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(r.result?.hair_attributes || [])
                          .slice(0, 4)
                          .map((m: HairAttribute) => {
                            const status = getParameterStatus(m.score);
                            const Icon = status.icon;
                            return (
                              <div
                                key={m.attribute}
                                className="rounded-md border p-2"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="truncate text-[11px] font-medium leading-tight">
                                    {formatAttributeName(m.attribute)}
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
                <Table className="min-w-[680px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Image</TableHead>
                      <TableHead>Customer Info</TableHead>
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
                              alt="Hair"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{r.name || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">
                              {r.phone_number || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid gap-2 md:grid-cols-2">
                            {(r.result?.hair_attributes || [])
                              .slice(0, 4)
                              .map((m: HairAttribute) => {
                                const status = getParameterStatus(m.score);
                                const Icon = status.icon;
                                return (
                                  <div
                                    key={m.attribute}
                                    className="rounded-md border p-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">
                                        {formatAttributeName(m.attribute)}
                                      </div>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[min(90dvh,720px)] w-full max-w-5xl overflow-y-auto rounded-t-lg bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] dark:bg-slate-900 sm:rounded-lg sm:p-6 sm:pb-6 sm:pt-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Hair Analysis Details</h2>
                {selected.name && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.name}
                    {selected.phone_number && ` • ${selected.phone_number}`}
                  </p>
                )}
              </div>
              <Button variant="outline" className="shrink-0" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="w-full h-80 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.image}
                    alt="Hair"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Captured {new Date(selected.created_at).toLocaleString()}
                </div>
                {selected.result?.weekly_routine && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Weekly Routine</h3>
                    <ul className="space-y-1 text-sm">
                      {selected.result.weekly_routine.map((routine, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          • {routine}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <div className="space-y-3">
                  {(selected.result?.hair_attributes || []).map((m) => {
                    const status = getParameterStatus(m.score);
                    const Icon = status.icon;
                    return (
                      <div key={m.attribute} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">
                            {formatAttributeName(m.attribute)}
                          </div>
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
                        <div className="text-sm mb-2">{m.analysis}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Recommendation: </span>
                          {m.recommendation}
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

export default HairAnalysisPage;
