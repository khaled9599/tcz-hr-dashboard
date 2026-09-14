import type { DashboardPayload } from '~/types/dashboard'

export function useDashboardData() {
  const { scope } = useDateScope()
  const query = computed(() => ({ start: scope.value.start, end: scope.value.end }))
  return useFetch<DashboardPayload>('/api/dashboard', { query, watch: [query] })
}
