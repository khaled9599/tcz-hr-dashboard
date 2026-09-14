<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const route = useRoute()
const links = [{ label: 'Overview', icon: 'i-lucide-layout-dashboard', to: '/' }, { label: 'Media Performance', icon: 'i-lucide-chart-no-axes-combined', to: '/media-performance' }, { label: 'Campaigns', icon: 'i-lucide-megaphone', to: '/campaigns' }, { label: 'Leads', icon: 'i-lucide-users-round', to: '/leads' }, { label: 'Lead Analysis', icon: 'i-lucide-scan-search', to: '/lead-analysis' }, { label: 'Reports', icon: 'i-lucide-file-chart-column', to: '/reports' }, { label: 'Data Sources', icon: 'i-lucide-database-zap', to: '/data-sources' }].map(item => ({ ...item, onSelect: () => { open.value = false } })) satisfies NavigationMenuItem[]

const pageTitle = computed(() => links.find(link => link.to === route.path)?.label || (route.path.startsWith('/campaigns/') ? 'Campaign Detail' : 'KOG Performance'))
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="primary"
      v-model:open="open"
      collapsible
      resizable
      class="tcz-sidebar border-r border-white/10 bg-black"
      :ui="{ footer: 'lg:border-t lg:border-white/10' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="flex min-h-12 items-center gap-3 overflow-hidden" aria-label="KOG dashboard overview">
          <img
            src="/tcz/tcz-logo-white.svg"
            alt="The Creative Zone"
            :class="collapsed ? 'w-7' : 'w-36'"
            class="h-auto shrink-0 object-contain object-left transition-all"
          >
        </NuxtLink>
      </template>
      <template #default="{ collapsed }">
        <div v-if="!collapsed" class="px-2 pb-2 pt-3">
          <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
            Client workspace
          </p>
          <p class="mt-1 text-sm font-medium text-white">
            KOG
          </p>
        </div>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
          class="tcz-nav"
        />
        <div v-if="!collapsed" class="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/50">
          <span class="block text-white/80">Data protected</span>
          Lead and campaign records remain inside the authenticated workspace.
        </div>
      </template>
      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="workspace">
      <template #header>
        <UDashboardNavbar :title="pageTitle">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template><template #right>
            <GlobalSyncIndicator />
          </template>
        </UDashboardNavbar>
      </template>
      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<style scoped>
:deep(.tcz-sidebar a), :deep(.tcz-sidebar button) { color: rgb(255 255 255 / .64); }
:deep(.tcz-sidebar a:hover), :deep(.tcz-sidebar button:hover) { color: white; background: rgb(255 255 255 / .07); }
:deep(.tcz-sidebar a[aria-current="page"]) { color: white; background: rgb(240 82 35 / .18); box-shadow: inset 2px 0 0 #f05223; }
</style>
