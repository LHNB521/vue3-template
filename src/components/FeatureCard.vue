<template>
  <div class="feature-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex items-center mb-4">
      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
        <component :is="iconComponent" class="w-6 h-6 text-blue-600" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
    </div>
    <p class="text-gray-600">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description: string
  icon: string
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  // 这里可以根据icon名称返回对应的图标组件
  // 为了简化，这里返回一个通用的图标
  return 'div'
})
</script>

<style lang="scss" scoped>
.feature-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
