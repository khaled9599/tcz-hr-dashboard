<script setup lang="ts">
const { data, status } = useDashboardData()
const { currency, number, percent } = useFormatters()
const platformRows = computed(() => Object.values((data.value?.campaigns || []).reduce<Record<string, any>>((sum, row) => { const item = sum[row.platform] ||= { name: row.platform, spend: 0, leads: 0, qualified: 0 }; item.spend += row.spend; item.leads += row.leads; item.qualified += row.qualifiedLeads; return sum }, {})))
const totalBy = (platform: string, key: string) => (data.value?.campaigns || []).filter((row: any) => row.platform === platform).reduce((sum: number, row: any) => sum + row[key], 0)
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Media Performance" description="A detailed view of delivery, cost, conversion, and lead quality across paid platforms." /><div v-if="status === 'pending'" class="mt-8">
      <USkeleton class="h-80 rounded-xl" />
    </div><template v-else-if="data">
      <div class="mt-8">
        <MetricStrip :metrics="[...data.metrics.slice(1, 6), ...data.secondaryMetrics].slice(0, 7)" />
      </div><div class="mt-6">
        <PerformanceChart :data="data.trend" title="Media efficiency over time" />
      </div><div class="mt-6 grid gap-6 lg:grid-cols-2">
        <SimpleBarChart title="Spend distribution" subtitle="Investment by platform" :rows="platformRows.map((row:any) => ({ name: row.name, value: row.spend }))" /><SimpleBarChart title="Lead volume by platform" subtitle="Submitted leads, not platform form opens" :rows="platformRows.map((row:any) => ({ name: row.name, value: row.leads }))" />
      </div><UCard class="tcz-panel mt-6">
        <template #header>
          <h2 class="text-lg font-medium">
            Platform breakdown
          </h2>
        </template><div class="overflow-x-auto">
          <table class="w-full min-w-[850px] text-sm">
            <thead>
              <tr class="border-b border-default text-left text-xs text-muted">
                <th class="pb-3">
                  Platform
                </th><th class="pb-3">
                  Spend
                </th><th class="pb-3">
                  Reach
                </th><th class="pb-3">
                  Impressions
                </th><th class="pb-3">
                  Clicks
                </th><th class="pb-3">
                  CTR
                </th><th class="pb-3">
                  CPC
                </th><th class="pb-3">
                  Leads
                </th><th class="pb-3">
                  CPL
                </th><th class="pb-3">
                  Qualified
                </th>
              </tr>
            </thead><tbody>
              <tr v-for="platformRow in platformRows" :key="(platformRow as any).name" class="border-b border-default last:border-0">
                <td class="py-4 font-medium">
                  {{ (platformRow as any).name }}
                </td><td>{{ currency.format((platformRow as any).spend) }}</td><td>{{ number.format(totalBy((platformRow as any).name, 'reach')) }}</td><td>{{ number.format(totalBy((platformRow as any).name, 'impressions')) }}</td><td>{{ number.format(totalBy((platformRow as any).name, 'clicks')) }}</td><td>{{ percent.format(totalBy((platformRow as any).name, 'clicks')/totalBy((platformRow as any).name, 'impressions')) }}</td><td>{{ currency.format((platformRow as any).spend/totalBy((platformRow as any).name, 'clicks')) }}</td><td class="font-medium">
                  {{ (platformRow as any).leads }}
                </td><td>{{ currency.format((platformRow as any).spend/(platformRow as any).leads) }}</td><td>{{ (platformRow as any).qualified }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
  </div>
</template>
