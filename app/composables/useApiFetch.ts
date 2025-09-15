// composables/useApiFetch.ts
import type { UseFetchOptions } from '#app'

type UrlType = string | Ref<string> | (() => string);

export function useApiFetch<T>(url: UrlType, options: UseFetchOptions<T> = {}) {

  const customOptions: UseFetchOptions<T> = {
    baseURL: '/api/', // 从运行时配置中获取 API 基础 URL

    // onRequest 拦截器：在每次请求前执行
    onRequest({ request, options }) {
      // 从 cookie 或 store 中获取 token
      const { userId } = useAuth();
      options.headers = new Headers(options.headers)

      options.headers.set('x-user-id', userId.value || '')
    },

    // onResponseError 拦截器：在请求失败时执行
    onResponseError({ request, response, options }) {
      // 在这里统一处理错误
      console.error('[fetch response error]', response.status, response._data)

      if (import.meta.client) {
        // 在客户端可以进行一些提示或重定向操作
        if (response.status === 401 || response.status === 403) {
          // 例如，对于 401 未授权错误，可以重定向到登录页面
          const { logout } = useAuth();
          logout()
        } else {
          // 其他错误可以显示一个全局的错误提示
          // 比如使用一个 toast 组件
          ElMessage.error(`请求失败: ${response.status} ${response.statusText}`)
        }
      }

      // Nuxt 会自动处理错误并可能显示错误页面
      // 如果你想阻止 Nuxt 的默认错误处理，可以不抛出错误
      // 也可以使用 showError 来手动触发错误页面
      // throw createError({ statusCode: response.status, statusMessage: response.statusText, fatal: true })
    },
    ...options
  }

  return useFetch(url, customOptions)
}

// 使用示例
// <template>
//   <div>
//     <p v-if="pending">加载中...</p>
//     <pre v-else-if="error">{{ error.data || error.message }}</pre>
//     <pre v-else>{{ data }}</pre>
//     <button @click="refresh()">刷新数据</button>
//   </div>
// </template>

// <script setup lang="ts">
// // 使用我们自定义的 useApiFetch
// const { data, pending, error, refresh } = await useApiFetch('/products/1')
// </script>