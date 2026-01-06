// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
  ],
  css: ['~/assets/css/tailwind.css'],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./app/components/ui"
     */
    componentDir: './app/components/ui'
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  icon: {
    // Add this configuration
    serverBundle: {
      collections: ['lucide']
    }
  },

  runtimeConfig: {
    public: {
      productName: 'SSync',
      appLogo: '/logo.png',
      apiBase: 'http://localhost:8000/api',
      // Set to 'multi' for subdomain-based tenants or 'single' for standalone deployment
      tenantMode: process.env.TENANT_MODE || 'multi',
    }
  },
  imports: {
    dirs: [
      'composables',           // Root level composables
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**',
      'app/composables/**'     // Also check app/composables if exists
    ]
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})