import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/Dashboard.vue"),
  },
  {
    path: "/charts",
    name: "Charts",
    component: () => import("@/views/Charts.vue"),
  },
  {
    path: "/cache-demo",
    name: "CacheDemo",
    component: () => import("@/views/CacheDemo.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
