"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  AnalyticsData,
  DailyData,
  WeeklyData,
  MonthlyData,
} from "@/lib/api/analytics/analytics_api";
import {
  getMirrorApiResults,
  MirrorApiResult,
} from "@/lib/api/mirror/mirror_api";
import { dummyAnalyticsData, usageLimits } from "./dummy-data";
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  Image,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const UsagePage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [mirrorResults, setMirrorResults] = useState<MirrorApiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMirror, setLoadingMirror] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetchMirrorResults();
  }, []);

  useEffect(() => {
    if (mirrorResults.length > 0) {
      fetchAnalyticsData();
    }
  }, [mirrorResults]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Generate analytics data from mirror results
      const analyticsFromMirror =
        generateAnalyticsFromMirrorResults(mirrorResults);
      setAnalyticsData(analyticsFromMirror);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMirrorResults = async () => {
    try {
      setLoadingMirror(true);
      const response = await getMirrorApiResults(500);
      if (response.success && response.data) {
        setMirrorResults(response.data);
      } else {
        console.error("Failed to fetch mirror results:", response.message);
      }
    } catch (err) {
      console.error("Error fetching mirror results:", err);
    } finally {
      setLoadingMirror(false);
    }
  };

  const getTotalRequests = (
    data: DailyData[] | WeeklyData[] | MonthlyData[]
  ) => {
    return data.reduce((total, item) => total + item.requests, 0);
  };

  const getSuccessRate = (data: DailyData[] | WeeklyData[] | MonthlyData[]) => {
    const totalRequests = getTotalRequests(data);
    const totalSuccess = data.reduce((total, item) => total + item.success, 0);
    return totalRequests > 0
      ? ((totalSuccess / totalRequests) * 100).toFixed(1)
      : "0";
  };

  const getAverageResponseTime = (
    data: DailyData[] | WeeklyData[] | MonthlyData[]
  ) => {
    const totalResponse = data.reduce(
      (total, item) => total + item.avgResponse,
      0
    );
    return data.length > 0 ? (totalResponse / data.length).toFixed(2) : "0";
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";
    return "normal";
  };

  const getUsageColor = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  // Helper functions for mirror results
  const categorizeMirrorResults = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const categorized = {
      today: [] as MirrorApiResult[],
      yesterday: [] as MirrorApiResult[],
      lastWeek: [] as MirrorApiResult[],
      lastMonth: [] as MirrorApiResult[],
      older: [] as MirrorApiResult[],
    };

    mirrorResults.forEach((result) => {
      const resultDate = new Date(result.created_at);

      if (resultDate.toDateString() === today.toDateString()) {
        categorized.today.push(result);
      } else if (resultDate.toDateString() === yesterday.toDateString()) {
        categorized.yesterday.push(result);
      } else if (resultDate >= lastWeek) {
        categorized.lastWeek.push(result);
      } else if (resultDate >= lastMonth) {
        categorized.lastMonth.push(result);
      } else {
        categorized.older.push(result);
      }
    });

    return categorized;
  };

  const getReadyResults = (results: MirrorApiResult[]) => {
    return results.filter((result) => result.is_ready);
  };

  const getPendingResults = (results: MirrorApiResult[]) => {
    return results.filter((result) => !result.is_ready);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate analytics data from mirror results
  const generateAnalyticsFromMirrorResults = (
    results: MirrorApiResult[]
  ): AnalyticsData => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Generate daily data for the last 7 days
    const daily: DailyData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayResults = results.filter((result) => {
        const resultDate = new Date(result.created_at);
        return resultDate.toDateString() === date.toDateString();
      });

      const readyResults = dayResults.filter((result) => result.is_ready);
      const failedResults = dayResults.filter((result) => !result.is_ready);

      daily.push({
        date: dateStr,
        requests: dayResults.length,
        success: readyResults.length,
        failed: failedResults.length,
        avgResponse: dayResults.length > 0 ? Math.random() * 2000 + 500 : 0, // Simulated response time
      });
    }

    // Generate weekly data for the last 4 weeks
    const weekly: WeeklyData[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekResults = results.filter((result) => {
        const resultDate = new Date(result.created_at);
        return resultDate >= weekStart && resultDate <= weekEnd;
      });

      const readyResults = weekResults.filter((result) => result.is_ready);
      const failedResults = weekResults.filter((result) => !result.is_ready);

      weekly.push({
        week: `Week ${4 - i}`,
        requests: weekResults.length,
        success: readyResults.length,
        failed: failedResults.length,
        avgResponse: weekResults.length > 0 ? Math.random() * 2000 + 500 : 0,
      });
    }

    // Generate monthly data for the last 6 months
    const monthly: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(
        today.getFullYear(),
        today.getMonth() - i + 1,
        0
      );

      const monthResults = results.filter((result) => {
        const resultDate = new Date(result.created_at);
        return resultDate >= monthStart && resultDate <= monthEnd;
      });

      const readyResults = monthResults.filter((result) => result.is_ready);
      const failedResults = monthResults.filter((result) => !result.is_ready);

      monthly.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        requests: monthResults.length,
        success: readyResults.length,
        failed: failedResults.length,
        avgResponse: monthResults.length > 0 ? Math.random() * 2000 + 500 : 0,
      });
    }

    return {
      daily,
      weekly,
      monthly,
      endpoints: [], // Empty endpoints array since we're only using mirror results
    };
  };

  const chartConfig = {
    requests: {
      label: "Requests",
      color: "#3b82f6",
    },
    success: {
      label: "Success",
      color: "#10b981",
    },
    failed: {
      label: "Failed",
      color: "#ef4444",
    },
    avgResponse: {
      label: "Avg Response (ms)",
      color: "#f59e0b",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your API usage and performance metrics
          </p>
        </div>
      </div>

      {/* Usage Limits Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {getTotalRequests(analyticsData.monthly)}
              </div>
              <div className="text-sm text-muted-foreground">
                /{" "}
                {Math.max(
                  usageLimits.monthly,
                  getTotalRequests(analyticsData.monthly) + 100
                ).toLocaleString()}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(
                  getUsageStatus(
                    getUsagePercentage(
                      getTotalRequests(analyticsData.monthly),
                      Math.max(
                        usageLimits.monthly,
                        getTotalRequests(analyticsData.monthly) + 100
                      )
                    )
                  )
                )}`}
                style={{
                  width: `${getUsagePercentage(
                    getTotalRequests(analyticsData.monthly),
                    Math.max(
                      usageLimits.monthly,
                      getTotalRequests(analyticsData.monthly) + 100
                    )
                  )}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {getUsagePercentage(
                getTotalRequests(analyticsData.monthly),
                Math.max(
                  usageLimits.monthly,
                  getTotalRequests(analyticsData.monthly) + 100
                )
              ).toFixed(1)}
              % used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Warning Alert */}
      {(() => {
        const monthlyUsage = getUsagePercentage(
          getTotalRequests(analyticsData.monthly),
          usageLimits.monthly
        );

        if (monthlyUsage >= 90) {
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Usage Limit Warning
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    You&apos;re approaching your usage limits. Consider
                    upgrading your plan to avoid service interruption.
                  </p>
                </div>
              </div>
            </div>
          );
        } else if (monthlyUsage >= 75) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Usage Alert
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You&apos;re using more than 75% of your monthly limit.
                    Monitor your usage to avoid hitting limits.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};
export default UsagePage;
