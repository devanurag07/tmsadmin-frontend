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
