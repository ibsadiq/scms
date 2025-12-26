<!-- pages/student/settings.vue -->
<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        Manage your account preferences
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Password</h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Change your password from the profile menu in the navbar
          </p>
          <Button variant="outline" size="sm" disabled>
            Managed in Profile Menu
          </Button>
        </div>

        <Separator />

        <div>
          <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Theme</h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Use the theme toggle in the navbar to switch between light and dark mode
          </p>
        </div>

        <Separator />

        <div>
          <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Notifications</h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Notification preferences will be available soon
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

useHead({
  title: 'Settings'
})
</script>
