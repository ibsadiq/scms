import { useApi } from '~~/composables/useApi'

export interface Accountant {
  id?: number
  username?: string
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone_number: string
  empId: string
  address?: string
  gender?: string
  national_id?: string
  tin_number?: string
  date_of_birth?: string
  salary?: number
  unpaid_salary?: number
  payments?: any[]
  send_invitation?: boolean
}

export const useAccountants = () => {
  const { apiCall } = useApi()

  const fetchAccountants = async () => {
    return await apiCall<Accountant[]>('/users/accountants/')
  }

  const fetchAccountant = async (id: number) => {
    return await apiCall<Accountant>(`/users/accountants/${id}/`)
  }

  const createAccountant = async (accountant: Accountant) => {
    return await apiCall<Accountant>('/users/accountants/', {
      method: 'POST',
      body: accountant
    })
  }

  const updateAccountant = async (id: number, accountant: Partial<Accountant>) => {
    return await apiCall<Accountant>(`/users/accountants/${id}/`, {
      method: 'PUT',
      body: accountant
    })
  }

  const deleteAccountant = async (id: number) => {
    return await apiCall(`/users/accountants/${id}/`, {
      method: 'DELETE'
    })
  }

  return {
    fetchAccountants,
    fetchAccountant,
    createAccountant,
    updateAccountant,
    deleteAccountant
  }
}
