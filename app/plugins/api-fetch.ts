import { ofetch } from 'ofetch'

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()

  // 创建一个配置了 baseURL 和拦截器的 ofetch 实例
  const apiFetch = ofetch.create({
    baseURL: '/api/', // 从运行时配置中获取 API 基础 URL

    // onRequest 拦截器：在每次请求前执行
    onRequest({ request, options }) {
      // 从 cookie 或 store 中获取 token
      const token = useCookie('token').value

      if (token) {
        // 如果存在 token，则添加到请求头中
        options.headers = options.headers || {}
        ;(options.headers as any).Authorization = `Bearer ${token}`
      }
    },

    // onResponseError 拦截器：在请求失败时执行
    onResponseError({ request, response, options }) {
      // 在这里统一处理错误
      console.error('[fetch response error]', response.status, response._data)

      if (import.meta.client) {
        // 在客户端可以进行一些提示或重定向操作
        if (response.status === 401) {
          // 例如，对于 401 未授权错误，可以重定向到登录页面
          navigateTo('/login')
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
    }
  })

  // 通过 provide 将 apiFetch 注入到 Nuxt app 中
  return {
    provide: {
      apiFetch
    }
  }
})