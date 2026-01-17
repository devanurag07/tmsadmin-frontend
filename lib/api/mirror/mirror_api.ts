import api from "../axios_api";
import { ApiResponse } from "../response";

// Mirror API result interface
export interface MirrorApiResult {
    id: number;
    request_id: string;
    polling_url: string;
    is_ready: boolean;
    output_url: string;
    prompt: string;
    created_at: string;
    salon: number;
}

export interface HairAttribute {
    attribute: string;
    score: number;
    analysis: string;
    recommendation: string;
}

export interface HairResultRecord {
    id: number;
    name: string | null;
    phone_number: string | null;
    image: string;
    result: {
        hair_attributes: HairAttribute[];
        weekly_routine: string[];
    };
    created_at: string;
    salon: number;
}

// Get mirror API results
export const getMirrorApiResults = async (limit: number = 500): Promise<ApiResponse<MirrorApiResult[] | null>> => {
    try {
        const response = await api.get(`/salon/mirror/api-results/?limit=${limit}`);

        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message,
                data: response.data.data
            };
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 400,
            message: "Failed to fetch mirror API results",
            data: null
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to fetch mirror API results",
        data: null
    };
};

// Get hair results
export const getHairResults = async (): Promise<ApiResponse<HairResultRecord[] | null>> => {
    try {
        const response = await api.get("/salon/mirror/hair-results/");
        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message ?? "Success",
                data: (response.data?.data ?? []) as HairResultRecord[],
            };
        }
    } catch (error) {
        console.error("Failed to fetch hair results:", error);
        return {
            success: false,
            status: 400,
            message: "Failed to fetch hair results",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to fetch hair results",
        data: null,
    };
};

// Export hair analysis results
export const exportHairResults = async (): Promise<void> => {
    try {
        const response = await api.get("/salon/deep-hair-analysis/export/", {
            responseType: "blob",
        });

        // Create a blob from the response
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Extract filename from content-disposition header if available
        const contentDisposition = response.headers["content-disposition"];
        let filename = "hair-analysis-export.xlsx"; // default filename
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export hair results:", error);
        throw error;
    }
};
