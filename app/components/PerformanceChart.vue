<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { MetricKey, TrendPoint } from '~/types/dashboard'

const props = defineProps<{ data: TrendPoint[], title?: string }>()
const primary = ref<MetricKey>('leads')
const secondary = ref<MetricKey>('spend')
const options = [{ label: 'Leads', value: 'leads' }, { label: 'Spend', value: 'spend' }, { label: 'CPL', value: 'cpl' }, { label: 'Qualified Leads', value: 'qualifiedLeads' }, { label: 'CPQL', value: 'cpql' }, { label: 'Clicks', value: 'clicks' }, { label: 'CTR', value: 'ctr' }, { label: 'CPC', value: 'cpc' }, { label: 'CPM', value: 'cpm' }]
const x = (_: TrendPoint, i: number) => i
const y1 = (row: TrendPoint) => row[primary.value]
const y2 = (row: TrendPoint) => row[secondary.value]
const tick = (i: number) => props.data[i] && (i === 0 || i === props.data.length - 1 || i % 5 === 0) ? new Date(props.data[i].date).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' }) : ''
const tooltip = (row: TrendPoint) => `${new Date(row.date).toLocaleDateString('en-EG')}: ${primary.value} ${Number(row[primary.value]).toLocaleString('en-EG', { maximumFractionDigits: 1 })} · ${secondary.value} ${Number(row[secondary.value]).toLocaleString('en-EG', { maximumFractionDigits: 1 })}`
</script>

<template>
  <UCard class="tcz-panel" :ui="{ body: 'px-2 sm:px-4' }">
    <template #header>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-medium text-highlighted">
            {{ title || 'Performance over time' }}
          </h2><p class="mt-1 text-xs text-muted">
            Compare volume, cost, and quality without changing pages.
          </p>
        </div><div class="flex gap-2">
          <USelect
            v-model="primary"
            :items="options"
            value-key="value"
            size="sm"
            class="w-36"
          /><USelect
            v-model="secondary"
            :items="options"
            value-key="value"
            size="sm"
            class="w-36"
          />
        </div>
      </div>
    </template><VisXYContainer :data="data" :padding="{ top: 24, bottom: 4 }" class="h-80 sm:h-96">
      <VisLine
        :x="x"
        :y="y1"
        color="#F05223"
        :line-width="3"
      /><VisLine
        :x="x"
        :y="y2"
        color="#111111"
        :line-width="2"
        :line-dash-array="[6, 4]"
      /><VisAxis type="x" :x="x" :tick-format="tick" /><VisCrosshair color="#F05223" :template="tooltip" /><VisTooltip />
    </VisXYContainer><template #footer>
      <div class="flex gap-5 text-xs">
        <span class="flex items-center gap-2"><span class="h-0.5 w-5 bg-primary" />{{ options.find(x => x.value === primary)?.label }}</span><span class="flex items-center gap-2"><span class="h-0.5 w-5 bg-black dark:bg-white" />{{ options.find(x => x.value === secondary)?.label }}</span>
      </div>
    </template>
  </UCard>
</template>

<style scoped>
.unovis-xy-container { --vis-axis-grid-color: var(--ui-border); --vis-axis-tick-color: var(--ui-border); --vis-axis-tick-label-color: var(--ui-text-dimmed); --vis-tooltip-background-color: var(--ui-bg); --vis-tooltip-border-color: var(--ui-border); --vis-tooltip-text-color: var(--ui-text-highlighted); }
</style>
