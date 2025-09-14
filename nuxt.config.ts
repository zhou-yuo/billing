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