// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon', 
    'shadcn-nuxt',
    ['@pinia/nuxt', {
      autoImports: ['defineStore', 'storeToRefs']
    }]
  ],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    define: {
      API_URL: JSON.stringify(process.env.API_URL || 'https://example.com'),
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  runtimeConfig: {
    public: {
      NEXT_PUBLIC_STACK_API_URL: process.env.NEXT_PUBLIC_STACK_API_URL,
      NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    },
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
  }
})
