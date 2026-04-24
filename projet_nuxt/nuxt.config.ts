export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'vuetify-nuxt-module'
  ],
  
  vuetify: {
    moduleOptions: {

    },
    vuetifyOptions: {
      icons: {
        defaultSet: 'mdi',
      }
    }
  },

  nitro: {
    experimental: {
      websocket: true
    }
  }
})