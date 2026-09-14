<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{ collapsed?: boolean }>()
const session = useState<any>('session')
const colorMode = useColorMode()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  session.value = null
  await navigateTo('/login')
}

const items = computed<DropdownMenuItem[][]>(() => [[{ type: 'label', label: session.value?.user?.name || 'KOG Client' }], [{ label: colorMode.value === 'dark' ? 'Use light mode' : 'Use dark mode', icon: colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon', onSelect: () => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' } }], [{ label: 'Log out', icon: 'i-lucide-log-out', onSelect: logout }]])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }" :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton
      :label="collapsed ? undefined : (session?.user?.name || 'KOG Client')"
      icon="i-lucide-circle-user-round"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="text-white hover:bg-white/10"
    />
  </UDropdownMenu>
</template>
