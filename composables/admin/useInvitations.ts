import { useApi } from '~~/composables/useApi'

export interface Invitation {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'teacher' | 'parent' | 'accountant'
  token: string
  status: 'pending' | 'accepted' | 'expired'
  teacher_profile_id?: number | null
  parent_profile_id?: number | null
  accountant_profile_id?: number | null
  created_at: string
  expires_at: string
  accepted_at?: string | null
  invited_by?: number | null
  invited_by_name?: string | null
  days_until_expiry?: number
  is_expired?: boolean
}

export const useInvitations = () => {
  const { apiCall } = useApi()

  const fetchInvitations = async () => {
    return await apiCall<Invitation[]>('/users/invitations/')
  }

  const fetchInvitationByProfileId = async (role: string, profileId: number) => {
    const { data } = await apiCall<Invitation[]>(`/users/invitations/?role=${role}`)
    if (data) {
      const fieldName = `${role}_profile_id` as keyof Invitation
      return data.find(inv => inv[fieldName] === profileId && inv.status === 'pending')
    }
    return null
  }

  const resendInvitation = async (id: number) => {
    return await apiCall(`/users/invitations/${id}/resend/`, {
      method: 'POST'
    })
  }

  const deleteInvitation = async (id: number) => {
    return await apiCall(`/users/invitations/${id}/`, {
      method: 'DELETE'
    })
  }

  return {
    fetchInvitations,
    fetchInvitationByProfileId,
    resendInvitation,
    deleteInvitation
  }
}
