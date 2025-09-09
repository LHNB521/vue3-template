<template>
  <div class="home-container">
    <AppHeader />
    
    <main class="main-content">
      <div class="hero-section bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-6">Vue3 Template</h1>
          <p class="text-xl mb-8">
            A modern Vue3 project template with TypeScript, Element Plus, Pinia, and more
          </p>
          <div class="space-x-4">
            <el-button type="primary" size="large" @click="goToDashboard">
              Get Started
            </el-button>
            <el-button type="default" size="large" @click="goToCharts">
              View Charts
            </el-button>
          </div>
        </div>
      </div>

      <div class="features-section py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              v-for="feature in features"
              :key="feature.title"
              :title="feature.title"
              :description="feature.description"
              :icon="feature.icon"
            />
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import FeatureCard from '@/components/FeatureCard.vue'

const router = useRouter()

const features = [
  {
    title: 'Vue 3 + TypeScript',
    description: 'Built with the latest Vue 3 Composition API and TypeScript for type safety',
    icon: 'vue',
  },
  {
    title: 'Element Plus',
    description: 'Rich UI components library for rapid development',
    icon: 'element',
  },
  {
    title: 'Pinia State Management',
    description: 'Modern state management with excellent TypeScript support',
    icon: 'pinia',
  },
  {
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    icon: 'tailwind',
  },
  {
    title: 'ECharts Integration',
    description: 'Powerful charting library for data visualization',
    icon: 'charts',
  },
  {
    title: 'Modern Tooling',
    description: 'Vite, ESLint, Prettier, and more for excellent DX',
    icon: 'tools',
  },
]

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToCharts = () => {
  router.push('/charts')
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.features-section {
  background-color: #f8fafc;
}
</style>
