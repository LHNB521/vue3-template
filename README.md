# Vue3 模板

一个现代化的 Vue3 项目模板，集成了 TypeScript、Element Plus、Pinia 等技术。

## 特性

- ⚡️ **Vue 3** - 组合式 API，`<script setup>` 语法
- 🔥 **TypeScript** - 类型安全和更好的开发体验
- 🎨 **Element Plus** - 丰富的 UI 组件库
- 🍍 **Pinia** - 现代化状态管理
- 📡 **Axios** - 带拦截器的 HTTP 客户端
- 💾 **智能缓存** - 基于 localStorage 的请求缓存系统
- 📅 **Day.js** - 日期处理库
- 📊 **ECharts** - 强大的图表库
- 🎯 **Tailwind CSS** - 实用优先的 CSS 框架
- ⚡️ **Vite** - 快速的构建工具
- 📏 **ESLint** - 代码检查
- 💅 **Prettier** - 代码格式化
- 🎨 **Sass** - CSS 预处理器

## 项目结构

\`\`\`
src/
├── components/          # 可复用组件
├── views/              # 页面组件
├── stores/             # Pinia 状态管理
├── router/             # Vue Router 配置
├── utils/              # 工具函数
├── types/              # TypeScript 类型定义
├── styles/             # 全局样式和变量
└── main.ts             # 应用入口点
\`\`\`

## 开始使用

### 环境要求

- Node.js 16+
- npm 或 yarn 或 pnpm

### 安装

1. 克隆仓库
\`\`\`bash
git clone <repository-url>
cd vue3-template
\`\`\`

2. 安装依赖
\`\`\`bash
npm install
# 或
yarn install
# 或
pnpm install
\`\`\`

3. 启动开发服务器
\`\`\`bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
\`\`\`

4. 构建生产版本
\`\`\`bash
npm run build
# 或
yarn build
# 或
pnpm build
\`\`\`

## 脚本命令

- `dev` - 启动开发服务器
- `build` - 构建生产版本
- `preview` - 预览生产构建
- `lint` - 运行 ESLint 检查
- `format` - 使用 Prettier 格式化代码

## 配置

### 环境变量

复制 `.env.example` 到 `.env` 并配置你的环境变量：

\`\`\`bash
cp .env.example .env
\`\`\`

### Tailwind CSS

Tailwind CSS 在 `tailwind.config.js` 中配置。你可以自定义颜色、间距和其他设计标记。

### Element Plus

Element Plus 使用 `unplugin-vue-components` 自动导入。你可以直接使用组件，无需手动导入。

### ECharts

ECharts 通过 `vue-echarts` 集成。仅导入你需要的组件以保持包体积小。

### 智能缓存系统

项目集成了完整的缓存解决方案，支持多种缓存策略和自动过期管理。

#### 缓存特性

- 🚀 **多种缓存策略**: 缓存优先、网络优先、仅缓存、仅网络、过期重新验证
- ⏰ **自动过期管理**: 支持 TTL 设置和自动清理过期缓存
- 🔄 **版本控制**: 支持缓存版本管理，便于缓存失效
- 📊 **统计监控**: 提供缓存命中率、大小等统计信息
- 🛠️ **灵活配置**: 支持全局和单个请求的缓存配置

#### 基本使用

\`\`\`typescript
import { cachedGet, cachedPost } from '@/utils/request'
import { CacheStrategy } from '@/types/cache'

// 使用缓存优先策略获取数据
const userData = await cachedGet('/api/users', { page: 1 }, {
  strategy: CacheStrategy.CACHE_FIRST,
  ttl: 5 * 60 * 1000, // 5分钟缓存
  version: '1.0'
})

// 使用过期重新验证策略
const config = await cachedGet('/api/config', undefined, {
  strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
  ttl: 30 * 60 * 1000 // 30分钟缓存
})
\`\`\`

#### 缓存策略

- **CACHE_FIRST**: 优先使用缓存，缓存失效时发起请求
- **NETWORK_FIRST**: 优先发起请求，请求失败时使用缓存
- **CACHE_ONLY**: 仅使用缓存，不发起请求
- **NETWORK_ONLY**: 仅发起请求，不使用缓存
- **STALE_WHILE_REVALIDATE**: 返回缓存数据，同时在后台更新缓存

## 开发指南

### 代码风格

- 使用 TypeScript 保证类型安全
- 遵循 Vue 3 组合式 API 模式
- 使用 `<script setup>` 语法
- 优先使用组合式 API 而不是选项式 API
- 使用 Pinia 进行状态管理
- 遵循 ESLint 和 Prettier 规则

### 组件结构

\`\`\`vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
// Props/Emits 接口
// 响应式数据
// 计算属性
// 方法
// 生命周期钩子
</script>

<style lang="scss" scoped>
/* 组件样式 */
</style>
\`\`\`

### 状态管理

使用 Pinia stores 进行全局状态管理：

\`\`\`typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  const state = ref(initialValue)

  const getter = computed(() => state.value)

  const action = () => {
    // 动作逻辑
  }

  return { state, getter, action }
})
\`\`\`

## 许可证

MIT 许可证
