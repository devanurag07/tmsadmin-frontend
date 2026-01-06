"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getMirrorApiResults,
  MirrorApiResult,
} from "@/lib/api/mirror/mirror_api";
import { Activity, CheckCircle, Clock } from "lucide-react";

type SortOrder = "newest" | "oldest";

export default function ResultsPage() {
  const [mirrorResults, setMirrorResults] = useState<MirrorApiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMirror, setLoadingMirror] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

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

  const filteredAndSortedResults = useMemo(() => {
    const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toMs = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;

    const filtered = mirrorResults.filter((r) => {
      const t = new Date(r.created_at).getTime();
      if (Number.isNaN(t)) return true;
      if (fromMs !== null && t < fromMs) return false;
      if (toMs !== null && t > toMs) return false;
      return true;
    });

    const dir = sortOrder === "newest" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return (at - bt) * dir;
    });
  }, [mirrorResults, sortOrder, fromDate, toDate]);

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
            Mirror API requests and generated outputs (sorted by date)
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedResults.map((result) => (
            <Card key={result.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={result.is_ready ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {result.is_ready ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(result.created_at)}
                  </span>
                </div>
                <CardTitle className="text-base">Request</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {result.is_ready && result.output_url ? (
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={result.output_url}
                      alt="Generated image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                ) : null}

                <div className="space-y-1">
                  <p className="text-sm font-medium">Request ID</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {result.request_id}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Prompt</p>
                  <p className="text-xs text-muted-foreground line-clamp-4">
                    {result.prompt}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        Show prompt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Full prompt</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <pre className="whitespace-pre-wrap wrap-break-word text-sm">
                          {result.prompt}
                        </pre>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
