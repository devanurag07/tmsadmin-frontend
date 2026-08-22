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

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export type UploadProgressInfo = {
    percent: number;
    loaded: number;
    total: number;
    /** `uploading` = bytes to API; `processing` = server pushing to cloud storage. */
    phase: "uploading" | "processing";
};

/** Upload a screensaver video for the current salon (mp4/webm, ≤200MB). */
export const uploadSalonVideo = async (
    file: File,
    onProgress?: (info: UploadProgressInfo) => void
): Promise<UploadImageResult> => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return {
            status: 400,
            success: false,
            data: null,
            message: "Invalid file type. Only mp4 and webm are allowed.",
        };
    }

    if (file.size > MAX_VIDEO_BYTES) {
        return {
            status: 400,
            success: false,
            data: null,
            message: "Video must be 200MB or smaller.",
        };
    }

    const formData = new FormData();
    formData.append("file", file);

    const baseURL = (api.defaults.baseURL || "").replace(/\/$/, "");
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("access-tmsadmin")
            : null;

    // Large videos are re-uploaded server-side to UploadThing after the browser
    // finishes POSTing — allow enough time for that second hop.
    const REQUEST_TIMEOUT_MS = 20 * 60 * 1000;

    return await new Promise<UploadImageResult>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${baseURL}/salon/video-upload/`, true);
        xhr.timeout = REQUEST_TIMEOUT_MS;

        if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
            if (!onProgress) return;
            const total = event.lengthComputable ? event.total : file.size;
            const loaded = event.loaded;
            const percent =
                total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
            onProgress({ percent, loaded, total, phase: "uploading" });
        };

        // Browser finished sending bytes — server is still uploading to cloud.
        xhr.upload.onload = () => {
            onProgress?.({
                percent: 100,
                loaded: file.size,
                total: file.size,
                phase: "processing",
            });
        };

        xhr.onload = () => {
            let payload: {
                success?: boolean;
                message?: string;
                data?: { file_url?: string };
            } | null = null;

            try {
                payload = JSON.parse(xhr.responseText);
            } catch {
                payload = null;
            }

            if (xhr.status === 200 && payload?.success && payload.data?.file_url) {
                onProgress?.({
                    percent: 100,
                    loaded: file.size,
                    total: file.size,
                    phase: "processing",
                });
                resolve({
                    status: xhr.status,
                    success: true,
                    data: payload.data.file_url,
                    message: payload.message || "Video uploaded successfully",
                });
                return;
            }

            resolve({
                status: xhr.status,
                success: false,
                data: null,
                message:
                    payload?.message ||
                    `Video upload failed (${xhr.status || "network"})`,
            });
        };

        xhr.onerror = () => {
            resolve({
                status: 0,
                success: false,
                data: null,
                message: "Video upload failed",
            });
        };

        xhr.ontimeout = () => {
            resolve({
                status: 0,
                success: false,
                data: null,
                message:
                    "Upload timed out while processing on the server. Try a shorter video or try again.",
            });
        };

        xhr.send(formData);
    });
};

