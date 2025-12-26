<!-- pages/student/assignments.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Assignments</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View and submit your assignments
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="fetchAssignments()">
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && assignments.length === 0" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Assignments Content -->
    <template v-else>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Icon name="lucide:clock" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Pending</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ upcomingAssignments.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Icon name="lucide:alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Overdue</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ overdueAssignments.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="lucide:check-circle" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Submitted</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ submittedAssignments.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon name="lucide:award" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Graded</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ gradedAssignments.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({{ assignments.length }})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({{ upcomingAssignments.length }})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({{ overdueAssignments.length }})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({{ gradedAssignments.length }})</TabsTrigger>
        </TabsList>

        <!-- All Assignments -->
        <TabsContent value="all" class="mt-6">
          <AssignmentList :assignments="assignments" />
        </TabsContent>

        <!-- Pending Assignments -->
        <TabsContent value="pending" class="mt-6">
          <AssignmentList :assignments="upcomingAssignments" empty-message="No pending assignments" />
        </TabsContent>

        <!-- Overdue Assignments -->
        <TabsContent value="overdue" class="mt-6">
          <AssignmentList :assignments="overdueAssignments" empty-message="No overdue assignments" />
        </TabsContent>

        <!-- Graded Assignments -->
        <TabsContent value="graded" class="mt-6">
          <AssignmentList :assignments="gradedAssignments" empty-message="No graded assignments yet" />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStudentAssignments } from '~~/composables/student/useAssignments'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

const {
  assignments,
  loading,
  error,
  upcomingAssignments,
  overdueAssignments,
  submittedAssignments,
  gradedAssignments,
  fetchAssignments
} = useStudentAssignments()

const activeTab = ref('all')

// Fetch assignments on mount
onMounted(async () => {
  await fetchAssignments()
})

useHead({
  title: 'Assignments'
})
</script>
