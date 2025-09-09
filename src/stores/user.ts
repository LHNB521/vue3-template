import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { User } from "@/types/user"

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null)
  const token = ref<string>("")

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || "Guest")

  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    if (typeof window !== "undefined") {
      localStorage.setItem("token", tokenValue)
    }
  }

  const logout = () => {
    user.value = null
    token.value = ""
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  const initAuth = () => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token")
      if (savedToken) {
        token.value = savedToken
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    userName,
    setUser,
    setToken,
    logout,
    initAuth,
  }
})
