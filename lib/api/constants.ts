export const ADD_PRODUCT_URL = "/products/";
export const GET_IMAGE_UPLOAD_URL = (filename: string, filetype: string) => {
    return `/image-upload?file_name=${filename}&file_type=${filetype}`
}
export const GET_DELETE_PRODUCT_URL = (product_id: number) => {
    return `/products/${product_id}/`
}
export const GET_UPDATE_PRODUCT_URL = (product_id: number) => {
    return `/products/${product_id}/`
}

