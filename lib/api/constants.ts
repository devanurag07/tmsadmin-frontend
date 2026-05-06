export const ADD_PRODUCT_URL = "/salon/products/";
export const GET_IMAGE_UPLOAD_URL = (filename: string, filetype: string, filesize: number) => {
    return `/salon/image-upload?file_name=${filename}&file_type=${filetype}&file_size=${filesize}`
}
export const GET_DELETE_PRODUCT_URL = (product_id: number) => {
    return `/salon/products/${product_id}/`
}
export const GET_UPDATE_PRODUCT_URL = (product_id: number) => {
    return `/salon/products/${product_id}/`
}
