<!-- components/admin/SidebarLink.vue -->
<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
    active-class="bg-[#3B82F6]/20 text-[#93C5FD] border border-[#3B82F6]/30"
    exact-active-class="bg-[#3B82F6]/20 text-[#93C5FD] border border-[#3B82F6]/30"
  >
    <Icon :name="icon" class="w-5 h-5" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  to: string
  icon: string
  label: string
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  return route.path === props.to || route.path.startsWith(props.to + '/')
})
</script>