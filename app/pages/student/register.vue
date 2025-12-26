<!-- pages/student/register.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: []
})

useHead({
  title: 'Register - School Management System'
})
</script>

<template>
  <AuthStudentRegister login-url="/login" />
</template>
