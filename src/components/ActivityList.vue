<template>
  <div class="activity-list">
    <div
      v-for="activity in activities"
      :key="activity.id"
      class="activity-item flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0"
    >
      <div class="activity-icon" :class="`activity-icon--${activity.type}`">
        <component :is="getIcon(activity.type)" class="w-4 h-4" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
        <p class="text-xs text-gray-500">{{ activity.time }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, ShoppingCart, CreditCard } from '@element-plus/icons-vue'

interface Activity {
  id: number
  title: string
  time: string
  type: 'user' | 'order' | 'payment'
}

interface Props {
  activities: Activity[]
}

defineProps<Props>()

const getIcon = (type: string) => {
  const icons = {
    user: User,
    order: ShoppingCart,
    payment: CreditCard,
  }
  return icons[type as keyof typeof icons] || User
}
</script>

<style lang="scss" scoped>
.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &--user {
    background-color: #dbeafe;
    color: #3b82f6;
  }
  
  &--order {
    background-color: #d1fae5;
    color: #10b981;
  }
  
  &--payment {
    background-color: #fef3c7;
    color: #f59e0b;
  }
}
</style>
