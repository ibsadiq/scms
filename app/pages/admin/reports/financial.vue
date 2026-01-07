<!-- pages/admin/reports/financial.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Financial Reports</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Payment collections, revenue analysis, and outstanding fees
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportReport('pdf')" :disabled="loading || exporting">
          <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" @click="exportReport('excel')" :disabled="loading || exporting">
          <Icon name="lucide:file-spreadsheet" class="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>
    </div>

    <!-- Filters Card -->
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label for="payment_method">Payment Method</Label>
            <select
              id="payment_method"
              v-model="filters.payment_method"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option :value="undefined">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="class_level">Class</Label>
            <select
              id="class_level"
              v-model="filters.class_level"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option :value="undefined">All Classes</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="date_from">Date From</Label>
            <Input
              id="date_from"
              v-model="filters.date_from"
              type="date"
            />
          </div>

          <div class="space-y-2">
            <Label for="date_to">Date To</Label>
            <Input
              id="date_to"
              v-model="filters.date_to"
              type="date"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="outline" @click="clearFilters">
            <Icon name="lucide:x" class="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button @click="generateReport">
            <Icon name="lucide:search" class="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Summary Cards -->
    <div v-if="reportData" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="border-l-4 border-l-green-500">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Collected</p>
              <p class="text-3xl font-bold text-green-700 dark:text-green-400">
                ₦{{ formatCurrency(reportData.total_collected || 0) }}
              </p>
            </div>
            <Icon name="lucide:trending-up" class="w-10 h-10 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card class="border-l-4 border-l-red-500">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Outstanding</p>
              <p class="text-3xl font-bold text-red-700 dark:text-red-400">
                ₦{{ formatCurrency(reportData.total_outstanding || 0) }}
              </p>
            </div>
            <Icon name="lucide:trending-down" class="w-10 h-10 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card class="border-l-4 border-l-primary-500">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Collection Rate</p>
              <p class="text-3xl font-bold text-primary-700 dark:text-primary-400">
                {{ reportData.collection_rate?.toFixed(1) || 0 }}%
              </p>
            </div>
            <Icon name="lucide:percent" class="w-10 h-10 text-primary-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Report Data -->
    <div v-else-if="reportData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Payment by Method -->
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in reportData.payment_by_method"
              :key="item.method"
              class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <Icon :name="getPaymentIcon(item.method)" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ item.method }}</p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ item.count }} transactions</p>
                </div>
              </div>
              <p class="text-lg font-bold text-green-700 dark:text-green-400">
                ₦{{ formatCurrency(item.amount) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Revenue by Fee Type -->
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Fee Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in reportData.revenue_by_type"
              :key="item.fee_type"
              class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Icon name="lucide:receipt" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ item.fee_type }}</p>
              </div>
              <p class="text-lg font-bold text-blue-700 dark:text-blue-400">
                ₦{{ formatCurrency(item.amount) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Defaulters Table -->
    <Card v-if="reportData && reportData.defaulters && reportData.defaulters.length > 0">
      <CardHeader>
        <CardTitle>Students with Outstanding Fees ({{ reportData.defaulters.length }})</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-neutral-200 dark:border-neutral-700">
              <tr class="text-left">
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Admission #</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Student Name</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400">Class</th>
                <th class="pb-3 font-medium text-sm text-neutral-600 dark:text-neutral-400 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in reportData.defaulters"
                :key="student.student_id"
                class="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <td class="py-3 text-sm">{{ student.admission_number }}</td>
                <td class="py-3 text-sm font-medium">{{ student.student_name }}</td>
                <td class="py-3 text-sm">{{ student.class_name }}</td>
                <td class="py-3 text-sm text-right font-bold text-red-700 dark:text-red-400">
                  ₦{{ formatCurrency(student.balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Card v-else-if="reportData && (!reportData.payment_by_method || reportData.payment_by_method.length === 0)">
      <CardContent class="py-12">
        <div class="text-center text-neutral-500 dark:text-neutral-400">
          <Icon name="lucide:inbox" class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p class="text-lg font-medium">No financial data found</p>
          <p class="text-sm mt-2">Try adjusting your filters</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useReports, type FinancialReportFilters } from '~~/composables/admin/useReports'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

const { success: showSuccess, error: showError } = useToast()
const { fetchFinancialReport, exportToPDF, exportToExcel } = useReports()

const loading = ref(false)
const exporting = ref(false)
const error = ref<string | null>(null)
const reportData = ref<any>(null)

const classes = ref([
  { id: 1, name: 'Primary 1' },
  { id: 2, name: 'Primary 2' },
  { id: 3, name: 'JSS 1' },
  { id: 4, name: 'JSS 2' },
  { id: 5, name: 'SSS 1' },
  { id: 6, name: 'SSS 2' }
])

const filters = ref<FinancialReportFilters>({
  payment_method: undefined,
  class_level: undefined,
  date_from: undefined,
  date_to: undefined
})

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getPaymentIcon = (method: string) => {
  const icons: Record<string, string> = {
    'Cash': 'lucide:banknote',
    'Bank Transfer': 'lucide:building-2',
    'Mobile Money': 'lucide:smartphone',
    'Cheque': 'lucide:file-text'
  }
  return icons[method] || 'lucide:credit-card'
}

const generateReport = async () => {
  loading.value = true
  error.value = null

  const { data, error: fetchError } = await fetchFinancialReport(filters.value)

  loading.value = false

  if (fetchError) {
    error.value = 'Failed to generate report. Please try again.'
    showError(error.value)
    return
  }

  reportData.value = data
  showSuccess('Report generated successfully')
}

const clearFilters = () => {
  filters.value = {
    payment_method: undefined,
    class_level: undefined,
    date_from: undefined,
    date_to: undefined
  }
  reportData.value = null
}

const exportReport = async (format: 'pdf' | 'excel') => {
  if (!reportData.value) {
    showError('Please generate a report first')
    return
  }

  exporting.value = true

  const result = format === 'pdf'
    ? await exportToPDF('financial', filters.value)
    : await exportToExcel('financial', filters.value)

  exporting.value = false

  if (result.success) {
    showSuccess(`Report exported to ${format.toUpperCase()} successfully`)
  } else {
    showError(result.error || 'Failed to export report')
  }
}

useHead({
  title: 'Financial Reports'
})
</script>
