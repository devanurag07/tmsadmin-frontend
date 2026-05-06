import api from "../axios_api";
import { GET_IMAGE_UPLOAD_URL } from "../constants";

type UploadImageResult = {
    status: number;
    success: boolean;
    data: string | null;
    message: string;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

async function uploadViaUploadThing(
    file: File,
    onProgress?: (percent: number) => void
): Promise<UploadImageResult> {
    const filename = file.name;
    const fileType = file.type;
    const fileSize = file.size;

    if (!ALLOWED_TYPES.includes(fileType)) {
        return {
            status: 400,
            success: false,
            data: null,
            message: "Invalid file type. Only jpg, png, and jpeg are allowed.",
        };
    }

    const response = await api.get(GET_IMAGE_UPLOAD_URL(filename, fileType, fileSize));
    console.log(response);

    if (response.status !== 200) {
        return {
            status: response.status,
            success: false,
            data: null,
            message: response.data?.message || "Failed to get upload URL",
        };
    }

    const { upload_url, upload_fields, file_url } = response.data.data;

    // Build multipart form-data: fields must come before the file for S3
    const formData = new FormData();
    for (const [key, value] of Object.entries(upload_fields as Record<string, string>)) {
        formData.append(key, value);
    }
    formData.append("file", file);

    return new Promise<UploadImageResult>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", upload_url, true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = function () {
            // S3 presigned POST returns 204 on success
            if (xhr.status === 204 || xhr.status === 200) {
                resolve({
                    status: xhr.status,
                    success: true,
                    data: file_url,
                    message: "Image uploaded successfully",
                });
            } else {
                resolve({
                    status: xhr.status,
                    success: false,
                    data: null,
                    message: `Image upload failed (${xhr.status})`,
                });
            }
        };

        xhr.onerror = function () {
            resolve({
                status: 0,
                success: false,
                data: null,
                message: "Image upload failed",
            });
        };

        xhr.send(formData);
    });
}

export const upload_product_image = async (
    file: File,
    product_id: number,
    onProgress?: (percent: number) => void
): Promise<UploadImageResult> => {
    try {
        return await uploadViaUploadThing(file, onProgress);
    } catch (error) {
        return {
            status: 400,
            success: false,
            data: null,
            message: String(error),
        };
    }
};

export const upload_logo_image = async (
    file: File,
    onProgress?: (percent: number) => void
): Promise<UploadImageResult> => {
    try {
        return await uploadViaUploadThing(file, onProgress);
    } catch (error) {
        return {
            status: 400,
            success: false,
            data: null,
            message: String(error),
        };
    }
};
