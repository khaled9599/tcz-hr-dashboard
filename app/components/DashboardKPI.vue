<script setup lang="ts">
import type { Metric } from '~/types/dashboard'

const props = defineProps<{ metric: Metric }>()
const { metric: formatMetric } = useFormatters()
const positive = computed(() => props.metric.change === null ? null : props.metric.invertTrend ? props.metric.change <= 0 : props.metric.change >= 0)
</script>

<template>
  <UCard :class="[metric.primary ? 'relative overflow-hidden bg-black text-white ring-0' : 'tcz-panel', metric.primary ? 'sm:col-span-2' : '']" :ui="{ body: metric.primary ? 'p-6 sm:p-7' : 'p-5' }">
    <div v-if="metric.primary" class="absolute -right-10 -top-16 size-48 rounded-full bg-primary/35 blur-3xl" /><div class="relative">
      <div class="flex items-center justify-between gap-3">
        <p :class="metric.primary ? 'text-white/60' : 'text-muted'" class="text-xs font-medium uppercase tracking-[0.13em]">
          {{ metric.label }}
        </p><UIcon v-if="metric.primary" name="i-lucide-user-round-plus" class="size-5 text-primary" />
      </div><p :class="metric.primary ? 'mt-6 text-6xl sm:text-7xl' : 'mt-4 text-3xl'" class="metric-number font-medium leading-none">
        {{ formatMetric(metric.value, metric.format) }}
      </p><div class="mt-4 flex items-center gap-2 text-xs">
        <UBadge v-if="metric.change !== null" :color="positive ? 'success' : 'error'" variant="subtle">
          <UIcon :name="metric.change >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="mr-1 size-3" />{{ metric.change >= 0 ? '+' : '' }}{{ metric.change.toFixed(1) }}%
        </UBadge><span :class="metric.primary ? 'text-white/50' : 'text-muted'">vs previous period</span>
      </div><p v-if="metric.previous !== undefined" :class="metric.primary ? 'text-white/45' : 'text-dimmed'" class="mt-3 text-xs">
        Previous: {{ formatMetric(metric.previous, metric.format) }}
      </p>
    </div>
  </UCard>
</template>
