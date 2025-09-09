<template>
  <header class="app-header bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">V3</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Vue3 Template</span>
          </router-link>
        </div>

        <nav class="hidden md:flex space-x-8">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === item.href }"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <div class="flex items-center space-x-4">
          <el-button @click="handleToggleTheme" circle>
            <el-icon><Moon v-if="currentTheme === 'light'" /><Sunny v-else /></el-icon>
          </el-button>

          <el-dropdown>
            <div class="flex items-center space-x-2 cursor-pointer">
              <el-avatar :size="32" src="/avatar.jpg" />
              <span class="hidden sm:block text-sm font-medium text-gray-700">
                {{ currentUserName }}
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Profile</el-dropdown-item>
                <el-dropdown-item>Settings</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useUserStore, useAppStore } from '@/stores'

const userStore = useUserStore()
const appStore = useAppStore()

const currentUserName = computed(() => userStore.userName)
const currentTheme = computed(() => appStore.theme)

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Charts', href: '/charts' },
]

const handleToggleTheme = () => {
  appStore.toggleTheme()
}

const handleLogout = () => {
  userStore.logout()
}
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-link {
  @apply text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors;
}

.nav-link-active {
  @apply text-blue-600 bg-blue-50;
}
</style>
