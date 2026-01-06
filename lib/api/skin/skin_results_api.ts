import api from "../axios_api";
import { ApiResponse } from "../response";

export interface SkinMetric {
    name: string;
    score: number;
    analysis: string;
    suggestions: string;
}

export interface SkinResultRecord {
    id: number;
    name: string | null;
    phone_number: string | null;
    image: string;
    result: {
        skin_analysis: SkinMetric[];
    };
    created_at: string;
    salon: number;
}

export const getSkinResults = async (): Promise<ApiResponse<SkinResultRecord[] | null>> => {
    try {
        const response = await api.get("/skin/results/");
        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message ?? "Success",
                data: (response.data?.data ?? []) as SkinResultRecord[],
            };
        }
    } catch (error) {
        console.error("Failed to fetch skin results:", error);
        return {
            success: false,
            status: 400,
            message: "Failed to fetch skin results",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to fetch skin results",
        data: null,
    };
};


