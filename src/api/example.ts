import { cachedGet, cachedPost, requestWithCache } from '@/utils/request'
import { CacheStrategy } from '@/types/cache'
import type { User } from '@/types/user'
import type { PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 用户相关 API（带缓存示例）
 */
export const userApi = {
  /**
   * 获取用户列表 - 使用缓存优先策略，缓存5分钟
   */
  getUserList: (params: PaginationParams) => {
    return cachedGet<PaginationResponse<User>>('/users', params, {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 5 * 60 * 1000, // 5分钟
      includeParams: true,
      version: '1.0'
    })
  },

  /**
   * 获取用户详情 - 使用过期重新验证策略，缓存10分钟
   */
  getUserDetail: (id: number) => {
    return cachedGet<User>(`/users/${id}`, undefined, {
      strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
      ttl: 10 * 60 * 1000, // 10分钟
      version: '1.0'
    })
  },

  /**
   * 获取当前用户信息 - 使用网络优先策略，缓存作为降级
   */
  getCurrentUser: () => {
    return cachedGet<User>('/users/me', undefined, {
      strategy: CacheStrategy.NETWORK_FIRST,
      ttl: 2 * 60 * 1000, // 2分钟
      version: '1.0'
    })
  },

  /**
   * 创建用户 - 不使用缓存
   */
  createUser: (userData: Partial<User>) => {
    return cachedPost<User>('/users', userData, {
      enabled: false // 禁用缓存
    })
  },

  /**
   * 更新用户 - 使用自定义缓存键生成器
   */
  updateUser: (id: number, userData: Partial<User>) => {
    return requestWithCache<User>({
      method: 'PUT',
      url: `/users/${id}`,
      data: userData,
      cache: {
        strategy: CacheStrategy.NETWORK_ONLY,
        keyGenerator: (url) => `user_update_${id}`,
        ttl: 0 // 不缓存更新操作
      }
    })
  }
}

/**
 * 配置相关 API（带缓存示例）
 */
export const configApi = {
  /**
   * 获取系统配置 - 长期缓存，30分钟
   */
  getSystemConfig: () => {
    return cachedGet('/config/system', undefined, {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 30 * 60 * 1000, // 30分钟
      version: '1.0'
    })
  },

  /**
   * 获取用户配置 - 中期缓存，10分钟
   */
  getUserConfig: () => {
    return cachedGet('/config/user', undefined, {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 10 * 60 * 1000, // 10分钟
      version: '1.0'
    })
  },

  /**
   * 获取字典数据 - 长期缓存，1小时
   */
  getDictionary: (type: string) => {
    return cachedGet(`/config/dictionary/${type}`, undefined, {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 60 * 60 * 1000, // 1小时
      version: '1.0',
      keyGenerator: (url) => `dict_${type}`
    })
  }
}

/**
 * 统计相关 API（带缓存示例）
 */
export const statsApi = {
  /**
   * 获取仪表板统计 - 短期缓存，1分钟
   */
  getDashboardStats: () => {
    return cachedGet('/stats/dashboard', undefined, {
      strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
      ttl: 60 * 1000, // 1分钟
      version: '1.0'
    })
  },

  /**
   * 获取实时数据 - 仅使用网络
   */
  getRealTimeData: () => {
    return cachedGet('/stats/realtime', undefined, {
      strategy: CacheStrategy.NETWORK_ONLY,
      enabled: false
    })
  },

  /**
   * 获取历史数据 - 根据日期范围缓存
   */
  getHistoryData: (startDate: string, endDate: string) => {
    return cachedGet('/stats/history', { startDate, endDate }, {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 15 * 60 * 1000, // 15分钟
      includeParams: true,
      keyGenerator: (url, params) => `history_${params?.startDate}_${params?.endDate}`,
      version: '1.0'
    })
  }
}

/**
 * 缓存管理工具函数
 */
export const cacheUtils = {
  /**
   * 预热用户相关缓存
   */
  preloadUserCache: async (userId: number) => {
    try {
      await Promise.all([
        userApi.getUserDetail(userId),
        userApi.getCurrentUser(),
        configApi.getUserConfig()
      ])
      console.log('用户缓存预热完成')
    } catch (error) {
      console.warn('用户缓存预热失败:', error)
    }
  },

  /**
   * 预热系统配置缓存
   */
  preloadSystemCache: async () => {
    try {
      await Promise.all([
        configApi.getSystemConfig(),
        configApi.getDictionary('status'),
        configApi.getDictionary('type')
      ])
      console.log('系统缓存预热完成')
    } catch (error) {
      console.warn('系统缓存预热失败:', error)
    }
  },

  /**
   * 清除用户相关缓存
   */
  clearUserCache: () => {
    // 这里可以实现更精确的缓存清理逻辑
    console.log('清除用户相关缓存')
  }
}
