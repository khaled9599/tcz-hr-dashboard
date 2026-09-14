// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-security'
  ],

  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    demoMode: process.env.NUXT_DEMO_MODE === 'true',
    demoUserEmail: process.env.DEMO_USER_EMAIL,
    demoUserPassword: process.env.DEMO_USER_PASSWORD,
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleSheetId: process.env.GOOGLE_SHEET_ID,
    googleSheetRange: process.env.GOOGLE_SHEET_RANGE || 'Leads!A:ZZ',
    syncSecret: process.env.SYNC_SECRET,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      clientName: process.env.NUXT_PUBLIC_CLIENT_NAME || 'KOG'
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  security: {
    headers: {
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        'img-src': ['\'self\'', 'data:'],
        'font-src': ['\'self\'', 'data:'],
        'connect-src': ['\'self\'']
      }
    },
    rateLimiter: {
      tokensPerInterval: 120,
      interval: 60000,
      headers: true
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 10 * 1024 * 1024
    }
  }
})
