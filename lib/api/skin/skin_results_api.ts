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

export interface ReportTokenData {
    id: number;
    token: string;
    expires_at: string;
}

/** Mints a fresh report token for a skin analysis result so its customer-facing
 * PDF report (rendered by the FLUX app) can be downloaded from the admin,
 * even long after the original analysis-time token has expired. */
export const generateSkinReportToken = async (
    resultId: number
): Promise<ApiResponse<ReportTokenData | null>> => {
    try {
        const response = await api.post(`/skin/results/${resultId}/report-token/`);
        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message ?? "Success",
                data: response.data.data as ReportTokenData,
            };
        }
    } catch (error) {
        console.error("Failed to generate skin report token:", error);
        return {
            success: false,
            status: 400,
            message: "Failed to generate report token",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to generate report token",
        data: null,
    };
};

// Export skin analysis results
export const exportSkinResults = async (): Promise<void> => {
    try {
        const response = await api.get("/skin/export/", {
            responseType: "blob",
        });

        // Create a blob from the response
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Extract filename from content-disposition header if available
        const contentDisposition = response.headers["content-disposition"];
        let filename = "skin-analysis-export.xlsx"; // default filename
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
        console.error("Failed to export skin results:", error);
        throw error;
    }
};


