<!-- pages/admin/invitations/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Invitations</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">Manage user invitations for teachers, parents, and accountants</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Invitations</CardTitle>
            <CardDescription>View and manage pending, accepted, and expired invitations</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="filterRole">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="accountant">Accountants</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="filterStatus">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-model="searchQuery"
              placeholder="Search by name or email..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading invitations...</p>
        </div>

        <div v-else-if="filteredInvitations.length === 0" class="text-center py-12">
          <Icon name="lucide:mail" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No invitations found</p>
          <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            Invitations are sent when you create new teachers, parents, or accountants
          </p>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="invitation in filteredInvitations" :key="invitation.id">
                <TableCell class="font-medium">
                  {{ invitation.first_name }} {{ invitation.last_name }}
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Icon name="lucide:mail" class="w-4 h-4 text-neutral-400" />
                    {{ invitation.email }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" class="capitalize">
                    {{ invitation.role }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="
                      invitation.status === 'accepted'
                        ? 'default'
                        : invitation.status === 'expired'
                        ? 'destructive'
                        : 'secondary'
                    "
                    class="capitalize"
                  >
                    <Icon
                      :name="
                        invitation.status === 'accepted'
                          ? 'lucide:check-circle'
                          : invitation.status === 'expired'
                          ? 'lucide:x-circle'
                          : 'lucide:clock'
                      "
                      class="w-3 h-3 mr-1"
                    />
                    {{ invitation.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ formatDate(invitation.created_at) }}
                  </div>
                  <div v-if="invitation.invited_by_name" class="text-xs text-neutral-500 dark:text-neutral-400">
                    by {{ invitation.invited_by_name }}
                  </div>
                </TableCell>
                <TableCell>
                  <div v-if="invitation.status === 'pending'" class="text-sm">
                    <div
                      :class="[
                        invitation.days_until_expiry && invitation.days_until_expiry <= 2
                          ? 'text-red-600 dark:text-red-400 font-medium'
                          : 'text-neutral-700 dark:text-neutral-300'
                      ]"
                    >
                      {{ formatDate(invitation.expires_at) }}
                    </div>
                    <div
                      v-if="invitation.days_until_expiry !== undefined"
                      :class="[
                        'text-xs',
                        invitation.days_until_expiry <= 2
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-neutral-500 dark:text-neutral-400'
                      ]"
                    >
                      {{ invitation.days_until_expiry === 0
                        ? 'Expires today'
                        : invitation.days_until_expiry === 1
                        ? 'Expires tomorrow'
                        : `${invitation.days_until_expiry} days left`
                      }}
                    </div>
                  </div>
                  <div v-else-if="invitation.status === 'accepted'" class="text-sm text-neutral-500 dark:text-neutral-400">
                    {{ invitation.accepted_at ? formatDate(invitation.accepted_at) : '-' }}
                  </div>
                  <div v-else class="text-sm text-neutral-500 dark:text-neutral-400">
                    {{ formatDate(invitation.expires_at) }}
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        v-if="invitation.status === 'pending'"
                        @click="handleCopyLink(invitation)"
                      >
                        <Icon name="lucide:copy" class="w-4 h-4 mr-2" />
                        Copy Invitation Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="invitation.status === 'pending'"
                        @click="handleResend(invitation)"
                      >
                        <Icon name="lucide:send" class="w-4 h-4 mr-2" />
                        Resend Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator v-if="invitation.status === 'pending'" />
                      <DropdownMenuItem
                        @click="handleDelete(invitation)"
                        class="text-red-600"
                      >
                        <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInvitations, type Invitation } from '~~/composables/admin/useInvitations'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const { fetchInvitations, resendInvitation, deleteInvitation } = useInvitations()

const loading = ref(true)
const invitations = ref<Invitation[]>([])
const searchQuery = ref('')
const filterRole = ref('all')
const filterStatus = ref('all')

const filteredInvitations = computed(() => {
  let filtered = invitations.value

  // Filter by role
  if (filterRole.value !== 'all') {
    filtered = filtered.filter(inv => inv.role === filterRole.value)
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(inv => inv.status === filterStatus.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(inv =>
      inv.first_name.toLowerCase().includes(query) ||
      inv.last_name.toLowerCase().includes(query) ||
      inv.email.toLowerCase().includes(query)
    )
  }

  return filtered
})

const loadInvitations = async () => {
  loading.value = true
  const { data } = await fetchInvitations()
  if (data) {
    invitations.value = data
  }
  loading.value = false
}

const handleResend = async (invitation: Invitation) => {
  if (!confirm(`Resend invitation to ${invitation.email}?`)) return

  const { error } = await resendInvitation(invitation.id)
  if (!error) {
    success('Invitation resent successfully')
  } else {
    showError('Failed to resend invitation: ' + error)
  }
}

const handleCopyLink = async (invitation: Invitation) => {
  const baseUrl = window.location.origin
  const invitationLink = `${baseUrl}/accept-invitation/${invitation.token}`

  try {
    await navigator.clipboard.writeText(invitationLink)
    success('Invitation link copied to clipboard')
  } catch (err) {
    showError('Failed to copy link')
  }
}

const handleDelete = async (invitation: Invitation) => {
  if (!confirm(`Are you sure you want to delete the invitation for ${invitation.first_name} ${invitation.last_name}?`)) return

  const { error } = await deleteInvitation(invitation.id)
  if (!error) {
    invitations.value = invitations.value.filter(inv => inv.id !== invitation.id)
    success('Invitation deleted successfully')
  } else {
    showError('Failed to delete invitation: ' + error)
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  loadInvitations()
})
</script>
