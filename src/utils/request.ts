import axios from "axios"
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { ElMessage } from "element-plus"

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
})

const useUserStore = () => {
  // Mock implementation of useUserStore for demonstration purposes
  return {
    token: "mockToken",
    logout: () => {
      console.log("User logged out")
    },
  }
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()

    if (userStore.token) {
      config.headers.set('Authorization', `Bearer ${userStore.token}`)
    }

    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data

    if (code === 200) {
      return data
    } else {
      ElMessage.error(message || "Request failed")
      return Promise.reject(new Error(message || "Request failed"))
    }
  },
  (error) => {
    console.error("Response error:", error)

    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
    } else {
      ElMessage.error(error.message || "Network error")
    }

    return Promise.reject(error)
  },
)

export default service
