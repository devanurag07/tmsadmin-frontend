import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8000/api/salon",
})



api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access-tmsadmin")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})


api.interceptors.response.use((response) => {
    return response
}, (error) => {
    if (error.response.status === 401) {
        localStorage.removeItem("access-tmsadmin")
        localStorage.removeItem("refresh-tmsadmin")
        window.location.href = "/login"
    }
    return Promise.reject(error)
})

export default api