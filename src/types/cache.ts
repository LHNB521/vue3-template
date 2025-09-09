/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 缓存键名 */
  key: string
  /** 过期时间（毫秒），0 表示永不过期 */
  ttl?: number
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存版本，用于缓存失效 */
  version?: string
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存的数据 */
  data: T
  /** 创建时间戳 */
  timestamp: number
  /** 过期时间戳，0 表示永不过期 */
  expireTime: number
  /** 缓存版本 */
  version?: string
}

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  /** 仅使用缓存，不发起请求 */
  CACHE_ONLY = 'cache-only',
  /** 优先使用缓存，缓存失效时发起请求 */
  CACHE_FIRST = 'cache-first',
  /** 优先发起请求，请求失败时使用缓存 */
  NETWORK_FIRST = 'network-first',
  /** 仅发起请求，不使用缓存 */
  NETWORK_ONLY = 'network-only',
  /** 同时使用缓存和网络，返回最新数据 */
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate'
}

/**
 * 请求缓存配置
 */
export interface RequestCacheConfig extends CacheConfig {
  /** 缓存策略 */
  strategy?: CacheStrategy
  /** 是否根据请求参数生成缓存键 */
  includeParams?: boolean
  /** 自定义缓存键生成函数 */
  keyGenerator?: (url: string, params?: any) => string
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 缓存总大小（字节） */
  size: number
  /** 缓存项数量 */
  count: number
}

/**
 * 缓存事件类型
 */
export enum CacheEventType {
  SET = 'set',
  GET = 'get',
  DELETE = 'delete',
  CLEAR = 'clear',
  EXPIRE = 'expire'
}

/**
 * 缓存事件接口
 */
export interface CacheEvent {
  type: CacheEventType
  key: string
  data?: any
  timestamp: number
}
