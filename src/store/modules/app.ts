import defaultSettings from '@/settings'
// 导入 Element Plus 中英文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import store from '@/store'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const language = useStorage('language', defaultSettings.language)

  /**
   * 根据语言标识读取对应的语言包
   */
  const locale = computed(() => {
    return language.value === 'en' ? en : zhCn
  })

  function changeLanguage(lang: string) {
    language.value = lang
  }

  return {
    language,
    locale,
    changeLanguage,
  }
})
