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
  Image as ImageIcon,
  RefreshCw,
  Star,
  Search,
  Users,
} from "lucide-react";
import { getSalonSessions, SalonSession } from "@/lib/api/salon/sessions_api";
import { vtoResultLabel } from "@/lib/analytics/vtoResultLabel";
import { useTranslation } from "@/lib/i18n/language-provider";

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
  const { t } = useTranslation();

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
    // A session is one customer at the mirror; only count those who tried something on.
    const customers = sessions.filter((s) => s.results.length > 0).length;
    const imagesProcessed = sessions.reduce(
      (sum, s) => sum + s.results.filter((r) => r.is_ready).length,
      0
    );
    return { customers, imagesProcessed };
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
      if (s.results.some((r) => vtoResultLabel(r).toLowerCase().includes(q)))
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
          <p className="text-muted-foreground">{t("vto.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">{t("nav.vtoData")}</h1>
          <p className="text-muted-foreground">{t("vto.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("common.refresh")}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("vto.customers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customers}</div>
            <p className="text-xs text-muted-foreground">{t("vto.customersHint")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("vto.images")}</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.imagesProcessed}</div>
            <p className="text-xs text-muted-foreground">{t("vto.imagesHint")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("vto.sessions")}</CardTitle>
            <CardDescription>{t("vto.sessionsDesc")}</CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("vto.searchPlaceholder")}
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
              <span className="text-sm text-muted-foreground">{t("vto.to")}</span>
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
                  {t("vto.clear")}
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
                <SelectItem value="newest">{t("vto.newest")}</SelectItem>
                <SelectItem value="oldest">{t("vto.oldest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">{t("vto.empty")}</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredSessions
                .filter((session) => session.results.length > 0)
                .map((session) => {
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
                                {t("vto.customer")} #{session.id}
                              </span>
                              <Badge variant="secondary">
                                {session.results.length} {t("vto.results")}
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {t("vto.started")} {formatDateTime(session.created_at)}
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
                                        alt={vtoResultLabel(result)}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="text-sm font-medium line-clamp-2">
                                        {vtoResultLabel(result)}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                        <span>{avg}</span>
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDateTime(result.created_at)}
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
