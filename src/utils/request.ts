import axios from "axios"
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { ElMessage } from "element-plus"
import { requestCacheManager } from "./requestCache"
import type { RequestCacheConfig } from "@/types/cache"

// 扩展 AxiosRequestConfig 以支持缓存配置
declare module 'axios' {
  interface AxiosRequestConfig {
    cache?: Partial<RequestCacheConfig>
    metadata?: {
      cacheKey?: string
      cacheConfig?: RequestCacheConfig
      startTime?: number
    }
  }

  interface InternalAxiosRequestConfig {
    cache?: Partial<RequestCacheConfig>
    metadata?: {
      cacheKey?: string
      cacheConfig?: RequestCacheConfig
      startTime?: number
    }
  }
}

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
  async (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()

    if (userStore.token) {
      config.headers.set('Authorization', `Bearer ${userStore.token}`)
    }

    // 处理缓存逻辑
    if (config.cache) {
      const cacheConfig = requestCacheManager.mergeConfig(config.cache)

      if (requestCacheManager.shouldCache(config, cacheConfig)) {
        const cacheKey = requestCacheManager.generateCacheKey(config.url || '', config, cacheConfig)

        // 将缓存配置和键添加到请求配置中，供响应拦截器使用
        config.metadata = {
          cacheKey,
          cacheConfig,
          startTime: Date.now()
        }
      }
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
    // 处理缓存存储
    const config = response.config as InternalAxiosRequestConfig
    if (config.metadata?.cacheKey && config.metadata?.cacheConfig) {
      requestCacheManager.setToCache(
        config.metadata.cacheKey,
        response,
        config.metadata.cacheConfig
      )
    }

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

// 创建一个不经过响应拦截器处理的 axios 实例，用于缓存
const rawService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
})

// 为原始服务添加请求拦截器（只添加认证头）
rawService.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.set('Authorization', `Bearer ${userStore.token}`)
  }
  return config
})

// 带缓存的请求方法
export const requestWithCache = async <T = any>(
  config: Partial<InternalAxiosRequestConfig> & { cache: Partial<RequestCacheConfig> }
): Promise<T> => {
  const cacheConfig = requestCacheManager.mergeConfig(config.cache)

  if (!requestCacheManager.shouldCache(config as InternalAxiosRequestConfig, cacheConfig)) {
    // 不使用缓存，直接发起请求（service 已经处理了响应数据提取）
    return service.request(config as InternalAxiosRequestConfig) as Promise<T>
  }

  const cacheKey = requestCacheManager.generateCacheKey(config.url || '', config as InternalAxiosRequestConfig, cacheConfig)

  // 使用缓存策略处理请求
  const response = await requestCacheManager.handleCacheStrategy(
    cacheKey,
    cacheConfig,
    () => rawService.request(config as InternalAxiosRequestConfig)
  )

  // 处理响应数据格式
  const { code, message, data } = response.data
  if (code === 200) {
    return data
  } else {
    ElMessage.error(message || "Request failed")
    throw new Error(message || "Request failed")
  }
}

// 便捷的缓存请求方法
export const cachedGet = <T = any>(
  url: string,
  params?: any,
  cacheConfig?: Partial<RequestCacheConfig>
): Promise<T> => {
  return requestWithCache<T>({
    method: 'GET',
    url,
    params,
    cache: cacheConfig || {}
  })
}

export const cachedPost = <T = any>(
  url: string,
  data?: any,
  cacheConfig?: Partial<RequestCacheConfig>
): Promise<T> => {
  return requestWithCache<T>({
    method: 'POST',
    url,
    data,
    cache: cacheConfig || {}
  })
}

// 缓存管理方法
export const clearRequestCache = (url?: string) => {
  if (url) {
    requestCacheManager.clearUrlCache(url)
  } else {
    requestCacheManager.clearAllRequestCache()
  }
}

export default service
