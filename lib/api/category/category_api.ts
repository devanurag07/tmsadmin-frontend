import { ApiResponse } from "../response"
import api from "../axios_api";




interface ProductSubCategory {
    id: number,
    name: string,
    description: string
    is_active: boolean
    category: number
}
export interface ProductCategory {
    id: number,
    name: string,
    description: string
    is_active: boolean
    sub_categories: Array<ProductSubCategory>
}



//fetch available categories of product 
export const get_product_categories = async (): Promise<ApiResponse<Array<ProductCategory> | null>> => {
    try {
        const response = await api.get("/salon/categories/")
        if (response.status == 200) {
            return {
                status: response.status,
                success: true,
                data: response.data,
                message: "Fetched Categories Successfully"
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
        message: 'Something went wrong',
        success: false,
        data: null
    }
}



//fetch availabel subcategories by category id