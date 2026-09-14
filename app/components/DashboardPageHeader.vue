<script setup lang="ts">
defineProps<{ title: string, description: string, showDate?: boolean }>()
</script>

<template>
  <div class="flex flex-col gap-5 border-b border-default pb-6 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
        KOG performance
      </p><h1 class="text-3xl font-medium tracking-tight text-highlighted sm:text-4xl">
        {{ title }}
      </h1><p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
        {{ description }}
      </p>
    </div><DateRangeControl v-if="showDate !== false" />
  </div>
</template>
