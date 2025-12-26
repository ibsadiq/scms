<template>
  <ClientOnly>
    <Toaster
      position="top-right"
      :offset="16"
      :toastOptions="{
        classNames: {
          toast: 'toast-custom',
          title: 'toast-title',
          description: 'toast-description',
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
        }
      }"
      richColors
    />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ClientOnly>

</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>
