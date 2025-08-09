import api from "../axios_api";
import { ApiResponse } from "../response";

export const login = async (email: string, password: string): Promise<ApiResponse<{ access: string, refresh: string } | null>> => {
    try {
        const response = await api.post("/salon/token/", { username: email, password: password })

        if (response.status == 200) {
            return {
                success: true,
                status: response.status,
                message: response.data.message,
                data: response.data
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            status: 400,
            message: "Invalid email or password",
            data: null
        }
    }

    return {
        success: false,
        status: 400,
        message: "Invalid email or password",
        data: null
    }
}

