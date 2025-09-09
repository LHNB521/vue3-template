import type { CacheItem, CacheConfig, CacheStats, CacheEvent, CacheEventType } from '@/types/cache'

/**
 * 本地存储缓存工具类
 */
export class LocalStorageCache {
  private prefix: string
  private stats: CacheStats
  private listeners: Map<string, ((event: CacheEvent) => void)[]>

  constructor(prefix = 'app_cache_') {
    this.prefix = prefix
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      count: 0
    }
    this.listeners = new Map()
    this.initStats()
  }

  /**
   * 初始化统计信息
   */
  private initStats(): void {
    try {
      const keys = this.getAllKeys()
      this.stats.count = keys.length
      this.stats.size = this.calculateTotalSize()
    } catch (error) {
      console.warn('Failed to initialize cache stats:', error)
    }
  }

  /**
   * 生成完整的缓存键
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * 获取所有缓存键
   */
  private getAllKeys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  /**
   * 计算总缓存大小
   */
  private calculateTotalSize(): number {
    let totalSize = 0
    const keys = this.getAllKeys()
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(this.getFullKey(key))
        if (item) {
          totalSize += new Blob([item]).size
        }
      } catch (error) {
        console.warn(`Failed to calculate size for key ${key}:`, error)
      }
    })
    return totalSize
  }

  /**
   * 触发缓存事件
   */
  private emit(type: CacheEventType, key: string, data?: any): void {
    const event: CacheEvent = {
      type,
      key,
      data,
      timestamp: Date.now()
    }

    const keyListeners = this.listeners.get(key) || []
    const globalListeners = this.listeners.get('*') || []

    const allListeners = keyListeners.concat(globalListeners)
    allListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.warn('Cache event listener error:', error)
      }
    })
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, config: CacheConfig = {}): boolean {
    try {
      const now = Date.now()
      const ttl = config.ttl || 0
      const expireTime = ttl > 0 ? now + ttl : 0

      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expireTime,
        version: config.version
      }

      const serialized = JSON.stringify(cacheItem)
      const fullKey = this.getFullKey(key)

      // 检查存储空间
      try {
        localStorage.setItem(fullKey, serialized)
      } catch (error) {
        if (error instanceof DOMException && error.code === 22) {
          // 存储空间不足，清理过期缓存
          this.clearExpired()
          localStorage.setItem(fullKey, serialized)
        } else {
          throw error
        }
      }

      this.stats.count++
      this.stats.size = this.calculateTotalSize()
      this.emit(CacheEventType.SET, key, data)

      return true
    } catch (error) {
      console.warn(`Failed to set cache for key ${key}:`, error)
      return false
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, version?: string): T | null {
    try {
      const fullKey = this.getFullKey(key)
      const item = localStorage.getItem(fullKey)

      if (!item) {
        this.stats.misses++
        return null
      }

      const cacheItem: CacheItem<T> = JSON.parse(item)
      const now = Date.now()

      // 检查是否过期
      if (cacheItem.expireTime > 0 && now > cacheItem.expireTime) {
        this.delete(key)
        this.stats.misses++
        this.emit(CacheEventType.EXPIRE, key)
        return null
      }

      // 检查版本
      if (version && cacheItem.version !== version) {
        this.delete(key)
        this.stats.misses++
        return null
      }

      this.stats.hits++
      this.emit(CacheEventType.GET, key, cacheItem.data)
      return cacheItem.data
    } catch (error) {
      console.warn(`Failed to get cache for key ${key}:`, error)
      this.stats.misses++
      return null
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key)
      const existed = localStorage.getItem(fullKey) !== null

      if (existed) {
        localStorage.removeItem(fullKey)
        this.stats.count--
        this.stats.size = this.calculateTotalSize()
        this.emit(CacheEventType.DELETE, key)
      }

      return existed
    } catch (error) {
      console.warn(`Failed to delete cache for key ${key}:`, error)
      return false
    }
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string, version?: string): boolean {
    return this.get(key, version) !== null
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      const keys = this.getAllKeys()
      keys.forEach(key => {
        localStorage.removeItem(this.getFullKey(key))
      })

      this.stats.count = 0
      this.stats.size = 0
      this.emit(CacheEventType.CLEAR, '*')
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  /**
   * 清理过期缓存
   */
  clearExpired(): number {
    let clearedCount = 0
    const keys = this.getAllKeys()
    const now = Date.now()

    keys.forEach(key => {
      try {
        const fullKey = this.getFullKey(key)
        const item = localStorage.getItem(fullKey)

        if (item) {
          const cacheItem: CacheItem = JSON.parse(item)
          if (cacheItem.expireTime > 0 && now > cacheItem.expireTime) {
            localStorage.removeItem(fullKey)
            clearedCount++
            this.emit(CacheEventType.EXPIRE, key)
          }
        }
      } catch (error) {
        // 如果解析失败，也删除这个无效的缓存项
        localStorage.removeItem(this.getFullKey(key))
        clearedCount++
      }
    })

    if (clearedCount > 0) {
      this.stats.count -= clearedCount
      this.stats.size = this.calculateTotalSize()
    }

    return clearedCount
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 添加事件监听器
   */
  on(key: string, listener: (event: CacheEvent) => void): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(key: string, listener?: (event: CacheEvent) => void): void {
    if (!listener) {
      this.listeners.delete(key)
      return
    }

    const keyListeners = this.listeners.get(key)
    if (keyListeners) {
      const index = keyListeners.indexOf(listener)
      if (index > -1) {
        keyListeners.splice(index, 1)
      }
    }
  }
}

// 创建默认缓存实例
export const cache = new LocalStorageCache()

// 导出便捷方法
export const setCache = <T>(key: string, data: T, config?: CacheConfig) => cache.set(key, data, config)
export const getCache = <T>(key: string, version?: string) => cache.get<T>(key, version)
export const deleteCache = (key: string) => cache.delete(key)
export const hasCache = (key: string, version?: string) => cache.has(key, version)
export const clearCache = () => cache.clear()
export const clearExpiredCache = () => cache.clearExpired()
export const getCacheStats = () => cache.getStats()
