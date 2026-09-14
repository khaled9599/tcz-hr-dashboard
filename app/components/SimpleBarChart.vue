<script setup lang="ts">
const props = defineProps<{ title: string, subtitle?: string, rows: { name: string, value: number, secondary?: number }[], valueLabel?: string }>()
const max = computed(() => Math.max(...props.rows.map(row => row.value), 1))
</script>

<template>
  <UCard class="tcz-panel">
    <template #header>
      <h2 class="text-base font-medium text-highlighted">
        {{ title }}
      </h2><p v-if="subtitle" class="mt-1 text-xs text-muted">
        {{ subtitle }}
      </p>
    </template><div class="space-y-4">
      <div v-for="row in rows.slice(0, 8)" :key="row.name">
        <div class="mb-1.5 flex items-center justify-between gap-4 text-xs">
          <span class="truncate text-toned">{{ row.name }}</span><span class="metric-number font-medium text-highlighted">{{ row.value.toLocaleString() }}{{ valueLabel }}</span>
        </div><div class="h-2 overflow-hidden rounded-full bg-elevated">
          <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.max(2, row.value / max * 100)}%` }" />
        </div>
      </div>
    </div>
  </UCard>
</template>
