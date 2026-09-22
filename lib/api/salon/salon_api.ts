import api from "../axios_api";
import { ApiResponse } from "../response";

// Salon data interface based on the API response
export interface SalonData {
    id: number;
    name: string;
    address: string;
    code: string;
    is_active: boolean;
    logo_image: string;
    screensaver_video?: string;
    show_pricing?: boolean;
    homepage_welcome_text?: string;
    homepage_doodle_image?: string;
    theme_primary_color?: string;
    theme_bg_color?: string;
    theme_accent_color?: string;
}

// Update salon data interface
export interface UpdateSalonData {
    name?: string;
    address?: string;
    screensaver_video?: string;
    show_pricing?: boolean;
    homepage_welcome_text?: string;
    homepage_doodle_image?: string;
    theme_primary_color?: string;
    theme_bg_color?: string;
    theme_accent_color?: string;
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

/** Persist the salon's mirror kiosk screensaver video URL (empty string clears it). */
export const updateSalonScreensaverVideo = async (
    videoUrl: string
): Promise<ApiResponse<SalonData | null>> => {
    try {
        const response = await api.post("/salon/current", {
            screensaver_video: videoUrl,
        });

        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message,
                data: response.data.data,
            };
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 400,
            message: "Failed to update screensaver video",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to update screensaver video",
        data: null,
    };
};

/** Update homepage customization (welcome text, doodle image, theme colors). */
export const updateHomepageCustomization = async (
    data: Pick<UpdateSalonData, "homepage_welcome_text" | "homepage_doodle_image" | "theme_primary_color" | "theme_bg_color" | "theme_accent_color">
): Promise<ApiResponse<SalonData | null>> => {
    try {
        const response = await api.post("/salon/current", data);

        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message,
                data: response.data.data,
            };
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 400,
            message: "Failed to update homepage customization",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to update homepage customization",
        data: null,
    };
};

/** Persist whether the mirror kiosk shows product prices. */
export const updateSalonShowPricing = async (
    showPricing: boolean
): Promise<ApiResponse<SalonData | null>> => {
    try {
        const response = await api.post("/salon/current", {
            show_pricing: showPricing,
        });

        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message,
                data: response.data.data,
            };
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 400,
            message: "Failed to update pricing setting",
            data: null,
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to update pricing setting",
        data: null,
    };
};