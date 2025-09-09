<template>
  <div class="quick-actions space-y-3">
    <el-button
      v-for="action in actions"
      :key="action.label"
      :type="action.type"
      class="w-full justify-start"
      @click="action.handler"
    >
      <component :is="action.icon" class="w-4 h-4 mr-2" />
      {{ action.label }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Plus, Upload, Download, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const actions = [
  {
    label: 'Create New Project',
    type: 'primary' as const,
    icon: Plus,
    handler: () => ElMessage.success('Create new project clicked'),
  },
  {
    label: 'Upload Files',
    type: 'success' as const,
    icon: Upload,
    handler: () => ElMessage.success('Upload files clicked'),
  },
  {
    label: 'Export Data',
    type: 'warning' as const,
    icon: Download,
    handler: () => ElMessage.success('Export data clicked'),
  },
  {
    label: 'Settings',
    type: 'info' as const,
    icon: Setting,
    handler: () => ElMessage.success('Settings clicked'),
  },
]
</script>
