export function isDemoMode(config: ReturnType<typeof useRuntimeConfig>) {
  if (!config.demoMode) return false
  try {
    const hostname = new URL(String(config.public.siteUrl)).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}
