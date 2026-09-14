<script setup lang="ts">
const search = ref('')
const campaign = ref('')
const leadStatus = ref('')
const qualification = ref('')
const showCustomFields = ref(false)
const page = ref(1)
const pageSize = ref(25)
const { data: campaignData } = await useFetch<any>('/api/campaigns')
const query = computed(() => ({ search: search.value, campaign: campaign.value, status: leadStatus.value, qualification: qualification.value, page: page.value, pageSize: pageSize.value }))
const { data, status } = await useFetch<any>('/api/leads', { query, watch: [query] })
const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / pageSize.value)))
watch([search, campaign, leadStatus, qualification], () => { page.value = 1 })
const statusColor = (value: string) => value === 'Qualified' || value === 'Converted' ? 'success' : value === 'Invalid' || value === 'Not Qualified' ? 'error' : 'neutral'
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Leads" description="Search and filter synchronized lead records. Statuses remain source-controlled in Phase 1." /><div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_190px_180px_180px_auto_auto]">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search ID, name, phone, or email" /><USelect v-model="campaign" :items="[{ label: 'All campaigns', value: '' }, ...(campaignData?.rows||[]).map((row:any) => ({ label: row.name, value: row.id }))]" value-key="value" /><USelect v-model="leadStatus" :items="[{ label: 'All statuses', value: '' }, ...['New', 'Contacted', 'No Answer', 'Interested', 'Follow Up', 'Qualified', 'Not Qualified', 'Converted', 'Duplicate', 'Invalid'].map(value => ({ label: value, value }))]" value-key="value" /><USelect v-model="qualification" :items="[{ label: 'All qualification', value: '' }, { label: 'Qualified', value: 'Qualified' }, { label: 'Not Qualified', value: 'Not Qualified' }, { label: 'Pending', value: 'Pending' }]" value-key="value" /><UButton
        to="/api/reports/export?format=xlsx&dataset=leads"
        external
        icon="i-lucide-download"
        color="neutral"
        variant="outline"
      >
        Export
      </UButton>
      <UButton
        v-if="data?.customFields?.length"
        icon="i-lucide-columns-3"
        color="neutral"
        :variant="showCustomFields ? 'soft' : 'outline'"
        @click="showCustomFields = !showCustomFields"
      >
        Custom fields
      </UButton>
    </div><div v-if="status === 'pending'" class="mt-6">
      <USkeleton class="h-96 rounded-xl" />
    </div><template v-else>
      <div class="mt-6 hidden overflow-x-auto rounded-xl border border-default bg-default lg:block">
        <table class="w-full min-w-[1200px] text-sm">
          <thead class="bg-elevated/60">
            <tr class="text-left text-xs text-muted">
              <th class="px-4 py-3">
                Lead
              </th><th class="px-4 py-3">
                Submitted
              </th><th class="px-4 py-3">
                Contact
              </th><th class="px-4 py-3">
                Campaign
              </th><th class="px-4 py-3">
                Platform
              </th><th class="px-4 py-3">
                Form
              </th><th class="px-4 py-3">
                Location
              </th><th class="px-4 py-3">
                Status
              </th><th class="px-4 py-3">
                Qualification
              </th>
              <th v-for="field in showCustomFields ? data?.customFields : []" :key="field" class="px-4 py-3">
                {{ field }}
              </th>
            </tr>
          </thead><tbody>
            <tr v-for="row in data?.rows" :key="row.id" class="border-t border-default">
              <td class="px-4 py-4">
                <p class="font-medium">
                  {{ row.name }}
                </p><p class="mt-1 text-xs text-muted">
                  {{ row.id }}
                </p>
              </td><td class="px-4">
                {{ new Date(row.submittedAt).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' }) }}
              </td><td class="px-4">
                <p>{{ row.phone }}</p><p class="mt-1 text-xs text-muted">
                  {{ row.email }}
                </p>
              </td><td class="max-w-56 px-4">
                {{ row.campaign }}
              </td><td class="px-4">
                {{ row.platform }}
              </td><td class="px-4">
                {{ row.form }}
              </td><td class="px-4">
                {{ row.location }}
              </td><td class="px-4">
                <UBadge :color="statusColor(row.status)" variant="subtle">
                  {{ row.status }}
                </UBadge>
              </td><td class="px-4">
                <UBadge :color="statusColor(row.qualificationStatus)" variant="subtle">
                  {{ row.qualificationStatus }}
                </UBadge>
              </td>
              <td v-for="field in showCustomFields ? data?.customFields : []" :key="field" class="px-4">
                {{ row.customFields?.[field] ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div><div class="mt-6 grid gap-3 lg:hidden">
        <UCard v-for="row in data?.rows" :key="row.id" class="tcz-panel">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium">
                {{ row.name }}
              </p><p class="mt-1 text-xs text-muted">
                {{ row.id }} · {{ new Date(row.submittedAt).toLocaleDateString('en-EG') }}
              </p>
            </div><UBadge :color="statusColor(row.qualificationStatus)" variant="subtle">
              {{ row.qualificationStatus }}
            </UBadge>
          </div><dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt class="text-muted">
                Campaign
              </dt><dd class="mt-1">
                {{ row.campaign }}
              </dd>
            </div><div>
              <dt class="text-muted">
                Status
              </dt><dd class="mt-1">
                {{ row.status }}
              </dd>
            </div><div>
              <dt class="text-muted">
                Phone
              </dt><dd class="mt-1">
                {{ row.phone }}
              </dd>
            </div><div>
              <dt class="text-muted">
                Location
              </dt><dd class="mt-1">
                {{ row.location }}
              </dd>
            </div>
          </dl>
        </UCard>
      </div><div v-if="!data?.rows?.length" class="mt-6 rounded-xl border border-dashed border-default p-12 text-center">
        <UIcon name="i-lucide-users-round" class="mx-auto size-8 text-dimmed" /><h2 class="mt-4 font-medium">
          No leads match these filters
        </h2><p class="mt-2 text-sm text-muted">
          Clear one or more filters to widen the result.
        </p>
      </div><div class="mt-5 flex items-center justify-between">
        <p class="text-xs text-muted">
          {{ data?.total?.toLocaleString() }} leads · Page {{ page }} of {{ totalPages }}
        </p><div class="flex gap-2">
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="outline"
            :disabled="page <= 1"
            @click="page--"
          >
            Previous
          </UButton><UButton
            trailing-icon="i-lucide-chevron-right"
            color="neutral"
            variant="outline"
            :disabled="page >= totalPages"
            @click="page++"
          >
            Next
          </UButton>
        </div>
      </div>
    </template>
  </div>
</template>
