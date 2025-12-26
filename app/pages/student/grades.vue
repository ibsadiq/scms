<!-- pages/student/grades.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Grades & Results</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View your academic performance and report cards
        </p>
      </div>
      <Button variant="outline" size="sm" @click="loadData">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && results.length === 0" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Content -->
    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="lucide:trending-up" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Overall Average</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ overallAverage }}%
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
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Best Subject</p>
                <p class="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {{ bestSubject?.subject_name || 'N/A' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icon name="lucide:file-text" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Report Cards</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ reportCards.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="results">Term Results</TabsTrigger>
          <TabsTrigger value="reports">Report Cards</TabsTrigger>
        </TabsList>

        <!-- Term Results Tab -->
        <TabsContent value="results" class="mt-6">
          <div v-if="results.length > 0" class="space-y-4">
            <Card v-for="result in results" :key="result.id">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div>
                    <CardTitle>{{ result.term_name }}</CardTitle>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ result.academic_year }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                      {{ result.annual_average }}%
                    </div>
                    <Badge>{{ result.grade }}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-neutral-500 dark:text-neutral-400">Position</span>
                    <span class="font-semibold">{{ result.position }} of {{ result.total_students || 'N/A' }}</span>
                  </div>

                  <Separator />

                  <!-- Subjects -->
                  <div class="space-y-2">
                    <h4 class="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Subject Breakdown</h4>
                    <div class="space-y-2">
                      <div
                        v-for="subject in result.subjects"
                        :key="subject.subject_name"
                        class="flex items-center justify-between p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <span class="text-sm text-neutral-900 dark:text-neutral-100">{{ subject.subject_name }}</span>
                        <div class="flex items-center gap-3">
                          <span class="text-sm text-neutral-500">{{ subject.total }}</span>
                          <Badge variant="outline">{{ subject.grade }}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:inbox" size="64" class="mx-auto mb-4 opacity-20" />
            <p>No results available yet</p>
          </div>
        </TabsContent>

        <!-- Report Cards Tab -->
        <TabsContent value="reports" class="mt-6">
          <div v-if="reportCards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              v-for="card in reportCards"
              :key="card.id"
              class="hover:shadow-md transition-shadow"
            >
              <CardContent class="pt-6">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon name="lucide:file-text" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {{ card.term_name }}
                    </h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ card.academic_year_name }}</p>
                    <p class="text-xs text-neutral-400 mt-1">
                      Generated: {{ formatDate(card.generated_date) }}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      class="mt-3 w-full"
                      @click="downloadReportCard(card.id)"
                    >
                      <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:file-text" size="64" class="mx-auto mb-4 opacity-20" />
            <p>No report cards available yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStudentGrades } from '~~/composables/student/useGrades'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

const {
  results,
  reportCards,
  loading,
  error,
  overallAverage,
  bestSubject,
  fetchResults,
  fetchReportCards,
  downloadReportCard
} = useStudentGrades()

const activeTab = ref('results')

const loadData = async () => {
  await Promise.all([
    fetchResults(),
    fetchReportCards()
  ])
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  loadData()
})

useHead({
  title: 'Grades & Results'
})
</script>
