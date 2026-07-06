import { differenceInCalendarDays, format, subMonths } from "date-fns";

export type DateRangePreset =
  | "overall"
  | "today"
  | "week"
  | "month"
  | "last_month"
  | "custom";

export type ServiceFilter = "all" | "vto" | "skin" | "hair";
export type GenderFilter = "all" | "M" | "F";

export interface SalonDashboardFilters {
  gender: GenderFilter;
  service: ServiceFilter;
  dateRange: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_SALON_FILTERS: SalonDashboardFilters = {
  gender: "all",
  service: "all",
  dateRange: "month",
};

export function salonFiltersToQuery(filters: SalonDashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.gender !== "all") params.set("gender", filters.gender);
  if (filters.service !== "all") params.set("service", filters.service);
  params.set("date_range", filters.dateRange);
  if (filters.dateRange === "custom" && filters.startDate) {
    params.set("start_date", filters.startDate);
  }
  if (filters.dateRange === "custom" && filters.endDate) {
    params.set("end_date", filters.endDate);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Human-readable period label aligned with backend date_range parsing. */
export function dateRangeDescription(filters: SalonDashboardFilters): string {
  const today = new Date();
  switch (filters.dateRange) {
    case "overall":
      return "Overall (all time)";
    case "today":
      return "Today";
    case "week":
      return "Last 7 days";
    case "month":
      return `This month (${format(today, "MMM yyyy")})`;
    case "last_month": {
      const last = subMonths(today, 1);
      return `Last calendar month (${format(last, "MMM yyyy")})`;
    }
    case "custom": {
      if (filters.startDate && filters.endDate) {
        const days =
          differenceInCalendarDays(
            new Date(filters.endDate),
            new Date(filters.startDate)
          ) + 1;
        return `${format(new Date(filters.startDate), "MMM d")} – ${format(new Date(filters.endDate), "MMM d, yyyy")} (${days} days)`;
      }
      return "Custom date range";
    }
    default:
      return `This month (${format(today, "MMM yyyy")})`;
  }
}
