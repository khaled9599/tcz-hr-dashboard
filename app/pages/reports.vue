<script setup lang="ts">
const platform = ref('')
const campaign = ref('')
const { data: campaigns } = await useFetch<any>('/api/campaigns')
const exportUrl = (format: string, dataset = 'summary') => `/api/reports/export?format=${format}&dataset=${dataset}&platform=${encodeURIComponent(platform.value)}&campaign=${encodeURIComponent(campaign.value)}`
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Reports" description="Create a concise executive report or export the underlying campaign and lead tables." /><div class="mt-6 flex flex-wrap gap-3">
      <USelect
        v-model="platform"
        :items="[{ label: 'All platforms', value: '' }, { label: 'Meta', value: 'Meta' }, { label: 'Google', value: 'Google' }]"
        value-key="value"
        class="w-44"
      /><USelect
        v-model="campaign"
        :items="[{ label: 'All campaigns', value: '' }, ...(campaigns?.rows||[]).map((row:any) => ({ label: row.name, value: row.id }))]"
        value-key="value"
        class="w-64"
      />
    </div><div class="mt-6 grid gap-5 md:grid-cols-3">
      <UCard class="tcz-panel">
        <UIcon name="i-lucide-file-text" class="size-7 text-primary" /><h2 class="mt-5 text-xl font-medium">
          Executive PDF
        </h2><p class="mt-2 text-sm leading-6 text-muted">
          Spend, leads, CPL, qualified leads, CPQL, and campaign comparison in a client-ready format.
        </p><UButton
          :to="exportUrl('pdf')"
          external
          class="mt-6"
          icon="i-lucide-download"
        >
          Download PDF
        </UButton>
      </UCard><UCard class="tcz-panel">
        <UIcon name="i-lucide-table-2" class="size-7 text-primary" /><h2 class="mt-5 text-xl font-medium">
          Campaign workbook
        </h2><p class="mt-2 text-sm leading-6 text-muted">
          Detailed campaign metrics for deeper analysis and reconciliation.
        </p><UButton
          :to="exportUrl('xlsx', 'campaigns')"
          external
          class="mt-6"
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
        >
          Download XLSX
        </UButton>
      </UCard><UCard class="tcz-panel">
        <UIcon name="i-lucide-users-round" class="size-7 text-primary" /><h2 class="mt-5 text-xl font-medium">
          Lead data
        </h2><p class="mt-2 text-sm leading-6 text-muted">
          Permission-controlled lead records for authorized client use.
        </p><div class="mt-6 flex gap-2">
          <UButton
            :to="exportUrl('xlsx', 'leads')"
            external
            color="neutral"
            variant="outline"
          >
            XLSX
          </UButton><UButton
            :to="exportUrl('csv', 'leads')"
            external
            color="neutral"
            variant="ghost"
          >
            CSV
          </UButton>
        </div>
      </UCard>
    </div><UAlert
      class="mt-6"
      color="neutral"
      variant="subtle"
      icon="i-lucide-shield-check"
      title="Exports inherit the signed-in user's client scope"
      description="The future CRM can add field-level and page-level permissions without changing the report interface."
    />
  </div>
</template>
