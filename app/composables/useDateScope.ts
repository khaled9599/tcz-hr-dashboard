import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

const asDate = (value: Date) => format(value, 'yyyy-MM-dd')

export function useDateScope() {
  const route = useRoute()
  const router = useRouter()
  const now = new Date()

  const initialPreset = String(route.query.period || 'last-30-days')
  const scope = useState('dashboard-date-scope', () => ({
    preset: initialPreset,
    start: String(route.query.start || asDate(subDays(now, 29))),
    end: String(route.query.end || asDate(now))
  }))

  function applyPreset(preset: string) {
    const today = new Date()
    scope.value.preset = preset
    if (preset === 'today') scope.value.start = scope.value.end = asDate(today)
    if (preset === 'yesterday') scope.value.start = scope.value.end = asDate(subDays(today, 1))
    if (preset === 'last-7-days') {
      scope.value.start = asDate(subDays(today, 6))
      scope.value.end = asDate(today)
    }
    if (preset === 'last-30-days') {
      scope.value.start = asDate(subDays(today, 29))
      scope.value.end = asDate(today)
    }
    if (preset === 'this-month') {
      scope.value.start = asDate(startOfMonth(today))
      scope.value.end = asDate(today)
    }
    if (preset === 'previous-month') {
      const month = subMonths(today, 1)
      scope.value.start = asDate(startOfMonth(month))
      scope.value.end = asDate(endOfMonth(month))
    }
    persist()
  }

  function persist() {
    router.replace({ query: { ...route.query, period: scope.value.preset, start: scope.value.start, end: scope.value.end } })
  }

  return { scope, applyPreset, persist }
}
