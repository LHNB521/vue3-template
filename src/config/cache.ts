import { CacheStrategy } from '@/types/cache'
import type { RequestCacheConfig } from '@/types/cache'

/**
 * 缓存配置常量
 */
export const CACHE_CONFIG = {
  // 缓存时间常量（毫秒）
  TTL: {
    VERY_SHORT: 30 * 1000,      // 30秒
    SHORT: 60 * 1000,           // 1分钟
    MEDIUM: 5 * 60 * 1000,      // 5分钟
    LONG: 30 * 60 * 1000,       // 30分钟
    VERY_LONG: 60 * 60 * 1000,  // 1小时
    PERSISTENT: 24 * 60 * 60 * 1000, // 24小时
  },

  // 缓存版本
  VERSION: {
    API_V1: '1.0',
    API_V2: '2.0',
    CONFIG: '1.0',
    USER: '1.0',
  },

  // 缓存键前缀
  KEYS: {
    USER: 'user_',
    CONFIG: 'config_',
    STATS: 'stats_',
    DICT: 'dict_',
    REQUEST: 'request_',
  }
} as const

/**
 * 预定义的缓存配置
 */
export const CACHE_PRESETS: Record<string, Partial<RequestCacheConfig>> = {
  // 用户数据缓存配置
  USER_DATA: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: CACHE_CONFIG.TTL.MEDIUM,
    version: CACHE_CONFIG.VERSION.USER,
    includeParams: true,
  },

  // 用户详情缓存配置
  USER_DETAIL: {
    strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
    ttl: CACHE_CONFIG.TTL.LONG,
    version: CACHE_CONFIG.VERSION.USER,
    includeParams: false,
  },

  // 系统配置缓存配置
  SYSTEM_CONFIG: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: CACHE_CONFIG.TTL.VERY_LONG,
    version: CACHE_CONFIG.VERSION.CONFIG,
    includeParams: false,
  },

  // 字典数据缓存配置
  DICTIONARY: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: CACHE_CONFIG.TTL.VERY_LONG,
    version: CACHE_CONFIG.VERSION.CONFIG,
    includeParams: true,
  },

  // 统计数据缓存配置
  STATS_DATA: {
    strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
    ttl: CACHE_CONFIG.TTL.SHORT,
    version: CACHE_CONFIG.VERSION.API_V1,
    includeParams: true,
  },

  // 实时数据配置（不缓存）
  REALTIME_DATA: {
    strategy: CacheStrategy.NETWORK_ONLY,
    enabled: false,
  },

  // 历史数据缓存配置
  HISTORY_DATA: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: CACHE_CONFIG.TTL.LONG,
    version: CACHE_CONFIG.VERSION.API_V1,
    includeParams: true,
  },

  // 列表数据缓存配置
  LIST_DATA: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: CACHE_CONFIG.TTL.MEDIUM,
    version: CACHE_CONFIG.VERSION.API_V1,
    includeParams: true,
  },

  // 详情数据缓存配置
  DETAIL_DATA: {
    strategy: CacheStrategy.NETWORK_FIRST,
    ttl: CACHE_CONFIG.TTL.MEDIUM,
    version: CACHE_CONFIG.VERSION.API_V1,
    includeParams: false,
  },
}

/**
 * 缓存配置工厂函数
 */
export const createCacheConfig = (
  preset: keyof typeof CACHE_PRESETS,
  overrides: Partial<RequestCacheConfig> = {}
): Partial<RequestCacheConfig> => {
  return {
    ...CACHE_PRESETS[preset],
    ...overrides,
  }
}

/**
 * 根据数据类型获取推荐的缓存配置
 */
export const getCacheConfigByType = (dataType: string): Partial<RequestCacheConfig> => {
  const typeMap: Record<string, keyof typeof CACHE_PRESETS> = {
    'user': 'USER_DATA',
    'user-detail': 'USER_DETAIL',
    'config': 'SYSTEM_CONFIG',
    'dictionary': 'DICTIONARY',
    'stats': 'STATS_DATA',
    'realtime': 'REALTIME_DATA',
    'history': 'HISTORY_DATA',
    'list': 'LIST_DATA',
    'detail': 'DETAIL_DATA',
  }

  const preset = typeMap[dataType] || 'LIST_DATA'
  return CACHE_PRESETS[preset]
}

/**
 * 缓存键生成器工厂
 */
export const createKeyGenerator = (prefix: string) => {
  return (url: string, params?: any): string => {
    let key = `${prefix}${url.replace(/[^a-zA-Z0-9]/g, '_')}`
    
    if (params) {
      const paramsStr = JSON.stringify(params)
      const paramsHash = simpleHash(paramsStr)
      key += `_${paramsHash}`
    }
    
    return key
  }
}

/**
 * 简单哈希函数
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

/**
 * 缓存环境配置
 */
export const CACHE_ENV_CONFIG = {
  // 开发环境配置
  development: {
    enabled: true,
    debug: true,
    defaultTTL: CACHE_CONFIG.TTL.SHORT,
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  
  // 生产环境配置
  production: {
    enabled: true,
    debug: false,
    defaultTTL: CACHE_CONFIG.TTL.MEDIUM,
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  
  // 测试环境配置
  test: {
    enabled: false,
    debug: true,
    defaultTTL: CACHE_CONFIG.TTL.VERY_SHORT,
    maxSize: 10 * 1024 * 1024, // 10MB
  },
}

/**
 * 获取当前环境的缓存配置
 */
export const getCurrentEnvCacheConfig = () => {
  const env = import.meta.env.MODE as keyof typeof CACHE_ENV_CONFIG
  return CACHE_ENV_CONFIG[env] || CACHE_ENV_CONFIG.development
}
