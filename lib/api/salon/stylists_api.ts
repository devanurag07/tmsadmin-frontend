import api from "../axios_api";
import { ApiResponse } from "../response";

export interface Stylist {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

/** First field error from a DRF validation response, if any. */
const errorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { data?: unknown } } })?.response
    ?.data?.data;
  if (data && typeof data === "object") {
    const first = Object.values(data as Record<string, unknown>)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }
  return fallback;
};

export const fetchStylists = async (): Promise<ApiResponse<Stylist[]>> => {
  try {
    const res = await api.get("/salon/stylists/");
    return { success: true, status: res.status, message: res.data.message, data: res.data.data };
  } catch (error) {
    console.error("Failed to fetch stylists:", error);
    return { success: false, status: 400, message: "Failed to load stylists", data: [] };
  }
};

export const createStylist = async (name: string): Promise<ApiResponse<Stylist | null>> => {
  try {
    const res = await api.post("/salon/stylists/", { name });
    return { success: true, status: res.status, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, status: 400, message: errorMessage(error, "Failed to add stylist"), data: null };
  }
};

export const renameStylist = async (
  id: number,
  name: string
): Promise<ApiResponse<Stylist | null>> => {
  try {
    const res = await api.patch(`/salon/stylists/${id}/`, { name });
    return { success: true, status: res.status, message: res.data.message, data: res.data.data };
  } catch (error) {
    return { success: false, status: 400, message: errorMessage(error, "Failed to rename stylist"), data: null };
  }
};

/** Removes the stylist from the kiosk; past consultations stay on the dashboard. */
export const deleteStylist = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const res = await api.delete(`/salon/stylists/${id}/`);
    return { success: true, status: res.status, message: "Stylist removed", data: null };
  } catch (error) {
    console.error("Failed to remove stylist:", error);
    return { success: false, status: 400, message: "Failed to remove stylist", data: null };
  }
};
