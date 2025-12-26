<template>
  <aside class="w-64 bg-[#0A1929] border-r border-neutral-700/50 flex flex-col h-screen shadow-lg lg:shadow-none">
    <!-- Mobile Close Button -->
    <div class="lg:hidden flex justify-end p-4">
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Icon name="lucide:x" class="w-6 h-6 text-neutral-300" />
      </button>
    </div>

    <!-- Logo -->
    <div class="px-3 py-6 border-b border-neutral-200 dark:border-neutral-700">
      <NuxtLink
        to="/parent"
        class="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer"
      >
        <!-- App/Product Logo -->
        <div class="h-20 w-44 mb-3 mx-auto">
          <img :src="appLogo()" :alt="product()" class="h-full w-full object-contain" />
        </div>

        <!-- Parent Portal Label -->
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Parent Portal</p>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4">
      <div class="space-y-1">
        <NuxtLink
          to="/parent"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
          exact
        >
          <Icon name="lucide:layout-dashboard" class="w-5 h-5" />
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/parent/children"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
        >
          <Icon name="lucide:users" class="w-5 h-5" />
          <span>My Children</span>
        </NuxtLink>

        <NuxtLink
          to="/parent/grades"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
        >
          <Icon name="lucide:award" class="w-5 h-5" />
          <span>Academic Progress</span>
        </NuxtLink>

        <NuxtLink
          to="/parent/attendance"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
        >
          <Icon name="lucide:clipboard-check" class="w-5 h-5" />
          <span>Attendance</span>
        </NuxtLink>

        <NuxtLink
          to="/parent/fees"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
        >
          <Icon name="lucide:wallet" class="w-5 h-5" />
          <span>Fees & Payments</span>
        </NuxtLink>

        <NuxtLink
          to="/parent/messages"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
        >
          <Icon name="lucide:messages-square" class="w-5 h-5" />
          <span>Messages</span>
        </NuxtLink>

        <NuxtLink
          to="/parent/settings"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-neutral-300 hover:bg-white/10 hover:text-white border border-transparent"
          active-class="bg-[#3B82F6]/20 text-[#93C5FD] border-[#3B82F6]/30"
        >
          <Icon name="lucide:settings" class="w-5 h-5" />
          <span>Settings</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Parent Info Footer -->
    <div class="p-4 border-t border-neutral-700/50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
          <Icon name="lucide:user" class="w-5 h-5 text-[#93C5FD]" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-neutral-100 truncate">
            {{ parentName }}
          </p>
          <p class="text-xs text-neutral-400 truncate">
            Parent
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'
import { useBrand } from '~~/composables/useBrand'

defineEmits<{
  close: []
}>()

const { user } = useAuth()
const { product, appLogo } = useBrand()

// Compute parent full name
const parentName = computed(() => {
  if (!user.value) return 'Parent'

  const parts = [
    user.value.first_name,
    user.value.middle_name,
    user.value.last_name
  ].filter(Boolean)

  return parts.join(' ') || 'Parent'
})
</script>
