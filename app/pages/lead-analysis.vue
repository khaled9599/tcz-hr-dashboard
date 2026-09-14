<script setup lang="ts">
const { data, status } = await useFetch<any>('/api/lead-analysis')
const { currency, percent } = useFormatters()
const metricCards = computed(() => data.value ? [{ label: 'Total Leads', value: data.value.metrics.total }, { label: 'Valid Leads', value: data.value.metrics.valid }, { label: 'Invalid Leads', value: data.value.metrics.invalid }, { label: 'Duplicate Leads', value: data.value.metrics.duplicates }, { label: 'Qualified Leads', value: data.value.metrics.qualified }, { label: 'Converted Leads', value: data.value.metrics.converted }] : [])
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Lead Analysis" description="Evaluate both volume and quality so lower-volume, higher-intent campaigns remain visible." /><div v-if="status === 'pending'" class="mt-8">
      <USkeleton class="h-80 rounded-xl" />
    </div><template v-else-if="data">
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <UCard v-for="item in metricCards" :key="item.label" class="tcz-panel">
          <p class="text-xs text-muted">
            {{ item.label }}
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ item.value.toLocaleString() }}
          </p>
        </UCard>
      </div><div class="mt-4 grid gap-4 lg:grid-cols-3">
        <UCard class="tcz-panel">
          <p class="text-xs text-muted">
            Qualification Rate
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ percent.format(data.metrics.qualificationRate/100) }}
          </p>
        </UCard><UCard class="tcz-panel">
          <p class="text-xs text-muted">
            Conversion Rate
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ percent.format(data.metrics.conversionRate/100) }}
          </p>
        </UCard><UCard class="tcz-panel">
          <p class="text-xs text-muted">
            Cost Per Qualified Lead
          </p><p class="metric-number mt-3 text-3xl font-medium">
            {{ currency.format(data.metrics.cpql) }}
          </p>
        </UCard>
      </div><div class="mt-6 grid gap-6 lg:grid-cols-2">
        <SimpleBarChart title="Leads by campaign" subtitle="Volume: submitted leads" :rows="data.byCampaign.map((row:any) => ({ name: row.name, value: row.leads }))" /><SimpleBarChart
          title="Campaign lead quality"
          subtitle="Quality: percentage of leads qualified"
          value-label="%"
          :rows="data.byCampaign.map((row:any) => ({ name: row.name, value: Number(row.qualificationRate.toFixed(1)) }))"
        />
      </div><div class="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <SimpleBarChart title="Leads by platform" :rows="data.byPlatform" /><SimpleBarChart title="Leads by location" :rows="data.byLocation" /><SimpleBarChart title="Lead status distribution" :rows="data.byStatus" />
      </div>
    </template>
  </div>
</template>
