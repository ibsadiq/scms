<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: []
})

const cfg = useRuntimeConfig()
useHead({
  title: `Sign In · ${cfg.public?.productName || 'ScholAfric'}`
})
</script>

<template>
  <AuthUnifiedLogin register-url="/student/register" />
</template>
