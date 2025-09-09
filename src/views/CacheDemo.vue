<template>
  <div class="cache-demo-container">
    <AppHeader />
    
    <div class="cache-demo-content p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">缓存系统演示</h1>
        <p class="text-gray-600">演示智能缓存系统的各种功能和策略</p>
      </div>

      <!-- 缓存管理器 -->
      <CacheManager />

      <!-- API 请求演示 -->
      <el-card class="mb-6">
        <template #header>
          <span>API 请求缓存演示</span>
        </template>
        
        <div class="demo-section">
          <div class="demo-buttons">
            <el-button 
              type="primary" 
              @click="fetchWithCacheFirst"
              :loading="loading.cacheFirst"
            >
              缓存优先策略
            </el-button>
            <el-button 
              type="success" 
              @click="fetchWithNetworkFirst"
              :loading="loading.networkFirst"
            >
              网络优先策略
            </el-button>
            <el-button 
              type="info" 
              @click="fetchWithStaleWhileRevalidate"
              :loading="loading.staleWhileRevalidate"
            >
              过期重新验证
            </el-button>
            <el-button 
              type="warning" 
              @click="fetchWithNetworkOnly"
              :loading="loading.networkOnly"
            >
              仅网络请求
            </el-button>
          </div>

          <div v-if="apiResults.length > 0" class="results-section">
            <h3>请求结果:</h3>
            <div class="results-list">
              <div 
                v-for="(result, index) in apiResults" 
                :key="index"
                class="result-item"
              >
                <div class="result-header">
                  <span class="strategy-tag" :class="result.strategy">
                    {{ result.strategy }}
                  </span>
                  <span class="time-tag">{{ result.timestamp }}</span>
                  <span v-if="result.fromCache" class="cache-tag">来自缓存</span>
                </div>
                <div class="result-content">
                  <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 缓存性能测试 -->
      <el-card class="mb-6">
        <template #header>
          <span>缓存性能测试</span>
        </template>
        
        <div class="performance-section">
          <div class="performance-controls">
            <el-input-number
              v-model="performanceTest.iterations"
              :min="10"
              :max="1000"
              :step="10"
              style="width: 150px; margin-right: 10px;"
            />
            <el-button 
              type="primary" 
              @click="runPerformanceTest"
              :loading="performanceTest.running"
            >
              运行性能测试
            </el-button>
            <el-button @click="clearPerformanceResults">清除结果</el-button>
          </div>

          <div v-if="performanceTest.results" class="performance-results">
            <div class="performance-stats">
              <div class="stat-item">
                <div class="stat-label">总耗时</div>
                <div class="stat-value">{{ performanceTest.results.totalTime }}ms</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均耗时</div>
                <div class="stat-value">{{ performanceTest.results.averageTime }}ms</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">缓存命中</div>
                <div class="stat-value">{{ performanceTest.results.cacheHits }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">网络请求</div>
                <div class="stat-value">{{ performanceTest.results.networkRequests }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 缓存事件监控 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>缓存事件监控</span>
            <el-button size="small" @click="clearCacheEvents">清除事件</el-button>
          </div>
        </template>
        
        <div class="events-section">
          <div v-if="cacheEvents.length === 0" class="no-events">
            暂无缓存事件
          </div>
          <div v-else class="events-list">
            <div 
              v-for="(event, index) in cacheEvents.slice(0, 20)" 
              :key="index"
              class="event-item"
            >
              <div class="event-type" :class="event.type">{{ event.type }}</div>
              <div class="event-key">{{ event.key }}</div>
              <div class="event-time">{{ formatTime(event.timestamp) }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import CacheManager from '@/components/CacheManager.vue'
import { cachedGet } from '@/utils/request'
import { CacheStrategy } from '@/types/cache'
import { useCache, useCacheMonitor } from '@/composables/useCache'
import type { CacheEvent } from '@/types/cache'

// 缓存管理
const { onCacheEvent, offCacheEvent } = useCache()
const { events: monitorEvents, clearEvents } = useCacheMonitor()

// 加载状态
const loading = ref({
  cacheFirst: false,
  networkFirst: false,
  staleWhileRevalidate: false,
  networkOnly: false,
})

// API 请求结果
const apiResults = ref<Array<{
  strategy: string
  data: any
  timestamp: string
  fromCache: boolean
}>>([])

// 缓存事件
const cacheEvents = ref<CacheEvent[]>([])

// 性能测试
const performanceTest = ref({
  iterations: 100,
  running: false,
  results: null as any
})

// 模拟 API 数据
const mockApiData = {
  users: [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' },
  ],
  timestamp: new Date().toISOString(),
  random: Math.random()
}

// 模拟 API 请求
const mockApiRequest = async (delay = 500) => {
  await new Promise(resolve => setTimeout(resolve, delay))
  return {
    code: 200,
    message: 'success',
    data: {
      ...mockApiData,
      timestamp: new Date().toISOString(),
      random: Math.random()
    }
  }
}

// 缓存优先策略
const fetchWithCacheFirst = async () => {
  loading.value.cacheFirst = true
  try {
    const startTime = Date.now()
    const data = await cachedGet('/api/users', { page: 1 }, {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 30 * 1000, // 30秒缓存
      version: '1.0'
    })
    const endTime = Date.now()
    
    apiResults.value.unshift({
      strategy: 'CACHE_FIRST',
      data,
      timestamp: new Date().toLocaleTimeString(),
      fromCache: (endTime - startTime) < 100 // 如果响应很快，可能来自缓存
    })
  } catch (error) {
    ElMessage.error('请求失败')
  } finally {
    loading.value.cacheFirst = false
  }
}

// 网络优先策略
const fetchWithNetworkFirst = async () => {
  loading.value.networkFirst = true
  try {
    const data = await cachedGet('/api/users', { page: 1 }, {
      strategy: CacheStrategy.NETWORK_FIRST,
      ttl: 30 * 1000,
      version: '1.0'
    })
    
    apiResults.value.unshift({
      strategy: 'NETWORK_FIRST',
      data,
      timestamp: new Date().toLocaleTimeString(),
      fromCache: false
    })
  } catch (error) {
    ElMessage.error('请求失败')
  } finally {
    loading.value.networkFirst = false
  }
}

// 过期重新验证策略
const fetchWithStaleWhileRevalidate = async () => {
  loading.value.staleWhileRevalidate = true
  try {
    const data = await cachedGet('/api/users', { page: 1 }, {
      strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
      ttl: 30 * 1000,
      version: '1.0'
    })
    
    apiResults.value.unshift({
      strategy: 'STALE_WHILE_REVALIDATE',
      data,
      timestamp: new Date().toLocaleTimeString(),
      fromCache: true // SWR 策略通常返回缓存数据
    })
  } catch (error) {
    ElMessage.error('请求失败')
  } finally {
    loading.value.staleWhileRevalidate = false
  }
}

// 仅网络请求
const fetchWithNetworkOnly = async () => {
  loading.value.networkOnly = true
  try {
    const data = await cachedGet('/api/users', { page: 1 }, {
      strategy: CacheStrategy.NETWORK_ONLY,
      enabled: false
    })
    
    apiResults.value.unshift({
      strategy: 'NETWORK_ONLY',
      data,
      timestamp: new Date().toLocaleTimeString(),
      fromCache: false
    })
  } catch (error) {
    ElMessage.error('请求失败')
  } finally {
    loading.value.networkOnly = false
  }
}

// 运行性能测试
const runPerformanceTest = async () => {
  performanceTest.value.running = true
  const startTime = Date.now()
  let cacheHits = 0
  let networkRequests = 0

  try {
    const promises = Array.from({ length: performanceTest.value.iterations }, async (_, i) => {
      const requestStart = Date.now()
      await cachedGet(`/api/test/${i % 10}`, undefined, {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 60 * 1000,
        version: '1.0'
      })
      const requestEnd = Date.now()
      
      if (requestEnd - requestStart < 50) {
        cacheHits++
      } else {
        networkRequests++
      }
    })

    await Promise.all(promises)
    
    const endTime = Date.now()
    const totalTime = endTime - startTime

    performanceTest.value.results = {
      totalTime,
      averageTime: Math.round(totalTime / performanceTest.value.iterations),
      cacheHits,
      networkRequests
    }

    ElMessage.success(`性能测试完成！总耗时: ${totalTime}ms`)
  } catch (error) {
    ElMessage.error('性能测试失败')
  } finally {
    performanceTest.value.running = false
  }
}

// 清除性能测试结果
const clearPerformanceResults = () => {
  performanceTest.value.results = null
}

// 清除缓存事件
const clearCacheEvents = () => {
  cacheEvents.value = []
  clearEvents()
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 监听缓存事件
const handleCacheEvent = (event: CacheEvent) => {
  cacheEvents.value.unshift(event)
  if (cacheEvents.value.length > 50) {
    cacheEvents.value = cacheEvents.value.slice(0, 50)
  }
}

onMounted(() => {
  onCacheEvent('*', handleCacheEvent)
})

onUnmounted(() => {
  offCacheEvent('*')
})
</script>

<style lang="scss" scoped>
.cache-demo-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.demo-section {
  .demo-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .results-section {
    .results-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .result-item {
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      margin-bottom: 10px;
      overflow: hidden;

      .result-header {
        background: #f5f7fa;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 10px;

        .strategy-tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          color: white;

          &.CACHE_FIRST { background: #409eff; }
          &.NETWORK_FIRST { background: #67c23a; }
          &.STALE_WHILE_REVALIDATE { background: #909399; }
          &.NETWORK_ONLY { background: #e6a23c; }
        }

        .time-tag {
          font-size: 12px;
          color: #666;
        }

        .cache-tag {
          background: #f56c6c;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      .result-content {
        padding: 10px;
        background: #fafafa;

        pre {
          margin: 0;
          font-size: 12px;
          max-height: 200px;
          overflow: auto;
        }
      }
    }
  }
}

.performance-section {
  .performance-controls {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .performance-results {
    .performance-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;

      .stat-item {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
      }
    }
  }
}

.events-section {
  .no-events {
    text-align: center;
    color: #999;
    padding: 40px;
  }

  .events-list {
    max-height: 300px;
    overflow-y: auto;

    .event-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      .event-type {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        color: white;
        min-width: 60px;
        text-align: center;
        margin-right: 10px;

        &.set { background: #67c23a; }
        &.get { background: #409eff; }
        &.delete { background: #f56c6c; }
        &.clear { background: #e6a23c; }
        &.expire { background: #909399; }
      }

      .event-key {
        flex: 1;
        font-family: monospace;
        font-size: 12px;
        margin-right: 10px;
      }

      .event-time {
        font-size: 12px;
        color: #666;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
