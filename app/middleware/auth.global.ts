export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return
  const session = useState<{ authenticated: boolean } | null>('session', () => null)
  if (!session.value) {
    try {
      session.value = await $fetch('/api/auth/session')
    } catch {
      session.value = { authenticated: false }
    }
  }
  if (!session.value?.authenticated) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
