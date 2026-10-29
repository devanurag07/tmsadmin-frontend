import { isAxiosError } from "axios";
import api from "../axios_api";
import { upload_logo_image } from "../products/upload_image";
import type {
    CustomHairstyle,
    CustomHairstylesApi,
    NewCustomHairstyle,
} from "@/components/hairstyles/CustomHairstylesManager";

const BASE = "/customer-session/salon/hairstyles/";

/** Surfaces the backend's message ("Hairstyle 2: name, image, prompt and gender are required"). */
async function call<T>(request: Promise<{ data: { data: T } }>): Promise<T> {
    try {
        return (await request).data.data;
    } catch (error) {
        const message = isAxiosError(error) ? error.response?.data?.message : null;
        throw new Error(message || "Request failed");
    }
}

/** The salon's own custom hairstyles, shown on its mirror next to the default catalogue. */
export const salonCustomHairstylesApi: CustomHairstylesApi = {
    list: () => call<CustomHairstyle[]>(api.get(BASE)),
    create: (hairstyles: NewCustomHairstyle[]) => call<CustomHairstyle[]>(api.post(BASE, { hairstyles })),
    update: (id, data) => call<CustomHairstyle>(api.patch(`${BASE}${id}/`, data)),
    remove: async (id) => {
        await call(api.delete(`${BASE}${id}/`));
    },
};

export async function uploadHairstyleImage(file: File): Promise<string> {
    const result = await upload_logo_image(file);
    if (!result.success || !result.data) throw new Error(result.message || "Image upload failed");
    return result.data;
}
