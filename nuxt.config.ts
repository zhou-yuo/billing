// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxt/icon", "@element-plus/nuxt", "@nuxthub/core", '@nuxtjs/color-mode'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      title: '账单',
      meta: [
        // 禁用双击放大和缩放
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ]
    },
  },
  hub: {
    kv: true,
    database: true
  },
  nitro: {
    experimental: {
      // 填充数据库(实验性功能)
      tasks: true
    }
  },
  devServer: {
    port: 8888
  },
  css: [
    '~/assets/scss/index.scss',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/scss/element/index.scss" as element;
            @use "@/assets/scss/variables.scss" as *;
          `,
        },
      },
    },
  },
  elementPlus: {
    importStyle: 'scss',
    themes: ['dark'],
  },
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    classPrefix: '',
    classSuffix: '',
    storage: 'cookie'
  }
});