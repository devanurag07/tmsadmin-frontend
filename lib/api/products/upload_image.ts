import api from "../axios_api";
import { GET_IMAGE_UPLOAD_URL } from "../constants";


export const upload_product_image = async (file: File, product_id: number, onProgress?: (percent: number) => void) => {
    try {
        const filename = file.name;
        const fileType = file.type;
        console.log(fileType);
        console.log(filename);
        if (fileType !== "image/jpeg" && fileType !== "image/png" && fileType !== "image/jpg") {
            return {
                status: 400,
                success: false,
                data: null,
                message: "Invalid file type. Only jpg, png, and jpeg are allowed."
            }
        }

        const response = await api.get(GET_IMAGE_UPLOAD_URL(filename, fileType));
        console.log(response);

        if (response.status == 200) {
            const data = response.data;
            const presigned_url = data.data.presigned_url;
            const public_url = data.data.public_url;

            const formData = new FormData();
            formData.append("file", file);

            // Use XMLHttpRequest for progress
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", presigned_url, true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        onProgress(percent);
                    }
                };

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve({
                            status: xhr.status,
                            success: true,
                            data: public_url,
                            message: "Image uploaded successfully"
                        });
                    } else {
                        resolve({
                            status: xhr.status,
                            success: false,
                            data: null,
                            message: "Image upload failed"
                        });
                    }
                };

                xhr.onerror = function () {
                    resolve({
                        status: 400,
                        success: false,
                        data: null,
                        message: "Image upload failed"
                    });
                };

                xhr.send(file);
            });
        }

    } catch (error) {
        return {
            status: 400,
            success: false,
            data: null,
            message: error as string
        }
    }
}