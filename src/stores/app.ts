import { defineStore } from "pinia"
import { ref } from "vue"

export const useAppStore = defineStore("app", () => {
  const loading = ref(false)
  const sidebarCollapsed = ref(false)
  const theme = ref<"light" | "dark">("light")

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light"
  }

  return {
    loading,
    sidebarCollapsed,
    theme,
    setLoading,
    toggleSidebar,
    toggleTheme,
  }
})
