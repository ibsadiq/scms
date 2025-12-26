<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="bg-white dark:bg-neutral-800 p-6 rounded-lg">
        <h1 class="text-3xl font-bold mb-4">Mobile Responsiveness Test</h1>
        <p class="text-neutral-600 dark:text-neutral-400">
          Resize your browser or use device mode in dev tools to see responsive changes.
        </p>
      </div>

      <!-- Responsive Grid Demo -->
      <div class="bg-white dark:bg-neutral-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Responsive Grid (2 cols mobile → 5 cols desktop)</h2>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          <div v-for="i in 5" :key="i" class="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold text-primary-700 dark:text-primary-400">{{ i }}</p>
            <p class="text-xs mt-2 text-neutral-600 dark:text-neutral-400">Card {{ i }}</p>
          </div>
        </div>
      </div>

      <!-- Responsive Padding Demo -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg">
        <div class="p-3 sm:p-4 md:p-6 border-2 border-blue-500">
          <h2 class="text-xl font-bold mb-2">Responsive Padding</h2>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            This box has <code class="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">p-3</code> on mobile,
            <code class="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">p-4</code> on tablets,
            <code class="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">p-6</code> on desktop
          </p>
        </div>
      </div>

      <!-- Responsive Typography -->
      <div class="bg-white dark:bg-neutral-800 p-6 rounded-lg">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Responsive Typography</h2>
        <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-4">
          This text scales from 14px (mobile) → 16px (tablet) → 18px (desktop)
        </p>
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div class="text-xs sm:text-sm md:text-base">xs → sm → base</div>
          <div class="text-base sm:text-lg md:text-xl">base → lg → xl</div>
          <div class="text-xl sm:text-2xl md:text-3xl">xl → 2xl → 3xl</div>
        </div>
      </div>

      <!-- Flex Direction Change -->
      <div class="bg-white dark:bg-neutral-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Flex Direction (Stack mobile → Horizontal desktop)</h2>
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 bg-green-100 dark:bg-green-900/20 p-4 rounded">
            <p class="font-bold">Box 1</p>
            <p class="text-sm">Stacks vertically on mobile</p>
          </div>
          <div class="flex-1 bg-blue-100 dark:bg-blue-900/20 p-4 rounded">
            <p class="font-bold">Box 2</p>
            <p class="text-sm">Horizontal on desktop</p>
          </div>
          <div class="flex-1 bg-purple-100 dark:bg-purple-900/20 p-4 rounded">
            <p class="font-bold">Box 3</p>
            <p class="text-sm">Responsive layout</p>
          </div>
        </div>
      </div>

      <!-- Current Breakpoint Indicator -->
      <div class="bg-white dark:bg-neutral-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Current Breakpoint</h2>
        <div class="space-y-2">
          <div class="block sm:hidden p-4 bg-red-100 dark:bg-red-900/20 rounded">
            📱 Mobile (< 640px)
          </div>
          <div class="hidden sm:block md:hidden p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded">
            📱 Small Tablet (640px - 768px)
          </div>
          <div class="hidden md:block lg:hidden p-4 bg-blue-100 dark:bg-blue-900/20 rounded">
            💻 Tablet (768px - 1024px)
          </div>
          <div class="hidden lg:block p-4 bg-green-100 dark:bg-green-900/20 rounded">
            🖥️ Desktop (> 1024px)
          </div>
        </div>
      </div>

      <!-- AdminStatsCard Demo -->
      <div class="bg-white dark:bg-neutral-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">AdminStatsCard Component</h2>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          <AdminStatsCard
            title="Total Students"
            :value="1234"
            icon="lucide:users"
            description="Active students"
            bg-color="bg-blue-50 dark:bg-blue-900/20"
            icon-color="text-blue-700 dark:text-blue-400"
          />
          <AdminStatsCard
            title="Total Teachers"
            :value="56"
            icon="lucide:user-check"
            description="Active teachers"
            bg-color="bg-green-50 dark:bg-green-900/20"
            icon-color="text-green-700 dark:text-green-400"
          />
          <AdminStatsCard
            title="Subjects"
            :value="24"
            icon="lucide:book-open"
            description="Registered"
            bg-color="bg-purple-50 dark:bg-purple-900/20"
            icon-color="text-purple-700 dark:text-purple-400"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminStatsCard from '@/components/AdminStatsCard.vue'

definePageMeta({
  layout: false
})
</script>
