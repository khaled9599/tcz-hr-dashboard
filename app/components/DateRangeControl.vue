<script setup lang="ts">
const { scope, applyPreset, persist } = useDateScope()
const options = [{ label: 'Today', value: 'today' }, { label: 'Yesterday', value: 'yesterday' }, { label: 'Last 7 Days', value: 'last-7-days' }, { label: 'Last 30 Days', value: 'last-30-days' }, { label: 'This Month', value: 'this-month' }, { label: 'Previous Month', value: 'previous-month' }, { label: 'Custom Range', value: 'custom' }]
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded-xl border border-default bg-default p-1.5 shadow-sm">
    <UIcon name="i-lucide-calendar-range" class="ml-1 size-4 text-muted" /><USelect
      :model-value="scope.preset"
      :items="options"
      value-key="value"
      class="w-40"
      variant="none"
      @update:model-value="applyPreset"
    /><template v-if="scope.preset === 'custom'">
      <UInput
        v-model="scope.start"
        type="date"
        size="sm"
        @change="persist"
      /><span class="text-xs text-muted">to</span><UInput
        v-model="scope.end"
        type="date"
        size="sm"
        @change="persist"
      />
    </template>
  </div>
</template>
