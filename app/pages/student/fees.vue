<!-- pages/student/fees.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Fees & Payments</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View your fee balance and payment history
        </p>
      </div>
      <Button variant="outline" size="sm" @click="loadData">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && feeBalances.length === 0" class="flex items-center justify-center py-12">
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="lucide:receipt" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Fees</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ formatCurrency(totalFees) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon name="lucide:check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Amount Paid</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ formatCurrency(totalPaid) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Icon name="lucide:alert-circle" class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Balance</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ formatCurrency(totalBalance) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icon name="lucide:trending-up" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Paid</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ paymentPercentage.toFixed(1) }}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Payment Progress -->
      <Card v-if="currentBalance">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Current Term Fee Status</CardTitle>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {{ currentBalance.term_name }} - {{ currentBalance.academic_year }}
              </p>
            </div>
            <Badge
              :variant="currentBalance.status === 'paid' ? 'default' : currentBalance.status === 'partial' ? 'outline' : 'destructive'"
            >
              {{ currentBalance.status.toUpperCase() }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600 dark:text-neutral-400">Progress</span>
              <span class="font-semibold">
                {{ formatCurrency(currentBalance.amount_paid) }} / {{ formatCurrency(currentBalance.total_fee) }}
              </span>
            </div>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all"
                :class="currentBalance.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'"
                :style="{ width: `${(currentBalance.amount_paid / currentBalance.total_fee * 100)}%` }"
              ></div>
            </div>
          </div>

          <Separator />

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-neutral-500 dark:text-neutral-400">Total Fee</p>
              <p class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ formatCurrency(currentBalance.total_fee) }}
              </p>
            </div>
            <div>
              <p class="text-neutral-500 dark:text-neutral-400">Amount Paid</p>
              <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                {{ formatCurrency(currentBalance.amount_paid) }}
              </p>
            </div>
            <div>
              <p class="text-neutral-500 dark:text-neutral-400">Balance</p>
              <p class="text-lg font-semibold text-red-600 dark:text-red-400">
                {{ formatCurrency(currentBalance.balance) }}
              </p>
            </div>
            <div v-if="currentBalance.discount">
              <p class="text-neutral-500 dark:text-neutral-400">Discount</p>
              <p class="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {{ formatCurrency(currentBalance.discount) }}
              </p>
            </div>
          </div>

          <div v-if="currentBalance.last_payment_date" class="text-sm text-neutral-500 dark:text-neutral-400">
            Last payment: {{ formatDate(currentBalance.last_payment_date) }}
          </div>
        </CardContent>
      </Card>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="balance">Term Balances</TabsTrigger>
        </TabsList>

        <!-- Payment History Tab -->
        <TabsContent value="history" class="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="payments.length > 0" class="space-y-3">
                <div
                  v-for="payment in payments"
                  :key="payment.id"
                  class="flex items-center justify-between p-4 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Icon name="lucide:banknote" class="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p class="font-semibold text-neutral-900 dark:text-neutral-100">
                        {{ formatCurrency(payment.amount) }}
                      </p>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400">
                        {{ payment.term_name }} • {{ formatDate(payment.payment_date) }}
                      </p>
                      <p class="text-xs text-neutral-400 mt-1">
                        Receipt: {{ payment.receipt_number }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <Badge variant="outline">
                      {{ formatPaymentMethod(payment.payment_method) }}
                    </Badge>
                    <p v-if="payment.reference_number" class="text-xs text-neutral-500 mt-1">
                      Ref: {{ payment.reference_number }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <Icon name="lucide:inbox" size="64" class="mx-auto mb-4 opacity-20" />
                <p>No payment history available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Receipts Tab -->
        <TabsContent value="receipts" class="mt-6">
          <div v-if="receipts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              v-for="receipt in receipts"
              :key="receipt.id"
              class="hover:shadow-md transition-shadow"
            >
              <CardContent class="pt-6">
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon name="lucide:file-text" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">
                        {{ receipt.receipt_number }}
                      </h3>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400">
                        {{ receipt.term_name }}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-neutral-500 dark:text-neutral-400">Amount</span>
                      <span class="font-semibold">{{ formatCurrency(receipt.amount) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-neutral-500 dark:text-neutral-400">Date</span>
                      <span>{{ formatDate(receipt.payment_date) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-neutral-500 dark:text-neutral-400">Method</span>
                      <span>{{ formatPaymentMethod(receipt.payment_method) }}</span>
                    </div>
                  </div>

                  <Button
                    v-if="receipt.can_download"
                    variant="outline"
                    size="sm"
                    class="w-full"
                    @click="handleDownloadReceipt(receipt.id)"
                  >
                    <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:file-text" size="64" class="mx-auto mb-4 opacity-20" />
            <p>No receipts available</p>
          </div>
        </TabsContent>

        <!-- Term Balances Tab -->
        <TabsContent value="balance" class="mt-6">
          <div v-if="feeBalances.length > 0" class="space-y-4">
            <Card v-for="balance in feeBalances" :key="balance.id">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div>
                    <CardTitle>{{ balance.term_name }}</CardTitle>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ balance.academic_year }}</p>
                  </div>
                  <Badge
                    :variant="balance.status === 'paid' ? 'default' : balance.status === 'partial' ? 'outline' : 'destructive'"
                  >
                    {{ balance.status.toUpperCase() }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Fee</p>
                    <p class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {{ formatCurrency(balance.total_fee) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">Paid</p>
                    <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                      {{ formatCurrency(balance.amount_paid) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">Balance</p>
                    <p class="text-lg font-semibold text-red-600 dark:text-red-400">
                      {{ formatCurrency(balance.balance) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">Progress</p>
                    <p class="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {{ ((balance.amount_paid / balance.total_fee) * 100).toFixed(1) }}%
                    </p>
                  </div>
                </div>

                <div class="mt-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="balance.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'"
                    :style="{ width: `${(balance.amount_paid / balance.total_fee * 100)}%` }"
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:inbox" size="64" class="mx-auto mb-4 opacity-20" />
            <p>No fee balance records available</p>
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
import { useStudentFees } from '~~/composables/student/useFees'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

const {
  feeBalances,
  payments,
  receipts,
  currentBalance,
  loading,
  error,
  totalBalance,
  totalPaid,
  totalFees,
  paymentPercentage,
  fetchFeeBalance,
  fetchPayments,
  fetchReceipts,
  downloadReceipt
} = useStudentFees()

const activeTab = ref('history')

const loadData = async () => {
  await Promise.all([
    fetchFeeBalance(),
    fetchPayments(),
    fetchReceipts()
  ])
}

const handleDownloadReceipt = async (receiptId: number) => {
  const result = await downloadReceipt(receiptId)
  if (result.success) {
    toast.success('Success', result.message)
  } else {
    toast.error('Error', result.error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatPaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    pos: 'POS',
    online: 'Online'
  }
  return methods[method] || method
}

onMounted(() => {
  loadData()
})

useHead({
  title: 'Fees & Payments'
})
</script>
