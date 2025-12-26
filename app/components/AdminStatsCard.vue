<template>
  <Card>
    <CardContent class="p-3 sm:p-4 md:p-6">
      <div class="flex items-center justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">{{ title }}</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 sm:mt-2">{{ value }}</p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 truncate">{{ description }}</p>
        </div>
        <div
          :class="[
            'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            bgColor || 'bg-primary-50 dark:bg-primary-900/20'
          ]"
        >
          <Icon
            :name="icon"
            :class="[
              'w-5 h-5 sm:w-6 sm:h-6',
              iconColor || 'text-primary-700 dark:text-primary-400'
            ]"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  title: string
  value: string | number
  icon: string
  description: string
  bgColor?: string
  iconColor?: string
}>()
</script>
