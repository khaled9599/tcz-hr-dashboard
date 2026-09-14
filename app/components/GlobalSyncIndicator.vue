<script setup lang="ts">
const { data } = await useFetch<any>('/api/data-sources', { lazy: true })
</script>

<template>
  <NuxtLink to="/data-sources" class="hidden items-center gap-2 rounded-lg border border-default px-3 py-1.5 text-xs text-muted transition hover:bg-elevated sm:flex"><span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />Last lead sync: {{ data?.leads?.lastSyncAt ? new Date(data.leads.lastSyncAt).toLocaleTimeString('en-EG', { hour: 'numeric', minute: '2-digit' }) : 'Checking' }}</NuxtLink>
</template>
