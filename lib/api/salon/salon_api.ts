import api from "../axios_api";
import { ApiResponse } from "../response";

// Salon data interface based on the API response
export interface SalonData {
    id: number;
    name: string;
    address: string;
    code: string;
    is_active: boolean;
    logo_image:string
}

// Update salon data interface
export interface UpdateSalonData {
    name: string;
    address: string;
}

// Get current salon data
export const getCurrentSalon = async (): Promise<ApiResponse<SalonData | null>> => {
    try {
        const response = await api.get("/salon/current");

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
            message: "Failed to fetch salon data",
            data: null
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to fetch salon data",
        data: null
    };
};

// Update current salon data
export const updateCurrentSalon = async (salonData: UpdateSalonData): Promise<ApiResponse<SalonData | null>> => {
    try {
        const response = await api.post("/salon/current", salonData);

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
            message: "Failed to update salon data",
            data: null
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to update salon data",
        data: null
    };
};


// Update current salon data
export const updateSalonLogo = async (imageUrl: string): Promise<ApiResponse<SalonData | null>> => {
    try {
        const response = await api.post("/salon/current", {
            logo_image:imageUrl
        });

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
            message: "Failed to update salon data",
            data: null
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to update salon data",
        data: null
    };
};