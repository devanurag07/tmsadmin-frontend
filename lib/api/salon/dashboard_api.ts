import api from "../axios_api";
import { ApiResponse } from "../response";
import {
  SalonDashboardFilters,
  salonFiltersToQuery,
} from "@/lib/salon/filters";

export interface SalonInfo {
  id: number;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  contact_person: string;
  is_active: boolean;
  created_at: string;
}

export interface SalonSummary {
  total_customers: number;
  total_sessions: number;
  male_customers: number;
  female_customers: number;
}

export interface NameCount {
  name: string;
  count: number;
}

export interface GenderStyleBreakdown {
  male: NameCount[];
  female: NameCount[];
}

export interface VtoAnalytics {
  total_hairstyle_trials: number;
  total_haircolor_trials: number;
  total_beard_trials: number;
  total_clothing_trials: number;
  total_trials: number;
  distinct_customers: number;
  avg_hairstyles_per_customer: number;
  avg_haircolors_per_customer: number;
  avg_beard_per_customer: number;
  most_popular_hairstyle: NameCount[];
  most_popular_haircolor: NameCount[];
  most_popular_beard: NameCount[];
  top_hairstyles: NameCount[];
  top_haircolors: NameCount[];
  top_beards: NameCount[];
  top_hairstyles_by_gender?: GenderStyleBreakdown;
  top_haircolors_by_gender?: GenderStyleBreakdown;
  sessions_per_customer_avg: number;
  repeat_users: number;
  new_users: number;
  monthly_trend: {
    label: string;
    hairstyle: number;
    haircolor: number;
    beard: number;
    clothing: number;
    total: number;
  }[];
  gender_note: string;
}

export interface ServiceAnalytics {
  total_analyses: number;
  gender_counts: { male: number; female: number; other: number };
  gender_pct: { male_pct: number; female_pct: number; other_pct?: number };
  skin_metrics?: Record<string, number>;
  hair_metrics?: Record<string, number>;
  parameter_distribution: Record<string, { bucket: string; count: number }[]>;
  parameters: string[];
  scalp_session_count?: number;
  deep_analysis_count?: number;
}

export interface SalonDashboard {
  salon: SalonInfo;
  summary: SalonSummary;
  virtual_tryon: VtoAnalytics;
  skin_analysis: ServiceAnalytics;
  hair_analysis: ServiceAnalytics;
}

export const fetchSalonDashboard = async (
  filters: SalonDashboardFilters
): Promise<SalonDashboard> => {
  const res = await api.get(`/salon/dashboard/${salonFiltersToQuery(filters)}`);
  return res.data.data as SalonDashboard;
};

export const fetchSalonDashboardRaw = async (
  filters: SalonDashboardFilters
): Promise<ApiResponse<SalonDashboard | null>> => {
  try {
    const res = await api.get(`/salon/dashboard/${salonFiltersToQuery(filters)}`);
    if (res.status === 200) {
      return {
        success: true,
        status: res.status,
        message: res.data.message ?? "Success",
        data: res.data.data as SalonDashboard,
      };
    }
    return { success: false, status: res.status, message: "Failed", data: null };
  } catch (error) {
    console.error("Failed to fetch salon dashboard:", error);
    return {
      success: false,
      status: 400,
      message: "Failed to fetch salon dashboard",
      data: null,
    };
  }
};
