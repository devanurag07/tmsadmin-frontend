import api from "../axios_api";
import { GET_DELETE_PRODUCT_URL } from "../constants";
import { ApiResponse } from "../response";

export const delete_product = async (product_id: number): Promise<ApiResponse<boolean>> => {
    try {
        const response = await api.delete(GET_DELETE_PRODUCT_URL(product_id));
        if (response.status == 200) {
            return {
                status: response.status,
                success: true,
                data: true,
                message: "Product Deleted Successfully"
            }
        }
    } catch (error) {
        return {
            status: 400,
            success: false,
            data: false,
            message: error as string
        }
    }

    return {
        status: 400,
        success: false,
        data: false,
        message: "Something went wrong."
    }
}