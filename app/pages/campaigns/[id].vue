<script setup lang="ts">
const route = useRoute()
const { data, status, error } = await useFetch<any>(`/api/campaigns/${route.params.id}`)
const { currency, number, percent } = useFormatters()
const metrics = computed(() => data.value ? [{ key: 'leads', label: 'Leads Submitted', value: data.value.campaign.leads, previous: 0, change: null, format: 'number', primary: true }, { key: 'spend', label: 'Spend', value: data.value.campaign.spend, previous: 0, change: null, format: 'currency' }, { key: 'cpl', label: 'CPL', value: data.value.campaign.cpl, previous: 0, change: null, format: 'currency', invertTrend: true }, { key: 'qualified', label: 'Qualified Leads', value: data.value.campaign.qualifiedLeads, previous: 0, change: null, format: 'number' }, { key: 'quality', label: 'Qualification Rate', value: data.value.campaign.qualificationRate, previous: 0, change: null, format: 'percent' }] : [])
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <UButton
      to="/campaigns"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
      class="mb-4"
    >
      Back to campaigns
    </UButton><div v-if="status === 'pending'">
      <USkeleton class="h-80 rounded-xl" />
    </div><UAlert v-else-if="error" color="error" title="Campaign not found" /><template v-else-if="data">
      <DashboardPageHeader :title="data.campaign.name" :description="`${data.campaign.platform} · ${data.campaign.objective} · ${data.campaign.status}`" /><div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKPI v-for="item in metrics" :key="item.key" :metric="item as any" />
      </div><div class="mt-6">
        <PerformanceChart :data="data.trend" title="Campaign trend" />
      </div><div class="mt-6 grid gap-6 lg:grid-cols-3">
        <UCard class="tcz-panel">
          <p class="text-xs text-muted">
            Reach
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ number.format(data.campaign.reach) }}
          </p>
        </UCard><UCard class="tcz-panel">
          <p class="text-xs text-muted">
            Click-through rate
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ percent.format(data.campaign.ctr/100) }}
          </p>
        </UCard><UCard class="tcz-panel">
          <p class="text-xs text-muted">
            Cost per qualified lead
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ currency.format(data.campaign.cpql) }}
          </p>
        </UCard>
      </div><UAlert
        v-if="!data.adSets.length"
        class="mt-6"
        color="neutral"
        variant="subtle"
        icon="i-lucide-layers"
        title="Ad set and ad breakdowns are ready to connect"
        description="The page keeps these modules separate so Meta API data can be added later without redesigning the campaign view."
      />
    </template>
  </div>
</template>
