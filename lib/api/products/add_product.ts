import { Product } from "@/app/(salon)/products/columns";
import api from "../axios_api";
import { ADD_PRODUCT_URL } from "../constants";
import { ApiResponse } from "../response";
interface CreateProductData {
    name: string,
    brand: string,
    description: string,
    image: string,
    gender: "male" | "female" | "unisex",
    quantity: string,
    category: number,
    sub_category: number
    price: number,
}



export const add_product = async (product: CreateProductData): Promise<ApiResponse<Product | null>> => {
    try {
        const response = await api.post(ADD_PRODUCT_URL, {
            ...product
        });

        if (response.status == 201) {
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


