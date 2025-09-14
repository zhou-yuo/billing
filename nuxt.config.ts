// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/image",
    "@nuxt/icon",
    "@element-plus/nuxt",
    "@nuxthub/core",
  ],
  app: {
    head: {
      title: 'Billing',
      meta: [
        // 禁用双击放大和缩放
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ]
    },
  },
  hub: {
    database: true
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
});