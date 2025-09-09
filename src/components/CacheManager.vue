<template>
  <div class="cache-manager">
    <el-card class="cache-stats-card">
      <template #header>
        <div class="card-header">
          <span>缓存统计</span>
          <el-button type="primary" size="small" @click="refreshStats">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">缓存命中</div>
          <div class="stat-value">{{ stats.hits }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">缓存未命中</div>
          <div class="stat-value">{{ stats.misses }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">命中率</div>
          <div class="stat-value">{{ hitRate }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">缓存项数量</div>
          <div class="stat-value">{{ stats.count }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">缓存大小</div>
          <div class="stat-value">{{ formatSize(stats.size) }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="cache-actions-card">
      <template #header>
        <span>缓存操作</span>
      </template>
      
      <div class="actions-grid">
        <el-button type="warning" @click="clearExpiredCache">
          <el-icon><Delete /></el-icon>
          清理过期缓存
        </el-button>
        <el-button type="danger" @click="clearAllCache">
          <el-icon><DeleteFilled /></el-icon>
          清空所有缓存
        </el-button>
        <el-button type="info" @click="clearRequestCache">
          <el-icon><Connection /></el-icon>
          清空请求缓存
        </el-button>
      </div>
    </el-card>

    <el-card class="cache-test-card">
      <template #header>
        <span>缓存测试</span>
      </template>
      
      <div class="test-section">
        <el-input
          v-model="testKey"
          placeholder="输入测试键名"
          style="width: 200px; margin-right: 10px;"
        />
        <el-input
          v-model="testValue"
          placeholder="输入测试值"
          style="width: 200px; margin-right: 10px;"
        />
        <el-button type="primary" @click="setTestCache">设置缓存</el-button>
        <el-button type="success" @click="getTestCache">获取缓存</el-button>
        <el-button type="danger" @click="deleteTestCache">删除缓存</el-button>
      </div>
      
      <div v-if="testResult" class="test-result">
        <el-alert
          :title="testResult.title"
          :type="testResult.type"
          :description="testResult.message"
          show-icon
          :closable="false"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete, DeleteFilled, Connection } from '@element-plus/icons-vue'
import { cache, getCacheStats, clearExpiredCache as clearExpired, clearCache } from '@/utils/cache'
import { clearRequestCache } from '@/utils/request'
import type { CacheStats } from '@/types/cache'

const stats = ref<CacheStats>({
  hits: 0,
  misses: 0,
  size: 0,
  count: 0
})

const testKey = ref('')
const testValue = ref('')
const testResult = ref<{
  title: string
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
} | null>(null)

const hitRate = computed(() => {
  const total = stats.value.hits + stats.value.misses
  return total > 0 ? Math.round((stats.value.hits / total) * 100) : 0
})

const refreshStats = () => {
  stats.value = getCacheStats()
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const clearExpiredCache = async () => {
  try {
    const clearedCount = clearExpired()
    ElMessage.success(`已清理 ${clearedCount} 个过期缓存项`)
    refreshStats()
  } catch (error) {
    ElMessage.error('清理过期缓存失败')
  }
}

const clearAllCache = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清空所有缓存数据，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    clearCache()
    ElMessage.success('已清空所有缓存')
    refreshStats()
  } catch {
    // 用户取消操作
  }
}

const clearRequestCache = () => {
  clearRequestCache()
  ElMessage.success('已清空请求缓存')
  refreshStats()
}

const setTestCache = () => {
  if (!testKey.value || !testValue.value) {
    ElMessage.warning('请输入键名和值')
    return
  }

  const success = cache.set(testKey.value, testValue.value, {
    key: testKey.value,
    ttl: 60000 // 1分钟过期
  })

  if (success) {
    testResult.value = {
      title: '设置成功',
      type: 'success',
      message: `缓存键 "${testKey.value}" 已设置，值为 "${testValue.value}"`
    }
    refreshStats()
  } else {
    testResult.value = {
      title: '设置失败',
      type: 'error',
      message: '缓存设置失败，请检查存储空间'
    }
  }
}

const getTestCache = () => {
  if (!testKey.value) {
    ElMessage.warning('请输入键名')
    return
  }

  const value = cache.get(testKey.value)
  
  if (value !== null) {
    testResult.value = {
      title: '获取成功',
      type: 'success',
      message: `缓存键 "${testKey.value}" 的值为 "${value}"`
    }
  } else {
    testResult.value = {
      title: '获取失败',
      type: 'warning',
      message: `缓存键 "${testKey.value}" 不存在或已过期`
    }
  }
  
  refreshStats()
}

const deleteTestCache = () => {
  if (!testKey.value) {
    ElMessage.warning('请输入键名')
    return
  }

  const success = cache.delete(testKey.value)
  
  if (success) {
    testResult.value = {
      title: '删除成功',
      type: 'success',
      message: `缓存键 "${testKey.value}" 已删除`
    }
  } else {
    testResult.value = {
      title: '删除失败',
      type: 'warning',
      message: `缓存键 "${testKey.value}" 不存在`
    }
  }
  
  refreshStats()
}

onMounted(() => {
  refreshStats()
})
</script>

<style lang="scss" scoped>
.cache-manager {
  padding: 20px;
  
  .cache-stats-card,
  .cache-actions-card,
  .cache-test-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    
    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }
  }
  
  .actions-grid {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .test-section {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .test-result {
    margin-top: 15px;
  }
}
</style>
