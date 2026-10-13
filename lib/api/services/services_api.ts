import api from "../axios_api";

export type ServiceGender = "male" | "female" | "unisex";
export type ServiceType = "hair" | "skin";
export type ServiceCurrency = "INR" | "USD" | "EUR" | "KWD";

export interface SalonService {
    id: number;
    name: string;
    description: string;
    image: string | null;
    gender: ServiceGender;
    duration: string;
    is_active: boolean;
    category: number;
    sub_category: number | null;
    category_name: string;
    subcategory_name: string;
    price: number;
    currency: ServiceCurrency;
    service_type: ServiceType;
    created_at: string;
}

export interface ServiceInput {
    name: string;
    description: string;
    image: string | null;
    gender: ServiceGender;
    duration: string;
    is_active: boolean;
    category: number;
    sub_category: number | null;
    price: number;
    currency: ServiceCurrency;
    service_type: ServiceType;
}

export interface ServiceCategory {
    id: number;
    name: string;
    sub_categories: { id: number; name: string }[];
}

const SERVICES_URL = "/salon/services/";
const SERVICE_URL = (id: number) => `/salon/services/${id}/`;
const SERVICE_CATEGORIES_URL = "/salon/services/categories/";

export const getServices = async (): Promise<SalonService[]> => {
    // ?all=1 includes inactive services so the catalog can manage them
    const response = await api.get(`${SERVICES_URL}?all=1`);
    const payload = response.data?.data ?? response.data;
    return Array.isArray(payload) ? payload : [];
};

export const createService = async (service: ServiceInput): Promise<SalonService> => {
    const response = await api.post(SERVICES_URL, service);
    return response.data;
};

export const updateService = async (id: number, service: Partial<ServiceInput>): Promise<SalonService> => {
    const response = await api.patch(SERVICE_URL(id), service);
    return response.data;
};

export const deleteService = async (id: number): Promise<void> => {
    await api.delete(SERVICE_URL(id));
};

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
    const response = await api.get(SERVICE_CATEGORIES_URL);
    return response.data?.data ?? [];
};

export const createServiceCategory = async (name: string): Promise<ServiceCategory> => {
    const response = await api.post(SERVICE_CATEGORIES_URL, { name, type: "category" });
    return response.data.data;
};

export const createServiceSubCategory = async (
    name: string,
    categoryId: number
): Promise<{ id: number; name: string }> => {
    const response = await api.post(SERVICE_CATEGORIES_URL, {
        name,
        category_id: categoryId,
        type: "sub_category",
    });
    return response.data.data;
};
