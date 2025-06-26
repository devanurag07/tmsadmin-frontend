import { Product } from "@/app/(salon)/products/columns";
import api from "../axios_api";
import { ADD_PRODUCT_URL, GET_UPDATE_PRODUCT_URL } from "../constants";
import { ApiResponse } from "../response";

interface UpdateProductData {
    name: string,
    brand: string,
    description: string,
    image: string,
    gender: "male" | "female" | "unisex",
    quantity: string,
    category: number,
    sub_category: number,
    price: number
}



export const update_product = async (product_id: number, product: UpdateProductData): Promise<ApiResponse<Product | null>> => {
    try {
        const response = await api.patch(GET_UPDATE_PRODUCT_URL(product_id), {
            ...product
        });

        if (response.status == 200) {
            return {
                status: response.status,
                success: true,
                data: response.data,
                message: "Created Product Successfully"
            }
        }
    } catch (error) {
        return {
            status: 400,
            success: false,
            data: null,
            message: error as string
        }
    }

    return {
        status: 400,
        success: false,
        data: null,
        message: "Something went wrong."
    }
}