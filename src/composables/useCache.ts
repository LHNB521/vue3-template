import { ref, computed, onUnmounted } from 'vue'
import { cache, getCacheStats } from '@/utils/cache'
import { clearRequestCache } from '@/utils/request'
import type { CacheStats, CacheEvent, CacheEventType } from '@/types/cache'

/**
 * 缓存管理 Composable
 */
export function useCache() {
  const stats = ref<CacheStats>(getCacheStats())
  const listeners = new Map<string, (event: CacheEvent) => void>()

  // 计算缓存命中率
  const hitRate = computed(() => {
    const total = stats.value.hits + stats.value.misses
    return total > 0 ? Math.round((stats.value.hits / total) * 100) : 0
  })

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 刷新统计信息
  const refreshStats = () => {
    stats.value = getCacheStats()
  }

  // 设置缓存
  const setCache = <T>(key: string, data: T, ttl?: number) => {
    const success = cache.set(key, data, { key, ttl })
    if (success) {
      refreshStats()
    }
    return success
  }

  // 获取缓存
  const getCache = <T>(key: string, version?: string): T | null => {
    const result = cache.get<T>(key, version)
    refreshStats()
    return result
  }

  // 删除缓存
  const deleteCache = (key: string) => {
    const success = cache.delete(key)
    if (success) {
      refreshStats()
    }
    return success
  }

  // 检查缓存是否存在
  const hasCache = (key: string, version?: string) => {
    return cache.has(key, version)
  }

  // 清空所有缓存
  const clearAllCache = () => {
    cache.clear()
    refreshStats()
  }

  // 清理过期缓存
  const clearExpiredCache = () => {
    const clearedCount = cache.clearExpired()
    refreshStats()
    return clearedCount
  }

  // 清空请求缓存
  const clearApiCache = () => {
    clearRequestCache()
    refreshStats()
  }

  // 监听缓存事件
  const onCacheEvent = (key: string, callback: (event: CacheEvent) => void) => {
    listeners.set(key, callback)
    cache.on(key, callback)
  }

  // 移除缓存事件监听
  const offCacheEvent = (key: string) => {
    const listener = listeners.get(key)
    if (listener) {
      cache.off(key, listener)
      listeners.delete(key)
    }
  }

  // 组件卸载时清理监听器
  onUnmounted(() => {
    listeners.forEach((listener, key) => {
      cache.off(key, listener)
    })
    listeners.clear()
  })

  return {
    // 状态
    stats: computed(() => stats.value),
    hitRate,

    // 方法
    setCache,
    getCache,
    deleteCache,
    hasCache,
    clearAllCache,
    clearExpiredCache,
    clearApiCache,
    refreshStats,
    formatSize,

    // 事件
    onCacheEvent,
    offCacheEvent,
  }
}

/**
 * 缓存监控 Composable
 */
export function useCacheMonitor() {
  const events = ref<CacheEvent[]>([])
  const maxEvents = 100

  const addEvent = (event: CacheEvent) => {
    events.value.unshift(event)
    if (events.value.length > maxEvents) {
      events.value = events.value.slice(0, maxEvents)
    }
  }

  const clearEvents = () => {
    events.value = []
  }

  const getEventsByType = (type: CacheEventType) => {
    return events.value.filter(event => event.type === type)
  }

  const getEventsByKey = (key: string) => {
    return events.value.filter(event => event.key === key)
  }

  // 监听所有缓存事件
  cache.on('*', addEvent)

  onUnmounted(() => {
    cache.off('*', addEvent)
  })

  return {
    events: computed(() => events.value),
    clearEvents,
    getEventsByType,
    getEventsByKey,
  }
}

/**
 * 缓存性能监控 Composable
 */
export function useCachePerformance() {
  const performanceData = ref({
    averageGetTime: 0,
    averageSetTime: 0,
    totalOperations: 0,
    errorCount: 0,
  })

  const measureOperation = async <T>(
    operation: () => Promise<T> | T,
    type: 'get' | 'set'
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const endTime = performance.now()
      const duration = endTime - startTime

      // 更新性能数据
      performanceData.value.totalOperations++
      
      if (type === 'get') {
        performanceData.value.averageGetTime = 
          (performanceData.value.averageGetTime + duration) / 2
      } else {
        performanceData.value.averageSetTime = 
          (performanceData.value.averageSetTime + duration) / 2
      }

      return result
    } catch (error) {
      performanceData.value.errorCount++
      throw error
    }
  }

  const resetPerformanceData = () => {
    performanceData.value = {
      averageGetTime: 0,
      averageSetTime: 0,
      totalOperations: 0,
      errorCount: 0,
    }
  }

  return {
    performanceData: computed(() => performanceData.value),
    measureOperation,
    resetPerformanceData,
  }
}

/**
 * 缓存预热 Composable
 */
export function useCachePreload() {
  const preloadTasks = ref<Map<string, Promise<any>>>(new Map())
  const preloadStatus = ref<Map<string, 'pending' | 'success' | 'error'>>(new Map())

  const preload = async <T>(
    key: string,
    loader: () => Promise<T>,
    cacheConfig?: { ttl?: number; version?: string }
  ): Promise<T> => {
    // 如果已经在预加载中，返回现有的 Promise
    if (preloadTasks.value.has(key)) {
      return preloadTasks.value.get(key)!
    }

    preloadStatus.value.set(key, 'pending')
    
    const task = loader().then(data => {
      // 将数据存储到缓存
      cache.set(key, data, { key, ...cacheConfig })
      preloadStatus.value.set(key, 'success')
      preloadTasks.value.delete(key)
      return data
    }).catch(error => {
      preloadStatus.value.set(key, 'error')
      preloadTasks.value.delete(key)
      throw error
    })

    preloadTasks.value.set(key, task)
    return task
  }

  const preloadMultiple = async (
    tasks: Array<{
      key: string
      loader: () => Promise<any>
      cacheConfig?: { ttl?: number; version?: string }
    }>
  ) => {
    const promises = tasks.map(task => 
      preload(task.key, task.loader, task.cacheConfig).catch(error => {
        console.warn(`Preload failed for key ${task.key}:`, error)
        return null
      })
    )

    return Promise.allSettled(promises)
  }

  const getPreloadStatus = (key: string) => {
    return preloadStatus.value.get(key) || 'idle'
  }

  const clearPreloadStatus = () => {
    preloadStatus.value.clear()
    preloadTasks.value.clear()
  }

  return {
    preload,
    preloadMultiple,
    getPreloadStatus,
    clearPreloadStatus,
    preloadStatus: computed(() => Object.fromEntries(preloadStatus.value)),
  }
}
