<template>
  <el-card class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-content">
      <div class="stat-info">
        <h3 class="stat-title">{{ title }}</h3>
        <p class="stat-value">{{ value }}</p>
      </div>
      <div class="stat-change" :class="changeClass">
        <span>{{ change }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string
  change: string
  color: 'blue' | 'green' | 'red' | 'purple'
}

const props = defineProps<Props>()

const changeClass = computed(() => {
  const isPositive = props.change.startsWith('+')
  return {
    'text-green-600': isPositive,
    'text-red-600': !isPositive,
  }
})
</script>

<style lang="scss" scoped>
.stat-card {
  border: none;
  
  &--blue {
    border-left: 4px solid #3b82f6;
  }
  
  &--green {
    border-left: 4px solid #10b981;
  }
  
  &--red {
    border-left: 4px solid #ef4444;
  }
  
  &--purple {
    border-left: 4px solid #8b5cf6;
  }
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
