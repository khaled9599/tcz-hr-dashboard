<script setup lang="ts">
const { data, refresh } = await useFetch<any>('/api/data-sources')
const toast = useToast()
const syncing = ref(false)
const previewing = ref(false)
const importing = ref(false)
const selectedFile = ref<File | null>(null)
const preview = ref<any>(null)
const importResult = ref<any>(null)
const importKind = ref<'leads' | 'media'>('leads')
const document = import.meta.client ? window.document : ({ getElementById: () => null } as unknown as Document)

async function syncNow() {
  syncing.value = true
  try { const result = await $fetch<any>('/api/sync/google-sheet', { method: 'POST' }); toast.add({ title: 'Lead sync completed', description: `${result.created} new, ${result.updated} updated, ${result.duplicates} unchanged.` }); await refresh() } catch (error: any) { toast.add({ title: 'Lead sync failed', description: error?.data?.statusMessage || 'Existing data was preserved. Try again later.', color: 'error' }) } finally { syncing.value = false }
}
function chooseFile(event: Event) { selectedFile.value = (event.target as HTMLInputElement).files?.[0] || null; preview.value = null; importResult.value = null }
async function previewFile() {
  if (!selectedFile.value) return
  previewing.value = true
  const body = new FormData(); body.append('file', selectedFile.value)
  try { preview.value = await $fetch('/api/import/preview', { method: 'POST', body }) } catch (error: any) { toast.add({ title: 'File could not be previewed', description: error?.data?.statusMessage || 'Check the file and try again.', color: 'error' }) } finally { previewing.value = false }
}
async function importRows() {
  if (!preview.value) return
  importing.value = true
  try { importResult.value = await $fetch(`/api/import/${importKind.value}`, { method: 'POST', body: { fileName: preview.value.fileName, rows: preview.value.rows } }); toast.add({ title: 'Import completed', description: 'Every row was classified and recorded in the result.' }) } catch (error: any) { toast.add({ title: 'Import failed', description: error?.data?.statusMessage || 'No data was discarded or overwritten.', color: 'error' }) } finally { importing.value = false }
}
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <DashboardPageHeader title="Data Sources" description="Monitor lead synchronization, upload fallback data, and review a complete history of source activity." :show-date="false" /><div class="mt-8 grid gap-6 lg:grid-cols-2">
      <UCard class="tcz-panel">
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div class="flex gap-3">
              <div class="rounded-xl bg-emerald-500/10 p-3">
                <UIcon name="i-lucide-sheet" class="size-6 text-emerald-600" />
              </div><div>
                <p class="text-xs uppercase tracking-[.12em] text-muted">
                  Leads
                </p><h2 class="mt-1 text-xl font-medium">
                  Google Sheet
                </h2>
              </div>
            </div><UBadge :color="data?.leads?.status === 'Connected' ? 'success' : 'error'" variant="subtle">
              {{ data?.leads?.status }}
            </UBadge>
          </div>
        </template><dl class="grid grid-cols-2 gap-5 text-sm">
          <div>
            <dt class="text-xs text-muted">
              Last sync
            </dt><dd class="mt-1 font-medium">
              {{ data?.leads?.lastSyncAt ? new Date(data.leads.lastSyncAt).toLocaleString('en-EG') : 'Never' }}
            </dd>
          </div><div>
            <dt class="text-xs text-muted">
              Next scheduled sync
            </dt><dd class="mt-1 font-medium">
              {{ data?.leads?.nextSyncAt ? new Date(data.leads.nextSyncAt).toLocaleTimeString('en-EG', { hour: 'numeric', minute: '2-digit' }) : 'Not scheduled' }}
            </dd>
          </div><div>
            <dt class="text-xs text-muted">
              Rows synchronized
            </dt><dd class="metric-number mt-1 text-2xl font-medium">
              {{ data?.leads?.rowsSynced?.toLocaleString() }}
            </dd>
          </div><div>
            <dt class="text-xs text-muted">
              Schedule
            </dt><dd class="mt-1 font-medium">
              Every 30 minutes
            </dd>
          </div>
        </dl><template #footer>
          <div class="flex gap-2">
            <UButton :loading="syncing" icon="i-lucide-refresh-cw" @click="syncNow">
              Sync Now
            </UButton><UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-history"
              @click="document.getElementById('sync-history')?.scrollIntoView({ behavior: 'smooth' })"
            >
              View Sync History
            </UButton>
          </div>
        </template>
      </UCard><UCard class="tcz-panel">
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div class="flex gap-3">
              <div class="rounded-xl bg-primary/10 p-3">
                <UIcon name="i-lucide-upload-cloud" class="size-6 text-primary" />
              </div><div>
                <p class="text-xs uppercase tracking-[.12em] text-muted">
                  Media
                </p><h2 class="mt-1 text-xl font-medium">
                  Manual Upload
                </h2>
              </div>
            </div><UBadge color="neutral" variant="subtle">
              {{ data?.media?.status }}
            </UBadge>
          </div>
        </template><dl class="space-y-4 text-sm">
          <div>
            <dt class="text-xs text-muted">
              Latest import
            </dt><dd class="mt-1 font-medium">
              {{ data?.media?.fileName || 'No import yet' }}
            </dd>
          </div><div class="flex gap-8">
            <div>
              <dt class="text-xs text-muted">
                Imported
              </dt><dd class="mt-1">
                {{ data?.media?.lastImportAt ? new Date(data.media.lastImportAt).toLocaleString('en-EG') : 'Never' }}
              </dd>
            </div><div>
              <dt class="text-xs text-muted">
                Rows
              </dt><dd class="metric-number mt-1">
                {{ data?.media?.rowsImported || 0 }}
              </dd>
            </div>
          </div>
        </dl><template #footer>
          <p class="text-xs text-muted">
            Meta, Google Ads, and TikTok export schemas can be mapped into the normalized performance model.
          </p>
        </template>
      </UCard>
    </div>
    <UCard class="tcz-panel mt-6">
      <template #header>
        <h2 class="text-lg font-medium">
          Manual import fallback
        </h2><p class="mt-1 text-xs text-muted">
          CSV or XLSX · 10 MB maximum · Preview and validation required before import
        </p>
      </template>
      <div class="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
        <USelect
          v-model="importKind"
          :items="[{ label: 'Lead data', value: 'leads' }, { label: 'Media performance', value: 'media' }]"
          value-key="value"
        />
        <UInput type="file" accept=".csv,.xlsx" @change="chooseFile" /><UButton
          :disabled="!selectedFile"
          :loading="previewing"
          color="neutral"
          variant="outline"
          icon="i-lucide-scan-search"
          @click="previewFile"
        >
          Detect and Preview
        </UButton>
      </div><div v-if="preview" class="mt-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-medium">
              {{ preview.fileName }}
            </p><p class="mt-1 text-xs text-muted">
              {{ preview.rowCount.toLocaleString() }} rows · {{ preview.headers.length }} detected columns
            </p>
          </div><UButton :loading="importing" icon="i-lucide-database-backup" @click="importRows">
            Validate and Import
          </UButton>
        </div><div class="mt-4 overflow-x-auto rounded-lg border border-default">
          <table class="min-w-full text-xs">
            <thead>
              <tr class="bg-elevated">
                <th v-for="header in preview.headers" :key="header" class="whitespace-nowrap px-3 py-2 text-left">
                  {{ header }}
                </th>
              </tr>
            </thead><tbody>
              <tr v-for="(row, index) in preview.preview.slice(0, 5)" :key="index" class="border-t border-default">
                <td v-for="header in preview.headers" :key="header" class="max-w-52 truncate px-3 py-2">
                  {{ row[header] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div><UAlert
        v-if="importResult"
        class="mt-5"
        color="success"
        variant="subtle"
        title="Import classified successfully"
        :description="`Imported ${importResult.imported}, updated ${importResult.updated}, duplicates ${importResult.duplicates}, invalid ${importResult.invalid}, skipped ${importResult.skipped}.`"
      />
    </UCard>
    <UCard id="sync-history" class="tcz-panel mt-6">
      <template #header>
        <h2 class="text-lg font-medium">
          Sync History
        </h2><p class="mt-1 text-xs text-muted">
          Technical errors are stored securely; client-facing messages contain no credentials.
        </p>
      </template><div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-sm">
          <thead>
            <tr class="border-b border-default text-left text-xs text-muted">
              <th class="pb-3">
                Started
              </th><th class="pb-3">
                Duration
              </th><th class="pb-3">
                Source
              </th><th class="pb-3">
                Checked
              </th><th class="pb-3">
                New
              </th><th class="pb-3">
                Updated
              </th><th class="pb-3">
                Duplicates
              </th><th class="pb-3">
                Failed
              </th><th class="pb-3">
                Status
              </th>
            </tr>
          </thead><tbody>
            <tr v-for="log in data?.syncHistory" :key="log.id" class="border-b border-default last:border-0">
              <td class="py-4">
                {{ new Date(log.startedAt).toLocaleString('en-EG') }}
              </td><td>{{ log.endedAt ? Math.round((new Date(log.endedAt).getTime()-new Date(log.startedAt).getTime())/1000)+'s' : 'Running' }}</td><td>{{ log.source }}</td><td>{{ log.rowsChecked }}</td><td>{{ log.created }}</td><td>{{ log.updated }}</td><td>{{ log.duplicates }}</td><td>{{ log.failed }}</td><td>
                <UBadge :color="log.status === 'Success' ? 'success' : log.status === 'Failed' ? 'error' : 'warning'" variant="subtle">
                  {{ log.status }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
    <UAlert
      class="mt-6"
      color="neutral"
      variant="subtle"
      icon="i-lucide-plug-zap"
      title="API-ready architecture"
      description="Google Sheets polling is a source adapter. A future Google Form webhook, Meta Lead Ads webhook, or Marketing API adapter can use the same normalized database and analytics layer."
    />
  </div>
</template>
