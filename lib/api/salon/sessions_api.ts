import api from "../axios_api";
import { ApiResponse } from "../response";

export interface Rating {
    id: number;
    rating: number;
    created_at: string;
    updated_at: string;
    salon: number;
    session: number;
    api_result: number;
}

export interface ApiResult {
    id: number;
    ratings: Rating[];
    request_id: string;
    polling_url: string;
    is_ready: boolean;
    output_url: string;
    prompt: string;
    created_at: string;
    salon: number;
    session: number;
}

export interface SalonSession {
    id: number;
    salon: number;
    status: string; // "A" | "C"
    results: ApiResult[];
    session_time: string | null; // seconds as string
    created_at: string;
    closed_at: string | null;
}

export const getSalonSessions = async (): Promise<ApiResponse<SalonSession[] | null>> => {
    try {
        const response = await api.get("/salon/sessions/");
        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message ?? "Success",
                data: (response.data?.data ?? []) as SalonSession[],
            };
        }
    } catch (error) {
        console.error("Failed to fetch salon sessions:", error);
        return {
            success: false,
            status: 400,
            message: "Failed to fetch salon sessions",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to fetch salon sessions",
        data: null,
    };
};


