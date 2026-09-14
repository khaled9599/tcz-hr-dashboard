<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const session = useState<any>('session')
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
async function submit() {
  loading.value = true
  error.value = ''
  try {
    session.value = await $fetch('/api/auth/login', { method: 'POST', body: form })
    await navigateTo(String(route.query.redirect || '/'))
  } catch (cause: any) {
    error.value = cause?.data?.statusMessage || 'We could not sign you in. Check your credentials and try again.'
  } finally { loading.value = false }
}
</script>

<template>
  <main class="grid min-h-[100dvh] bg-[#f7f5f4] lg:grid-cols-[1.05fr_.95fr]">
    <section class="relative hidden overflow-hidden bg-black p-12 lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -right-24 top-16 size-96 rounded-full bg-primary/30 blur-[110px]" /><img src="/tcz/tcz-logo-white.svg" alt="The Creative Zone" class="relative w-40"><div class="relative max-w-xl">
        <p class="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Client analytics
        </p><h1 class="text-5xl font-medium leading-[1.02] tracking-[-.05em] text-white">
          Clear media decisions. Stronger lead quality.
        </h1><p class="mt-6 max-w-md text-base leading-7 text-white/55">
          A secure KOG workspace for understanding spend, leads, cost, quality, and campaign efficiency.
        </p>
      </div><p class="relative text-xs text-white/35">
        Powered by The Creative Zone
      </p>
    </section><section class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <img src="/tcz/tcz-logo-black.png" alt="The Creative Zone" class="mb-12 w-36 lg:hidden"><p class="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          KOG workspace
        </p><h2 class="mt-3 text-4xl font-medium tracking-tight text-black">
          Welcome back
        </h2><p class="mt-3 text-sm leading-6 text-zinc-500">
          Sign in with your secure client credentials.
        </p><UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="error"
          class="mt-6"
        /><form class="mt-8 space-y-5" @submit.prevent="submit">
          <UFormField label="Email address" required>
            <UInput
              v-model="form.email"
              type="email"
              autocomplete="email"
              size="xl"
              class="w-full"
              placeholder="client@company.com"
            />
          </UFormField><UFormField label="Password" required>
            <UInput
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              size="xl"
              class="w-full"
              placeholder="Enter your password"
            />
          </UFormField><UButton
            type="submit"
            block
            size="xl"
            :loading="loading"
          >
            Sign in securely
          </UButton>
        </form><p class="mt-8 text-xs leading-5 text-zinc-400">
          Access is restricted to authorized KOG and TCZ users. Sessions expire automatically.
        </p>
      </div>
    </section>
  </main>
</template>
