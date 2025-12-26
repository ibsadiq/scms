<!-- pages/admin/finance/payments.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Payments</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">View and manage all student payments</p>
      </div>
      <Button @click="showCollectDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Collect Payment
      </Button>
    </div>

    <!-- Collect Payment Dialog -->
    <CollectPaymentDialog
      v-model:open="showCollectDialog"
      @success="handlePaymentSuccess"
    />

    <!-- Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label for="search">Search</Label>
            <Input
              id="search"
              v-model="filters.search"
              placeholder="Receipt #, student name..."
            />
          </div>

          <div class="space-y-2">
            <Label for="term_filter">Term</Label>
            <Select v-model="filters.term">
              <SelectTrigger>
                <SelectValue placeholder="All terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All terms</SelectItem>
                <SelectItem v-for="term in terms" :key="term.id" :value="term.id.toString()">
                  {{ term.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="status_filter">Status</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="method_filter">Payment Method</Label>
            <Select v-model="filters.method">
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Receipts Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Receipts</CardTitle>
            <CardDescription>{{ totalCount }} receipt(s) found</CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="exportToExcel">
            <Icon name="lucide:download" class="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 mx-auto text-neutral-400 animate-spin mb-2" />
          <p class="text-neutral-600 dark:text-neutral-400">Loading receipts...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!receipts || receipts.length === 0" class="text-center py-12">
          <Icon name="lucide:receipt" class="w-16 h-16 mx-auto text-neutral-400 mb-4" />
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No receipts found</h3>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            {{ filters.search || filters.term !== 'all' || filters.status !== 'all' || filters.method !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first payment receipt' }}
          </p>
          <Button @click="showCollectDialog = true">
            <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
            Collect Payment
          </Button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-neutral-200 dark:border-neutral-700">
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Receipt #</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Date</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Student / Payer</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Term</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Method</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Amount</th>
                <th class="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="receipt in receipts"
                :key="receipt.id"
                class="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <td class="py-3 px-4">
                  <span class="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    #{{ receipt.receipt_number }}
                  </span>
                </td>
                <td class="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                  {{ formatDate(receipt.date) }}
                </td>
                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">
                      {{ receipt.student_name || receipt.payer }}
                    </p>
                    <p v-if="receipt.student_name && receipt.payer !== receipt.student_name" class="text-sm text-neutral-500 dark:text-neutral-400">
                      Paid by: {{ receipt.payer }}
                    </p>
                  </div>
                </td>
                <td class="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                  {{ receipt.term_name || 'N/A' }}
                </td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-1 text-sm">
                    <Icon :name="getPaymentMethodIcon(receipt.paid_through)" class="w-4 h-4" />
                    {{ receipt.paid_through }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <p class="font-semibold text-green-700 dark:text-green-400">
                    ₦{{ formatCurrency(receipt.amount) }}
                  </p>
                  <p v-if="receipt.unallocated_amount && receipt.unallocated_amount > 0" class="text-xs text-neutral-500 dark:text-neutral-400">
                    ₦{{ formatCurrency(receipt.unallocated_amount) }} unallocated
                  </p>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                    :class="getStatusClass(receipt.status)"
                  >
                    {{ receipt.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewReceipt(receipt)"
                      title="View details"
                    >
                      <Icon name="lucide:eye" class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="printReceipt(receipt)"
                      title="Print receipt"
                    >
                      <Icon name="lucide:printer" class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="editReceipt(receipt)"
                      title="Edit receipt"
                      v-if="receipt.status !== 'Cancelled'"
                    >
                      <Icon name="lucide:edit" class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, totalCount) }} of {{ totalCount }} receipts
          </p>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="currentPage--"
              :disabled="currentPage === 1"
            >
              <Icon name="lucide:chevron-left" class="w-4 h-4" />
              Previous
            </Button>

            <!-- Page numbers -->
            <template v-for="page in getPageNumbers()" :key="page">
              <span v-if="page === '...'" class="px-3 py-2 text-neutral-400">...</span>
              <Button
                v-else
                variant="outline"
                size="sm"
                @click="typeof page === 'number' && (currentPage = page)"
                :class="{ 'bg-primary text-primary-foreground': currentPage === page }"
              >
                {{ page }}
              </Button>
            </template>

            <Button
              variant="outline"
              size="sm"
              @click="currentPage++"
              :disabled="currentPage === totalPages"
            >
              Next
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CollectPaymentDialog from '@/components/finance/CollectPaymentDialog.vue'
import { useReceipts, type ReceiptFilters } from '~~/composables/admin/useReceipts'
import { useTerms } from '~~/composables/admin/useTerms'
import type { Receipt } from '~~/composables/admin/useReceipts'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
})

const { fetchReceipts } = useReceipts()
const { fetchTerms } = useTerms()

// Data
const receipts = ref<Receipt[]>([])
const terms = ref<any[]>([])
const loading = ref(false)
const showCollectDialog = ref(false)

// Filters
const filters = ref({
  search: '',
  term: 'all',
  status: 'all',
  method: 'all',
})

// Pagination
const currentPage = ref(1)
const perPage = ref(10)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage.value))

