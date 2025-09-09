<template>
  <div class="dashboard-container">
    <AppHeader />
    
    <div class="dashboard-content p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p class="text-gray-600">Welcome back, {{ currentUserName }}!</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          v-for="stat in statsData"
          :key="stat.title"
          :title="stat.title"
          :value="stat.value"
          :change="stat.change"
          :color="stat.color"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="font-semibold">Recent Activity</span>
            </div>
          </template>
          <ActivityList :activities="activitiesData" />
        </el-card>

        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="font-semibold">Quick Actions</span>
            </div>
          </template>
          <QuickActions />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import AppHeader from '@/components/AppHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ActivityList from '@/components/ActivityList.vue'
import QuickActions from '@/components/QuickActions.vue'

const userStore = useUserStore()

const currentUserName = computed(() => userStore.userName)

const statsData = ref([
  {
    title: 'Total Users',
    value: '12,345',
    change: '+12%',
    color: 'blue' as const,
  },
  {
    title: 'Revenue',
    value: '$54,321',
    change: '+8%',
    color: 'green' as const,
  },
  {
    title: 'Orders',
    value: '1,234',
    change: '-3%',
    color: 'red' as const,
  },
  {
    title: 'Conversion',
    value: '3.45%',
    change: '+5%',
    color: 'purple' as const,
  },
])

const activitiesData = ref([
  {
    id: 1,
    title: 'New user registered',
    time: '2 minutes ago',
    type: 'user' as const,
  },
  {
    id: 2,
    title: 'Order #1234 completed',
    time: '5 minutes ago',
    type: 'order' as const,
  },
  {
    id: 3,
    title: 'Payment received',
    time: '10 minutes ago',
    type: 'payment' as const,
  },
])
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
