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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Skin Analysis</h1>
          <p className="text-muted-foreground">
            Results and insights from AI skin analysis
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || loading}
          // variant="outline"
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search metrics, analysis, suggestions…"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parameter</Label>
              <Select
                value={filters.param}
                onValueChange={(v: any) =>
                  setFilters((prev) => ({ ...prev, param: v }))
                }
              >
                <SelectTrigger>
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

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Latest skin analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
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
                      <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.image}
                          alt="Skin"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
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
                                className="p-2 border rounded-md"
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
                                <div className="text-xs text-muted-foreground line-clamp-2">
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
                        onClick={() => setSelected(r)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Skin Analysis Details</h2>
              <Button variant="outline" onClick={() => setSelected(null)}>
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
