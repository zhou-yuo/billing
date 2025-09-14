// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app'
import { defu } from 'defu'
import type { ApiResponse } from '~/types/apiResponse'

/**
 * 通用 API 请求封装
 * - SSR 页面初始化时获取数据
 * - CSR 用户交互时按需触发
 *
 * @param url - 接口路径
 * @param options - useFetch 配置项，可额外传 { immediate, server } 控制执行时机
 */
export function useApiFetch<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> & {
    /** 是否在 setup/SSR 阶段自动执行请求（默认 true） */
    immediate?: boolean
    /** 是否在服务端执行（默认 true，适合页面初始化；false 时只在客户端执行） */
    server?: boolean
  } = {}
) {

  const baseURL = '/'

  // 默认配置
  const defaults: UseFetchOptions<T> = {
    baseURL,
    immediate: options.immediate ?? true,
    server: options.server ?? true,

    // 请求拦截器
    onRequest({ options }) {
      options.headers = new Headers(options.headers)
    },

    // 响应拦截器
    onResponse({ response }) {
      const res = response._data as ApiResponse<T>
      if (res.status !== 200) {
        throw new Error(res.msg || 'API Error')
      }
      return res.data
    },

    // 错误拦截器
    onResponseError({ response }) {
      const res = response?._data as ApiResponse<any>
      const status = res?.status
      if (status === 401) {
        console.error('Unauthorized, redirecting to login')
        // navigateTo('/login')
      } else {
        console.error('Request failed with status:', status)
      }
      
      throw new Error(res?.msg || 'Network request failed')
    }
  }

  // 合并配置
  const params = defu(options, defaults)

  return useFetch(url, params);
}

/**
 * demo 1
 */
// <script setup lang="ts">
// import { useApiFetch } from '~/composables/useApiFetch'
// import type { Lang } from '~/api/types'

// const { data, pending, error } = await useApiFetch<Lang>('get_lang_json')

// console.log('SSR 数据:', data.value)
// </script>

/**
 * demo 2
 */
// <script setup lang="ts">
// import { useApiFetch } from '~/composables/useApiFetch'
// import type { Lang } from '~/api/types'

// const handleClick = async () => {
//   const { data, error } = await useApiFetch<Lang>('get_lang_json', {
//     server: false,   // 禁用 SSR
//     immediate: true  // 按需触发
//   })

//   console.log('按钮触发数据:', data.value)
// }
// </script>

// <template>
//   <button @click="handleClick">获取语言</button>
// </template>