// Debounce search
const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

watch(() => filters.value.search, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Only search if 3 or more characters, or empty (to clear search)
    if (newValue.length === 0 || newValue.length >= 3) {
      debouncedSearch.value = newValue
      currentPage.value = 1 // Reset to first page on search
    }
  }, 300)
})

// Watch term filter
watch(() => filters.value.term, () => {
  currentPage.value = 1
})

// Watch status filter
watch(() => filters.value.status, () => {
  currentPage.value = 1
})

// Watch method filter
watch(() => filters.value.method, () => {
  currentPage.value = 1
})

// Watch for changes that should trigger reload
watch([debouncedSearch, () => filters.value.term, () => filters.value.status, () => filters.value.method, currentPage], () => {
  loadReceipts()
})

// Handle payment success
const handlePaymentSuccess = async () => {
  await loadReceipts()
}

// Load data on mount
onMounted(async () => {
  await loadReceipts()
  await loadTerms()
})

// Load receipts
const loadReceipts = async () => {
  loading.value = true

  // Build filters for API
  const apiFilters: ReceiptFilters = {
    page: currentPage.value,
    page_size: perPage.value
  }

  if (debouncedSearch.value) {
    apiFilters.search = debouncedSearch.value
  }

  if (filters.value.term && filters.value.term !== 'all') {
    apiFilters.term = parseInt(filters.value.term)
  }

  if (filters.value.status && filters.value.status !== 'all') {
    apiFilters.status = filters.value.status
  }

  if (filters.value.method && filters.value.method !== 'all') {
    apiFilters.paid_through = filters.value.method
  }

  const response = await fetchReceipts(apiFilters)
  loading.value = false

  if (response.data) {
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      receipts.value = response.data
      totalCount.value = response.data.length
    } else if (response.data.results) {
      receipts.value = response.data.results
      totalCount.value = response.data.count || response.data.results.length
    } else {
      receipts.value = []
      totalCount.value = 0
    }
  } else if (response.error) {
    toast.error('Failed to load receipts: ' + response.error)
    receipts.value = []
    totalCount.value = 0
  } else {
    receipts.value = []
    totalCount.value = 0
  }
}

// Load terms
const loadTerms = async () => {
  const response = await fetchTerms()
  if (response.data) {
    terms.value = response.data
  }
}

// Helper function to generate page numbers for pagination
const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxPagesToShow = 5

  if (totalPages.value <= maxPagesToShow) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate range around current page
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
}

// View receipt
const viewReceipt = (receipt: Receipt) => {
  navigateTo(`/admin/finance/receipts/${receipt.id}`)
}

// Edit receipt
const editReceipt = (receipt: Receipt) => {
  navigateTo(`/admin/finance/receipts/${receipt.id}/edit`)
}

// Print receipt
const printReceipt = (receipt: Receipt) => {
  navigateTo(`/admin/finance/receipts/${receipt.id}`)
}

// Export to Excel
const exportToExcel = () => {
  // TODO: Implement export functionality
  toast.info('Export functionality coming soon!')
}

// Format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Get payment method icon
const getPaymentMethodIcon = (method: string) => {
  const icons: Record<string, string> = {
    'Cash': 'lucide:banknote',
    'Bank Transfer': 'lucide:building-2',
    'Cheque': 'lucide:file-text',
    'Mobile Money': 'lucide:smartphone',
    'Card': 'lucide:credit-card',
  }
  return icons[method] || 'lucide:circle'
}

// Get status class
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return classes[status] || classes['Pending']
}
</script>
