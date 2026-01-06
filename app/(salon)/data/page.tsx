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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  Clock,
  Image as ImageIcon,
  RefreshCw,
  Star,
  Search,
} from "lucide-react";
import { getSalonSessions, SalonSession } from "@/lib/api/salon/sessions_api";

const formatSeconds = (secondsString: string | null): string => {
  if (!secondsString) return "-";
  const seconds = Math.max(0, Math.floor(parseFloat(secondsString)));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString);
  return d.toLocaleString();
};

type SortOrder = "newest" | "oldest";

const DataPage = () => {
  const [sessions, setSessions] = useState<SalonSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSalonSessions();
      if (res.success && res.data) {
        setSessions(res.data);
      } else {
        setError(res.message || "Failed to fetch sessions");
      }
    } catch (e) {
      setError("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === "C").length;
    const active = sessions.filter((s) => s.status === "A").length;

    const times = sessions
      .map((s) => (s.session_time ? parseFloat(s.session_time) : NaN))
      .filter((n) => !Number.isNaN(n)) as number[];
    const avgSessionTime = times.length
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;

    const allRatings: number[] = [];
    sessions.forEach((s) =>
      s.results.forEach((r) =>
        r.ratings.forEach((rt) => allRatings.push(rt.rating))
      )
    );
    const avgRating = allRatings.length
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

    const totalResults = sessions.reduce((sum, s) => sum + s.results.length, 0);

    return {
      total,
      completed,
      active,
      avgSessionTime,
      avgRating,
      totalResults,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toMs = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;

    const matchesDate = (s: SalonSession) => {
      const t = new Date(s.created_at).getTime();
      if (Number.isNaN(t)) return true;
      if (fromMs !== null && t < fromMs) return false;
      if (toMs !== null && t > toMs) return false;
      return true;
    };

    const matchesQuery = (s: SalonSession) => {
      if (!q) return true;
      if (String(s.id).includes(q)) return true;
      if (s.results.some((r) => r.request_id.toLowerCase().includes(q)))
        return true;
      if (s.results.some((r) => (r.prompt || "").toLowerCase().includes(q)))
        return true;
      return false;
    };

    const dir = sortOrder === "newest" ? -1 : 1;

    return [...sessions]
      .filter(matchesDate)
      .filter(matchesQuery)
      .sort(
        (a, b) =>
          (new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()) *
          dir
      );
  }, [sessions, sortOrder, search, fromDate, toDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sessions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salon Sessions</h1>
          <p className="text-muted-foreground">
            Browse sessions, results, prompts, and ratings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">All sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="secondary">A</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge variant="outline">C</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completed}</div>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Session Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatSeconds(String(metrics.avgSessionTime))}
            </div>
            <p className="text-xs text-muted-foreground">
              Average of recorded sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgRating ? metrics.avgRating.toFixed(1) : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalResults} results
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              Filter, search, and expand a session to view its results
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search session, request id, prompt…"
                className="pl-9"
              />
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
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as SortOrder)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">No sessions found.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredSessions
                .filter((session) => session.results.length > 0)
                .map((session) => {
                  const statusLabel =
                    session.status === "C" ? "Completed" : "Active";

                  const sessionRatings: number[] = [];
                  session.results.forEach((r) =>
                    r.ratings.forEach((rt) => sessionRatings.push(rt.rating))
                  );
                  const sessionAvgRating = sessionRatings.length
                    ? (
                        sessionRatings.reduce((a, b) => a + b, 0) /
                        sessionRatings.length
                      ).toFixed(1)
                    : "-";

                  return (
                    <AccordionItem
                      key={session.id}
                      value={String(session.id)}
                      className="border rounded-lg px-4 mb-3 last:mb-0"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex w-full items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                Session #{session.id}
                              </span>
                              <Badge
                                variant={
                                  session.status === "C"
                                    ? "outline"
                                    : "secondary"
                                }
                              >
                                {statusLabel}
                              </Badge>
                              <Badge variant="secondary">
                                {session.results.length} results
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Started {formatDateTime(session.created_at)}
                              {session.closed_at
                                ? ` • Closed ${formatDateTime(
                                    session.closed_at
                                  )}`
                                : ""}
                              {session.session_time
                                ? ` • ${formatSeconds(session.session_time)}`
                                : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            <span>{sessionAvgRating}</span>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        {session.results.length === 0 ? (
                          <div className="py-2 text-sm text-muted-foreground">
                            No results for this session yet.
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {session.results.map((result) => {
                              const ratings = result.ratings.map(
                                (r) => r.rating
                              );
                              const avg = ratings.length
                                ? (
                                    ratings.reduce((a, b) => a + b, 0) /
                                    ratings.length
                                  ).toFixed(1)
                                : "-";

                              return (
                                <div
                                  key={result.id}
                                  className="rounded-lg border p-3 flex gap-3"
                                >
                                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center shrink-0">
                                    {result.output_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={result.output_url}
                                        alt="Result"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-xs text-muted-foreground truncate">
                                        {result.request_id}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                        <span>{avg}</span>
                                      </div>
                                    </div>

                                    <div className="text-sm line-clamp-2">
                                      {result.prompt}
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-xs text-muted-foreground">
                                        {formatDateTime(result.created_at)}
                                      </div>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                          >
                                            Show prompt
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Prompt</DialogTitle>
                                          </DialogHeader>
                                          <ScrollArea className="max-h-[60vh] pr-4">
                                            <pre className="whitespace-pre-wrap wrap-break-word text-sm">
                                              {result.prompt}
                                            </pre>
                                          </ScrollArea>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPage;
