<script setup lang="ts">
const { data, status, error } = useDashboardData()
const { currency, percent } = useFormatters()
const topCampaigns = computed(() => (data.value?.campaigns || []).slice().sort((a, b) => b.leads - a.leads))
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Overview" description="How much we spent, how many leads we generated, what each lead cost, and which campaigns are strongest." /><div v-if="status === 'pending'" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <USkeleton v-for="i in 6" :key="i" class="h-44 rounded-xl" />
    </div><UAlert
      v-else-if="error"
      class="mt-8"
      color="error"
      icon="i-lucide-cloud-alert"
      title="Performance data could not be loaded"
      description="Your previous data remains safe. Refresh the page or contact TCZ if the problem continues."
    /><template v-else-if="data">
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKPI v-for="item in data.metrics" :key="item.key" :metric="item" />
      </div><div class="mt-4">
        <MetricStrip :metrics="data.secondaryMetrics" />
      </div><div class="mt-6">
        <PerformanceChart :data="data.trend" title="Spend, lead volume, and efficiency" />
      </div><div class="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <UCard class="tcz-panel">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-medium">
                  Campaign performance
                </h2><p class="mt-1 text-xs text-muted">
                  Volume and lead quality shown together.
                </p>
              </div><UButton
                to="/campaigns"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-arrow-right"
              >
                All campaigns
              </UButton>
            </div>
          </template><div class="overflow-x-auto">
            <table class="w-full min-w-[700px] text-sm">
              <thead>
                <tr class="border-b border-default text-left text-xs text-muted">
                  <th class="pb-3 font-normal">
                    Campaign
                  </th><th class="pb-3 font-normal">
                    Spend
                  </th><th class="pb-3 font-normal">
                    Leads
                  </th><th class="pb-3 font-normal">
                    CPL
                  </th><th class="pb-3 font-normal">
                    Qualified
                  </th><th class="pb-3 font-normal">
                    Quality
                  </th>
                </tr>
              </thead><tbody>
                <tr v-for="campaign in topCampaigns" :key="campaign.id" class="border-b border-default/70 last:border-0">
                  <td class="py-4">
                    <NuxtLink :to="`/campaigns/${campaign.id}`" class="font-medium hover:text-primary">{{ campaign.name }}</NuxtLink><p class="mt-1 text-xs text-muted">
                      {{ campaign.platform }}
                    </p>
                  </td><td class="metric-number py-4">
                    {{ currency.format(campaign.spend) }}
                  </td><td class="metric-number py-4 font-medium">
                    {{ campaign.leads }}
                  </td><td class="metric-number py-4">
                    {{ currency.format(campaign.cpl) }}
                  </td><td class="metric-number py-4">
                    {{ campaign.qualifiedLeads }}
                  </td><td class="py-4">
                    <UBadge :color="campaign.qualificationRate >= 45 ? 'success' : campaign.qualificationRate < 32 ? 'error' : 'neutral'" variant="subtle">
                      {{ percent.format(campaign.qualificationRate / 100) }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard><UCard class="tcz-panel bg-black text-white ring-0">
          <template #header>
            <h2 class="text-lg font-medium">
              Decision signal
            </h2>
          </template><p class="text-3xl font-medium leading-tight tracking-tight">
            Retargeting brings the strongest lead quality.
          </p><p class="mt-4 text-sm leading-6 text-white/55">
            Family Living Retargeting qualifies more than half of submitted leads. Broad Prospecting has the weakest quality and highest CPL.
          </p><div class="mt-8 space-y-4">
            <div>
              <div class="flex justify-between text-xs">
                <span class="text-white/55">Strongest quality</span><span>55.5%</span>
              </div><div class="mt-2 h-1.5 rounded-full bg-white/10">
                <div class="h-full w-[55.5%] rounded-full bg-primary" />
              </div>
            </div><div>
              <div class="flex justify-between text-xs">
                <span class="text-white/55">Weakest quality</span><span>25.7%</span>
              </div><div class="mt-2 h-1.5 rounded-full bg-white/10">
                <div class="h-full w-[25.7%] rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </div>
</template>
