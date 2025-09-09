import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { cache } from './cache'
import type { RequestCacheConfig } from '@/types/cache'
import { CacheStrategy } from '@/types/cache'

/**
 * 请求缓存管理器
 */
export class RequestCacheManager {
  private defaultConfig: RequestCacheConfig = {
    key: '',
    ttl: 5 * 60 * 1000, // 默认5分钟
    enabled: true,
    strategy: CacheStrategy.CACHE_FIRST,
    includeParams: true,
    version: '1.0'
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(url: string, config: AxiosRequestConfig, cacheConfig: RequestCacheConfig): string {
    if (cacheConfig.keyGenerator) {
      return cacheConfig.keyGenerator(url, config.params)
    }

    let key = `request_${url.replace(/[^a-zA-Z0-9]/g, '_')}`

    if (cacheConfig.includeParams && config.params) {
      const paramsStr = JSON.stringify(config.params)
      const paramsHash = this.simpleHash(paramsStr)
      key += `_${paramsHash}`
    }

    if (config.method && config.method.toLowerCase() !== 'get') {
      key += `_${config.method.toLowerCase()}`
    }

    if (config.data) {
      const dataHash = this.simpleHash(JSON.stringify(config.data))
      key += `_${dataHash}`
    }

    return key
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 检查请求是否应该被缓存
   */
  shouldCache(config: AxiosRequestConfig, cacheConfig: RequestCacheConfig): boolean {
    if (!cacheConfig.enabled) return false

    // 默认只缓存 GET 请求
    const method = config.method?.toLowerCase() || 'get'
    if (method !== 'get') return false

    return true
  }

  /**
   * 从缓存获取响应
   */
  getFromCache(cacheKey: string, cacheConfig: RequestCacheConfig): AxiosResponse | null {
    try {
      const cachedResponse = cache.get<AxiosResponse>(cacheKey, cacheConfig.version)
      if (cachedResponse) {
        // 添加缓存标识
        cachedResponse.headers = cachedResponse.headers || {}
        cachedResponse.headers['x-cache'] = 'HIT'
        cachedResponse.headers['x-cache-key'] = cacheKey
      }
      return cachedResponse
    } catch (error) {
      console.warn('Failed to get response from cache:', error)
      return null
    }
  }

  /**
   * 将响应存储到缓存
   */
  setToCache(cacheKey: string, response: AxiosResponse, cacheConfig: RequestCacheConfig): void {
    try {
      // 创建响应副本，避免修改原始响应
      const responseToCache: AxiosResponse = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: { ...response.headers },
        config: response.config
      }

      // 添加缓存标识
      responseToCache.headers['x-cache'] = 'MISS'
      responseToCache.headers['x-cache-key'] = cacheKey
      responseToCache.headers['x-cache-time'] = new Date().toISOString()

      cache.set(cacheKey, responseToCache, {
        key: cacheKey,
        ttl: cacheConfig.ttl || 0,
        version: cacheConfig.version || '1.0'
      })
    } catch (error) {
      console.warn('Failed to set response to cache:', error)
    }
  }

  /**
   * 处理缓存策略
   */
  async handleCacheStrategy(
    cacheKey: string,
    cacheConfig: RequestCacheConfig,
    networkRequest: () => Promise<AxiosResponse>
  ): Promise<AxiosResponse> {
    const strategy = cacheConfig.strategy || CacheStrategy.CACHE_FIRST

    switch (strategy) {
      case CacheStrategy.CACHE_ONLY:
        return this.handleCacheOnly(cacheKey, cacheConfig)

      case CacheStrategy.CACHE_FIRST:
        return this.handleCacheFirst(cacheKey, cacheConfig, networkRequest)

      case CacheStrategy.NETWORK_FIRST:
        return this.handleNetworkFirst(cacheKey, cacheConfig, networkRequest)

      case CacheStrategy.NETWORK_ONLY:
        return this.handleNetworkOnly(networkRequest)

      case CacheStrategy.STALE_WHILE_REVALIDATE:
        return this.handleStaleWhileRevalidate(cacheKey, cacheConfig, networkRequest)

      default:
        return this.handleCacheFirst(cacheKey, cacheConfig, networkRequest)
    }
  }

  /**
   * 仅使用缓存策略
   */
  private handleCacheOnly(cacheKey: string, cacheConfig: RequestCacheConfig): Promise<AxiosResponse> {
    const cachedResponse = this.getFromCache(cacheKey, cacheConfig)
    if (cachedResponse) {
      return Promise.resolve(cachedResponse)
    }
    return Promise.reject(new Error('No cached response available'))
  }

  /**
   * 缓存优先策略
   */
  private async handleCacheFirst(
    cacheKey: string,
    cacheConfig: RequestCacheConfig,
    networkRequest: () => Promise<AxiosResponse>
  ): Promise<AxiosResponse> {
    const cachedResponse = this.getFromCache(cacheKey, cacheConfig)
    if (cachedResponse) {
      return cachedResponse
    }

    const response = await networkRequest()
    this.setToCache(cacheKey, response, cacheConfig)
    return response
  }

  /**
   * 网络优先策略
   */
  private async handleNetworkFirst(
    cacheKey: string,
    cacheConfig: RequestCacheConfig,
    networkRequest: () => Promise<AxiosResponse>
  ): Promise<AxiosResponse> {
    try {
      const response = await networkRequest()
      this.setToCache(cacheKey, response, cacheConfig)
      return response
    } catch (error) {
      const cachedResponse = this.getFromCache(cacheKey, cacheConfig)
      if (cachedResponse) {
        cachedResponse.headers['x-cache-fallback'] = 'true'
        return cachedResponse
      }
      throw error
    }
  }

  /**
   * 仅使用网络策略
   */
  private async handleNetworkOnly(networkRequest: () => Promise<AxiosResponse>): Promise<AxiosResponse> {
    return networkRequest()
  }

  /**
   * 过期重新验证策略
   */
  private async handleStaleWhileRevalidate(
    cacheKey: string,
    cacheConfig: RequestCacheConfig,
    networkRequest: () => Promise<AxiosResponse>
  ): Promise<AxiosResponse> {
    const cachedResponse = this.getFromCache(cacheKey, cacheConfig)

    // 异步更新缓存
    networkRequest()
      .then(response => {
        this.setToCache(cacheKey, response, cacheConfig)
      })
      .catch(error => {
        console.warn('Background cache update failed:', error)
      })

    if (cachedResponse) {
      cachedResponse.headers['x-cache-stale'] = 'true'
      return cachedResponse
    }

    // 如果没有缓存，等待网络请求
    const response = await networkRequest()
    this.setToCache(cacheKey, response, cacheConfig)
    return response
  }

  /**
   * 合并缓存配置
   */
  mergeConfig(userConfig: Partial<RequestCacheConfig> = {}): RequestCacheConfig {
    return {
      ...this.defaultConfig,
      ...userConfig,
      key: userConfig.key || this.defaultConfig.key
    }
  }

  /**
   * 清除特定URL的缓存
   */
  clearUrlCache(url: string): void {
    const baseKey = `request_${url.replace(/[^a-zA-Z0-9]/g, '_')}`

    // 遍历 localStorage 查找匹配的键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes(baseKey)) {
        const cacheKey = key.replace('app_cache_', '') // 移除缓存前缀
        cache.delete(cacheKey)
      }
    }
  }

  /**
   * 清除所有请求缓存
   */
  clearAllRequestCache(): void {
    // 遍历 localStorage 查找所有请求缓存
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.includes('app_cache_request_')) {
        const cacheKey = key.replace('app_cache_', '') // 移除缓存前缀
        cache.delete(cacheKey)
      }
    }
  }
}

// 创建默认请求缓存管理器实例
export const requestCacheManager = new RequestCacheManager()
