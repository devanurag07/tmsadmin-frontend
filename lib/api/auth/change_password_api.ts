import api from "../axios_api";
import { ApiResponse } from "../response";

// Change password data interface
export interface ChangePasswordData {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
}

// Change password response interface
export interface ChangePasswordResponse {
    message: string;
}

// Change password function
export const changePassword = async (passwordData: ChangePasswordData): Promise<ApiResponse<ChangePasswordResponse | null>> => {
    try {
        const response = await api.post("/auth/change-password/", passwordData);

        if (response.status === 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message,
                data: response.data
            };
        }
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            status: error.response?.status || 400,
            message: error.response?.data?.message || "Failed to change password",
            data: null
        };
    }

    return {
        success: false,
        status: 400,
        message: "Failed to change password",
        data: null
    };
};
