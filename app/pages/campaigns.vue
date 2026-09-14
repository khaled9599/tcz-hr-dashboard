<script setup lang="ts">
const search = ref('')
const platform = ref('')
const campaignStatus = ref('')
const sort = ref('leads')
const query = computed(() => ({ search: search.value, platform: platform.value, status: campaignStatus.value }))
const { data, status } = await useFetch<any>('/api/campaigns', { query, watch: [query] })
const { currency, percent } = useFormatters()
const rows = computed(() => (data.value?.rows || []).slice().sort((a: any, b: any) => Number(b[sort.value] || 0) - Number(a[sort.value] || 0)))
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Campaigns" description="Compare campaign volume, cost, and lead quality. Open a campaign to inspect its trend and deeper breakdowns." /><div class="mt-6 flex flex-wrap gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search campaigns"
        class="min-w-56 flex-1"
      /><USelect
        v-model="platform"
        :items="[{ label: 'All platforms', value: '' }, { label: 'Meta', value: 'Meta' }, { label: 'Google', value: 'Google' }, { label: 'TikTok', value: 'TikTok' }]"
        value-key="value"
        class="w-40"
      /><USelect
        v-model="campaignStatus"
        :items="[{ label: 'All statuses', value: '' }, { label: 'Active', value: 'Active' }, { label: 'Paused', value: 'Paused' }, { label: 'Completed', value: 'Completed' }]"
        value-key="value"
        class="w-40"
      /><USelect
        v-model="sort"
        :items="[{ label: 'Sort: Leads', value: 'leads' }, { label: 'Sort: Spend', value: 'spend' }, { label: 'Sort: CPL', value: 'cpl' }, { label: 'Sort: Quality', value: 'qualificationRate' }]"
        value-key="value"
        class="w-40"
      /><UButton
        to="/api/reports/export?format=xlsx&dataset=campaigns"
        external
        icon="i-lucide-download"
        color="neutral"
        variant="outline"
      >
        Export
      </UButton>
    </div><div v-if="status === 'pending'" class="mt-6">
      <USkeleton class="h-96 rounded-xl" />
    </div><UCard v-else class="tcz-panel mt-6" :ui="{ body: 'p-0 sm:p-0' }">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1180px] text-sm">
          <thead class="bg-elevated/60">
            <tr class="text-left text-xs text-muted">
              <th class="px-5 py-3">
                Campaign
              </th><th class="px-3 py-3">
                Status
              </th><th class="px-3 py-3">
                Platform
              </th><th class="px-3 py-3">
                Objective
              </th><th class="px-3 py-3">
                Spend
              </th><th class="px-3 py-3">
                Reach
              </th><th class="px-3 py-3">
                Impressions
              </th><th class="px-3 py-3">
                Clicks
              </th><th class="px-3 py-3">
                CTR
              </th><th class="px-3 py-3">
                Leads
              </th><th class="px-3 py-3">
                CPL
              </th><th class="px-3 py-3">
                Qualified
              </th><th class="px-3 py-3">
                CPQL
              </th><th class="px-3 py-3">
                Conversion
              </th>
            </tr>
          </thead><tbody>
            <tr v-for="row in rows" :key="row.id" class="border-t border-default transition hover:bg-elevated/50">
              <td class="px-5 py-4">
                <NuxtLink :to="`/campaigns/${row.id}`" class="font-medium text-highlighted hover:text-primary">{{ row.name }}</NuxtLink><p class="mt-1 text-xs text-muted">
                  {{ row.startDate }} → {{ row.endDate || 'Ongoing' }}
                </p>
              </td><td class="px-3">
                <UBadge :color="row.status === 'Active' ? 'success' : 'neutral'" variant="subtle">
                  {{ row.status }}
                </UBadge>
              </td><td class="px-3">
                {{ row.platform }}
              </td><td class="px-3 text-muted">
                {{ row.objective }}
              </td><td class="metric-number px-3">
                {{ currency.format(row.spend) }}
              </td><td class="metric-number px-3">
                {{ row.reach.toLocaleString() }}
              </td><td class="metric-number px-3">
                {{ row.impressions.toLocaleString() }}
              </td><td class="metric-number px-3">
                {{ row.clicks.toLocaleString() }}
              </td><td class="metric-number px-3">
                {{ percent.format(row.ctr/100) }}
              </td><td class="metric-number px-3 font-medium">
                {{ row.leads }}
              </td><td class="metric-number px-3">
                {{ currency.format(row.cpl) }}
              </td><td class="metric-number px-3">
                {{ row.qualifiedLeads }}
              </td><td class="metric-number px-3">
                {{ currency.format(row.cpql) }}
              </td><td class="metric-number px-3">
                {{ percent.format(row.conversionRate/100) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard><p class="mt-4 text-xs text-muted">
      {{ rows.length }} campaigns. Tables scroll horizontally on smaller screens; key metrics remain visible first.
    </p>
  </div>
</template>
