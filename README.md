# Vue3 Template

A modern Vue3 project template with TypeScript, Element Plus, Pinia, and more.

## Features

- ⚡️ **Vue 3** - Composition API, `<script setup>` syntax
- 🔥 **TypeScript** - Type safety and better DX
- 🎨 **Element Plus** - Rich UI component library
- 🍍 **Pinia** - Modern state management
- 📡 **Axios** - HTTP client with interceptors
- 📅 **Day.js** - Date manipulation library
- 📊 **ECharts** - Powerful charting library
- 🎯 **Tailwind CSS** - Utility-first CSS framework
- ⚡️ **Vite** - Fast build tool
- 📏 **ESLint** - Code linting
- 💅 **Prettier** - Code formatting
- 🎨 **Sass** - CSS preprocessor

## Project Structure

\`\`\`
src/
├── components/          # Reusable components
├── views/              # Page components
├── stores/             # Pinia stores
├── router/             # Vue Router configuration
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles and variables
└── main.ts             # Application entry point
\`\`\`

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn or pnpm

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd vue3-template
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Start development server
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Build for production
\`\`\`bash
npm run build
# or
yarn build
# or
pnpm build
\`\`\`

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run ESLint
- `format` - Format code with Prettier

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

\`\`\`bash
cp .env.example .env
\`\`\`

### Tailwind CSS

Tailwind CSS is configured in `tailwind.config.js`. You can customize colors, spacing, and other design tokens.

### Element Plus

Element Plus is auto-imported using `unplugin-vue-components`. You can use components directly without manual imports.

### ECharts

ECharts is integrated with `vue-echarts`. Import only the components you need to keep bundle size small.

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax
- Prefer composition over options API
- Use Pinia for state management
- Follow ESLint and Prettier rules

### Component Structure

\`\`\`vue
<template>
  <!-- Template content -->
</template>

<script setup lang="ts">
// Imports
// Props/Emits interfaces
// Reactive data
// Computed properties
// Methods
// Lifecycle hooks
</script>

<style lang="scss" scoped>
/* Component styles */
</style>
\`\`\`

### State Management

Use Pinia stores for global state:

\`\`\`typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  const state = ref(initialValue)
  
  const getter = computed(() => state.value)
  
  const action = () => {
    // Action logic
  }
  
  return { state, getter, action }
})
\`\`\`

## License

MIT License
