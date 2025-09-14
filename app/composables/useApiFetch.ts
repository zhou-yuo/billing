// composables/useApiFetch.ts
import type { UseFetchOptions } from '#app'
import type { $Fetch } from 'nitropack'

export function useApiFetch<T>(url: string, options: UseFetchOptions<T> = {}) {
  const { $apiFetch } = useNuxtApp()

  const customOptions: UseFetchOptions<T> = {
    ...options,
    // 使用类型断言解决兼容性问题
    $fetch: $apiFetch as $Fetch,
  }

  return useFetch(url, customOptions)
}