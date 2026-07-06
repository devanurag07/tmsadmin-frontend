"use client";

import { useEffect, useState, useCallback } from "react";
import {
  SalonDashboard,
  fetchSalonDashboard,
} from "@/lib/api/salon/dashboard_api";
import { SalonDashboardFilters } from "@/lib/salon/filters";

interface State {
  data: SalonDashboard | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useSalonDashboard(filters: SalonDashboardFilters): State {
  const [data, setData] = useState<SalonDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSalonDashboard(filters)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setData(null);
        setError(e?.message ?? "Failed to load dashboard");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateRange, filters.gender, filters.service, filters.startDate, filters.endDate, nonce]);

  return { data, loading, error, reload };
}
