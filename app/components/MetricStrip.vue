<script setup lang="ts">
import type { Metric } from '~/types/dashboard'

defineProps<{ metrics: Metric[] }>()
const { metric: formatMetric } = useFormatters()
</script>

<template>
  <div class="grid overflow-hidden rounded-xl border border-default bg-default sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
    <div v-for="item in metrics" :key="item.key" class="border-b border-default p-4 last:border-b-0 sm:border-r lg:border-b-0">
      <p class="text-xs text-muted">
        {{ item.label }}
      </p><p class="metric-number mt-2 text-xl font-medium text-highlighted">
        {{ formatMetric(item.value, item.format) }}
      </p><p v-if="item.change !== null" :class="(item.invertTrend ? item.change <= 0 : item.change >= 0) ? 'text-emerald-600' : 'text-red-600'" class="mt-1 text-xs">
        {{ item.change >= 0 ? '+' : '' }}{{ item.change.toFixed(1) }}%
      </p>
    </div>
  </div>
</template>
